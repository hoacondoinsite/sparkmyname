'use strict';
// sandbox-tick — runs ONE sandbox pipeline step per invocation. Dependency-free
// (fetch only), so it runs on Netlify like your other functions. Claims atomically
// via sandbox_claim_next_job. Stages 1-3 are metadata; stage 4 generates the TEXTLESS
// background via your engines and stores it; 5-6 QC+package. The branding overlay is
// composited in the BROWSER on /lab (browser canvas), keeping this function light.
// Isolated: touches ONLY sandbox_ tables + sandbox/ storage paths.
const SB_URL = process.env.SUPABASE_URL, SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SANDBOX_BUCKET || 'brand-headers';
const H = (x) => Object.assign({ apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' }, x || {});
async function sel(t, q) { const r = await fetch(`${SB_URL}/rest/v1/${t}?${q}`, { headers: H() }); return r.ok ? r.json() : []; }
async function ins(t, row) { const r = await fetch(`${SB_URL}/rest/v1/${t}`, { method: 'POST', headers: H({ Prefer: 'return=representation' }), body: JSON.stringify(row) }); return r.ok ? (await r.json())[0] : null; }
async function upd(t, q, p) { const r = await fetch(`${SB_URL}/rest/v1/${t}?${q}`, { method: 'PATCH', headers: H(), body: JSON.stringify(p) }); return r.ok; }
async function rpc(fn, a) { const r = await fetch(`${SB_URL}/rest/v1/rpc/${fn}`, { method: 'POST', headers: H(), body: JSON.stringify(a) }); const j = r.ok ? await r.json().catch(() => []) : []; return Array.isArray(j) ? j : []; }

// GARMENT BRAIN (Production Spec Brain v1): placement law lives per garment TYPE, never per size.
// One master art file serves S-3XL; sizes are fulfillment variants. Women's cuts = placement variant, not a redesign.
const GARMENTS = {
  tshirt:     { garment:'t-shirt',      area:'full front', printW:12, printH:16, method:'DTG full color', sizes:'One master file serves S-3XL (sizes are fulfillment variants); womens cut uses same art, placement variant only' },
  tshirtback: { garment:'t-shirt',      area:'full back',  printW:12, printH:16, method:'DTG full color', sizes:'One master file serves S-3XL' },
  hoodieback: { garment:'hoodie',       area:'back panel', printW:12, printH:14, method:'DTG full color', sizes:'One master file serves S-3XL; keep art above pocket line' },
  hoodiefront:{ garment:'hoodie',       area:'left chest', printW:4,  printH:4,  method:'DTG or embroidery', sizes:'One master file serves S-3XL' },
  polochest:  { garment:'polo shirt',   area:'left chest', printW:3.5,printH:3.5,method:'embroidery: max 6 solid thread colors, no gradients, no fine hairlines', sizes:'One master file serves S-3XL' },
  dressshirt: { garment:'dress shirt',  area:'left chest', printW:3.5,printH:3.5,method:'embroidery: simplified mark only, max 4 thread colors', sizes:'One master file serves all neck sizes' },
  toteback:   { garment:'canvas tote',  area:'front face', printW:10, printH:10, method:'screen print or DTG', sizes:'single size' },
  hatfront:   { garment:'structured cap',area:'front crown',printW:4, printH:2.5,method:'embroidery: max 5 thread colors, bold shapes only', sizes:'adjustable, single art' }
};
const PRODUCTS = {
  bumpersticker: { item:'vinyl bumper sticker', note:'high-contrast, readable at 20 feet, weatherproof vinyl', finish:'gloss vinyl, rounded corners' },
  shelftalker:   { item:'folded shelf-edge hang tag', note:'folds at 3in from top: top flap grips the shelf edge, design lives on the hanging face; PRODUCT NAME is the hero', finish:'14pt card, scored fold' },
  countermat:    { item:'register counter mat', note:'rubber-backed counter mat; keep all text at least 1in inside edges; warm thank-you tone', finish:'rubber base, fabric top' }
};
const CURATED = { bumpersticker:{layout:'flat',bleedIn:0.125}, shelftalker:{layout:'flat',bleedIn:0.125}, countermat:{layout:'photo',bleedIn:0.125}, tshirt:{layout:'apparel',bleedIn:0}, tshirtback:{layout:'apparel',bleedIn:0}, hoodieback:{layout:'apparel',bleedIn:0}, hoodiefront:{layout:'apparel',bleedIn:0}, polochest:{layout:'apparel',bleedIn:0}, dressshirt:{layout:'apparel',bleedIn:0}, toteback:{layout:'apparel',bleedIn:0}, hatfront:{layout:'apparel',bleedIn:0}, poster:{layout:'photo',bleedIn:0.25}, banner:{layout:'flat',bleedIn:0.25}, flyer:{layout:'photo',bleedIn:0.125}, businesscard:{layout:'flat',bleedIn:0.125}, sign:{layout:'flat',bleedIn:0.5}, menu:{layout:'photo',bleedIn:0.125}, social:{layout:'photo',bleedIn:0}, story:{layout:'photo',bleedIn:0}, postcard:{layout:'photo',bleedIn:0.125}, postcardback:{layout:'flat',bleedIn:0.125}, webbanner:{layout:'photo',bleedIn:0}, yardsign:{layout:'photo',bleedIn:0.5}, flyer:{layout:'photo',bleedIn:0.125} };
const slug = (x) => String(x||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const dpiFor = (l) => l<=12?300:l<=30?200:l<=60?150:100;

exports.handler = async () => {
  if (!SB_URL || !SB_KEY) return { statusCode: 500, body: JSON.stringify({ error: 'ENV GUARD: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing in Netlify environment' }) };
  const out = [];
  // process up to 6 steps per tick so one order can walk the whole pipeline in one invocation
  for (let i = 0; i < 6; i++) {
    const [job] = await rpc('sandbox_claim_next_job', { p_worker_id: 'netlify_tick' });
    if (!job) break;
    try { const res = await step(job); out.push(res); if (res && res.stage === '4_render') break; }
    catch (e) {
      const rc = (job.retry_count||0)+1, dead = rc >= (job.max_retries||3);
      await upd('sandbox_pipeline_queue', `job_id=eq.${job.job_id}`, { worker_status: dead?'dead_letter':'failed', retry_count: rc, error_log: String(e.message||e).slice(0,300), locked_until: dead?null:new Date(Date.now()+Math.min(600000, 60000*Math.pow(2,(job.retry_count||0)) + Math.floor(Math.random()*30000))).toISOString() });
      if (dead) await upd('sandbox_orders', `order_id=eq.${job.order_id}`, { status:'failed' });
      out.push({ stage: job.stage, failed: String(e.message||e).slice(0,80) });
    }
  }
  return { statusCode: 200, body: JSON.stringify({ steps: out }) };
};

async function step(job) {
  const [order] = await sel('sandbox_orders', `order_id=eq.${job.order_id}&select=*`);
  if (!order) throw new Error('order gone');
  const p = job.payload || {};
  const done = async () => upd('sandbox_pipeline_queue', `job_id=eq.${job.job_id}`, { worker_status:'completed', updated_at:new Date().toISOString() });
  const next = async (stage, patch) => { await done(); await ins('sandbox_pipeline_queue', { order_id: job.order_id, stage, payload: Object.assign({}, p, patch||{}) }); };

  switch (job.stage) {
    case '1_intake':
      await upd('sandbox_orders', `order_id=eq.${order.order_id}`, { status:'researching' });
      await next('2_research'); return { stage:'1_intake', ok:true };
    case '2_research': {
      const wIn = p.widthIn||18, hIn = p.heightIn||36;
      const base = CURATED[slug(order.deliverable_type)] || { layout:'flat', bleedIn:0.25 };
      const [brand] = await sel('sandbox_brands', `brand_id=eq.${order.brand_id}&select=brand_name,industry,color_palette,contact_info,tone_manifesto,banned_visual_elements`);
      if (!brand || !brand.brand_name) throw new Error('brand unresolved: '+order.brand_id);
      // REAL agentic design research with FULL brand context (palette + tagline, not just the name)
      const bpal = (brand&&brand.color_palette)||{};
      const design = await designResearch({
        type: order.deliverable_type, industry: (brand&&brand.industry)||'',
        brandName: (brand&&brand.brand_name)||'', entity: order.entity_type||'business',
        palette: [bpal.primary,bpal.accent,bpal.secondary].filter(Boolean).join(', '),
        tagline: (brand&&brand.contact_info&&brand.contact_info.tagline)||'',
        tone: (brand&&brand.tone_manifesto)||'',
        wIn, hIn, prompt: order.raw_client_prompt, brief: p.brief||{}
      });
      const spec = Object.assign({}, base, { wIn, hIn, dpi: dpiFor(Math.max(wIn,hIn)) });
      if (design && design.layout) spec.layout = design.layout;
      await next('3_contract', { spec, design: design || null });
      return { stage:'2_research', ok:true, researched: !!design };
    }
    case '3_contract': {
      const s = p.spec;
      await ins('sandbox_design_contracts', { order_id: order.order_id,
        physical_specs: { width:s.wIn, height:s.hIn, units:'inches', dpi:s.dpi, bleed:s.bleedIn, surface_geometry:'flat' },
        layout_architecture: Object.assign({ system:'flow-stack', compositor:'browser-canvas' }, (p.design ? { source:p.design.source, mood:p.design.mood, psychology:p.design.psychology, layout_direction:p.design.layout_direction, callout_style:p.design.callout_style_raw||p.design.callout_style } : {})),
        element_mapping: { engine:'lab.overlay.v1' } });
      await upd('sandbox_orders', `order_id=eq.${order.order_id}`, { status:'rendering' });
      await next('4_render'); return { stage:'3_contract', ok:true };
    }
    case '4_render': {
      const s = p.spec;
      const [brand] = await sel('sandbox_brands', `brand_id=eq.${order.brand_id}&select=*`);
      const pal = (brand && brand.color_palette) || {};
      const colors = [pal.primary, pal.accent, pal.secondary].filter(Boolean).join(', ');
      const ban = 'ABSOLUTELY NO text, words, letters, numbers, logos, watermarks, signage, grommets, ropes, walls, rooms or 3D mockups. STRICTLY NO flying ingredients, NO floating or levitating items, NO dust particles, NO explosions, NO splashes. Everything rests naturally on the surface, gravity-correct. Pure edge-to-edge background art only.';
      // explicitly declare the offer items so the model paints the FULL spread
      const spreadItems = String((p.brief&&(p.brief.details||p.brief.offer))||'').split(/[,\u2022;]+/).map(x=>x.trim()).filter(Boolean).slice(0,5);
      const [b2] = await sel('sandbox_brands', `brand_id=eq.${order.brand_id}&select=industry,banned_visual_elements`);
      const niche = (b2&&b2.industry) ? `Subject niche: ${b2.industry}. ` : '';
      const brandBans = (b2&&Array.isArray(b2.banned_visual_elements)&&b2.banned_visual_elements.length) ? ` BRAND-BANNED visuals, never include: ${b2.banned_visual_elements.join(', ')}.` : '';
      let ont = domainOntology(b2&&b2.industry);
      if (ont.generic) {  // unmapped category: learned Category DNA
        const ik = slug(b2&&b2.industry||'general') || 'general';
        const [cached] = await sel('sandbox_specs', `item=eq.dna-${ik}&select=recipe`);
        if (cached && cached.recipe && cached.recipe.scene) ont = cached.recipe;
        else if (p.design && p.design.scene_style) {
          ont = { scene: p.design.scene_style, physics: p.design.lighting || ont.physics, surface: ont.surface };
          await ins('sandbox_specs', { item: 'dna-'+ik, recipe: ont, verified: false });  // cache the derived DNA
        }
      }
      const spread = spreadItems.length ? `The scene displays together, ${ont.surface}: ${spreadItems.join(', ')}. ` : '';
      let artDir = (p.design && p.design.background_direction ? p.design.background_direction + ' ' : '') + niche;
      if (p.heal) {  // self-healing round: emphasize what the inspector found missing/broken
        if (p.heal.addItems && p.heal.addItems.length) artDir += `CRITICAL - these items MUST be clearly visible in the scene: ${p.heal.addItems.join(', ')}. `;
        if (p.heal.fixPhysics && p.heal.fixPhysics.length) artDir += `CRITICAL physics corrections: ${p.heal.fixPhysics.join('; ')}. `;
        if (p.heal.critique && p.heal.critique.length) artDir += `Design corrections from audit: ${p.heal.critique.join('; ')}. `;
      }
      const garm = GARMENTS[order.deliverable_type] || null;
      const emb = garm && /embroidery/.test(garm.method);
      const prompt = s.layout === 'apparel'
        ? `Apparel print artwork: a bold, centered EMBLEM composition designed to sit on fabric — ${garm?('for the '+garm.area+' of a '+garm.garment):'garment print area'}. ${artDir}Strong iconic central mark, confident silhouette. FRAMING LAW: the ENTIRE emblem must sit fully inside the frame with at least 15% empty margin on every side — never cropped by any edge, never touching the border, never bleeding off the canvas; the complete circle/shape is visible. ${emb?'EMBROIDERY CONSTRAINTS: maximum 6 flat solid colors, bold simple shapes, no gradients, no photographic detail, no fine hairlines. ':''}${colors?'Palette: '+colors+'.':''} ${ban}${brandBans}`
        : s.layout === 'flat'
        ? `FLAT 2D graphic-design background field, edge-to-edge. ${artDir}Tasteful brand-color field or subtle abstract texture, generous negative space. ${colors?'Palette: '+colors+'.':''} ${ban}${brandBans}`
        : `${ont.scene}, ${ont.physics}. ${spread}${artDir}One strong focal point in the middle of the frame; the top and bottom fifths transition into a soft, luminous out-of-focus falloff in the scene's own tones — never heavy black vignettes — leaving elegant negative space reserved for typography overlay. Strictly no split screens, no dividing lines, no framed cards or panels — one single contiguous sweeping scene. PURE PHOTOGRAPHIC REALISM ONLY: no illustrations, no line-art, no cartoon or sticker elements, no clip-art overlays, no drawn doodles of any kind — everything in frame is a real photographed object. ${colors?'Palette to harmonize: '+colors+'.':''} ${ban}${brandBans}`;
      const _t0 = Date.now();
      const b64 = await generateBackground(prompt, s);
      const renderMs = Date.now() - _t0;
      const path = `sandbox/${order.order_id}_bg.png`;
      const up = await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${path}`, { method:'POST', headers:{ apikey:SB_KEY, Authorization:'Bearer '+SB_KEY, 'Content-Type':'image/png', 'x-upsert':'true' }, body: Buffer.from(b64,'base64') });
      if (up.status >= 300) throw new Error('upload '+up.status);
      const url = `${SB_URL}/storage/v1/object/public/${BUCKET}/${path}`;
      const dv = await ins('sandbox_deliverables', { order_id: order.order_id, file_format:'png', storage_path:url, metadata:{ kind:(s.layout==='apparel'?'apparel_master_art':'textless_background'), placement:(GARMENTS[order.deliverable_type]||null), product_spec:(PRODUCTS[order.deliverable_type]||null), spec:s, brief:(p.brief||{}), design:(p.design||null), render_ms: renderMs, applied_art_direction: artDir.trim()||null, brand:{ name: brand&&brand.brand_name, palette: pal, tagline: brand&&brand.contact_info&&brand.contact_info.tagline, website: brand&&brand.contact_info&&brand.contact_info.website, handle: brand&&brand.contact_info&&brand.contact_info.handle, logo: brand&&brand.logos&&(brand.logos.primary||'') } } });
      await next('5_qc', { deliverableId: dv && dv.deliverable_id, bgUrl: url, brandRules: { banned: (b2&&b2.banned_visual_elements)||[] } }); return { stage:'4_render', ok:true, url };
    }
    case '5_qc': {
      const attempts = p.qc_attempts || 0;
      const required = String((p.brief&&(p.brief.details||p.brief.offer))||'').split(/[,\u2022;]+/).map(x=>x.trim()).filter(Boolean).slice(0,5);
      let verdict = null;
      if (required.length && p.bgUrl) verdict = await vlmInspect(p.bgUrl, required, p.brandRules);
      const minScore = verdict && verdict.scorecard ? Math.min(verdict.scorecard.brand_fidelity, verdict.scorecard.physics_integrity, verdict.scorecard.composition) : 10;
      if (verdict && (verdict.status === 'FAIL' || minScore < 8) && attempts < (parseInt(process.env.SANDBOX_HEAL_ROUNDS)||3)) {
        // SELF-HEAL: requeue a fresh render with explicit corrections (bounded to 2 heal rounds)
        await ins('sandbox_audit_logs', { actor_id:'netlify_tick', action:'QC_FAILED_HEALING', target_table:'sandbox_deliverables', record_id:p.deliverableId||null, metadata:{ attempt:attempts+1, missing:verdict.missing_items, physics:verdict.physics_violations, min_score:minScore, critique:verdict.critique } });
        await next('4_render', { qc_attempts: attempts+1, heal: { addItems: verdict.missing_items||[], fixPhysics: verdict.physics_violations||[], critique: verdict.critique||[] } });
        return { stage:'5_qc', healing:true, attempt:attempts+1 };
      }
      const action = verdict ? (verdict.status==='PASS' ? 'QC_PASSED_VLM' : 'QC_WAIVED_AFTER_HEALING') : 'QC_PASSED';
      if (verdict && verdict.scorecard && p.deliverableId) {   // council scorecard onto the deliverable record
        const [dvRow] = await sel('sandbox_deliverables', `deliverable_id=eq.${p.deliverableId}&select=metadata`);
        if (dvRow) await upd('sandbox_deliverables', `deliverable_id=eq.${p.deliverableId}`, { metadata: Object.assign({}, dvRow.metadata||{}, { agent_scorecard: verdict.scorecard, council_critique: verdict.critique||[] }) });
      }
      await ins('sandbox_audit_logs', { actor_id:'netlify_tick', action, target_table:'sandbox_deliverables', record_id:p.deliverableId||null, metadata:{ checks:['textless_bg','vlm_inventory'], verdict: verdict||'inspector_unavailable', inspector_model: verdict?(vlmInspect.modelUsed||null):null, inspector_error: verdict?null:(vlmInspect.lastError||'not called: no required items') } });
      await next('6_package'); return { stage:'5_qc', ok:true, vlm: action };
    }
    case '6_package':
      await upd('sandbox_orders', `order_id=eq.${order.order_id}`, { status:'ready_for_client' });
      await done();
      return { stage:'6_package', ok:true, done:order.order_id };
    default: throw new Error('unknown stage '+job.stage);
  }
}

function scrub(x){ return String(x).replace(/\b(text|words?|letters?|logos?|signs?|signage)\b/gi,'scene'); }
async function designResearch(ctx) {
  // Curated fallback brief: even when the live call fails, the renderer gets real direction.
  // VERTICAL-AWARE: never leak retail strings onto professional brands (and vice versa).
  const ind=(ctx&&ctx.industry||'').toLowerCase();
  const foodish=['pizza','restaurant','cafe','bakery','food','bar','grill','deli','catering'].some(k=>ind.includes(k));
  const proish=['law','legal','attorney','account','consult','medical','clinic','funeral'].some(k=>ind.includes(k));
  const FALLBACK = {
    source: 'fallback',
    psychology: { hook: 'Immediate clarity and trust through strong visual hierarchy', audience_driver: 'value plus ease' },
    mood: 'clean confident commercial',
    background_direction: 'Clean professional studio lighting, macro texture detail relevant to the offer, minimal distraction, commercial composition, high fidelity',
    layout_direction: 'balanced_focal_point',
    callout_style: 'badge', callout_style_raw: 'high_impact_badge',
    composition: 'unified', badge_position: 'middle',
    eyebrow: foodish ? "Today's Special" : (proish ? 'Complimentary' : 'Featured'),
    price_note: foodish ? 'plus tax' : ''
  };
  const key = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!key) return FALLBACK;
  try {
    const sys = 'You are an elite art director, brand strategist and conversion psychologist. Return ONLY compact JSON, no markdown: {"psychology_hook":"<=15 words cognitive/emotional trigger for this audience","audience_driver":"<=8 words","mood":"<=6 words","layout_direction":"balanced_focal_point|dynamic_diagonal|minimalist_asymmetric|immersive_bleed","art_direction":"<=30 words concrete visual tokens for a TEXTLESS background: texture, lighting, color harmony, style specific to this entity and offer. Never generic scenery unless relevant.","callout_style":"bold_accent|subtle_elegant|high_impact_badge","composition":"unified|panel (STRONGLY prefer unified immersive full-bleed; choose panel ONLY for data-dense briefs that truly need a boxed section)","badge_position":"upper|middle|lower","scene_style":"<=14 words: the photographic WORLD for this industry (e.g. cinematic dusk architecture of a luxury resort)","lighting":"<=8 words lighting profile","eyebrow":"<=4 words matching THIS industry (never food terms for non-food brands)","price_note":"<=3 words under the price, e.g. plus tax for retail food, blank for professional or free offers"}';
    const usr = `Brand: ${ctx.brandName} (${ctx.industry||'general'}). Entity: ${ctx.entity}. Brand palette: ${ctx.palette||'unspecified'}. Brand tagline: ${ctx.tagline||'none'}. Brand tone manifesto: ${ctx.tone||'none'}. Deliverable: ${ctx.type} (${ctx.wIn}x${ctx.hIn} in). Request: ${ctx.prompt}. Offer: ${JSON.stringify(ctx.brief)}. Tailor the art direction to THIS brand's exact aesthetic and niche.`;
    // SPARK CLIENT STANDARD (Founder directive July 31 2026): top-tier intelligence first, reliability chain behind it
    let r = null;
    for (const model of [process.env.SANDBOX_RESEARCH_MODEL || 'gpt-4o', 'gpt-4o-mini']) {
      r = await fetch('https://api.openai.com/v1/chat/completions', { method:'POST', headers:{ Authorization:'Bearer '+key, 'Content-Type':'application/json' },
        body: JSON.stringify({ model, temperature:0.4, response_format:{type:'json_object'}, messages:[{role:'system',content:sys},{role:'user',content:usr}] }) });
      if (r.ok) break;
    }
    if (!r || !r.ok) return FALLBACK;
    const j = await r.json();
    const d = JSON.parse(j.choices[0].message.content);
    // hard schema validation; anything unusable -> curated fallback (zero-crash guarantee)
    if (!(typeof d.psychology_hook==='string' && d.psychology_hook.length>5 && typeof d.art_direction==='string' && d.art_direction.length>10)) return FALLBACK;
    const LAYOUTS = ['balanced_focal_point','dynamic_diagonal','minimalist_asymmetric','immersive_bleed'];
    const rawCallout = ['bold_accent','subtle_elegant','high_impact_badge'].includes(d.callout_style) ? d.callout_style : 'high_impact_badge';
    return {
      source: 'dynamic',
      psychology: { hook: d.psychology_hook.slice(0,140), audience_driver: String(d.audience_driver||'').slice(0,100) },
      mood: String(d.mood||'').slice(0,80),
      background_direction: d.art_direction.slice(0,320).replace(/\b(text|word|letter|logo|sign)\b/gi,'scene'),
      layout_direction: LAYOUTS.includes(d.layout_direction) ? d.layout_direction : 'balanced_focal_point',
      // stored raw for the contract; mapped honestly to what the renderer actually has (badge|plain)
      callout_style_raw: rawCallout,
      callout_style: rawCallout === 'high_impact_badge' ? 'badge' : 'plain',
      composition: (d.composition === 'panel') ? 'panel' : 'unified',
      badge_position: ['upper','middle','lower'].includes(d.badge_position) ? d.badge_position : 'middle',
      price_note: (typeof d.price_note==='string' && !/^(empty|none|n\/a|null|blank)$/i.test(d.price_note.trim())) ? d.price_note.trim().split(/\s+/).slice(0,3).join(' ') : '',
      scene_style: (typeof d.scene_style==='string') ? scrub(d.scene_style).split(/\s+/).slice(0,14).join(' ') : '',
      lighting: (typeof d.lighting==='string') ? scrub(d.lighting).split(/\s+/).slice(0,8).join(' ') : '',
      eyebrow: (typeof d.eyebrow==='string' && d.eyebrow.trim()) ? d.eyebrow.slice(0,40) : undefined
    };
  } catch (_) { return FALLBACK; }
}

function domainOntology(industry){
  const i=(industry||'').toLowerCase();
  const map=[
    [['pizza','restaurant','cafe','bakery','food','bar','grill','deli','catering'],{scene:'Professional commercial tabletop hero photography, magazine advertisement style',physics:'natural studio lighting, soft shadows, warm appetizing color grading',surface:'resting naturally on the table'}],
    [['law','legal','attorney'],{scene:'Cinematic architectural photography of a high-end modern executive office, rich dark walnut textures, floor-to-ceiling glass',physics:'cool ambient morning light, balanced symmetry, calm sophisticated depth',surface:'composed within the scene'}],
    [['funeral','memorial'],{scene:'Serene respectful still photography with soft natural elements',physics:'muted gentle lighting, zero dynamic clutter, quiet stillness',surface:'placed with quiet dignity'}],
    [['defense','aerospace','drone','military'],{scene:'Austere engineering-grade product photography',physics:'clean studio light, sharp precise angles, technical clarity',surface:'positioned with precision'}],
    [['festival','park','civic','community','parade'],{scene:'Expansive celebratory outdoor photography',physics:'vibrant clarity, golden daylight, open composition',surface:'set naturally in the open scene'}],
    [['film','movie','entertainment','sci'],{scene:'Cinematic key art photography, atmospheric high-stakes mood',physics:'dramatic key lighting, deep contrast, layered depth',surface:'staged within the scene'}],
    [['fitness','gym','sport'],{scene:'Dynamic athletic brand photography',physics:'crisp directional lighting, energetic but grounded composition',surface:'grounded in the scene'}],
    [['salon','spa','beauty'],{scene:'Elegant beauty editorial photography',physics:'soft diffused lighting, clean minimal styling',surface:'arranged elegantly in the scene'}]
  ];
  for(const [keys,o] of map) if(keys.some(k=>i.includes(k))) return o;
  return {scene:'Clean professional commercial brand photography',physics:'balanced studio lighting, polished composition',surface:'placed naturally in the scene',generic:true};
}

async function vlmInspect(imageUrl, requiredItems, brandRules) {
  try {
    const gk = process.env.GEMINI_API_KEY; if (!gk) return null;
    const imgRes = await fetch(imageUrl); if (!imgRes.ok) return null;
    const b64 = Buffer.from(await imgRes.arrayBuffer()).toString('base64');
    const bans = (brandRules && Array.isArray(brandRules.banned) && brandRules.banned.length) ? ` Brand-banned elements that must NOT appear: ${brandRules.banned.join(', ')}.` : '';
    const ask = `You are a design audit council acting as three inspectors in one: Brand Guardian, Physics Enforcer, Composition Judge. Inspect this image. Required items that MUST be visible: ${requiredItems.join(', ')}.${bans} Physics: nothing may float, levitate, or explode; everything rests naturally. FRAMING: if any primary subject or emblem is cropped or cut off by the frame edge, report it in physics_violations as 'emblem cropped by frame'. Output ONLY compact JSON: {"status":"PASS|FAIL","missing_items":["..."],"physics_violations":["..."],"banned_present":["..."],"scorecard":{"brand_fidelity":1-10,"physics_integrity":1-10,"composition":1-10},"critique":["..."]}`;
    let r = null, lastErr = '';
    for (const vm of [process.env.SANDBOX_VLM_MODEL, 'gemini-3.1-flash', 'gemini-3-pro-preview', 'gemini-3-flash-preview', 'gemini-2.5-pro'].filter(Boolean)) {
      try {
        r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${vm}:generateContent?key=${gk}`, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ contents:[{ parts:[{ inlineData:{ mimeType:'image/png', data:b64 } }, { text: ask }] }], generationConfig:{ responseMimeType:'application/json' } })
        });
        if (r.ok) break;
        lastErr = vm+':HTTP'+r.status+':'+String(await r.text().catch(()=>'')).slice(0,140);
      } catch(e) { lastErr = vm+':THROW:'+String(e.message||e).slice(0,120); r = null; }
    }
    if (!r || !r.ok) { vlmInspect.lastError = lastErr || 'no response'; return null; }
    vlmInspect.modelUsed = String(r.url||'').match(/models\/([^:]+):/) ? String(r.url).match(/models\/([^:]+):/)[1] : 'unknown';
    const j = await r.json();
    const txt = ((((j.candidates||[])[0]||{}).content||{}).parts||[]).map(x=>x.text||'').join('');
    let d; try { d = JSON.parse(txt.replace(/```json|```/g,'').trim()); }
    catch(e) { vlmInspect.lastError = 'PARSE:'+txt.slice(0,140); return null; }
    if (d.status !== 'PASS' && d.status !== 'FAIL') return null;
    const clamp = v => Math.max(1, Math.min(10, parseInt(v)||5));
    const sc = d.scorecard||{};
    const bannedPresent = Array.isArray(d.banned_present)?d.banned_present.slice(0,5):[];
    return { status: (bannedPresent.length ? 'FAIL' : d.status),
      missing_items: Array.isArray(d.missing_items)?d.missing_items.slice(0,5):[],
      physics_violations: (Array.isArray(d.physics_violations)?d.physics_violations.slice(0,5):[]).concat(bannedPresent.map(x=>'banned element present: '+x)),
      banned_present: bannedPresent,
      scorecard: { brand_fidelity: clamp(sc.brand_fidelity), physics_integrity: clamp(sc.physics_integrity), composition: clamp(sc.composition) },
      critique: Array.isArray(d.critique)?d.critique.slice(0,4):[] };
  } catch (_) { return null; }   // inspector trouble NEVER blocks delivery (fail-open)
}

async function generateBackground(prompt, spec) {
  const ar = spec.wIn/spec.hIn, aspect = ar<=0.6?'9:16':ar<0.9?'3:4':ar>1.6?'16:9':ar>1.1?'4:3':'1:1';
  const size = '2K'; // proofs stay fast; true-DPI print masters belong to the Node worker stage
  const gk = process.env.GEMINI_API_KEY;
  for (const model of gk?['gemini-3-pro-image-preview','gemini-3.1-flash-image','gemini-2.5-flash-image']:[]) {
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${gk}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ contents:[{parts:[{text:prompt}]}], generationConfig:{ responseModalities:['IMAGE'], imageConfig:{ aspectRatio:aspect, imageSize:size } } }) });
      const j = await r.json();
      const parts = (((j.candidates||[])[0]||{}).content||{}).parts||[];
      const im = parts.find(x => (x.inlineData&&x.inlineData.data)||(x.inline_data&&x.inline_data.data));
      const data = im && (im.inlineData||im.inline_data).data;
      if (data) return data;
    } catch (_) {}
  }
  const ok = process.env.OPENAI_IMAGE_KEY || process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (ok) {
    const r = await fetch('https://api.openai.com/v1/images/generations', { method:'POST', headers:{ Authorization:'Bearer '+ok, 'Content-Type':'application/json' }, body: JSON.stringify({ model: process.env.OPENAI_IMAGE_MODEL||'gpt-image-1', prompt, n:1, size: ar>1?'1536x1024':'1024x1536', quality:'high' }) });
    const j = await r.json(); const it = j&&j.data&&j.data[0];
    if (it && it.b64_json) return it.b64_json;
    if (it && it.url) return Buffer.from(await (await fetch(it.url)).arrayBuffer()).toString('base64');
  }
  throw new Error('background generation failed (all engines)');
}
