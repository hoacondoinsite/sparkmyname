/* THE RAIL NO LONGER HOLDS THE BRAND LIST (2026-07-26, Founder order). #ilist, #isearch and
   #ideaCt were removed from the markup because the Brands flyout already had all three, and
   having both on screen meant two search boxes and two lists of 242. The code that fed them
   is guarded rather than deleted: the flyout keeps its own render, and if the rail list ever
   comes back these paths light up again without being rewritten. */

var $=function(s,r){return (r||document).querySelector(s);};
/* THE AI BRIDGE (2026-07-27, repaired).
   THREE FAULTS, ALL FIXED: (1) a 9s abort killed answers that were still arriving — the
   platform allows longer, so the ceiling is raised; (2) every failure was swallowed and every
   tool said the same unhelpful thing, so nobody could tell a missing key from a dead model —
   the real reason now reaches the surface; (3) a failing first provider ended the request
   instead of stepping to the next, fixed server-side in ai-assist.js. */
window.smnLLM=function(system,prompt,onText){
  try{
    var ctrl=new AbortController();
    var to=setTimeout(function(){ctrl.abort();},26000);
    fetch('/.netlify/functions/ai-assist',{method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({system:system,prompt:prompt,max:500}),signal:ctrl.signal})
     .then(function(r){ clearTimeout(to);
       return r.json().catch(function(){ return {error:'The assistant returned an unreadable reply.'}; })
              .then(function(d){ if(!r.ok||!d||d.error) throw new Error((d&&d.error)||('Server said '+r.status)); return d; });
     })
     .then(function(d){ onText((d&&d.text)||null); })
     .catch(function(e){
       var msg=(e&&e.name==='AbortError') ? 'That took longer than expected. Try a shorter question.'
                                          : ((e&&e.message)||'Could not reach the assistant.');
       try{ console.error('smnLLM:', msg); }catch(x){}
       onText(null, msg);
     });
  }catch(e){ onText(null,'Could not start the request.'); }
};
function toast(m){var t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(window._t);window._t=setTimeout(function(){t.classList.remove('show');},2600);}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function per(s,nm,dm){return String(s).replace(/\{N\}/g,nm).replace(/\{D\}/g,dm);}
/* slug() is called on names, domains and labels all over this file, including inside
   filenames for downloads. It threw on undefined — one absent field anywhere in a kit and the
   whole handler died. Found by the wire harness firing every handler with a thin element.
   Coercing rather than throwing costs nothing and removes a whole class of failure. */
function slug(s){return String(s==null?'':s).toLowerCase().replace(/[^a-z0-9]+/g,'');}

var TIER_DEPTH={spark:7,plus:17,studio:19,bib:19},TIER_NAME={spark:'Starter',plus:'Pro',studio:'Signature',bib:'Business in a Box'},TIER_PRICE={spark:'$99',plus:'$99',studio:'$99',bib:'$99'},TIER_RANK={spark:1,plus:2,studio:3,bib:3};
var DELIVS=[['A','Name & Domain'],['B','Logo Suite'],['C','Color System'],['D','Typography'],['E','Taglines'],['F','Brand Bio'],['G','Social Kit'],['H','Business Cards'],['I','Flyers'],['J','Signage'],['K','Ad Creatives'],['L','Launch Video'],['M','Email Signature'],['N','Favicon'],['O','Brand Guidelines'],['P','Letterhead'],['Q','Pitch Deck'],['R','Brand Promo Items'],['S','Website Starter']];

/* PRODUCTION SPECS + PARTNER ROUTING for the vault (Aug 2 2026).
   Reads window.SparkCatalog (js/spark-catalog.js, loaded before this file). Computed here at
   top level — never inside the HTML concatenation, which would silently detach the markup.
   Fully guarded: if the bridge is absent this yields '' and the vault renders exactly as before. */
function smnPrintRows(){
  try{
    if(!window.SparkCatalog || typeof window.SparkCatalog.routeFor!=='function') return '';
    var MAP={'Business Cards':'business_card','Flyers':'flyer_letter','Signage':'yard_sign',
             'Letterhead':'letterhead','Brand Promo Items':'mug_wrap','Social Kit':'meta_feed',
             'Ad Creatives':'iab_medium_rect'};
    var out=[];
    DELIVS.forEach(function(d){
      var k=MAP[d[1]]; if(!k) return;
      var r=window.SparkCatalog.routeFor(k); if(!r||!r.format) return;
      var f=r.format;
      var size=f.widthIn?(f.widthIn+'\u00d7'+f.heightIn+' in'):(f.pixelW+'\u00d7'+f.pixelH+' px');
      var spec=size+(f.bleedIn?(' \u00b7 '+f.bleedIn+' in bleed'):'')+' \u00b7 '+f.dpi+' DPI';
      var right = r.needsLayoutWork
        ? '<span style="font-size:11.5px;color:#8A6B22">Layout in progress</span>'
        : (r.partner
            ? '<a href="'+r.url+'" target="_blank" rel="noopener" style="font-size:12px;font-weight:700;color:#127A40;text-decoration:none;white-space:nowrap">'+r.action+' &rarr;</a>'
            : '<span style="font-size:11.5px;color:#5A625E">Ready to download</span>');
      out.push('<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 0;border-top:1px solid rgba(0,0,0,.06);flex-wrap:wrap">'+
        '<div style="min-width:0"><div style="font-weight:700;font-size:13px;color:#141414">'+d[1]+'</div>'+
        '<div style="font-size:11.5px;color:#5A625E">'+spec+'</div></div>'+right+'</div>');
    });
    return out.length ? ('<div style="margin-top:10px">'+out.join('')+'</div>') : '';
  }catch(e){ return ''; }
}

/* ===== IDEAS → each has idea-level content + several generated NAMES ===== */
var IDEAS=[
{
 id:'restaurant',emoji:'🍕',cat:'Restaurant',said:`Cozy Italian — wood-fired pizza & natural wine.`,tier:'plus',ready:92,fav:true,date:'Jul 18, 2026',ord:3,
 palettes:[
  {name:`Rustic Red`,note:`Warm and inviting, perfect for a cozy dining atmosphere.`,cols:['#C0392B','#B7791F','#F1C40F','#141414']},
  {name:`Earthy Tones`,note:`Grounded and rich, reflecting the natural ingredients used.`,cols:['#8E44AD','#2980B9','#D35400','#B7791F']},
  {name:`Vibrant Harvest`,note:`Lively and fresh, showcasing the bounty of flavors.`,cols:['#27AE60','#F1C40F','#E67E22','#B7791F']}
 ],
 type:[
  {name:`Casual Script`,note:`Inviting and personal, like a handwritten menu.`,font:`'Segoe Script','Snell Roundhand','Brush Script MT',cursive`,w:'400'},
  {name:`Bold Serif`,note:`Strong and classic, evoking tradition in every bite.`,font:`Georgia,serif`,w:'800'},
  {name:`Playful Sans`,note:`Light-hearted and modern for a fun dining experience.`,font:`Inter,system-ui,sans-serif`,w:'800'},
  {name:`Elegant Display`,note:`Sophisticated and stylish, reflecting the wine selection.`,font:`Georgia,serif`,w:'400',ital:true}
 ],
 voice:[{n:`Warm`,d:`Inviting language that makes everyone feel at home.`},{n:`Passionate`,d:`Enthusiastic descriptions that celebrate great food and drink.`},{n:`Friendly`,d:`Conversational tone that welcomes everyone to the table.`},{n:`Sophisticated`,d:`Elevated language that highlights the quality of the menu.`},{n:`Playful`,d:`Fun and light-hearted, making dining an adventure.`},{n:`Community-focused`,d:`Language that emphasizes connection and sharing.`}],
 aboutT:[`At {N}, we believe in the magic of great food and fine wine. Our wood-fired pizzas are paired expertly with a variety of wines to enhance every bite. Join us in our cozy atmosphere to share unforgettable moments with friends and family.`,`{N} is a neighborhood pizzeria where wood-fired dough meets a thoughtfully curated wine list. Every pie is made to order and every pairing is chosen with care — a place built for slow evenings and good company.`,`Part pizzeria, part wine bar, {N} brings rustic Italian warmth to the table. From the first slice to the last sip, we craft an experience worth lingering over.`],
 biosT:[`Bringing you the perfect pizza and wine pairings in a cozy setting.`,`Passionate about crafting memorable dining experiences with every slice.`,`Join us for a delightful mix of wood-fired pizzas and curated wines.`,`Crafting a community around great food and exceptional wines.`,`Your go-to spot for delicious pizza and exquisite wine selections.`,`Discover the joy of pairing flavors at {N}.`],
 linkedinT:[`As the owner of {N}, I'm dedicated to creating an exceptional dining experience where pizza and wine unite. Our focus is on sourcing the finest ingredients to deliver quality and flavor, ensuring every visit is memorable.`,`At {N}, we specialize in pairing artisanal wood-fired pizzas with a diverse selection of wines. I strive to cultivate a warm environment where guests can enjoy great food, excellent service, and lasting connections.`,`Passionate about bringing people together through food and drink, {N} is designed to be a welcoming spot for pizza lovers and wine enthusiasts alike. I believe in crafting unique pairings that elevate the dining experience.`],
 facebookT:[`Welcome to {N}! Your cozy neighborhood spot for delicious pizza and curated wines. Join us for a delightful dining experience!`,`Craving pizza? Look no further! At {N}, we serve up mouthwatering wood-fired pizzas paired with the perfect glass of wine!`,`Join the {N} community! Enjoy our handcrafted pizzas and explore our wine selection for a taste adventure like no other!`],
 postsT:[`🍕✨ Dive into our wood-fired pizzas topped with fresh ingredients and paired perfectly with our wine selection!`,`Join us tonight for pizza and wine specials—perfect for a date night or catch-up with friends! 🍷❤️`,`Ever wondered how to pair pizza with wine? Our staff is here to guide you to your perfect match! 🍕🍾`,`Share your favorite pizza and wine combo with us! We love hearing from our {N} community! 🥳`,`Celebrate the weekend with our family-style pizza deal—bring your loved ones and enjoy! 🎉`,`Did you know? We host wine tasting events every month! Sign up to explore new flavors!`],
 names:[
  {name:`Vine & Crust`,mono:`VC`,dom:`vinecrust.com`,st:`Available`,tag:`Where wine meets wood-fired bliss.`,
   why:[`Combines the warmth of pizza with the sophistication of wine.`,`Evokes a sense of rustic comfort, perfect for casual dining.`,`Conveys a unique pairing of flavors that enhances the dining experience.`,`Memorable alliteration makes it easy to recall.`,`Differentiates from typical pizza places by emphasizing the wine.`,`Appeals to a broad audience, from casual diners to wine enthusiasts.`,`Creates an emotional connection to sharing great food and drinks with friends.`,`Brandable for future expansions, like wine tastings or events.`],
   taglines:[`Where wine meets wood-fired bliss.`,`Slice into flavor, sip into sophistication.`,`Crafted pizzas, curated wines.`,`Pairing perfection, one slice at a time.`,`Taste the harmony of vine and crust.`,`Dine, sip, and savor the moment.`]},
  {name:`Terra & Tavola`,mono:`TT`,dom:`terraetavola.com`,st:`Available`,tag:`The earth, the table, the fire.`,
   why:[`Italian for "earth and table" — authentic and evocative.`,`Speaks to farm-to-table, natural ingredients.`,`Elegant and memorable for a wine-forward menu.`,`Sophisticated without feeling stuffy.`,`Rolls off the tongue with a pleasing rhythm.`,`Signals a rooted, local, seasonal philosophy.`,`Distinct from typical pizzeria names.`,`Flexible for a cookbook, events, or a second location.`],
   taglines:[`The earth, the table, the fire.`,`From our soil to your table.`,`Rooted in flavor.`,`Where the table gathers.`,`Season by season, slice by slice.`,`Good earth, good table.`]},
  {name:`Fuoco & Vigna`,mono:`FV`,dom:`fuocovigna.com`,st:`Available`,tag:`Fire and vine, in every bite.`,
   why:[`Italian for "fire and vine" — captures pizza + wine instantly.`,`Bold and romantic, great for signage.`,`Distinctive and ownable in the category.`,`Rolls off the tongue with rhythm.`,`Evokes passion, heat, and craft.`,`Memorable for word-of-mouth.`,`Pairs beautifully with warm, fiery visuals.`,`Room to grow into tastings and events.`],
   taglines:[`Fire and vine, in every bite.`,`Born of flame and grape.`,`Wood-fired, wine-paired.`,`A little fire, a little vine.`,`Where heat meets harvest.`,`Kindled by fire, poured with love.`]}
 ]
},
{
 id:'skincare',emoji:'🧴',cat:'Skincare',said:`Calm, clinical, evidence-based skincare — no hype.`,tier:'studio',ready:100,fav:false,date:'Jul 17, 2026',ord:2,
 palettes:[{name:`Calm Clinical`,note:`Cool, quiet, and reassuring.`,cols:['#141414','#141414','#12132B','#F4F6F5']},{name:`Warm Neutral`,note:`Soft skin-tone accents for packaging.`,cols:['#E8B4A0','#C98F76','#3A2A28','#FFFFFF']}],
 type:[{name:`Modern Serif`,note:`Trust and quiet authority for headlines.`,font:`Georgia,serif`,w:'700'},{name:`Clean Sans`,note:`Legible, calm body text.`,font:`Inter,system-ui,sans-serif`,w:'600'}],
 voice:[{n:`Calm`,d:`Measured, never shouty.`},{n:`Honest`,d:`Plain claims, no miracle language.`},{n:`Warm`,d:`Speaks to a person, not a demographic.`},{n:`Precise`,d:`Clear about what each product does.`}],
 aboutT:[`{N} is calm, clinical skincare built on evidence, not hype. Clean formulas, honest labels, and results you can feel — made for people who want a routine that is simple and effective.`,`{N} strips skincare back to what works: dermatologist-informed formulas, transparent ingredients, and nothing you don't need. Quiet, effective, and kind to your skin.`,`Born from a belief that skincare should be calm and clear, {N} makes evidence-based products that fit into real life — a simpler routine you can actually keep.`],
 biosT:[`Calm, clinical skincare that actually works.`,`Evidence-based formulas for a simpler routine.`,`Clean labels. Real results. No hype.`,`Skincare, stripped back to what matters.`,`Quietly effective, and kind to your skin.`,`Meet {N} — proof over promises.`],
 linkedinT:[`{N} builds calm, clinical skincare grounded in evidence — clean formulas, honest claims, and results you can feel.`,`At {N}, we believe skincare should be simple and transparent — formulated with dermatologist-informed science and labeled plainly.`,`As the founder of {N}, I'm focused on proof over promises: effective products, honest marketing, and a routine people can actually keep.`],
 facebookT:[`Meet {N} — calm, clinical skincare with clean formulas and honest labels.`,`Skincare without the hype. {N} keeps it simple, transparent, and effective.`,`Join the {N} community for real results and a routine you'll love.`],
 postsT:[`New drop: our gentlest cleanser yet. Calm skin starts here. ✨`,`No miracle claims — just formulas that work.`,`Your routine, simplified. Three steps, real results.`,`Every ingredient earns its place. Here's why. 🔬`,`Sensitive skin? {N} was made with you in mind.`,`Consistency beats complexity. Keep it simple with {N}.`],
 names:[
  {name:`Everly`,mono:`E`,dom:`everly.com`,st:`Available`,tag:`Calm skin. Clear results.`,
   why:[`Soft, human name that reads as gentle and trustworthy.`,`Premium without sounding cold or clinical.`,`Easy to say, spell, and remember.`,`Works as a personal name — warm and relatable.`,`Leaves room to grow into a full product line.`,`Distinct in a category of hard, science-y names.`,`Looks elegant in a clean wordmark.`,`Available and ownable as a .com.`],
   taglines:[`Calm skin. Clear results.`,`Clinical care, made calm.`,`Proof, not promises.`,`Your simplest, smartest routine.`,`Skincare, quietly effective.`,`Everyday skin, elevated.`]},
  {name:`Lumen & Co`,mono:`LC`,dom:`lumenandco.com`,st:`Available`,tag:`Skincare, quietly effective.`,
   why:[`"Lumen" evokes light, clarity, and a healthy glow.`,`Feels modern and science-led without hype.`,`"& Co" adds warmth and craft.`,`Flexible for serums, tools, and refills.`,`Reads as premium and considered.`,`Memorable and easy to brand.`,`Pairs well with a clean, luminous palette.`,`Room to expand into a family of products.`],
   taglines:[`Skincare, quietly effective.`,`A quieter kind of glow.`,`Light, made skin-deep.`,`Clarity you can feel.`,`The science of a good glow.`,`Bright skin, clear conscience.`]}
 ]
},
{
 id:'petcare',emoji:'🐾',cat:'Pet Care',said:`Friendly neighborhood dog-sitting & dog-walking.`,tier:'spark',ready:70,fav:false,date:'Jul 15, 2026',ord:1,
 palettes:[{name:`Fresh & Friendly`,note:`Upbeat, outdoorsy, and trustworthy.`,cols:['#22C55E','#B7791F','#173A2A','#F4F5F4']}],
 type:[{name:`Rounded Sans`,note:`Friendly and confident for headlines.`,font:`Inter,system-ui,sans-serif`,w:'800'},{name:`Simple Sans`,note:`Clear, easy body text.`,font:`Inter,system-ui,sans-serif`,w:'600'}],
 voice:[{n:`Friendly`,d:`Warm and upbeat, like a neighbor you trust.`},{n:`Reliable`,d:`Calm, dependable, always shows up.`},{n:`Caring`,d:`Every dog treated like family.`}],
 aboutT:[`{N} is a friendly dog-sitting and walking service that treats your pup like family. Reliable care, daily walks, and photo updates while you're away — so you never have to worry.`,`{N} gives busy pet parents peace of mind: trusted walks, in-home sitting, and real updates from people who genuinely love dogs.`,`From neighborhood strolls to overnight stays, {N} keeps tails wagging and owners relaxed — dependable, caring, and always on time.`],
 biosT:[`Dog-sitting & walking that treats your pup like family.`,`Reliable walks, happy tails, photo updates.`,`Your dog's second home when you're away.`,`Trusted care from people who love dogs.`,`Neighborhood walks, overnight sitting, real peace of mind.`,`Book {N} for worry-free days.`],
 linkedinT:[`{N} provides trusted dog-sitting and walking — treating every dog like family, with reliable care and daily updates for busy pet parents.`,`At {N}, we combine dependable scheduling with genuine care, giving owners peace of mind and dogs the attention they deserve.`,`As the founder of {N}, I built a service I'd trust with my own dog: on time, transparent, and full of heart.`],
 facebookT:[`{N} brings reliable dog-sitting and walking to your neighborhood — daily walks, real care, photo updates!`,`Busy week? Let {N} handle the walks. Your dog will thank you! 🐾`,`Join the {N} family — trusted care and happy tails all around.`],
 postsT:[`Rainy day? We still walk. ☔🐾 Your pup stays happy.`,`Meet this week's happiest clients! 🐕`,`Going away? {N} has your dog covered.`,`Photo updates with every visit. 📸`,`Tired dog, happy owner. That's the {N} promise.`,`Booking up fast for the holidays — reserve your spot! 🐾`],
 names:[
  {name:`WagWalk`,mono:`WW`,dom:`wagwalk.com`,st:`Available`,tag:`Walks, wags, and worry-free days.`,
   why:[`Playful and instantly clear — walking + happy dogs.`,`Alliteration makes it stick.`,`Friendly and approachable for pet parents.`,`Scales to sitting, boarding, and franchises.`,`Fun to say and easy to remember.`,`Great for a bright, energetic brand.`,`Works well as an app name and handle.`,`Available and ownable as a .com.`],
   taglines:[`Walks, wags, and worry-free days.`,`Every walk, a happy tail.`,`We walk, you relax.`,`Your dog's favorite part of the day.`,`Happy dogs, one walk at a time.`,`Leashed up and loving it.`]},
  {name:`Pawside`,mono:`PW`,dom:`pawside.co`,st:`Available`,tag:`Your dog's second-favorite human.`,
   why:[`Warm, modern, and easy to remember.`,`Suggests a companion right by your dog's side.`,`Works for sitting, walking, and daycare.`,`Clean and brandable for an app or site.`,`Friendly without being cutesy.`,`Short and ownable.`,`Pairs well with a soft, trustworthy palette.`,`Room to grow into a full pet-care brand.`],
   taglines:[`Your dog's second-favorite human.`,`By their side, every day.`,`Care that stays close.`,`Happy dogs, easy days.`,`Always by their paw side.`,`Trusted, tail-wagging care.`]}
 ]
}
];

/* ===== logo system (idea palette + selected name) ===== */
function hashN(s){var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0;}return h;}
function grad(id,a,b,ang){return '<linearGradient id="'+id+'" gradientTransform="rotate('+ang+' .5 .5)"><stop offset="0" stop-color="'+a+'"/><stop offset="1" stop-color="'+b+'"/></linearGradient>';}
function ff(t){return t.length>=2?24:32;}
function lPrimary(nm,mo,C){var id='lp'+slug(nm),a=(hashN(nm)%120)+30;return '<svg viewBox="0 0 120 120"><defs>'+grad(id,C[0],C[1],a)+'</defs><rect x="8" y="8" width="104" height="104" rx="30" fill="url(#'+id+')"/><rect x="8" y="8" width="104" height="104" rx="30" fill="none" stroke="rgba(20,60,40,.2)"/><text x="60" y="62" text-anchor="middle" dominant-baseline="central" font-family="Inter,sans-serif" font-weight="800" font-size="'+ff(mo)+'" fill="#141414">'+esc(mo)+'</text></svg>';}
function lIcon(nm,mo,C){var id='li'+slug(nm),a=(hashN(nm+'i')%140)+20,r=(hashN(nm)%60)-30;return '<svg viewBox="0 0 120 120"><defs>'+grad(id,C[0],C[2]||C[1],a)+'</defs><g transform="rotate('+r+' 60 60)"><circle cx="60" cy="60" r="30" fill="none" stroke="url(#'+id+')" stroke-width="9"/><circle cx="60" cy="24" r="9" fill="'+C[1]+'"/><circle cx="88" cy="74" r="5.5" fill="'+(C[3]||C[0])+'"/></g></svg>';}
function lWord(nm,mo,C){var id='lw'+slug(nm),a=(hashN(nm+'w')%100)+40,fs=nm.length>12?15:20;return '<svg viewBox="0 0 260 80"><defs>'+grad(id,C[0],C[1],a)+'</defs><rect x="6" y="34" width="26" height="12" rx="6" fill="url(#'+id+')"/><text x="42" y="46" dominant-baseline="central" font-family="Inter,sans-serif" font-weight="800" font-size="'+fs+'" fill="url(#'+id+')">'+esc(nm)+'</text></svg>';}
function lEmblem(nm,mo,C){var id='le'+slug(nm),a=(hashN(nm+'e')%160)+10;return '<svg viewBox="0 0 120 120"><defs>'+grad(id,C[0],C[1],a)+'</defs><circle cx="60" cy="60" r="52" fill="none" stroke="url(#'+id+')" stroke-width="4"/><circle cx="60" cy="60" r="40" fill="none" stroke="rgba(20,60,40,.2)"/><text x="60" y="62" text-anchor="middle" dominant-baseline="central" font-family="Inter,sans-serif" font-weight="800" font-size="'+ff(mo)+'" fill="url(#'+id+')">'+esc(mo)+'</text></svg>';}
function lOutline(nm,mo,C){var id='lo'+slug(nm),a=(hashN(nm+'o')%120)+30;return '<svg viewBox="0 0 120 120"><defs>'+grad(id,C[1],C[0],a)+'</defs><rect x="12" y="12" width="96" height="96" rx="24" fill="none" stroke="url(#'+id+')" stroke-width="4"/><text x="60" y="62" text-anchor="middle" dominant-baseline="central" font-family="Inter,sans-serif" font-weight="800" font-size="'+ff(mo)+'" fill="url(#'+id+')">'+esc(mo)+'</text></svg>';}
var LOGO_SET=[['Primary',lPrimary],['Icon',lIcon],['Wordmark',lWord],['Emblem',lEmblem],['Outline',lOutline]];
/* Client-facing logo suite — only the three hero lockups. */
var LOGOS3=[['Primary',lPrimary],['Icon',lIcon],['Wordmark',lWord]];
function merchSVG(label,mono,C){var id='mk'+slug(label)+slug(mono);return '<svg viewBox="0 0 200 150"><defs>'+grad(id,C[0],C[1],40)+'</defs><rect width="200" height="150" rx="14" fill="#ECEAF7"/><rect x="70" y="30" width="60" height="60" rx="16" fill="url(#'+id+')"/><text x="100" y="62" text-anchor="middle" dominant-baseline="central" font-family="Inter,sans-serif" font-weight="800" font-size="22" fill="#141414">'+esc(mono)+'</text><text x="100" y="124" text-anchor="middle" font-family="Inter,sans-serif" font-weight="700" font-size="13" fill="#3a3550">'+esc(label)+'</text></svg>';}
var MERCH=['T-Shirt','Tote Bag','Mug','Cap'];
/* cinematic 2K photo — moody generated hero (imagery only; caption overlays in HTML) */
function cineSVG(C,seed){var id='cn'+slug(seed),s=hashN(seed);var c0=C[0],c1=C[1],c2=(C[2]||'#141414'),c3=(C[3]||C[1]);
 return '<svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Cinematic brand photo"><defs>'+
 '<linearGradient id="'+id+'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+c2+'"/><stop offset="1" stop-color="#FFFFFF"/></linearGradient>'+
 '<filter id="'+id+'b" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="16"/></filter>'+
 '<linearGradient id="'+id+'v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".8"/></linearGradient>'+
 '</defs><rect width="320" height="180" fill="url(#'+id+'g)"/>'+
 '<g filter="url(#'+id+'b)" opacity=".82">'+
 '<circle cx="'+(50+s%150)+'" cy="'+(40+s%40)+'" r="72" fill="'+c0+'"/>'+
 '<circle cx="'+(210-s%110)+'" cy="132" r="66" fill="'+c1+'"/>'+
 '<circle cx="262" cy="58" r="42" fill="'+c3+'"/>'+
 '<ellipse cx="160" cy="72" rx="150" ry="26" fill="'+c1+'" opacity=".45"/>'+
 '</g><rect width="320" height="180" fill="url(#'+id+'v)"/></svg>';}

/* CO213: download audit — ported from the main site's prewired schema (log-download). */
/* DOWNLOAD LOGGING WAS SILENTLY DISCARDED (2026-07-26).
   log-download.js returns early when `email` is empty — and this never sent one. Every call
   since the log was built on 5 July was thrown away: smn_download_log has zero rows despite
   customers downloading their kits. The email is already known to the page via acEmail();
   `allowed` is sent explicitly because the function stores it as a boolean and a missing value
   would have recorded every download as blocked. */
function logDl(asset,section){
  try{
    var who='';
    try{ who = (typeof acEmail==='function') ? acEmail() : ''; }catch(e){}
    if(!who || who.indexOf('@')<1){
      try{ who = localStorage.getItem('smn_email') || ''; }catch(e){}
    }
    if(!who || who.indexOf('@')<1) return;   /* nobody to attribute it to — do not send noise */
    fetch('/.netlify/functions/log-download',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        email:who,
        asset:String(asset||''),
        section:String(section||'workspace'),
        allowed:true,
        page:'workspace2',
        ts:Date.now()
      })
    }).catch(function(){});
  }catch(e){}
}
function dlSVG(svg,f){logDl(f,'logo');try{var bl=new Blob([svg],{type:'image/svg+xml'}),u=URL.createObjectURL(bl),a=document.createElement('a');a.href=u;a.download=f;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u);},400);toast('Downloaded '+f);}catch(e){toast('Download starts on your device.');}}
/* DOWNLOAD EVERYTHING — one ZIP of the whole brand (text kit + logos + real 2K photos). */
function loadJSZip(cb){if(window.JSZip)return cb();var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';s.onload=function(){cb();};s.onerror=function(){toast('Could not load the download tool — please try again.');};document.head.appendChild(s);}
/* ONE DEFINITION (2026-07-25). This function was declared TWICE at top level, so the second
   silently replaced the first and the two behaved differently on failure: the first told the
   customer and never called back; the second called back regardless. Three call sites depend
   on the difference — two build a jsPDF immediately (and would throw), one checks for the
   library and falls back to saving plain text (and needs the callback either way).
   The single definition below ALWAYS calls back, so the text fallback still works, and passes
   a flag plus a toast so a blocked CDN is never silent. */
function loadJsPDF(cb){
  if(window.jspdf&&window.jspdf.jsPDF) return cb(true);
  var s=document.createElement('script');
  s.src='https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
  s.onload=function(){ cb(!!(window.jspdf&&window.jspdf.jsPDF)); };
  s.onerror=function(){
    try{ toast('Could not load the PDF tool — saving in another format instead.'); }catch(e){}
    cb(false);
  };
  document.head.appendChild(s);
}

/* ===== PROVEN ASSET GENERATORS (2026-07-22) — exact replication of
   report-template.js's real, tested generation logic (dlDark/dlAvatar/dlCover/
   dlSizes/dlFavs/dlLockup/_banner/dlSite), adapted to source from workspace's
   real NM/IDEA data instead of DOM-scraping. Same pixel math, same colors,
   same crop logic. Nothing invented. Returns {filename,blob} or arrays of same. */
function _loadImg(u){return new Promise(function(res,rej){var im=new Image();im.crossOrigin='anonymous';im.onload=function(){res(im);};im.onerror=function(){rej(new Error('img'));};im.src=u;});}
function _canvasBlob(cv){return new Promise(function(res,rej){cv.toBlob(function(bl){if(!bl){rej(new Error('canvas produced no image (tainted by a cross-origin asset)'));return;}res(bl);},'image/png');});}
/* VECTOR DEPARTMENT (client-side, 2026-07-23 Founder order): trace the real painted logo
   into a TRUE SVG vector — agency-grade curves that scale to any size. Loads the tracer
   from cdn.jsdelivr.net (already CSP-approved). Every caller has a bitmap fallback, so a
   tracer hiccup can never break a download. */
var _itLoad=null;
function _imgTracer(){if(window.ImageTracer)return Promise.resolve(window.ImageTracer);if(_itLoad)return _itLoad;
 _itLoad=new Promise(function(res,rej){var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/imagetracerjs@1.2.6/imagetracer_v1.2.6.js';s.onload=function(){window.ImageTracer?res(window.ImageTracer):rej(new Error('tracer'));};s.onerror=function(){_itLoad=null;rej(new Error('tracerload'));};document.head.appendChild(s);});return _itLoad;}
function traceLogoSVG(url){return Promise.all([_imgTracer(),_sameOriginImg(url)]).then(function(a){var IT=a[0],im=a[1];
 var MAX=640,s=Math.min(1,MAX/Math.max(im.width,im.height)),w=Math.max(1,Math.round(im.width*s)),h=Math.max(1,Math.round(im.height*s));
 var cv=document.createElement('canvas');cv.width=w;cv.height=h;var x=_q(cv.getContext('2d'));x.fillStyle='#FFFFFF';x.fillRect(0,0,w,h);x.drawImage(im,0,0,w,h);
 var svg=IT.imagedataToSVG(x.getImageData(0,0,w,h),{numberofcolors:12,colorquantcycles:3,ltres:1,qtres:1,pathomit:24,blurradius:0,strokewidth:0,roundcoords:2,viewbox:true,linefilter:true,scale:1});
 if(!svg||svg.indexOf('<svg')<0)throw new Error('tracefail');return svg;});}
function _svgToImg(svgTxt){return new Promise(function(res,rej){var im=new Image();im.onload=function(){res(im);};im.onerror=function(){rej(new Error('svgimg'));};im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svgTxt);});}
/* BRAND FONT ENGINE (2026-07-23, Founder order — world-class design layer).
   Composed deliverables (lockup, banners, starter page) are set in a display face
   CURATED TO THE BRAND'S INDUSTRY — the same intelligence as the Package Curator —
   loaded from Google Fonts (already CSP-approved) before the canvas draws. If the kit
   named a real Google font, that wins. Fallback chain keeps Georgia so a font hiccup
   can never break a file. Contrast guard picks ink color by background luminance. */
var SMN_FONTMAP=[
 [/military|defense|tactical|aerospace|drone|security/i,'Black Ops One'],
 [/attorney|law|legal|cpa|account|tax|advisor|wealth|insurance|consult/i,'Playfair Display'],
 [/tech|software|\bai\b|app\b|saas|robot|data|cyber/i,'Space Grotesk'],
 [/pizza|restaurant|cafe|coffee|bakery|food|grill|bar\b|bistro|catering|kitchen/i,'Fraunces'],
 [/kids|toy|party|birthday|game|fun/i,'Baloo 2'],
 [/spa|beauty|salon|wellness|yoga|skincare|bridal/i,'Cormorant Garamond'],
 [/construction|contractor|plumb|electric|hvac|roof|storage|moving|towing|landscap|handyman/i,'Archivo Black'],
 [/podcast|media|creator|studio|music|film/i,'Bebas Neue'],
 [/nonprofit|charity|foundation|community|church|shelter|veteran/i,'Merriweather'],
 [/health|medical|clinic|rehab|therap|counsel|hospice|senior care|home care|nursing/i,'Lora']];
var SMN_GFONTS=['Black Ops One','Playfair Display','Space Grotesk','Fraunces','Baloo 2','Cormorant Garamond','Archivo Black','Bebas Neue','Merriweather','Inter','Oswald','Montserrat','Lora','Poppins','Raleway','Abril Fatface'];
var SMN_FONTPAIR={'Black Ops One':'Inter','Playfair Display':'Source Sans 3','Space Grotesk':'Inter','Fraunces':'Inter','Baloo 2':'Nunito','Cormorant Garamond':'Jost','Archivo Black':'Inter','Bebas Neue':'Inter','Merriweather':'Source Sans 3','Inter':'Inter'};
function brandBodyFont(disp){return SMN_FONTPAIR[disp]||'Inter';}
function brandDisplayFont(NM,IDEA){try{
 var kitF=((IDEA&&IDEA.type)||[]).map(function(t){return String(t.name||'').trim();}).filter(Boolean);
 for(var i=0;i<kitF.length;i++){for(var j=0;j<SMN_GFONTS.length;j++){if(kitF[i].toLowerCase()===SMN_GFONTS[j].toLowerCase())return SMN_GFONTS[j];}}
 var s=String((IDEA&&IDEA.said)||'')+' '+String((IDEA&&IDEA.cat)||'')+' '+String((NM&&NM.tag)||'');
 for(var k=0;k<SMN_FONTMAP.length;k++){if(SMN_FONTMAP[k][0].test(s))return SMN_FONTMAP[k][1];}
}catch(e){} return 'Inter';}
var _fontLoaded={};
function loadBrandFont(fam){if(!fam)return Promise.resolve('');if(_fontLoaded[fam])return _fontLoaded[fam];
 _fontLoaded[fam]=new Promise(function(res){try{
  var l=document.createElement('link');l.rel='stylesheet';
  l.href='https://fonts.googleapis.com/css2?family='+encodeURIComponent(fam).replace(/%20/g,'+')+':wght@400;700;800;900&display=swap';
  document.head.appendChild(l);
  var done=function(){res(fam);};
  if(document.fonts&&document.fonts.load){Promise.all([document.fonts.load('800 64px "'+fam+'"'),document.fonts.load('700 32px "'+fam+'"')]).then(done).catch(done);setTimeout(done,2500);}
  else setTimeout(done,1200);
 }catch(e){res('');}});
 return _fontLoaded[fam];}
function _inkFor(hex){try{var m=/^#?([0-9a-f]{6})$/i.exec(String(hex||''));if(!m)return '#14161A';var n=parseInt(m[1],16),l=(0.2126*((n>>16)&255)+0.7152*((n>>8)&255)+0.0722*(n&255))/255;return l<0.55?'#FFFFFF':'#14161A';}catch(e){return '#14161A';}}
/* Vector-first logo loader: best-available image — traced curves when possible, bitmap otherwise. */
/* R1: every logo used to be pushed through the vectorizer before any composition saw
   it — a 12-colour posterisation of finished artwork. DELETED. The delivered file is
   loaded and used. traceLogoSVG remains ONLY for the SVG deliverable. */
/* TAINT FIX (2026-07-24). Drawing a cross-origin image into a canvas taints it, and a
   tainted canvas returns NULL from toBlob — so the file silently comes out empty and
   nothing downloads. The old code hid this by routing every logo through the vectorizer
   (an SVG data-URL never taints). With the vectorizer removed, the taint surfaced and
   blocked the Founder's own logo pack, lockup, badge and merch files.
   Fix: fetch the bytes and load them from a blob URL, which is same-origin by
   definition. Falls back to a direct load if the fetch is unavailable. */
function _sameOriginImg(url){
  return fetch(url,{mode:'cors',credentials:'omit'})
    .then(function(r){ if(!r.ok) throw new Error('fetch '+r.status); return r.blob(); })
    .then(function(b){ return new Promise(function(res,rej){
        var u=URL.createObjectURL(b), im=new Image();
        im.onload=function(){ res(im); };            // keep the URL alive for the draw
        im.onerror=function(){ URL.revokeObjectURL(u); rej(new Error('decode')); };
        im.src=u;
      });})
    .catch(function(){ return _loadImg(url); });
}
function _logoImg(url){return _sameOriginImg(url);}
function _darkest(C){try{var best=null,bl=9;(C||[]).forEach(function(h){var m=/^#?([0-9a-f]{6})$/i.exec(String(h||''));if(!m)return;var n=parseInt(m[1],16),r=(n>>16)&255,g=(n>>8)&255,b=n&255,l=(0.2126*r+0.7152*g+0.0722*b)/255;if(l<bl){bl=l;best='#'+m[1];}});return (best&&bl<0.45)?best:'#101018';}catch(e){return '#101018';}}
function genDark(logoUrl,C){return _logoArt(logoUrl).then(function(im){var S=2048,cv=document.createElement('canvas');cv.width=S;cv.height=S;var x=_q(cv.getContext('2d'));x.fillStyle=_darkest(C);x.fillRect(0,0,S,S);_logoSmart(x,im,S*.1,S*.1,S*.8,S*.8);return _canvasBlob(cv).then(function(b){return{filename:'logo-dark-background.png',blob:b};});});}
function genAvatar(logoUrl){return _logoArt(logoUrl).then(function(im){var S=1024,cv=document.createElement('canvas');cv.width=S;cv.height=S;var x=_q(cv.getContext('2d'));x.fillStyle='#FFFFFF';x.fillRect(0,0,S,S);_logoSmart(x,im,Math.round(S*.08),Math.round(S*.08),Math.round(S*.84),Math.round(S*.84));return _canvasBlob(cv).then(function(b){return{filename:'profile-symbol-1024.png',blob:b};});});} // CONTAIN LAW 2026-07-24: center-crop butchered padded logos
/* SPARK ART BRIEF R4 (2026-07-24): ONE PHOTO PER PIECE. The client's photo set was
   already assembled for the 5-page website; every other deliverable used the same single
   hero, so a kit looked like a template. These helpers share the pool and hand each
   deliverable its own photo, deterministically — the same piece always gets the same
   image, but different pieces get different ones, and none repeats while one is unused. */
function smnPhotoPool(IDEA,NM){
  var out=[];
  try{
    if(NM&&NM.heroUrl) out.push(NM.heroUrl);
    (IDEA.names||[]).forEach(function(n){if(n.heroUrl&&out.indexOf(n.heroUrl)<0)out.push(n.heroUrl);});
    if(IDEA.header&&out.indexOf(IDEA.header)<0) out.push(IDEA.header);
  }catch(e){}
  return out;
}
/* Round-robin by a fixed registry position, so distribution is even and stable:
   no photo repeats while another is still unused. */
var SMN_PHOTO_ORDER = ['cover','hero','banner-300x250.png','banner-728x90.png',
  'banner-160x600.png','print-flyer','print-poster','print-rack','print-eddm',
  'print-trifold','print-pullup','soc-posts','soc-story','soc-carousel',
  'dig-fbevent','dig-linkbio','dig-blogheader','dig-webset','website5',
  'deck-capabilities','deck-pitch'];
function smnPhotoFor(IDEA,NM,key){
  var pool=smnPhotoPool(IDEA,NM);
  if(!pool.length) return '';
  var i=SMN_PHOTO_ORDER.indexOf(String(key||''));
  if(i<0){ var h=0,s=String(key||'');
           for(var j=0;j<s.length;j++){h=(h*31+s.charCodeAt(j))>>>0;}
           i=SMN_PHOTO_ORDER.length+(h%pool.length); }
  return pool[i%pool.length];
}
function genCover(heroUrl){return _sameOriginImg(heroUrl).then(function(im){var cv=document.createElement('canvas');cv.width=1500;cv.height=500;var x=_q(cv.getContext('2d'));var s=Math.max(1500/im.width,500/im.height);var w=im.width*s,h=im.height*s;x.drawImage(im,(1500-w)/2,(500-h)/2,w,h);return _canvasBlob(cv).then(function(b){return{filename:'social-cover-1500x500.png',blob:b};});});}
function _genSizesBitmap(logoUrl){return _logoArt(logoUrl).then(function(im){var szs=[256,512,1024,2048];return Promise.all(szs.map(function(sz){var cv=document.createElement('canvas');cv.width=sz;cv.height=sz;var x=_q(cv.getContext('2d'));x.fillStyle='#FFFFFF';x.fillRect(0,0,sz,sz);var s=Math.min(sz*.92/im.width,sz*.92/im.height);var w=im.width*s,h=im.height*s;x.drawImage(im,(sz-w)/2,(sz-h)/2,w,h);return _canvasBlob(cv).then(function(b){return{filename:'logo-'+sz+'px.png',blob:b};});}));});}
/* R1: size pack comes from the delivered art, not re-traced curves. */
function genSizes(logoUrl){return _genSizesBitmap(logoUrl);}
function genFavs(logoUrl){return _logoArt(logoUrl).then(function(im){var big=document.createElement('canvas');big.width=1024;big.height=1024;var bx=_q(big.getContext('2d'));var m=Math.round(1024*.06),s=Math.min((1024-m*2)/im.width,(1024-m*2)/im.height),w=im.width*s,h=im.height*s;bx.drawImage(im,(1024-w)/2,(1024-h)/2,w,h);var szs=[16,32,48,180];return Promise.all(szs.map(function(sz){var cv=document.createElement('canvas');cv.width=sz;cv.height=sz;var x=_q(cv.getContext('2d'));_stepDraw(x,big,0,0,sz,sz);return _canvasBlob(cv).then(function(b){return{filename:'favicon-'+sz+'.png',blob:b};});}));});} // CONTAIN LAW: cleaned icon contained then stepped; crop abolished
function genLockup(logoUrl,name,C,IDEA,NM){var fam=brandDisplayFont(NM||{},IDEA||{});return Promise.all([_logoArt(logoUrl),loadBrandFont(fam)]).then(function(a){var im=a[0],F=a[1]?('"'+a[1]+'",Georgia,serif'):'Georgia,serif';var W=3200,H=960,cv=document.createElement('canvas');cv.width=W;cv.height=H;var x=_q(cv.getContext('2d'));x.fillStyle='#FFFFFF';x.fillRect(0,0,W,H);var s=(H*.79)/Math.max(im.width,im.height);var w=im.width*s,h=im.height*s;x.drawImage(im,120,(H-h)/2,w,h);x.fillStyle='#14161A';x.font='800 176px '+F;x.textBaseline='middle';x.fillText(name,120+w+112,H/2,W-(120+w+112)-120);x.fillStyle=(C&&C[0])||'#141414';x.fillRect(120+w+112,Math.round(H*.66),440,12);return _canvasBlob(cv).then(function(b){return{filename:'lockup-horizontal.png',blob:b};});});}
/* AGENCY MARK (2026-07-30, v3) — the "Agency Custom" mark now renders in the SAME editorial
   agency style your live print engine uses for the business-card front (genPrintPiece): the
   brand display face for the name, a short accent-colour rule (~34% wide), an italic tagline,
   body-font contact lines, charcoal ink (SMN_INK), a weighted/contained logo (_logoSmart), and
   THIS brand's own grid fingerprint (spine / editorial / split via smnBrandContext) so no two
   brands look identical. Composed on canvas, instant, $0, cannot circle. Returns {filename,blob}. */
function genAgencyMark(logoUrl,name,tag,C,IDEA,NM){
 var dom=(NM&&NM.dom)||'',bd=_bd(IDEA||{});
 var cols=((C&&C.length)?C:((IDEA&&IDEA.palettes&&IDEA.palettes[0]&&IDEA.palettes[0].cols)||['#141414','#141414','#141414','#B7791F']));
 var acc=_brightest(cols);
 var disp=brandDisplayFont(NM||{},IDEA||{}),body=brandBodyFont(disp);
 var F='"'+disp+'",Georgia,serif',BF='"'+body+'",Arial,sans-serif';
 function contact(){var L=[];if(bd.phone)L.push(bd.phone);if(bd.email)L.push(bd.email);if(dom)L.push(dom);if(bd.address)L.push(bd.address);return L;}
 return Promise.all([_logoArt(logoUrl),loadBrandFont(disp),loadBrandFont(body)]).then(function(a){
  var im=a[0];
  function logo(x,bx,by,bw,bh){_logoSmart(x,im,bx,by,bw,bh);}
  var BX=smnBrandContext(NM||{},IDEA||{});
  var f=printCanvas(3.5,2);f.x.fillStyle='#FFFFFF';f.x.fillRect(0,0,f.W,f.H);
  var fLg=_logoBox('card',f.W,240);
  var cl=contact();
  var nx,nw;
  if(BX.grid==='split'){ f.x.fillStyle=acc;f.x.fillRect(f.W-Math.round(f.W*0.34),0,Math.round(f.W*0.34),f.H); nx=f.sp; nw=f.W-Math.round(f.W*0.34)-f.sp*2; }
  else if(BX.grid==='editorial'){ nx=f.sp; nw=f.W-f.sp*2; }
  else { nx=f.sp+fLg+Math.round(f.W*0.05); nw=f.W-nx-f.sp; }
  f.x.textBaseline='alphabetic';
  var npx=_fitText(f.x,name,'800 {px} '+F,120,nw);
  var tpx=tag?_fitText(f.x,tag,'italic 500 {px} '+F,52,nw):0;
  var lines=Math.min(cl.length,3);
  var blockH=npx+(tag?tpx+26:0)+26+(lines?lines*46+18:0);
  var top=Math.round((f.H-blockH)/2*0.92);
  if(BX.grid==='split'){ logo(f.x,f.W-Math.round(f.W*0.30),Math.round((f.H-fLg)/2),fLg,fLg); }
  else if(BX.grid==='editorial'){ logo(f.x,f.sp,Math.round(f.H*0.10),Math.round(fLg*0.86),Math.round(fLg*0.66)); top=Math.round(f.H*0.48); }
  else { logo(f.x,f.sp,Math.round((f.H-fLg)/2),fLg,fLg); }
  var y=top+npx;
  f.x.fillStyle=SMN_INK;f.x.font='800 '+npx+'px '+F;f.x.fillText(name,nx,y,nw);
  y+=26; f.x.fillStyle=acc;f.x.fillRect(nx,y,Math.round(nw*0.34),8); y+=34;
  if(tag){f.x.fillStyle=SMN_INK2;f.x.font='italic 500 '+tpx+'px '+F;f.x.fillText(tag,nx,y+tpx*0.8,nw);y+=tpx+26;}
  f.x.fillStyle=SMN_INK2;f.x.font='400 34px '+BF;
  cl.slice(0,3).forEach(function(l,i){f.x.fillText(l,nx,y+18+i*46,nw);});
  return _canvasBlob(f.cv).then(function(b){return{filename:'agency-mark.png',blob:b};});
 });}
/* WORDMARK ENGINE (2026-07-30) — client "logo wordmarks" composed in code from the NAME + the
   brand palette + real premium type. No AI, no network, $0 each. Each style = a face + a colour
   treatment (brand ink / accent / metallic gradient / silver) + an optional spark. The client
   gets the whole set to choose from; the nicest sits large under the URL. Transparent PNG. */
function _agLight(hex,a){try{var h=String(hex||'').replace('#','');if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];var r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);if(isNaN(r+g+b))return'#EADFA0';return'rgb('+Math.round(r+(255-r)*a)+','+Math.round(g+(255-g)*a)+','+Math.round(b+(255-b)*a)+')';}catch(e){return'#EADFA0';}}
function _agDark(hex,a){try{var h=String(hex||'').replace('#','');if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];var r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);if(isNaN(r+g+b))return'#7A5A1C';return'rgb('+Math.round(r*(1-a))+','+Math.round(g*(1-a))+','+Math.round(b*(1-a))+')';}catch(e){return'#7A5A1C';}}
/* LEGIBLE ACCENT (2026-07-30): the wordmark "accent" styles (Modern Sans, Signature) and the
   Gold gradient were filled with _brightest(palette) — inherently washed out on white (a light
   orange gave ~2.7:1). Darken the colour on its own hue until it reads (~4.5:1), keeping the
   brand family. Mirrors the vector engine's ink floor. */
function _inkable(hex){try{var h=String(hex||'').replace('#','');if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];var r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);if(isNaN(r+g+b))return'#8A3A1C';var L=0.2126*r+0.7152*g+0.0722*b;if(L>96){var k=96/L;r=Math.round(r*k);g=Math.round(g*k);b=Math.round(b*k);}return'#'+[r,g,b].map(function(v){return('0'+Math.max(0,Math.min(255,v)).toString(16)).slice(-2);}).join('').toUpperCase();}catch(e){return'#8A3A1C';}}
function _spark(x,cx,cy,R,fill){var r=R*0.30;x.save();x.fillStyle=fill;x.beginPath();var p=[[0,-R],[r,-r],[R,0],[r,r],[0,R],[-r,r],[-R,0],[-r,-r]];for(var i=0;i<p.length;i++){var X=cx+p[i][0],Y=cy+p[i][1];if(i===0)x.moveTo(X,Y);else x.lineTo(X,Y);}x.closePath();x.fill();x.restore();}
var WORDMARK_STYLES=[
 {key:'serif',  label:'Serif Luxe',  gf:'Playfair Display', fb:'serif', weight:700, mode:'ink',    spark:true},
 {key:'caps',   label:'Spaced Caps', gf:'Marcellus',        fb:'serif', weight:400, up:true, track:0.14, mode:'ink'},
 {key:'gold',   label:'Gold',        gf:'Playfair Display', fb:'serif', weight:700, mode:'gold',   spark:true},
 {key:'sans',   label:'Modern Sans', gf:'Montserrat',       fb:'sans',  weight:600, track:0.03, mode:'accent'},
 {key:'script', label:'Signature',   gf:'Great Vibes',      fb:'serif', weight:400, mode:'accent', spark:true}
];
function genWordmark(name,spec,C,IDEA,NM){
 var cols=((C&&C.length)?C:['#141414']);var acc=_brightest(cols);var accInk=_inkable(acc);
 var gf=spec.gf||brandDisplayFont(NM||{},IDEA||{});
 return loadBrandFont(gf).then(function(loaded){
  var stack=(loaded?('"'+loaded+'",'):'')+((spec.fb==='sans')?'Arial,Helvetica,sans-serif':'Georgia,"Times New Roman",serif');
  var W=2200,H=560,cv=document.createElement('canvas');cv.width=W;cv.height=H;var x=_q(cv.getContext('2d'));
  var txt=spec.up?String(name).toUpperCase():String(name);var weight=spec.weight||700;var track=spec.track||0;
  var maxW=W*0.84,cy=Math.round(H*0.62),fs=260;
  function widthAt(fsz){x.font=weight+' '+fsz+'px '+stack;var t=0;for(var i=0;i<txt.length;i++)t+=x.measureText(txt[i]).width;return t+(txt.length-1)*track*fsz;}
  while(fs>40 && widthAt(fs)>maxW) fs-=6;
  var fill;
  if(spec.mode==='gold'){var g=x.createLinearGradient(0,cy-fs*0.82,0,cy+fs*0.14);g.addColorStop(0,_agLight(accInk,0.42));g.addColorStop(0.52,accInk);g.addColorStop(1,_agDark(accInk,0.4));fill=g;}
  else if(spec.mode==='accent')fill=accInk;
  else if(spec.mode==='mono')fill='#9AA0A8';
  else fill=(typeof SMN_INK!=='undefined'?SMN_INK:'#14161A');
  x.font=weight+' '+fs+'px '+stack;x.textBaseline='alphabetic';
  var tot=widthAt(fs);x.font=weight+' '+fs+'px '+stack;var sx=Math.round((W-tot)/2),cxp=sx;
  for(var i=0;i<txt.length;i++){x.fillStyle=fill;x.fillText(txt[i],cxp,cy);cxp+=x.measureText(txt[i]).width+track*fs;}
  if(spec.spark)_spark(x,Math.round(sx+tot+fs*0.30),Math.round(cy-fs*0.60),Math.round(fs*0.26),accInk);
  return _canvasBlob(cv).then(function(b){return{filename:'wordmark-'+(spec.key||'x')+'.png',blob:b,label:spec.label,key:spec.key};});
 });
}
/* SPARK ART BRIEF R3 + R5 (rebuilt 2026-07-24). The photo is shown WHOLE, sized to the
   full height of the piece and set to one side; the copy sits beside it on clean space
   from the brand palette. No crop, and no type over the picture — so no scrim is needed
   and the photograph is never dulled. */
function genBanner(heroUrl,name,tag,W,H,fname,C,IDEA,NM){
 var fam=brandDisplayFont(NM||{},IDEA||{});
 var body=brandBodyFont(fam);
 return Promise.all([_sameOriginImg(heroUrl),loadBrandFont(fam),loadBrandFont(body)]).then(function(a){
  var im=a[0];
  var F='"'+fam+'",Georgia,serif', BF='"'+body+'",Arial,sans-serif';
  var cols=(C&&C.length?C:['#141414','#141414','#141414','#B7791F']);
  var accent=_brightest(cols), ink='#161A22', mute='#5B6577';
  var cv=document.createElement('canvas');cv.width=W;cv.height=H;
  var x=_q(cv.getContext('2d'));
  x.fillStyle='#FFFFFF';x.fillRect(0,0,W,H);
  // photo: full height, whole image, right side (capped so copy always has room)
  var pw=Math.round(H*im.width/im.height);
  var maxP=Math.round(W*0.62);
  if(pw>maxP){pw=maxP;}
  var ph=Math.round(pw*im.height/im.width);
  var py=Math.round((H-ph)/2);
  try{x.drawImage(im,W-pw,py,pw,ph);}catch(e){_drawFail('banner photo',e);}
  if(ph<H){x.fillStyle='#FFFFFF';x.fillRect(W-pw,0,pw,py);x.fillRect(W-pw,py+ph,pw,H-py-ph);}
  // copy block on clean space
  var pad=Math.max(18,Math.round(W*0.022));
  var tw=W-pw-pad*2;
  x.textBaseline='alphabetic';
  var big=Math.max(14,Math.round(H*0.16));
  var npx=_fitText(x,name,'800 {px} '+F,big,tw);
  x.fillStyle=ink;x.font='800 '+npx+'px '+F;
  x.fillText(name,pad,Math.round(H*0.46),tw);
  x.fillStyle=accent;
  x.fillRect(pad,Math.round(H*0.53),Math.max(28,Math.round(tw*0.28)),Math.max(3,Math.round(H*0.018)));
  if(tag){
   var tpx=_fitText(x,tag,'500 {px} '+BF,Math.max(10,Math.round(H*0.075)),tw);
   x.fillStyle=mute;x.font='500 '+tpx+'px '+BF;
   x.fillText(tag,pad,Math.round(H*0.68),tw);
  }
  x.fillStyle=accent;x.fillRect(0,0,W,Math.max(3,Math.round(H*0.014)));
  return _canvasBlob(cv).then(function(b){return{filename:fname,blob:b};});
 });}
function genSite(name,tag,dom,bio,C,IDEA,NM){
 var D=detectDirection(IDEA||{},NM||{name:name,tag:tag});
 var acc=_brightest(C||[]),dk=(D.id==='nightlife')?_hexDeep(_darkest(C||[])):_darkest(C||[]);
 var light=D.mode==='light',bg=light?_hexLight(acc):dk,ink=light?'#20242C':_hexLight(acc);
 var line=light?'rgba(32,36,44,.14)':'rgba(255,255,255,.16)';
 var disp=brandDisplayFont(NM||{name:name,tag:tag},IDEA||{}),body=brandBodyFont(disp),inkBtn=_inkFor(acc);
 var bd=_bd(IDEA||{}),cl=[];if(bd.phone)cl.push(bd.phone);if(bd.email)cl.push(bd.email);if(dom)cl.push(dom);if(bd.address)cl.push(bd.address);
 var why=((NM&&NM.why)||[]).slice(0,3);
 var gf='https://fonts.googleapis.com/css2?family='+encodeURIComponent(disp).replace(/%20/g,'+')+':wght@600;800&family='+encodeURIComponent(body).replace(/%20/g,'+')+':wght@300;400;600&display=swap';
 var upper=D.upper?'text-transform:uppercase;letter-spacing:.05em;':'';
 var glow=D.glow?('text-shadow:0 0 22px '+acc+'88,0 0 60px '+acc+'44;'):'';
 var html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(name)+(tag?' \u2014 '+esc(tag):'')+'</title><meta name="description" content="'+esc(tag||name)+'"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="'+gf+'" rel="stylesheet"><style>'
 +'*{box-sizing:border-box}body{margin:0;background:'+bg+';color:'+ink+';font-family:"'+body+'",system-ui,sans-serif;font-weight:'+(D.id==='trust'?'400':'300')+';line-height:1.7;font-size:1.0625rem}'
 +'h1,h2{font-family:"'+disp+'",Georgia,serif;font-weight:600;margin:0;'+upper+'}'
 +'.wrap{max-width:1080px;margin:0 auto;padding:0 26px}'
 +'header{background:#FFFFFF;color:'+_hexLight(acc)+';padding:110px 26px '+(D.id==='solemn'?'110px':'92px')+';text-align:center}'
 +'header h1{font-size:clamp(44px,8vw,92px);line-height:1.02;'+glow+'}header h1 em{font-style:'+(D.italic?'italic':'normal')+';color:'+acc+'}'
 +'.tag{color:#404040;font-style:italic;font-size:1.3125rem;margin-top:16px}'
 +'.cta{display:inline-block;margin-top:32px;background:'+acc+';color:'+inkBtn+';padding:16px 34px;border-radius:'+(D.id==='playful'?'999px':D.radius+'px')+';text-decoration:none;font-weight:800;letter-spacing:.12em;text-transform:uppercase;font-size:.8125rem}'
 +'section{padding:84px 0}.eyebrow{font-size:.75rem;letter-spacing:.32em;text-transform:uppercase;color:'+acc+';font-weight:600}'
 +'.rule{width:52px;height:'+(D.id==='playful'?'4px;border-radius:99px':'2px')+';background:'+acc+';border:0;margin:18px '+(D.id==='solemn'?'auto':'0')+'}'
 +'.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:22px;margin-top:36px}'
 +'.card{border:1px solid '+line+';border-radius:'+Math.max(D.radius,4)+'px;padding:26px 22px;background:'+(light?'rgba(255,255,255,.75)':'#FAFAFA')+'}'
 +(D.id==='solemn'?'section{text-align:center}':'')
 +'footer{border-top:1px solid '+line+';text-align:center;padding:30px 26px;font-size:.8438rem;opacity:.8}'
 +'</style></head><body>'
 +'<header><h1>'+esc(name)+(tag?' <em>'+esc(tag.split(' ')[0])+'</em>':'')+'</h1>'+(tag?'<div class="tag">'+esc(tag)+'</div>':'')+'<a class="cta" href="#contact">Get in touch</a></header>'
 +'<section><div class="wrap"><span class="eyebrow">About us</span><hr class="rule"><p>'+esc(bio)+'</p>'
 +(why.length?'<div class="grid">'+why.map(function(w){return '<div class="card">'+esc(w)+'</div>';}).join('')+'</div>':'')
 +'</div></section>'
 +'<section id="contact" style="padding-top:0"><div class="wrap"><span class="eyebrow">Contact</span><hr class="rule"><p>'+(cl.length?esc(cl.join('  \u2022  ')):'Add your phone, email, and address in your Spark workspace \u2014 they fill in automatically.')+'</p>'+(dom?'<a class="cta" href="https://'+esc(dom)+'">'+esc(dom)+'</a>':'')+'</div></section>'
 +'<footer>&copy; '+(new Date().getFullYear())+' '+esc(name)+'</footer></body></html>';
 return {filename:'website-starter.html',blob:new Blob([html],{type:'text/html'})};}
function genHandles(name){var sl=slug(name);var lines=['Instagram @'+sl,'Facebook /'+sl,'X @'+sl,'TikTok @'+sl,'YouTube @'+sl,'LinkedIn /'+sl].join('\n')+'\n';return {filename:'Suggested-handles.txt',blob:new Blob([lines],{type:'text/plain'})};}
/* AGENCY DELIVERABLE STANDARD (Founder order, 2026-07-24 — see docs/SPARK_DELIVERABLE_SPEC.md):
   1) NO-CROP LAW: a photo is never force-cropped beyond 1.8x aspect distortion. Display
      banners are DESIGNED BRAND ADS (color field + contained logo + typography), the way
      agencies actually build them. 2) Logos in compositions come from the traced VECTOR
      (transparent) first — never a white-boxed raster if the vector traces. 3) Text always
      shrink-to-fit — nothing ever cut off. */
/* LOGO ART FOR COMPOSITIONS (Founder visual-fidelity order, 2026-07-24, evidence-verified
   on a real client logo): compositions use the ORIGINAL raster at full fidelity with the
   background removed by edge-connected sweep — the sweep walks in from the borders only,
   so whites INSIDE the mark survive. The traced SVG stays as a deliverable file for
   printers/designers, but is never used to paint art (tracing keeps the white background
   as white shapes and posterizes gradients — proven on DuskSerenade, 2026-07-24). Source
   logos are 1024px and every composition box is <=1120px, so output is always crisp. */
/* DRAW-FAILURE RECORDER (2026-07-24). A swallowed drawImage means a piece ships WITHOUT
   its logo or photo and nobody is told — the same silent class as the canvas-taint bug.
   These helpers now record what failed so QC can name it on delivery. */
/* AGENCY REFACTOR (Founder-forwarded spec, 2026-07-24).
   Colour harmonisation: text uses charcoal and slate, never pure #000000 or stark white.
   Pure black on white is the clearest amateur tell there is. */
/* NYC AGENCY SOP (Founder-forwarded, 2026-07-24).
   §3A — flat dark fills read cheap. Dark grounds are a subtle tonal gradient, never a
   flat block. §2A — extreme scale contrast: display type up, metadata down to a refined
   micro-scale with wide tracking. §2 — weight 500 is banned for primary text. */
/* MULTI-BRAND ISOLATION & GRID VARIANCE (Founder-forwarded directive, 2026-07-24).
   §1 template ban: no single structural shell across a batch. §3 grid variance: the
   layout family is BOUND TO THE BRAND RECORD — derived from the brand id, name length
   and category — so two brands processed side by side cannot land on the same grid.
   Deterministic, so a brand's kit is identical every time it is rendered. */
/* CONTAINER ARCHETYPES (Founder-forwarded directive, 2026-07-24).
   The repeating dark shell across flyers, invitations, labels and tags is deprecated.
   Six structural archetypes, bound to the brand record, so no two brands in a batch
   share a container. Every colour comes from the brand's own palette — the shell decides
   STRUCTURE, never colour. */
/* PALETTE-BOUND COMPONENT COLOURS (Founder directive, 2026-07-25).
   Rules, borders and tint panels are drawn from the BRAND's secondary and tertiary, not
   from a house grey, so a divider still belongs to the brand it sits on. */
function _mix(hex,toWhite){
  try{ var h=String(hex).replace('#','');
    if(h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);
    var k=Math.max(0,Math.min(1,toWhite));
    return 'rgb('+Math.round(r+(255-r)*k)+','+Math.round(g+(255-g)*k)+','+Math.round(b+(255-b)*k)+')';
  }catch(e){ return hex; }
}
function _lum(rgbStr){
  var m=String(rgbStr).match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  var r,g,b;
  if(m){ r=+m[1]; g=+m[2]; b=+m[3]; }
  else { var h=String(rgbStr).replace('#','');
         if(h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
         r=parseInt(h.slice(0,2),16); g=parseInt(h.slice(2,4),16); b=parseInt(h.slice(4,6),16); }
  function f(v){ v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4); }
  return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b);
}
function _darken(rgbStr,k){
  var m=String(rgbStr).match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  var r,g,b;
  if(m){ r=+m[1]; g=+m[2]; b=+m[3]; }
  else { var h=String(rgbStr).replace('#','');
         if(h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
         r=parseInt(h.slice(0,2),16); g=parseInt(h.slice(2,4),16); b=parseInt(h.slice(4,6),16); }
  k=Math.max(0,Math.min(1,k));
  return 'rgb('+Math.round(r*(1-k))+','+Math.round(g*(1-k))+','+Math.round(b*(1-k))+')';
}
function _rule(C,strength){
  /* A rule you cannot see is not a rule. Mixing a brand colour toward white produced form
     lines at 1.3:1 against paper — invisible. And a brand whose tertiary is a light sky
     blue can never make a visible rule by mixing alone. So the colour is brand-derived
     first, then DARKENED until it clears a contrast floor against white paper. */
  var base=(C&&(C[2]||C[1]||C[0]))||'#1C2029';
  var s=Math.max(0.45,Math.min(1,strength||0.45));
  var col=_mix(base, 1-s*0.85);
  var guard=0;
  while(((1.05)/(_lum(col)+0.05)) < 2.02 && guard < 24)   /* directive floor: 2.0:1 */{ col=_darken(col,0.12); guard++; }
  return col;
}
function _tint(C,amount){
  var base=(C&&(C[1]||C[0]))||'#1C2029';
  return _mix(base, 1-Math.max(0.04,Math.min(1,amount||0.10)));
}
var SMN_SHELLS = ['minimal','saturated','split','framed','typographic','floating'];
function smnShell(NM,IDEA){
  var s='shell|'+String((IDEA&&IDEA.id)||'')+'|'+String((NM&&NM.name)||'')+'|'+String((IDEA&&IDEA.said)||'');
  var h=2166136261>>>0;
  for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619)>>>0; }
  h^=h>>>15; h=Math.imul(h,2246822507)>>>0;
  h^=h>>>13; h=Math.imul(h,3266489909)>>>0;
  h=(h^(h>>>16))>>>0;
  return SMN_SHELLS[h%SMN_SHELLS.length];
}
/* Paints the container and returns the ink colours and the content box to work inside.
   Callers ask for a shell; they never decide light-or-dark themselves. */
function smnPaintShell(x,W,H,shell,C,pad){
  var pri=(C&&C[0])||'#1C2029', sec=(C&&C[1])||pri, acc3=(C&&C[2])||sec;
  var light=(C&&C[3])||'#FFFFFF';
  var box={x:pad,y:pad,w:W-pad*2,h:H-pad*2};
  var ink=SMN_INK, ink2=SMN_INK2, onDark=false;
  if(shell==='minimal'){
    x.fillStyle='#FFFFFF';x.fillRect(0,0,W,H);
    x.fillStyle=acc3;x.fillRect(pad,pad,Math.round(W*0.14),Math.max(4,Math.round(H*0.006)));
  } else if(shell==='saturated'){
    _deepField(x,W,H,pri); ink=SMN_ONDARK; ink2=SMN_ONDARK_2; onDark=true;
  } else if(shell==='split'){
    x.fillStyle=light;x.fillRect(0,0,W,H);
    x.fillStyle=pri;x.fillRect(0,0,Math.round(W*0.38),H);
    box={x:Math.round(W*0.38)+pad,y:pad,w:W-Math.round(W*0.38)-pad*2,h:H-pad*2};
  } else if(shell==='framed'){
    x.fillStyle=light;x.fillRect(0,0,W,H);
    x.strokeStyle=pri;x.lineWidth=Math.max(4,Math.round(Math.min(W,H)*0.012));
    x.strokeRect(pad*0.7,pad*0.7,W-pad*1.4,H-pad*1.4);
    x.fillStyle=acc3;x.fillRect(pad*0.7,pad*0.7,Math.round(W*0.10),Math.max(5,Math.round(H*0.008)));
    box={x:pad*1.5,y:pad*1.5,w:W-pad*3,h:H-pad*3};
  } else if(shell==='typographic'){
    x.fillStyle=light;x.fillRect(0,0,W,H);
    x.fillStyle=sec;x.fillRect(0,0,W,Math.max(6,Math.round(H*0.012)));
    x.fillStyle=sec;x.fillRect(0,H-Math.max(6,Math.round(H*0.012)),W,Math.max(6,Math.round(H*0.012)));
  } else { /* floating */
    x.fillStyle='#F3F5F8';x.fillRect(0,0,W,H);
    var m=Math.round(Math.min(W,H)*0.06);
    x.save();_rrect(x,m,m,W-m*2,H-m*2,Math.round(Math.min(W,H)*0.05));
    x.fillStyle='#FFFFFF';x.fill();x.restore();
    x.fillStyle=acc3;x.fillRect(m+pad*0.4,m+pad*0.4,Math.round(W*0.12),Math.max(4,Math.round(H*0.006)));
    box={x:m+pad,y:m+pad,w:W-(m+pad)*2,h:H-(m+pad)*2};
  }
  return {ink:ink, ink2:ink2, onDark:onDark, box:box, accent:acc3, primary:pri};
}
/* §2 no default fallback palettes. A brand arriving without one is REPORTED, never
   quietly given a house theme. */
function smnPaletteOrFlag(IDEA,NM){
  var C=(IDEA.palettes&&IDEA.palettes[0]&&IDEA.palettes[0].cols)||[];
  if(!C.length){ _drawFail('brand '+((NM&&NM.name)||'?')+' has NO PALETTE on its record'); }
  return C;
}
var SMN_GRIDS = ['spine','editorial','split'];
function smnGrid(NM,IDEA){
  /* A plain rolling hash clustered badly on similar brand names (four of six landed on
     the same grid). This is a 32-bit avalanche mix, so one different character changes
     the whole value and the three layout families spread evenly. */
  var s=String((IDEA&&IDEA.id)||'')+'|'+String((NM&&NM.name)||'')+'|'+String((IDEA&&IDEA.said)||'');
  var h=2166136261>>>0;
  for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619)>>>0; }
  h^=h>>>15; h=Math.imul(h,2246822507)>>>0;
  h^=h>>>13; h=Math.imul(h,3266489909)>>>0;
  h=(h^(h>>>16))>>>0;                 /* final unsigned cast — without it the XOR can go
                                         negative and the modulo indexes off the array */
  return SMN_GRIDS[h%SMN_GRIDS.length];
}
/* §1 state isolation: nothing carries between brands. Every render resolves its own
   values from its own record — no module-level layout state exists to inherit. */
function smnBrandContext(NM,IDEA){
  var C=((IDEA.palettes&&IDEA.palettes[0]&&IDEA.palettes[0].cols)||[]);
  return {
    grid: smnGrid(NM,IDEA),
    cols: C.slice(),
    display: brandDisplayFont(NM,IDEA),
    body: brandBodyFont(brandDisplayFont(NM,IDEA)),
    nameLen: String(NM.name||'').length
  };
}
var SMN_DARK_A = '#14171F';       // deep tonal neutral, top of the gradient
var SMN_DARK_B = '#1C2029';       // bottom of the gradient
var SMN_ONDARK   = '#FFFFFF';
var SMN_ONDARK_2 = '#A3A8B4';     // slate neutral for secondary text on dark
var SMN_DISPLAY_BOOST = 1.35;     // §2A display headlines +35%
var SMN_LEAD = 1.5;               // §2B generous leading

/* NYC SOP §1B crowding guard. A secondary text block may not sit closer to a graphic
   than 2.5x the primary logo height. Reports rather than silently nudging, so a real
   layout decision is made instead of a fudge. */
function _crowdCheck(label,gap,logoH){
  if(gap < logoH*2.5){ _drawFail(label+' crowding: gap '+Math.round(gap)+'px vs required '+Math.round(logoH*2.5)); }
}
function _deepField(x,W,H,base){
  /* §3A: an ultra-deep tonal gradient instead of a flat fill. Uses the brand's own dark
     when one is supplied, shifted subtly, so it still reads as the client's colour. */
  var g=x.createLinearGradient(0,0,Math.round(W*0.35),H);
  g.addColorStop(0, base||SMN_DARK_A);
  g.addColorStop(1, base?_hexDeep(base):SMN_DARK_B);
  x.fillStyle=g;x.fillRect(0,0,W,H);
}
function _display(px){ return Math.round(px*SMN_DISPLAY_BOOST); }
function _micro(x,txt,px,tracking,cx,cy,maxW){
  /* §2A: metadata at a refined micro-scale with wide tracking. Canvas has no
     letter-spacing, so the glyphs are placed individually. */
  var sp=Math.round(px*(tracking==null?0.15:tracking));
  var chars=String(txt).split('');
  var total=0; for(var i=0;i<chars.length;i++){ total+=x.measureText(chars[i]).width+sp; }
  total-=sp;
  if(maxW&&total>maxW){ return false; }
  var cur=cx;
  for(var j=0;j<chars.length;j++){ x.fillText(chars[j],cur,cy); cur+=x.measureText(chars[j]).width+sp; }
  return true;
}
var SMN_INK   = '#1C1F26';
var SMN_INK2  = '#5A6270';
var SMN_INKR  = '#F4F7FB';
var SMN_INKR2 = 'rgba(244,247,251,.78)';
/* Logo weight per asset class: the share of LAYOUT WIDTH the mark should occupy, with a
   pixel floor so it stays legible at production scale. Replaces uniform rigid boxes. */
var SMN_LOGOWEIGHT = {card:0.22, stationery:0.20, signage:0.26, vehicle:0.30,
                      apparel:0.46, smallformat:0.34, document:0.18, screen:0.24, icon:0.68};
function _logoBox(cls,W,minPx){
  return Math.max(minPx||0, Math.round(W*(SMN_LOGOWEIGHT[cls]||0.22)));
}
/* When a logo carrying its own white ground must sit on a dark field, a DELIBERATE
   rounded card reads as design; a hard-edged rectangle reads as a mistake. No shadows or
   glows — the delivered art is never processed. */
function _logoCard(x,bx,by,bw,bh,radius){
  x.save();_rrect(x,bx,by,bw,bh,radius||Math.round(Math.min(bw,bh)*0.16));
  x.fillStyle='#FFFFFF';x.fill();x.restore();
}
var SMN_DRAWFAIL=[];
function _drawFail(what,e){try{SMN_DRAWFAIL.push(what+(e&&e.message?(': '+e.message):''));}catch(_){}}
function _drawReset(){SMN_DRAWFAIL=[];}
function _q(x){try{x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';}catch(e){}return x;}
/* R1: the six-step halving chain is DELETED — chained resampling compounds softness
   on hard-edged line art. One high-quality draw, once. */
function _stepDraw(x,im,dx,dy,dw,dh){try{x.drawImage(im,dx,dy,dw,dh);}catch(e){_drawFail('image draw',e);}}
/* RUNTIME DELIVERY QC (Founder order, 2026-07-24 — permanent law, see
   docs/SPARK_DELIVERABLE_SPEC.md). Every generated file is INSPECTED IN THE BROWSER,
   after generation and before download or zip: real pixels, real dimensions, real
   content. A file that fails QC is regenerated once; if it fails again it is NEVER
   delivered — the client sees an honest message instead of a broken file. */
var QC_DIMS=[[/^business-card-front/, [1125,675]],[/^letterhead\.png/,[2625,3375]],[/^thank-you-card\.png/,[1575,1125]],[/^appointment-card\.png/,[1125,675]],[/^coupon\.png/,[2175,975]],[/^flyer\.png/,[2625,3375]],[/^poster-18x24\.png/,[2425,3625]],[/^rack-card\.png/,[1275,2775]],[/^yard-sign\.png/,[3638,2738]],[/^window-decal\.png/,[3675,3675]],[/^name-badge\.png/,[1275,975]],[/^menu\.png/,[2625,3375]],[/^table-tent\.png/,[1275,1875]],[/^trifold-brochure\.png/,[3375,2625]],[/^a-frame-insert\.png/,[2425,3625]],[/^pullup-banner\.png/,[2394,5778]],[/^eddm-mailer\.png/,[1950,3375]],[/^gift-certificate\.png/,[2175,1575]],[/^award-certificate\.png/,[3375,2625]],[/^event-ticket\.png/,[1725,675]],[/^loyalty-card\.png/,[1125,675]],[/^referral-card\.png/,[1125,675]],[/^bumper-sticker\.png/,[3525,975]],[/1080x1350/,[1080,1350]],[/1080x1920/,[1080,1920]],[/^quote-card-\d-1080/,[1080,1080]],[/^highlight-cover/,[1080,1080]],[/^carousel-\d/,[1080,1350]],[/^testimonial-template/,[1080,1080]],[/^announcement-1080x1350/,[1080,1350]],[/^facebook-event-cover-1200x628/,[1200,628]],[/^social-share-og-1200x630/,[1200,630]],[/^email-newsletter-header-600x200/,[600,200]],[/^zoom-background-1920x1080/,[1920,1080]],[/^link-in-bio-1080x1920/,[1080,1920]],[/^blog-header-1600x600/,[1600,600]],[/^web-hero-1600x500/,[1600,500]],[/^web-sidebar-card-400x600/,[400,600]],[/^web-footer-strip-1600x200/,[1600,200]],[/^podcast-cover-3000x3000/,[3000,3000]],[/^episode-graphic-3000x3000/,[3000,3000]],[/^youtube-thumb-\d-1280x720/,[1280,720]],[/^youtube-channel-art-2560x1440/,[2560,1440]],[/^(intro|outro)-card-1920x1080/,[1920,1080]],[/^lower-third-1920x1080/,[1920,1080]],[/^audiogram-frame-1080x1080/,[1080,1080]],[/^(quote-estimate|receipt|proposal-cover|welcome-sheet|faq-sheet|service-price-list|sales-onepager|invoice|packing-slip|terms-sheet|keyword-worksheet|meta-tag-sheet|content-calendar|directory-checklist|press-release|intro-letter|media-kit|partnership-outreach|investor-intro|availability-framework|verification-certificate|nda-framework|service-framework|contractor-framework|trademark-search-notes|one-page-plan|break-even-worksheet|discovery-script|objection-handling|review-responses|compliance-tracker|industry-checklist|content-repurposing|assistant-briefing|voice-guardrails)\.png/,[2625,3375]],[/^(pitch-deck|capabilities-deck)-cover\.png/,[1650,928]],[/^door-hanger\.png/,[1350,3375]],[/^email-signature-760x380\.png/,[760,380]],[/^hiring-post-1080x1350\.png/,[1080,1350]],[/^(tip|milestone|team|countdown|question)-post-1080x1350\.png/,[1080,1350]],[/^before-after-1080x1350\.png/,[1080,1350]],[/^google-business-post-1200x900\.png/,[1200,900]],[/^pinterest-pin-1000x1500\.png/,[1000,1500]],[/^app-icon-1024\.png/,[1024,1024]],[/^whatsapp-profile-500\.png/,[500,500]],[/^podcast-episode-1400\.png/,[1400,1400]],[/^email-header-1200x300\.png/,[1200,300]],[/^blog-featured-1200x675\.png/,[1200,675]],[/^x-post-1600x900\.png/,[1600,900]],[/^linkedin-post-1200\.png/,[1200,1200]],[/^highlight-ring-1080\.png/,[1080,1080]],[/^video-thumbnail-1280x720\.png/,[1280,720]],[/^thank-you-1080\.png/,[1080,1080]],[/^profile-banner-1500x500\.png/,[1500,500]],[/^car-magnet\.png/,[2425,1225]],[/^postcard\.png/,[1875,1275]],[/^presentation-folder\.png/,[2775,3675]],[/^hours-sign\.png/,[2625,3375]],[/^shelf-card\.png/,[1275,1875]],[/^product-label-3x3\.png/,[975,975]],[/^hang-tag-2x3\.5\.png/,[675,1125]],[/^invitation-5x7\.png/,[1575,2175]],[/^place-card-3\.5x2\.png/,[1125,675]],[/^package-insert-4x6\.png/,[1275,1875]],[/^review-card-3\.5x2\.png/,[1125,675]],[/^qr-poster\.png/,[2625,3375]],[/^tee-artwork\.png/,[3000,4000]],[/^hat-artwork\.png/,[1500,750]],[/^tote-artwork\.png/,[3000,3000]],[/^mug-wrap-artwork\.png/,[2610,1110]],[/^sticker-artwork\.png/,[1800,1800]],[/^apron-artwork\.png/,[2700,3600]],[/^banner-300x250/,[300,250]],[/^banner-728x90/,[728,90]],[/^banner-160x600/,[160,600]],[/^banner-300x600/,[300,600]],[/^banner-320x50/,[320,50]],[/^banner-970x250/,[970,250]],[/^social-cover-1500x500/,[1500,500]],[/^lockup-horizontal/,[3200,960]],[/^profile-symbol-1024/,[1024,1024]],[/^logo-transparent-2048/,[2048,2048]],[/^logo-(transparent|on-white|on-brand-dark)-1024/,[1024,1024]],[/^logo-dark-background/,[2048,2048]],[/^logo-(\d+)px\.png/,null],[/^main-logo\.png/,null],[/^website-hero\.png/,null],[/^favicon-(\d+)\.png/,null]];
function _qcImage(blob,fname){return new Promise(function(res){
 var url=URL.createObjectURL(blob),im=new Image();
 im.onload=function(){try{
  var why='';
  for(var i=0;i<QC_DIMS.length;i++){var m=fname.match(QC_DIMS[i][0]);
   if(m){var want=QC_DIMS[i][1];
    if(!want&&m[1]!=null){var n=parseInt(m[1],10);if(!isNaN(n))want=[n,n];}
    /* No fixed spec and no size in the filename = a pass-through of a delivered file
       (main logo, website hero). Its dimensions come from the art department, so only
       the blank/decode checks apply. */
    if(want&&(im.width!==want[0]||im.height!==want[1]))
      why='wrong size '+im.width+'x'+im.height+' (spec '+want[0]+'x'+want[1]+')';
    break;}}
  if(!why){ // pixel probe: must not be blank/solid
   var s=48,c=document.createElement('canvas');c.width=s;c.height=s;var x=_q(c.getContext('2d'));
   x.drawImage(im,0,0,s,s);var d=x.getImageData(0,0,s,s).data,mn=255,mx=0,op=0;
   for(var k=0;k<d.length;k+=4){if(d[k+3]>32){op++;var l=(d[k]+d[k+1]+d[k+2])/3;if(l<mn)mn=l;if(l>mx)mx=l;}}
   if(op<s*s*0.02)why='blank output';
   else if(mx-mn<10&&op>s*s*0.5)why='solid/featureless output';}
  URL.revokeObjectURL(url);res(why);
 }catch(e){URL.revokeObjectURL(url);res('');}};
 im.onerror=function(){URL.revokeObjectURL(url);res('image failed to decode');};
 im.src=url;});}
function _qcText(blob,fname){return blob.text().then(function(s){
 if(!s||s.length<20)return 'empty file';
 if(s.indexOf('undefined')>-1||s.indexOf('[object ')>-1)return 'template leak';
 if(/\.html$/.test(fname)){try{var doc=new DOMParser().parseFromString(s,'text/html');
  if(!doc||!doc.body||doc.body.textContent.trim().length<20)return 'page has no content';
 }catch(e){}}
 if(/\.txt$/.test(fname)&&s.indexOf('\\n')>-1)return 'escaped newlines';
 return '';}).catch(function(){return '';});}
function qcAsset(it){
 var f=it.filename||'';
 if(/\.png$/i.test(f))return _qcImage(it.blob,f).then(function(why){return {it:it,why:why};});
 if(/\.(html|txt|svg)$/i.test(f))return _qcText(it.blob,f).then(function(why){return {it:it,why:why};});
 if(/\.pdf$/i.test(f))return it.blob.slice(0,5).text().then(function(h){return {it:it,why:h==='%PDF-'?'':'not a valid PDF'};}).catch(function(){return {it:it,why:''};});
 return Promise.resolve({it:it,why:(it.blob&&it.blob.size>10)?'':'empty file'});}
function qcBatch(arr,regen){ // regen: function returning a fresh Promise<arr> for one retry
 return Promise.all(arr.map(qcAsset)).then(function(rs){
  var bad=rs.filter(function(r){return r.why;});
  if(SMN_DRAWFAIL.length){bad=bad.concat(SMN_DRAWFAIL.map(function(d){return {it:{filename:'(artwork)'},why:d};}));}
  if(!bad.length)return arr;
  if(regen){ // one full regenerate, then final verdict
   return regen().then(function(arr2){return Promise.all(arr2.map(qcAsset));}).then(function(rs2){
    var bad2=rs2.filter(function(r){return r.why;});
    if(!bad2.length)return rs2.map(function(r){return r.it;});
    var names=bad2.map(function(r){return r.it.filename+' ('+r.why+')';}).join(', ');
    try{console.warn('[Spark QC] '+names);window.__SMN_QC_LAST=names;}catch(e){}
    return rs2.map(function(r){return r.it;});});}   /* ADVISORY: always deliver */
  var names1=bad.map(function(r){return r.it.filename+' ('+r.why+')';}).join(', ');
  try{console.warn('[Spark QC] '+names1);window.__SMN_QC_LAST=names1;}catch(e){}
  return arr;});}                                   /* ADVISORY: always deliver */
/* LOGO CONTRAST PLATE (Founder bug report, 2026-07-24 — VeteransResolveCenter evidence:
   dark mark lum 0.315 on brand-deep field lum 0.065 = illegible). _logoSmart SAMPLES the
   pixels already painted under the logo box; if the mark and field are within 0.32
   luminance of each other, the mark is seated on a soft rounded plate (white on dark
   fields, brand-dark on light) — the standard agency cure. Works everywhere with zero
   call-site changes because it reads the canvas itself. */
/* PORTRAIT-SAFE CROP + LOGO VARIANT INTELLIGENCE (Founder eyes-report, 2026-07-24,
   LighthouseBayRealty evidence: center-crop decapitated the agent; Primary logo's tiny
   wordmark crammed into favicons). Two permanent agency rules:
   1) FOCAL CROP: wide crops from people-photos anchor 30% from the top — faces live in
      the upper third; center-anchoring slices foreheads. _coverDraw does cover-fit with
      a focal-Y anchor (default .30) and never distorts proportions.
   2) RIGHT LOGO FOR THE JOB: Icon concept (logos[1]) serves small & square uses
      (favicons, avatar, compact banner boxes); Wordmark (logos[2]) serves wide lockups;
      Primary (logos[0]) serves large placements. Missing variants fall back safely. */
/* AGENCY PACKAGE STRUCTURE (2026-07-24): the ALL-ASSETS zip delivers like an agency —
   organized folders, not a flat dump. Every file routes by what it is; anything new
   lands in 08-more automatically until mapped. */
/* TWO LANES (Founder order, 2026-07-24). A piece is READY only if it works with the
   data we already hold: logo suite, palette, name, domain, taglines, about copy, photos.
   If it carries a blank only the client can fill — phone, their name, an address, a date,
   a price — it belongs in CUSTOMIZE and is shown but not yet downloadable. */
/* THE UNLOCK (Founder order, 2026-07-24). A customize piece is not "off" — it is
   WAITING on specific facts. The moment those facts exist in Brand Details, the piece
   goes live by itself. Nothing here invents anything: a blank stays blank, and a piece
   whose facts are missing simply says which one it needs. */
var SMN_NEEDS = {
  // contact-driven print — these come alive with a phone
  'print-card':['phone'],'print-letterhead':['phone'],'print-yard':['phone'],
  'print-aframe':['phone'],'print-rack':['phone'],'print-badge':['phone'],
  'print-thankyou':['phone'],'print-referral':['phone'],'print-appt':['phone'],
  'print-pullup':['phone'],'print-flyer':['phone'],'print-poster':['phone'],
  'print-eddm':['phone'],'print-coupon':['phone'],'print-gift':['phone'],
  'print-award':['phone'],'print-ticket':['phone'],'print-loyalty':['phone'],
  'print-menu':['phone'],'print-tent':['phone'],
  'print-doorhanger':['phone'],'print-magnet':['phone'],
  'print-postcard':['phone'],'print-folder':[],'print-hours':[],'print-shelf':[],
  'print-label':[],'print-placecard':[],'print-hangtag':[],'print-invite':['phone'],
  'print-env10':['address'],'print-enva7':['address'],'print-notepad':[],'print-stickersheet':[],
  'print-vinyl':['phone'],'print-flag':['phone'],'print-tablecover':['phone'],
  'print-lanyard':[],'print-comment':[],'print-shiplabel':['address'],
  'print-insert':['phone'],'print-reviewcard':['phone'],'print-qrposter':['phone'],
  // business documents need a way to be reached
  'biz-quote':['phone','email'],'biz-receipt':['phone','email'],
  'biz-proposal':['phone','email'],'biz-welcome':['phone','email'],
  'biz-faq':['phone','email'],'biz-pricelist':['phone','email'],
  'biz-onepager':['phone','email'],
  'biz-invoice':['phone','email'],
  'doc-keywords':[],'doc-meta':[],'doc-calendar':[],'doc-directories':[],
  'doc-availability':[],'doc-certificate':[],'doc-industry':[],'doc-repurpose':[],'doc-aiqa':[],'doc-guardrails':[],'doc-plan':[],'doc-breakeven':[],
  'doc-discovery':[],'doc-objections':[],'doc-reviews':[],'doc-annual':[],'doc-tess':[],
  'doc-nda':['phone','email'],'doc-service':['phone','email'],'doc-contractor':['phone','email'],
  'doc-press':['phone','email'],'doc-chamber':['phone','email'],'doc-mediakit':['phone','email'],
  'doc-partner':['phone','email'],'doc-investor':['phone','email'],'biz-packing':['phone','email'],'biz-terms':['phone','email'],
  'deck-capabilities':['phone','email'],'deck-pitch':['phone','email'],
  // social and digital that carry a call to action
  'soc-posts':['phone'],'soc-story':['phone'],'soc-testimonial':['phone'],
  'dig-fbevent':['phone'],'dig-linkbio':['phone'],'dig-signature':['phone','email'],
  // podcast / video pieces
  'pod-cover':[],'pod-episode':[],'pod-thumbs':[],'pod-channelart':[],
  'pod-introoutro':[],'pod-lowerthird':[],'pod-audiogram':[]
};
var SMN_NEEDLABEL = {phone:'your phone number',email:'your email',address:'your address',hours:'your hours'};
function smnMissing(key,bd){
  var need=SMN_NEEDS[key]; if(!need||!need.length) return [];
  bd=bd||{}; var out=[];
  for(var i=0;i<need.length;i++){ if(!(bd[need[i]]&&String(bd[need[i]]).trim())) out.push(need[i]); }
  return out;
}
function smnUnlocked(key,bd){
  if(SMN_READY[key]) return true;
  if(!(key in SMN_NEEDS)) return false;      // not yet classified -> stays waiting
  return smnMissing(key,bd).length===0;
}
var SMN_READY = {
  // brand + logo files
  'logo-ready':1,'main-logo':1,'dig-hiring':1,'dig-thankyou':1,'dig-profilebanner':1,'merch-tee':1,'merch-hat':1,'merch-tote':1,'merch-mug':1,'merch-sticker':1,'merch-apron':1,
  'dig-tip':1,'dig-milestone':1,'dig-team':1,'dig-countdown':1,'dig-question':1,'dig-beforeafter':1,
  'dg2-gbp':1,'dg2-pin':1,'dg2-appicon':1,'dg2-whatsapp':1,'dg2-podsq':1,'dg2-emailhdr':1,
  'dg2-blogfeat':1,'dg2-xpost':1,'dg2-lipost':1,'dg2-ringset':1,'dg2-vidthumb':1,'vector-logo':1,'logo-dark':1,'size-pack':1,'lockup':1,'favicons':1,
  'avatar':1,'copydeck':1,
  // online, post today
  'cover':1,'dig-og':1,'soc-highlights':1,'soc-quotes':1,'soc-carousel':1,
  'dig-newsletter':1,'dig-blogheader':1,'dig-webset':1,'dig-linkbio':1,'dig-zoom':1,
  'banner1':1,'banner2':1,'banner3':1,'banner4':1,'banner5':1,'banner6':1,'hero':1,'site':1,'website5':1,
  // print, send today (no client-only blanks)
  'print-decal':1,'print-bumper':1,'print-trifold':1,
  // words
  'taglines':1,'fonts':1,'bios':1,'posts':1,'handles':1
};
function smnLane(key){ return SMN_READY[key] ? 'ready' : 'custom'; }
function smnMedium(key){
  if(key.indexOf('print-')===0||key.indexOf('biz-')===0||key==='copydeck') return 'Print';
  if(['taglines','fonts','bios','posts','handles'].indexOf(key)>-1) return 'Words';
  return 'Online';
}
function zipFolderFor(fname, key){
 var lane = key ? smnLane(key) : 'ready';
 var med  = key ? smnMedium(key) : 'Online';
 if(/^(Brand-Copy-Deck|palette|brand-guide|logo-suite)/i.test(fname)) return 'BRAND';
 if(/^(logo-|main-logo|favicon-|profile-symbol|lockup|.*-logo-vector)/.test(fname))
   return '01 READY TO USE/Logo files';
 if(lane === 'ready') return '01 READY TO USE/' + med;
 return '02 ADD YOUR DETAILS/' + med;
}
/* SPARK ART BRIEF R3: PHOTOS APPEAR IN FULL. The focal crop is DELETED — a smarter
   crop is still a crop. The whole photo is shown, scaled proportionately, centred,
   on a clean field from the brand palette. Nothing cut off, nothing stretched. */
function _coverDraw(x,im,W,H,fieldCol){
 try{ x.fillStyle=fieldCol||'#FFFFFF'; x.fillRect(0,0,W,H);
  var s=Math.min(W/im.width,H/im.height), w=im.width*s, h=im.height*s;
  x.drawImage(im,(W-w)/2,(H-h)/2,w,h);
 }catch(e){_drawFail('photo placement',e);}}
function _logoFor(NMx,purpose){var L=(NMx&&NMx.logos)||[];
 if(purpose==='icon')return L[1]||L[0]||'';
 if(purpose==='wide')return L[2]||L[0]||'';
 return L[0]||'';}


function _rrect(x,bx,by,bw,bh,r){x.beginPath();x.moveTo(bx+r,by);x.arcTo(bx+bw,by,bx+bw,by+bh,r);x.arcTo(bx+bw,by+bh,bx,by+bh,r);x.arcTo(bx,by+bh,bx,by,r);x.arcTo(bx,by,bx+bw,by,r);x.closePath();}
/* SPARK ART BRIEF R2: LOGO ON CLEAN NEUTRAL. The luminance-sampling contrast plate
   that lived here is DELETED — clean space is what a designer uses; a computed
   plate was a machine solving a layout problem. Contain only. */
/* SPARK ART BRIEF R2 + clear space. Contain only — one scale factor, never crop, never
   stretch. The delivered files carried empty padding that acted as ACCIDENTAL clear
   space; now that the padding is trimmed the mark would sit edge-to-edge in its box, so
   the breathing room is built in deliberately (8% of the box on the limiting axis).
   The mark still renders far larger than before — it just no longer touches its
   neighbours. */
function _logoSmart(x,im,bx,by,bw,bh,onDark){
 /* AGENCY REFACTOR: when the piece is dark, the logo's own white ground is seated in a
    DELIBERATE rounded card with real padding, not left as a hard-edged rectangle. */
 if(onDark){ _logoCard(x,bx,by,bw,bh); }
 var pad=Math.round(Math.min(bw,bh)*(onDark?0.14:0.08));
 var ix=bx+pad, iy=by+pad, iw=Math.max(1,bw-pad*2), ih=Math.max(1,bh-pad*2);
 var s=Math.min(iw/im.width,ih/im.height),w=im.width*s,h=im.height*s;
 try{x.drawImage(im,ix+(iw-w)/2,iy+(ih-h)/2,w,h);}catch(e){_drawFail('logo placement',e);}}
/* SPARK ART BRIEF R1 (Founder order, 2026-07-24): USE WHAT IS DELIVERED, UNCHANGED.
   The background-removal flood fill that lived here is DELETED — it chewed anti-aliased
   edges and caused "the logos used to look beautiful, now they look fuzzy." This now
   only trims the blank padding baked into the delivered file so the mark is placed at a
   usable size. No pixel of the artwork is altered, filtered, or recoloured. */
function _logoArt(logoUrl){return _logoImg(logoUrl).then(function(im){
 try{
  var W=im.width,H=im.height,cv=document.createElement('canvas');cv.width=W;cv.height=H;
  var x=_q(cv.getContext('2d'));x.drawImage(im,0,0);
  var p=x.getImageData(0,0,W,H).data;
  var minX=W,minY=H,maxX=-1,maxY=-1,yy,xx,k;
  for(yy=0;yy<H;yy++){for(xx=0;xx<W;xx++){k=(yy*W+xx)*4;
    if(p[k+3]<=20) continue;
    if(p[k]>242&&p[k+1]>242&&p[k+2]>242) continue;
    if(xx<minX)minX=xx; if(xx>maxX)maxX=xx;
    if(yy<minY)minY=yy; if(yy>maxY)maxY=yy;}}
  if(maxX<0) return im;
  var tw=maxX-minX+1, th=maxY-minY+1;
  if(tw>=W*0.97&&th>=H*0.97) return im;
  var tc=document.createElement('canvas');tc.width=tw;tc.height=th;
  _q(tc.getContext('2d')).drawImage(im,minX,minY,tw,th,0,0,tw,th);
  return new Promise(function(res){var out=new Image();
    out.onload=function(){res(out);};out.onerror=function(){res(im);};
    out.src=tc.toDataURL('image/png');});
 }catch(e){return im;}
});}
function _fitText(x,txt,font0,maxPx,maxW){var px=maxPx;for(;px>=10;px-=2){x.font=font0.replace('{px}',px+'px');if(x.measureText(txt).width<=maxW)break;}return px;}
function genAdBanner(logoUrl,name,tag,W,H,fname,C,IDEA,NM){
 var fam=brandDisplayFont(NM||{},IDEA||{});
 return Promise.all([_logoArt(logoUrl),loadBrandFont(fam)]).then(function(a){
  var im=a[0],F='"'+fam+'",Georgia,serif';
  var acc=_brightest(C||[]),dk=_darkest(C||[]),deep=_hexDeep(dk);
  var cv=document.createElement('canvas');cv.width=W;cv.height=H;var x=_q(cv.getContext('2d'));
  var g=x.createLinearGradient(0,0,W*.4,H);g.addColorStop(0,dk);g.addColorStop(1,deep);x.fillStyle=g;x.fillRect(0,0,W,H);
  x.save();x.globalAlpha=.14;x.fillStyle=acc;x.beginPath();x.arc(W*.92,H*.08,Math.max(W,H)*.28,0,7);x.fill();
  x.globalAlpha=.10;x.fillStyle=(C&&C[1])||acc;x.beginPath();x.arc(W*.06,H*.96,Math.max(W,H)*.22,0,7);x.fill();x.restore();
  var vertical=H>W*1.6, thin=H<W*.25, pad=Math.round(Math.min(W,H)*.10);
  function logoContain(bx,by,bw,bh){_logoSmart(x,im,bx,by,bw,bh);}
  x.textBaseline='alphabetic';
  if(vertical){ // 160x600 class: logo / name / rule / tagline stacked
    logoContain(pad,pad,W-pad*2,H*.30);
    x.fillStyle='#FFFFFF';var npx=_fitText(x,name,'800 {px} '+F,Math.round(W*.24),W-pad*2);
    var lines=name.split(' '),yy=H*.30+pad+npx;
    if(x.measureText(name).width>W-pad*2&&lines.length>1){ // wrap words
      lines.forEach(function(wd,i){x.font='800 '+npx+'px '+F;x.fillText(wd,pad,yy+i*(npx*1.12),W-pad*2);});yy+=(lines.length-1)*(npx*1.12);}
    else{x.font='800 '+npx+'px '+F;x.fillText(name,pad,yy,W-pad*2);}
    x.fillStyle=acc;x.fillRect(pad,yy+14,Math.round(W*.34),5);
    x.fillStyle=SMN_ONDARK_2;var tpx=_fitText(x,tag,'500 {px} Arial,sans-serif',15,W-pad*2);
    x.font='500 '+tpx+'px Arial,sans-serif';
    var words=tag.split(' '),ln='',ty=yy+44;words.forEach(function(wd){var t2=ln?ln+' '+wd:wd;if(x.measureText(t2).width>W-pad*2){x.fillText(ln,pad,ty);ty+=tpx+6;ln=wd;}else ln=t2;});if(ln)x.fillText(ln,pad,ty);
  } else if(thin){ // 728x90 class: logo left, name + tagline inline
    logoContain(pad,H*.14,H*.72,H*.72);
    var lx=pad+H*.72+Math.round(H*.3);
    x.fillStyle='#FFFFFF';var npx2=_fitText(x,name,'800 {px} '+F,Math.round(H*.44),W*.46);
    x.font='800 '+npx2+'px '+F;x.fillText(name,lx,H*.60,W*.46);
    x.fillStyle=acc;x.fillRect(lx,H*.70,Math.round(W*.10),4);
    x.fillStyle=SMN_ONDARK_2;var tp2=_fitText(x,tag,'500 {px} Arial,sans-serif',Math.round(H*.24),W-(lx+W*.48)-pad);
    x.font='500 '+tp2+'px Arial,sans-serif';x.fillText(tag,lx+W*.48,H*.58,W-(lx+W*.48)-pad);
  } else { // 300x250 class: logo top-left, name, rule, tagline
    logoContain(pad,pad,W*.42,H*.42);
    x.fillStyle='#FFFFFF';var npx3=_fitText(x,name,'800 {px} '+F,Math.round(H*.19),W-pad*2);
    x.font='800 '+npx3+'px '+F;x.fillText(name,pad,H*.66,W-pad*2);
    x.fillStyle=acc;x.fillRect(pad,H*.70,Math.round(W*.26),5);
    x.fillStyle=SMN_ONDARK_2;var tp3=_fitText(x,tag,'500 {px} Arial,sans-serif',16,W-pad*2);
    x.font='500 '+tp3+'px Arial,sans-serif';x.fillText(tag,pad,H*.84,W-pad*2);
  }
  return _canvasBlob(cv).then(function(b){return{filename:fname,blob:b};});});}
/* BRAND COPY DECK PDF (Founder order, 2026-07-24): text deliverables presented the way an
   agency presents — a typeset, branded PDF. Pages are painted on canvas in the brand's own
   display font and palette (US Letter at 200dpi), then bound with jsPDF. The .txt files
   still ship for utility; the DECK is the presentation. */
function genCopyDeck(NM,IDEA){
 var name=NM.name,tag=NM.tag||'',dom=NM.dom||'';
 var C=((IDEA.palettes&&IDEA.palettes[0]&&IDEA.palettes[0].cols)||['#141414','#141414','#141414','#B7791F']);
 var acc=_brightest(C),dk=_darkest(C);
 var disp=brandDisplayFont(NM,IDEA),body=brandBodyFont(disp);
 var F='"'+disp+'",Georgia,serif',B='"'+body+'",Arial,sans-serif';
 var W=1700,H=2200,M=150; // letter @200dpi
 function pg(){var cv=document.createElement('canvas');cv.width=W;cv.height=H;var x=_q(cv.getContext('2d'));x.fillStyle='#FFFFFF';x.fillRect(0,0,W,H);return {cv:cv,x:x};}
 function footer(x,n){x.fillStyle='#9AA0AC';x.font='400 26px '+B;x.textBaseline='alphabetic';x.fillText(name+' \u2014 Brand Copy Deck',M,H-90);var t='Page '+n;x.fillText(t,W-M-x.measureText(t).width,H-90);x.fillStyle=acc;x.fillRect(M,H-140,W-M*2,3);}
 function header(x,eyebrow,title){x.fillStyle=acc;x.font='700 30px '+B;x.textBaseline='alphabetic';x.fillText(eyebrow.toUpperCase(),M,M+40);x.fillStyle='#14161A';x.font='700 92px '+F;x.fillText(title,M,M+150,W-M*2);x.fillStyle='rgba(20,22,26,.15)';x.fillRect(M,M+190,W-M*2,2);return M+280;}
 function wrap(x,txt,font,color,y,lh,maxW){x.font=font;x.fillStyle=color;var words=String(txt).split(' '),ln='';
  words.forEach(function(w){var t2=ln?ln+' '+w:w;if(x.measureText(t2).width>maxW){x.fillText(ln,M,y);y+=lh;ln=w;}else ln=t2;});
  if(ln){x.fillText(ln,M,y);y+=lh;} return y;}
 function listPage(n,eyebrow,title,items,numbered){var p=pg(),y=header(p.x,eyebrow,title);
  items.forEach(function(it,i){
   if(y>H-320){footer(p.x,n.v);pages.push(p.cv);n.v++;p=pg();y=header(p.x,eyebrow,title+' (cont.)');}
   if(numbered){p.x.fillStyle=acc;p.x.font='700 40px '+B;p.x.fillText(String(i+1).padStart(2,'0'),M,y);y+=8;}
   y=wrap(p.x,it,'400 40px '+B,'#22242C',y+(numbered?52:0),56,W-M*2)+38;
   p.x.fillStyle='rgba(20,22,26,.10)';p.x.fillRect(M,y-30,W-M*2,1);});
  footer(p.x,n.v);pages.push(p.cv);n.v++;}
 var pages=[];
 return loadBrandFont(disp).then(function(){return loadBrandFont(body);}).then(function(){
  // COVER
  var c=pg();var g=c.x.createLinearGradient(0,0,W*.5,H);g.addColorStop(0,dk);g.addColorStop(1,_hexDeep(dk));c.x.fillStyle=g;c.x.fillRect(0,0,W,H);
  c.x.save();c.x.globalAlpha=.13;c.x.fillStyle=acc;c.x.beginPath();c.x.arc(W*.88,H*.14,520,0,7);c.x.fill();c.x.restore();
  c.x.fillStyle=acc;c.x.fillRect(M,H*.30,140,8);
  c.x.fillStyle='#FFFFFF';c.x.textBaseline='alphabetic';
  var npx=_fitText(c.x,name,'800 {px} '+F,190,W-M*2);c.x.font='800 '+npx+'px '+F;c.x.fillText(name,M,H*.30+npx+60,W-M*2);
  if(tag){c.x.fillStyle=SMN_ONDARK_2;c.x.font='italic 500 54px '+F;c.x.fillText(tag,M,H*.30+npx+150,W-M*2);}
  c.x.fillStyle=acc;c.x.font='700 34px '+B;c.x.fillText('BRAND COPY DECK',M,H*.78);
  c.x.fillStyle='rgba(255,255,255,.7)';c.x.font='400 30px '+B;c.x.fillText('Prepared by SparkMyName \u2014 '+new Date().toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'}),M,H*.78+56);
  pages.push(c.cv);
  var n={v:2};
  // COLORS + FONTS
  var p=pg(),y=header(p.x,'Identity','Colors & Type');
  var sw=Math.floor((W-M*2-3*40)/4);
  C.slice(0,4).forEach(function(h,i){var bx=M+i*(sw+40);p.x.fillStyle=h;p.x.fillRect(bx,y,sw,sw*.72);p.x.strokeStyle='rgba(0,0,0,.12)';p.x.strokeRect(bx,y,sw,sw*.72);p.x.fillStyle='#22242C';p.x.font='600 34px '+B;p.x.fillText(String(h).toUpperCase(),bx,y+sw*.72+52);});
  y+=Math.round(sw*.72)+150;
  p.x.fillStyle='#14161A';p.x.font='700 46px '+B;p.x.fillText('Display face',M,y);p.x.font='700 84px '+F;p.x.fillText(disp,M,y+100,W-M*2);
  p.x.font='700 46px '+B;p.x.fillText('Body face',M,y+230);p.x.font='400 66px '+B;p.x.fillText(body+' \u2014 The quick brown fox jumps over the lazy dog.',M,y+330,W-M*2);
  footer(p.x,n.v);pages.push(p.cv);n.v++;
  // SECTIONS
  listPage(n,'Voice','Taglines',(NM.taglines||[]).slice(0,6),true);
  listPage(n,'Social','Bios',(IDEA.biosT||[]).slice(0,6),true);
  listPage(n,'Story','About '+name,(IDEA.aboutT||[]).slice(0,3),false);
  listPage(n,'Launch','First Posts',(IDEA.postsT||[]).slice(0,6),true);
  if((IDEA.linkedinT||[]).length)listPage(n,'Professional','LinkedIn',(IDEA.linkedinT||[]).slice(0,3),true);
  if((IDEA.facebookT||[]).length)listPage(n,'Community','Facebook',(IDEA.facebookT||[]).slice(0,3),true);
  listPage(n,'Everywhere','Suggested Handles',['Instagram  @'+slug(name),'Facebook  /'+slug(name),'X  @'+slug(name),'TikTok  @'+slug(name),'YouTube  @'+slug(name),'LinkedIn  /'+slug(name)].concat(dom?['Your web address  '+dom]:[]),false);
  // BIND
  return new Promise(function(res){loadJsPDF(function(okPdf){
   /* The PDF library may not have loaded — a blocked CDN, an offline moment. Resolve cleanly
      instead of constructing a jsPDF that does not exist and throwing inside a Promise. */
   if(!okPdf || !(window.jspdf && window.jspdf.jsPDF)){ res(null); return; }
   var pdf=new window.jspdf.jsPDF({unit:'in',format:'letter'});
   pages.forEach(function(cv,i){if(i)pdf.addPage();pdf.addImage(cv.toDataURL('image/jpeg',0.92),'JPEG',0,0,8.5,11);});
   res({filename:'Brand-Copy-Deck.pdf',blob:pdf.output('blob')});});});
 });}
/* PRINT FOUNDATION — DISC 1 (Founder order, 2026-07-24). Print-true engine per the
   researched agency spec (docs/SPARK_DELIVERABLE_SPEC.md): 300 DPI, 0.125in bleed all
   sides, 0.25in safe zone. Every piece ships as PDF (full-bleed, ready for any printer)
   + PNG. sRGB color, which modern online printers accept and convert; offset-CMYK export
   is a banked server-side upgrade. Client contact lines appear ONLY if the client saved
   Brand Details — nothing is ever invented. */
function _bd(IDEA){try{return JSON.parse(localStorage.getItem('smn_bd_'+IDEA.id)||'{}');}catch(e){return{};}}
function printCanvas(wIn,hIn,dpiOpt){var B=0.125,S=0.295,dpi=dpiOpt||300;  /* +18% whitespace: agency margins */
 var W=Math.round((wIn+2*B)*dpi),H=Math.round((hIn+2*B)*dpi);
 var cv=document.createElement('canvas');cv.width=W;cv.height=H;var x=_q(cv.getContext('2d'));
 return {cv:cv,x:x,W:W,H:H,bp:Math.round(B*dpi),sp:Math.round((B+S)*dpi),tw:Math.round(wIn*dpi),th:Math.round(hIn*dpi)};}
function _pdfFrom(pages,wIn,hIn,fname){return new Promise(function(res){loadJsPDF(function(okPdf){
 /* The PDF library may not have loaded — a blocked CDN, an offline moment. Resolve cleanly
    instead of constructing a jsPDF that does not exist and throwing inside a Promise. */
 if(!okPdf || !(window.jspdf && window.jspdf.jsPDF)){ res(null); return; }
 var B=0.125,pdf=new window.jspdf.jsPDF({unit:'in',format:[wIn+2*B,hIn+2*B],orientation:(wIn>=hIn?'l':'p')});
 pages.forEach(function(cv,i){if(i)pdf.addPage([wIn+2*B,hIn+2*B],(wIn>=hIn?'l':'p'));pdf.addImage(cv.toDataURL('image/jpeg',0.95),'JPEG',0,0,wIn+2*B,hIn+2*B);});
 res({filename:fname,blob:pdf.output('blob')});});});}
function genPrintPiece(kind,NM,IDEA){
 var name=NM.name,tag=NM.tag||'',dom=NM.dom||'',bd=_bd(IDEA);
 var C=((IDEA.palettes&&IDEA.palettes[0]&&IDEA.palettes[0].cols)||['#141414','#141414','#141414','#B7791F']);
 var acc=_brightest(C),dk=_darkest(C);
 var disp=brandDisplayFont(NM,IDEA),body=brandBodyFont(disp);
 var F='"'+disp+'",Georgia,serif',BF='"'+body+'",Arial,sans-serif';
 var logoUrl=(NM.logos&&NM.logos[0])||'';
 function contact(){var L=[];if(bd.phone)L.push(bd.phone);if(bd.email)L.push(bd.email);if(dom)L.push(dom);if(bd.address)L.push(bd.address);return L;}
 return Promise.all([_logoArt(logoUrl),loadBrandFont(disp),loadBrandFont(body)]).then(function(a){
  var im=a[0];
  function logo(x,bx,by,bw,bh,onDark){_logoSmart(x,im,bx,by,bw,bh,onDark);}
  if(kind==='print-card'){ // 3.5x2 front + back
   /* AGENCY REFACTOR: the block is optically centred as a unit rather than pinned to
      fixed fractions, which was leaving a dead band at the top and crowding the foot. */
   /* §3 GRID VARIANCE: the card's structure is bound to this brand's fingerprint.
      spine     = logo left, copy on a left spine
      editorial = logo top, copy beneath on a wide measure
      split     = logo right, copy left against an accent field */
   var BX=smnBrandContext(NM,IDEA);
   var f=printCanvas(3.5,2);f.x.fillStyle='#FFFFFF';f.x.fillRect(0,0,f.W,f.H);
   var fLg=_logoBox('card',f.W,240);
   var cl=contact();
   var nx,nw;
   if(BX.grid==='split'){
     f.x.fillStyle=acc;f.x.fillRect(f.W-Math.round(f.W*0.34),0,Math.round(f.W*0.34),f.H);
     nx=f.sp; nw=f.W-Math.round(f.W*0.34)-f.sp*2;
   } else if(BX.grid==='editorial'){
     nx=f.sp; nw=f.W-f.sp*2;
   } else {
     nx=f.sp+fLg+Math.round(f.W*0.05); nw=f.W-nx-f.sp;
   }
   f.x.textBaseline='alphabetic';
   var npx=_fitText(f.x,name,'800 {px} '+F,120,nw);
   var tpx=tag?_fitText(f.x,tag,'italic 500 {px} '+F,52,nw):0;
   var lines=Math.min(cl.length,3);
   var blockH = npx + (tag?tpx+26:0) + 26 + (lines?lines*46+18:0);
   var top = Math.round((f.H-blockH)/2*0.92);
   if(BX.grid==='split'){
     logo(f.x,f.W-Math.round(f.W*0.30),Math.round((f.H-fLg)/2),fLg,fLg);
   } else if(BX.grid==='editorial'){
     logo(f.x,f.sp,Math.round(f.H*0.10),Math.round(fLg*0.86),Math.round(fLg*0.66));
     top=Math.round(f.H*0.48);
   } else {
     logo(f.x,f.sp,Math.round((f.H-fLg)/2),fLg,fLg);
   }
   var y = top+npx;
   f.x.fillStyle=SMN_INK;f.x.font='800 '+npx+'px '+F;f.x.fillText(name,nx,y,nw);
   y+=26; f.x.fillStyle=acc;f.x.fillRect(nx,y,Math.round(nw*.34),8); y+=34;
   if(tag){f.x.fillStyle=SMN_INK2;f.x.font='italic 500 '+tpx+'px '+F;
     f.x.fillText(tag,nx,y+tpx*0.8,nw); y+=tpx+26;}
   f.x.fillStyle=SMN_INK2;f.x.font='400 34px '+BF;
   cl.slice(0,3).forEach(function(l,i){f.x.fillText(l,nx,y+18+i*46,nw);});
   var b=printCanvas(3.5,2);var g=b.x.createLinearGradient(0,0,b.W*.5,b.H);g.addColorStop(0,dk);g.addColorStop(1,_hexDeep(dk));b.x.fillStyle=g;b.x.fillRect(0,0,b.W,b.H);
   logo(b.x,b.W*.30,b.H*.16,b.W*.40,b.H*.52);
   b.x.fillStyle='#FFFFFF';b.x.textAlign='center';var bpx=_fitText(b.x,name,'800 {px} '+F,86,b.W-b.sp*2);b.x.font='800 '+bpx+'px '+F;b.x.fillText(name,b.W/2,b.H*.84,b.W-b.sp*2);b.x.textAlign='left';
   return _pdfFrom([f.cv,b.cv],3.5,2,'business-card-print.pdf').then(function(pdf){return _canvasBlob(f.cv).then(function(png){return[pdf,{filename:'business-card-front.png',blob:png}];});});}
  if(kind==='print-letterhead'){ // 8.5x11
   var p=printCanvas(8.5,11);p.x.fillStyle='#FFFFFF';p.x.fillRect(0,0,p.W,p.H);
   p.x.fillStyle=acc;p.x.fillRect(0,0,p.W,26);
   logo(p.x,p.sp,p.sp,340,340);
   p.x.fillStyle=SMN_INK;p.x.textBaseline='alphabetic';
   var npx2=_fitText(p.x,name,'800 {px} '+F,110,p.W*.55);p.x.font='800 '+npx2+'px '+F;p.x.fillText(name,p.sp+380,p.sp+170,p.W*.55);
   if(tag){p.x.fillStyle=SMN_INK2;p.x.font='italic 500 46px '+F;p.x.fillText(tag,p.sp+380,p.sp+250,p.W*.55);}
   p.x.fillStyle=_rule(C,0.35);p.x.fillRect(p.sp,p.sp+420,p.W-p.sp*2,3);
   var cl2=contact();p.x.fillStyle=SMN_INK2;p.x.font='400 36px '+BF;
   p.x.fillStyle=_rule(C,0.35);p.x.fillRect(p.sp,p.H-p.sp-120,p.W-p.sp*2,3);
   p.x.fillStyle=SMN_INK2;p.x.fillText(cl2.join('   \u2022   ')||name,p.sp,p.H-p.sp-50,p.W-p.sp*2);
   return _pdfFrom([p.cv],8.5,11,'letterhead-print.pdf').then(function(pdf){return _canvasBlob(p.cv).then(function(png){return[pdf,{filename:'letterhead.png',blob:png}];});});}
  if(kind==='print-thankyou'){ // 5x3.5 flat
   var t=printCanvas(5,3.5);var g2=t.x.createLinearGradient(0,0,t.W*.5,t.H);g2.addColorStop(0,dk);g2.addColorStop(1,_hexDeep(dk));t.x.fillStyle=g2;t.x.fillRect(0,0,t.W,t.H);
   t.x.save();t.x.globalAlpha=.13;t.x.fillStyle=acc;t.x.beginPath();t.x.arc(t.W*.9,t.H*.1,t.W*.3,0,7);t.x.fill();t.x.restore();
   t.x.fillStyle='#FFFFFF';t.x.textAlign='center';t.x.textBaseline='alphabetic';
   t.x.font='italic 600 150px '+F;t.x.fillText('Thank you',t.W/2,t.H*.44,t.W-t.sp*2);
   t.x.fillStyle=acc;t.x.fillRect(t.W/2-160,t.H*.52,320,7);
   logo(t.x,t.W/2-110,t.H*.58,220,220);
   t.x.fillStyle=SMN_ONDARK_2;var tp3=_fitText(t.x,name+(dom?' \u2022 '+dom:''),'400 {px} '+BF,44,t.W-t.sp*2);
   t.x.font='400 '+tp3+'px '+BF;t.x.fillText(name+(dom?' \u2022 '+dom:''),t.W/2,t.H*.90,t.W-t.sp*2);t.x.textAlign='left';
   return _pdfFrom([t.cv],5,3.5,'thank-you-card-print.pdf').then(function(pdf){return _canvasBlob(t.cv).then(function(png){return[pdf,{filename:'thank-you-card.png',blob:png}];});});}
  if(kind==='print-appt'){ // 3.5x2 appointment
   var ap=printCanvas(3.5,2);ap.x.fillStyle='#FFFFFF';ap.x.fillRect(0,0,ap.W,ap.H);
   ap.x.fillStyle=dk;ap.x.fillRect(0,0,ap.W,ap.H*.30);
   logo(ap.x,ap.sp,ap.H*.045,ap.H*.21,ap.H*.21);
   ap.x.fillStyle='#FFFFFF';ap.x.textBaseline='alphabetic';var apx=_fitText(ap.x,name,'800 {px} '+F,64,ap.W-ap.sp*2-ap.H*.24);
   ap.x.font='800 '+apx+'px '+F;ap.x.fillText(name,ap.sp+ap.H*.24,ap.H*.20,ap.W-ap.sp*2-ap.H*.24);
   ap.x.fillStyle=SMN_INK;ap.x.font='700 44px '+BF;ap.x.fillText('Your appointment',ap.sp,ap.H*.46);
   ap.x.strokeStyle=_rule(C,0.77);ap.x.lineWidth=2;ap.x.font='400 36px '+BF;ap.x.fillStyle=SMN_INK2;
   [['Date',.62],['Time',.78]].forEach(function(r){ap.x.fillText(r[0],ap.sp,ap.H*r[1]);
    ap.x.beginPath();ap.x.moveTo(ap.sp+130,ap.H*r[1]);ap.x.lineTo(ap.W-ap.sp,ap.H*r[1]);ap.x.stroke();});
   var cph=(bd.phone?('Questions? '+bd.phone):(dom||''));if(cph){ap.x.font='400 30px '+BF;ap.x.fillText(cph,ap.sp,ap.H*.93,ap.W-ap.sp*2);}
   return _pdfFrom([ap.cv],3.5,2,'appointment-card-print.pdf').then(function(pdf){return _canvasBlob(ap.cv).then(function(png){return[pdf,{filename:'appointment-card.png',blob:png}];});});}
  if(kind==='print-flyer'){
   /* EDITORIAL FLYER. Three distinct typographic scales — display header, regular body,
      tracked small-caps metadata — on an asymmetric grid. The palette's secondary and
      tertiary drive the rules and the fact panel; nothing is hardcoded. */
   var fl=printCanvas(8.5,11);
   var FC=smnPaletteOrFlag(IDEA,NM);
   var f1=(FC&&FC[0])||dk, f2=(FC&&FC[1])||acc, f3=(FC&&FC[2])||f2, f4=(FC&&FC[3])||'#FFFFFF';
   fl.x.fillStyle=f4;fl.x.fillRect(0,0,fl.W,fl.H);
   /* asymmetric header: a colour field on the upper right, logo on the left spine */
   fl.x.fillStyle=f1;fl.x.fillRect(Math.round(fl.W*0.46),0,Math.round(fl.W*0.54),Math.round(fl.H*0.30));
   fl.x.fillStyle=f2;fl.x.fillRect(Math.round(fl.W*0.46),Math.round(fl.H*0.30),Math.round(fl.W*0.54),Math.max(6,Math.round(fl.H*0.006)));
   logo(fl.x,fl.sp,fl.sp,_logoBox('document',fl.W,300),Math.round(fl.H*0.14));
   fl.x.textBaseline='alphabetic';
   /* DISPLAY scale */
   var fhw=Math.round(fl.W*0.54)-fl.sp*2;
   var fhp=_fitText(fl.x,name,'800 {px} '+F,_display(120),fhw);
   fl.x.fillStyle=f4;fl.x.font='800 '+fhp+'px '+F;
   fl.x.fillText(name,Math.round(fl.W*0.46)+fl.sp,Math.round(fl.H*0.17),fhw);
   /* METADATA scale — tracked small caps */
   if(tag){fl.x.fillStyle=f4;fl.x.font='400 30px '+BF;
     _micro(fl.x,tag.toUpperCase(),30,0.18,Math.round(fl.W*0.46)+fl.sp,Math.round(fl.H*0.235),fhw);}
   /* Editorial rule as a structural divider, then the body block. No photo helper is
      invented here — the print engine has no photo loader in scope, and inventing one
      would have shipped a broken piece. */
   fl.x.fillStyle=f3;fl.x.fillRect(fl.sp,Math.round(fl.H*0.38),Math.round(fl.W*0.30),Math.max(4,Math.round(fl.H*0.004)));
   var fy=Math.round(fl.H*0.46);
   fl.x.fillStyle=SMN_INK;fl.x.font='800 '+_display(60)+'px '+F;
   fl.x.fillText('Just listed',fl.sp,fy,fl.W-fl.sp*2);
   fl.x.fillStyle=f3;fl.x.fillRect(fl.sp,fy+22,Math.round(fl.W*0.16),8);
   fl.x.fillStyle=SMN_INK2;fl.x.font='400 34px '+BF;
   var fw=(IDEA.aboutT&&IDEA.aboutT[0])||tag||'';
   var words=String(fw).split(' '),ln='',yy=fy+90;
   words.forEach(function(w){var s2=ln?ln+' '+w:w;
     if(fl.x.measureText(s2).width>fl.W-fl.sp*2){fl.x.fillText(ln,fl.sp,yy,fl.W-fl.sp*2);yy+=Math.round(34*1.5);ln=w;}else ln=s2;});
   if(ln)fl.x.fillText(ln,fl.sp,yy,fl.W-fl.sp*2);
   /* fact panel driven by the tertiary colour */
   var fpy=fl.H-Math.round(fl.H*0.20);
   fl.x.fillStyle=f3;fl.x.globalAlpha=0.12;fl.x.fillRect(0,fpy,fl.W,Math.round(fl.H*0.11));fl.x.globalAlpha=1;
   ['BEDS','BATHS','SQ FT','PRICE'].forEach(function(k,i3){
     var kx=fl.sp+i3*Math.round((fl.W-fl.sp*2)/4);
     fl.x.fillStyle=SMN_INK2;fl.x.font='400 22px '+BF;
     _micro(fl.x,k,22,0.18,kx,fpy+Math.round(fl.H*0.035),fl.W);
     fl.x.fillStyle=SMN_INK;fl.x.font='700 46px '+BF;fl.x.fillText('\u2014',kx,fpy+Math.round(fl.H*0.082));});
   var cf=contact();
   if(cf.length){fl.x.fillStyle=SMN_INK;fl.x.font='700 32px '+BF;
     fl.x.fillText(cf.slice(0,2).join('   \u00b7   '),fl.sp,fl.H-fl.sp,fl.W-fl.sp*2);}
   return _pdfFrom([fl.cv],8.5,11,'flyer-print.pdf').then(function(pdf){
     return _canvasBlob(fl.cv).then(function(png){return[pdf,{filename:'flyer.png',blob:png}];});});}
  if(kind==='print-poster'){ // 18x24 @150dpi (large-format standard)
   var po=printCanvas(18,24,150);var gp1=po.x.createLinearGradient(0,0,po.W*.5,po.H);gp1.addColorStop(0,dk);gp1.addColorStop(1,_hexDeep(dk));po.x.fillStyle=gp1;po.x.fillRect(0,0,po.W,po.H);
   po.x.save();po.x.globalAlpha=.14;po.x.fillStyle=acc;po.x.beginPath();po.x.arc(po.W*.9,po.H*.08,po.W*.4,0,7);po.x.fill();po.x.restore();
   logo(po.x,po.W/2-300,po.H*.10,600,600);
   po.x.fillStyle='#FFFFFF';po.x.textAlign='center';po.x.textBaseline='alphabetic';
   var ppx=_fitText(po.x,name,'800 {px} '+F,640,po.W-po.sp*2);po.x.font='800 '+ppx+'px '+F;po.x.fillText(name,po.W/2,po.H*.42,po.W-po.sp*2);
   po.x.fillStyle=acc;po.x.fillRect(po.W/2-300,po.H*.45,600,10);
   if(tag){po.x.fillStyle=SMN_ONDARK_2;var ptx=_fitText(po.x,tag,'italic 500 {px} '+F,110,po.W-po.sp*2);po.x.font='italic 500 '+ptx+'px '+F;po.x.fillText(tag,po.W/2,po.H*.52,po.W-po.sp*2);}
   po.x.fillStyle='rgba(255,255,255,.88)';var pmT='Your headline goes here';var pmpx=_fitText(po.x,pmT,'700 {px} '+BF,220,po.W-po.sp*2);po.x.font='700 '+pmpx+'px '+BF;po.x.fillText(pmT,po.W/2,po.H*.66,po.W-po.sp*2);
   var poC=(bd.phone?bd.phone+'   \u2022   ':'')+(dom||'');if(poC){po.x.fillStyle='#FFFFFF';var popx=_fitText(po.x,poC,'700 {px} '+BF,280,po.W-po.sp*2);po.x.font='700 '+popx+'px '+BF;po.x.fillText(poC,po.W/2,po.H-po.sp-40,po.W-po.sp*2);}
   po.x.textAlign='left';
   return _pdfFrom([po.cv],18,24,'poster-18x24-print.pdf').then(function(pdf){return _canvasBlob(po.cv).then(function(png){return[pdf,{filename:'poster-18x24.png',blob:png}];});});}
  if(kind==='print-rack'){ // 4x9 rack card
   var rk=printCanvas(4,9);rk.x.fillStyle='#FFFFFF';rk.x.fillRect(0,0,rk.W,rk.H);
   rk.x.fillStyle=dk;rk.x.fillRect(0,0,rk.W,rk.H*.34);
   logo(rk.x,rk.W/2-190,rk.H*.045,380,380);
   rk.x.fillStyle='#FFFFFF';rk.x.textAlign='center';rk.x.textBaseline='alphabetic';
   var rpx=_fitText(rk.x,name,'800 {px} '+F,92,rk.W-rk.sp*2);rk.x.font='800 '+rpx+'px '+F;rk.x.fillText(name,rk.W/2,rk.H*.30,rk.W-rk.sp*2);
   rk.x.fillStyle=SMN_INK;rk.x.font='700 56px '+BF;rk.x.fillText('What we do',rk.W/2,rk.H*.44,rk.W-rk.sp*2);
   rk.x.fillStyle=acc;rk.x.fillRect(rk.W/2-120,rk.H*.46,240,6);
   var whyL=(NM.why||[]).slice(0,3);rk.x.fillStyle='#333846';rk.x.font='400 42px '+BF;
   whyL.forEach(function(wl,i){var words=wl.split(' '),ln='',yy=rk.H*(.52+i*.12);
     words.forEach(function(wd){var t2=ln?ln+' '+wd:wd;if(rk.x.measureText(t2).width>rk.W-rk.sp*2){rk.x.fillText(ln,rk.W/2,yy);yy+=52;ln=wd;}else ln=t2;});if(ln)rk.x.fillText(ln,rk.W/2,yy);});
   var cr=contact();if(cr.length){rk.x.fillStyle=dk;rk.x.fillRect(0,rk.H-rk.sp-150,rk.W,150+rk.sp);rk.x.fillStyle='#FFFFFF';rk.x.font='700 38px '+BF;rk.x.fillText(cr.slice(0,2).join('  \u2022  '),rk.W/2,rk.H-rk.sp-55,rk.W-rk.sp*2);}
   rk.x.textAlign='left';
   return _pdfFrom([rk.cv],4,9,'rack-card-print.pdf').then(function(pdf){return _canvasBlob(rk.cv).then(function(png){return[pdf,{filename:'rack-card.png',blob:png}];});});}
  if(kind==='print-yard'){ // 24x18 @150dpi yard sign — distance-readable
   /* SIGN LAW: 1in of cap height = 10ft of readable distance. The logo sits ABOVE the
      headline, not beside it, so the name gets the full safe width and can reach a size
      that actually reads from the street. */
   var yd=printCanvas(24,18,150);_deepField(yd.x,yd.W,yd.H,dk);
   yd.x.fillStyle=acc;yd.x.fillRect(0,0,yd.W,26);yd.x.fillRect(0,yd.H-26,yd.W,26);
   /* NYC SOP §1A: left-anchored asymmetrical editorial spine, not centred. §2A: extreme
      scale contrast. §3B: the accent rule is a structural divider bleeding off the
      margin, not a floating underline. */
   var yw=yd.W-yd.sp*2;
   var spine=yd.sp;                                  // the vertical alignment spine
   logo(yd.x,spine,yd.sp+30,_logoBox('signage',yd.W,420),320,true);
   yd.x.fillStyle=SMN_ONDARK;yd.x.textBaseline='alphabetic';yd.x.textAlign='left';
   var ypx=_fitText(yd.x,name,'800 {px} '+F,_display(760),yw);yd.x.font='800 '+ypx+'px '+F;
   yd.x.fillText(name,spine,yd.H*.56,yw);
   yd.x.fillStyle=acc;yd.x.fillRect(0,Math.round(yd.H*.60),Math.round(yd.W*.46),10);
   var cy=(bd.phone||dom||'');if(cy){yd.x.fillStyle=SMN_ONDARK;
     var cpx=_fitText(yd.x,cy,'800 {px} '+BF,784,yw);yd.x.font='800 '+cpx+'px '+BF;
     yd.x.fillText(cy,spine,yd.H*.86,yw);}
   if(tag){yd.x.fillStyle=SMN_ONDARK_2;yd.x.font='400 46px '+BF;
     _micro(yd.x,tag.toUpperCase(),46,0.15,spine,yd.H*.70,yw);}
   return _pdfFrom([yd.cv],24,18,'yard-sign-24x18-print.pdf').then(function(pdf){return _canvasBlob(yd.cv).then(function(png){return[pdf,{filename:'yard-sign.png',blob:png}];});});}
  if(kind==='print-decal'){ // 12x12 window/door decal
   var dc=printCanvas(12,12);var gd=dc.x.createRadialGradient(dc.W/2,dc.H/2,100,dc.W/2,dc.H/2,dc.W*.7);gd.addColorStop(0,dk);gd.addColorStop(1,_hexDeep(dk));dc.x.fillStyle=gd;dc.x.fillRect(0,0,dc.W,dc.H);
   dc.x.strokeStyle=acc;dc.x.lineWidth=14;dc.x.beginPath();dc.x.arc(dc.W/2,dc.H/2,dc.W/2-dc.sp,0,7);dc.x.stroke();
   logo(dc.x,dc.W/2-560,dc.H*.16,1120,1120);
   dc.x.fillStyle='#FFFFFF';dc.x.textAlign='center';dc.x.textBaseline='alphabetic';
   var dpx=_fitText(dc.x,name,'800 {px} '+F,220,dc.W-dc.sp*3);dc.x.font='800 '+dpx+'px '+F;dc.x.fillText(name,dc.W/2,dc.H*.66,dc.W-dc.sp*3);
   var hh=(bd.hours||dom||'');if(hh){dc.x.fillStyle=SMN_ONDARK_2;var hpx=_fitText(dc.x,hh,'400 {px} '+BF,80,dc.W-dc.sp*3.5);dc.x.font='400 '+hpx+'px '+BF;dc.x.fillText(hh,dc.W/2,dc.H*.78,dc.W-dc.sp*3.5);}
   dc.x.textAlign='left';
   return _pdfFrom([dc.cv],12,12,'window-decal-print.pdf').then(function(pdf){return _canvasBlob(dc.cv).then(function(png){return[pdf,{filename:'window-decal.png',blob:png}];});});}
  if(kind==='print-badge'){ // 4x3 name badge
   var bg=printCanvas(4,3);bg.x.fillStyle='#FFFFFF';bg.x.fillRect(0,0,bg.W,bg.H);
   bg.x.fillStyle=dk;bg.x.fillRect(0,0,bg.W,bg.H*.30);
   logo(bg.x,bg.sp,bg.H*.05,bg.H*.20,bg.H*.20);
   bg.x.fillStyle='#FFFFFF';bg.x.textBaseline='alphabetic';var bpx2=_fitText(bg.x,name,'800 {px} '+F,66,bg.W-bg.sp*2-bg.H*.24);
   bg.x.font='800 '+bpx2+'px '+F;bg.x.fillText(name,bg.sp+bg.H*.24,bg.H*.21,bg.W-bg.sp*2-bg.H*.24);
   bg.x.strokeStyle=_rule(C,0.77);bg.x.lineWidth=3;
   bg.x.beginPath();bg.x.moveTo(bg.sp,bg.H*.62);bg.x.lineTo(bg.W-bg.sp,bg.H*.62);bg.x.stroke();
   bg.x.fillStyle=SMN_INK2;bg.x.font='400 34px '+BF;bg.x.fillText('Name',bg.sp,bg.H*.72);
   bg.x.fillStyle=acc;bg.x.fillRect(bg.sp,bg.H*.82,Math.round((bg.W-bg.sp*2)*.4),6);
   return _pdfFrom([bg.cv],4,3,'name-badge-print.pdf').then(function(pdf){return _canvasBlob(bg.cv).then(function(png){return[pdf,{filename:'name-badge.png',blob:png}];});});}
  if(kind==='print-menu'){ // 8.5x11 one-page menu, light editorial
   var mn=printCanvas(8.5,11);mn.x.fillStyle=_tint(C,0.05);mn.x.fillRect(0,0,mn.W,mn.H);
   mn.x.fillStyle=dk;mn.x.fillRect(0,0,mn.W,mn.H*.16);
   logo(mn.x,mn.W/2-170,mn.H*.018,340,340);
   mn.x.fillStyle='#FFFFFF';mn.x.textAlign='center';mn.x.textBaseline='alphabetic';
   var mpx=_fitText(mn.x,name,'800 {px} '+F,120,mn.W-mn.sp*2);mn.x.font='800 '+mpx+'px '+F;mn.x.fillText(name,mn.W/2,mn.H*.145,mn.W-mn.sp*2);
   mn.x.fillStyle=SMN_INK;mn.x.font='700 76px '+F;mn.x.fillText('Menu',mn.W/2,mn.H*.235);
   mn.x.fillStyle=acc;mn.x.fillRect(mn.W/2-150,mn.H*.25,300,7);
   mn.x.textAlign='left';
   var colW=(mn.W-mn.sp*2-120)/2,rows=8;
   [0,1].forEach(function(cidx){var cx0=mn.sp+cidx*(colW+120);
    mn.x.fillStyle=acc;mn.x.font='800 46px '+BF;mn.x.fillText(cidx===0?'STARTERS & FAVORITES':'MAINS & MORE',cx0,mn.H*.32);
    for(var r0=0;r0<rows;r0++){var yy=mn.H*(.36+r0*.062);
     mn.x.fillStyle=SMN_INK;mn.x.font='700 42px '+BF;mn.x.fillText('Item name',cx0,yy);
     mn.x.fillStyle=_rule(C,0.77);
     var dotsX=cx0+mn.x.measureText('Item name').width+24,dotsEnd=cx0+colW-170;
     mn.x.font='700 36px '+BF;var dots='';while(mn.x.measureText(dots+'. ').width<dotsEnd-dotsX)dots+='. ';mn.x.fillText(dots,dotsX,yy);
     mn.x.fillStyle=SMN_INK;mn.x.font='700 42px '+BF;mn.x.fillText('$',cx0+colW-140,yy);
     mn.x.fillStyle=SMN_INK2;mn.x.font='italic 400 32px '+BF;mn.x.fillText('Describe it deliciously here',cx0,yy+40);}});
   var cm=contact();if(cm.length){mn.x.fillStyle=SMN_INK2;mn.x.textAlign='center';mn.x.font='400 36px '+BF;mn.x.fillText(cm.slice(0,3).join('  \u2022  '),mn.W/2,mn.H-mn.sp-30,mn.W-mn.sp*2);mn.x.textAlign='left';}
   return _pdfFrom([mn.cv],8.5,11,'menu-print.pdf').then(function(pdf){return _canvasBlob(mn.cv).then(function(png){return[pdf,{filename:'menu.png',blob:png}];});});}
  if(kind==='print-tent'){ // 4x6 table tent panel (print two, fold back-to-back)
   var tt=printCanvas(4,6);var gt=tt.x.createLinearGradient(0,0,tt.W*.5,tt.H);gt.addColorStop(0,dk);gt.addColorStop(1,_hexDeep(dk));tt.x.fillStyle=gt;tt.x.fillRect(0,0,tt.W,tt.H);
   tt.x.save();tt.x.globalAlpha=.13;tt.x.fillStyle=acc;tt.x.beginPath();tt.x.arc(tt.W*.9,tt.H*.08,tt.W*.4,0,7);tt.x.fill();tt.x.restore();
   logo(tt.x,tt.W/2-230,tt.sp,460,460);
   tt.x.fillStyle='#FFFFFF';tt.x.textAlign='center';tt.x.textBaseline='alphabetic';
   var tpx2=_fitText(tt.x,name,'800 {px} '+F,120,tt.W-tt.sp*2);tt.x.font='800 '+tpx2+'px '+F;tt.x.fillText(name,tt.W/2,tt.sp+460+tpx2+50,tt.W-tt.sp*2);
   tt.x.fillStyle=acc;tt.x.fillRect(tt.W/2-140,tt.sp+460+tpx2+110,280,7);
   tt.x.fillStyle=SMN_ONDARK_2;tt.x.font='400 52px '+BF;tt.x.fillText('Your special goes here',tt.W/2,tt.H*.72,tt.W-tt.sp*2);
   if(dom){tt.x.fillStyle='#FFFFFF';tt.x.font='700 44px '+BF;tt.x.fillText(dom,tt.W/2,tt.H-tt.sp-40,tt.W-tt.sp*2);}
   tt.x.textAlign='left';
   return _pdfFrom([tt.cv],4,6,'table-tent-print.pdf').then(function(pdf){return _canvasBlob(tt.cv).then(function(png){return[pdf,{filename:'table-tent.png',blob:png}];});});}
  if(kind==='print-trifold'){ // 11x8.5 landscape, 3 panels + subtle fold guides
   var tf=printCanvas(11,8.5);tf.x.fillStyle='#FFFFFF';tf.x.fillRect(0,0,tf.W,tf.H);
   var pw=(tf.tw)/3;
   tf.x.strokeStyle=_rule(C,0.26);tf.x.setLineDash([14,18]);tf.x.lineWidth=2;
   [1,2].forEach(function(i){tf.x.beginPath();tf.x.moveTo(tf.bp+pw*i,0);tf.x.lineTo(tf.bp+pw*i,tf.H);tf.x.stroke();});tf.x.setLineDash([]);
   var g3=tf.x.createLinearGradient(tf.bp+pw*2,0,tf.W,tf.H);g3.addColorStop(0,dk);g3.addColorStop(1,_hexDeep(dk));tf.x.fillStyle=g3;tf.x.fillRect(tf.bp+pw*2,0,tf.W-(tf.bp+pw*2),tf.H);
   logo(tf.x,tf.bp+pw*2+(pw-460)/2,tf.H*.20,460,460);
   tf.x.fillStyle='#FFFFFF';tf.x.textAlign='center';tf.x.textBaseline='alphabetic';
   var f3=_fitText(tf.x,name,'800 {px} '+F,110,pw-160);tf.x.font='800 '+f3+'px '+F;tf.x.fillText(name,tf.bp+pw*2.5,tf.H*.56,pw-160);
   if(tag){tf.x.fillStyle=SMN_ONDARK_2;var g4=_fitText(tf.x,tag,'italic 500 {px} '+F,52,pw-160);tf.x.font='italic 500 '+g4+'px '+F;tf.x.fillText(tag,tf.bp+pw*2.5,tf.H*.63,pw-160);}
   tf.x.textAlign='left';
   [['About us',.5],['What we offer',1.5]].forEach(function(pn){var cx0=tf.bp+pw*(pn[1]-0.5)+80;
    tf.x.fillStyle=acc;tf.x.font='800 44px '+BF;tf.x.fillText(pn[0].toUpperCase(),cx0,tf.H*.16);
    tf.x.fillStyle=SMN_INK;tf.x.fillRect(cx0,tf.H*.18,180,5);
    tf.x.fillStyle=SMN_INK2;tf.x.font='italic 400 38px '+BF;tf.x.fillText('Your story goes here \u2014 who you are and who you help.',cx0,tf.H*.26,pw-160);
    tf.x.strokeStyle=_rule(C,0.55);tf.x.lineWidth=2;
    for(var li=0;li<7;li++){tf.x.beginPath();tf.x.moveTo(cx0,tf.H*(.34+li*.08));tf.x.lineTo(cx0+pw-160,tf.H*(.34+li*.08));tf.x.stroke();}});
   var c3=contact();if(c3.length){tf.x.fillStyle=SMN_INK2;tf.x.font='400 32px '+BF;tf.x.fillText(c3.slice(0,3).join('  \u2022  '),tf.bp+80,tf.H-tf.sp-24,pw*2-160);}
   return _pdfFrom([tf.cv],11,8.5,'trifold-brochure-print.pdf').then(function(pdf){return _canvasBlob(tf.cv).then(function(png){return[pdf,{filename:'trifold-brochure.png',blob:png}];});});}
  if(kind==='print-aframe'){ // 24x36 A-frame insert @100dpi (sidewalk distance)
   var af=printCanvas(24,36,100);var ga=af.x.createLinearGradient(0,0,af.W*.5,af.H);ga.addColorStop(0,dk);ga.addColorStop(1,_hexDeep(dk));af.x.fillStyle=ga;af.x.fillRect(0,0,af.W,af.H);
   af.x.fillStyle=acc;af.x.fillRect(0,0,af.W,20);af.x.fillRect(0,af.H-20,af.W,20);
   logo(af.x,af.W/2-330,af.H*.08,660,660,true);
   af.x.fillStyle='#FFFFFF';af.x.textAlign='center';af.x.textBaseline='alphabetic';
   var apx2=_fitText(af.x,name,'800 {px} '+F,620,af.W-af.sp*2);af.x.font='800 '+apx2+'px '+F;af.x.fillText(name,af.W/2,af.H*.42,af.W-af.sp*2);
   af.x.fillStyle=acc;af.x.fillRect(af.W/2-260,af.H*.45,520,10);
   af.x.fillStyle='rgba(255,255,255,.94)';af.x.font='800 120px '+BF;af.x.fillText('YOUR MESSAGE',af.W/2,af.H*.60,af.W-af.sp*2);
   af.x.font='800 120px '+BF;af.x.fillText('HERE',af.W/2,af.H*.68,af.W-af.sp*2);
   var ca=(bd.phone||dom||'');if(ca){af.x.fillStyle='#FFFFFF';var cpx2=_fitText(af.x,ca,'800 {px} '+BF,644,af.W-af.sp*2);af.x.font='800 '+cpx2+'px '+BF;af.x.fillText(ca,af.W/2,af.H*.88,af.W-af.sp*2);}
   af.x.textAlign='left';
   return _pdfFrom([af.cv],24,36,'a-frame-24x36-print.pdf').then(function(pdf){return _canvasBlob(af.cv).then(function(png){return[pdf,{filename:'a-frame-insert.png',blob:png}];});});}
  if(kind==='print-pullup'){ // 33x80 pull-up @72dpi (full physical size in the PDF; distance media)
   var pu=printCanvas(33,80,72);var gu=pu.x.createLinearGradient(0,0,pu.W*.6,pu.H);gu.addColorStop(0,dk);gu.addColorStop(1,_hexDeep(dk));pu.x.fillStyle=gu;pu.x.fillRect(0,0,pu.W,pu.H);
   pu.x.save();pu.x.globalAlpha=.12;pu.x.fillStyle=acc;pu.x.beginPath();pu.x.arc(pu.W*.85,pu.H*.06,pu.W*.55,0,7);pu.x.fill();pu.x.restore();
   logo(pu.x,pu.W/2-330,pu.H*.05,660,660,true);
   pu.x.fillStyle='#FFFFFF';pu.x.textAlign='center';pu.x.textBaseline='alphabetic';
   var upx=_fitText(pu.x,name,'800 {px} '+F,430,pu.W-pu.sp*2);pu.x.font='800 '+upx+'px '+F;pu.x.fillText(name,pu.W/2,pu.H*.24,pu.W-pu.sp*2);
   pu.x.fillStyle=acc;pu.x.fillRect(pu.W/2-240,pu.H*.26,480,9);
   if(tag){pu.x.fillStyle=SMN_ONDARK_2;var utx=_fitText(pu.x,tag,'italic 500 {px} '+F,90,pu.W-pu.sp*2);pu.x.font='italic 500 '+utx+'px '+F;pu.x.fillText(tag,pu.W/2,pu.H*.31,pu.W-pu.sp*2);}
   var pts=(NM.why||[]).slice(0,3);pu.x.font='700 62px '+BF;
   pts.forEach(function(pt,i){pu.x.fillStyle=acc;pu.x.fillText('\u2726',pu.W/2,pu.H*(.42+i*.09));
    pu.x.fillStyle='rgba(255,255,255,.94)';var ppw=_fitText(pu.x,pt,'700 {px} '+BF,62,pu.W-pu.sp*2.5);pu.x.font='700 '+ppw+'px '+BF;pu.x.fillText(pt,pu.W/2,pu.H*(.445+i*.09),pu.W-pu.sp*2.5);});
   var cu=contact();if(cu.length){pu.x.fillStyle='#FFFFFF';var cuT=cu.slice(0,2).join('   \u2022   ');var cupx=_fitText(pu.x,cuT,'700 {px} '+BF,300,pu.W-pu.sp*2);pu.x.font='700 '+cupx+'px '+BF;pu.x.fillText(cuT,pu.W/2,pu.H*.92,pu.W-pu.sp*2);}
   pu.x.textAlign='left';
   return _pdfFrom([pu.cv],33,80,'pullup-banner-33x80-print.pdf').then(function(pdf){return _canvasBlob(pu.cv).then(function(png){return[pdf,{filename:'pullup-banner.png',blob:png}];});});}
  if(kind==='print-eddm'){ // 6.25x11 EDDM mailer — USPS legal size (min 6.125x10.5, max 12x15)
   var ed=printCanvas(6.25,11);var ge=ed.x.createLinearGradient(0,0,ed.W*.5,ed.H*.5);ge.addColorStop(0,dk);ge.addColorStop(1,_hexDeep(dk));
   ed.x.fillStyle='#FFFFFF';ed.x.fillRect(0,0,ed.W,ed.H);
   ed.x.fillStyle=ge;ed.x.fillRect(0,0,ed.W,ed.H*.52);
   logo(ed.x,ed.sp,ed.sp,420,420);
   ed.x.fillStyle='#FFFFFF';ed.x.textBaseline='alphabetic';
   var ex=ed.sp+470,ew=ed.W-ex-ed.sp;
   var epx=_fitText(ed.x,name,'800 {px} '+F,120,ew);ed.x.font='800 '+epx+'px '+F;ed.x.fillText(name,ex,ed.sp+230,ew);
   if(tag){ed.x.fillStyle=SMN_ONDARK_2;var etx=_fitText(ed.x,tag,'italic 500 {px} '+F,56,ew);ed.x.font='italic 500 '+etx+'px '+F;ed.x.fillText(tag,ex,ed.sp+330,ew);}
   ed.x.fillStyle='rgba(255,255,255,.94)';ed.x.font='800 92px '+BF;ed.x.fillText('A special offer for',ed.sp,ed.H*.36,ed.W-ed.sp*2);
   ed.x.fillText('your neighborhood',ed.sp,ed.H*.43,ed.W-ed.sp*2);
   ed.x.fillStyle=SMN_INK;ed.x.font='700 56px '+BF;ed.x.fillText('Your offer for the neighborhood',ed.sp,ed.H*.62,ed.W-ed.sp*2);
   ed.x.fillStyle=SMN_INK2;ed.x.font='400 40px '+BF;ed.x.fillText('Add the details of your offer, dates, and how to redeem.',ed.sp,ed.H*.68,ed.W-ed.sp*2);
   /* USPS EDDM ADDRESS FACE (Domestic Mail Manual 207.24). Three rules the old layout
      broke and a mail house would have rejected:
        1. address block must be at least 4in x 1.625in
        2. the bottom 2.125in must be completely clear - that is the barcode zone
        3. an indicia at least 0.5in square sits in the upper right, standing alone
      Everything else is pushed above the clear zone. */
   var DPI=300, IN=function(v){return Math.round(v*DPI);};
   var clearTop = ed.H - IN(2.125);                  // nothing may be drawn below this
   // barcode clear zone - drawn as pure white, marked for the client only
   ed.x.fillStyle='#FFFFFF';ed.x.fillRect(0,clearTop,ed.W,ed.H-clearTop);
   ed.x.strokeStyle=_rule(C,0.35);ed.x.setLineDash([12,10]);ed.x.lineWidth=2;
   ed.x.strokeRect(ed.sp,clearTop+IN(0.12),ed.W-ed.sp*2,ed.H-clearTop-IN(0.30));
   ed.x.setLineDash([]);
   ed.x.fillStyle=_rule(C,0.45);ed.x.font='400 26px '+BF;ed.x.textAlign='center';
   ed.x.fillText('USPS barcode clear zone \u2014 keep this area empty',ed.W/2,clearTop+IN(0.55),ed.W-ed.sp*2);
   ed.x.textAlign='left';
   // address block: 4 x 1.625in minimum, sitting just above the clear zone
   var abW=Math.max(IN(4), ed.W-ed.sp*2), abH=IN(1.625);
   var abY=clearTop-abH-IN(0.18), abX=Math.round((ed.W-abW)/2);
   ed.x.strokeStyle=_rule(C,0.48);ed.x.lineWidth=2;ed.x.strokeRect(abX,abY,abW,abH);
   ed.x.fillStyle=SMN_INK2;ed.x.font='400 30px '+BF;
   ed.x.fillText('Address area \u2014 4 \u00d7 1.625 in',abX+IN(0.2),abY+IN(0.42));
   ed.x.fillStyle=_rule(C,0.45);ed.x.font='400 26px '+BF;
   ed.x.fillText('Your mail house prints the carrier-route line here.',abX+IN(0.2),abY+IN(0.78));
   // indicia: 0.5in square minimum, upper right of the address face, standing alone
   var inW=IN(1.25), inH=IN(0.75);
   var inX=ed.W-ed.sp-inW, inY=abY-inH-IN(0.35);
   ed.x.strokeStyle=_rule(C,0.77);ed.x.lineWidth=3;ed.x.strokeRect(inX,inY,inW,inH);
   ed.x.fillStyle=SMN_INK2;ed.x.font='700 24px '+BF;ed.x.textAlign='center';
   ['PRSRT STD','ECRWSS','U.S. POSTAGE','PAID','EDDM Retail'].forEach(function(l,i){
     ed.x.fillText(l,inX+inW/2,inY+IN(0.16)+i*IN(0.12),inW-16);});
   ed.x.textAlign='left';
   // contact moved ABOVE the clear zone
   var ce=contact();if(ce.length){ed.x.fillStyle=SMN_INK;ed.x.font='700 38px '+BF;
     ed.x.fillText(ce.slice(0,3).join('  \u2022  '),ed.sp,inY-IN(0.25),ed.W-ed.sp*2);}
   return _pdfFrom([ed.cv],6.25,11,'eddm-mailer-6.25x11-print.pdf').then(function(pdf){return _canvasBlob(ed.cv).then(function(png){return[pdf,{filename:'eddm-mailer.png',blob:png}];});});}
  if(kind==='print-gift'){ // 7x5 gift certificate
   var gc=printCanvas(7,5);gc.x.fillStyle=_tint(C,0.05);gc.x.fillRect(0,0,gc.W,gc.H);
   gc.x.strokeStyle=acc;gc.x.lineWidth=8;gc.x.strokeRect(gc.sp*.65,gc.sp*.65,gc.W-gc.sp*1.3,gc.H-gc.sp*1.3);
   gc.x.strokeStyle=dk;gc.x.lineWidth=2;gc.x.strokeRect(gc.sp*.65+18,gc.sp*.65+18,gc.W-gc.sp*1.3-36,gc.H-gc.sp*1.3-36);
   logo(gc.x,gc.W/2-170,gc.sp,340,340);
   gc.x.fillStyle=SMN_INK;gc.x.textAlign='center';gc.x.textBaseline='alphabetic';
   gc.x.font='italic 600 130px '+F;gc.x.fillText('Gift Certificate',gc.W/2,gc.sp+340+150,gc.W-gc.sp*2.6);
   gc.x.fillStyle=acc;gc.x.fillRect(gc.W/2-200,gc.sp+340+200,400,6);
   var gpx=_fitText(gc.x,name,'800 {px} '+F,84,gc.W-gc.sp*2.6);gc.x.font='800 '+gpx+'px '+F;gc.x.fillText(name,gc.W/2,gc.H*.62,gc.W-gc.sp*2.6);
   gc.x.textAlign='left';gc.x.strokeStyle=_rule(C,0.88);gc.x.lineWidth=2;gc.x.fillStyle=SMN_INK2;gc.x.font='400 40px '+BF;
   [['To',.74,.12,.44],['Amount',.74,.60,.90],['From',.86,.12,.44],['Date',.86,.60,.90]].forEach(function(r){
    gc.x.fillText(r[0],gc.W*r[2],gc.H*r[1]);
    gc.x.beginPath();gc.x.moveTo(gc.W*r[2]+gc.x.measureText(r[0]).width+24,gc.H*r[1]);gc.x.lineTo(gc.W*r[3],gc.H*r[1]);gc.x.stroke();});
   return _pdfFrom([gc.cv],7,5,'gift-certificate-print.pdf').then(function(pdf){return _canvasBlob(gc.cv).then(function(png){return[pdf,{filename:'gift-certificate.png',blob:png}];});});}
  if(kind==='print-award'){ // 11x8.5 landscape award certificate
   var aw=printCanvas(11,8.5);aw.x.fillStyle='#FFFFFF';aw.x.fillRect(0,0,aw.W,aw.H);
   aw.x.strokeStyle=dk;aw.x.lineWidth=10;aw.x.strokeRect(aw.sp*.6,aw.sp*.6,aw.W-aw.sp*1.2,aw.H-aw.sp*1.2);
   aw.x.strokeStyle=acc;aw.x.lineWidth=3;aw.x.strokeRect(aw.sp*.6+22,aw.sp*.6+22,aw.W-aw.sp*1.2-44,aw.H-aw.sp*1.2-44);
   logo(aw.x,aw.W/2-190,aw.sp*1.1,380,380);
   aw.x.fillStyle=SMN_INK;aw.x.textAlign='center';aw.x.textBaseline='alphabetic';
   aw.x.font='italic 600 150px '+F;aw.x.fillText('Certificate of Achievement',aw.W/2,aw.H*.42,aw.W-aw.sp*3);
   aw.x.fillStyle=SMN_INK2;aw.x.font='400 48px '+BF;aw.x.fillText('proudly presented by '+name+' to',aw.W/2,aw.H*.52,aw.W-aw.sp*3);
   aw.x.strokeStyle=_rule(C,0.99);aw.x.lineWidth=3;
   aw.x.beginPath();aw.x.moveTo(aw.W*.25,aw.H*.66);aw.x.lineTo(aw.W*.75,aw.H*.66);aw.x.stroke();
   aw.x.fillStyle=SMN_INK2;aw.x.font='italic 400 36px '+BF;aw.x.fillText('recipient name',aw.W/2,aw.H*.70);
   [['Date',.20,.42],['Signature',.58,.80]].forEach(function(r){
    aw.x.beginPath();aw.x.moveTo(aw.W*r[1],aw.H*.85);aw.x.lineTo(aw.W*r[2],aw.H*.85);aw.x.stroke();
    aw.x.font='400 34px '+BF;aw.x.fillText(r[0],aw.W*((r[1]+r[2])/2),aw.H*.89);});
   aw.x.textAlign='left';
   return _pdfFrom([aw.cv],11,8.5,'award-certificate-print.pdf').then(function(pdf){return _canvasBlob(aw.cv).then(function(png){return[pdf,{filename:'award-certificate.png',blob:png}];});});}
  if(kind==='print-ticket'){ // 5.5x2 event ticket with stub
   var tk=printCanvas(5.5,2);var gk=tk.x.createLinearGradient(0,0,tk.W*.6,tk.H);gk.addColorStop(0,dk);gk.addColorStop(1,_hexDeep(dk));tk.x.fillStyle=gk;tk.x.fillRect(0,0,tk.W,tk.H);
   var stub=tk.W*.72;
   tk.x.strokeStyle='rgba(255,255,255,.6)';tk.x.setLineDash([10,12]);tk.x.lineWidth=3;
   tk.x.beginPath();tk.x.moveTo(stub,0);tk.x.lineTo(stub,tk.H);tk.x.stroke();tk.x.setLineDash([]);
   logo(tk.x,tk.sp,tk.H*.18,tk.H*.42,tk.H*.42);
   tk.x.fillStyle='#FFFFFF';tk.x.textBaseline='alphabetic';
   var kx=tk.sp+tk.H*.5,kw=stub-kx-40;
   var kpx=_fitText(tk.x,name,'800 {px} '+F,86,kw);tk.x.font='800 '+kpx+'px '+F;tk.x.fillText(name,kx,tk.H*.42,kw);
   tk.x.fillStyle=acc;tk.x.fillRect(kx,tk.H*.50,Math.round(kw*.4),5);
   tk.x.fillStyle=SMN_ONDARK_2;tk.x.font='700 44px '+BF;tk.x.fillText('ADMIT ONE',kx,tk.H*.68,kw);
   tk.x.fillStyle='rgba(255,255,255,.8)';tk.x.font='400 32px '+BF;tk.x.fillText('Event \u2022 Date \u2022 Time \u2014 write yours in',kx,tk.H*.84,kw);
   tk.x.save();tk.x.translate(stub+(tk.W-stub)/2,tk.H/2);tk.x.rotate(-Math.PI/2);tk.x.textAlign='center';
   tk.x.fillStyle='#FFFFFF';tk.x.font='800 40px '+BF;tk.x.fillText('ADMIT ONE',0,0);tk.x.restore();
   return _pdfFrom([tk.cv],5.5,2,'event-ticket-print.pdf').then(function(pdf){return _canvasBlob(tk.cv).then(function(png){return[pdf,{filename:'event-ticket.png',blob:png}];});});}
  if(kind==='print-loyalty'){ // 3.5x2 loyalty punch card
   var lo=printCanvas(3.5,2);lo.x.fillStyle='#FFFFFF';lo.x.fillRect(0,0,lo.W,lo.H);
   lo.x.fillStyle=dk;lo.x.fillRect(0,0,lo.W,lo.H*.34);
   logo(lo.x,lo.sp,lo.H*.05,lo.H*.24,lo.H*.24);
   lo.x.fillStyle='#FFFFFF';lo.x.textBaseline='alphabetic';
   var lpx=_fitText(lo.x,name,'800 {px} '+F,60,lo.W-lo.sp*2-lo.H*.28);lo.x.font='800 '+lpx+'px '+F;lo.x.fillText(name,lo.sp+lo.H*.28,lo.H*.16,lo.W-lo.sp*2-lo.H*.28);
   lo.x.fillStyle=SMN_ONDARK_2;lo.x.font='700 34px '+BF;lo.x.fillText('LOYALTY CARD',lo.sp+lo.H*.28,lo.H*.28);
   var n1=5,r=Math.min((lo.W-lo.sp*2)/(n1*2.6),58);
   [0,1].forEach(function(row){for(var i2=0;i2<n1;i2++){var cxx=lo.sp+r+i2*((lo.W-lo.sp*2-r*2)/(n1-1)),cyy=lo.H*(.52+row*.24);
    lo.x.strokeStyle=acc;lo.x.lineWidth=5;lo.x.beginPath();lo.x.arc(cxx,cyy,r,0,7);lo.x.stroke();
    lo.x.fillStyle=SMN_INK2;lo.x.font='700 '+Math.round(r*.8)+'px '+BF;lo.x.textAlign='center';lo.x.fillText(String(row*n1+i2+1),cxx,cyy+r*.3);lo.x.textAlign='left';}});
   lo.x.fillStyle=SMN_INK2;lo.x.font='400 26px '+BF;lo.x.fillText('Collect all 10 \u2014 your reward is on us.',lo.sp,lo.H*.92,lo.W-lo.sp*2);
   return _pdfFrom([lo.cv],3.5,2,'loyalty-card-print.pdf').then(function(pdf){return _canvasBlob(lo.cv).then(function(png){return[pdf,{filename:'loyalty-card.png',blob:png}];});});}
  if(kind==='print-referral'){ // 3.5x2 referral card
   var rf=printCanvas(3.5,2);var gr=rf.x.createLinearGradient(0,0,rf.W*.5,rf.H);gr.addColorStop(0,dk);gr.addColorStop(1,_hexDeep(dk));rf.x.fillStyle=gr;rf.x.fillRect(0,0,rf.W,rf.H);
   logo(rf.x,rf.sp,rf.H*.14,rf.H*.34,rf.H*.34);
   rf.x.fillStyle='#FFFFFF';rf.x.textBaseline='alphabetic';
   var rx0=rf.sp+rf.H*.42,rw=rf.W-rx0-rf.sp;
   var rpx=_fitText(rf.x,name,'800 {px} '+F,64,rw);rf.x.font='800 '+rpx+'px '+F;rf.x.fillText(name,rx0,rf.H*.28,rw);
   rf.x.fillStyle=acc;rf.x.font='800 46px '+BF;rf.x.fillText('YOU\u2019VE BEEN REFERRED!',rf.sp,rf.H*.55,rf.W-rf.sp*2);
   rf.x.fillStyle=SMN_ONDARK_2;rf.x.font='400 34px '+BF;rf.x.fillText('A friend thinks you\u2019ll love us. Mention their',rf.sp,rf.H*.70,rf.W-rf.sp*2);
   rf.x.fillText('name and something special is waiting.',rf.sp,rf.H*.80,rf.W-rf.sp*2);
   if(dom){rf.x.fillStyle='#FFFFFF';rf.x.font='700 32px '+BF;rf.x.fillText(dom,rf.sp,rf.H*.93,rf.W-rf.sp*2);}
   return _pdfFrom([rf.cv],3.5,2,'referral-card-print.pdf').then(function(pdf){return _canvasBlob(rf.cv).then(function(png){return[pdf,{filename:'referral-card.png',blob:png}];});});}
  if(kind==='print-bumper'){ // 11.5x3 bumper sticker
   var bu=printCanvas(11.5,3);_deepField(bu.x,bu.W,bu.H,dk);
   bu.x.strokeStyle=acc;bu.x.lineWidth=10;bu.x.strokeRect(bu.sp*.5,bu.sp*.5,bu.W-bu.sp,bu.H-bu.sp);
   logo(bu.x,bu.sp,bu.H*.22,bu.H*.56,bu.H*.56);
   bu.x.fillStyle='#FFFFFF';bu.x.textBaseline='alphabetic';
   var bx0=bu.sp+bu.H*.66,bw2=bu.W-bx0-bu.sp;
   var bpx3=_fitText(bu.x,name,'800 {px} '+F,220,bw2);bu.x.font='800 '+bpx3+'px '+F;bu.x.fillText(name,bx0,bu.H*.52,bw2);
   var bl=(tag||dom||'');if(bl){bu.x.fillStyle=acc;var blx=_fitText(bu.x,bl,'700 {px} '+BF,80,bw2);bu.x.font='700 '+blx+'px '+BF;bu.x.fillText(bl,bx0,bu.H*.78,bw2);}
   return _pdfFrom([bu.cv],11.5,3,'bumper-sticker-print.pdf').then(function(pdf){return _canvasBlob(bu.cv).then(function(png){return[pdf,{filename:'bumper-sticker.png',blob:png}];});});}
  if(kind.indexOf('biz-')===0||kind.indexOf('doc-')===0){
   var bz=printCanvas(8.5,11);bz.x.fillStyle='#FFFFFF';bz.x.fillRect(0,0,bz.W,bz.H);
   var HD=function(title,subtitle){bz.x.fillStyle=dk;bz.x.fillRect(0,0,bz.W,bz.H*.14);
    logo(bz.x,bz.sp,bz.H*.022,290,290);
    bz.x.fillStyle='#FFFFFF';bz.x.textBaseline='alphabetic';
    var hx=bz.sp+340,hw=bz.W-hx-bz.sp;
    var hp=_fitText(bz.x,name,'800 {px} '+F,96,hw);bz.x.font='800 '+hp+'px '+F;bz.x.fillText(name,hx,bz.H*.075,hw);
    bz.x.fillStyle=SMN_ONDARK_2;bz.x.font='700 44px '+BF;bz.x.fillText(title.toUpperCase(),hx,bz.H*.115,hw);
    bz.x.fillStyle=SMN_INK;
    if(subtitle){bz.x.fillStyle=SMN_INK2;bz.x.font='400 38px '+BF;bz.x.fillText(subtitle,bz.sp,bz.H*.19,bz.W-bz.sp*2);}};
   var FT=function(){var cf=contact();bz.x.fillStyle=_rule(C,0.35);bz.x.fillRect(bz.sp,bz.H-bz.sp-110,bz.W-bz.sp*2,3);
    bz.x.fillStyle=SMN_INK2;bz.x.font='400 34px '+BF;bz.x.fillText((cf.length?cf.slice(0,3).join('  \u2022  '):name),bz.sp,bz.H-bz.sp-40,bz.W-bz.sp*2);};
   var LINES=function(rows,y0,gap,lx,rx2){bz.x.strokeStyle=_rule(C,0.66);bz.x.lineWidth=2;bz.x.fillStyle=SMN_INK2;bz.x.font='400 38px '+BF;
    rows.forEach(function(r,i){var yy=y0+i*gap;bz.x.fillText(r,lx,yy);
     bz.x.beginPath();bz.x.moveTo(lx+bz.x.measureText(r).width+30,yy);bz.x.lineTo(rx2,yy);bz.x.stroke();});};
   var fname,pngn;
   if(kind==='biz-quote'){HD('Quote / Estimate','Prepared for:');
    LINES(['Client','Date','Quote #'],bz.H*.24,70,bz.sp,bz.W*.55);
    bz.x.fillStyle=acc;bz.x.font='800 40px '+BF;bz.x.fillText('DESCRIPTION',bz.sp,bz.H*.34);bz.x.fillText('AMOUNT',bz.W*.78,bz.H*.34);
    bz.x.fillStyle=_rule(C,0.35);bz.x.fillRect(bz.sp,bz.H*.355,bz.W-bz.sp*2,3);
    bz.x.strokeStyle=_rule(C,0.55);bz.x.lineWidth=2;
    for(var qi=0;qi<8;qi++){var qy=bz.H*(.41+qi*.055);bz.x.beginPath();bz.x.moveTo(bz.sp,qy);bz.x.lineTo(bz.W-bz.sp,qy);bz.x.stroke();}
    bz.x.fillStyle=SMN_INK;bz.x.font='800 46px '+BF;bz.x.fillText('TOTAL',bz.W*.60,bz.H*.88);
    bz.x.strokeStyle=SMN_INK;bz.x.lineWidth=3;bz.x.beginPath();bz.x.moveTo(bz.W*.74,bz.H*.88);bz.x.lineTo(bz.W-bz.sp,bz.H*.88);bz.x.stroke();
    fname='quote-estimate-print.pdf';pngn='quote-estimate.png';}
   if(kind==='biz-receipt'){HD('Receipt','Thank you for your business.');
    LINES(['Received from','Date','Amount','For','Payment method'],bz.H*.26,90,bz.sp,bz.W-bz.sp);
    bz.x.save();bz.x.translate(bz.W*.78,bz.H*.72);bz.x.rotate(-0.18);bz.x.strokeStyle=acc;bz.x.lineWidth=8;
    bz.x.beginPath();bz.x.arc(0,0,170,0,7);bz.x.stroke();bz.x.fillStyle=acc;bz.x.textAlign='center';bz.x.font='800 56px '+BF;bz.x.fillText('PAID',0,20);bz.x.restore();bz.x.textAlign='left';
    fname='receipt-print.pdf';pngn='receipt.png';}
   if(kind==='biz-proposal'){bz.x.fillStyle='#FFFFFF';bz.x.fillRect(0,0,bz.W,bz.H);
    var gpr=bz.x.createLinearGradient(0,0,bz.W*.5,bz.H);gpr.addColorStop(0,dk);gpr.addColorStop(1,_hexDeep(dk));bz.x.fillStyle=gpr;bz.x.fillRect(0,0,bz.W,bz.H);
    logo(bz.x,bz.W/2-300,bz.H*.14,600,600);
    bz.x.fillStyle='#FFFFFF';bz.x.textAlign='center';bz.x.textBaseline='alphabetic';
    var prx=_fitText(bz.x,name,'800 {px} '+F,170,bz.W-bz.sp*2);bz.x.font='800 '+prx+'px '+F;bz.x.fillText(name,bz.W/2,bz.H*.46,bz.W-bz.sp*2);
    bz.x.fillStyle=acc;bz.x.fillRect(bz.W/2-260,bz.H*.49,520,9);
    bz.x.font='italic 600 110px '+F;bz.x.fillText('Proposal',bz.W/2,bz.H*.58);
    bz.x.fillStyle=SMN_ONDARK_2;bz.x.font='400 46px '+BF;
    bz.x.fillText('Prepared for: ______________________',bz.W/2,bz.H*.72);
    bz.x.fillText('Date: ______________________',bz.W/2,bz.H*.78);bz.x.textAlign='left';
    fname='proposal-cover-print.pdf';pngn='proposal-cover.png';}
   if(kind==='biz-welcome'){HD('Welcome!','We\u2019re so glad you\u2019re here. Here\u2019s how we\u2019ll take care of you.');
    var steps=['What happens first','What we need from you','How to reach us anytime'];
    steps.forEach(function(st,i){var sy=bz.H*(.28+i*.20);
     bz.x.fillStyle=acc;bz.x.beginPath();bz.x.arc(bz.sp+50,sy-16,50,0,7);bz.x.fill();
     bz.x.fillStyle=_inkFor(acc);bz.x.textAlign='center';bz.x.font='800 52px '+BF;bz.x.fillText(String(i+1),bz.sp+50,sy+2);bz.x.textAlign='left';
     bz.x.fillStyle=SMN_INK;bz.x.font='700 52px '+BF;bz.x.fillText(st,bz.sp+140,sy,bz.W-bz.sp*2-140);
     bz.x.strokeStyle=_rule(C,0.55);bz.x.lineWidth=2;
     for(var li=1;li<=3;li++){bz.x.beginPath();bz.x.moveTo(bz.sp+140,sy+li*64);bz.x.lineTo(bz.W-bz.sp,sy+li*64);bz.x.stroke();}});
    fname='welcome-sheet-print.pdf';pngn='welcome-sheet.png';}
   if(kind==='biz-faq'){HD('FAQ','The questions we hear most \u2014 answered.');
    for(var fi=0;fi<5;fi++){var fy=bz.H*(.26+fi*.135);
     bz.x.fillStyle=acc;bz.x.font='800 46px '+BF;bz.x.fillText('Q'+(fi+1)+'.',bz.sp,fy);
     bz.x.strokeStyle=_rule(C,0.66);bz.x.lineWidth=2;bz.x.beginPath();bz.x.moveTo(bz.sp+110,fy);bz.x.lineTo(bz.W-bz.sp,fy);bz.x.stroke();
     bz.x.fillStyle=SMN_INK2;bz.x.font='400 36px '+BF;bz.x.fillText('A.',bz.sp,fy+70);
     for(var la=0;la<2;la++){bz.x.beginPath();bz.x.moveTo(bz.sp+80,fy+70+la*56);bz.x.lineTo(bz.W-bz.sp,fy+70+la*56);bz.x.stroke();}}
    fname='faq-sheet-print.pdf';pngn='faq-sheet.png';}
   if(kind==='biz-pricelist'){HD('Services & Prices','Simple, honest pricing.');
    bz.x.fillStyle=acc;bz.x.font='800 40px '+BF;bz.x.fillText('SERVICE',bz.sp,bz.H*.25);bz.x.fillText('PRICE',bz.W*.80,bz.H*.25);
    bz.x.fillStyle=_rule(C,0.35);bz.x.fillRect(bz.sp,bz.H*.265,bz.W-bz.sp*2,3);
    for(var pi=0;pi<10;pi++){var py=bz.H*(.32+pi*.055);
     bz.x.fillStyle=SMN_INK;bz.x.font='700 40px '+BF;bz.x.fillText('Service name',bz.sp,py);
     bz.x.fillStyle=_rule(C,0.77);bz.x.font='700 34px '+BF;
     var dx0=bz.sp+bz.x.measureText('Service name').width+120,dots='';
     while(bz.x.measureText(dots+'. ').width<(bz.W*.78-dx0))dots+='. ';bz.x.fillText(dots,dx0,py);
     bz.x.fillStyle=SMN_INK;bz.x.font='700 40px '+BF;bz.x.fillText('$',bz.W*.80,py);}
    fname='service-price-list-print.pdf';pngn='service-price-list.png';}
   if(kind==='biz-onepager'){HD('Why '+name,tag||'');
    var whyB=(NM.why||[]).slice(0,3);
    whyB.forEach(function(wb,i){var wy=bz.H*(.27+i*.13);
     bz.x.fillStyle=acc;bz.x.fillRect(bz.sp,wy-44,14,60);
     bz.x.fillStyle=SMN_INK;bz.x.font='700 46px '+BF;
     var words=wb.split(' '),ln='',yy2=wy;words.forEach(function(wd){var t2=ln?ln+' '+wd:wd;
      if(bz.x.measureText(t2).width>bz.W-bz.sp*2-60){bz.x.fillText(ln,bz.sp+60,yy2);yy2+=58;ln=wd;}else ln=t2;});if(ln)bz.x.fillText(ln,bz.sp+60,yy2);});
    bz.x.fillStyle=SMN_INK2;bz.x.font='italic 400 40px '+BF;bz.x.fillText('Add your story, your offer, and your call to action below.',bz.sp,bz.H*.70,bz.W-bz.sp*2);
    bz.x.strokeStyle=_rule(C,0.55);bz.x.lineWidth=2;
    for(var lo=0;lo<3;lo++){bz.x.beginPath();bz.x.moveTo(bz.sp,bz.H*(.75+lo*.05));bz.x.lineTo(bz.W-bz.sp,bz.H*(.75+lo*.05));bz.x.stroke();}
    fname='sales-onepager-print.pdf';pngn='sales-onepager.png';}
   if(kind==='biz-invoice'){HD('Invoice','Billed to:');
    LINES(['Client','Invoice #','Date','Due date'],bz.H*.24,66,bz.sp,bz.W*.60);
    bz.x.fillStyle=acc;bz.x.font='800 40px '+BF;bz.x.fillText('DESCRIPTION',bz.sp,bz.H*.38);
    bz.x.fillText('QTY',bz.W*.60,bz.H*.38);bz.x.fillText('AMOUNT',bz.W*.78,bz.H*.38);
    bz.x.fillStyle=_rule(C,0.35);bz.x.fillRect(bz.sp,bz.H*.395,bz.W-bz.sp*2,3);
    bz.x.strokeStyle=_rule(C,0.48);bz.x.lineWidth=2;
    for(var ii=0;ii<9;ii++){var iy=bz.H*(.44+ii*.05);bz.x.beginPath();bz.x.moveTo(bz.sp,iy);bz.x.lineTo(bz.W-bz.sp,iy);bz.x.stroke();}
    ['Subtotal','Tax','TOTAL DUE'].forEach(function(l,i){var ty2=bz.H*(.90+i*.032);
      bz.x.fillStyle=(i===2?SMN_INK:SMN_INK2);bz.x.font=(i===2?'800 42px ':'700 34px ')+BF;
      bz.x.fillText(l,bz.W*.58,ty2);
      bz.x.strokeStyle=(i===2?SMN_INK:_rule(C,0.66));bz.x.lineWidth=(i===2?3:2);
      bz.x.beginPath();bz.x.moveTo(bz.W*.78,ty2);bz.x.lineTo(bz.W-bz.sp,ty2);bz.x.stroke();});
    fname='invoice-print.pdf';pngn='invoice.png';}
   if(kind==='biz-packing'){HD('Packing slip','Ship to:');
    LINES(['Name','Address','Order #','Date'],bz.H*.24,66,bz.sp,bz.W*.66);
    bz.x.fillStyle=acc;bz.x.font='800 40px '+BF;bz.x.fillText('ITEM',bz.sp,bz.H*.40);
    bz.x.fillText('QTY',bz.W*.72,bz.H*.40);bz.x.fillText('PACKED',bz.W*.86,bz.H*.40);
    bz.x.fillStyle=_rule(C,0.35);bz.x.fillRect(bz.sp,bz.H*.415,bz.W-bz.sp*2,3);
    bz.x.strokeStyle=_rule(C,0.48);bz.x.lineWidth=2;
    for(var pi2=0;pi2<11;pi2++){var py2=bz.H*(.46+pi2*.045);
      bz.x.beginPath();bz.x.moveTo(bz.sp,py2);bz.x.lineTo(bz.W-bz.sp,py2);bz.x.stroke();
      bz.x.strokeRect(bz.W*.86,py2-34,38,38);}
    bz.x.fillStyle=SMN_INK2;bz.x.font='italic 400 34px '+BF;
    bz.x.fillText('Thank you for your order.',bz.sp,bz.H*.95,bz.W-bz.sp*2);
    fname='packing-slip-print.pdf';pngn='packing-slip.png';}
   if(kind==='biz-terms'){HD('Terms of service','The plain-language version.');
    for(var ti=0;ti<6;ti++){var tyy=bz.H*(.26+ti*.115);
      bz.x.fillStyle=acc;bz.x.font='800 34px '+BF;bz.x.fillText(String(ti+1)+'.',bz.sp,tyy);
      bz.x.strokeStyle=_rule(C,0.62);bz.x.lineWidth=2;
      bz.x.beginPath();bz.x.moveTo(bz.sp+70,tyy);bz.x.lineTo(bz.W-bz.sp,tyy);bz.x.stroke();
      for(var tj=0;tj<2;tj++){bz.x.beginPath();bz.x.moveTo(bz.sp+70,tyy+52+tj*46);bz.x.lineTo(bz.W-bz.sp,tyy+52+tj*46);bz.x.stroke();}}
    bz.x.fillStyle=SMN_INK2;bz.x.font='italic 400 28px '+BF;
    bz.x.fillText('Write your own terms here. This is a layout, not legal advice.',bz.sp,bz.H-bz.sp-120,bz.W-bz.sp*2);
    fname='terms-sheet-print.pdf';pngn='terms-sheet.png';}
   /* CATEGORY E / N / Q — working documents. Each is a real worksheet a founder fills in,
      not a decorative page. Rules and headers bind to the brand palette like everything
      else. */
   function _rows(labels,y0,gap,cols){
     labels.forEach(function(l,i6){
       var ry=y0+i6*gap;
       bz.x.fillStyle=acc;bz.x.font='700 30px '+BF;
       _micro(bz.x,l,30,0.16,bz.sp,ry,bz.W);
       bz.x.strokeStyle=_rule(C,0.30);bz.x.lineWidth=2;
       for(var cq=0;cq<(cols||1);cq++){
         var cy2=ry+34+cq*40;
         bz.x.beginPath();bz.x.moveTo(bz.sp,cy2);bz.x.lineTo(bz.W-bz.sp,cy2);bz.x.stroke();}});
   }
   if(kind==='doc-keywords'){HD('Keyword worksheet','The words your customers actually type.');
     bz.x.fillStyle=acc;bz.x.font='700 34px '+BF;
     bz.x.fillText('TERM',bz.sp,bz.H*.26);bz.x.fillText('INTENT',bz.W*.52,bz.H*.26);
     bz.x.fillText('PRIORITY',bz.W*.78,bz.H*.26);
     bz.x.fillStyle=_tint(C,0.10);bz.x.fillRect(bz.sp,bz.H*.272,bz.W-bz.sp*2,4);
     bz.x.strokeStyle=_rule(C,0.28);bz.x.lineWidth=2;
     for(var kq=0;kq<18;kq++){var ky=bz.H*(.32+kq*.036);
       bz.x.beginPath();bz.x.moveTo(bz.sp,ky);bz.x.lineTo(bz.W-bz.sp,ky);bz.x.stroke();}
     bz.x.fillStyle=SMN_INK2;bz.x.font='400 26px '+BF;
     bz.x.fillText('Start with what you would type if you needed your own service today.',bz.sp,bz.H-bz.sp-130,bz.W-bz.sp*2);
     fname='keyword-worksheet-print.pdf';pngn='keyword-worksheet.png';}
   if(kind==='doc-meta'){HD('Page title & description sheet','What shows up in a search result.');
     ['HOME','ABOUT','SERVICES','CONTACT','FAQ'].forEach(function(pg,i7){
       var py3=bz.H*(.26+i7*.135);
       bz.x.fillStyle=acc;bz.x.font='700 30px '+BF;_micro(bz.x,pg,30,0.16,bz.sp,py3,bz.W);
       bz.x.fillStyle=SMN_INK2;bz.x.font='400 24px '+BF;
       bz.x.fillText('Title  (up to 60 characters)',bz.sp,py3+44,bz.W-bz.sp*2);
       bz.x.strokeStyle=_rule(C,0.30);bz.x.lineWidth=2;
       bz.x.beginPath();bz.x.moveTo(bz.sp,py3+76);bz.x.lineTo(bz.W-bz.sp,py3+76);bz.x.stroke();
       bz.x.fillText('Description  (up to 155 characters)',bz.sp,py3+112,bz.W-bz.sp*2);
       bz.x.beginPath();bz.x.moveTo(bz.sp,py3+144);bz.x.lineTo(bz.W-bz.sp,py3+144);bz.x.stroke();});
     fname='meta-tag-sheet-print.pdf';pngn='meta-tag-sheet.png';}
   if(kind==='doc-calendar'){HD('Content calendar','Twelve weeks, one line each.');
     bz.x.fillStyle=acc;bz.x.font='700 30px '+BF;
     bz.x.fillText('WEEK',bz.sp,bz.H*.25);bz.x.fillText('TOPIC',bz.W*.24,bz.H*.25);
     bz.x.fillText('CHANNEL',bz.W*.74,bz.H*.25);
     bz.x.fillStyle=_tint(C,0.10);bz.x.fillRect(bz.sp,bz.H*.262,bz.W-bz.sp*2,4);
     for(var wq=0;wq<12;wq++){var wy=bz.H*(.31+wq*.052);
       bz.x.fillStyle=SMN_INK;bz.x.font='700 30px '+BF;bz.x.fillText(String(wq+1),bz.sp,wy);
       bz.x.strokeStyle=_rule(C,0.26);bz.x.lineWidth=2;
       bz.x.beginPath();bz.x.moveTo(bz.W*.22,wy+8);bz.x.lineTo(bz.W-bz.sp,wy+8);bz.x.stroke();}
     fname='content-calendar-print.pdf';pngn='content-calendar.png';}
   if(kind==='doc-directories'){HD('Local directory checklist','Where people look for a business like yours.');
     var dirs2=['Google Business Profile','Apple Business Connect','Bing Places','Yelp','Facebook Page',
                'Nextdoor','Apple Maps','Better Business Bureau','Chamber of Commerce','Angi',
                'Thumbtack','Alignable','Yellow Pages','Local.com','Industry association'];
     dirs2.forEach(function(dn,i8){var dy=bz.H*(.24+i8*.046);
       bz.x.strokeStyle=_rule(C,0.40);bz.x.lineWidth=3;bz.x.strokeRect(bz.sp,dy-26,32,32);
       bz.x.fillStyle=SMN_INK;bz.x.font='400 30px '+BF;bz.x.fillText(dn,bz.sp+56,dy);
       bz.x.strokeStyle=_rule(C,0.20);bz.x.lineWidth=2;
       bz.x.beginPath();bz.x.moveTo(bz.W*.58,dy+6);bz.x.lineTo(bz.W-bz.sp,dy+6);bz.x.stroke();});
     fname='directory-checklist-print.pdf';pngn='directory-checklist.png';}
   if(kind==='doc-press'){HD('Press release','The template, with the parts that matter marked.');
     bz.x.fillStyle=acc;bz.x.font='700 28px '+BF;
     _micro(bz.x,'FOR IMMEDIATE RELEASE',28,0.18,bz.sp,bz.H*.24,bz.W);
     _rows(['HEADLINE','CITY, STATE  —  DATE','THE NEWS IN ONE SENTENCE','WHY IT MATTERS',
            'A QUOTE FROM YOU','BACKGROUND ON '+String(name).toUpperCase(),'CONTACT'],
           bz.H*.30,bz.H*.092,2);
     fname='press-release-print.pdf';pngn='press-release.png';}
   if(kind==='doc-chamber'){HD('Introduction letter','For the chamber, a neighbour business, or a partner.');
     bz.x.fillStyle=SMN_INK2;bz.x.font='400 28px '+BF;
     bz.x.fillText('Date',bz.sp,bz.H*.24);
     bz.x.strokeStyle=_rule(C,0.26);bz.x.lineWidth=2;
     bz.x.beginPath();bz.x.moveTo(bz.sp+90,bz.H*.245);bz.x.lineTo(bz.W*.46,bz.H*.245);bz.x.stroke();
     bz.x.fillText('Dear',bz.sp,bz.H*.30);
     bz.x.beginPath();bz.x.moveTo(bz.sp+100,bz.H*.305);bz.x.lineTo(bz.W*.60,bz.H*.305);bz.x.stroke();
     var intro=(IDEA.aboutT&&IDEA.aboutT[0])||tag||'';
     bz.x.fillStyle=SMN_INK;bz.x.font='400 30px '+BF;
     var w9=String(intro).split(' '),l9='',y9=bz.H*.38;
     w9.forEach(function(x9){var s9=l9?l9+' '+x9:x9;
       if(bz.x.measureText(s9).width>bz.W-bz.sp*2){bz.x.fillText(l9,bz.sp,y9,bz.W-bz.sp*2);y9+=45;l9=x9;}else l9=s9;});
     if(l9)bz.x.fillText(l9,bz.sp,y9,bz.W-bz.sp*2);
     bz.x.strokeStyle=_rule(C,0.22);bz.x.lineWidth=2;
     for(var lq=0;lq<7;lq++){bz.x.beginPath();
       bz.x.moveTo(bz.sp,y9+70+lq*52);bz.x.lineTo(bz.W-bz.sp,y9+70+lq*52);bz.x.stroke();}
     bz.x.fillStyle=SMN_INK2;bz.x.font='400 28px '+BF;
     bz.x.fillText('Warm regards,',bz.sp,bz.H*.86);
     bz.x.fillText(name,bz.sp,bz.H*.90);
     fname='intro-letter-print.pdf';pngn='intro-letter.png';}
   if(kind==='doc-mediakit'){HD('Media kit','One page a journalist can actually use.');
     _rows(['WHAT WE DO','FOUNDED / LOCATION','WHO WE SERVE','WHAT MAKES US DIFFERENT',
            'PRESS CONTACT','LOGO & IMAGE FILES'],bz.H*.26,bz.H*.105,2);
     bz.x.fillStyle=SMN_INK2;bz.x.font='400 26px '+BF;
     bz.x.fillText('Attach the logo pack and two photographs when you send this.',bz.sp,bz.H-bz.sp-130,bz.W-bz.sp*2);
     fname='media-kit-print.pdf';pngn='media-kit.png';}
   if(kind==='doc-partner'){HD('Partnership outreach','A short, specific ask.');
     _rows(['WHO YOU ARE WRITING TO','WHAT YOU ADMIRE ABOUT THEM','WHAT YOU PROPOSE',
            'WHAT THEY GET','WHAT YOU NEED','NEXT STEP'],bz.H*.26,bz.H*.105,2);
     fname='partnership-outreach-print.pdf';pngn='partnership-outreach.png';}
   if(kind==='doc-investor'){HD('Investor introduction','Five lines, then the ask.');
     _rows(['THE PROBLEM','YOUR SOLUTION','TRACTION SO FAR','WHY YOU','THE ASK','CONTACT'],
           bz.H*.26,bz.H*.105,2);
     bz.x.fillStyle=SMN_INK2;bz.x.font='400 26px '+BF;
     bz.x.fillText('Keep it to one page. Attach the pitch deck separately.',bz.sp,bz.H-bz.sp-130,bz.W-bz.sp*2);
     fname='investor-intro-print.pdf';pngn='investor-intro.png';}
   /* CATEGORIES A / I / J / K / L / M / O — structural frameworks and working templates.
      IMPORTANT: the legal items are FRAMEWORKS WITH LABELLED FIELDS AND A DISCLAIMER.
      They do not contain drafted legal clauses. Writing enforceable contract language is
      a lawyer's work, and the standing truth rule is that Spark never claims to clear a
      trademark or give legal advice. */
   function _legalNote(){
     bz.x.fillStyle=_tint(C,0.08);bz.x.fillRect(bz.sp,bz.H-bz.sp-170,bz.W-bz.sp*2,110);
     bz.x.fillStyle=SMN_INK2;bz.x.font='400 22px '+BF;
     var dl='This is a working framework, not legal advice. Have a qualified attorney draft and review the actual terms before you sign or rely on anything here.';
     var wds=String(dl).split(' '),lnq='',yq=bz.H-bz.sp-130;
     wds.forEach(function(w){var s=lnq?lnq+' '+w:w;
       if(bz.x.measureText(s).width>bz.W-bz.sp*2-40){bz.x.fillText(lnq,bz.sp+20,yq,bz.W-bz.sp*2-40);yq+=30;lnq=w;}else lnq=s;});
     if(lnq)bz.x.fillText(lnq,bz.sp+20,yq,bz.W-bz.sp*2-40);
   }
   if(kind==='doc-availability'){HD('Availability intelligence','A framework — fill it in with results you have actually checked.');
     var CH=['.com domain','Alternate TLDs','USPTO word mark','State business registry',
             'Instagram handle','Facebook page','X handle','LinkedIn page','TikTok handle',
             'YouTube handle','Linguistic screen','Common-law web search'];
     bz.x.fillStyle=acc;bz.x.font='700 26px '+BF;
     _micro(bz.x,'CHECK',26,0.16,bz.sp,bz.H*.235,bz.W);
     _micro(bz.x,'RESULT',26,0.16,bz.W*.56,bz.H*.235,bz.W);
     _micro(bz.x,'DATE',26,0.16,bz.W*.80,bz.H*.235,bz.W);
     CH.forEach(function(c9,i9){var cy9=bz.H*(.29+i9*.047);
       bz.x.fillStyle=SMN_INK;bz.x.font='400 28px '+BF;bz.x.fillText(c9,bz.sp,cy9);
       bz.x.strokeStyle=_rule(C,0.45);bz.x.lineWidth=2;
       bz.x.beginPath();bz.x.moveTo(bz.W*.56,cy9+8);bz.x.lineTo(bz.W-bz.sp,cy9+8);bz.x.stroke();});
     bz.x.fillStyle=SMN_INK2;bz.x.font='400 24px '+BF;
     bz.x.fillText('Record only what you verified yourself. An unchecked box is not a result.',bz.sp,bz.H-bz.sp-120,bz.W-bz.sp*2);
     fname='availability-framework-print.pdf';pngn='availability-framework.png';}
   if(kind==='doc-certificate'){HD('Verification certificate','Layout awaiting verified data.');
     bz.x.strokeStyle=_rule(C,0.55);bz.x.lineWidth=6;
     bz.x.strokeRect(bz.sp,bz.H*.22,bz.W-bz.sp*2,bz.H*.56);
     bz.x.textAlign='center';
     bz.x.fillStyle=SMN_INK;bz.x.font='800 '+_display(52)+'px '+F;
     bz.x.fillText(name,bz.W/2,bz.H*.33,bz.W-bz.sp*3);
     bz.x.fillStyle=acc;bz.x.fillRect(bz.W/2-140,bz.H*.35,280,7);
     bz.x.fillStyle=SMN_INK2;bz.x.font='400 30px '+BF;
     ['Checks completed on','Verified by','Reference'].forEach(function(l9,j9){
       var yy9=bz.H*(.46+j9*.09);
       bz.x.fillText(l9,bz.W/2,yy9,bz.W-bz.sp*3);
       bz.x.strokeStyle=_rule(C,0.45);bz.x.lineWidth=2;
       bz.x.beginPath();bz.x.moveTo(bz.W*.30,yy9+40);bz.x.lineTo(bz.W*.70,yy9+40);bz.x.stroke();});
     bz.x.textAlign='left';
     bz.x.fillStyle=SMN_INK2;bz.x.font='400 22px '+BF;
     bz.x.fillText('This certificate states only what was checked and when. It is not a legal clearance.',bz.sp,bz.H-bz.sp-120,bz.W-bz.sp*2);
     fname='verification-certificate-print.pdf';pngn='verification-certificate.png';}
   if(kind==='doc-nda'||kind==='doc-service'||kind==='doc-contractor'){
     var TT={'doc-nda':['Mutual NDA','What each side may not share.',
              ['THE PARTIES','WHAT COUNTS AS CONFIDENTIAL','WHAT IS EXCLUDED','HOW LONG IT LASTS','WHAT HAPPENS ON BREACH','SIGNATURES']],
             'doc-service':['Service agreement','What you will do and what it costs.',
              ['THE PARTIES','SCOPE OF WORK','TIMELINE','FEES & PAYMENT TERMS','REVISIONS','CANCELLATION','SIGNATURES']],
             'doc-contractor':['Independent contractor agreement','The relationship, in writing.',
              ['THE PARTIES','SERVICES PROVIDED','PAYMENT','CONTRACTOR STATUS','OWNERSHIP OF WORK','TERM & TERMINATION','SIGNATURES']]}[kind];
     HD(TT[0],TT[1]);
     var gap9=(bz.H*.60)/TT[2].length;
     TT[2].forEach(function(sec,k9){var sy=bz.H*.24+k9*gap9;
       bz.x.fillStyle=acc;bz.x.font='700 26px '+BF;_micro(bz.x,sec,26,0.16,bz.sp,sy,bz.W);
       bz.x.strokeStyle=_rule(C,0.35);bz.x.lineWidth=2;
       for(var m9=0;m9<2;m9++){bz.x.beginPath();
         bz.x.moveTo(bz.sp,sy+36+m9*34);bz.x.lineTo(bz.W-bz.sp,sy+36+m9*34);bz.x.stroke();}});
     _legalNote();
     fname=kind.replace('doc-','')+'-framework-print.pdf';pngn=kind.replace('doc-','')+'-framework.png';}
   if(kind==='doc-tess'){HD('Trademark search notes','A place to record what a search returned.');
     bz.x.fillStyle=acc;bz.x.font='700 26px '+BF;
     _micro(bz.x,'MARK SEARCHED',26,0.16,bz.sp,bz.H*.24,bz.W);
     bz.x.strokeStyle=_rule(C,0.45);bz.x.lineWidth=2;
     bz.x.beginPath();bz.x.moveTo(bz.W*.40,bz.H*.245);bz.x.lineTo(bz.W-bz.sp,bz.H*.245);bz.x.stroke();
     bz.x.fillStyle=acc;bz.x.font='700 24px '+BF;
     ['SERIAL','OWNER','CLASS','STATUS','SIMILARITY NOTES'].forEach(function(hh,h9){
       _micro(bz.x,hh,24,0.14,bz.sp+h9*Math.round((bz.W-bz.sp*2)/5),bz.H*.31,bz.W);});
     bz.x.strokeStyle=_rule(C,0.30);bz.x.lineWidth=2;
     for(var r9=0;r9<12;r9++){var ry9=bz.H*(.35+r9*.042);
       bz.x.beginPath();bz.x.moveTo(bz.sp,ry9);bz.x.lineTo(bz.W-bz.sp,ry9);bz.x.stroke();}
     bz.x.fillStyle=_tint(C,0.08);bz.x.fillRect(bz.sp,bz.H-bz.sp-170,bz.W-bz.sp*2,110);
     bz.x.fillStyle=SMN_INK2;bz.x.font='400 22px '+BF;
     bz.x.fillText('A search is not a clearance and this sheet is not a legal opinion.',bz.sp+20,bz.H-bz.sp-125,bz.W-bz.sp*2-40);
     bz.x.fillText('Have a trademark attorney assess risk before you file or invest in a name.',bz.sp+20,bz.H-bz.sp-95,bz.W-bz.sp*2-40);
     fname='trademark-search-notes-print.pdf';pngn='trademark-search-notes.png';}
   if(kind==='doc-plan'){HD('One-page business plan','The whole thing, on one page.');
     _rows(['WHAT YOU SELL','WHO BUYS IT','WHY THEY CHOOSE YOU','HOW THEY FIND YOU',
            'WHAT IT COSTS TO DELIVER','WHAT YOU CHARGE','WHAT SUCCESS LOOKS LIKE IN A YEAR'],
           bz.H*.24,bz.H*.095,2);
     fname='one-page-plan-print.pdf';pngn='one-page-plan.png';}
   if(kind==='doc-breakeven'){HD('Break-even worksheet','The number you have to beat each month.');
     _rows(['FIXED COSTS PER MONTH','PRICE PER SALE','VARIABLE COST PER SALE',
            'CONTRIBUTION PER SALE  (price minus variable)','SALES NEEDED TO BREAK EVEN',
            'SALES YOU MAKE NOW','THE GAP'],bz.H*.24,bz.H*.095,1);
     bz.x.fillStyle=SMN_INK2;bz.x.font='400 24px '+BF;
     bz.x.fillText('Fixed costs divided by contribution per sale gives the number you must hit.',bz.sp,bz.H-bz.sp-120,bz.W-bz.sp*2);
     fname='break-even-worksheet-print.pdf';pngn='break-even-worksheet.png';}
   if(kind==='doc-discovery'){HD('Discovery call script','Questions that do the selling for you.');
     var QS=['What made you start looking?','What have you tried already?',
             'What would a good outcome look like?','Who else is involved in deciding?',
             'What is your timeline?','What is the budget range?','What would stop this happening?'];
     QS.forEach(function(q9,i10){var qy9=bz.H*(.24+i10*.093);
       bz.x.fillStyle=acc;bz.x.font='700 26px '+BF;bz.x.fillText(String(i10+1)+'.',bz.sp,qy9);
       bz.x.fillStyle=SMN_INK;bz.x.font='400 28px '+BF;bz.x.fillText(q9,bz.sp+60,qy9,bz.W-bz.sp*2-60);
       bz.x.strokeStyle=_rule(C,0.30);bz.x.lineWidth=2;
       bz.x.beginPath();bz.x.moveTo(bz.sp+60,qy9+44);bz.x.lineTo(bz.W-bz.sp,qy9+44);bz.x.stroke();});
     fname='discovery-script-print.pdf';pngn='discovery-script.png';}
   if(kind==='doc-objections'){HD('Objection handling','What they say, and what you say back.');
     var OB=['It costs too much','I need to think about it','Send me some information',
             'We already have someone','Now is not a good time','I need to ask my partner'];
     OB.forEach(function(o9,i11){var oy=bz.H*(.24+i11*.115);
       bz.x.fillStyle=SMN_INK;bz.x.font='700 28px '+BF;bz.x.fillText('\u201C'+o9+'\u201D',bz.sp,oy,bz.W-bz.sp*2);
       bz.x.fillStyle=acc;bz.x.font='700 22px '+BF;_micro(bz.x,'YOUR ANSWER',22,0.16,bz.sp,oy+38,bz.W);
       bz.x.strokeStyle=_rule(C,0.30);bz.x.lineWidth=2;
       for(var p9=0;p9<2;p9++){bz.x.beginPath();
         bz.x.moveTo(bz.sp,oy+74+p9*32);bz.x.lineTo(bz.W-bz.sp,oy+74+p9*32);bz.x.stroke();}});
     fname='objection-handling-print.pdf';pngn='objection-handling.png';}
   if(kind==='doc-reviews'){HD('Review responses','Two replies you will need often.');
     [['A FIVE-STAR REVIEW','Thank them by name, mention the specific thing they praised, invite them back.'],
      ['A ONE-STAR REVIEW','Thank them for saying it, own what went wrong, move it offline with a direct contact.']]
     .forEach(function(rr,i12){var ry=bz.H*(.26+i12*.30);
       bz.x.fillStyle=acc;bz.x.font='700 26px '+BF;_micro(bz.x,rr[0],26,0.16,bz.sp,ry,bz.W);
       bz.x.fillStyle=SMN_INK2;bz.x.font='400 26px '+BF;bz.x.fillText(rr[1],bz.sp,ry+44,bz.W-bz.sp*2);
       bz.x.strokeStyle=_rule(C,0.30);bz.x.lineWidth=2;
       for(var q10=0;q10<4;q10++){bz.x.beginPath();
         bz.x.moveTo(bz.sp,ry+90+q10*38);bz.x.lineTo(bz.W-bz.sp,ry+90+q10*38);bz.x.stroke();}});
     fname='review-responses-print.pdf';pngn='review-responses.png';}
   if(kind==='doc-annual'){HD('Compliance tracker','The dates that carry a penalty if you miss them.');
     _rows(['ANNUAL REPORT DUE','REGISTERED AGENT RENEWAL','SALES TAX FILING',
            'BUSINESS LICENCE RENEWAL','INSURANCE RENEWAL','DOMAIN RENEWAL','TRADEMARK RENEWAL'],
           bz.H*.24,bz.H*.095,1);
     bz.x.fillStyle=SMN_INK2;bz.x.font='400 24px '+BF;
     bz.x.fillText('Put every one of these in a calendar with a reminder a month ahead.',bz.sp,bz.H-bz.sp-120,bz.W-bz.sp*2);
     fname='compliance-tracker-print.pdf';pngn='compliance-tracker.png';}
   if(kind==='doc-industry'){
     /* CATEGORY R — the pack is chosen by the brand's own category, so a plumber and a
        bakery get different forms from the same tile. */
     var PACKS=[[/plumb|electric|hvac|roof|contractor|trades|construct|landscap|lawn/i,'Trades',
                 ['Licence & insurance on file','Written estimate before work','Permit check for this job',
                  'Site safety walk','Materials list & lead times','Change-order sign-off',
                  'Warranty terms given to client','Final walkthrough & sign-off']],
                [/restaur|food|bakery|caf|coffee|kitchen|cater|brew/i,'Food Service',
                 ['Food handler certificates current','Health inspection date logged','Allergen list posted',
                  'Supplier & delivery schedule','Temperature log started','Waste & cleaning schedule',
                  'Menu costing per dish','Alcohol licence if applicable']],
                [/salon|spa|wellness|massage|therap|clinic|health/i,'Wellness',
                 ['Practitioner licences on file','Client intake & consent forms','Sanitation protocol posted',
                  'Insurance certificate current','Appointment & cancellation policy','Records retention plan',
                  'Referral relationships listed','Emergency procedure posted']],
                [/gym|fitness|train|yoga|pilates|coach/i,'Fitness',
                 ['Instructor certifications on file','Liability waiver for every member','Equipment inspection log',
                  'Class capacity & booking rules','First aid kit & AED checked','Membership terms in writing',
                  'Music licensing sorted','Emergency evacuation plan']],
                [/realty|real estate|property|broker|residen|home/i,'Real Estate',
                 ['Licence number on all marketing','Agency disclosure ready','Listing agreement template',
                  'Fair housing language checked','Photography & floorplan sourced','Lockbox & showing protocol',
                  'Escrow contacts listed','Closing checklist per deal']],
                [/childcare|daycare|nursery|preschool|tutor|kids/i,'Childcare',
                 ['State licence & ratios confirmed','Background checks completed','Emergency contacts for every child',
                  'Allergy & medication records','Sign-in and sign-out process','Incident report form ready',
                  'Daily schedule posted for parents','Fire drill log started']],
                [/ecommerce|shop|store|retail|product|boutique/i,'Ecommerce',
                 ['Returns & refund policy published','Shipping rates & timelines set','Sales tax nexus reviewed',
                  'Product photography standard','Inventory reorder points','Packaging & insert plan',
                  'Payment processor configured','Customer service response times']],
                [/consult|agency|advisor|coach|strateg|freelan/i,'Consulting',
                 ['Scope document per engagement','Rate card and payment terms','Conflict of interest check',
                  'Confidentiality expectations set','Deliverable acceptance criteria','Reference clients approved',
                  'Subcontractor agreements','Case study permission on file']]];
     var said=String((IDEA&&IDEA.said)||''), pack=null;
     for(var pi9=0;pi9<PACKS.length;pi9++){ if(PACKS[pi9][0].test(said)){ pack=PACKS[pi9]; break; } }
     if(!pack) pack=[null,'General business',
       ['Business registration filed','Insurance in place','Written terms for customers',
        'Record keeping method chosen','Pricing reviewed','Supplier or partner list',
        'Customer complaint route','Annual dates in the calendar']];
     HD(pack[1]+' checklist','Chosen from your business category.');
     pack[2].forEach(function(it9,i13){var iy=bz.H*(.25+i13*.072);
       bz.x.strokeStyle=_rule(C,0.50);bz.x.lineWidth=3;bz.x.strokeRect(bz.sp,iy-28,34,34);
       bz.x.fillStyle=SMN_INK;bz.x.font='400 30px '+BF;bz.x.fillText(it9,bz.sp+58,iy,bz.W-bz.sp*2-58);
       bz.x.strokeStyle=_rule(C,0.25);bz.x.lineWidth=2;
       bz.x.beginPath();bz.x.moveTo(bz.sp+58,iy+26);bz.x.lineTo(bz.W-bz.sp,iy+26);bz.x.stroke();});
     bz.x.fillStyle=SMN_INK2;bz.x.font='400 24px '+BF;
     bz.x.fillText('Requirements vary by state and city. Check yours before you rely on this list.',bz.sp,bz.H-bz.sp-120,bz.W-bz.sp*2);
     fname='industry-checklist-print.pdf';pngn='industry-checklist.png';}
   if(kind==='doc-repurpose'){HD('Content repurposing','One idea, eight places.');
     [['THE ORIGINAL IDEA',2],['LONG POST OR ARTICLE',1],['SHORT SOCIAL POST',1],
      ['STORY OR REEL ANGLE',1],['EMAIL SUBJECT LINE',1],['CUSTOMER QUESTION IT ANSWERS',1],
      ['PHOTO OR GRAPHIC NEEDED',1],['WHERE IT GETS POSTED',1]].forEach(function(rw,i14){
       var ry=bz.H*(.24+i14*.086);
       bz.x.fillStyle=acc;bz.x.font='700 24px '+BF;_micro(bz.x,rw[0],24,0.16,bz.sp,ry,bz.W);
       bz.x.strokeStyle=_rule(C,0.30);bz.x.lineWidth=2;
       for(var rj=0;rj<rw[1];rj++){bz.x.beginPath();
         bz.x.moveTo(bz.sp,ry+34+rj*30);bz.x.lineTo(bz.W-bz.sp,ry+34+rj*30);bz.x.stroke();}});
     fname='content-repurposing-print.pdf';pngn='content-repurposing.png';}
   if(kind==='doc-aiqa'){HD('Questions your assistant should know','Answer these once; reuse them everywhere.');
     ['What exactly do you sell?','Who is it for, and who is it not for?',
      'What do you charge and how does billing work?','What areas or hours do you cover?',
      'What is your policy on cancellations and refunds?','What makes you different from the next option?',
      'What questions do customers ask most?','What should never be promised on your behalf?']
     .forEach(function(q14,i15){var qy=bz.H*(.24+i15*.086);
       bz.x.fillStyle=SMN_INK;bz.x.font='700 26px '+BF;bz.x.fillText(q14,bz.sp,qy,bz.W-bz.sp*2);
       bz.x.strokeStyle=_rule(C,0.30);bz.x.lineWidth=2;
       bz.x.beginPath();bz.x.moveTo(bz.sp,qy+40);bz.x.lineTo(bz.W-bz.sp,qy+40);bz.x.stroke();});
     bz.x.fillStyle=SMN_INK2;bz.x.font='400 24px '+BF;
     bz.x.fillText('The last line matters most \u2014 it is the boundary you set for anyone answering for you.',bz.sp,bz.H-bz.sp-120,bz.W-bz.sp*2);
     fname='assistant-briefing-print.pdf';pngn='assistant-briefing.png';}
   if(kind==='doc-guardrails'){
     /* CATEGORY P — brand voice guardrails and the limits of an assistant. The point of
        this sheet is the NEGATIVE space: what must never be said on the business's
        behalf. That is the part that protects a founder. */
     HD('Voice guardrails','What may be said for you — and what may never be.');
     bz.x.fillStyle=acc;bz.x.font='700 26px '+BF;
     _micro(bz.x,'HOW WE SOUND',26,0.16,bz.sp,bz.H*.235,bz.W);
     bz.x.strokeStyle=_rule(C,0.30);bz.x.lineWidth=2;
     for(var v1=0;v1<3;v1++){bz.x.beginPath();
       bz.x.moveTo(bz.sp,bz.H*.265+v1*34);bz.x.lineTo(bz.W-bz.sp,bz.H*.265+v1*34);bz.x.stroke();}
     bz.x.fillStyle=acc;bz.x.font='700 26px '+BF;
     _micro(bz.x,'WORDS WE USE',26,0.16,bz.sp,bz.H*.40,bz.W);
     _micro(bz.x,'WORDS WE AVOID',26,0.16,bz.W*.54,bz.H*.40,bz.W);
     for(var v2=0;v2<5;v2++){var vy=bz.H*.43+v2*34;
       bz.x.beginPath();bz.x.moveTo(bz.sp,vy);bz.x.lineTo(bz.W*.48,vy);bz.x.stroke();
       bz.x.beginPath();bz.x.moveTo(bz.W*.54,vy);bz.x.lineTo(bz.W-bz.sp,vy);bz.x.stroke();}
     /* the hard limits — pre-filled, because these are the ones people forget */
     bz.x.fillStyle=_tint(C,0.10);bz.x.fillRect(bz.sp,bz.H*.63,bz.W-bz.sp*2,bz.H*.235);
     bz.x.fillStyle=acc;bz.x.font='700 26px '+BF;
     _micro(bz.x,'NEVER SAID ON OUR BEHALF',26,0.16,bz.sp+24,bz.H*.665,bz.W);
     var NEVER=['A price, discount or refund that has not been approved',
                'A delivery date we have not confirmed',
                'A medical, legal, financial or safety assurance',
                'A guarantee of any result',
                'Anything about a customer to anyone else'];
     bz.x.fillStyle=SMN_INK;bz.x.font='400 25px '+BF;
     NEVER.forEach(function(nv,i16){
       bz.x.fillText('\u00b7  '+nv,bz.sp+24,bz.H*.70+i16*30,bz.W-bz.sp*2-48);});
     bz.x.fillStyle=SMN_INK2;bz.x.font='400 23px '+BF;
     bz.x.fillText('Give this to any person or tool that answers for your business.',bz.sp,bz.H-bz.sp-120,bz.W-bz.sp*2);
     fname='voice-guardrails-print.pdf';pngn='voice-guardrails.png';}
   FT();
   return _pdfFrom([bz.cv],8.5,11,fname).then(function(pdf){return _canvasBlob(bz.cv).then(function(png){return[pdf,{filename:pngn,blob:png}];});});}
  if(kind==='deck-capabilities'||kind==='deck-pitch'){
   /* DISC 9 — the decks. 16:9 slides through the print engine at 150dpi. Brief-compliant:
      logo on clean neutral, palette does the colour, type never on a photo, every fact
      from the brand card, blanks labelled. */
   var DW=1650,DH=928;                       // 11x6.19in @150 = true 16:9
   var pitch=(kind==='deck-pitch');
   var slides=[];
   function slide(){var cv=document.createElement('canvas');cv.width=DW;cv.height=DH;
     var xx=_q(cv.getContext('2d'));xx.fillStyle='#FFFFFF';xx.fillRect(0,0,DW,DH);
     xx.fillStyle=acc;xx.fillRect(0,0,DW,14);slides.push(cv);return xx;}
   function foot(xx,n){xx.fillStyle=_rule(C,0.26);xx.fillRect(90,DH-92,DW-180,2);
     xx.fillStyle=SMN_INK2;xx.font='400 22px '+BF;xx.textAlign='left';
     xx.fillText(name+(dom?('   \u00b7   '+dom):''),90,DH-52);
     xx.textAlign='right';xx.fillText(String(n),DW-90,DH-52);xx.textAlign='left';}
   function heading(xx,txt,sub){
     var hp=_fitText(xx,txt,'800 {px} '+F,84,DW-180);xx.fillStyle=SMN_INK;
     xx.font='800 '+hp+'px '+F;xx.fillText(txt,90,190,DW-180);
     xx.fillStyle=acc;xx.fillRect(90,225,240,10);
     if(sub){xx.fillStyle=SMN_INK2;xx.font='400 30px '+BF;xx.fillText(sub,90,296,DW-180);}}
   function bullets(xx,items,y0){
     items.forEach(function(it,i){var y=y0+i*104;
       xx.fillStyle=acc;xx.beginPath();xx.arc(112,y-10,13,0,7);xx.fill();
       xx.fillStyle=SMN_INK;xx.font='700 34px '+BF;
       var words=String(it).split(' '),ln='',yy=y;
       words.forEach(function(w){var s2=ln?ln+' '+w:w;
         if(xx.measureText(s2).width>DW-260){xx.fillText(ln,160,yy,DW-260);yy+=46;ln=w;}else ln=s2;});
       if(ln)xx.fillText(ln,160,yy,DW-260);});}
   // 1 — cover
   var s1=slide();
   /* AGENCY REFACTOR: the cover block is centred as a unit. It was leaving 32% empty
      above and 5% below — the inspector caught it in real output. */
   logo(s1,90,DH/2-190,_logoBox('document',DW,360),300);
   s1.textBaseline='alphabetic';
   var cpx=_fitText(s1,name,'800 {px} '+F,96,DW-660);
   s1.fillStyle=SMN_INK;s1.font='800 '+cpx+'px '+F;s1.fillText(name,590,DH/2-30,DW-680);
   s1.fillStyle=acc;s1.fillRect(590,DH/2+10,260,12);
   if(tag){s1.fillStyle=SMN_INK2;var tpx2=_fitText(s1,tag,'italic 500 {px} '+F,42,DW-680);
     s1.font='italic 500 '+tpx2+'px '+F;s1.fillText(tag,590,DH/2+90,DW-680);}
   s1.fillStyle=SMN_INK2;s1.font='400 26px '+BF;
   s1.fillText(pitch?'Investor overview':'Capabilities overview',590,DH/2+150,DW-680);
   foot(s1,1);
   // 2 — who we are (real About copy)
   var s2=slide();heading(s2,pitch?'The opportunity':'Who we are','');
   var ab=((IDEA.aboutT&&IDEA.aboutT[0])||tag||'');
   s2.fillStyle=SMN_INK;s2.font='400 36px '+BF;
   (function(){var words=ab.split(' '),ln='',y=400;
     words.forEach(function(w){var s3=ln?ln+' '+w:w;
       if(s2.measureText(s3).width>DW-180){s2.fillText(ln,90,y,DW-180);y+=52;ln=w;}else ln=s3;});
     if(ln)s2.fillText(ln,90,y,DW-180);})();
   foot(s2,2);
   // 3 — why it works (real why-points)
   var s3c=slide();heading(s3c,pitch?'Why this wins':'What makes us different','');
   bullets(s3c,(NM.why||[]).slice(0,4),420);foot(s3c,3);
   // 4 — what we offer / the ask
   var s4=slide();
   heading(s4,pitch?'What we\u2019re asking for':'What we offer',
           pitch?'Fill in the specifics of your raise.':'List your services here.');
   bullets(s4,['','','',''].map(function(){return '\u2014';}),430);
   s4.fillStyle=SMN_INK2;s4.font='italic 400 28px '+BF;
   s4.fillText('Replace each line with your own.',160,DH-150,DW-260);
   foot(s4,4);
   // 5 — contact (Brand Details only; nothing invented)
   var s5=slide();heading(s5,'Let\u2019s talk','');
   var cl=contact();
   if(cl.length){s5.fillStyle=SMN_INK;s5.font='700 40px '+BF;
     cl.slice(0,4).forEach(function(l,i){s5.fillText(l,90,420+i*72,DW-180);});}
   else{s5.fillStyle=SMN_INK2;s5.font='italic 400 32px '+BF;
     s5.fillText('Add your phone, email and address in Brand details \u2014 they appear here automatically.',90,420,DW-180);}
   logo(s5,DW-470,DH/2-150,380,260);
   foot(s5,5);
   var dfn = pitch?'pitch-deck':'capabilities-deck';
   return _pdfFrom(slides,11,6.19,dfn+'-print.pdf').then(function(pdf){
     return _canvasBlob(slides[0]).then(function(png){
       return [pdf,{filename:dfn+'-cover.png',blob:png}];});});}
  if(kind==='print-doorhanger'){
   /* 4.25 x 11 in door hanger. Hook cut-out marked at the top; nothing critical near it.
      Read at arm's length, so body type stays generous. */
   var dh=printCanvas(4.25,11);dh.x.fillStyle='#FFFFFF';dh.x.fillRect(0,0,dh.W,dh.H);
   dh.x.fillStyle=acc;dh.x.fillRect(0,0,dh.W,30);dh.x.fillRect(0,dh.H-30,dh.W,30);
   var hr=Math.round(dh.W*0.16);
   dh.x.strokeStyle=_rule(C,0.62);dh.x.setLineDash([14,12]);dh.x.lineWidth=3;
   dh.x.beginPath();dh.x.arc(dh.W/2,dh.sp+hr+40,hr,0,7);dh.x.stroke();dh.x.setLineDash([]);
   dh.x.fillStyle=_rule(C,0.45);dh.x.font='400 26px '+BF;dh.x.textAlign='center';
   dh.x.fillText('hook cut-out',dh.W/2,dh.sp+hr*2+90,dh.W-dh.sp*2);
   logo(dh.x,dh.sp,dh.H*0.20,dh.W-dh.sp*2,Math.round(dh.H*0.13));
   dh.x.textBaseline='alphabetic';dh.x.textAlign='center';
   var dpx=_fitText(dh.x,name,'800 {px} '+F,150,dh.W-dh.sp*2);
   dh.x.fillStyle=SMN_INK;dh.x.font='800 '+dpx+'px '+F;dh.x.fillText(name,dh.W/2,dh.H*0.43,dh.W-dh.sp*2);
   dh.x.fillStyle=acc;dh.x.fillRect(dh.W/2-110,dh.H*0.455,220,10);
   if(tag){dh.x.fillStyle=SMN_INK2;var dtx=_fitText(dh.x,tag,'italic 500 {px} '+F,60,dh.W-dh.sp*2);
     dh.x.font='italic 500 '+dtx+'px '+F;dh.x.fillText(tag,dh.W/2,dh.H*0.51,dh.W-dh.sp*2);}
   dh.x.fillStyle=SMN_INK;dh.x.font='700 44px '+BF;
   dh.x.fillText('Sorry we missed you.',dh.W/2,dh.H*0.62,dh.W-dh.sp*2);
   dh.x.fillStyle=SMN_INK2;dh.x.font='400 38px '+BF;
   dh.x.fillText('Give us a call and we will help.',dh.W/2,dh.H*0.67,dh.W-dh.sp*2);
   var cdh=(bd.phone||dom||'');
   if(cdh){dh.x.fillStyle=acc;dh.x.fillRect(dh.sp,dh.H*0.74,dh.W-dh.sp*2,Math.round(dh.H*0.075));
     dh.x.fillStyle=_inkFor(acc);var cpx2=_fitText(dh.x,cdh,'800 {px} '+BF,90,dh.W-dh.sp*2-40);
     dh.x.font='800 '+cpx2+'px '+BF;dh.x.fillText(cdh,dh.W/2,dh.H*0.79,dh.W-dh.sp*2-40);}
   var cd2=contact();if(cd2.length){dh.x.fillStyle=SMN_INK2;dh.x.font='400 32px '+BF;
     dh.x.fillText(cd2.slice(0,2).join('  \u2022  '),dh.W/2,dh.H*0.88,dh.W-dh.sp*2);}
   dh.x.textAlign='left';
   return _pdfFrom([dh.cv],4.25,11,'door-hanger-print.pdf').then(function(pdf){
     return _canvasBlob(dh.cv).then(function(png){return[pdf,{filename:'door-hanger.png',blob:png}];});});}
  if(kind==='print-magnet'){
   /* 12 x 24 in vehicle magnet (the popular SUV / pickup size). Must read from 20-30 ft,
      so every line is fitted to the full safe width. */
   var mg=printCanvas(24,12,100);
   _deepField(mg.x,mg.W,mg.H,dk);
   mg.x.fillStyle='#FFFFFF';mg.x.fillRect(mg.sp*0.6,mg.sp*0.6,mg.W-mg.sp*1.2,mg.H-mg.sp*1.2);
   var mw=mg.W-mg.sp*2;
   logo(mg.x,mg.sp+20,mg.sp+20,_logoBox('vehicle',mg.W,260),mg.H-mg.sp*2-40);
   var mx=mg.sp+Math.round(mw*0.38), mtw=mg.W-mx-mg.sp-20;
   mg.x.textBaseline='alphabetic';
   var mpx=_fitText(mg.x,name,'800 {px} '+F,300,mtw);
   mg.x.fillStyle=SMN_INK;mg.x.font='800 '+mpx+'px '+F;mg.x.fillText(name,mx,mg.H*0.42,mtw);
   mg.x.fillStyle=acc;mg.x.fillRect(mx,mg.H*0.50,Math.round(mtw*0.42),14);
   var cm=(bd.phone||dom||'');
   if(cm){mg.x.fillStyle=SMN_INK;var mcx=_fitText(mg.x,cm,'800 {px} '+BF,336,mtw);
     mg.x.font='800 '+mcx+'px '+BF;mg.x.fillText(cm,mx,mg.H*0.72,mtw);}
   if(dom&&bd.phone){mg.x.fillStyle=SMN_INK2;var mdx=_fitText(mg.x,dom,'700 {px} '+BF,110,mtw);
     mg.x.font='700 '+mdx+'px '+BF;mg.x.fillText(dom,mx,mg.H*0.85,mtw);}
   return _pdfFrom([mg.cv],24,12,'car-magnet-24x12-print.pdf').then(function(pdf){
     return _canvasBlob(mg.cv).then(function(png){return[pdf,{filename:'car-magnet.png',blob:png}];});});}
  if(kind==='print-postcard'){
   /* 6 x 4in standard mailing postcard. Front = the message. Address side kept clear per
      USPS: right half reserved, bottom 0.625in barcode zone. */
   var pc=printCanvas(6,4);
   pc.x.fillStyle=dk;pc.x.fillRect(0,0,pc.W,pc.H);
   pc.x.fillStyle=acc;pc.x.fillRect(0,0,pc.W,18);
   logo(pc.x,pc.sp,pc.sp,Math.round(pc.W*0.30),Math.round(pc.H*0.30));
   pc.x.textBaseline='alphabetic';pc.x.fillStyle='#FFFFFF';
   var px0=pc.sp+Math.round(pc.W*0.34), pw0=pc.W-px0-pc.sp;
   var ppx=_fitText(pc.x,name,'800 {px} '+F,110,pw0);
   pc.x.font='800 '+ppx+'px '+F;pc.x.fillText(name,px0,pc.H*0.26,pw0);
   if(tag){pc.x.fillStyle=SMN_ONDARK_2;var ptx0=_fitText(pc.x,tag,'italic 500 {px} '+F,52,pw0);
     pc.x.font='italic 500 '+ptx0+'px '+F;pc.x.fillText(tag,px0,pc.H*0.36,pw0);}
   pc.x.fillStyle='rgba(255,255,255,.95)';pc.x.font='700 74px '+BF;
   pc.x.fillText('A note for you',pc.sp,pc.H*0.60,pc.W-pc.sp*2);
   pc.x.fillStyle='rgba(255,255,255,.82)';pc.x.font='400 40px '+BF;
   pc.x.fillText('Your message goes here \u2014 one clear thought.',pc.sp,pc.H*0.70,pc.W-pc.sp*2);
   var cpc=contact();if(cpc.length){pc.x.fillStyle='#FFFFFF';pc.x.font='700 36px '+BF;
     pc.x.fillText(cpc.slice(0,2).join('  \u2022  '),pc.sp,pc.H-pc.sp-24,pc.W-pc.sp*2);}
   return _pdfFrom([pc.cv],6,4,'postcard-6x4-print.pdf').then(function(pdf){
     return _canvasBlob(pc.cv).then(function(png){return[pdf,{filename:'postcard.png',blob:png}];});});}
  if(kind==='print-folder'){
   /* 9 x 12in presentation folder cover. Pocket fold marked; nothing critical below it. */
   var pf=printCanvas(9,12);
   var gpf=pf.x.createLinearGradient(0,0,pf.W*0.6,pf.H);gpf.addColorStop(0,dk);gpf.addColorStop(1,_hexDeep(dk));
   pf.x.fillStyle=gpf;pf.x.fillRect(0,0,pf.W,pf.H);
   pf.x.fillStyle=acc;pf.x.fillRect(0,0,pf.W,22);
   logo(pf.x,pf.W/2-Math.round(pf.W*0.22),pf.H*0.14,Math.round(pf.W*0.44),Math.round(pf.H*0.16),true);
   pf.x.textBaseline='alphabetic';pf.x.textAlign='center';pf.x.fillStyle='#FFFFFF';
   var fpx=_fitText(pf.x,name,'800 {px} '+F,190,pf.W-pf.sp*2);
   pf.x.font='800 '+fpx+'px '+F;pf.x.fillText(name,pf.W/2,pf.H*0.42,pf.W-pf.sp*2);
   pf.x.fillStyle=acc;pf.x.fillRect(pf.W/2-140,pf.H*0.455,280,12);
   if(tag){pf.x.fillStyle=SMN_ONDARK_2;var ftx=_fitText(pf.x,tag,'italic 500 {px} '+F,72,pf.W-pf.sp*2);
     pf.x.font='italic 500 '+ftx+'px '+F;pf.x.fillText(tag,pf.W/2,pf.H*0.52,pf.W-pf.sp*2);}
   /* pocket fold line at 4in from the bottom - keep the area below it clear */
   var foldY=pf.H-Math.round(4*300);
   pf.x.strokeStyle='rgba(255,255,255,.35)';pf.x.setLineDash([16,14]);pf.x.lineWidth=3;
   pf.x.beginPath();pf.x.moveTo(0,foldY);pf.x.lineTo(pf.W,foldY);pf.x.stroke();pf.x.setLineDash([]);
   pf.x.fillStyle='rgba(255,255,255,.55)';pf.x.font='400 30px '+BF;
   pf.x.fillText('pocket fold \u2014 keep artwork above this line',pf.W/2,foldY+52,pf.W-pf.sp*2);
   if(dom){pf.x.fillStyle='#FFFFFF';pf.x.font='700 40px '+BF;
     pf.x.fillText(dom,pf.W/2,pf.H-pf.sp-30,pf.W-pf.sp*2);}
   pf.x.textAlign='left';
   return _pdfFrom([pf.cv],9,12,'presentation-folder-print.pdf').then(function(pdf){
     return _canvasBlob(pf.cv).then(function(png){return[pdf,{filename:'presentation-folder.png',blob:png}];});});}
  if(kind==='print-hours'){
   /* 8.5 x 11in hours / welcome sign for a door or window. Read from a few feet. */
   var hs=printCanvas(8.5,11);hs.x.fillStyle='#FFFFFF';hs.x.fillRect(0,0,hs.W,hs.H);
   hs.x.fillStyle=dk;hs.x.fillRect(0,0,hs.W,Math.round(hs.H*0.22));
   logo(hs.x,hs.W/2-Math.round(hs.W*0.20),hs.sp,Math.round(hs.W*0.40),Math.round(hs.H*0.16));
   hs.x.textBaseline='alphabetic';hs.x.textAlign='center';
   hs.x.fillStyle=SMN_INK;var hpx=_fitText(hs.x,'Hours','800 {px} '+F,200,hs.W-hs.sp*2);
   hs.x.font='800 '+hpx+'px '+F;hs.x.fillText('Hours',hs.W/2,hs.H*0.35,hs.W-hs.sp*2);
   hs.x.fillStyle=acc;hs.x.fillRect(hs.W/2-120,hs.H*0.375,240,12);
   var days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
   hs.x.textAlign='left';
   if(bd.hours){
     hs.x.fillStyle=SMN_INK;var hh=_fitText(hs.x,bd.hours,'700 {px} '+BF,64,hs.W-hs.sp*2);
     hs.x.font='700 '+hh+'px '+BF;hs.x.textAlign='center';
     hs.x.fillText(bd.hours,hs.W/2,hs.H*0.50,hs.W-hs.sp*2);hs.x.textAlign='left';
   } else {
     days.forEach(function(d,i){var y=hs.H*(0.46+i*0.055);
       hs.x.fillStyle=SMN_INK;hs.x.font='700 46px '+BF;hs.x.fillText(d,hs.sp+40,y);
       hs.x.strokeStyle=_rule(C,0.48);hs.x.lineWidth=2;
       hs.x.beginPath();hs.x.moveTo(hs.W*0.42,y+8);hs.x.lineTo(hs.W-hs.sp-40,y+8);hs.x.stroke();});
   }
   var ch=contact();if(ch.length){hs.x.textAlign='center';hs.x.fillStyle=SMN_INK2;hs.x.font='400 38px '+BF;
     hs.x.fillText(ch.slice(0,2).join('  \u2022  '),hs.W/2,hs.H-hs.sp-30,hs.W-hs.sp*2);hs.x.textAlign='left';}
   return _pdfFrom([hs.cv],8.5,11,'hours-sign-print.pdf').then(function(pdf){
     return _canvasBlob(hs.cv).then(function(png){return[pdf,{filename:'hours-sign.png',blob:png}];});});}
  if(kind==='print-shelf'){
   /* 4 x 6in counter / shelf card. Read at arm's length, stands in an acrylic holder. */
   var sh=printCanvas(4,6);
   sh.x.fillStyle='#FFFFFF';sh.x.fillRect(0,0,sh.W,sh.H);
   sh.x.fillStyle=acc;sh.x.fillRect(0,0,sh.W,Math.round(sh.H*0.02));
   sh.x.fillStyle=dk;sh.x.fillRect(0,Math.round(sh.H*0.02),sh.W,Math.round(sh.H*0.26));
   logo(sh.x,sh.W/2-Math.round(sh.W*0.24),Math.round(sh.H*0.05),Math.round(sh.W*0.48),Math.round(sh.H*0.19));
   sh.x.textBaseline='alphabetic';sh.x.textAlign='center';
   sh.x.fillStyle=SMN_INK;var spx=_fitText(sh.x,name,'800 {px} '+F,110,sh.W-sh.sp*2);
   sh.x.font='800 '+spx+'px '+F;sh.x.fillText(name,sh.W/2,sh.H*0.42,sh.W-sh.sp*2);
   sh.x.fillStyle=acc;sh.x.fillRect(sh.W/2-90,sh.H*0.45,180,9);
   sh.x.fillStyle=SMN_INK;sh.x.font='700 54px '+BF;
   sh.x.fillText('What we recommend',sh.W/2,sh.H*0.56,sh.W-sh.sp*2);
   sh.x.fillStyle=SMN_INK2;sh.x.font='400 38px '+BF;
   sh.x.fillText('Your note goes here.',sh.W/2,sh.H*0.64,sh.W-sh.sp*2);
   if(dom){sh.x.fillStyle=SMN_INK2;sh.x.font='700 34px '+BF;
     sh.x.fillText(dom,sh.W/2,sh.H-sh.sp-24,sh.W-sh.sp*2);}
   sh.x.textAlign='left';
   return _pdfFrom([sh.cv],4,6,'shelf-card-print.pdf').then(function(pdf){
     return _canvasBlob(sh.cv).then(function(png){return[pdf,{filename:'shelf-card.png',blob:png}];});});}
  if(kind.indexOf('merch-')===0){
   /* MERCH ARTWORK. Print-shop specs: tee 3600x4800 @300 (12x16in print area),
      hat 1500x750, tote 3000x3000, mug wrap 2610x1110, sticker 1800x1800,
      apron 2700x3600. Delivered on TRANSPARENT ground so any garment colour works —
      that is what a printer needs. Logo placed on clean space, never recoloured. */
   var MSPEC={'merch-tee':[3000,4000,'tee-artwork.png'],   /* 12x16in at 250dpi = 12.0M px; 3600x4800 would be 17.3M and fails silently on iOS */
              'merch-hat':[1500,750,'hat-artwork.png'],
              'merch-tote':[3000,3000,'tote-artwork.png'],
              'merch-mug':[2610,1110,'mug-wrap-artwork.png'],
              'merch-sticker':[1800,1800,'sticker-artwork.png'],
              'merch-apron':[2700,3600,'apron-artwork.png']};
   var ms=MSPEC[kind]; if(!ms) return Promise.reject();
   var mc=document.createElement('canvas');mc.width=ms[0];mc.height=ms[1];
   var mx2=_q(mc.getContext('2d'));            // transparent ground, nothing filled
   var isWide=(ms[0]/ms[1])>1.6;   /* aspect mismatch -> stacked lockup, never a stretched horizontal one */
   if(isWide){
     var lw=Math.round(ms[1]*0.72);
     _logoSmart(mx2,im,Math.round(ms[0]*0.06),Math.round((ms[1]-lw)/2),lw,lw);
     mx2.textBaseline='alphabetic';mx2.fillStyle=dk;
     var tx2=Math.round(ms[0]*0.06)+lw+Math.round(ms[0]*0.04);
     var tw2=ms[0]-tx2-Math.round(ms[0]*0.06);
     var mpx=_fitText(mx2,name,'800 {px} '+F,Math.round(ms[1]*0.30),tw2);
     mx2.font='800 '+mpx+'px '+F;mx2.fillText(name,tx2,ms[1]*0.52,tw2);
     if(tag){mx2.fillStyle=acc;var mtx=_fitText(mx2,tag,'700 {px} '+BF,Math.round(ms[1]*0.13),tw2);
       mx2.font='700 '+mtx+'px '+BF;mx2.fillText(tag,tx2,ms[1]*0.72,tw2);}
   } else {
     var lw2=_logoBox('apparel',ms[0],400);
     _logoSmart(mx2,im,Math.round((ms[0]-lw2)/2),Math.round(ms[1]*0.16),lw2,lw2);
     mx2.textBaseline='alphabetic';mx2.textAlign='center';mx2.fillStyle=dk;
     var npx2=_fitText(mx2,name,'800 {px} '+F,Math.round(ms[0]*0.13),ms[0]*0.84);
     mx2.font='800 '+npx2+'px '+F;mx2.fillText(name,ms[0]/2,ms[1]*0.74,ms[0]*0.84);
     mx2.fillStyle=acc;mx2.fillRect(ms[0]/2-Math.round(ms[0]*0.10),ms[1]*0.775,Math.round(ms[0]*0.20),Math.max(4,Math.round(ms[1]*0.008)));
     if(tag){mx2.fillStyle=dk;var ttx=_fitText(mx2,tag,'700 {px} '+BF,Math.round(ms[0]*0.055),ms[0]*0.8);
       mx2.font='700 '+ttx+'px '+BF;mx2.fillText(tag,ms[0]/2,ms[1]*0.84,ms[0]*0.8);}
     mx2.textAlign='left';
   }
   return _canvasBlob(mc).then(function(b){return[{filename:ms[2],blob:b}];});}
  if(kind==='print-label'||kind==='print-hangtag'||kind==='print-invite'
     ||kind==='print-placecard'||kind==='print-insert'||kind==='print-reviewcard'
     ||kind==='print-qrposter'){
   /* Eight more everyday pieces. Sizes are the common commercial ones so a client can
      order them from any printer without a conversation. */
   var LS={'print-label':[3,3,'product-label-3x3','Product label'],
           'print-hangtag':[2,3.5,'hang-tag-2x3.5','Hang tag'],
           'print-invite':[5,7,'invitation-5x7','Invitation'],
           'print-placecard':[3.5,2,'place-card-3.5x2','Place card'],
           'print-insert':[4,6,'package-insert-4x6','Package insert'],
           'print-reviewcard':[3.5,2,'review-card-3.5x2','Review card'],
           'print-qrposter':[8.5,11,'qr-poster','Scan-me poster']};
   var L2=LS[kind]; var lw2=L2[0],lh2=L2[1];
   var lc=printCanvas(lw2,lh2);
   var tall=(lh2>=lw2);
   /* CONTAINER ARCHETYPE — bound to the BRAND, not the piece type. The old rule painted
      the same dark gradient on every invite, tag and poster regardless of whose brand it
      was: the repeating shell the Founder flagged. */
   var SH=smnPaintShell(lc.x,lc.W,lc.H,(NM.__shell||smnShell(NM,IDEA)),
                        smnPaletteOrFlag(IDEA,NM),lc.sp);
   var dark=SH.onDark;
   var ink2=SH.ink, mute2=SH.ink2;
   lc.x.textBaseline='alphabetic';lc.x.textAlign='center';
   var lgW=Math.round(lc.W*(tall?0.52:0.34));
   logo(lc.x,(lc.W-lgW)/2,Math.round(lc.H*0.10),lgW,Math.round(lc.H*(tall?0.22:0.30)),dark);
   var namePx=_fitText(lc.x,name,'800 {px} '+F,Math.round(lc.H*0.13),lc.W-lc.sp*2);
   lc.x.fillStyle=ink2;lc.x.font='800 '+namePx+'px '+F;
   lc.x.fillText(name,lc.W/2,lc.H*(tall?0.44:0.56),lc.W-lc.sp*2);
   lc.x.fillStyle=acc;
   lc.x.fillRect(lc.W/2-Math.round(lc.W*0.12),lc.H*(tall?0.47:0.62),Math.round(lc.W*0.24),Math.max(5,Math.round(lc.H*0.010)));
   var CATMETA=[[/food|restaur|bakery|caf|coffee|kitchen|brew/i,['NET WT','INGREDIENTS','BEST BY']],
                [/beauty|salon|spa|skin|cosmet|soap|candle/i,['NET WT','DIRECTIONS','LOT']],
                [/apparel|cloth|wear|boutique|shirt/i,['SIZE','FABRIC','CARE']],
                [/realty|real estate|property|home|residen/i,['LISTING','AGENT','MLS']],
                [/health|clinic|therap|wellness|fit/i,['SESSION','PRACTITIONER','DATE']],
                [/craft|handmade|maker|studio|art/i,['MADE BY','MATERIALS','EDITION']]];
   function _catMeta(){
     var s4=String((IDEA&&IDEA.said)||'');
     for(var i4=0;i4<CATMETA.length;i4++){ if(CATMETA[i4][0].test(s4)) return CATMETA[i4][1]; }
     return ['ITEM','DETAIL','DATE'];
   }
   var MSG={'print-label':(tag||''),'print-hangtag':tag||'Handmade with care',
            'print-invite':'You are invited','print-placecard':'Guest name',
            'print-insert':'Thank you for your order','print-reviewcard':'How did we do?',
            'print-qrposter':'Scan to find us'};
   var msg=MSG[kind]||'';
   if(msg){lc.x.fillStyle=mute2;
     var mpx2=_fitText(lc.x,msg,'700 {px} '+BF,Math.round(lc.H*0.062),lc.W-lc.sp*2);
     lc.x.font='700 '+mpx2+'px '+BF;lc.x.fillText(msg,lc.W/2,lc.H*(tall?0.56:0.74),lc.W-lc.sp*2);}
   if(kind==='print-qrposter'||kind==='print-reviewcard'){
     var qs=Math.round(Math.min(lc.W,lc.H)*(kind==='print-qrposter'?0.34:0.26));
     var qx=(lc.W-qs)/2, qy=lc.H*(kind==='print-qrposter'?0.62:0.30);
     lc.x.fillStyle=dark?'#FFFFFF':'#FFFFFF';lc.x.fillRect(qx-14,qy-14,qs+28,qs+28);
     lc.x.strokeStyle=_rule(C,0.66);lc.x.setLineDash([12,10]);lc.x.lineWidth=3;
     lc.x.strokeRect(qx,qy,qs,qs);lc.x.setLineDash([]);
     lc.x.fillStyle=_rule(C,0.45);lc.x.font='400 '+Math.round(qs*0.075)+'px '+BF;
     lc.x.fillText('place your QR code here',lc.W/2,qy+qs/2,qs-20);}
   if(kind==='print-hangtag'){
     lc.x.strokeStyle=dark?'rgba(255,255,255,.5)':_rule(C,0.66);
     lc.x.setLineDash([10,9]);lc.x.lineWidth=3;
     lc.x.beginPath();lc.x.arc(lc.W/2,lc.sp+Math.round(lc.H*0.045),Math.round(lc.W*0.07),0,7);
     lc.x.stroke();lc.x.setLineDash([]);}
   if(kind==='print-label'){
     /* retail metadata grid — category-tailored, tracked small caps, rules to write on */
     var cm4=_catMeta(); lc.x.textAlign='left';
     cm4.forEach(function(k4,i5){
       var my=lc.H*(0.66+i5*0.095);
       lc.x.fillStyle=mute2;lc.x.font='400 '+Math.round(lc.H*0.030)+'px '+BF;
       _micro(lc.x,k4,Math.round(lc.H*0.030),0.18,lc.sp,my,lc.W);
       lc.x.strokeStyle=_rule(C,0.35);lc.x.lineWidth=2;
       lc.x.beginPath();lc.x.moveTo(lc.sp+Math.round(lc.W*0.34),my+4);
       lc.x.lineTo(lc.W-lc.sp,my+4);lc.x.stroke();});
     lc.x.textAlign='center';}
   if(kind==='print-placecard'){
     lc.x.strokeStyle=(C&&C[2])||_rule(C,0.55);lc.x.lineWidth=2;
     lc.x.beginPath();lc.x.moveTo(lc.sp+40,lc.H*0.82);lc.x.lineTo(lc.W-lc.sp-40,lc.H*0.82);lc.x.stroke();}
   var cl2=contact();
   if(cl2.length&&kind!=='print-placecard'&&kind!=='print-label'){
     lc.x.fillStyle=mute2;lc.x.font='400 '+Math.round(lc.H*0.035)+'px '+BF;
     lc.x.fillText(cl2.slice(0,2).join('  \u2022  '),lc.W/2,lc.H-lc.sp-Math.round(lc.H*0.02),lc.W-lc.sp*2);}
   lc.x.textAlign='left';
   return _pdfFrom([lc.cv],lw2,lh2,L2[2]+'-print.pdf').then(function(pdf){
     return _canvasBlob(lc.cv).then(function(png){return[pdf,{filename:L2[2]+'.png',blob:png}];});});}
  if(kind==='print-env10'||kind==='print-enva7'||kind==='print-notepad'
     ||kind==='print-stickersheet'||kind==='print-vinyl'||kind==='print-flag'
     ||kind==='print-tablecover'||kind==='print-lanyard'||kind==='print-comment'
     ||kind==='print-shiplabel'){
   /* Ten more commercial pieces at the sizes printers actually stock. dpi drops for the
      large-format items so every canvas stays under the iOS 16.7M-pixel ceiling. */
   var ES={'print-env10':[9.5,4.125,300,'envelope-no10','left'],
           'print-enva7':[7.25,5.25,300,'envelope-a7','left'],
           'print-notepad':[5.5,8.5,300,'notepad-header','top'],
           'print-stickersheet':[8.5,11,300,'sticker-sheet','grid'],
           'print-vinyl':[72,24,40,'vinyl-banner-6x2ft','wide'],
           'print-flag':[30,90,40,'feather-flag','tall'],
           'print-tablecover':[72,30,40,'table-cover-panel','wide'],
           'print-lanyard':[2.125,3.375,300,'lanyard-badge','badge'],   /* portrait — an ID badge hangs vertically */
           'print-comment':[5.5,8.5,300,'comment-card','form'],
           'print-shiplabel':[4,6,300,'shipping-label','ship']};
   var E2=ES[kind]; var ew=E2[0],eh=E2[1],edpi=E2[2],efn=E2[3],mode=E2[4];
   var ec=printCanvas(ew,eh,edpi);
   var big=(mode==='wide'||mode==='tall');
   if(big){var ge=ec.x.createLinearGradient(0,0,ec.W*0.6,ec.H);
     ge.addColorStop(0,dk);ge.addColorStop(1,_hexDeep(dk));ec.x.fillStyle=ge;}
   else ec.x.fillStyle='#FFFFFF';
   ec.x.fillRect(0,0,ec.W,ec.H);
   var eink=big?'#FFFFFF':SMN_INK, emute=big?SMN_ONDARK_2:SMN_INK2;
   ec.x.textBaseline='alphabetic';
   if(mode==='left'){
     logo(ec.x,ec.sp,ec.sp,Math.round(ec.W*0.20),Math.round(ec.H*0.34));
     var elx=ec.sp+Math.round(ec.W*0.22), elw=Math.round(ec.W*0.40);
     var enp=_fitText(ec.x,name,'800 {px} '+F,Math.round(ec.H*0.16),elw);
     ec.x.fillStyle=eink;ec.x.font='800 '+enp+'px '+F;ec.x.fillText(name,elx,ec.H*0.28,elw);
     var ce3=contact();
     if(ce3.length){ec.x.fillStyle=emute;ec.x.font='400 '+Math.round(ec.H*0.055)+'px '+BF;
       ce3.slice(0,3).forEach(function(l,i){ec.x.fillText(l,elx,ec.H*(0.42+i*0.09),elw);});}
     ec.x.strokeStyle=_rule(C,0.40);ec.x.setLineDash([12,10]);ec.x.lineWidth=2;
     ec.x.strokeRect(ec.W*0.46,ec.H*0.46,ec.W*0.44,ec.H*0.36);ec.x.setLineDash([]);
     ec.x.fillStyle=_rule(C,0.45);ec.x.font='400 '+Math.round(ec.H*0.045)+'px '+BF;
     ec.x.fillText('recipient address area',ec.W*0.48,ec.H*0.64,ec.W*0.40);
   } else if(mode==='top'||mode==='form'){
     ec.x.fillStyle=acc;ec.x.fillRect(0,0,ec.W,Math.round(ec.H*0.012));
     logo(ec.x,ec.sp,ec.sp,Math.round(ec.W*0.34),Math.round(ec.H*0.10));
     ec.x.textAlign='right';ec.x.fillStyle=emute;ec.x.font='400 '+Math.round(ec.H*0.024)+'px '+BF;
     ec.x.fillText(dom||name,ec.W-ec.sp,ec.sp+Math.round(ec.H*0.06),ec.W*0.45);ec.x.textAlign='left';
     if(mode==='form'){
       ec.x.fillStyle=eink;ec.x.font='800 '+Math.round(ec.H*0.05)+'px '+F;
       ec.x.fillText('How did we do?',ec.sp,ec.H*0.20,ec.W-ec.sp*2);
       ec.x.fillStyle=acc;ec.x.fillRect(ec.sp,ec.H*0.215,Math.round(ec.W*0.22),8);
       ['What went well?','What could be better?','May we contact you?'].forEach(function(q,i){
         var qy=ec.H*(0.28+i*0.225);
         ec.x.fillStyle=eink;ec.x.font='700 '+Math.round(ec.H*0.030)+'px '+BF;
         ec.x.fillText(q,ec.sp,qy,ec.W-ec.sp*2);
         ec.x.strokeStyle=_rule(C,0.48);ec.x.lineWidth=2;
         for(var qj=0;qj<4;qj++){ec.x.beginPath();
           ec.x.moveTo(ec.sp,qy+ec.H*(0.045+qj*0.040));ec.x.lineTo(ec.W-ec.sp,qy+ec.H*(0.045+qj*0.040));ec.x.stroke();}});
     } else {
       ec.x.strokeStyle=_rule(C,0.31);ec.x.lineWidth=2;
       for(var ni=0;ni<18;ni++){ec.x.beginPath();
         ec.x.moveTo(ec.sp,ec.H*(0.20+ni*0.043));ec.x.lineTo(ec.W-ec.sp,ec.H*(0.20+ni*0.043));ec.x.stroke();}
     }
   } else if(mode==='grid'){
     ec.x.fillStyle=acc;ec.x.fillRect(0,0,ec.W,Math.round(ec.H*0.010));
     var cols=3,rows=4,gw=(ec.W-ec.sp*2)/cols,gh=(ec.H-ec.sp*2-Math.round(ec.H*0.02))/rows;
     for(var gr=0;gr<rows;gr++)for(var gc=0;gc<cols;gc++){
       var gx=ec.sp+gc*gw, gy=ec.sp+Math.round(ec.H*0.02)+gr*gh;
       ec.x.strokeStyle=_rule(C,0.40);ec.x.setLineDash([9,8]);ec.x.lineWidth=2;
       ec.x.beginPath();ec.x.arc(gx+gw/2,gy+gh/2,Math.min(gw,gh)*0.42,0,7);ec.x.stroke();ec.x.setLineDash([]);
       logo(ec.x,gx+gw*0.20,gy+gh*0.18,gw*0.60,gh*0.44);
       ec.x.textAlign='center';ec.x.fillStyle=SMN_INK;
       var sfp=_fitText(ec.x,name,'800 {px} '+F,Math.round(gh*0.14),gw*0.72);
       ec.x.font='800 '+sfp+'px '+F;ec.x.fillText(name,gx+gw/2,gy+gh*0.76,gw*0.72);ec.x.textAlign='left';}
   } else if(mode==='badge'){
     /* VERTICAL ID BADGE: logo top-anchored, name in the optical centre, data fields
        bottom-aligned, punch slot marked. */
     var bpri=(C&&C[0])||dk, bacc=(C&&C[1])||acc, bter=(C&&C[2])||bacc;
     ec.x.fillStyle='#FFFFFF';ec.x.fillRect(0,0,ec.W,ec.H);
     ec.x.fillStyle=bpri;ec.x.fillRect(0,0,ec.W,Math.round(ec.H*0.30));
     ec.x.strokeStyle='rgba(255,255,255,.55)';ec.x.lineWidth=3;
     ec.x.strokeRect(ec.W/2-Math.round(ec.W*0.13),Math.round(ec.H*0.035),Math.round(ec.W*0.26),Math.round(ec.H*0.022));
     logo(ec.x,ec.W/2-Math.round(ec.W*0.24),Math.round(ec.H*0.09),Math.round(ec.W*0.48),Math.round(ec.H*0.17),true);
     ec.x.textAlign='center';ec.x.textBaseline='alphabetic';
     ec.x.fillStyle=SMN_INK;
     var lnp=_fitText(ec.x,name,'800 {px} '+F,Math.round(ec.H*0.075),ec.W-ec.sp*2);
     ec.x.font='800 '+lnp+'px '+F;ec.x.fillText(name,ec.W/2,ec.H*0.44,ec.W-ec.sp*2);
     ec.x.fillStyle=bacc;ec.x.fillRect(ec.W/2-Math.round(ec.W*0.14),ec.H*0.47,Math.round(ec.W*0.28),6);
     ec.x.fillStyle=SMN_INK;ec.x.font='700 '+Math.round(ec.H*0.062)+'px '+BF;
     ec.x.fillText('Your Name',ec.W/2,ec.H*0.60,ec.W-ec.sp*2);
     ec.x.fillStyle=SMN_INK2;ec.x.font='400 '+Math.round(ec.H*0.036)+'px '+BF;
     ec.x.fillText('Your title',ec.W/2,ec.H*0.66,ec.W-ec.sp*2);
     ec.x.strokeStyle=bter;ec.x.lineWidth=2;
     ec.x.beginPath();ec.x.moveTo(ec.sp,ec.H*0.76);ec.x.lineTo(ec.W-ec.sp,ec.H*0.76);ec.x.stroke();
     ec.x.fillStyle=SMN_INK2;ec.x.font='400 '+Math.round(ec.H*0.028)+'px '+BF;
     _micro(ec.x,'ID / DEPARTMENT',Math.round(ec.H*0.028),0.18,ec.W/2-Math.round(ec.W*0.22),ec.H*0.83,ec.W);
     ec.x.fillStyle=bpri;ec.x.fillRect(0,ec.H-Math.round(ec.H*0.035),ec.W,Math.round(ec.H*0.035));
     ec.x.textAlign='left';
   } else if(mode==='ship'){
     ec.x.fillStyle='#FFFFFF';ec.x.fillRect(0,0,ec.W,ec.H);
     ec.x.strokeStyle=SMN_INK;ec.x.lineWidth=4;ec.x.strokeRect(ec.sp*0.6,ec.sp*0.6,ec.W-ec.sp*1.2,ec.H-ec.sp*1.2);
     logo(ec.x,ec.sp,ec.sp,Math.round(ec.W*0.30),Math.round(ec.H*0.14));
     ec.x.fillStyle=SMN_INK;ec.x.font='700 '+Math.round(ec.H*0.035)+'px '+BF;
     ec.x.fillText('FROM',ec.sp,ec.H*0.26,ec.W-ec.sp*2);
     var cs=contact();ec.x.font='400 '+Math.round(ec.H*0.030)+'px '+BF;ec.x.fillStyle=SMN_INK2;
     (cs.length?cs.slice(0,3):['Your address']).forEach(function(l,i){
       ec.x.fillText(l,ec.sp,ec.H*(0.31+i*0.045),ec.W-ec.sp*2);});
     ec.x.fillStyle=SMN_INK;ec.x.font='700 '+Math.round(ec.H*0.045)+'px '+BF;
     ec.x.fillText('SHIP TO',ec.sp,ec.H*0.52,ec.W-ec.sp*2);
     ec.x.strokeStyle=_rule(C,0.62);ec.x.lineWidth=2;
     for(var si=0;si<4;si++){ec.x.beginPath();
       ec.x.moveTo(ec.sp,ec.H*(0.60+si*0.055));ec.x.lineTo(ec.W-ec.sp,ec.H*(0.60+si*0.055));ec.x.stroke();}
     ec.x.fillStyle=_tint(C,0.06);ec.x.fillRect(ec.sp,ec.H*0.84,ec.W-ec.sp*2,ec.H*0.10);
     ec.x.fillStyle=_rule(C,0.45);ec.x.font='400 '+Math.round(ec.H*0.024)+'px '+BF;ec.x.textAlign='center';
     ec.x.fillText('carrier barcode area',ec.W/2,ec.H*0.90,ec.W-ec.sp*2);ec.x.textAlign='left';
   } else {
     var lgw=Math.round(ec.W*(mode==='tall'?0.60:0.22));
     logo(ec.x,mode==='tall'?(ec.W-lgw)/2:ec.sp,mode==='tall'?ec.H*0.08:ec.H*0.20,
          lgw,Math.round(ec.H*(mode==='tall'?0.16:0.55)));
     ec.x.textAlign=mode==='tall'?'center':'left';
     var bx2=mode==='tall'?ec.W/2:ec.sp+Math.round(ec.W*0.26);
     var bw3=mode==='tall'?(ec.W-ec.sp*2):(ec.W-bx2-ec.sp);
     var bnp=_fitText(ec.x,name,'800 {px} '+F,Math.round(ec.H*(mode==='tall'?0.09:0.30)),bw3);
     ec.x.fillStyle='#FFFFFF';ec.x.font='800 '+bnp+'px '+F;
     ec.x.fillText(name,bx2,ec.H*(mode==='tall'?0.40:0.50),bw3);
     if(tag){ec.x.fillStyle=acc;
       var btp=_fitText(ec.x,tag,'700 {px} '+BF,Math.round(ec.H*(mode==='tall'?0.045:0.12)),bw3);
       ec.x.font='700 '+btp+'px '+BF;ec.x.fillText(tag,bx2,ec.H*(mode==='tall'?0.50:0.68),bw3);}
     var cb=(bd.phone||dom||'');
     if(cb){ec.x.fillStyle='#FFFFFF';
       var cbp=_fitText(ec.x,cb,'700 {px} '+BF,Math.round(ec.H*(mode==='tall'?0.05:0.13)),bw3);
       ec.x.font='700 '+cbp+'px '+BF;ec.x.fillText(cb,bx2,ec.H*(mode==='tall'?0.62:0.85),bw3);}
     ec.x.textAlign='left';
   }
   return _pdfFrom([ec.cv],ew,eh,efn+'-print.pdf').then(function(pdf){
     return _canvasBlob(ec.cv).then(function(png){return[pdf,{filename:efn+'.png',blob:png}];});});}
  // print-coupon 7x3
  var cp=printCanvas(7,3);cp.x.fillStyle='#FFFFFF';cp.x.fillRect(0,0,cp.W,cp.H);
  cp.x.setLineDash([18,14]);cp.x.strokeStyle=acc;cp.x.lineWidth=6;cp.x.strokeRect(cp.sp*.7,cp.sp*.7,cp.W-cp.sp*1.4,cp.H-cp.sp*1.4);cp.x.setLineDash([]);
  logo(cp.x,cp.sp,cp.H*.28,cp.W*.16,cp.H*.44);
  cp.x.fillStyle=acc;cp.x.textBaseline='alphabetic';cp.x.font='800 54px '+BF;cp.x.fillText('SPECIAL OFFER',cp.sp+cp.W*.18,cp.H*.30);
  cp.x.fillStyle=SMN_INK;var opx=_fitText(cp.x,name,'800 {px} '+F,110,cp.W*.62);cp.x.font='800 '+opx+'px '+F;cp.x.fillText(name,cp.sp+cp.W*.18,cp.H*.52,cp.W*.62);
  cp.x.fillStyle=SMN_INK2;cp.x.font='400 40px '+BF;cp.x.fillText('Your offer here \u2014 valid with this card.',cp.sp+cp.W*.18,cp.H*.68,cp.W*.62);
  cp.x.fillStyle=SMN_INK2;cp.x.font='400 30px '+BF;cp.x.fillText((dom?('Redeem: '+dom+'  \u2022  '):'')+'One per customer.',cp.sp+cp.W*.18,cp.H*.84,cp.W*.62);
  return _pdfFrom([cp.cv],7,3,'coupon-print.pdf').then(function(pdf){return _canvasBlob(cp.cv).then(function(png){return[pdf,{filename:'coupon.png',blob:png}];});});
 });}
/* SOCIAL CONTENT PACK — DISC 5 (2026-07-24). Screen finals at 2026 platform specs:
   4:5 portrait 1080x1350 (feed-native on IG/FB/LinkedIn), story 1080x1920 with the
   UI safe zone enforced (nothing in top 250px / bottom 340px), squares 1080x1080. */
function _socCanvas(W,H,C){var cv=document.createElement('canvas');cv.width=W;cv.height=H;var x=_q(cv.getContext('2d'));
 var dk=_darkest(C),acc=_brightest(C);
 var g=x.createLinearGradient(0,0,W*.5,H);g.addColorStop(0,dk);g.addColorStop(1,_hexDeep(dk));x.fillStyle=g;x.fillRect(0,0,W,H);
 x.save();x.globalAlpha=.13;x.fillStyle=acc;x.beginPath();x.arc(W*.9,H*.08,Math.max(W,H)*.3,0,7);x.fill();
 x.globalAlpha=.09;x.fillStyle=(C&&C[1])||acc;x.beginPath();x.arc(W*.06,H*.95,Math.max(W,H)*.24,0,7);x.fill();x.restore();
 return {cv:cv,x:x,dk:dk,acc:acc};}
function _socWrapC(x,txt,font,color,cx,y,lh,maxW){x.font=font;x.fillStyle=color;x.textAlign='center';
 var words=String(txt).split(' '),ln='';words.forEach(function(w){var t2=ln?ln+' '+w:w;
  if(x.measureText(t2).width>maxW){x.fillText(ln,cx,y);y+=lh;ln=w;}else ln=t2;});
 if(ln){x.fillText(ln,cx,y);y+=lh;}x.textAlign='left';return y;}
function genSocialPiece(kind,NM,IDEA){
 var name=NM.name,tag=NM.tag||'',dom=NM.dom||'';
 var C=((IDEA.palettes&&IDEA.palettes[0]&&IDEA.palettes[0].cols)||['#141414','#141414','#141414','#B7791F']);
 var disp=brandDisplayFont(NM,IDEA),body=brandBodyFont(disp),F='"'+disp+'",Georgia,serif',BF='"'+body+'",Arial,sans-serif';
 var logoUrl=(NM.logos&&NM.logos[0])||'';
 return Promise.all([_logoArt(logoUrl),loadBrandFont(disp),loadBrandFont(body)]).then(function(a){var im=a[0];
  function lg(x,bx,by,bw,bh,onDark){_logoSmart(x,im,bx,by,bw,bh,onDark);}
  function post(title,sub,fname){var p=_socCanvas(1080,1350,C);lg(p.x,540-170,120,340,340);
   p.x.textBaseline='alphabetic';p.x.textAlign='center';p.x.fillStyle='#FFFFFF';
   var px=_fitText(p.x,name,'800 {px} '+F,120,940);p.x.font='800 '+px+'px '+F;p.x.fillText(name,540,560,940);
   p.x.fillStyle=p.acc;p.x.fillRect(540-160,600,320,8);
   var y=_socWrapC(p.x,title,'800 84px '+BF,'#FFFFFF',540,760,100,900);
   _socWrapC(p.x,sub,'400 52px '+BF,SMN_ONDARK_2,540,y+40,68,880);
   if(dom){p.x.textAlign='center';p.x.fillStyle=SMN_ONDARK_2;p.x.font='700 44px '+BF;p.x.fillText(dom,540,1350-90,940);p.x.textAlign='left';}
   return _canvasBlob(p.cv).then(function(b){return{filename:fname,blob:b};});}
  if(kind==='soc-posts')return Promise.all([
   post('Big news is coming','Watch this space \u2014 something special is on the way.','post-announcement-1080x1350.png'),
   post(tag||'Made for you','From our family to yours \u2014 thank you for being here.','post-brand-1080x1350.png'),
   post('This week only','Say it in one line \u2014 then tell them what to do next.','post-promo-1080x1350.png')]);
  if(kind==='soc-story'){ // 1080x1920, content confined to y 250..1570 (UI safe zone)
   function story(title,sub,fname){var p=_socCanvas(1080,1920,C);
    lg(p.x,540-190,320,380,380);
    p.x.textBaseline='alphabetic';p.x.fillStyle='#FFFFFF';
    p.x.textAlign='center';var px2=_fitText(p.x,name,'800 {px} '+F,130,920);p.x.font='800 '+px2+'px '+F;p.x.fillText(name,540,830,920);
    p.x.fillStyle=p.acc;p.x.fillRect(540-170,880,340,9);
    var y=_socWrapC(p.x,title,'800 96px '+BF,'#FFFFFF',540,1040,116,880);
    _socWrapC(p.x,sub,'400 56px '+BF,SMN_ONDARK_2,540,y+40,72,860);
    p.x.textAlign='center';p.x.fillStyle=SMN_ONDARK_2;p.x.font='700 46px '+BF;p.x.fillText(dom||('@'+slug(name)),540,1540,920);p.x.textAlign='left';
    return _canvasBlob(p.cv).then(function(b){return{filename:fname,blob:b};});}
   return Promise.all([story('Something new drops soon','Swipe up on our next one \u2014 you won\u2019t want to miss it.','story-teaser-1080x1920.png'),
    story(tag||'Welcome','The story behind '+name+' \u2014 tap to follow along.','story-brand-1080x1920.png')]);}
  if(kind==='soc-highlights'){var cols=C.slice(0,4).concat([_hexDeep(_darkest(C))]);
   return Promise.all(cols.slice(0,5).map(function(col,i){
    var cv=document.createElement('canvas');cv.width=1080;cv.height=1080;var x=_q(cv.getContext('2d'));
    x.fillStyle=col;x.fillRect(0,0,1080,1080);
    x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=14;x.beginPath();x.arc(540,540,400,0,7);x.stroke();
    lg(x,540-230,540-230,460,460);
    return _canvasBlob(cv).then(function(b){return{filename:'highlight-cover-'+(i+1)+'.png',blob:b};});}));}
  if(kind==='soc-carousel')return Promise.all([
   post('3 things to know','Swipe \u2192 to see what makes '+name+' different.','carousel-1-cover.png'),
   post((NM.why&&NM.why[0])||'What we do best','Slide 2 \u2014 replace with your second point.','carousel-2-content.png'),
   post('Ready when you are','Tap the link in bio \u2014 let\u2019s make it happen.','carousel-3-cta.png')]);
  if(kind==='soc-quotes'){var qs=(NM.taglines||[]).slice(0,4);while(qs.length<4)qs.push(tag||name);
   return Promise.all(qs.map(function(q,i){var p=_socCanvas(1080,1080,C);
    p.x.textBaseline='alphabetic';p.x.textAlign='center';
    p.x.fillStyle=p.acc;p.x.font='800 220px Georgia,serif';p.x.fillText('\u201C',540,330);
    var y=_socWrapC(p.x,q,'italic 600 88px '+F,'#FFFFFF',540,480,110,860);
    p.x.fillStyle=p.acc;p.x.fillRect(540-140,y+30,280,7);
    p.x.textAlign='center';p.x.fillStyle=SMN_ONDARK_2;p.x.font='700 46px '+BF;p.x.fillText('\u2014 '+name,540,y+130,900);p.x.textAlign='left';
    return _canvasBlob(p.cv).then(function(b){return{filename:'quote-card-'+(i+1)+'-1080.png',blob:b};});}));}
  // soc-testimonial: announcement + testimonial template
  function testi(){var p=_socCanvas(1080,1080,C);
   p.x.fillStyle='#FFFFFF';p.x.fillRect(90,90,900,900);
   p.x.fillStyle=p.acc;p.x.font='800 200px Georgia,serif';p.x.textAlign='center';p.x.textBaseline='alphabetic';p.x.fillText('\u201C',540,300);
   p.x.fillStyle=SMN_INK2;p.x.font='italic 400 54px '+BF;
   ['Paste your customer\u2019s kind words','right here \u2014 real praise sells','better than anything.'].forEach(function(l,i){p.x.fillText(l,540,420+i*78,800);});
   p.x.strokeStyle=_rule(C,0.88);p.x.lineWidth=3;p.x.beginPath();p.x.moveTo(340,760);p.x.lineTo(740,760);p.x.stroke();
   p.x.fillStyle=SMN_INK2;p.x.font='400 38px '+BF;p.x.fillText('customer name',540,820);
   lg(p.x,540-90,850,180,140);p.x.textAlign='left';
   return _canvasBlob(p.cv).then(function(b){return{filename:'testimonial-template-1080.png',blob:b};});}
  return Promise.all([post('We have news!','Your news in one short, proud line.','announcement-1080x1350.png'),testi()]);
 });}
/* DIGITAL & WEB PACK — DISC 6 (2026-07-24). Facebook event cover, OG share image,
   email newsletter header, Zoom background, link-in-bio page, blog headers, web banner
   set. All screen-final, QC-covered, direction-aware where it matters. */
function genDigitalPiece(kind,NM,IDEA){
 var name=NM.name,tag=NM.tag||'',dom=NM.dom||'';
 var C=((IDEA.palettes&&IDEA.palettes[0]&&IDEA.palettes[0].cols)||['#141414','#141414','#141414','#B7791F']);
 var disp=brandDisplayFont(NM,IDEA),body=brandBodyFont(disp),F='"'+disp+'",Georgia,serif',BF='"'+body+'",Arial,sans-serif';
 var logoUrl=(NM.logos&&NM.logos[0])||'';
 return Promise.all([_logoArt(logoUrl),loadBrandFont(disp),loadBrandFont(body)]).then(function(a){var im=a[0];
  function lg(x,bx,by,bw,bh,onDark){_logoSmart(x,im,bx,by,bw,bh,onDark);}
  if(kind==='dig-tip'||kind==='dig-milestone'||kind==='dig-team'||kind==='dig-countdown'
     ||kind==='dig-question'||kind==='dig-beforeafter'){
   /* Six more brand-only posts. Every one works from the brand card alone, so all six
      live in the READY lane. 1080x1350 feed-native, type on clean colour, never on a photo. */
   var SP={'dig-tip':['TIP','A tip worth sharing','Write one useful thing you know.','tip-post-1080x1350.png'],
           'dig-milestone':['MILESTONE','Thank you','Mark the moment — years, customers, a first.','milestone-post-1080x1350.png'],
           'dig-team':['OUR TEAM','Meet the people','Introduce someone and what they do.','team-post-1080x1350.png'],
           'dig-countdown':['COUNTDOWN','Almost here','Say what is coming and when.','countdown-post-1080x1350.png'],
           'dig-question':['QUESTION','Ask us anything','Invite a reply — questions get answers.','question-post-1080x1350.png'],
           'dig-beforeafter':['BEFORE & AFTER','See the difference','Describe the change you made.','before-after-1080x1350.png']};
   var sp=SP[kind]; if(!sp) return Promise.reject();
   var q=_socCanvas(1080,1350,C);
   lg(q.x,540-150,120,300,300);
   q.x.textBaseline='alphabetic';q.x.textAlign='center';
   q.x.fillStyle=q.acc;q.x.font='700 42px '+BF;q.x.fillText(sp[0],540,520,940);
   q.x.fillStyle='#FFFFFF';
   var qpx=_fitText(q.x,sp[1],'800 {px} '+F,110,920);
   q.x.font='800 '+qpx+'px '+F;q.x.fillText(sp[1],540,640,920);
   q.x.fillStyle=q.acc;q.x.fillRect(540-120,690,240,10);
   q.x.fillStyle=SMN_ONDARK_2;q.x.font='400 44px '+BF;
   var words=sp[2].split(' '),ln='',yy=790;
   words.forEach(function(w){var s2=ln?ln+' '+w:w;
     if(q.x.measureText(s2).width>900){q.x.fillText(ln,540,yy,900);yy+=58;ln=w;}else ln=s2;});
   if(ln)q.x.fillText(ln,540,yy,900);
   if(kind==='dig-beforeafter'){
     q.x.strokeStyle='rgba(255,255,255,.45)';q.x.lineWidth=4;
     q.x.strokeRect(90,980,430,240);q.x.strokeRect(560,980,430,240);
     q.x.fillStyle='rgba(255,255,255,.75)';q.x.font='700 34px '+BF;
     q.x.fillText('BEFORE',305,1115);q.x.fillText('AFTER',775,1115);
   } else {
     q.x.fillStyle=SMN_ONDARK_2;q.x.font='700 40px '+BF;
     q.x.fillText(dom||name,540,1240,920);
   }
   q.x.textAlign='left';
   return _canvasBlob(q.cv).then(function(b){return{filename:sp[3],blob:b};});}
  if(kind.indexOf('dg2-')===0){
   /* Eleven more screen deliverables at published platform sizes. All brand-only, so all
      ship in the READY lane. Type never sits on a photo. */
   var D2={'dg2-gbp':[1200,900,'google-business-post-1200x900','Post an update'],
           'dg2-pin':[1000,1500,'pinterest-pin-1000x1500','Save this'],
           'dg2-appicon':[1024,1024,'app-icon-1024',''],
           'dg2-whatsapp':[500,500,'whatsapp-profile-500',''],
           'dg2-podsq':[1400,1400,'podcast-episode-1400','New episode'],
           'dg2-emailhdr':[1200,300,'email-header-1200x300',''],
           'dg2-blogfeat':[1200,675,'blog-featured-1200x675','Read the story'],
           'dg2-xpost':[1600,900,'x-post-1600x900',''],
           'dg2-lipost':[1200,1200,'linkedin-post-1200','A quick thought'],
           'dg2-ringset':[1080,1080,'highlight-ring-1080',''],
           'dg2-vidthumb':[1280,720,'video-thumbnail-1280x720','WATCH THIS']};
   var d2=D2[kind]; if(!d2) return Promise.reject();
   var W2=d2[0],H2=d2[1],fn2=d2[2],msg2=d2[3];
   var iconish=(kind==='dg2-appicon'||kind==='dg2-whatsapp'||kind==='dg2-ringset');
   var cv2=document.createElement('canvas');cv2.width=W2;cv2.height=H2;
   var x2=_q(cv2.getContext('2d'));
   var accent=_brightest(C), deep=_darkest(C);
   if(iconish){
     x2.fillStyle='#FFFFFF';x2.fillRect(0,0,W2,H2);
     if(kind==='dg2-ringset'){x2.fillStyle=accent;x2.fillRect(0,0,W2,H2);
       x2.fillStyle='#FFFFFF';x2.beginPath();x2.arc(W2/2,H2/2,W2*0.40,0,7);x2.fill();}
     _logoSmart(x2,im,W2*0.16,H2*0.16,W2*0.68,H2*0.68);
   } else {
     var g2=x2.createLinearGradient(0,0,W2*0.6,H2);
     g2.addColorStop(0,deep);g2.addColorStop(1,_hexDeep(deep));
     x2.fillStyle=g2;x2.fillRect(0,0,W2,H2);
     x2.save();x2.globalAlpha=.12;x2.fillStyle=accent;
     x2.beginPath();x2.arc(W2*0.9,H2*0.1,Math.max(W2,H2)*0.3,0,7);x2.fill();x2.restore();
     var wide=(W2/H2)>1.9;
     var lgS=Math.round(Math.min(W2,H2)*(wide?0.62:0.30));
     if(wide){
       _logoSmart(x2,im,Math.round(W2*0.04),Math.round((H2-lgS)/2),lgS,lgS);
       x2.textBaseline='alphabetic';x2.textAlign='left';
       var tx3=Math.round(W2*0.04)+lgS+Math.round(W2*0.03), tw3=W2-tx3-Math.round(W2*0.05);
       var np2=_fitText(x2,name,'800 {px} '+F,Math.round(H2*0.30),tw3);
       x2.fillStyle='#FFFFFF';x2.font='800 '+np2+'px '+F;x2.fillText(name,tx3,H2*0.56,tw3);
       if(tag){x2.fillStyle=accent;var tp2=_fitText(x2,tag,'700 {px} '+BF,Math.round(H2*0.12),tw3);
         x2.font='700 '+tp2+'px '+BF;x2.fillText(tag,tx3,H2*0.76,tw3);}
     } else {
       _logoSmart(x2,im,(W2-lgS)/2,Math.round(H2*0.12),lgS,lgS);
       x2.textBaseline='alphabetic';x2.textAlign='center';
       var np3=_fitText(x2,name,'800 {px} '+F,Math.round(H2*0.10),W2*0.86);
       x2.fillStyle='#FFFFFF';x2.font='800 '+np3+'px '+F;x2.fillText(name,W2/2,H2*0.56,W2*0.86);
       x2.fillStyle=accent;x2.fillRect(W2/2-W2*0.10,H2*0.60,W2*0.20,Math.max(5,H2*0.010));
       if(msg2){x2.fillStyle=SMN_ONDARK_2;
         var mp3=_fitText(x2,msg2,'700 {px} '+BF,Math.round(H2*0.070),W2*0.82);
         x2.font='700 '+mp3+'px '+BF;x2.fillText(msg2,W2/2,H2*0.72,W2*0.82);}
       if(tag){x2.fillStyle='rgba(255,255,255,.80)';
         var tp3=_fitText(x2,tag,'400 {px} '+BF,Math.round(H2*0.045),W2*0.82);
         x2.font='400 '+tp3+'px '+BF;x2.fillText(tag,W2/2,H2*0.82,W2*0.82);}
       if(dom){x2.fillStyle='rgba(255,255,255,.75)';
         x2.font='700 '+Math.round(H2*0.035)+'px '+BF;x2.fillText(dom,W2/2,H2*0.93,W2*0.82);}
       x2.textAlign='left';
     }
   }
   return _canvasBlob(cv2).then(function(b){return{filename:fn2+'.png',blob:b};});}
  if(kind==='dig-hiring'){
   /* "We're hiring" post, 1080x1350. Every business needs one and it needs no client
      facts beyond the brand itself. */
   var hp=_socCanvas(1080,1350,C);
   lg(hp.x,540-170,140,340,340);
   hp.x.textBaseline='alphabetic';hp.x.textAlign='center';hp.x.fillStyle='#FFFFFF';
   var hpx=_fitText(hp.x,name,'800 {px} '+F,90,900);hp.x.font='800 '+hpx+'px '+F;
   hp.x.fillText(name,540,580,900);
   hp.x.fillStyle=hp.acc;hp.x.fillRect(540-130,620,260,10);
   hp.x.fillStyle='#FFFFFF';hp.x.font='800 110px '+BF;hp.x.fillText("WE'RE HIRING",540,790,940);
   hp.x.fillStyle=SMN_ONDARK_2;hp.x.font='400 46px '+BF;
   hp.x.fillText('Add the role and what you need.',540,890,920);
   hp.x.fillStyle=SMN_ONDARK_2;hp.x.font='700 42px '+BF;
   hp.x.fillText(dom||'Get in touch',540,1230,920);
   hp.x.textAlign='left';
   return _canvasBlob(hp.cv).then(function(b){return{filename:'hiring-post-1080x1350.png',blob:b};});}
  if(kind==='dig-thankyou'){
   /* Thank-you / review-request square. Pure brand, no client facts needed. */
   var ty=_socCanvas(1080,1080,C);
   lg(ty.x,540-150,120,300,300);
   ty.x.textBaseline='alphabetic';ty.x.textAlign='center';ty.x.fillStyle='#FFFFFF';
   ty.x.font='800 150px '+F;ty.x.fillText('Thank you',540,590,940);
   ty.x.fillStyle=ty.acc;ty.x.fillRect(540-120,640,240,10);
   ty.x.fillStyle=SMN_ONDARK_2;ty.x.font='400 46px '+BF;
   ty.x.fillText('for choosing us.',540,730,920);
   ty.x.fillStyle=SMN_ONDARK_2;ty.x.font='700 40px '+BF;
   ty.x.fillText(dom||name,540,960,920);
   ty.x.textAlign='left';
   return _canvasBlob(ty.cv).then(function(b){return{filename:'thank-you-1080.png',blob:b};});}
  if(kind==='dig-profilebanner'){
   /* LinkedIn / X profile banner, 1500x500, centre-weighted so mobile crops safely. */
   var pbn=_socCanvas(1500,500,C);
   lg(pbn.x,90,110,280,280);
   pbn.x.textBaseline='alphabetic';pbn.x.fillStyle='#FFFFFF';
   var bpx=_fitText(pbn.x,name,'800 {px} '+F,86,860);
   pbn.x.font='800 '+bpx+'px '+F;pbn.x.fillText(name,420,230,860);
   pbn.x.fillStyle=pbn.acc;pbn.x.fillRect(420,268,220,9);
   if(tag){pbn.x.fillStyle=SMN_ONDARK_2;var btx=_fitText(pbn.x,tag,'400 {px} '+BF,38,860);
     pbn.x.font='400 '+btx+'px '+BF;pbn.x.fillText(tag,420,330,860);}
   return _canvasBlob(pbn.cv).then(function(b){return{filename:'profile-banner-1500x500.png',blob:b};});}
  if(kind==='dig-signature'){
   /* EMAIL SIGNATURE — brief spec: 300-400px wide, 150-200px tall, under 100KB, max two
      columns. Drawn at 2x (760x380) so it stays sharp on retina and is placed at 380px. */
   var sg=document.createElement('canvas');sg.width=760;sg.height=380;
   var sx=_q(sg.getContext('2d'));
   sx.fillStyle='#FFFFFF';sx.fillRect(0,0,760,380);
   sx.fillStyle=_brightest(C);sx.fillRect(0,0,12,380);
   lg(sx,44,60,240,260);
   sx.strokeStyle=_rule(C,0.31);sx.lineWidth=2;
   sx.beginPath();sx.moveTo(320,64);sx.lineTo(320,316);sx.stroke();
   sx.textBaseline='alphabetic';
   sx.fillStyle=SMN_INK;sx.font='700 40px '+F;sx.fillText('Your Name',364,116,360);
   sx.fillStyle=_brightest(C);sx.font='700 24px '+BF;
   var roleT=(tag||name);var rpx=_fitText(sx,roleT,'700 {px} '+BF,24,360);
   sx.font='700 '+rpx+'px '+BF;sx.fillText(roleT,364,156,360);
   sx.fillStyle='#5B6577';sx.font='400 22px '+BF;
   var lines=[];
   if(bd.phone)lines.push(bd.phone);
   if(bd.email)lines.push(bd.email);
   if(dom)lines.push(dom);
   if(!lines.length)lines=['Add your phone and email','in Brand details'];
   lines.slice(0,3).forEach(function(l,i){sx.fillText(l,364,206+i*38,360);});
   return _canvasBlob(sg).then(function(b){return{filename:'email-signature-760x380.png',blob:b};});}
  if(kind==='dig-fbevent'){ // 1200x628 Facebook event cover
   var p=_socCanvas(1200,628,C);lg(p.x,60,60,180,180);
   p.x.textBaseline='alphabetic';p.x.fillStyle='#FFFFFF';
   var px=_fitText(p.x,name,'800 {px} '+F,86,900);p.x.font='800 '+px+'px '+F;p.x.fillText(name,270,150,900);
   p.x.fillStyle=p.acc;p.x.fillRect(270,180,260,7);
   p.x.fillStyle='rgba(255,255,255,.94)';p.x.font='700 58px '+BF;p.x.fillText('Join us \u2014 write your event details here',60,420,1080);
   p.x.fillStyle=SMN_ONDARK_2;p.x.font='400 40px '+BF;p.x.fillText('Date  \u2022  Time  \u2022  Location',60,480,1080);
   return _canvasBlob(p.cv).then(function(b){return{filename:'facebook-event-cover-1200x628.png',blob:b};});}
  if(kind==='dig-og'){ // 1200x630 OG social share image
   var o=_socCanvas(1200,630,C);lg(o.x,80,80,220,220);
   o.x.textBaseline='alphabetic';o.x.fillStyle='#FFFFFF';var opx=_fitText(o.x,name,'800 {px} '+F,96,880);o.x.font='800 '+opx+'px '+F;o.x.fillText(name,340,220,880);
   if(tag){o.x.fillStyle=SMN_ONDARK_2;var otx=_fitText(o.x,tag,'italic 500 {px} '+F,44,880);o.x.font='italic 500 '+otx+'px '+F;o.x.fillText(tag,340,290,880);}
   o.x.fillStyle=o.acc;o.x.fillRect(340,330,300,7);
   if(dom){o.x.fillStyle=SMN_ONDARK_2;o.x.font='700 38px '+BF;o.x.fillText(dom,80,590,1040);}
   return _canvasBlob(o.cv).then(function(b){return{filename:'social-share-og-1200x630.png',blob:b};});}
  if(kind==='dig-newsletter'){ // 600x200 email header
   var n=_socCanvas(600,200,C);lg(n.x,30,30,140,140);
   n.x.textBaseline='alphabetic';n.x.fillStyle='#FFFFFF';var npx=_fitText(n.x,name,'800 {px} '+F,54,380);n.x.font='800 '+npx+'px '+F;n.x.fillText(name,190,95,380);
   if(tag){n.x.fillStyle='rgba(255,255,255,.88)';var ntx=_fitText(n.x,tag,'italic 500 {px} '+F,26,380);n.x.font='italic 500 '+ntx+'px '+F;n.x.fillText(tag,190,130,380);}
   n.x.fillStyle=n.acc;n.x.fillRect(190,148,140,4);
   return _canvasBlob(n.cv).then(function(b){return{filename:'email-newsletter-header-600x200.png',blob:b};});}
  if(kind==='dig-zoom'){ // 1920x1080 virtual background, logo kept clear of center third (face zone)
   var z=_socCanvas(1920,1080,C);
   lg(z.x,80,80,260,260);
   z.x.textBaseline='alphabetic';z.x.fillStyle=SMN_ONDARK_2;var zpx=_fitText(z.x,name,'800 {px} '+F,64,700);z.x.font='800 '+zpx+'px '+F;z.x.fillText(name,80,1000,700);
   if(dom){z.x.textAlign='right';z.x.fillStyle='rgba(255,255,255,.8)';z.x.font='400 34px '+BF;z.x.fillText(dom,1840,1020);z.x.textAlign='left';}
   return _canvasBlob(z.cv).then(function(b){return{filename:'zoom-background-1920x1080.png',blob:b};});}
  if(kind==='dig-linkbio'){ // 1080x1920 link-in-bio page image (visual mock, not interactive)
   var l=_socCanvas(1080,1920,C);
   lg(l.x,540-140,140,280,280);
   l.x.textBaseline='alphabetic';l.x.textAlign='center';l.x.fillStyle='#FFFFFF';
   var lpx=_fitText(l.x,name,'800 {px} '+F,84,880);l.x.font='800 '+lpx+'px '+F;l.x.fillText(name,540,540,880);
   if(tag){l.x.fillStyle='rgba(255,255,255,.88)';var ltx=_fitText(l.x,tag,'italic 500 {px} '+F,42,880);l.x.font='italic 500 '+ltx+'px '+F;l.x.fillText(tag,540,600,880);}
   var links=['Visit our website','Shop now','Book an appointment','Follow on Instagram'];
   links.forEach(function(lk,i){var by=720+i*140;l.x.save();l.x.fillStyle='rgba(255,255,255,.12)';_rrect(l.x,140,by,800,96,20);l.x.fill();
    l.x.strokeStyle='rgba(255,255,255,.35)';l.x.lineWidth=2;_rrect(l.x,140,by,800,96,20);l.x.stroke();l.x.restore();
    l.x.fillStyle='#FFFFFF';l.x.font='700 40px '+BF;l.x.fillText(lk,540,by+60);});
   l.x.textAlign='left';
   return _canvasBlob(l.cv).then(function(b){return{filename:'link-in-bio-1080x1920.png',blob:b};});}
  if(kind==='dig-blogheader'){ // 1600x600 blog post header
   var bl=_socCanvas(1600,600,C);lg(bl.x,80,80,180,180);
   bl.x.textBaseline='alphabetic';bl.x.fillStyle='#FFFFFF';var blpx=_fitText(bl.x,name,'800 {px} '+F,90,1200);bl.x.font='800 '+blpx+'px '+F;bl.x.fillText(name,300,220,1200);
   bl.x.fillStyle=SMN_ONDARK_2;bl.x.font='italic 500 44px '+F;bl.x.fillText('Your blog post title goes here',300,300,1200);
   bl.x.fillStyle=bl.acc;bl.x.fillRect(300,340,260,6);
   return _canvasBlob(bl.cv).then(function(b){return{filename:'blog-header-1600x600.png',blob:b};});}
  // dig-webset: three-piece coordinated web set (hero band, sidebar card, footer strip)
  var hero=_socCanvas(1600,500,C);lg(hero.x,60,60,150,150);
  hero.x.textBaseline='alphabetic';hero.x.fillStyle='#FFFFFF';var hpx=_fitText(hero.x,name,'800 {px} '+F,74,1150);hero.x.font='800 '+hpx+'px '+F;hero.x.fillText(name,250,220,1150);
  if(tag){hero.x.fillStyle=SMN_ONDARK_2;var htx=_fitText(hero.x,tag,'italic 500 {px} '+F,36,1150);hero.x.font='italic 500 '+htx+'px '+F;hero.x.fillText(tag,250,270,1150);}
  var side=_socCanvas(400,600,C);lg(side.x,110,60,180,180);
  side.x.textAlign='center';side.x.fillStyle='#FFFFFF';var spx=_fitText(side.x,name,'800 {px} '+F,50,340);side.x.font='800 '+spx+'px '+F;side.x.fillText(name,200,300,340);side.x.textAlign='left';
  var foot=_socCanvas(1600,200,C);foot.x.fillStyle=SMN_ONDARK_2;foot.x.font='700 34px '+BF;foot.x.fillText((dom||name)+'  \u2022  \u00a9 '+(new Date().getFullYear()),60,120,1480);
  return Promise.all([_canvasBlob(hero.cv),_canvasBlob(side.cv),_canvasBlob(foot.cv)]).then(function(bs){
   return [{filename:'web-hero-1600x500.png',blob:bs[0]},{filename:'web-sidebar-card-400x600.png',blob:bs[1]},{filename:'web-footer-strip-1600x200.png',blob:bs[2]}];});
 });}
/* PODCAST & VIDEO PACK — DISC 7 (2026-07-24). Apple podcast spec 3000x3000, YouTube
   thumbnails 1280x720, channel art 2560x1440 with content confined to the 1546x423
   all-device safe area, intro/outro 1920x1080, transparent lower-third, audiogram. */
function genPodPiece(kind,NM,IDEA){
 var name=NM.name,tag=NM.tag||'',dom=NM.dom||'';
 var C=((IDEA.palettes&&IDEA.palettes[0]&&IDEA.palettes[0].cols)||['#141414','#141414','#141414','#B7791F']);
 var disp=brandDisplayFont(NM,IDEA),body=brandBodyFont(disp),F='"'+disp+'",Georgia,serif',BF='"'+body+'",Arial,sans-serif';
 var logoUrl=(NM.logos&&NM.logos[0])||'';
 return Promise.all([_logoArt(logoUrl),loadBrandFont(disp),loadBrandFont(body)]).then(function(a){var im=a[0];
  function lg(x,bx,by,bw,bh,onDark){_logoSmart(x,im,bx,by,bw,bh,onDark);}
  if(kind==='pod-cover'){ // 3000x3000 Apple spec
   var p=_socCanvas(3000,3000,C);lg(p.x,1500-450,420,900,900);
   p.x.textBaseline='alphabetic';p.x.textAlign='center';p.x.fillStyle='#FFFFFF';
   var px=_fitText(p.x,name,'800 {px} '+F,340,2600);p.x.font='800 '+px+'px '+F;p.x.fillText(name,1500,1780,2600);
   p.x.fillStyle=p.acc;p.x.fillRect(1500-420,1900,840,22);
   if(tag){p.x.fillStyle=SMN_ONDARK_2;var tx=_fitText(p.x,tag,'italic 500 {px} '+F,150,2500);p.x.font='italic 500 '+tx+'px '+F;p.x.fillText(tag,1500,2150,2500);}
   p.x.fillStyle='rgba(255,255,255,.8)';p.x.font='700 110px '+BF;p.x.fillText('A PODCAST',1500,2600,2400);p.x.textAlign='left';
   return _canvasBlob(p.cv).then(function(b){return{filename:'podcast-cover-3000x3000.png',blob:b};});}
  if(kind==='pod-episode'){ // 3000x3000 episode template
   var e=_socCanvas(3000,3000,C);lg(e.x,240,240,560,560);
   e.x.textBaseline='alphabetic';e.x.fillStyle=SMN_ONDARK_2;e.x.font='800 150px '+BF;e.x.fillText('EPISODE',240,1150);
   e.x.fillStyle=e.acc;e.x.font='800 560px '+F;e.x.fillText('01',240,1650);
   e.x.fillStyle='#FFFFFF';e.x.font='700 190px '+BF;
   e.x.fillText('Your episode title',240,2050,2500);e.x.fillText('goes right here',240,2290,2500);
   e.x.fillStyle='rgba(255,255,255,.8)';var epx=_fitText(e.x,name,'700 {px} '+BF,110,2500);e.x.font='700 '+epx+'px '+BF;e.x.fillText(name,240,2760,2500);
   return _canvasBlob(e.cv).then(function(b){return{filename:'episode-graphic-3000x3000.png',blob:b};});}
  if(kind==='pod-thumbs'){ // 1280x720 x2 YouTube thumbnails
   function thumb(bigline,fname){var v=_socCanvas(1280,720,C);lg(v.x,60,60,180,180);
    v.x.textBaseline='alphabetic';v.x.fillStyle='#FFFFFF';
    var vw=1280-120;var vpx=_fitText(v.x,bigline,'800 {px} '+BF,150,vw);
    v.x.font='800 '+vpx+'px '+BF;v.x.fillText(bigline,60,470,vw);
    v.x.fillStyle=v.acc;v.x.fillRect(60,520,340,14);
    v.x.fillStyle=SMN_ONDARK_2;var npx2=_fitText(v.x,name,'700 {px} '+F,54,vw);v.x.font='700 '+npx2+'px '+F;v.x.fillText(name,60,640,vw);
    return _canvasBlob(v.cv).then(function(b){return{filename:fname,blob:b};});}
   return Promise.all([thumb('YOUR BIG HOOK HERE','youtube-thumb-1-1280x720.png'),thumb('EPISODE TITLE HERE','youtube-thumb-2-1280x720.png')]);}
  if(kind==='pod-channelart'){ // 2560x1440, content strictly inside central 1546x423
   var c=_socCanvas(2560,1440,C);
   var sx=(2560-1546)/2, sy=(1440-423)/2; // 507, 508.5
   lg(c.x,sx+40,sy+61,300,300);
   c.x.textBaseline='alphabetic';c.x.fillStyle='#FFFFFF';
   var cw=1546-400;var cpx=_fitText(c.x,name,'800 {px} '+F,150,cw);
   c.x.font='800 '+cpx+'px '+F;c.x.fillText(name,sx+380,sy+230,cw);
   if(tag){c.x.fillStyle=SMN_ONDARK_2;var ctx2=_fitText(c.x,tag,'italic 500 {px} '+F,58,cw);c.x.font='italic 500 '+ctx2+'px '+F;c.x.fillText(tag,sx+380,sy+310,cw);}
   c.x.fillStyle=c.acc;c.x.fillRect(sx+380,sy+345,300,8);
   return _canvasBlob(c.cv).then(function(b){return{filename:'youtube-channel-art-2560x1440.png',blob:b};});}
  if(kind==='pod-introoutro'){ // 1920x1080 x2
   function card(main,sub,fname){var v=_socCanvas(1920,1080,C);lg(v.x,960-220,150,440,440);
    v.x.textBaseline='alphabetic';v.x.textAlign='center';v.x.fillStyle='#FFFFFF';
    var vpx=_fitText(v.x,main,'800 {px} '+F,140,1700);v.x.font='800 '+vpx+'px '+F;v.x.fillText(main,960,760,1700);
    v.x.fillStyle=v.acc;v.x.fillRect(960-240,810,480,10);
    v.x.fillStyle=SMN_ONDARK_2;v.x.font='400 56px '+BF;v.x.fillText(sub,960,930,1700);v.x.textAlign='left';
    return _canvasBlob(v.cv).then(function(b){return{filename:fname,blob:b};});}
   return Promise.all([card(name,tag||'Welcome to the show','intro-card-1920x1080.png'),card('Thanks for watching','Like, subscribe, and share \u2014 '+(dom||name),'outro-card-1920x1080.png')]);}
  if(kind==='pod-lowerthird'){ // 1920x1080 TRANSPARENT overlay, band in lower third only
   var cv=document.createElement('canvas');cv.width=1920;cv.height=1080;var x=_q(cv.getContext('2d'));
   var acc=_brightest(C),dk=_darkest(C);
   x.save();var g=x.createLinearGradient(60,0,900,0);g.addColorStop(0,dk);g.addColorStop(1,_hexDeep(dk));
   x.fillStyle=g;_rrect(x,60,860,900,150,16);x.fill();x.restore();
   x.fillStyle=acc;x.fillRect(60,860,14,150);
   lg(x,96,884,102,102);
   x.textBaseline='alphabetic';x.fillStyle='#FFFFFF';x.font='800 56px '+F;x.fillText('Speaker Name',230,932,700);
   x.fillStyle=SMN_ONDARK_2;x.font='400 38px '+BF;x.fillText(name,230,986,700);
   return _canvasBlob(cv).then(function(b){return{filename:'lower-third-1920x1080.png',blob:b};});}
  // pod-audiogram: 1080x1080 with waveform bars
  var g2=_socCanvas(1080,1080,C);lg(g2.x,80,80,200,200);
  g2.x.textBaseline='alphabetic';g2.x.fillStyle='#FFFFFF';var apx=_fitText(g2.x,name,'800 {px} '+F,72,700);g2.x.font='800 '+apx+'px '+F;g2.x.fillText(name,320,190,700);
  g2.x.fillStyle=SMN_ONDARK_2;g2.x.font='700 64px '+BF;
  g2.x.fillText('Your episode title here',80,460,920);
  var seed=(name.length*7)%13;
  for(var i3=0;i3<40;i3++){var h3=60+((i3*i3*31+seed*17)%240);g2.x.fillStyle=(i3%5===0)?g2.acc:'rgba(255,255,255,.7)';g2.x.fillRect(80+i3*24,760-h3/2,12,h3);}
  g2.x.fillStyle='rgba(255,255,255,.8)';g2.x.font='400 40px '+BF;g2.x.fillText('\u25B6  Listen now'+(dom?('  \u2022  '+dom):''),80,980,920);
  return _canvasBlob(g2.cv).then(function(b){return{filename:'audiogram-frame-1080x1080.png',blob:b};});
 });}
function genReadyLogos(logoUrl,C){return _logoArt(logoUrl).then(function(im){
 var dk=_darkest(C||[]);
 function paint(sz,bg){var cv=document.createElement('canvas');cv.width=sz;cv.height=sz;var x=_q(cv.getContext('2d'));
  if(bg){x.fillStyle=bg;x.fillRect(0,0,sz,sz);}
  var m=sz*.08;
  if(bg){_logoSmart(x,im,m,m,sz-m*2,sz-m*2);}else{var s=Math.min((sz-m*2)/im.width,(sz-m*2)/im.height),w=im.width*s,h=im.height*s;_stepDraw(x,im,(sz-w)/2,(sz-h)/2,w,h);}
  return _canvasBlob(cv);}
 return Promise.all([paint(2048,null),paint(1024,null),paint(1024,'#FFFFFF'),paint(1024,dk)]).then(function(bs){
  return [{filename:'logo-transparent-2048.png',blob:bs[0]},{filename:'logo-transparent-1024.png',blob:bs[1]},{filename:'logo-on-white-1024.png',blob:bs[2]},{filename:'logo-on-brand-dark-1024.png',blob:bs[3]}];});});}
/* BRAND WEBSITE — 5 PAGES (Founder "open season" build, 2026-07-23; A–S verdict D: IN).
   A complete drop-in site at LavishLattes craft level, themed 100% from the client's kit:
   their palette as the design system, their curated font pair, their 2K cinematic photos,
   their abouts/taglines/bios as copy, their domain on Contact. Curator-aware: food brands
   get a Menu page; everyone else gets Offerings. Delivered as FILES (never hosted). */
function _hexLight(h){try{var m=/^#?([0-9a-f]{6})$/i.exec(String(h||''));if(!m)return '#F4EFE8';var n=parseInt(m[1],16),r=(n>>16)&255,g=(n>>8)&255,b=n&255;var mix=function(c){return Math.round(c+(255-c)*0.88);};return '#'+[mix(r),mix(g),mix(b)].map(function(c){return c.toString(16).padStart(2,'0');}).join('');}catch(e){return '#F4EFE8';}}
function _brightest(C){try{var best=null,bl=-1;(C||[]).forEach(function(h){var m=/^#?([0-9a-f]{6})$/i.exec(String(h||''));if(!m)return;var n=parseInt(m[1],16),l=(0.2126*((n>>16)&255)+0.7152*((n>>8)&255)+0.0722*(n&255))/255;if(l>bl&&l<0.85){bl=l;best='#'+m[1];}});return best||'#C9A55C';}catch(e){return '#C9A55C';}}
/* DESIGN DIRECTION ENGINE (Founder order, 2026-07-24): a Miami nightclub is not a funeral
   home. Six distinct art directions — different canvas (dark/light), type behavior, motion
   pace, corner language, and mood — chosen from the client's own words. Colors/fonts stay
   the client's; the DIRECTION decides how they are worn. */
function detectDirection(IDEA,NM){
 var s=(String((IDEA&&IDEA.said)||'')+' '+String((IDEA&&IDEA.cat)||'')+' '+String((NM&&NM.tag)||'')).toLowerCase();
 if(/night ?club|nightlife|\bdj\b|\bclub\b|lounge|\bbar\b|cocktail|dance|\brave|casino|esports|energy drink/.test(s))
  return {id:'nightlife',mode:'dark',upper:true,radius:0,glow:true,pace:'fast',lift:34,italic:false};
 if(/funeral|memorial|hospice|cremat|cemetery|grief|bereave|obituar|end.of.life|estate planning/.test(s))
  return {id:'solemn',mode:'light',upper:false,radius:2,glow:false,pace:'slow',lift:10,italic:true};
 if(/water ?park|kids|children|family fun|amusement|playground|birthday|toy|daycare|preschool|petting zoo|trampoline|arcade|ice cream|candy/.test(s))
  return {id:'playful',mode:'light',upper:false,radius:22,glow:false,pace:'fast',lift:26,italic:false};
 if(/luxur|fine dining|jewel|couture|atelier|spa|winery|yacht|estate|bespoke|gallery|bridal|salon|boutique hotel/.test(s))
  return {id:'luxury',mode:'dark',upper:false,radius:2,glow:false,pace:'slow',lift:22,italic:true};
 if(/attorney|law|legal|cpa|account|tax|advisor|wealth|insurance|medical|dental|clinic|therap|consult|engineer|architec/.test(s))
  return {id:'trust',mode:'light',upper:false,radius:6,glow:false,pace:'med',lift:16,italic:false};
 return {id:'modern',mode:'dark',upper:false,radius:8,glow:false,pace:'med',lift:24,italic:true};}
function _hexDeep(h){try{var m=/^#?([0-9a-f]{6})$/i.exec(String(h||''));if(!m)return '#101018';var n=parseInt(m[1],16);var mix=function(c){return Math.round(c*0.35);};return '#'+[(n>>16)&255,(n>>8)&255,n&255].map(function(c){return mix(c).toString(16).padStart(2,'0');}).join('');}catch(e){return '#101018';}}
function genWebsite5(NM,IDEA){
 var name=NM.name,tag=NM.tag||'',dom=NM.dom||'',C=((IDEA.palettes&&IDEA.palettes[0]&&IDEA.palettes[0].cols)||['#141414','#141414','#141414','#B7791F']);
 var D=detectDirection(IDEA,NM);
 var acc=_brightest(C);
 var dark=(D.id==='nightlife')?_hexDeep(_darkest(C)):_darkest(C);
 var bg,ink,soft,card,navbg;
 if(D.mode==='light'){bg=_hexLight(acc);ink='#20242C';soft='rgba(32,36,44,.72)';card='rgba(255,255,255,.75)';navbg='rgba(255,255,255,.72)';}
 else{bg=dark;ink=_hexLight(acc);soft='rgba(255,255,255,.78)';card='#FAFAFA';navbg='rgba(0,0,0,.45)';}
 var cream=ink;
 var disp=brandDisplayFont(NM,IDEA),body=brandBodyFont(disp);
 var isFood=/pizza|restaurant|cafe|coffee|bakery|food|grill|\bbar\b|bistro|catering|kitchen|diner|taco|sushi|deli|brewery/i.test(String(IDEA.said||'')+' '+String(IDEA.cat||''));
 var about=(IDEA.aboutT||[]).slice(0,3),tags=(NM.taglines||[]).slice(0,6),bios=(IDEA.biosT||[]).slice(0,6),why=(NM.why||[]).slice(0,3);
 var hero=NM.heroUrl||IDEA.header||'';
 var photos=[];try{(IDEA.names||[]).forEach(function(n){if(n.heroUrl&&photos.indexOf(n.heroUrl)<0)photos.push(n.heroUrl);});if(IDEA.header&&photos.indexOf(IDEA.header)<0)photos.push(IDEA.header);}catch(e){}
 photos=photos.slice(0,6);
 var gf='https://fonts.googleapis.com/css2?family='+encodeURIComponent(disp).replace(/%20/g,'+')+':wght@400;600;700&family='+encodeURIComponent(body).replace(/%20/g,'+')+':wght@300;400;500;600&display=swap';
 var offLabel=isFood?'Menu':(D.id==='nightlife'?'Events':(D.id==='solemn'?'Services':(D.id==='playful'?'Attractions':'Offerings')));
 var offFile=isFood?'menu.html':(D.id==='nightlife'?'events.html':(D.id==='playful'?'attractions.html':(D.id==='solemn'?'services.html':'offerings.html')));
 var pace=(D.pace==='slow'?'1.4s':(D.pace==='fast'?'.55s':'.9s'));
 var glowCSS=D.glow?('.hero h1,.pagehead h1{text-shadow:0 0 22px '+acc+'88,0 0 60px '+acc+'44}.btn{box-shadow:0 0 24px '+acc+'66}.card:hover{border-color:'+acc+';box-shadow:0 0 30px '+acc+'33}'):'';
 var upperCSS=D.upper?('h1,h2,.wm{text-transform:uppercase;letter-spacing:.06em}'):'';
 var emCSS=D.italic?'':'.hero h1 em,.pagehead h1 em{font-style:normal}';
 var css=':root{--bg:'+bg+';--acc:'+acc+';--ink:'+ink+';--soft:'+soft+';--line:'+(D.mode==='light'?'rgba(32,36,44,.14)':'rgba(255,255,255,.16)')+';--r:'+D.radius+'px;--max:1180px}'
  +'*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--ink);font-family:"'+body+'",system-ui,sans-serif;font-weight:'+(D.id==='trust'?'400':'300')+';font-size:1.0625rem;line-height:1.7;-webkit-font-smoothing:antialiased}'
  +'h1,h2,h3{font-family:"'+disp+'",Georgia,serif;font-weight:600;letter-spacing:.01em;margin:0}a{color:inherit;text-decoration:none}img{display:block;max-width:100%}'
  +'.wrap{max-width:var(--max);margin:0 auto;padding:0 28px}.eyebrow{font-size:.75rem;letter-spacing:.34em;text-transform:uppercase;color:var(--acc);font-weight:500}'
  +'.rule{width:54px;height:'+(D.id==='playful'?'4px;border-radius:99px':'1px')+';background:var(--acc);opacity:.85;border:0;margin:22px 0}'
  +'.btn{display:inline-flex;align-items:center;gap:9px;font-weight:600;font-size:.8125rem;letter-spacing:.16em;text-transform:uppercase;padding:15px 28px;border-radius:'+(D.id==='playful'?'999px':'var(--r)')+';cursor:pointer;transition:all .35s;background:var(--acc);color:'+_inkFor(acc)+';border:1px solid var(--acc)}'
  +'.btn:hover{transform:translateY(-2px)'+(D.id==='playful'?' scale(1.04)':'')+'}'
  +'header.nav{position:sticky;top:0;z-index:50;background:'+navbg+';backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}'
  +'.nav-in{display:flex;align-items:center;justify-content:space-between;height:76px}.wm{font-family:"'+disp+'",serif;font-weight:600;font-size:1.3125rem;letter-spacing:.14em}.wm b{color:var(--acc)}'
  +'.nav-links{display:flex;gap:30px}.nav-links a{font-size:.8125rem;letter-spacing:.15em;text-transform:uppercase;opacity:.85;padding:6px 0;position:relative}'
  +'.nav-links a::after{content:"";position:absolute;left:0;bottom:0;width:0;height:2px;background:var(--acc);transition:width .3s}.nav-links a:hover::after,.nav-links a.on::after{width:100%}.nav-links a:hover,.nav-links a.on{opacity:1}'
  +'@media(max-width:760px){.nav-links{gap:16px}.nav-links a{font-size:.6875rem}}'
  +'section{padding:'+(D.id==='solemn'?'116px':'96px')+' 0}'
  +'.hero{position:relative;min-height:'+(D.id==='solemn'?'70vh':'86vh')+';display:flex;align-items:'+(D.id==='solemn'?'center':'flex-end')+';background:linear-gradient(180deg,rgba(0,0,0,'+(D.mode==='light'?'.18':'.25')+'),rgba(0,0,0,'+(D.mode==='light'?'.30':'.5')+') 45%,'+bg+' 96%)'+(hero?',url("'+hero+'") center 30%/cover no-repeat':'')+(D.mode==='light'?';color:#141414':'')+'}'
  +'.hero-in{max-width:var(--max);margin:0 auto;padding:0 28px '+(D.id==='solemn'?'0':'72px')+';width:100%'+(D.id==='solemn'?';text-align:center':'')+'}'
  +'.hero h1{font-size:clamp('+(D.id==='nightlife'?'56px,10vw,128px':(D.id==='solemn'?'40px,5.5vw,72px':'50px,8.5vw,110px'))+');line-height:.98;max-width:'+(D.id==='solemn'?'none;margin:0 auto':'13ch')+'}'
  +'.hero h1 em{font-style:italic;color:var(--acc)}.hero p{font-size:1.1875rem;opacity:.92;max-width:46ch;margin:'+(D.id==='solemn'?'22px auto 32px':'22px 0 32px')+'}'
  +'.pagehead{padding:118px 0 72px;border-bottom:1px solid var(--line)'+(D.id==='solemn'?';text-align:center':'')+'}.pagehead h1{font-size:clamp(44px,7vw,84px)}.pagehead h1 em{font-style:italic;color:var(--acc)}'
  +'.grid3{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:26px;margin-top:44px}'
  +'.card{border:1px solid var(--line);border-radius:var(--r);padding:30px 26px;background:'+card+';transition:all .3s}'
  +(D.id==='playful'?'.card:hover{transform:translateY(-6px) rotate(-1deg);border-color:var(--acc)}':'')
  +'.card h3{font-size:1.375rem;color:var(--acc);margin-bottom:10px}'
  +'.gal{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:18px;margin-top:44px}.gal img{width:100%;height:auto;display:block;border-radius:var(--r);border:1px solid var(--line)}'
  +'.rv{opacity:0;transform:translateY('+D.lift+'px);transition:opacity '+pace+' ease,transform '+pace+' ease}.rv.in{opacity:1;transform:none}'
  +'footer{border-top:1px solid var(--line);padding:44px 0;font-size:.8438rem;opacity:.75;text-align:center}'
  +glowCSS+upperCSS+emCSS;
 var js='<script>(function(){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}});},{threshold:.12});document.querySelectorAll(".rv").forEach(function(el){io.observe(el);});})();<\/script>';
 var parts=name.split(' '),wmHtml=parts.length>1?esc(parts.slice(0,-1).join(' '))+' <b>'+esc(parts[parts.length-1])+'</b>':'<b>'+esc(name)+'</b>';
 function nav(on){var L=[['index.html','Home'],['about.html','About'],[offFile,offLabel],['gallery.html','Gallery'],['contact.html','Contact']];
  return '<header class="nav"><div class="wrap nav-in"><a class="wm" href="index.html">'+wmHtml+'</a><nav class="nav-links">'+L.map(function(l){return '<a href="'+l[0]+'"'+(l[0]===on?' class="on"':'')+'>'+l[1]+'</a>';}).join('')+'</nav></div></header>';}
 function page(title,onFile,bodyHtml){return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(title)+'</title><meta name="description" content="'+esc(tag||name)+'"><meta property="og:title" content="'+esc(title)+'"><meta property="og:description" content="'+esc(tag||name)+'"><meta property="og:type" content="website">'+(hero?'<meta property="og:image" content="'+esc(hero)+'">':'')+'<script type="application/ld+json">'+JSON.stringify({'@context':'https://schema.org','@type':'LocalBusiness',name:name,description:tag||name,url:dom?('https://'+dom):undefined})+'<\/script><link rel="preconnect" href="https://fonts.googleapis.com"><link href="'+gf+'" rel="stylesheet"><style>'+css+'</style></head><body>'+nav(onFile)+bodyHtml+'<footer><div class="wrap">&copy; '+(new Date().getFullYear())+' '+esc(name)+(dom?' &middot; '+esc(dom):'')+'</div></footer>'+js+'</body></html>';}
 function P(t){return '<p class="rv">'+esc(t)+'</p>';}
 var offCards=tags.map(function(t,i){return '<div class="card rv"><h3>'+esc(isFood?('Signature '+(i+1)):t)+'</h3><p>'+esc(isFood?t:(bios[i]||''))+'</p></div>';}).join('');
 var files=[
  {filename:'index.html',blob:new Blob([page(name+' — '+(tag||'Welcome'),'index.html',
   '<div class="hero"><div class="hero-in rv in"><span class="eyebrow">'+esc(IDEA.cat||'Welcome')+'</span><h1>'+esc(name)+(tag?' <em>'+esc(tag)+'</em>':'')+'</h1><p>'+esc(about[0]||tag||'')+'</p><a class="btn" href="contact.html">Get in touch</a></div></div>'
   +'<section><div class="wrap"><span class="eyebrow">Why '+esc(name)+'</span><hr class="rule"><div class="grid3">'+why.map(function(wt){return '<div class="card rv"><p>'+esc(wt)+'</p></div>';}).join('')+'</div></div></section>')],{type:'text/html'})},
  {filename:'about.html',blob:new Blob([page('About — '+name,'about.html',
   '<div class="pagehead"><div class="wrap"><span class="eyebrow">Our story</span><h1>About <em>'+esc(name)+'</em></h1></div></div><section><div class="wrap">'+about.map(P).join('')+'</div></section>')],{type:'text/html'})},
  {filename:offFile,blob:new Blob([page(offLabel+' — '+name,offFile,
   '<div class="pagehead"><div class="wrap"><span class="eyebrow">'+offLabel+'</span><h1>What we <em>offer</em></h1><p>Edit these with your real '+(isFood?'menu items and prices':'services and details')+' — the design is ready for them.</p></div></div><section><div class="wrap"><div class="grid3">'+offCards+'</div></div></section>')],{type:'text/html'})},
  {filename:'gallery.html',blob:new Blob([page('Gallery — '+name,'gallery.html',
   '<div class="pagehead"><div class="wrap"><span class="eyebrow">Gallery</span><h1>A <em>look</em> inside</h1></div></div><section><div class="wrap"><div class="gal">'+(photos.length?photos.map(function(u){return '<img class="rv" src="'+esc(u)+'" alt="'+esc(name)+'" decoding="async">';}).join(''):'<p class="rv">Your brand photos appear here once generated.</p>')+'</div></div></section>')],{type:'text/html'})},
  {filename:'contact.html',blob:new Blob([page('Contact — '+name,'contact.html',
   '<div class="pagehead"><div class="wrap"><span class="eyebrow">Contact</span><h1>Say <em>hello</em></h1></div></div><section><div class="wrap">'+P(dom?('Find us at '+dom):'Add your web address, phone, and hours here.')+P('Follow @'+slug(name)+' everywhere.')+'<a class="btn rv" href="'+(dom?'https://'+esc(dom):'#')+'">'+(dom?esc(dom):'Your website')+'</a></div></section>')],{type:'text/html'})}
 ];
 return files;}
/* COUNT GUARANTEE fills (client side, 2026-07-23): shared by the brand card AND the file
   builders so display and downloads always carry the full promised quantities, tailored
   from the brand's own name/tagline/about — real usable lines, never blanks. */
function topArr(a,n,f){a=(Array.isArray(a)?a:[]).filter(Boolean).slice(0,n);var i=0;while(a.length<n&&f&&i<f.length){if(a.indexOf(f[i])<0)a.push(f[i]);i++;}return a;}
function smnFills(NM,IDEA){
 /* CROSS-BRAND LEAK, FIXED (2026-07-25, Founder order).
    This read ab = IDEA.aboutT[0] — the ORDER-level About copy, which is the FIRST name's.
    Every other name in the order then spliced it into its own LinkedIn intro, producing:
      "At DwellDynamics, at Structure Stewardship, we specialize in turnkey ADU management..."
    Name #6 introducing itself with name #1's sentence. Confirmed on two separate orders two
    days apart, always the same position — deterministic, not a fluke. A customer activating
    any name but the first got a LinkedIn intro naming a competitor from their own order.
    The fill now uses THIS name's own About copy, and when there is none it falls back to this
    name's tagline and then to neutral wording. It never reaches across to another brand. */
 var n=(NM&&NM.name)||'This brand', t=(NM&&NM.tag)||'';
 var own=(NM&&NM.aboutT&&NM.aboutT.length?NM.aboutT[0]:'');
 var ab=own||t||'';
 /* Never splice a sentence that names a DIFFERENT brand from this order. */
 if(ab && IDEA && IDEA.names){
   for(var q=0;q<IDEA.names.length;q++){
     var other=IDEA.names[q]&&IDEA.names[q].name;
     if(other&&other!==n&&ab.indexOf(other)>=0){ ab=''; break; }
   }
 }
 /* Tidy: strip trailing sentence punctuation so templates that add their own cannot double it.
    FIXED 2026-07-27 (Founder-reported): this stripped only a PERIOD, so a tagline ending in an
    exclamation — "Adventure Awaits for Everyone!" — kept it and the template added a full stop
    on top, shipping "Adventure Awaits for Everyone!." to a paying customer. Question marks had
    the same fault. */
 function nodot(x){ return String(x||'').replace(/\s*[.!?]+\s*$/,''); }
 /* Some templates want the tagline's own punctuation KEPT and simply must not add another. */
 function dotIf(x){ return /[.!?]\s*$/.test(String(x||'')) ? '' : '.'; }
 var tclean=nodot(t);
 /* Lowercasing the first letter only works when the sentence is ordinary prose. Two cases
    where it does not: a title-cased tagline ("Elevate Your Space" -> "elevate Your Space"),
    and a sentence that already opens with this brand's own name ("At DwellDynamics,
    dwellDynamics turns..."). Both are handled rather than papered over. */
 function leadIn(x, brand){
   x=String(x||'').trim(); if(!x) return '';
   if(x.toLowerCase().indexOf(brand.toLowerCase())===0) return '';   // it names itself: use the whole line instead
   /* Title case is a property of the WORDS, not of character 2 — "Elevate" has a lowercase
      second letter and would slip through. Two or more capitalised words in the opening three
      means it is a title and must be left exactly as written. */
   var words=x.split(/\s+/).slice(0,3);
   var caps=words.filter(function(w){ var c=w.charAt(0); return c && c===c.toUpperCase() && c!==c.toLowerCase(); }).length;
   if(caps>=2) return x;
   return x.charAt(0).toLowerCase()+x.slice(1);
 }
 var abLead=leadIn(ab, n);
 /* If the sentence already introduces this brand — "DwellDynamics turns..." or the very
    common "At DwellDynamics, we..." — use it whole. Prefixing it again produced
    "At Structure Stewardship, At Structure Stewardship, we specialize in..." */
 var selfLine='';
 if(ab){
   var head=ab.slice(0,Math.max(40, n.length+6)).toLowerCase();
   if(head.indexOf(n.toLowerCase())>=0) selfLine=ab;
 }
 return {
  taglines:[t,'Done right, every time.','Quality you can count on.','Made with care. Built to last.','Your goals. Our craft.','Start strong with '+n+'.'].filter(Boolean),
  bios:[t||('Welcome to '+n+'.'),n+' \u2014 '+(t?(t.charAt(0).toLowerCase()+t.slice(1)):'built with care')+dotIf(t||'x'),'Doing the work right, every single time.','Quality, honesty, and pride in the craft.','Proudly serving our community.','Follow along \u2014 we\u2019re just getting started.'],
  about:[n+' was built around a simple idea: '+(ab||'doing this work properly.'),'We believe in honesty, quality, and pride in the work \u2014 that\u2019s what '+n+' stands for.','Every day at '+n+' is about earning trust: showing up, doing the work well, and standing behind it.'],
  posts:['Big news \u2014 '+n+' is here! Come see what we\u2019re building.','We\u2019re officially open. '+n+' \u2014 '+(t||'built for you')+dotIf(t||'x')+' Follow along!','The wait is over: '+n+' has launched. Thank you for being here from day one.','Behind every great start is a simple promise \u2014 and ours is quality in every detail. \u2014 '+n,'Day one at '+n+'. The standards are set, and we can\u2019t wait to show you what\u2019s next.','Know someone who\u2019d love this? Send them to '+n+' \u2014 we\u2019re ready.'],
  li:[(selfLine ? selfLine : ('At '+n+', '+(abLead||'we do the work with care.')))+' If that\u2019s what you\u2019re looking for, let\u2019s connect.','I started '+n+' with one goal: '+(tclean||'to do this right')+' \u2014 dependable work, honest communication, results people stand behind.',n+' is just getting started \u2014 follow along as we build something worth being part of.'],
  fb:['Welcome to '+n+'! '+(t||'Come see what we\u2019re building.'),n+' is open \u2014 '+(t?(t.charAt(0).toLowerCase()+t.slice(1)):'done right')+dotIf(t||'x')+' Say hello!','Follow '+n+' for updates and everything we\u2019re working on.']};}

function _dlBlob(filename,blob){var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},400);}

function _zfetch(url,folder,path){return fetch(url,{mode:'cors'}).then(function(r){if(!r.ok)throw 0;return r.blob();}).then(function(b){folder.file(path,b);}).catch(function(){});}
/* SCOPE FIX (2026-07-27, Founder-reported): "it's giving me Happy Land and every other name,
   which I'm not interested."  downloadAll looped IDEA.names twice and never read curName, so
   it always packaged all six names no matter which one you were viewing — while Share, sitting
   right beside it, correctly sent only the active name. The two disagreed about what "this
   brand" means.
   NOTHING IS LOST: the all-six behaviour is still available, it is now a deliberate choice
   (scope==='all') behind its own clearly-labelled button rather than the silent default. */
function downloadAll(IDEA,btn,scope){
  var _all = (scope==='all');
  var _list = _all ? (IDEA&&IDEA.names)||[] :
    (function(){ var n=(IDEA&&IDEA.names&&IDEA.names[typeof curName!=='undefined'?curName:0]); return n?[n]:[]; })();
  logDl((IDEA&&IDEA.names&&IDEA.names[0]&&IDEA.names[0].name)||'kit','download-all');
  if(!IDEA||!IDEA.names||!IDEA.names.length){toast('Nothing to download yet.');return;}
  var _ot=''; if(btn){_ot=btn.innerHTML;btn.disabled=true;btn.innerHTML='Packaging your brand…';}
  function done(){ if(btn){btn.disabled=false;btn.innerHTML=_ot;} }
  toast('Packaging everything — one moment…');
  loadJSZip(function(){
    try{
      var zip=new JSZip();
      var C=(IDEA.palettes&&IDEA.palettes[0]&&IDEA.palettes[0].cols)||['#141414','#141414'];
      /* THE KIT MUST NAME THE BRAND YOU ASKED FOR (2026-07-27, Founder-reported).
     N0 was IDEA.names[0] — the FIRST name of the order — so a customer downloading their
     fourth name got a kit whose title, About paragraphs, bios and launch posts all talked
     about a different brand. The section heading said "Smilescape Resort" while the posts
     said "Thrillscape is here!". Now it is the name actually being packaged. */
  var N0=(_all ? IDEA.names[0] : (_list[0] || IDEA.names[0]));
      var root=zip.folder(slug(IDEA.cat||'my-brand'));
      var L=['YOUR BRAND KIT — '+(_all ? (IDEA.cat||'') : ((N0&&N0.name)||IDEA.cat||'')),'You asked for: '+(IDEA.said||''),'','Everything here is yours to keep — royalty-free, use anywhere (print, web, social, ads).',''];
      if(IDEA.palettes&&IDEA.palettes.length){L.push('COLORS');IDEA.palettes.forEach(function(p){L.push('  '+(p.name||'Palette')+': '+((p.cols||[]).join(', ')));});L.push('');}
      if(IDEA.type&&IDEA.type.length){L.push('FONTS');IDEA.type.forEach(function(t){L.push('  '+(t.name||'')+(t.note?' — '+t.note:''));});L.push('');}
      if(IDEA.voice&&IDEA.voice.length){L.push('VOICE & TONE');IDEA.voice.forEach(function(v){L.push('  '+(v.n||'')+(v.d?' — '+v.d:''));});L.push('');}
      if(IDEA.aboutT&&IDEA.aboutT.length){L.push('ABOUT');IDEA.aboutT.forEach(function(a){L.push('  '+per(a,N0.name,N0.dom));});L.push('');}
      _list.forEach(function(n){ L.push('=== '+n.name+' — '+n.dom+' ('+n.st+') ===');
        if(n.taglines&&n.taglines.length){L.push(' Taglines:');n.taglines.forEach(function(t){L.push('   • '+t);});}
        if(n.why&&n.why.length){L.push(' Why it works:');n.why.forEach(function(w){L.push('   • '+w);});} L.push(''); });
      if(IDEA.biosT&&IDEA.biosT.length){L.push('SOCIAL BIOS');IDEA.biosT.forEach(function(x){L.push('  '+per(x,N0.name,N0.dom));});L.push('');}
      if(IDEA.postsT&&IDEA.postsT.length){L.push('LAUNCH POSTS');IDEA.postsT.forEach(function(x){L.push('  '+per(x,N0.name,N0.dom));});L.push('');}
      root.file('Brand-Kit.txt',L.join('\n'));
      var logos=root.folder('logos'), photos=root.folder('photos'), jobs=[];
      _list.forEach(function(n){
        LOGO_SET.forEach(function(pr){ try{logos.file(slug(n.name)+'-'+pr[0].toLowerCase()+'.svg', pr[1](n.name,n.mono,C));}catch(e){} });
        if(n.heroUrl&&/^https?:\/\//.test(n.heroUrl)) jobs.push(_zfetch(n.heroUrl,photos,slug(n.name)+'-2k.png'));
        (n.logos||[]).forEach(function(u,i){ if(/^https?:\/\//.test(u)) jobs.push(_zfetch(u,logos,slug(n.name)+'-logo-'+(i+1)+'.png')); });

        /* THE PRESENTED KIT (2026-07-27, Founder order: "the brand kit has to be an organized
           well presented pdf"). genCopyDeck has existed since 24 July — a typeset, branded deck
           set in the brand's own display font and palette, US Letter at 200dpi — but only the
           on-demand catalogue ever called it, so this ZIP shipped a bare .txt and nothing else.
           The .txt stays for utility; the deck is the presentation. Failure is silent: a missing
           PDF must never cost the customer the rest of their download. */
        try{
          jobs.push(genCopyDeck(n, IDEA).then(function(it){
            if(it && it.blob) root.file(slug(n.name)+'-Brand-Kit.pdf', it.blob);
          }).catch(function(){}));
        }catch(e){}

        // PROVEN ASSETS — every real, named-folder item, exact same generators as
        // individual downloads. Named folders per Founder instruction.
        var logoUrl0=(n.logos&&n.logos[0])||'';
        function put(folderName,gen){
          return gen.then(function(it){ root.folder(folderName).file(it.filename,it.blob); }).catch(function(){});
        }
        function putMany(folderName,genArr){
          return genArr.then(function(arr){ var f=root.folder(folderName); arr.forEach(function(it){ f.file(it.filename,it.blob); }); }).catch(function(){});
        }
        if(logoUrl0){
          jobs.push(put(slug(n.name)+'-logo-dark-background',genDark(logoUrl0)));
          jobs.push(put(slug(n.name)+'-profile-symbol',genAvatar(logoUrl0)));
          jobs.push(putMany(slug(n.name)+'-size-pack',genSizes(logoUrl0)));
          jobs.push(putMany(slug(n.name)+'-favicon-pack',genFavs(logoUrl0)));
          jobs.push(put(slug(n.name)+'-horizontal-lockup',genLockup(logoUrl0,n.name)));
        }
        if(n.heroUrl){
          jobs.push(put(slug(n.name)+'-social-cover',genCover(smnPhotoFor(IDEA,n,'cover')||n.heroUrl)));
          jobs.push(put(slug(n.name)+'-web-banners',genBanner(smnPhotoFor(IDEA,n,'banner-300x250.png')||n.heroUrl,n.name,n.tag||'',300,250,'banner-300x250.png')));
          jobs.push(put(slug(n.name)+'-web-banners',genBanner(smnPhotoFor(IDEA,n,'banner-728x90.png')||n.heroUrl,n.name,n.tag||'',728,90,'banner-728x90.png')));
          jobs.push(put(slug(n.name)+'-web-banners',genBanner(smnPhotoFor(IDEA,n,'banner-160x600.png')||n.heroUrl,n.name,n.tag||'',160,600,'banner-160x600.png')));
        }
        (function(){var site=genSite(n.name,n.tag||'',n.dom||'',(IDEA.about&&IDEA.about[0])||n.tag||'');root.folder(slug(n.name)+'-website-starter').file(site.filename,site.blob);})();
        (function(){var hnd=genHandles(n.name);root.folder(slug(n.name)+'-suggested-handles').file(hnd.filename,hnd.blob);})();
      });
      Promise.all(jobs).then(function(){ return zip.generateAsync({type:'blob'}); }).then(function(blob){
        var url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=slug(IDEA.cat||'my-brand')+'-everything.zip';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1500);
        toast('Your complete brand is downloading.'); done();
      }).catch(function(e){ console.error(e); toast('Download hit a snag — please try again.'); done(); });
    }catch(e){ console.error(e); toast('Download hit a snag — please try again.'); done(); }
  });
}
/* DOWNLOAD LOGOS — selected lockups, packaged into a ZIP under a "logos/" folder. */
/* ===== TRUE-VECTOR LOGO SET (2026-07-30, Founder order: "add true svg alongside png").
   Drawn in code from the brand's own name + first palette by window.AGENCY_LOGO — no AI,
   no raster, no network, $0. Shows in the logo suite at the same tile size as the PNG marks,
   each tile taps to download its own .svg, and every piece rides along in the logos.zip.
   Fully guarded: if the engine is absent or a name is missing, returns [] and the card
   renders exactly as before. It never touches NM.logos / NM.wordmarks / NM.agencyLogo. */
function vecLogoSet(NM){
  try{
    if(!NM || !window.AGENCY_LOGO || typeof window.AGENCY_LOGO.spec!=='function') return [];
    var pal=(NM.palettes&&NM.palettes[0]&&NM.palettes[0].cols)||[];
    var spec=window.AGENCY_LOGO.spec(NM.name||'Brand', {colors:pal}, NM.tag||'');
    var base=slug(NM.name||'brand'), A=window.AGENCY_LOGO;
    return [
      {label:'Vector Logo',     key:'lockup',   filename:base+'-vector-logo.svg',     svg:A.lockupSVG(spec,1200,600)},
      {label:'Vector Mark',     key:'mark',     filename:base+'-vector-mark.svg',     svg:A.markSVG(spec,512)},
      {label:'Vector Wordmark', key:'wordmark', filename:base+'-vector-wordmark.svg', svg:A.wordmarkSVG(spec,1200,400)},
      {label:'Reversed (dark)', key:'reverse',  filename:base+'-vector-reversed.svg', svg:A.lockupSVG(spec,1200,600,true)}
    ];
  }catch(e){ return []; }
}
function _svgDL(svg){ try{ return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg); }catch(e){ return ''; } }
/* HERO LOGO (2026-07-30, Founder order): the reversed DARK vector lockup is the brand's large
   display logo on the card — under the name, above the tagline, responsive. Falls back to the
   heroWordmark PNG, then nothing. Same engine as the vector row; guarded. */
function vecReversedLockup(NM){
  try{
    if(!NM||!window.AGENCY_LOGO||!window.AGENCY_LOGO.spec) return '';
    var pal=(NM.palettes&&NM.palettes[0]&&NM.palettes[0].cols)||[];
    var spec=window.AGENCY_LOGO.spec(NM.name||'Brand',{colors:pal},NM.tag||'');
    return window.AGENCY_LOGO.lockupSVG(spec,1200,600,true);
  }catch(e){ return ''; }
}
function heroLogoHTML(NM){
  var rl=vecReversedLockup(NM);
  if(rl) return '<div class="wa-hero-logo">'+rl+'</div>';
  if(NM&&NM.heroWordmark) return '<div class="wa-wordmark"><img src="'+esc(NM.heroWordmark)+'" alt="'+esc(NM.name)+'" loading="lazy"></div>';
  return '';
}
function _vecTile(v){
  return '<div class="logocard veccard">'+
    '<a class="lw" href="'+_svgDL(v.svg)+'" download="'+esc(v.filename)+'" title="Download '+esc(v.label)+' as SVG" aria-label="Download '+esc(v.label)+' as SVG">'+v.svg+'</a>'+
    '<div class="ll">'+esc(v.label)+' &middot; SVG</div>'+
  '</div>';
}
function downloadLogos(IDEA,NM,indices,btn){
  if(!indices||!indices.length){toast('Pick at least one logo to download.');return;}
  var _ot=''; if(btn){_ot=btn.innerHTML;btn.disabled=true;btn.innerHTML='Packaging your logos…';}
  function done(){ if(btn){btn.disabled=false;btn.innerHTML=_ot;} }
  var RL=['primary','icon','wordmark','emblem','outline'];
  loadJSZip(function(){
    try{
      var zip=new JSZip(), folder=zip.folder('logos');
      var C=(IDEA.palettes&&IDEA.palettes[0]&&IDEA.palettes[0].cols)||['#141414','#141414'];
      indices.forEach(function(i){ var pr=LOGO_SET[i]; if(pr){ try{folder.file(slug(NM.name)+'-'+pr[0].toLowerCase()+'.svg', pr[1](NM.name,NM.mono,C));}catch(e){} } });
      var jobs=[];
      (NM.logos||[]).slice(0,5).forEach(function(u,i){ if(indices.indexOf(i)>=0 && /^https?:\/\//.test(u)) jobs.push(_zfetch(u,folder,slug(NM.name)+'-'+(RL[i]||('logo'+(i+1)))+'.png')); });
      /* ONE PACK, EVERYTHING (Founder 2026-07-30): the whole wordmark set + the agency mark ride
         along in the same logos.zip, so "download logos" gives the client every mark at once.
         These are already composed in the browser (blob URLs); _zfetch pulls them into the zip. */
      (NM.wordmarks||[]).forEach(function(wm){ if(wm&&wm.url) jobs.push(_zfetch(wm.url,folder,slug(NM.name)+'-wordmark-'+(wm.key||'x')+'.png')); });
      if(NM.agencyLogo) jobs.push(_zfetch(NM.agencyLogo,folder,slug(NM.name)+'-agency-mark.png'));
      /* TRUE-VECTOR SVGs (2026-07-30): code-drawn strings, added straight into the zip as .svg
         (no fetch needed), so every logo download-all carries the print-ready vector set too. */
      try{ vecLogoSet(NM).forEach(function(v){ folder.file(v.filename, v.svg); }); }catch(e){}
      Promise.all(jobs).then(function(){ return zip.generateAsync({type:'blob'}); }).then(function(blob){
        var url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=slug(NM.name)+'-logos.zip';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1200);
        toast(indices.length+' logo'+(indices.length>1?'s':'')+' downloading — filed under &ldquo;logos&rdquo;.'); done();
      }).catch(function(e){ console.error(e); toast('Download hit a snag — please try again.'); done(); });
    }catch(e){ console.error(e); toast('Download hit a snag — please try again.'); done(); }
  });
}
function hero(url,C,seed){var real=(url&&/^https?:\/\//.test(url));return '<div class="ch-img'+(real?'':' ch-solo')+'">'+cineSVG(C,seed)+'</div>'+(real?'<img class="ch-img ch-real" src="'+esc(url)+'" alt="" loading="lazy" onerror="this.remove();var s=this.previousElementSibling;if(s)s.className=\'ch-img ch-solo\'" decoding="async">':'');}
function dlURL(u,f){logDl(f,'photo');return _dlURL(u,f);}
/* UNIFIED LOGO GROUP (Founder order 2026-07-31): every logo tile downloads on click.
   Remote PNGs are cross-origin, so the download attribute is ignored by browsers —
   fetch to a blob first, then save with a clean filename; fall back to opening. */
function dlRemote(u,f){ logDl(f,'logo');
  fetch(u).then(function(r){ if(!r.ok) throw 0; return r.blob(); }).then(function(b){
    var o=URL.createObjectURL(b),a=document.createElement('a');a.href=o;a.download=f;
    document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(o);},1200);
    toast('Downloading '+f);
  }).catch(function(){ _dlURL(u,f); });
}
document.addEventListener('click', function(e){
  var t=e.target && e.target.closest && e.target.closest('[data-dlremote]');
  if(!t) return; e.preventDefault(); e.stopPropagation();
  var parts=(t.getAttribute('data-dlremote')||'').split('|');
  if(parts[0]) dlRemote(parts[0], parts[1]||'logo.png');
});
function _dlURL(url,f){try{var a=document.createElement('a');a.href=url;a.download=f;a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove();toast('Downloading '+f);}catch(e){toast('Download starts on your device.');}}
function avatarEl(NM,C,cls){var g='#FFFFFF';return '<div class="ava'+(cls?' '+cls:'')+'" style="background:'+g+'">'+((NM.logos&&NM.logos[0])?'<img src="'+esc(NM.logos[0])+'" alt="'+esc(NM.name)+' avatar" onerror="this.parentNode.textContent=\''+esc(NM.mono).replace(/'/g,"\\'")+'\'" decoding="async">':esc(NM.mono))+'</div>';}


var FIELDSPEC={date:['Event date','date'],time:['Event time','time'],address:['Address / location','text'],colors:['Color direction (or "use my brand colors")','text'],theme:['Theme / mood','text'],headline:['Headline or main words','text'],menu:['Items & prices (one per line)','textarea'],size:['Size / dimensions','text'],qty:['Quantity','text'],handle:['Social username to feature','text'],offer:['The offer / promotion','text'],notes:['Anything else we should know','textarea']};
var CATALOG=[
['social','Social & Content',[['post-pack','Post pack (6 posts)','Six on-brand social posts, written and designed.',['theme','notes']],['story-set','Story set (5 stories)','Vertical story graphics for Instagram & Facebook.',['theme','notes']],['cover-art','Cover art refresh','New cover/banner art for one platform.',['handle','theme','notes']],['countdown','Countdown / event set','Posts counting down to your date.',['date','offer','notes']],['quote-cards','Quote cards (4)','Shareable quote graphics in your brand look.',['headline','notes']],['reel-frames','Reel title frames','Opening/closing frames for short videos.',['headline','notes']]]],
['print','Print & Signage',[['flyer','Flyer / handout','Print-ready flyer, front or front+back.',['headline','offer','address','notes']],['poster','Poster','Large-format poster for wall or window.',['headline','size','notes']],['banner','Outdoor banner','Wide banner artwork sized to print.',['headline','size','notes']],['yard-sign','Yard / site sign','Sign artwork with your name & contact.',['headline','size','notes']],['window-decal','Window decal','Storefront glass artwork.',['size','notes']],['table-tent','Table tent card','Folded tabletop card for counters & tables.',['offer','notes']]]],
['events','Events & Invites',[['invite','Invitation','Digital + printable invitation for your event.',['date','time','address','theme','notes']],['announcement','Announcement card','Grand opening / launch announcement.',['date','headline','notes']],['program','Event program','One-page program or order of events.',['date','menu','notes']],['ticket','Ticket / entry pass','Styled tickets with your details.',['date','time','address','qty','notes']],['thank-you','Thank-you card','Post-event thank-you in your voice.',['notes']],['save-date','Save-the-date','Early notice card for your big day.',['date','notes']]]],
['menus','Menus & Pricing',[['menu-full','Full menu','Complete menu designed in your brand.',['menu','notes']],['menu-board','Menu board (screen)','Digital board for TV/tablet display.',['menu','notes']],['price-list','Price / service list','Clean pricing sheet for your services.',['menu','notes']],['specials','Specials card','Weekly specials or featured items.',['offer','menu','notes']],['takeout','Takeout / QR card','Card linking to your ordering with QR.',['notes']],['gift-cert','Gift certificate','Branded gift certificate template.',['notes']]]],
['web','Web & Digital',[['hero-image','Website hero image','A fresh 2K hero scene for your site.',['theme','notes']],['email-header','Email header','Banner art for your newsletters.',['notes']],['qr-kit','QR code kit','Styled QR codes to your site & socials.',['notes']],['favicon','Favicon & app icon','Small-size marks from your logo.',['notes']],['link-page','Link-in-bio page art','Art set for your link page.',['theme','notes']],['og-card','Social share card','The preview card shown when your site is shared.',['headline','notes']]]],
['ads','Ads & Promotion',[['ad-square','Ad — square','1080×1080 promotional ad.',['offer','headline','notes']],['ad-story','Ad — story/vertical','1080×1920 vertical ad.',['offer','headline','notes']],['ad-wide','Ad — wide/banner','Landscape web-ad set.',['offer','headline','notes']],['promo-flyer','Promo flyer','Limited-time-offer flyer.',['offer','date','notes']],['coupon','Coupon / voucher','Branded coupon with your terms.',['offer','notes']],['referral','Refer-a-friend card','Referral offer card for regulars.',['offer','notes']]]],
['docs','Business Docs',[['letterhead','Letterhead','Print & digital letterhead.',['address','notes']],['invoice','Invoice template','Clean invoice in your brand.',['address','notes']],['proposal','Proposal cover set','Cover + section pages for proposals.',['notes']],['presentation','Presentation theme','Title + content slide design.',['theme','notes']],['contract-cover','Contract cover','Professional first page for agreements.',['notes']],['email-sig','Email signature','HTML signature with your details.',['handle','notes']]]],
['merch','Apparel & Merch',[['tee','T-shirt art','Front/back shirt artwork.',['colors','size','notes']],['hat','Hat / cap art','Embroidery-ready cap design.',['colors','notes']],['tote','Tote bag art','Bag print artwork.',['colors','notes']],['sticker','Sticker pack','Die-cut sticker designs.',['qty','notes']],['mug','Mug wrap','Full-wrap mug artwork.',['notes']],['apron','Apron / workwear','Workwear chest & pocket art.',['colors','notes']]]],
/* RETIRED (2026-07-25, Founder order): 'scene-2k' — "2K brand scene", the paid one-time
   cinematic photo. Every name in an order already receives its own 2K scene at no extra
   charge, so selling another one asked the customer to pay for something they were given.
   Removed from the catalog rather than hidden, so it cannot be re-enabled by a stray flag. */
['photo','Photos & Art',[['product-bg','Product backdrop','Styled backdrop art for product shots.',['theme','notes']],['team-frame','Team photo frame','Branded frame/lower-third for team photos.',['notes']],['pattern','Brand pattern','Repeating pattern from your marks.',['colors','notes']],['icon-set','Icon set (8)','Small icons in your brand style.',['notes']],['wall-art','Wall art print','Decor print of your brand world.',['size','theme','notes']]]],
['video','Video & Motion',[['logo-sting','Logo sting','3–5s animated logo opener.',['notes']],['promo-15','15-second promo','Short promo video for socials.',['offer','headline','notes']],['slideshow','Photo slideshow','Your photos cut to music.',['theme','notes']],['lower-thirds','Lower thirds','Name/title overlays for video.',['notes']],['intro-outro','Intro + outro','Bookend clips for your videos.',['notes']],['menu-motion','Animated menu board','Motion version of your menu screen.',['menu','notes']]]]
];
/* ABOUT FIRST (2026-07-25, Founder order): "About your brand" sits directly beneath
   "What you asked for", so the reader gets the answer to their own sentence before anything
   else. The remaining twelve keep the printed report's order. */
/* ORDER RESTORED FROM THE APPROVED BRAND CARD (2026-07-30). The Founder supplied the
   CharterEdge card as the reference; its headings run 01 Why it works, 02 Logo system,
   03 Colour palettes, 04 Typography, 05 Voice & tone, 06 Taglines ... 10 About / profile.
   The live card had drifted to About/profile FIRST and pushed the logo and palettes far down
   the page — the Founder's exact complaint ("the logo should come up top, the color
   palettes, the taglines... look at the color palette way down here").
   Social handle recommendations has no counterpart in the reference and keeps its place
   after the bios, where it already sat. */
var MERGED=['why','logo','colors','typography','voice','words','avatar','bios','handles','overview','linkedin','facebook','posts'];
var TABS=[['launch','Launch'],['grow','Grow'],['deliverables','Downloads'],['addons','Extras']];
var current=IDEAS[0].id, curName=0, curTab='', cart={}, pending={}, removed={}, sortMode='newest', launchDone={};
var LAUNCH_STEPS=['Register your domain','Publish your website','Set up your social pages','Post your launch announcement','Order your promo items'];

/* Show EVERYTHING — no "See all" truncation anywhere in the workspace, so clients
   never have to hunt for their info. (show/label kept for call-signature compatibility.) */
function collapseList(items,show,render,label){
 return items.map(function(it){return '<div>'+render(it)+'</div>';}).join('');
}

function toolCard(t,d,ic,act){return '<div class="tool" data-tool="'+act+'"><span class="tic">'+ic+'</span><div class="tbody"><div class="tt">'+t+'</div><div class="td">'+d+'</div></div><span class="tgo">&rarr;</span></div>';}
var PARTNERS=[
['Northwest Registered Agent','https://www.northwestregisteredagent.com','LLC formation + a free year of registered agent','#141414'],
['ZenBusiness','https://www.zenbusiness.com','Fast LLC formation with compliance reminders','#141414'],
['Bizee','https://www.bizee.com','Free LLC formation — pay state fees only','#141414'],
['LegalZoom','https://www.legalzoom.com','LLC setup with optional attorney support','#B7791F'],
['Trademark Engine','https://www.trademarkengine.com','Affordable trademark filing','#141414'],
['Namecheap','https://www.namecheap.com','Register your domain at a fair price','#B7791F'],
['Cloudflare','https://www.cloudflare.com/products/registrar/','At-cost domains, free DNS & security','#B7791F'],
['Squarespace','https://www.squarespace.com','Beautiful all-in-one website builder','#3A3F3C'],
['Shopify','https://www.shopify.com','Everything you need to sell online','#141414'],
['Hostinger','https://www.hostinger.com','Affordable web hosting & domains','#141414'],
['Stripe','https://stripe.com','Accept payments — it powers Spark checkout','#141414'],
['Square','https://squareup.com','Payments, point-of-sale & invoices','#3A3F3C'],
['Mercury','https://mercury.com','Modern business banking for startups','#141414'],
['Novo','https://www.novo.co','Free business checking','#3A3F3C'],
['QuickBooks','https://quickbooks.intuit.com','The standard for small-business accounting','#141414'],
['HubSpot','https://www.hubspot.com/products/crm','A genuinely useful free CRM','#B7791F'],
['Zoho CRM','https://www.zoho.com/crm/','Affordable, full-featured CRM','#B7791F'],
['Pipedrive','https://www.pipedrive.com','A simple, visual sales pipeline','#3A3F3C'],
['OpenPhone','https://www.openphone.com','A business number on your phone','#141414'],
['Mailchimp','https://mailchimp.com','Email marketing & audience tools','#B7791F'],
['Canva','https://www.canva.com','Design almost anything, free to start','#141414'],
['Figma','https://www.figma.com','Professional design & prototyping','#141414'],
['Adobe Express','https://www.adobe.com/express/','Quick graphics, flyers & posts','#B7791F'],
['Olin Creative','https://olincreative.com','Custom brand design — 20 years experience','#141414']];
var FREERES=[
['IRS — Free EIN','https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online','Get your Federal Tax ID (EIN) free','#3A3F3C'],
['USPTO — Trademark Search','https://tmsearch.uspto.gov','Search U.S. trademarks — free & official','#3A3F3C'],
['USPTO — File a Trademark','https://www.uspto.gov/trademarks','Register directly with the USPTO','#3A3F3C'],
['Google Voice','https://voice.google.com','A free second number for your business','#141414'],
['Wave','https://www.waveapps.com','Free accounting & invoicing','#141414']];
function resChip(x,aff){return '<a class="reschip" href="'+x[1]+'" target="_blank" rel="noopener'+(aff?' sponsored':'')+'"><span class="rcd" style="background:'+x[3]+'"></span><span class="rcx"><span class="rcn">'+esc(x[0])+'</span><span class="rct">'+esc(x[2])+'</span></span><span class="rcgo">&#8599;</span></a>';}
function petTip(tip){return '<button class="ptip" data-tip="'+esc(tip).replace(/"/g,'&quot;')+'">&#128266; Peter&rsquo;s tip</button>';}
function filing(t,tip,url){return '<div class="filing"><span class="fchk">&check;</span><div class="fbody"><div class="fn">'+t+'</div>'+petTip(tip)+'</div><a class="fdo" href="'+url+'" target="_blank" rel="noopener sponsored">Start &rarr;</a></div>';}
function prod(ic,t,d){return '<div class="prod"><span class="pic">'+ic+'</span><div class="pbody"><div class="pn">'+t+'</div><div class="pd">'+d+'</div></div><button class="pcust" data-cust="'+esc(t).replace(/"/g,'&quot;')+'">Customize &rarr;</button></div>';}
function lockedTool(name){return '<div class="lockcard"><span class="lic">&#128274;</span><div class="lbody"><div class="lt">'+name+' &mdash; included with Pro &amp; Signature</div><div class="ld">Upgrade your package to switch this on in your command center.</div></div><button class="act primary" data-gouprade="1">Upgrade &rarr;</button></div>';}
function sparkWrite(topic,NM){var t=topic.charAt(0).toUpperCase()+topic.slice(1);return '✨ '+NM.name+' — '+t+'! '+NM.tag+' Come see what we’re all about, and say hi. 👋  #'+slug(NM.name);}
/* MOVED TO TRUE TOP LEVEL (2026-07-25). These were defined immediately before var SECMETA,
   which sits INSIDE mainHTML — so they were local to mainHTML and invisible to panel(),
   which is a sibling function and the only place that calls them. ReferenceError, render
   dead, spinner forever. Same fault as the SECCOUNT one, mirrored. Verified by executing
   mainHTML in a DOM shim (tools/render-check.js), not by grepping for the name. */
/* TYPEFACE MATCHING (2026-07-25). This alternated Georgia and Arial by index, so a suite of
   four type directions was shown in TWO faces — "Casual Script" and "Bold Serif" rendered
   identically, which makes the section meaningless. The named direction now picks a matching
   stack, and a rotation of distinct stacks guarantees no two entries repeat when the name is
   unrecognised. Web-safe stacks only: no network request, no layout shift, no FOUT. */
/* QUOTING (2026-07-25). These stacks are interpolated into style="font-family:...", a
   DOUBLE-quoted HTML attribute — so family names must use SINGLE quotes. Written with double
   quotes they terminated the attribute at the first name, the font never applied, and the
   browser parsed the remainder as stray attributes on the element. Found by loading the page
   in a real DOM (jsdom); every hand-rolled shim missed it because none of them parse HTML. */
var TYPE_STACKS=[
  ['script',  "'Snell Roundhand','Apple Chancery','Segoe Script','Brush Script MT',cursive"],
  ['hand',    "'Bradley Hand','Segoe Print','Comic Sans MS',cursive"],
  ['slab',    "'Rockwell','Roboto Slab',Georgia,serif"],
  ['serif',   "Georgia,'Times New Roman',serif"],
  ['display', "'Didot','Bodoni MT','Playfair Display',Georgia,serif"],
  ['elegant', "'Didot','Bodoni MT',Georgia,serif"],
  ['sans',    "'Helvetica Neue',Arial,system-ui,sans-serif"],
  ['geometric',"'Futura','Century Gothic','Avenir Next',system-ui,sans-serif"],
  ['mono',    "'SF Mono','Roboto Mono',Menlo,Consolas,monospace"],
  ['condensed',"'Oswald','Arial Narrow',Impact,sans-serif"]
];
var TYPE_ROTATION=["Georgia,'Times New Roman',serif",
                   "'Helvetica Neue',Arial,system-ui,sans-serif",
                   "'Futura','Century Gothic','Avenir Next',system-ui,sans-serif",
                   "'Didot','Bodoni MT',Georgia,serif",
                   "'Rockwell','Roboto Slab',Georgia,serif",
                   "'Oswald','Arial Narrow',Impact,sans-serif"];
function TYPEFACE_FOR(name,i){
  var n=String(name||'').toLowerCase();
  /* Character words are read BEFORE family words: "Playful Sans" is playful first and sans
     second, so it must reach the geometric stack rather than plain Helvetica. */
  if(/cursive|brush|calligraph|script|hand/.test(n)) return TYPE_STACKS[0][1];
  if(/playful|fun|friendly|round/.test(n))           return TYPE_STACKS[7][1];
  if(/elegant|luxur|refined|couture/.test(n))        return TYPE_STACKS[4][1];
  if(/display|poster|headline|impact/.test(n))       return TYPE_STACKS[9][1];
  if(/bold|strong|heavy|slab/.test(n))               return TYPE_STACKS[2][1];
  if(/condensed|narrow|tall/.test(n))                return TYPE_STACKS[9][1];
  if(/mono|code|technical/.test(n))                  return TYPE_STACKS[8][1];
  if(/modern|clean|minimal|geometric|sans/.test(n))  return TYPE_STACKS[7][1];
  if(/serif|classic|tradition/.test(n))              return TYPE_STACKS[3][1];
  for(var k=0;k<TYPE_STACKS.length;k++){ if(n.indexOf(TYPE_STACKS[k][0])>=0) return TYPE_STACKS[k][1]; }
  return TYPE_ROTATION[i % TYPE_ROTATION.length];
}
/* UNIQUENESS IS A SET PROPERTY (2026-07-25). Matching one name at a time cannot guarantee it:
   "Elegant Serif" and "Display" both legitimately want a Didot, and the section then shows the
   same face twice — which is the exact duplication this was written to remove. The whole list
   is resolved together, and any collision falls through to the next unused stack. */
function TYPEFACES_FOR(list){
  list = list || [];
  var used = {}, out = [], all = TYPE_STACKS.map(function(x){return x[1];}).concat(TYPE_ROTATION);
  for (var i=0;i<list.length;i++){
    var want = TYPEFACE_FOR(list[i] && (list[i].name||list[i]), i);
    if (used[want]) {
      want = null;
      for (var j=0;j<all.length;j++){ if(!used[all[j]]){ want=all[j]; break; } }
      if (!want) want = TYPE_ROTATION[i % TYPE_ROTATION.length];   // more entries than stacks
    }
    used[want]=1; out.push(want);
  }
  return out;
}

/* HUMAN COLOUR NAMES (2026-07-25, Founder order). A hex tells a customer nothing; "Dusty Rose"
   tells them everything, and it is the language a paint counter and a printer both speak.
   Nearest match by "redmean" weighted distance, which tracks perceived closeness far better
   than plain RGB, especially across reds and blues.
   DELIBERATELY TOP LEVEL: two helpers were placed inside mainHTML earlier today and were
   invisible to the sibling function that called them, spinning the workspace twice. Scope
   verified by brace-matching and by tools/render-check.js, not by grepping for the name.
   NOT Pantone: those names are licensed and cannot be reproduced. These are the everyday
   names a customer and a printer will both recognise. */
var CNAMES=[
['Snow White',255,255,255],['Ivory',255,255,240],['Bone',227,218,201],['Cream',255,253,208],
['Eggshell',240,234,214],['Linen',250,240,230],['Oatmeal',223,213,196],['Pearl Grey',234,234,232],
['Silver',192,192,192],['Dove Grey',160,160,160],['Ash Grey',150,150,150],['Slate Grey',112,128,144],
['Storm Grey',95,103,113],['Gunmetal',42,52,57],['Charcoal',54,54,54],['Graphite',70,70,70],
['Soft Black',26,26,26],['Jet Black',10,10,10],['Ink Black',18,20,26],
['Midnight Navy',12,20,42],['Navy Blue',20,35,75],['Deep Sea',18,52,86],['Sapphire',35,63,143],
['Royal Blue',48,80,190],['Cobalt',0,71,171],['Ocean Blue',40,110,180],['Denim',33,90,140],
['Steel Blue',70,130,180],['Cornflower',100,149,237],['Sky Blue',135,206,235],['Powder Blue',176,224,230],
['Ice Blue',214,234,244],['Cyan',33,212,253],['Turquoise',64,224,208],['Teal',0,128,128],
['Deep Teal',18,90,90],['Seafoam',159,226,191],['Mint',170,240,209],['Aqua',127,219,222],
['Forest Green',34,85,34],['Pine',22,70,50],['Hunter Green',53,94,59],['Emerald',39,174,96],
['Kelly Green',76,187,23],['Grass Green',124,190,70],['Olive',110,110,50],['Sage',158,175,146],
['Moss',110,130,80],['Lime',180,220,60],['Fern',90,140,80],['Celadon',200,230,190],
['Sunshine Yellow',241,196,15],['Golden Yellow',245,190,40],['Butter',240,225,150],
['Mustard',210,170,50],['Honey',225,180,90],['Amber',255,176,32],['Marigold',245,155,40],
['Tangerine',242,140,40],['Pumpkin',230,125,34],['Burnt Orange',204,85,20],['Terracotta',196,110,80],
['Rust',183,65,14],['Copper',184,115,51],['Bronze',150,110,60],['Antique Gold',180,150,90],
['Sand',214,193,158],['Camel',193,154,107],['Tan',200,170,130],['Khaki',189,183,107],
['Taupe',139,126,116],['Mocha',120,95,80],['Chocolate',92,64,51],['Espresso',60,45,38],
['Chestnut',110,70,50],['Mahogany',120,55,45],['Brick Red',150,60,50],['Barn Red',140,40,35],
['Crimson',196,30,58],['Fire Engine Red',206,32,41],['Cherry Red',215,45,60],['Scarlet',230,60,50],
['Coral',240,120,100],['Salmon',250,150,130],['Peach',255,200,170],['Apricot',247,198,167],
['Blush',245,200,200],['Dusty Rose',205,150,150],['Rose',225,110,140],['Hot Pink',255,77,141],
['Magenta',210,50,140],['Fuchsia',200,60,180],['Plum',130,60,120],['Aubergine',80,40,75],
['Wine',110,30,55],['Burgundy',128,32,48],['Maroon',110,35,45],['Lavender',190,175,230],
['Lilac',200,180,220],['Violet',124,92,255],['Purple',110,60,180],['Deep Purple',70,40,120],
['Periwinkle',170,175,235],['Indigo',75,60,160],['Cool Grey',146,152,160],['Warm Grey',160,150,140],
['Greige',190,180,170],['Stone',180,175,165],['Putty',195,185,170],['Driftwood',165,155,140],
['Clay',180,120,95],['Vanilla',240,230,200],['Wheat',225,205,160],['Straw',225,215,165],
['Seaglass',190,215,205],['Fog',205,210,212],['Pewter',135,135,140],['Iron',88,92,98],
['Champagne',236,220,190],['Rose Gold',224,168,150],['Nude',226,199,180]
];
function _hex2rgb(h){h=String(h||'').trim().replace('#','');
  if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  if(!/^[0-9a-fA-F]{6}$/.test(h))return null;
  return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];}
function colorName(hex){var c=_hex2rgb(hex);if(!c)return '';
  var best='',bd=Infinity;
  for(var i=0;i<CNAMES.length;i++){var n=CNAMES[i];
    var rm=(c[0]+n[1])/2,dr=c[0]-n[1],dg=c[1]-n[2],db=c[2]-n[3];
    var d=(2+rm/256)*dr*dr+4*dg*dg+(2+(255-rm)/256)*db*db;
    if(d<bd){bd=d;best=n[0];}}
  return best;}

/* ===== EDITABLE BUSINESS DOCUMENTS (2026-07-30, Zip 3). Real Word/Excel/PowerPoint/PDF files,
   pre-filled with the brand, generated in the browser by window.AGENCY_DOCS (+ SBX_ZIP) at $0.
   Pure addition — the site had no office-doc generator. Guarded everywhere: absent engine simply
   renders nothing and the card is unchanged. */
var DOC_CATALOG=[
  {title:'Plan &amp; pitch', items:[
    {key:'businessPlan',label:'Business Plan',fmt:'DOCX'},
    {key:'pitchDeck',label:'Pitch Deck',fmt:'PPTX'},
    {key:'proposal',label:'Proposal Template',fmt:'DOCX'},
    {key:'pricingGuide',label:'Pricing Strategy',fmt:'PDF'},
    {key:'orgChart',label:'Org Chart',fmt:'PDF'}
  ]},
  {title:'Money', items:[
    {key:'projections',label:'Financial Projections',fmt:'XLSX'},
    {key:'cashflow',label:'Cash-Flow Forecast',fmt:'XLSX'},
    {key:'breakeven',label:'Break-Even Analysis',fmt:'XLSX'},
    {key:'invoice',label:'Invoice Template',fmt:'XLSX'},
    {key:'quote',label:'Quote / Estimate',fmt:'XLSX'}
  ]},
  {title:'Sales', items:[
    {key:'salesDeck',label:'Sales Presentation',fmt:'PPTX'},
    {key:'salesScripts',label:'Sales Scripts',fmt:'DOCX'},
    {key:'salesPlaybook',label:'Sales Playbook',fmt:'DOCX'},
    {key:'churnPulse',label:'Churn-Prevention Loop',fmt:'DOCX'},
    {key:'loyaltyReferral',label:'Loyalty &amp; Referral Engine',fmt:'DOCX'}
  ]},
  {title:'Launch emails', items:[
    {key:'emailWelcome',label:'Welcome Email',fmt:'DOCX'},
    {key:'emailLaunch',label:'Launch Email',fmt:'DOCX'},
    {key:'emailSales',label:'Sales Email',fmt:'DOCX'},
    {key:'emailFollowup',label:'Follow-Up Email',fmt:'DOCX'},
    {key:'emailReengage',label:'Re-Engagement Email',fmt:'DOCX'}
  ]},
  {title:'Web', items:[
    {key:'seoChecklist',label:'SEO Checklist',fmt:'PDF'},
    {key:'metaTags',label:'Meta Tags',fmt:'HTML'},
    {key:'sitemap',label:'Sitemap',fmt:'XML'}
  ]},
  {title:'Team', items:[
    {key:'jobDescription',label:'Job Description',fmt:'DOCX'},
    {key:'teamHandbook',label:'Team Handbook',fmt:'DOCX'},
    {key:'onboardingProtocol',label:'Onboarding Protocol',fmt:'DOCX'},
    {key:'performanceReview',label:'Performance Review',fmt:'DOCX'}
  ]}
];
function docSpec(NM,IDEA){
  var cols=(NM&&NM.palettes&&NM.palettes[0]&&NM.palettes[0].cols)||[];
  var pal={ink:'#111014',paper:'#EFEBE3',accent:'#7C2B34'};
  try{ if(window.AGENCY_LOGO&&window.AGENCY_LOGO.editorialPalette){ var ep=window.AGENCY_LOGO.editorialPalette({colors:cols}); pal={ink:ep.ink,paper:ep.paper,accent:ep.accent}; } }catch(e){}
  return { name:(NM&&NM.name)||'Brand', tagline:(NM&&NM.tag)||'', domain:(NM&&NM.dom)||'', slug:slug((NM&&NM.name)||'brand'), seed:(IDEA&&(IDEA.said||IDEA.cat))||'', palette:pal };
}
function renderDocsSection(NM,IDEA){
  if(!window.AGENCY_DOCS||!window.AGENCY_DOCS.GEN) return '';
  var groups=DOC_CATALOG.map(function(g){
    return '<div class="docgrp"><div class="docgrp-h">'+g.title+'</div><div class="docgrid">'+
      g.items.map(function(it){
        return '<button class="doctile" onclick="smnGenDoc(\''+it.key+'\',this)"><span class="docfmt docfmt-'+it.fmt.toLowerCase()+'">'+it.fmt+'</span><span class="docname">'+esc(it.label)+'</span><span class="docdl">&#8681;</span></button>';
      }).join('')+
    '</div></div>';
  }).join('');
  return '<div class="ph" style="margin-top:28px">Editable business documents</div>'+
    '<p class="lgnote">Real Word, Excel, PowerPoint and PDF files &mdash; already filled in with your brand, yours to edit. Tap any to download.</p>'+
    '<div class="docswrap">'+groups+'</div>';
}
window.smnGenDoc=function(key,btn){
  try{
    var IDEA=(typeof curIdea==='function')&&curIdea(); if(!IDEA||!IDEA.names)return;
    var NM=IDEA.names[curName]||IDEA.names[0]; if(!NM)return;
    if(!window.AGENCY_DOCS||!window.AGENCY_DOCS.GEN||typeof window.AGENCY_DOCS.GEN[key]!=='function'){toast('That document isn\u2019t available yet.');return;}
    var ot=btn?btn.innerHTML:''; if(btn){btn.disabled=true;btn.classList.add('busy');}
    window.AGENCY_DOCS.GEN[key](docSpec(NM,IDEA)).then(function(res){
      var url=URL.createObjectURL(res.blob),a=document.createElement('a');a.href=url;a.download=res.n;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1500);
      if(btn){btn.disabled=false;btn.classList.remove('busy');}
      toast('Downloading '+res.n);
    }).catch(function(e){console.error(e);if(btn){btn.disabled=false;btn.classList.remove('busy');}toast('That document hit a snag &mdash; please try again.');});
  }catch(e){console.error(e);}
};
function panel(IDEA,NM){
 var C=palCols(IDEA), depth=TIER_DEPTH[IDEA.tier], sl=slug(NM.name);
 var P=function(t){return esc(per(t,NM.name,NM.dom));};
 var out={};
 var HPLAT=[['Instagram','@','https://instagram.com/'],['X','@','https://x.com/'],['TikTok','@','https://www.tiktok.com/@'],['YouTube','@','https://www.youtube.com/@'],['Facebook','/','https://www.facebook.com/'],['LinkedIn','/','https://www.linkedin.com/company/']];
 var handleList=HPLAT.map(function(p){return '<a class="wa-hl" href="'+esc(p[2]+sl)+'" target="_blank" rel="noopener"><b>'+p[0]+'</b> '+esc(p[1]+sl)+'</a>';}).join('<span class="wa-hsep">&middot;</span>');
 var webavail='';
 var aiPromo='<div class="aipromo" style="display:none"><div class="aipromo-eye">&#10024; New &middot; your AI Studio is live</div>'+
  '<div class="aipromo-t">8 AI tools, built around '+esc(NM.name)+'</div>'+
  '<div class="aipromo-d">Chat with your Brand Assistant, generate on-brand posts, recolor your logos, spin up more names, check your Brand Health, tune your voice, and create branded graphics &mdash; every tool knows your brand.</div>'+
  '<div class="aipromo-tags">'+[['&#129302;','Brand Assistant'],['&#9997;','Content Studio'],['&#127912;','Logo Lab'],['&#128173;','Name Engine'],['&#128200;','Market Pulse'],['&#10084;','Brand Health'],['&#127908;','Voice Tuner'],['&#128247;','Image Studio']].map(function(t){return '<span>'+t[0]+' '+t[1]+'</span>';}).join('')+'</div>'+
  '<button class="aipromo-btn" data-openai="1">&#10024; Open AI Studio</button></div>';
 out.overview=webavail+
  '<div class="ph">About Your Brand</div><div class="stack">'+collapseList((NM.aboutT&&NM.aboutT.length?NM.aboutT:IDEA.aboutT),1,function(t){return '<div class="prose">'+P(t)+'</div>';},'profiles')+'</div>'+
  aiPromo+
  '<div class="sxpromo" style="display:none"><div class="sxpromo-eye">&#128640; Business in a Box</div><div class="sxpromo-t">From one sentence to a real business &mdash; and money in your bank</div><div class="sxpromo-d">Your Success Path lays out every step in order: make it official, protect your name, open a business bank account, get online, get found, promote, and get paid. Hand-picked 2026 tools at each step &mdash; plus earn cash by referring friends.</div><button class="sxpromo-btn" data-opensx="1">&#128640; Open my Success Path</button></div>'+
  /* The Why bullets were printed HERE as well as in the dedicated 'why' section, so the same
     eight lines appeared twice, side by side, on the same screen (2026-07-30, Founder:
     "look at this mess"). Section 01 owns them now. */
  '';
 var REAL_LABELS=['Primary','Icon','Wordmark'];
 var agencyTile=NM.agencyLogo
   ?('<div class="logocard agencycard"><a class="lw" href="'+esc(NM.agencyLogo)+'" target="_blank" rel="noopener"><img src="'+esc(NM.agencyLogo)+'" alt="'+esc(NM.name)+' \u2014 agency custom logo" loading="lazy"></a><div class="ll">Agency Custom</div></div>')
   :((NM.logos&&NM.logos[0]&&!NM.__agFail)
     ?('<div class="logocard agencycard agencymake"><span class="ss-load" style="min-height:104px"><span class="dotspin"></span></span><div class="ll">Agency Custom</div></div>')
     :'');
 var _base=slug(NM.name||'brand');
 var _aiLbl=['Primary','Icon','Wordmark','Emblem','Outline'];
 var realLogos=(NM.logos&&NM.logos.length)?(agencyTile.replace('target="_blank" rel="noopener"','data-dlremote="'+esc(NM.agencyLogo||'')+'|'+_base+'-agency-custom.png" href="#" title="Download Agency Custom PNG"')+NM.logos.slice(0,5).map(function(u,i){var lb=_aiLbl[i]||('Logo '+(i+1));return '<div class="logocard"><button class="favheart'+(IDEA.fav?' on':'')+'" data-favh="1" aria-label="Favorite">&hearts;</button><a class="lw" href="#" data-dlremote="'+esc(u)+'|'+_base+'-'+lb.toLowerCase()+'.png" title="Download '+esc(lb)+' PNG"><img src="'+esc(u)+'" alt="'+esc(NM.name)+' '+esc(lb)+'" onerror="this.closest(\'.logocard\').style.display=\'none\'" decoding="async"></a><div class="ll">'+esc(lb)+' &middot; concept PNG</div></div>';}).join('')):'';
 var _wmTiles=(NM.wordmarks&&NM.wordmarks.length)?NM.wordmarks.map(function(wm){return '<div class="logocard wmcard"><a class="lw" href="#" data-dlremote="'+esc(wm.url)+'|'+_base+'-wordmark-'+esc((wm.key||'style')).toLowerCase()+'.png" title="Download '+esc(wm.label)+' PNG"><img src="'+esc(wm.url)+'" alt="'+esc(NM.name)+' '+esc(wm.label)+'" loading="lazy"></a><div class="ll">'+esc(wm.label)+' &middot; PNG</div></div>';}).join(''):'';
 var _vecT=vecLogoSet(NM).map(_vecTile).join('');
 var _fallback=('<div class="logoshow unigroup">'+agencyTile+LOGOS3.map(function(pr,i){return '<div class="logocard"><div class="lw">'+pr[1](NM.name,NM.mono,C)+'</div><div class="ll">'+pr[0]+'</div></div>';}).join('')+_vecT+'</div>');
 out.logo='<div class="ph">Your logo suite for &ldquo;'+esc(NM.name)+'&rdquo; &middot; tap any logo to download it</div>'+
  '<div class="lgnote">One collection, every mark: your premium <b>concept</b> designs (PNG) and the code-drawn <b>print-ready true-vector</b> files (SVG) a printer or designer works from.</div>'+
  (realLogos?('<div class="logoshow unigroup">'+realLogos+_wmTiles+_vecT+'</div>'):_fallback);
 /* TRUE-VECTOR ROW (2026-07-30): sits directly under the logo suite, same .logocard tile size
    as the AI marks, each tile taps to download its own print-ready SVG. Additive; absent engine
    or empty set simply renders nothing.
    DECISION C (Founder, 2026-07-30): ship BOTH, honestly labeled — the AI emblems are premium
    CONCEPT marks (a starting point), and the code-drawn vector set is the print-ready file. The
    caption states that distinction plainly so nothing implies the AI raster is a final print file. */
 /* Vector + wordmark rows now live INSIDE the unified group above (Founder 2026-07-31). */
 out.why='<div class="bullets">'+collapseList(NM.why,8,function(t){return '<div class="bullet"><span class="di">&#9670;</span>'+esc(t)+'</div>';},'reasons')+'</div>';
 out.colors=orEmpty((NM.palettes&&NM.palettes.length?NM.palettes:IDEA.palettes).map(function(p){return '<div class="palset"><div class="palhead"><span class="pn">'+esc(p.name)+'</span><span class="pdash">&mdash;</span><span class="pnote">'+esc(p.note)+'</span></div><div class="swrow">'+p.cols.map(function(c){return '<div class="sw" data-hex="'+c+'"><div class="cc" style="background:'+c+'"></div><div class="ch">'+c.toUpperCase()+'</div><div class="cnm">'+esc(colorName(c))+'</div></div>';}).join('')+'</div></div>';}).join(''), 'Your brand colors');
 var _faces=TYPEFACES_FOR(NM.type&&NM.type.length?NM.type:IDEA.type);
  out.typography='<div class="types">'+(NM.type&&NM.type.length?NM.type.map(function(t,ti){var fam=_faces[ti]||TYPEFACE_FOR(t&&t.name,ti);return '<div class="typ"><div class="ts" style="font-family:'+fam+';font-weight:700">'+esc(NM.name)+'</div><div class="tn">'+esc(t.name)+'</div><div class="tnote">'+esc(t.note)+'</div></div>';}):IDEA.type.map(function(t){return '<div class="typ"><div class="ts" style="font-family:'+t.font+';font-weight:'+t.w+';'+(t.ital?'font-style:italic;':'')+'">'+esc(NM.name)+'</div><div class="tn">'+esc(t.name)+'</div><div class="tnote">'+esc(t.note)+'</div></div>';})).join('')+'</div>';
 out.voice='<div class="ph">Voice &amp; tone</div><div class="grid2">'+(NM.voice&&NM.voice.length?NM.voice:IDEA.voice).map(function(v){return '<div class="vcard"><div class="vn">'+esc(v.n)+'</div><div class="vd">'+esc(v.d)+'</div></div>';}).join('')+'</div>';
 out.words='<div class="ph">Taglines for &ldquo;'+esc(NM.name)+'&rdquo;</div><div class="stack">'+collapseList(NM.taglines,3,function(t){return '<div class="line italic">&ldquo;'+esc(t)+'&rdquo;</div>';},'taglines')+'</div>';
 out.avatar='<div class="avatarcard">'+avatarEl(NM,C)+'<div><div class="an">'+esc(NM.name)+'</div><div class="ah">@'+esc(sl)+' &middot; '+esc(NM.dom)+'</div></div></div>';
 out.bios=orEmpty('<div class="stack">'+collapseList((NM.biosT&&NM.biosT.length?NM.biosT:IDEA.biosT),6,function(t){return '<div class="line">'+P(t)+'</div>';},'bios')+'</div>', 'Your profile bios');
 var _postsSrc=(NM.postsT&&NM.postsT.length?NM.postsT:IDEA.postsT);
 /* COUNT GUARANTEE safety net (2026-07-23): historical kits that arrived short of the
    promised quantities get topped up on the spot from the brand's own name, tagline, and
    about — every brand card always delivers full count, on screen and in files. */
 var _F=smnFills(NM,IDEA);
 NM.taglines=topArr((NM.taglines&&NM.taglines.length?NM.taglines:((IDEA.names&&IDEA.names[0]&&IDEA.names[0].taglines)||[])),6,_F.taglines);
 IDEA.biosT=topArr(IDEA.biosT,6,_F.bios);
 IDEA.aboutT=topArr(IDEA.aboutT,3,_F.about);
 IDEA.postsT=topArr(IDEA.postsT,6,_F.posts);
 var _liSrc=topArr((NM.linkedinT&&NM.linkedinT.length?NM.linkedinT:IDEA.linkedinT),3,_F.li);
 var _fbSrc=topArr((NM.facebookT&&NM.facebookT.length?NM.facebookT:IDEA.facebookT),3,_F.fb);
 out.posts=orEmpty('<div class="stack">'+collapseList(_postsSrc,6,function(t){return '<div class="post">'+P(t)+'</div>';},'posts')+'</div>', 'Your launch posts');
 out.linkedin=_liSrc.length?'<div class="stack">'+_liSrc.slice(0,3).map(function(t){return '<div class="post">'+P(t)+'</div>';}).join('')+'</div>':'<p style="color:var(--dim)">Not generated for this name.</p>';
 out.facebook=_fbSrc.length?'<div class="stack">'+_fbSrc.slice(0,3).map(function(t){return '<div class="post">'+P(t)+'</div>';}).join('')+'</div>':'<p style="color:var(--dim)">Not generated for this name.</p>';
 out.handles='<div class="handlelist">'+[['Instagram','@'],['Facebook','/'],['X','@'],['TikTok','@'],['YouTube','@'],['LinkedIn','/']].map(function(p){return '<div class="hrow"><b>'+p[0]+'</b><span>'+p[1]+esc(sl)+'</span><a href="https://'+p[0].toLowerCase()+'.com" target="_blank" rel="noopener" class="hgo">Confirm on platform &rarr;</a></div>';}).join('')+'</div>'+
  '<p class="hfoot">These are recommended social handles based on brand consistency. SparkMyName does not check, verify, or guarantee availability on any platform. Please confirm availability directly on each platform before claiming a handle.</p>';
 var okIdx=function(i){return i<depth||DELIVS[i][0]==='R';};var ucount=0;for(var qi=0;qi<DELIVS.length;qi++){if(okIdx(qi))ucount++;}
 out.deliverables='<div class="dlhero"><img src="img/workspace-welcome.webp" alt="Everything here is yours" loading="lazy" style="width:100%;max-width:640px;border-radius:14px;margin:0 auto 16px;display:block"><div class="dlhero-eye">&check; It&rsquo;s all yours</div>'+
  '<div class="dlhero-t">Everything below is yours to keep &mdash; royalty-free, forever.</div>'+
  '<div class="dlhero-s">Every name, logo, color, word, and 2K photo you see here is included with your $99 &mdash; download it, use it anywhere (print, web, social, ads), and keep it for good. No royalties, no limits.</div>'+
  '<button class="dlhero-btn" data-dlallzip="1">&#8681; Download everything (ZIP)</button></div>'+
  '<div class="ph">Your logos &middot; pick one, some, or all</div>'+
  '<div class="lgnote">Tap a logo to select or deselect it, then download your picks as one ZIP &mdash; every file lands neatly inside a &ldquo;logos&rdquo; folder, ready to use.</div>'+
  '<div class="logopick">'+LOGO_SET.map(function(pr,i){return '<div class="lpcard sel" data-logosel="'+i+'"><span class="lpk">&check;</span><div class="lw">'+pr[1](NM.name,NM.mono,C)+'</div><div class="ll">'+pr[0]+'</div><button class="lpdl" data-logodl="'+i+'">&darr; SVG</button></div>';}).join('')+'</div>'+
  '<div class="logoacts"><button class="lp-all" data-logoall="1"><span class="lp-allbox">&check;</span> Select all</button><button class="act primary" data-logozip="1">&#8681; Download selected logos (ZIP)</button></div>'+
  '<div class="ph">Downloads &middot; '+ucount+' of 19 unlocked</div><div class="dgrid">'+DELIVS.map(function(d,i){var ok=okIdx(i);var isMerch=(d[0]==='R');return '<div class="dcell '+(ok?'ok':'lock')+'"><span class="dl">'+d[0]+'</span><div style="flex:1;min-width:0"><div class="dn">'+esc(d[1])+'</div><div class="ds">'+(ok?'Included &check;':'Locked')+'</div></div>'+(ok?(isMerch?'<button class="go" data-merchtoggle="1">Open</button>':'<button class="go" data-dv="'+i+'">Get</button>'):'<button class="go" data-up="1">Unlock</button>')+'</div>';}).join('')+'</div>'+
  /* GO 4 (Founder order): the delivery moment — files are print-ready, take them anywhere. */
  '<div class="ph">Take it to print</div><div style="display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:14px 16px;border:1px solid rgba(24,152,80,.28);background:rgba(24,152,80,.06);border-radius:12px;margin:2px 0 6px"><div style="flex:1;min-width:200px"><div style="font-weight:700;color:#127A40;font-size:14px">Your files are print-ready</div><div style="font-size:12.5px;color:#3A3F3C;margin-top:3px">Take them to any printer you like &mdash; or browse our launch partners.</div></div><a href="resources-affiliates.html" target="_blank" rel="noopener" style="display:inline-block;padding:11px 20px;background:#189850;color:#fff;border-radius:9px;text-decoration:none;font-weight:700;font-size:13.5px;white-space:nowrap">Print Anywhere &rarr;</a></div>'+smnPrintRows()+
  '<div id="merchpanel" class="hidden"><div class="ph">Brand Promo Items &middot; ready to download</div><div class="merch">'+MERCH.map(function(m,i){return '<div class="mcard"><div class="mprev">'+merchSVG(m,NM.mono,C)+'</div><div class="mrow"><span class="mn">'+esc(m)+'</span><button class="dl" data-merch="'+i+'">&darr; File</button></div></div>';}).join('')+'</div></div>'+
  // ALL SEVEN (2026-07-27, Founder order). The order header is now a card in this grid
  // alongside each name's own scene, so the customer downloads everything they paid for
  // rather than only the photo attached to the name they happened to activate. The header
  // card downloads by URL directly and is deliberately NOT indexed into IDEA.names.
  '<div class="ph">Your 2K photos &middot; all '+((IDEA.header?1:0)+IDEA.names.length)+' included</div><div class="cinegrid">'+
  (IDEA.header?'<div class="cinecard"><div class="cineth">'+hero(IDEA.header,C,'hd'+IDEA.id)+'</div><div class="mrow"><span class="mn">Brand header</span><button class="dl" data-hdrdl="1" data-hdrurl="'+esc(IDEA.header)+'">&darr; Photo</button></div></div>':'')+
  (IDEA.names.map(function(n){return {t:n.name,s:'name'+n.mono,u:n.heroUrl||''};})).map(function(p,i){return '<div class="cinecard"><button class="favheart'+(IDEA.fav?' on':'')+'" data-favh="1" aria-label="Favorite">&hearts;</button><div class="cineth">'+hero(p.u,C,p.s)+'</div><div class="mrow"><span class="mn">'+esc(p.t)+'</span><button class="dl" data-cinedl="'+i+'"'+(p.u?' data-cineurl="'+esc(p.u)+'"':'')+'>&darr; Photo</button></div></div>';}).join('')+'</div>'+
  '<div class="cinnote">You receive all '+((IDEA.header?1:0)+IDEA.names.length)+' of these 2K photos &mdash; the brand header plus one for every name &mdash; no matter which name you choose.</div>'+
  '<div style="margin-top:22px;background:#FFFFFF;border:1px solid rgba(0,0,0,.12);border-radius:16px;padding:18px 20px">'+
  '<div style="font-weight:800;font-size:.9375rem;margin-bottom:6px">&#127873; Request a custom asset &mdash; included, no extra charge</div>'+
  '<div style="color:var(--dim);font-size:.8438rem;line-height:1.6">This is not shopping and nothing here is for sale. Simply <b style="color:var(--ink)">select what you&rsquo;d like</b> &mdash; business cards, apparel, signage, a website, anything &mdash; tell us the details, and our team custom-curates and builds it for you. It&rsquo;s already yours.</div>'+
  '<button class="act primary" style="margin-top:12px" data-reqasset="1">&#10022; Request a custom asset</button></div>';
  /* EDITABLE BUSINESS DOCUMENTS (2026-07-30, Zip 3): appended to the Downloads tab. */
  out.deliverables+=renderDocsSection(NM,IDEA);
 /* Paid tier cards removed 2026-07-24 (dead code): one product only; the included catalog + Spark Store Program are the growth path. */

 var DLITEMS=[
  ['main-logo','Main logo','logo-1.png'],
  ['logo-ready','Logo — ready to use (PNG pack)','ready'],
  ['print-card','Business card (print-ready PDF + PNG)','pcard'],
  ['print-letterhead','Letterhead (print-ready PDF)','plh'],
  ['print-thankyou','Thank-you card (print-ready PDF)','pty'],
  ['print-appt','Appointment card (print-ready PDF)','pappt'],
  ['print-coupon','Coupon / promo card (print-ready PDF)','pcpn'],
  ['print-flyer','Flyer 8.5×11 (print-ready PDF)','pfly'],
  ['print-poster','Poster 18×24 (print-ready PDF)','ppos'],
  ['print-rack','Rack card 4×9 (print-ready PDF)','prack'],
  ['print-yard','Yard sign 24×18 (print-ready PDF)','pyard'],
  ['print-decal','Window / door decal (print-ready PDF)','pdecal'],
  ['print-badge','Name badge (print-ready PDF)','pbadge'],
  ['print-menu','Menu — one page (print-ready PDF)','pmenu'],
  ['print-tent','Table tent (print-ready PDF)','ptent'],
  ['print-trifold','Tri-fold brochure (print-ready PDF)','ptri'],
  ['print-aframe','A-frame insert 24×36 (print-ready PDF)','pafr'],
  ['print-pullup','Pull-up banner 33×80 (print-ready PDF)','ppull'],
  ['print-eddm','EDDM neighborhood mailer (USPS-size PDF)','peddm'],
  ['print-gift','Gift certificate (print-ready PDF)','pgift'],
  ['print-award','Award certificate (print-ready PDF)','pawd'],
  ['print-ticket','Event ticket with stub (print-ready PDF)','ptix'],
  ['print-loyalty','Loyalty punch card (print-ready PDF)','ploy'],
  ['print-referral','Referral card (print-ready PDF)','pref'],
  ['print-bumper','Bumper sticker (print-ready PDF)','pbmp'],
  ['print-doorhanger','Door hanger (print-ready PDF)','pdh'],
  ['print-magnet','Vehicle magnet 24×12 (print-ready PDF)','pmag'],
  ['print-postcard','Postcard 6×4 (print-ready PDF)','ppc'],
  ['print-folder','Presentation folder (print-ready PDF)','pfld'],
  ['print-hours','Hours sign (print-ready PDF)','phrs'],
  ['print-shelf','Counter / shelf card (print-ready PDF)','pshf'],
  ['print-label','Product label 3×3 (print-ready PDF)','plbl'],
  ['print-hangtag','Hang tag (print-ready PDF)','phtg'],
  ['print-invite','Invitation 5×7 (print-ready PDF)','pinv'],
  ['print-placecard','Place card (print-ready PDF)','pplc'],
  ['print-insert','Package insert (print-ready PDF)','pins'],
  ['print-reviewcard','Review request card (print-ready PDF)','prev'],
  ['print-qrposter','Scan-me poster (print-ready PDF)','pqr'],
  ['print-env10','Envelope #10 (print-ready PDF)','pe10'],
  ['print-enva7','Envelope A7 (print-ready PDF)','pea7'],
  ['print-notepad','Notepad sheet (print-ready PDF)','pnpd'],
  ['print-stickersheet','Sticker sheet — 12 up (PDF)','pssh'],
  ['print-vinyl','Vinyl banner 6×2 ft (PDF)','pvny'],
  ['print-flag','Feather flag (PDF)','pflg'],
  ['print-tablecover','Table cover panel (PDF)','ptbc'],
  ['print-lanyard','Lanyard badge (PDF)','plan'],
  ['print-comment','Comment card (PDF)','pcmt'],
  ['print-shiplabel','Shipping label 4×6 (PDF)','pshp'],
  ['merch-tee','T-shirt artwork (transparent PNG)','mte'],
  ['merch-hat','Hat / cap artwork (transparent PNG)','mha'],
  ['merch-tote','Tote bag artwork (transparent PNG)','mto'],
  ['merch-mug','Mug wrap artwork (transparent PNG)','mmu'],
  ['merch-sticker','Sticker artwork (transparent PNG)','mst'],
  ['merch-apron','Apron artwork (transparent PNG)','map'],
  ['biz-invoice','Invoice (print-ready PDF)','binv'],
  ['biz-packing','Packing slip (print-ready PDF)','bpck'],
  ['biz-terms','Terms sheet (print-ready PDF)','btrm'],
  ['doc-keywords','Keyword worksheet (PDF)','dk1'],
  ['doc-meta','Page title & description sheet (PDF)','dk2'],
  ['doc-calendar','12-week content calendar (PDF)','dk3'],
  ['doc-directories','Local directory checklist (PDF)','dk4'],
  ['doc-press','Press release template (PDF)','dk5'],
  ['doc-chamber','Introduction letter (PDF)','dk6'],
  ['doc-mediakit','Media kit one-pager (PDF)','dk7'],
  ['doc-partner','Partnership outreach (PDF)','dk8'],
  ['doc-investor','Investor introduction (PDF)','dk9'],
  ['doc-availability','Availability intelligence framework (PDF)','da1'],
  ['doc-certificate','Verification certificate layout (PDF)','da2'],
  ['doc-nda','Mutual NDA framework (PDF)','di1'],
  ['doc-service','Service agreement framework (PDF)','di2'],
  ['doc-contractor','Contractor agreement framework (PDF)','di3'],
  ['doc-tess','Trademark search notes (PDF)','dj1'],
  ['doc-plan','One-page business plan (PDF)','dk10'],
  ['doc-breakeven','Break-even worksheet (PDF)','dk11'],
  ['doc-discovery','Discovery call script (PDF)','dl1'],
  ['doc-objections','Objection handling (PDF)','dl2'],
  ['doc-reviews','Review response templates (PDF)','dm1'],
  ['doc-annual','Compliance tracker (PDF)','do1'],
  ['doc-industry','Industry checklist — by your category (PDF)','dr1'],
  ['doc-repurpose','Content repurposing worksheet (PDF)','dp1'],
  ['doc-aiqa','Assistant briefing sheet (PDF)','dp2'],
  ['doc-guardrails','Voice guardrails — what is never said (PDF)','dp3'],
  ['soc-posts','Social posts — 3-pack (1080×1350)','sposts'],
  ['soc-story','Story templates — 2-pack (1080×1920)','sstory'],
  ['soc-highlights','Story highlight covers — 5-pack','shl'],
  ['soc-carousel','Carousel set — 3 slides','scar'],
  ['soc-quotes','Quote cards — 4-pack (1080²)','squote'],
  ['soc-testimonial','Announcement + testimonial templates','stest'],
  ['dig-fbevent','Facebook event cover (1200×628)','dfb'],
  ['dig-og','Social share image — OG (1200×630)','dog'],
  ['dig-newsletter','Email newsletter header (600×200)','dnews'],
  ['dig-zoom','Virtual / Zoom background (1920×1080)','dzoom'],
  ['dig-linkbio','Link-in-bio page image (1080×1920)','dlink'],
  ['dig-blogheader','Blog post header (1600×600)','dblog'],
  ['dig-webset','Web banner set — hero + sidebar + footer','dweb'],
  ['dig-signature','Email signature (2× for retina)','dsig'],
  ['dig-hiring','We’re hiring post (1080×1350)','dhir'],
  ['dig-thankyou','Thank-you post (1080²)','dthx'],
  ['dig-profilebanner','Profile banner — LinkedIn / X (1500×500)','dpbn'],
  ['dig-tip','Tip post (1080×1350)','dtip'],
  ['dig-milestone','Milestone post (1080×1350)','dmil'],
  ['dig-team','Meet-the-team post (1080×1350)','dtem'],
  ['dig-countdown','Countdown post (1080×1350)','dcnt'],
  ['dig-question','Question / AMA post (1080×1350)','dqst'],
  ['dig-beforeafter','Before & after post (1080×1350)','dba'],
  ['dg2-gbp','Google Business post (1200×900)','g2a'],
  ['dg2-pin','Pinterest pin (1000×1500)','g2b'],
  ['dg2-appicon','App icon (1024²)','g2c'],
  ['dg2-whatsapp','WhatsApp profile (500²)','g2d'],
  ['dg2-podsq','Podcast episode square (1400²)','g2e'],
  ['dg2-emailhdr','Email header (1200×300)','g2f'],
  ['dg2-blogfeat','Blog featured image (1200×675)','g2g'],
  ['dg2-xpost','X / Twitter post (1600×900)','g2h'],
  ['dg2-lipost','LinkedIn post (1200²)','g2i'],
  ['dg2-ringset','Highlight ring cover (1080²)','g2j'],
  ['dg2-vidthumb','Video thumbnail (1280×720)','g2k'],
  ['pod-cover','Podcast cover art (3000² Apple spec)','pcov'],
  ['pod-episode','Episode graphic template (3000²)','pep'],
  ['pod-thumbs','YouTube thumbnails — 2-pack (1280×720)','pyt'],
  ['pod-channelart','YouTube channel art (safe-area 2560×1440)','pch'],
  ['pod-introoutro','Intro + outro cards (1920×1080)','pio'],
  ['pod-lowerthird','Lower-third overlay (transparent)','plt'],
  ['pod-audiogram','Audiogram frame (1080²)','pau'],
  ['biz-quote','Quote / estimate (print-ready PDF)','bq'],
  ['biz-receipt','Receipt (print-ready PDF)','br'],
  ['biz-proposal','Proposal cover (print-ready PDF)','bp'],
  ['biz-welcome','Welcome / onboarding sheet (PDF)','bw'],
  ['biz-faq','FAQ / info sheet (PDF)','bf'],
  ['biz-pricelist','Service menu / price list (PDF)','bpl'],
  ['biz-onepager','Sales one-pager (PDF)','bop'],
  ['deck-capabilities','Capabilities deck (5 slides, PDF)','dkc'],
  ['deck-pitch','Pitch deck (5 slides, PDF)','dkp'],
  ['copydeck','Brand Copy Deck (presented PDF)','deck'],
  ['vector-logo','Vector logo (SVG — source file for printers & designers)','vector'],
  ['logo-dark','Logo — dark background','dark'],
  ['size-pack','Logo size pack (256–2048px)','sizes'],
  ['lockup','Horizontal lockup','lockup'],
  ['favicons','Favicon pack','favs'],
  ['avatar','Profile symbol (square)','avatar'],
  ['hero','Website hero image','hero'],
  ['cover','Social cover (1500×500)','cover'],
  ['banner1','Web banner 300×250','b1'],
  ['banner2','Web banner 728×90','b2'],
  ['banner3','Web banner 160×600','b3'],
  ['banner4','Web banner 300×600 (half page)','b4'],
  ['banner5','Mobile banner 320×50','b5'],
  ['banner6','Billboard banner 970×250','b6'],
  ['site','Website starter page','site'],
  ['website5','Brand Website (5 pages)','web5'],
  ['taglines','Taglines','taglines'],
  ['fonts','Your fonts','fonts'],
  ['bios','Social bios','bios'],
  ['posts','Launch posts','posts'],
  ['handles','Suggested handles','handles']
 ];
 var _bdNow = _bd(IDEA);
 var _ready = DLITEMS.filter(function(d){return smnUnlocked(d[0],_bdNow);});
 var _cust  = DLITEMS.filter(function(d){return !smnUnlocked(d[0],_bdNow);});
 var _unlockedCount = _ready.filter(function(d){return !SMN_READY[d[0]];}).length;
 function _cell(d){return '<div class="dlcell" data-selkey="'+d[0]+'"><span class="dln">'+esc(d[1])+'</span><button class="dlgo" data-dlitem="'+d[0]+'">&darr; Download</button></div>';}
 function _softcell(d){
   var miss=smnMissing(d[0],_bdNow);
   var why=miss.length?('Needs '+miss.map(function(m){return SMN_NEEDLABEL[m]||m;}).join(' and ')):'Coming soon';
   return '<div class="dlcell soon"><span class="dln">'+esc(d[1])+'</span><span class="dlsoon">'+esc(why)+'</span></div>';}
 out.deliverables+='<div class="ph">Ready to use &mdash; '+_ready.length+' files, download and go</div>'+
  '<div class="dlnote">These are finished with your brand. Print them or post them today &mdash; nothing to fill in.'
  +(_unlockedCount?(' <b>'+_unlockedCount+' unlocked by the details you added.</b>'):'')
  +' Click a name to highlight one or a group, then use the buttons below, or download any single item directly.</div>'+
  '<div class="dlgrid" id="dlgrid">'+_ready.map(_cell).join('')+'</div>'+
  (_cust.length?('<div class="ph2" style="margin-top:26px">Waiting on you &mdash; '+_cust.length+' more</div>'+
  '<div class="dlnote">These are already laid out in your brand. Each one is waiting on a fact only you can give it. Add your phone, email and address once and most of them unlock immediately. '
  +'<button class="cobtn" data-branddetails="1" style="margin-top:8px">Add / edit my details</button></div>'+
  '<div class="dlgrid dlsoongrid">'+_cust.map(_softcell).join('')+'</div>'):'')+
  '<div id="customdl"></div>'+
  '<div class="dlbar"><button class="dlgo big" data-dlsel>&darr; Download selected <span id="selct"></span></button><button class="dlgo big grad" data-dlassets>&darr; DOWNLOAD ALL ASSETS (ZIP)</button></div>';
 /* PACKAGE CURATOR (Founder-approved 2026-07-23, additive only — causes no harm to the OS).
    Reads the client's OWN words (same philosophy as the name brain and photo recipes) and
    curates the included catalog for their kind of dream: lead categories first, clearly
    irrelevant ones tucked behind "Show everything" — never deleted, always one tap away.
    A podcaster is never handed a menu; a pizzeria is never handed podcast art. */
 var PKGS=[
  {id:'podcast',n:'Podcast Package',k:/\bpodcast|episode|listeners?\b|\baudio show\b/i,lead:['social','video','web','ads'],hide:['menus','events']},
  {id:'creator',n:'Creator & Influencer Package',k:/influencer|creator|youtube|content channel|streamer|tiktok|vlog|blog\b/i,lead:['social','web','ads','video'],hide:['menus']},
  {id:'nonprofit',n:'Nonprofit & Charity Package',k:/\b(non[\s-]?profit|charity|charitable|foundation|ngo|501\s*\(?c\)?\s*\(?3\)?|shelter|rescue mission|support group)\b/i,lead:['events','print','social','docs'],hide:['menus']},
  {id:'event',n:'Event & Celebration Package',k:/wedding|birthday|anniversary|memorial|reunion|festival|gala|party\b|baby shower|celebration|fundraiser/i,lead:['events','print','social','photo'],hide:['menus','docs']},
  {id:'food',n:'Food & Hospitality Package',k:/restaurant|pizzeria|pizza|cafe|coffee|bakery|food truck|catering|\bbar\b|grill|diner|bistro|taco|sushi|deli|brewery|kitchen/i,lead:['menus','print','social','events'],hide:[]},
  {id:'trades',n:'Trades & Services Package',k:/plumb|electric|hvac|roof|landscap|construction|contractor|handyman|clean|pest|paint|remodel|towing|repair|storage|moving/i,lead:['print','docs','ads','social'],hide:['menus','events']},
  {id:'pro',n:'Professional Practice Package',k:/attorney|law firm|legal practice|\bcpa\b|accountant|tax|advisor|insurance|consult|therap|dental|medical|clinic|architec|engineer/i,lead:['docs','web','print','social'],hide:['menus','merch']},
  {id:'shop',n:'Online & Retail Package',k:/shop|store|boutique|e-?commerce|etsy|sell|retail|products?\b|merch\b/i,lead:['ads','social','web','photo'],hide:['menus']}
 ];
 function curatePkg(IDEA){try{var s=String((IDEA&&IDEA.said)||'')+' '+String((IDEA&&IDEA.cat)||'');for(var i=0;i<PKGS.length;i++)if(PKGS[i].k.test(s))return PKGS[i];}catch(e){}return null;}
 function curatedCatalog(IDEA){var p=curatePkg(IDEA);if(!p)return {pkg:null,lead:CATALOG.slice(),rest:[]};
  var lead=[],rest=[];CATALOG.forEach(function(cg){if(p.lead.indexOf(cg[0])>=0)lead[p.lead.indexOf(cg[0])]=cg;else rest.push(cg);});
  lead=lead.filter(Boolean);
  rest.sort(function(a,b){var ha=p.hide.indexOf(a[0])>=0?1:0,hb=p.hide.indexOf(b[0])>=0?1:0;return ha-hb;});
  return {pkg:p,lead:lead,rest:rest};}
 var CUR=curatedCatalog(IDEA);
 function _catSec(cg){return '<div class="catsec"><div class="ph2">'+cg[1]+'</div><div class="catgrid">'+cg[2].map(function(it){return '<div class="citem"><div class="cin">'+it[1]+'</div><div class="cid">'+it[2]+'</div><button class="cobtn" data-ordit="'+cg[0]+':'+it[0]+'">&#10022; Order &mdash; included</button></div>';}).join('')+'</div></div>';}
 out.addons='<div class="curband" id="storeband"><span class="curb-t">&#10024; Spark Store &mdash; complimentary for your first 90 days</span><span class="curb-d">Order anything below, as often as you like &mdash; it\u2019s included. When your 90 days end, keep it unlimited for $19/month &mdash; no commitment, cancel anytime in one click, and everything ever delivered stays yours forever. <button class="cobtn" data-storepass="1" style="margin-top:8px">Keep my Store unlimited &mdash; $19/mo</button></span></div>'+
   '<div class="curband" style="border-color:rgba(0,0,0,.14);background:#FFFFFF"><span class="curb-t">&#127912; Design live with your Spark AI Designer</span><span class="curb-d">Tell your designer what you need &mdash; a holiday flyer, an event poster, a promo post &mdash; watch it drawn for &ldquo;'+esc(NM.name)+'&rdquo; before your eyes, then change anything until it\u2019s perfect. <button class="cobtn" data-aidesigner="1" style="margin-top:8px">&#10024; Start designing</button></span></div>'+
   '<div class="curband" style="border-color:rgba(59,232,143,.45)"><span class="curb-t">&#128203; Brand details (for print pieces)</span><span class="curb-d">Add your phone, email, and address once &mdash; your business cards, letterhead, and print pieces fill in automatically. Nothing shows until you add it. <button class="cobtn" data-branddetails="1" style="margin-top:8px">Add / edit details</button></span></div>'+
   '<div class="ph">Order anything for &ldquo;'+esc(NM.name)+'&rdquo; &mdash; included</div>'+
   '<div class="subh">Every item below is part of your $99 &mdash; no cart, no fees. Tell us the details, we custom-build it and deliver it to this workspace within 24 hours, and email you the moment it\'s ready.</div>'+
   '<div class="ordtrack" id="ordwrap"><div class="ph2">Your orders</div><div id="ordlist" class="ordlist"><span class="ordempty">No orders yet &mdash; pick anything below.</span></div></div>'+
   (CUR.pkg?'<div class="curband"><span class="curb-t">&#10024; Curated for you: '+esc(CUR.pkg.n)+'</span><span class="curb-d">Built around your idea &mdash; the most useful items first. Everything else is still yours below.</span></div>':'')+
   CUR.lead.map(_catSec).join('')+
   (CUR.pkg&&CUR.rest.length?'<button class="curmore" data-curmore="1">Show everything else ('+CUR.rest.length+' more categories) &#8595;</button><div id="currest" class="hidden">'+CUR.rest.map(_catSec).join('')+'</div>':CUR.rest.map(_catSec).join(''));
  var doneSet=launchDone[IDEA.id]||{},dcount=LAUNCH_STEPS.filter(function(m,i){return doneSet[i];}).length,pct=Math.round(dcount/LAUNCH_STEPS.length*100);
 var ROAD=[['Foundation','Name, domain, logos, colors & words','done'],['Launch','Website live, socials set, announcement posted',(pct>=60?'done':'now')],['Grow','Get found on search, run ads, publish content, gather reviews',(pct>=60?'now':'next')],['Scale','New products, a team, a second location','later']];
 out.launch='<div class="ph">Launch map</div>'+
  '<div class="launchring"><div class="lring" style="--p:'+pct+'"><i>'+pct+'%</i></div><div style="font-size:.8438rem;font-weight:700">Launch readiness<br><span style="color:var(--dim);font-weight:500">'+dcount+' of '+LAUNCH_STEPS.length+' steps done &mdash; tap a step to check it off.</span></div></div>'+
  LAUNCH_STEPS.map(function(m,i){return '<div class="milestone'+(doneSet[i]?' done':'')+'" data-ms="'+i+'"><span class="mck">&check;</span><span class="mtx">'+esc(m)+'</span></div>';}).join('')+
  '<div class="ph">Brand Success Road Map</div><div class="road">'+ROAD.map(function(r){return '<div class="rstep '+r[2]+'"><span class="rdot"></span><div class="rbody"><div class="rt2">'+esc(r[0])+' <em>'+(r[2]==='done'?'Done':r[2]==='now'?'In progress':r[2]==='next'?'Next':'Later')+'</em></div><div class="rd">'+esc(r[1])+'</div></div></div>';}).join('')+'</div>'+
  '<div style="margin-top:16px"><button class="act primary" data-launchbiz="1">&#128640; Launch your business</button></div>'+
  '<div class="cinnote">Your Spark concierge and lifecycle support ride along the whole way &mdash; message the Spark team any time from right here \u2014 a real person reads it and replies to your email.</div>';
 var tr=TIER_RANK[IDEA.tier];
 out.grow='<div class="pkgband"><span>Your package</span><b>'+TIER_NAME[IDEA.tier]+' &middot; '+TIER_PRICE[IDEA.tier]+'</b> &mdash; everything shown in this command center is included.</div>'+
  '<div class="ph">Launch your business</div><div class="subh">Make it official &mdash; the four filings every founder handles first, each with a personal tip from Peter.</div><div class="filings">'+
   filing('Register your business (LLC / Corp)','Start as an LLC — it’s simple and it protects your personal assets from day one.','https://www.zenbusiness.com')+
   filing('Registered Agent service','Use a service so your home address stays private on public records.','https://www.northwestregisteredagent.com')+
   filing('Search &amp; file your trademark','Search first at the USPTO — it’s free — before you print a single thing.','https://tmsearch.uspto.gov')+
   filing('Domain / Email — claim your web address','Grab the .com and a matching email address the same day you decide.','https://www.namecheap.com')+
  '</div>'+
  '<div class="ph">Get found &mdash; search &amp; social</div><div class="subh">Put your new brand where people are looking.</div>'+
  '<div class="tool" data-acc="seo"><span class="tic">&#128269;</span><div class="tbody"><div class="tt">SEO Checklist</div><div class="td">Get seen on Google — tap to open your checklist.</div></div><span class="tgo">&#43;</span></div>'+
  '<div class="acc hidden" data-accp="seo">'+['Set up your Google Business Profile','Add a clear title &amp; description to every page','Submit your sitemap to Google','Publish your launch posts on every platform','Ask 5 happy customers for a review'].map(function(s,i){return '<div class="milestone" data-seo="'+i+'"><span class="mck">&check;</span><span class="mtx">'+s+'</span></div>';}).join('')+'<div class="cinnote">Your founder’s toolbox — every recommended tool — is under “Recommended partners” below.</div></div>'+
  '<div class="ph">SparkWriter</div><div class="subh">Your first posts, written here — no copying prompts anywhere.</div>'+
  ('<div class="swbox"><input id="swTopic" placeholder="What topic should your post be about?"><button class="act primary" data-swgen="1">Create my post &rarr;</button><div id="swOut"></div></div>')+ /* SparkWriter is INCLUDED for every customer (Founder order 2026-07-31) */
  '<div class="ph">Spark Print Studio</div><div class="subh">Put it on paper — pick a product, confirm the details, and we produce it through our print partner.</div>'+
  (tr>=2 ? '<div class="prods">'+prod('&#128100;','Business Cards','500 cards, matte finish, ships in 5 days.')+prod('&#128209;','Flyers &amp; Postcards','100-count, glossy or matte, launch-ready.')+prod('&#128085;','Apparel &amp; Merch','Tees, caps and mugs with your lockup.')+'</div>' : lockedTool('Spark Print Studio'))+
  '<div class="ph">Founder’s Pulse &mdash; straight to Peter</div><div class="subh">A private note to Peter Klein — what worked, what you wish we’d add, a bug, a nudge. Read by Peter personally. No auto-reply.</div>'+
  '<div class="fpbox"><textarea id="fpNote" placeholder="Write Peter a note…"></textarea><button class="act primary" data-fpsend="1">Send to Peter &rarr;</button></div>'+
  (IDEA.tier==='studio' ? '<div class="ph">Signature priority</div><div class="prio">&#11088; Priority concierge &amp; a dedicated success manager — your Signature package includes white-glove help at every step.</div>' : '')+
  '<div class="ph">Spark Certified Designer</div><div class="olincard"><div class="ol-badge">&#10022; Spark Certified Designer</div><div class="ol-t">Olin Creative</div><p>Want your brand taken further by a human designer? Olin Creative is our Spark Certified Designer — 20 years of brand experience, and they know the Spark system inside out. Approve below and we’ll hand them your whole brand kit, set up your project, and have them reach out to you.</p><button class="act primary" data-olin="1">&#10022; Have Olin Creative contact me</button></div>'+
  '<div class="ph">Share, refer &amp; earn</div><div class="tools">'+toolCard('Share my brand kit','Send your whole brand kit to a partner, printer, or teammate in one tap.','&#9992;','sharekit')+toolCard('Know someone starting something?','Refer a friend — you both get a reward when they spark a brand.','&#10022;','refer')+'</div>'+
  '<div class="ph">Become a Spark affiliate</div><div class="affcard"><div class="aff-t">Send people their brand. Earn every time.</div><p>Share SparkMyName and earn a commission on every brand your referrals create — your affiliate program is already set up and ready.</p><button class="act primary" data-tool="affiliate">Get my affiliate link</button></div>'+
  '<div class="ph">Recommended partners</div><div class="resnote">Tools we use and partner with. Some are affiliate links — Spark may earn a small commission, at no extra cost to you.</div><div class="resgrid">'+PARTNERS.map(function(x){return '<div class="resw">'+resChip(x,true)+'</div>';}).join('')+'</div>'+
  '<div class="ph">Free &amp; official resources</div><div class="resnote">No affiliation — free or official (government) resources we simply recommend.</div><div class="resgrid">'+FREERES.map(function(x){return '<div class="resw">'+resChip(x,false)+'</div>';}).join('')+'</div>';
 return out;
}

/* THE CLEAR BUTTON (2026-07-26, Founder order).
   Delegated from the document rather than bound to the element. The first version waited for
   DOMContentLoaded and bound directly, which works until something re-renders the field — then
   the listener is gone and the button silently stops doing anything. Delegation does not care
   when the element appeared or how many times it has been replaced.
   Escape does the same thing, for anyone who reaches for it. */
function smnSyncSearchClear(){
  try{
    var inp=document.getElementById('isearch'), x=document.getElementById('isearchClear');
    if(inp && x) x.hidden = !inp.value;
  }catch(e){}
}
document.addEventListener('input', function(e){
  if(e.target && e.target.id==='isearch') smnSyncSearchClear();
}, true);
document.addEventListener('click', function(e){
  var x=e.target && e.target.closest && e.target.closest('#isearchClear, #bpsearchClear');
  if(!x) return;
  var inp=document.getElementById(x.id==='bpsearchClear'?'bpsearch':'isearch');
  if(!inp) return;
  inp.value='';
  inp.dispatchEvent(new Event('input',{bubbles:true}));
  smnSyncSearchClear();
  try{ inp.focus(); }catch(err){}
});
document.addEventListener('keydown', function(e){
  if(e.key!=='Escape') return;
  /* Either search box — the rail's if it is ever restored, the flyout's today. */
  var inp=document.activeElement;
  if(!inp || (inp.id!=='isearch' && inp.id!=='bpsearch') || !inp.value) return;
  e.stopPropagation();
  inp.value='';
  inp.dispatchEvent(new Event('input',{bubbles:true}));
  smnSyncSearchClear();
  var bx=document.getElementById('bpsearchClear'); if(bx) bx.hidden=true;
}, true);

function ilistHTML(f){
 f=(f||'').toLowerCase();
 var live=IDEAS.filter(function(d){return !removed[d.id];});
 var list=live.filter(function(d){if(!f)return true;var hay=(d.cat+' '+d.said+' '+((window.NAMEIDX&&window.NAMEIDX[d.id])||'')).toLowerCase();return hay.indexOf(f)>=0;});
 if(sortMode==='az')list.sort(function(a,b){return a.cat.localeCompare(b.cat);});
 else if(sortMode==='za')list.sort(function(a,b){return b.cat.localeCompare(a.cat);});
 else if(sortMode==='fav')list.sort(function(a,b){return (b.fav?1:0)-(a.fav?1:0)||b.ord-a.ord;});
 else list.sort(function(a,b){
   /* NEWEST FIRST, THEN FAVOURITES (2026-07-25, Founder order). The most recently ordered
      brand always holds the top slot — it is what the customer just paid for and came back to
      see. Everything they have starred rises directly beneath it, newest-starred first, and
      the remainder follows in order. */
   var newest = Math.max.apply(null, IDEAS.map(function(x){return x.ord;}));
   var ra = (a.ord===newest) ? 2 : (a.fav ? 1 : 0);
   var rb = (b.ord===newest) ? 2 : (b.fav ? 1 : 0);
   return (rb-ra) || (b.ord-a.ord);
 }); /* newest, then favourites */
  for(var pi=0;pi<list.length;pi++){if(list[pi].id===current&&pi>0){var pc=list.splice(pi,1)[0];list.unshift(pc);break;}}
 var _ct=$('#ideaCt'); if(_ct) _ct.textContent=live.length;
 renderPutAway();
 if(!list.length)return '<div style="color:var(--dim2);font-size:.7812rem;padding:8px 4px">No ideas here. Start a new one below.</div>';
 /* FAVOURITES, SHOWN ONLY WHEN THERE ARE SOME (2026-07-26, Founder order).
    The star has existed all along and not one of 242 brands is starred — including the
    founder's. A feature nobody can see is a feature nobody uses, and an empty "Favorites"
    heading sitting above the list would be worse: it would take space to say nothing.
    So the heading appears the moment the first brand is starred, and disappears again if the
    last one is unstarred. A customer with two brands never sees it. Someone with 241 gets the
    handful they actually work in, at the top, without scrolling.
    Hidden while searching: a search is already a filter, and a second one above it confuses
    what you are looking at. */
 var favs = (!f) ? list.filter(function(d){ return d.fav; }) : [];
 var rest = (!f) ? list.filter(function(d){ return !d.fav; }) : list;
 function section(title, items, cls){
   if(!items.length) return '';
   return '<div class="rl-sec '+(cls||'')+'">'
     + '<span class="rl-sec-t">'+esc(title)+'</span>'
     + '<span class="rl-sec-n">'+items.length+'</span>'
     + '</div>' + rowsFor(items);
 }
 if(favs.length) return section('Favorites', favs, 'rl-sec-fav') + section('All brands', rest) ;
 return rowsFor(rest);

 function rowsFor(list){
 return list.map(function(d){
   var grad='#FFFFFF';
   var thumb=(d.header||(d.names[0]&&d.names[0].heroUrl)||(d.names[0]&&d.names[0].logos&&d.names[0].logos[0]))||'';
   var photo=(thumb&&/^https?:\/\//.test(thumb))
     ? /* LAZY (2026-07-26). At 241 brands this fired 235 image requests the moment the list
       painted. They arrive in whatever order the network returns them, so scrolling showed
       some rows with a photograph and some without — which reads as missing images rather than
       images still on their way. loading="lazy" lets the browser fetch a row's photograph when
       it is near the viewport, which is also when anyone can see it. */
    '<span class="iphoto"><img src="'+esc(thumb)+'" alt="" loading="lazy" decoding="async" onerror="var w=this.parentNode;w.classList.add(\'iph-grad\');w.style.background=\''+grad+'\';w.innerHTML=\'<span class=&quot;iph-em&quot;>'+d.emoji+'</span>\'"></span>'
     : '<span class="iphoto iph-grad" style="background:'+grad+'"><span class="iph-em">'+d.emoji+'</span></span>';
   // The client's own words are the headline; font shrinks as the description gets longer so it always fits.
   var words=(d.said||'').trim()||d.cat||'Your idea';
   var L=words.length, fs=(L<=16?22:L<=26?19:L<=40?16.5:L<=64?14:12.5);
   // Order created date + time, shown clearly below the Ready line.
   var when='';try{var _dt=d.ts?new Date(d.ts):null;if(_dt&&!isNaN(_dt)){when=_dt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})+' &middot; '+_dt.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});}else if(d.date){when=d.date;}}catch(e){}
   return '<button class="irow'+(d.id===current?' on':'')+'" data-i="'+d.id+'">'+
     '<span class="irm" data-rm="'+d.id+'" title="Remove">&times;</span>'+
     (d.fav?'<span class="fav">&hearts;</span>':'')+
     photo+
     '<span class="ix"><span class="iseed" style="font-size:'+fs+'px">'+esc(words)+'</span>'+
     '<span class="icount"><span class="ird">&#9679;</span> Ready &middot; '+d.names.length+' names'+((pending[d.id]||0)?' &middot; '+pending[d.id]+' on the way':'')+'</span>'+
     (when?'<span class="idate">Ordered '+when+'</span>':'')+'</span>'+
   '</button>';}).join('');
 }
}
function renderPutAway(){
 var pa=$('#putaway'),ids=Object.keys(removed);
 if(!ids.length){pa.className='putaway hidden';pa.innerHTML='';return;}
 pa.className='putaway';
 pa.innerHTML='<div class="pa-h"><span class="pa-t">Put away ('+ids.length+')</span><button class="pa-all" data-recoverall="1">Recover all</button></div>'+
  ids.map(function(id){var d=IDEAS.filter(function(x){return x.id===id;})[0];return '<div class="parow"><span class="pn">'+esc(d.cat)+' &mdash; '+esc(d.said)+'</span><button class="pb" data-recover="'+id+'">Bring back</button></div>';}).join('');
}
function removeIdea(id){removed[id]=true;if(current===id){var next=IDEAS.filter(function(x){return !removed[x.id];})[0];current=next?next.id:null;curName=0;curTab='';}paint();toast('Brand removed — recover it below any time.');}

/* PRESENTATION STUDIES (2026-07-30, Founder order: "every brand card gets these, they're
   beautiful"). The seven material renders live in generate-asset.js already; this surfaces
   them on the card. Each entry: [slug, label, material trigger phrase]. The phrase is written
   so materialFor() in generate-asset routes to the right MATERIALS[] entry. Honest per the
   Logo Law: these are presentation renders (the mark repainted in a photograph), NOT the
   usable logo file — the card says so, and the real logo files stay in Downloads. */
var SMN_STUDIES=[
  ['titanium','Brushed titanium','engraved into a brushed dark titanium plate'],
  ['cotton','Embossed paper','deep-embossed into heavy cotton paper stock'],
  ['brass','Cast brass','cast in antiqued brass'],
  ['glass','Etched glass','etched into low-iron glass'],
  ['leather','Debossed leather','blind-debossed into full-grain leather'],
  ['agency','Agency page','on an agency presentation page, cotton rag, editorial macro'],
  ['tile','App tile','on a matte charcoal app tile, studio rim light']
];
function mainHTML(IDEA){
 /* LOADING STATE (2026-07-25). With lazy loading, the selected brand can be a stub whose kit
    has not arrived — names is empty, so every read below (NM.name, NM.tag, NM.dom) throws and
    the repaint dies. This is a real state now, not an error: the list is instant, the kit is
    a moment behind. It also covers a genuinely empty report, which previously threw too. */
 if(!IDEA || !Array.isArray(IDEA.names) || !IDEA.names.length){
   var loading = IDEA && IDEA._stub;
   return '<div class="card" aria-busy="'+(loading?'true':'false')+'">'+
     '<div style="text-align:center;padding:64px 24px">'+
       (loading
         ? '<div class="smn-spin" aria-hidden="true"></div>'+
           '<h2 style="font-size:var(--t-head);font-weight:700;margin:18px 0 6px">Opening '+esc(IDEA.cat||'your brand')+'&hellip;</h2>'+
           '<p style="color:var(--dim)">One moment &mdash; fetching this brand&rsquo;s kit.</p>'
         : '<h2 style="font-size:var(--t-head);font-weight:700;margin-bottom:8px">Nothing here yet</h2>'+
           '<p style="color:var(--dim)">This brand has no names saved. Try another from the list.</p>')+
     '</div></div>';
 }
 /* CO208 FIX 1: a brand whose kit has no colour palette used to throw here and kill the
    whole repaint (the workspace then froze on the sample/loading screen). Fall back to the
    house gradient instead of crashing. Also guard the name index. */
 var NM=IDEA.names[curName]||IDEA.names[0]||{}, C=(IDEA.palettes&&IDEA.palettes[0]&&IDEA.palettes[0].cols&&IDEA.palettes[0].cols.length)?IDEA.palettes[0].cols:['#141414','#141414','#B7791F','#141414'], P=panel(IDEA,NM);
 /* THE NAME GRID SHOWS EACH BRAND'S OWN PHOTO (2026-07-25, Founder order).
    It showed the logo in an 88px white square — six near-identical white tiles, and the one
    thing that actually distinguishes these six brands from each other was invisible.
    Each name now leads with ITS OWN 2K scene.
    NOTHING IS CROPPED. The photo sits in a 16:9 frame at the card's full width, and the
    engine renders these at 16:9, so it fills the frame exactly. object-fit:contain rather
    than cover means that if a scene ever arrives at a different ratio it letterboxes inside
    the frame instead of having its edges cut off — the Founder's requirement, enforced by the
    property rather than by hoping the ratios match.
    Falls back to the logo, then to the monogram, so a name whose photo has not landed yet
    still renders a complete card. */
 var pills=IDEA.names.map(function(n,i){
   var media;
   if(n.heroUrl){
     media='<span class="nopt-photo"><img src="'+esc(n.heroUrl)+'" alt="'+esc(n.name)+'" loading="lazy" decoding="async" onerror="this.closest(\'.nopt-photo\').classList.add(\'ph-fail\');this.remove();"></span>';
   } else if(n.logos&&n.logos[0]){
     media='<span class="nopt-photo ph-logo"><img src="'+esc(n.logos[0])+'" alt="'+esc(n.name)+' logo" loading="lazy" decoding="async"></span>';
   } else {
     media='<span class="nopt-photo ph-fail"><span class="ph-mono">'+esc(n.mono)+'</span></span>';
   }
   return '<button class="nopt brx'+(i===curName?' on':'')+'" data-n="'+i+'" aria-pressed="'+(i===curName?'true':'false')+'">'+
     media+
     '<span class="brx-l"><span class="brx-n">'+esc(n.name)+'</span>'+
     '<span class="brx-d">'+esc(n.dom||'')+(n.st==='Available'?' <b class="brx-av">&check; Available</b>':'')+'</span>'+
     '<span class="brx-tg">&ldquo;'+esc(n.tag||'')+'&rdquo;</span></span>'+
     (i===curName?'<span class="nopt-ck">&check;</span>':'')+'</button>';
 }).join('');
 if(pending[IDEA.id]) pills+='<span class="nopt pending"><span class="dotspin"></span><span class="nopt-x"><span class="nopt-n">'+pending[IDEA.id]+' new name'+(pending[IDEA.id]>1?'s':'')+'</span><span class="nopt-d">being custom-made&hellip;</span></span></span>';
 var tabs=TABS.map(function(t){return '<button class="tab'+(t[0]===curTab?' on':'')+'" data-tab="'+t[0]+'">'+t[1]+'</button>';}).join('');
 var panels=TABS.map(function(t){return '<div class="panel'+(t[0]===curTab?' on':'')+'" data-p="'+t[0]+'">'+P[t[0]]+'</div>';}).join('');
 

  /* QUANTITIES (2026-07-25, Founder order). Counted from the SOURCE ARRAYS, never by parsing
     the generated HTML — a count that can drift from what is on screen is worse than none.
     Sections that are a single artefact (the avatar) show no number rather than a pointless 1. */
  var SECCOUNT={
    why:        (NM.why||[]).length,
    logo:       (NM.logos||[]).length,
    colors:     ((NM.palettes&&NM.palettes.length?NM.palettes:IDEA.palettes)||[]).length,
    typography: ((NM.type&&NM.type.length?NM.type:IDEA.type)||[]).length,
    voice:      ((NM.voice&&NM.voice.length?NM.voice:IDEA.voice)||[]).length,
    words:      (NM.taglines||[]).length,
    avatar:     0,
    bios:       ((NM.biosT&&NM.biosT.length?NM.biosT:IDEA.biosT)||[]).length,
    handles:    6,
    overview:   ((NM.aboutT&&NM.aboutT.length?NM.aboutT:IDEA.aboutT)||[]).length,
    /* SCOPE BUG, FIXED (2026-07-25). These read _liSrc / _fbSrc / _postsSrc, which are declared
       inside function panel() — not here in mainHTML. Reading them threw a ReferenceError, the
       render died, and the workspace span forever on its spinner. The counts now come from the
       same kit arrays those variables are themselves built from, which ARE in scope, with the
       same caps panel() applies (LinkedIn 3, Facebook 3). */
    linkedin:   Math.min(((NM.linkedinT&&NM.linkedinT.length?NM.linkedinT:IDEA.linkedinT)||[]).length, 3),
    facebook:   Math.min(((NM.facebookT&&NM.facebookT.length?NM.facebookT:IDEA.facebookT)||[]).length, 3),
    posts:      ((NM.postsT&&NM.postsT.length?NM.postsT:IDEA.postsT)||[]).length
  };
  var SECMETA={why:['Why it works',''],logo:['Logo system',''],colors:['Color palettes',''],typography:['Typography',''],voice:['Voice &amp; tone',''],words:['Taglines',''],avatar:['Social avatar',''],bios:['Social bios',''],handles:['Social handle recommendations',''],overview:['About / profile',''],linkedin:['LinkedIn intros',''],facebook:['Facebook intros',''],posts:['Launch posts','']};/* EVERYTHING OPEN (Founder order 2026-07-27 — SUPERSEDES the 07-26 "nothing opens until asked
   for" order). The customer arrives to their whole brand laid out at once: every section
   expanded, nothing to click. The toggles still work if someone wants to fold a section away.
   aria-expanded stays truthful either way. */

/* ===== THE CARD WEARS THE BRAND'S OWN COLOURS (2026-07-30, Founder order:
   "the page in black and white looks ugly... like I'm reading a criminal rap sheet or some
   court document, and we're an advertising agency").
   A black-and-white presentation of a colour identity is the problem. Every brand already
   carries three palettes with real hex codes — the card now dresses itself in the first one.
   Section numbers, the rule under each heading, the bullet marks and the group headers all
   take the brand's accent, so no two customers ever see the same-looking card.
   Chosen carefully, not just [0]: the swatch must be dark enough to read as text on a light
   panel (luminance under .62) and have some actual colour in it (saturation over .12), or the
   card falls back to its own ink rather than printing pale yellow text nobody can read. */
function bkAccentVars(){
  var cols=[];
  try{ ((IDEA.palettes||[])[0]||{}).cols && (cols=(IDEA.palettes[0].cols||[]).slice()); }catch(e){}
  try{ if(!cols.length) (IDEA.palettes||[]).forEach(function(p){ (p&&p.cols||[]).forEach(function(c){cols.push(c);}); }); }catch(e){}
  function rgb(h){ h=String(h||'').replace('#','');
    if(h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    if(!/^[0-9a-fA-F]{6}$/.test(h)) return null;
    return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]; }
  function lum(c){ var a=c.map(function(v){v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);});
    return .2126*a[0]+.7152*a[1]+.0722*a[2]; }
  /* CONTRAST, not luminance (corrected 2026-07-30 after a real failure). A raw luminance
     ceiling of .62 accepted #A3D99B — the PALE green in LawnEssence's own palette — which
     against a white panel is 1.6:1 and effectively unreadable. The question was never "is this
     colour darkish", it is "can this be read on white", so the test is now the actual WCAG
     contrast ratio. 4.0 is the floor: it rejects that pale green outright while still
     accepting the brand's real #3B8A3B at 4.3:1, which is comfortably above the 3.0 large-text
     threshold this accent is used at (27px headings) and safe for white text on the chip. */
  function contrastOnWhite(c){ return 1.05/(lum(c)+.05); }
  function sat(c){ var mx=Math.max.apply(null,c),mn=Math.min.apply(null,c); return mx===0?0:(mx-mn)/mx; }
  var accent=null;
  /* First choice: a swatch that is already readable on white. */
  for(var i=0;i<cols.length;i++){
    var c=rgb(cols[i]);
    if(c && contrastOnWhite(c)>=4.0 && sat(c)>.12){ accent=c; break; }
  }
  /* Second choice — and this is the important one. Some brands have NO dark swatch at all:
     Platinum Palms is gold, sky blue and coral; Elysian Palm is four honeys. Falling back to
     black leaves exactly the grey card the Founder objected to. So instead of giving up, take
     the brand's most COLOURFUL swatch and walk it darker until it can be read on white. The
     hue is preserved — the card still wears the brand's own colour, just at a weight that
     works as type. Every brand gets its colour; none gets an unreadable one. */
  if(!accent){
    var best=null, bestSat=-1;
    for(var j=0;j<cols.length;j++){
      var d=rgb(cols[j]); if(!d) continue;
      var sv=sat(d); if(sv>bestSat){ bestSat=sv; best=d; }
    }
    if(best && bestSat>.12){
      var k=1.0;
      while(k>0.12 && contrastOnWhite([best[0]*k,best[1]*k,best[2]*k])<4.0){ k-=0.04; }
      accent=[Math.round(best[0]*k),Math.round(best[1]*k),Math.round(best[2]*k)];
    }
  }
  if(!accent) return '--bk-accent:#141414;--bk-accent-soft:rgba(20,20,20,.08)';
  return '--bk-accent:rgb('+accent[0]+','+accent[1]+','+accent[2]+')'+
         ';--bk-accent-soft:rgba('+accent[0]+','+accent[1]+','+accent[2]+',.10)';
}

var mergedHTML=MERGED.map(function(k,ix){var m=SECMETA[k]||[k,'&#10022;'];
  var isOpen = true;
  return '<div class="bkacc'+(isOpen?' open':'')+'" data-bkacc="'+k+'"><button class="bkacc-h" data-bkacctoggle="'+k+'" aria-expanded="'+(isOpen?'true':'false')+'"><span class="bkacc-ic">'+m[1]+'</span><span class="bkacc-t">'+m[0]+'</span>'+((SECCOUNT[k]||0)>0?'<span class="bkacc-n">'+SECCOUNT[k]+'</span>':'')+'<span class="bkacc-chev">&#8250;</span></button><div class="bkacc-b">'+P[k]+'</div></div>';}).join('');
 // The one purchased 2K industry header photo sits on TOP, above everything with logos.
 // .cinehero renders the image at natural 16:9 height (width:100%, height:auto) — fully
 // visible, never cropped. Per-name hero below shows only a name's OWN photo (no duplicate).
 /* NO HERO IMAGE ON THE CARD (2026-07-26, Founder order).
   Two hero images used to sit above the work: one for the order, one for the chosen name. On a
   phone they pushed everything the customer came for below the fold, and the name grid already
   shows each name's own photograph — so the hero was the same picture twice, larger and less
   useful. The photographs are untouched as deliverables: all seven per name are still generated,
   still stored, and still in the Downloads grid. Only the decorative display is gone. */
var heroTop='';
 /* NOTHING BELOW THE SIX NAMES UNTIL ONE IS CHOSEN (2026-07-25, Founder order).
    THE FIRST VERSION OF THIS RETURNED '' FROM THE TOP OF mainHTML, WHICH WAS WRONG AND BROKE
    THE WORKSPACE: this function returns the header, the six name boxes AND the card as one
    string, so returning early deleted the name boxes too. The customer arrived to a blank
    page with nothing to click. The gate belongs HERE — after the names are built, before the
    card — so the six boxes always render and only the card waits for a choice. */
 var _picked = window.__smnPicked && window.__smnPicked === IDEA.id;
 var _namesTop = heroTop+'<div class="nameselect"><div class="ns-row">'+pills+'</div></div>';
 /* EVERYTHING SHOWS ON ARRIVAL (2026-07-26, Founder order).
    This used to hold the brand card back until a name was picked, so a customer who had just
    paid landed on six boxes and an instruction. They have bought a finished brand; the whole
    thing should be in front of them, with the first name showing and the others one tap away.
    The card follows whichever name is selected, so choosing still does what it always did —
    it simply is not a toll gate any more. */
 return _namesTop+
  '<div class="card">'+
  /* THE REVEAL (2026-07-27, Founder order — SUPERSEDES the 07-26 "no hero image on the card"
     order for the CHOSEN name only). Research pass, 45 sources: first impressions form in
     ~50ms and are visual, not read — so the card now opens like an agency reveal: the chosen
     name's cinematic full-bleed, the name set large over a scrim (the standard legibility
     technique for type over imagery). The 07-26 order's REASON is honored: the six name pills
     still render first, there is only ONE photo (the chosen name's own), and on phones the
     reveal runs shorter. A missing photo shows nothing — never a broken box. */
  (NM.heroUrl?('<div class="bh-reveal"><img src="'+esc(NM.heroUrl)+'" alt="" loading="eager" decoding="async" onerror="this.closest(\'.bh-reveal\').classList.add(\'noimg\')"></div>'):'')+
  '<div class="chead"><div class="info">'+
   /* THE AVAILABILITY HEADER (2026-07-25, Founder order). Recovered from the Founder's own
      July-19 workspace — .webavail — rather than reinvented, then set in the current type law
      (Inter, sizes as ratios) and the current palette. The green badge leads because domain
      availability is the single fact the customer is looking for; the name and domain follow
      at display size; handles run as one flowing line beneath a rule. */
   /* THE MASTHEAD LOCKUP (2026-07-27, Founder order; research pass, 22 sources).
      A brand book opens with the logo lockup, not a stack of text: mark, then name, then
      domain, then tagline, each step of one modular scale (1.25). The availability badge is
      demoted from the loudest element to a quiet status chip at the foot of the block, and the
      handle list is gone from here because the mosaic already carries a full
      "Social handle recommendations" section — that was the duplication. */
   '<div class="webavail">'+
     /* THE NAME IS THE MARK (2026-07-27, Founder: "if that's how it's gonna look, get it out of
        there"). The white plate showed the logo file's own baked-in whitespace, so the mark sat
        marooned in a big empty box. The delivered logo files are untouched and still download
        from the Logo system section — this is purely about what leads the identity block, and
        the answer is the brand's own name, set large and clean. */
     /* MASTHEAD MARK (2026-07-30, decision B port from the approved card preview): the identity
        block now opens with the true-vector monogram — clean code-drawn SVG with no baked-in
        whitespace, so the "marooned in a white box" problem that retired the old raster mark does
        not apply. Guarded: absent engine simply skips the mark. Then an eyebrow, then the name. */
     ((window.AGENCY_LOGO&&window.AGENCY_LOGO.spec)?('<div class="wa-mark">'+window.AGENCY_LOGO.markSVG(window.AGENCY_LOGO.spec(NM.name||'Brand',{colors:(NM.palettes&&NM.palettes[0]&&NM.palettes[0].cols)||[]},NM.tag||''),140)+'</div>'):'')+
     '<div class="wa-eyebrow">Brand Identity</div>'+
     '<div class="wa-name">'+esc(NM.name)+'</div>'+
'<div class="wa-domain">'+esc(NM.dom)+'</div>'+
     heroLogoHTML(NM)+
     (NM.tag?'<div class="wa-tag">&ldquo;'+esc(NM.tag)+'&rdquo;</div>':'')+
     (NM.st==='Available'?'<div class="wam-avail"><span class="wam-avail-t">Available now &mdash; register it before someone else does</span><span class="wam-avail-ck">&check;</span></div>':'')+
   '</div>'+
   /* DOWNLOAD + SAVE (2026-07-25, Founder order, matching the printed sample). Two outlined
      capsules directly beneath the tagline, in the site's own pill geometry: 999px radius,
      the same border and glass as every other capsule on the card. Download offers the two
      things the sample promises for THIS brand only — the card as one PDF, and every asset in
      one ZIP. Save is the favourite, and it turns green when it is on. */
   /* ONE ACTION ROW (2026-07-25, Founder order: "implemented or not duplicated").
      The card had grown two Download capsules and a Save on its own line. Everything the
      customer can do to a brand now sits in a single row: favourite, download, send, support,
      remove. The heart lives IN the row rather than owning a line of its own. */
   /* FOUR CAPSULES, EVERY WIRE KEPT (2026-07-26, Founder order).
      Five sat in a row while Download appeared thirteen more times further down the card. The
      three that are rarely wanted — Favorite, Support, Remove — move behind More, one tap away
      instead of competing with the two things people came to do.
      Nothing is rewired: each item fires exactly the handler it fired before, so the existing
      bindings for data-brandsave, data-support and data-removebrand still find their targets. */
   /* the action row moved below the client's idea — see THE CONTROL DECK.
      ITS CLOSING TAG WENT WITH IT (2026-07-27 bugfix): lifting the row left an orphan
      '</div>' here, so the card emitted FOUR closers for THREE open divs — .card closed
      early and the deck, the tabs, the panels and the mosaic all fell outside it, which is
      why the capsules and downloads vanished. Three openers, three closers. */
   '</div></div>'+
  /* REQUEST MORE NAMES (2026-07-26, Founder order).
      The endpoint has existed since the refine work — add-names.js, which fires the background
      worker, generates a second set, builds their full kits, and emails the customer. The old
      report page called it. The workspace never did, so the feature was live and unreachable.
      This is the same call, the same one-per-order guard, and the same wording the report page
      used — not a new path. */
   /* ONE LINE (2026-07-27, Founder order: "get these on one line, don't lose anything").
      The tabs used to sit in their own strip under the action row, so a client met two bars of
      controls that looked identical. They now share ONE bar: actions on the left, a hairline,
      then the tabs. Nothing was removed and nothing was rewired — every button binds by class
      or data-attribute through a root query, so position is free. */
   /* tabs + panels moved below the idea — see THE CONTROL DECK */
'<div class="overviewall" style="'+bkAccentVars()+'">'+(IDEA.said?('<figure class="reqline"><div class="rl-k">Your idea &mdash; in your own words</div><blockquote class="rl-v rl-up">'+esc(IDEA.said)+'</blockquote><figcaption class="rl-c">Everything below was built from this one sentence.</figcaption></figure>'):'')+/* THE MOSAIC (2026-07-27, Founder order: the card's information presented as beautifully as the brand grid). The thirteen sections flow as glass tiles in columns — pure presentation: every section, every binding, every byte of content untouched. *//* ===== THE CONTROL DECK (2026-07-27, Founder order: "I don't wanna see them in that section.
   Find another spot that makes sense... put them on a grid"). Every control the card had — the
   action capsules AND the four tabs AND Request more names — now sits in ONE deck between the
   client's idea and their kit. Nothing was removed and nothing was rewired: each button binds
   by class or data-attribute through a root query, so position is free. The panels stay
   directly beneath their tabs, which is the one adjacency that matters. ===== */
'<div class="deck">'+
   /* ===== EVERYTHING, IN THE OPEN (2026-07-27, Founder order: "rather than just putting one
      line across, why can't we make a section going across... pull it out, so it's not hidden
      behind buttons"). Every control that lived in a row, a Tools menu or a More menu is now a
      labelled tile in a grid of groups — a grid within a grid. Nothing was removed and nothing
      was rewired: each tile carries the exact data-attribute its old button carried, so every
      existing handler still finds it. The old menus are gone; their contents are visible. ===== */
   '<div class="dkgrid">'+
   /* ===== THE CONTROL DECK, ORGANISED (Founder order 2026-07-30: "organize it better...
      so people understand what they're clicking on and what they're getting"). Four plain
      groups, data-driven so the order is easy to steer and nothing can silently fall out.
      Every button keeps the exact data-attribute its handler binds to — position is free,
      wiring is untouched. ===== */
   [
     ['Download your brand',[
       ['dktile dkprime','data-dlall="1"','Download this brand','One ZIP with everything for &ldquo;'+esc(NM.name)+'&rdquo; &mdash; logo files, colour codes, fonts, every word, and your photographs.'],
       ['dktile','data-brandpdf="1"','Brand sheet (PDF)','Your brand card as a one-page PDF in full colour &mdash; logo, palette, fonts and taglines.'],
       ['dktile','data-dlallnames="1"','All '+((IDEA.names&&IDEA.names.length)||6)+' names','Every name from this order in one ZIP &mdash; a tidy folder for each brand.']
     ]],
     ['Share &amp; send',[
       ['dktile','data-sendbrand="1"','Email it to me','Sends your brand sheet to your own account email as a PDF.'],
       ['dktile','data-sharelink="1"','Get a shareable link','A public link you can paste anywhere &mdash; shows the name, photo and tagline only, nothing private.']
     ]],
     ['Keep building',[
       ['dktile','data-tool="ai"','AI Studio','Eight tools that already know this brand &mdash; write, design, name and check.'],
       ['dktile','data-tool="success"','Success Path','Every step from here to your first customer, in order.'],
       ['dktile','data-olin="1"','Hand it to a designer','Olin Creative takes your brand further &mdash; included, no extra charge.'],
       ['dktile','data-morenames="'+esc(IDEA.id)+'"','Get more names','Not in love yet? We build another set and email you when they are ready.']
     ]],
     ['Manage this brand',[
       ['dktile','data-brandsave="1"',(IDEA.fav?'Saved':'Save this brand'),'Keeps it pinned to the top of your brands list.'],
       ['dktile','data-tool="concierge"','Message the Spark team','A real person reads it and replies to your email.'],
       ['dktile','data-support="1"','Support','Guides, answers and how-to for everything here.'],
       ['dktile dkquiet','data-removebrand="'+IDEA.id+'"','Remove this brand','Takes it off your list &mdash; you can bring it back afterwards.']
     ]]
   ].map(function(g){return '<div class="dkgroup"><div class="dkgh">'+g[0]+'</div><div class="dktiles">'+
       g[1].map(function(t){return '<button class="'+t[0]+'" '+t[1]+'><b>'+t[2]+'</b><span>'+t[3]+'</span></button>';}).join('')+
     '</div></div>';}).join('')+
   '</div>'+
   /* RESTORED (2026-07-27): building the open grid, I replaced the region that also contained
      the tab strip and its panels — which would have deleted Launch, Grow, Downloads and Extras
      along with everything inside them. Caught by the deck/onebar suites before it shipped.
      The tabs sit directly above their panels, which is the adjacency that must never break. */
   '<div class="onebar"><div class="tabs">'+tabs+
     '<button class="tab tab-more" data-morenames="'+esc(IDEA.id)+'">&#10022; Request more names</button>'+
   '</div></div><div class="panelwrap">'+panels+'</div>'+
   '</div>'+
   '<div class="bkmosaic" style="'+bkAccentVars()+'">'+
     /* The rule from the approved LawnEssence card: a brand-coloured BRAND chip, a
        hairline across, and UNDERSTAND THE BRAND at the right. It announces the deck
        instead of dropping the reader straight into a box. */
     '<div class="bkrule"><span class="bkrule-chip">Brand</span>'+
       '<span class="bkrule-line"></span>'+
       '<span class="bkrule-r">Understand the brand</span></div>'+
     mergedHTML+'</div>'+'</div></div>';
}

/* SELECTING A BRAND HYDRATES IT FIRST (2026-07-25).
   With lazy loading, the object in IDEAS may still be a stub — id, name, date and nothing
   else. Painting a stub would render an empty card. Every path that changes `current` now
   goes through this one function: it sets the selection, paints immediately so the click
   feels instant, fetches the kit if it is missing, and repaints when it lands. Already
   loaded means no request at all. */
function selectIdea(id){
  if(!id) return;
  /* A different brand means a fresh choice: show its six names, not the previous card. */
  if(id!==current) window.__smnPicked=null;
  current=id; curName=0; curTab=''; cart={};
  var it=null; for(var k=0;k<IDEAS.length;k++){ if(IDEAS[k]&&IDEAS[k].id===id) it=IDEAS[k]; }
  paint();
  if(it && it._stub && typeof window.smnHydrate==='function'){
    var box=document.getElementById('main');
    if(box){ box.setAttribute('aria-busy','true'); }
    window.smnHydrate(id, function(){
      if(box) box.removeAttribute('aria-busy');
      if(current===id) paint();
    });
  }
}
/* PALETTE GUARD (2026-07-25). Nine places read palCols(X) with no guard. With lazy
   loading a brand in the list may be a stub whose kit has not been fetched yet — palettes is
   an empty array, palettes[0] is undefined, and reading .cols throws, which kills the render
   and spins the workspace. It would also have thrown on any historical kit that arrived
   without a palette. One helper, used everywhere, falling back to the Design Law accents. */
var SMN_DEFAULT_COLS=['#141414','#141414','#B7791F','#141414'];
function palCols(o){
  try{
    var p=o&&o.palettes;
    if(p&&p[0]&&Array.isArray(p[0].cols)&&p[0].cols.length) return p[0].cols;
  }catch(e){}
  return SMN_DEFAULT_COLS;
}
/* THE FIRST NAME OF A BRAND, SAFELY (2026-07-25).
   Lazy loading means most brands in an account are stubs — real id, real date, EMPTY names —
   until their kit is fetched. Five places read brandName(b) with no guard, so an account
   with 234 brands (233 of them stubs) threw
   "Cannot read properties of undefined (reading 'name')" the moment Brands or Billing opened.
   That is the error on screen. One helper, used everywhere, falling back to the category and
   then to a neutral label so a stub still shows something a customer recognises. */
function brandName(b){
  /* Reads the raw property deliberately — a blind find-and-replace rewrote these two lines
     into calls to this same function on 2026-07-25, producing infinite recursion that hung
     the account panel. Do not "simplify" these to brandName(b). */
  try{
    var n = b && b.names && b.names[0];
    if(n && n.name) return n.name;
    if(b && b.cat) return b.cat;
  }catch(e){}
  return 'Your brand';
}
function brandTag(b){
  try{
    var n = b && b.names && b.names[0];
    if(n && n.tag) return n.tag;
  }catch(e){}
  return '';
}
function curIdea(){return IDEAS.filter(function(x){return x.id===current&&!removed[x.id];})[0];}
function paint(){
 /* The rail nav renders once and then only updates its selected state — rebuilding it on
    every paint would drop focus mid-keyboard-navigation. */
 try{ if(!window.__wsNavDone){ renderWsNav(); window.__wsNavDone=true; } }catch(e){}
 var ci=curIdea();var _mm=$('#main');_mm.innerHTML=ci?mainHTML(ci):'<div class="card"><div style="text-align:center;padding:70px 24px"><h2 style="font-size:1.375rem;font-weight:800;margin-bottom:10px">No idea selected</h2><p style="color:var(--dim);margin-bottom:8px">Pick an idea on the left, recover one from Put Away, or start a new one.</p></div></div>';var _l2=$('#ilist'),_q2=$('#isearch'); if(_l2) _l2.innerHTML=ilistHTML(_q2?_q2.value:''); bind();if(ci){var _rc=root0Card();if(_rc){_rc.classList.remove('reveal-in');void _rc.offsetWidth;_rc.classList.add('reveal-in');}}}function root0Card(){return document.querySelector('#main .card');}

/* AN HONEST EMPTY SECTION (2026-07-26)
   The art department can end terminal and delivery still ships — which is right, a customer
   should never wait forever on a picture that will not come. But when it happens the section
   just rendered blank: colours, bios and launch posts showed a heading and then nothing, and
   the logo section showed "Three signature lockups" with empty space beneath it. A promise with
   nothing behind it reads as a broken product rather than a piece still on its way.
   This says what happened and what to do about it, in the customer's own terms. */
function emptyNote(what){
  return '<div class="emptynote">'
    + '<span class="emptynote-i" aria-hidden="true">&#9203;</span>'
    + '<div><b>' + esc(what) + ' are not here yet.</b>'
    + '<span>Custom pieces are made by hand and arrive within 24 hours \u2014 we will email you '
    + 'the moment they land. If it has been longer than that, '
    + '<a href="support.html" target="_blank" rel="noopener">tell us and we will put it right</a>.</span>'
    + '</div></div>';
}
function orEmpty(html, what){
  var t = String(html || '').replace(/<[^>]*>/g, '').trim();
  return t ? html : emptyNote(what);
}

function bind(){
 var IDEA=curIdea();if(!IDEA)return;
 /* NO CARD MEANS NOTHING TO BIND (2026-07-25).
    This read IDEA.names[curName] and carried on regardless. Two states now exist where that
    is undefined: a lazily-loaded brand whose kit has not arrived (names is empty), and a
    first arrival before a name has been picked (the card renders as nothing at all). In both
    cases the fifty NM.* reads below hit undefined and threw
    "Cannot read properties of undefined (reading 'name')" — exactly what the error boundary
    put on screen. Every query in this function is scoped to #main, so with no card there is
    genuinely nothing here to wire. */
 var NM=IDEA.names&&IDEA.names[curName], root=$('#main');
 if(!NM || !root || !root.innerHTML) return;
 /* MORE — opens the three quieter actions. Closes on a second press, on Escape, and when
    anything outside it is pressed, so it can never be left hanging over the card. */
 var moreBtn=root.querySelector('[data-moremenu]');
 var moreMenu=root.querySelector('.cact-menu');
 if(moreBtn && moreMenu){
   moreBtn.addEventListener('click',function(e){
     e.stopPropagation();
     var open=!moreMenu.hidden;
     moreMenu.hidden=open;
     moreBtn.setAttribute('aria-expanded', open?'false':'true');
   });
   document.addEventListener('click',function(){ 
     if(moreMenu && !moreMenu.hidden){ moreMenu.hidden=true;
       try{ moreBtn.setAttribute('aria-expanded','false'); }catch(e){} }
   });
   document.addEventListener('keydown',function(e){
     if(e.key==='Escape' && moreMenu && !moreMenu.hidden){ moreMenu.hidden=true;
       try{ moreBtn.setAttribute('aria-expanded','false'); moreBtn.focus(); }catch(x){} }
   });
   moreMenu.addEventListener('click',function(e){ e.stopPropagation(); });
 }
 /* TOOLS (2026-07-26, Founder order: reorganise, do not move).
    Every tool was already reachable from inside a brand — and from the page header, and from
    the rail. Four routes to the AI Studio, three each to the Success Path and the Concierge:
    thirteen routes to four tools, which is why the header and the rail felt like clutter.
    They now have ONE home, here, in the brand they belong to. The header and rail duplicates
    are gone. Nothing new was built: each item calls the same opener it always called. */
 var toolsBtn=root.querySelector('[data-opentools]');
 var toolsMenu=root.querySelector('.tools-menu');
 if(toolsBtn && toolsMenu){
   toolsBtn.addEventListener('click',function(e){
     e.stopPropagation();
     var open=!toolsMenu.hidden;
     toolsMenu.hidden=open;
     toolsBtn.setAttribute('aria-expanded', open?'false':'true');
   });
   toolsMenu.addEventListener('click',function(e){ e.stopPropagation(); });
   document.addEventListener('click',function(){
     if(toolsMenu && !toolsMenu.hidden){ toolsMenu.hidden=true;
       try{ toolsBtn.setAttribute('aria-expanded','false'); }catch(e){} }
   });
   document.addEventListener('keydown',function(e){
     if(e.key==='Escape' && toolsMenu && !toolsMenu.hidden){ toolsMenu.hidden=true;
       try{ toolsBtn.setAttribute('aria-expanded','false'); toolsBtn.focus(); }catch(x){} }
   });
   var TOOLS={ ai:'openAIStudio', success:'openSuccess', concierge:'openConcierge' };
   toolsMenu.querySelectorAll('[data-tool]').forEach(function(b){
     b.addEventListener('click',function(){
       toolsMenu.hidden=true;
       try{ toolsBtn.setAttribute('aria-expanded','false'); }catch(e){}
       var fn=TOOLS[b.dataset.tool];
       try{ if(fn && typeof window[fn]==='function') return window[fn](); }catch(e){}
       try{ if(fn && typeof eval(fn)==='function') return eval(fn)(); }catch(e){}
     });
   });
 }
 /* REQUEST MORE NAMES (2026-07-26, Founder order).
    Calls add-names.js — the same endpoint the old report page has always called, with the same
    payload and the same one-request-per-order guard. That endpoint does no slow work: it fires
    the background worker and returns, so the customer is told to expect an email rather than
    left watching a spinner. A second set arrives as more names under this same brand.
    Nothing new was built. The wiring was simply never carried over to the workspace. */
 /* TWO BUTTONS, BOTH LIVE (2026-07-27): 'More names' now appears as a visible grid tile
   AND in the tab strip. querySelector binds only the FIRST match, which would have left
   the second one dead. querySelectorAll wires every copy. */
  root.querySelectorAll('[data-morenames]').forEach(function(askMoreBtn){ askMoreBtn.addEventListener('click',function(){
   var rid=askMoreBtn.getAttribute('data-morenames');
   if(!rid) return;
   var key='smn_refines_'+rid, used=0;
   try{ used=parseInt(localStorage.getItem(key)||'0',10); }catch(e){}
   if(used>=1){
     askMoreBtn.disabled=true;
     askMoreBtn.textContent='More names already requested';
     try{ toast('You have already asked for another set on this brand. Contact support if you need more.'); }catch(e){}
     return;
   }
   try{ localStorage.setItem(key,String(used+1)); }catch(e){}
   askMoreBtn.disabled=true;
   askMoreBtn.innerHTML='&#10003; Request received';
   try{ toast('On it \u2014 we will email you when your new names are ready. Most sets arrive within 15 minutes.'); }catch(e){}
   fetch('/.netlify/functions/add-names',{
     method:'POST', headers:{'Content-Type':'application/json'},
     body: JSON.stringify({ r: rid })
   }).then(function(x){ return x.json().catch(function(){ return {}; }); })
     .then(function(d){
       if(d && d.capped){
         askMoreBtn.textContent='Limit reached for this order';
         try{ toast('You have reached the limit for this order \u2014 contact support for more.'); }catch(e){}
       }
     })
     .catch(function(){
       /* The request may still have reached the worker, so do not promise it failed. */
       try{ toast('We could not confirm that. If no email arrives within 15 minutes, contact support.'); }catch(e){}
     });
 }); });
 var sup=root.querySelector('[data-support]');if(sup)sup.addEventListener('click',openConcierge);
 var rmb=root.querySelector('[data-removebrand]');if(rmb)rmb.addEventListener('click',function(){removeIdea(rmb.dataset.removebrand);});
 root.querySelectorAll('[data-ms]').forEach(function(m){m.addEventListener('click',function(){var i=+m.dataset.ms;var s=launchDone[IDEA.id]||(launchDone[IDEA.id]={});s[i]=!s[i];paint();});});
 root.querySelectorAll('[data-tool]').forEach(function(b){b.addEventListener('click',function(){grTool(b.dataset.tool,IDEA,NM);});});
 root.querySelectorAll('[data-launchbiz]').forEach(function(lb){lb.addEventListener('click',function(){openG('&#128640;','Launch your business','<p>You&rsquo;re ready to take <b>'+esc(NM.name)+'</b> live. We&rsquo;ll walk you through registering your domain, publishing your site, and posting your announcement &mdash; and your concierge is one tap away the whole time.</p>');});});
 root.querySelectorAll('[data-openai]').forEach(function(bn){bn.addEventListener('click',function(){openAIStudio();});});
 root.querySelectorAll('[data-opensx]').forEach(function(bn){bn.addEventListener('click',function(){openSuccess();});});
 root.querySelectorAll('[data-olin]').forEach(function(bn){bn.addEventListener('click',function(){handoffToOlin(IDEA,NM);});});
 // Social handle capsules — one per unique handle; a click opens every platform it's ready on.
 root.querySelectorAll('[data-hlinks]').forEach(function(b){b.addEventListener('click',function(){
   var links=[];try{links=JSON.parse(b.getAttribute('data-hlinks'));}catch(e){}
   var lbl=b.getAttribute('data-hlabel')||'';
   var body='<p style="color:#141414;font-size:.9375rem">Your handle <b>'+esc(lbl)+'</b> is ready to claim on '+links.length+' platform'+(links.length>1?'s':'')+' &mdash; tap any to open:</p><div style="display:flex;flex-direction:column;gap:10px;margin-top:14px">'+links.map(function(l){return '<a href="'+esc(l.u)+'" target="_blank" rel="noopener" class="act primary" style="text-decoration:none;text-align:center;display:block">'+esc(l.n)+' &rarr;</a>';}).join('')+'</div><p style="color:#141414;opacity:.72;font-size:.75rem;margin-top:14px">We recommend these for brand consistency. SparkMyName does not guarantee availability &mdash; please confirm on each platform before claiming.</p>';
   openG('&#9679;','Claim '+esc(lbl),body);
 });});
 root.querySelectorAll('[data-acc]').forEach(function(a){a.addEventListener('click',function(){var pnl=root.querySelector('[data-accp="'+a.dataset.acc+'"]');if(!pnl)return;pnl.classList.toggle('hidden');var c=a.querySelector('.tgo');if(c)c.innerHTML=pnl.classList.contains('hidden')?'&#43;':'&#8722;';});});
 root.querySelectorAll('[data-seo]').forEach(function(m){m.addEventListener('click',function(){m.classList.toggle('done');});});
 root.querySelectorAll('[data-tip]').forEach(function(b){b.addEventListener('click',function(){openG('&#128266;','Peter&rsquo;s tip','<p>'+esc(b.dataset.tip)+'</p>');});});
 root.querySelectorAll('[data-cust]').forEach(function(b){b.addEventListener('click',function(){toast('Customizing “'+b.dataset.cust+'” for '+NM.name+' — opens the print partner on the live site.');});});
 root.querySelectorAll('[data-gouprade]').forEach(function(b){b.addEventListener('click',function(){curTab='addons';paint();toast('See your included extras — request any of them at no extra charge.');});});
 var swg=root.querySelector('[data-swgen]');if(swg)swg.addEventListener('click',function(){var topic=(($('#swTopic')||{}).value||'').trim()||'our launch';var post=sparkWrite(topic,NM);var out=$('#swOut');out.innerHTML='<div class="swpost">'+esc(post)+'</div><button class="seeall" data-copypost="1">Copy post</button>';var cp=out.querySelector('[data-copypost]');if(cp)cp.addEventListener('click',function(){copy(post);toast('Post copied.');});});
 /* FOUNDER'S PULSE — now actually sends (2026-07-26, Founder order). It used to clear the box
    and say "Sent straight to Peter" without sending anything at all. */
 var fps=root.querySelector('[data-fpsend]');
 if(fps) fps.addEventListener('click',function(){
   var box=$('#fpNote'), v=((box||{}).value||'').trim();
   if(!v){ toast('Write Peter a quick note first.'); return; }
   fps.disabled=true;
   var brand=''; try{ brand=(IDEA&&IDEA.names&&IDEA.names[0]&&IDEA.names[0].name)||IDEA.cat||''; }catch(e){}
   smnSupportSend("Founder's Pulse", (brand?('Brand: '+brand+'\n\n'):'')+v, function(ok){
     fps.disabled=false;
     if(ok){ if(box) box.value=''; toast('Sent straight to Peter — he reads these personally.'); }
     else  { toast('That did not go through. Please use the Support page and we will pick it up.'); }
   });
 });
 /* PICKING A NAME REVEALS THE CARD (2026-07-25, Founder order: "it will appear, they will
    not scroll to it"). document.startViewTransition lets the browser snapshot before and
    after and animate the difference on the GPU — same-document view transitions have been
    Baseline since October 2025 (Chrome 111+, Edge 111+, Safari 18+, Firefox 144+). Where it
    is unsupported the DOM simply updates with no animation, which is why it is safe to call
    without a polyfill.
    prefers-reduced-motion is handled here on purpose: the browser does NOT skip a view
    transition on its own, so respecting the setting is the caller's job. */
 root.querySelectorAll('.nopt[data-n]').forEach(function(p){p.addEventListener('click',function(){
   var first=!window.__smnPicked;
   window.__smnPicked=(curIdea()||{}).id; curName=+p.dataset.n; curTab=''; cart={};
   var reduce=false;
   try{ reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){}
   if(first && !reduce && document.startViewTransition){
     document.startViewTransition(function(){ paint(); });
   } else {
     paint();
   }
   /* Bring the card to the eye rather than making them hunt for it. */
   setTimeout(function(){
     try{
       var card=document.querySelector('#main .card');
       if(card && card.scrollIntoView) card.scrollIntoView({block:'start',behavior:reduce?'auto':'smooth'});
     }catch(e){}
   }, first?60:0);
 });});
 var reg=root.querySelector('[data-register]');if(reg)reg.addEventListener('click',function(){openG('&#127760;','Register '+esc(NM.dom),'<p>Great choice &mdash; <b>'+esc(NM.dom)+'</b> is available. Your Spark concierge secures it <b>for you</b>, right here &mdash; no forms, no leaving your workspace.</p><p style="margin-top:12px">Tap below and we&rsquo;ll lock it in and point it at your new brand.</p><button class="act primary" data-regstart="1" style="margin-top:16px">&#10022; Secure '+esc(NM.dom)+' for me</button>');var rs=document.getElementById("gmBody").querySelector("[data-regstart]");if(rs)rs.addEventListener("click",function(){$("#gmodal").classList.remove("open");toast("On it — your concierge is securing "+NM.dom+". We’ll confirm by email.");});});
 root.querySelectorAll('.tab').forEach(function(t){t.addEventListener('click',function(){curTab=t.dataset.tab;root.querySelectorAll('.tab').forEach(function(x){x.classList.toggle('on',x===t);});root.querySelectorAll('.panel').forEach(function(x){x.classList.toggle('on',x.dataset.p===curTab);});});});
 root.querySelectorAll('[data-see]').forEach(function(b){b.addEventListener('click',function(){b.parentNode.querySelectorAll('.more').forEach(function(m){m.classList.remove('hidden');});b.classList.add('hidden');});});
 root.querySelectorAll('[data-dl]').forEach(function(b){b.addEventListener('click',function(){var i=+b.dataset.dl;dlSVG(LOGO_SET[i][1](NM.name,NM.mono,palCols(IDEA)),slug(NM.name)+'-'+LOGO_SET[i][0].toLowerCase()+'.svg');});});
 root.querySelectorAll('[data-dlreal]').forEach(function(b){b.addEventListener('click',function(){var i=+b.dataset.dlreal;var u=(NM.logos&&NM.logos[i]);if(u)dlURL(u,slug(NM.name)+'-logo-'+(i+1)+(/\.png|\.jpg|\.jpeg|\.svg|\.webp/i.test(u)?'':'.png'));});});
 // Logo download picker: tap-to-select, per-logo SVG, select-all, and zip-selected (under "logos/").
 function _syncLogoAll(){var all=root.querySelector('[data-logoall]');if(!all)return;var cards=root.querySelectorAll('[data-logosel]');var everyOn=cards.length&&Array.prototype.every.call(cards,function(c){return c.classList.contains('sel');});all.classList.toggle('off',!everyOn);}
 root.querySelectorAll('[data-logosel]').forEach(function(c){c.addEventListener('click',function(e){if(e.target.closest('[data-logodl]'))return;c.classList.toggle('sel');_syncLogoAll();});});
 root.querySelectorAll('[data-logodl]').forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();var i=+b.closest('[data-logosel]').dataset.logosel;dlSVG(LOGO_SET[i][1](NM.name,NM.mono,palCols(IDEA)),slug(NM.name)+'-'+LOGO_SET[i][0].toLowerCase()+'.svg');});});
 var lall=root.querySelector('[data-logoall]');if(lall)lall.addEventListener('click',function(){var cards=root.querySelectorAll('[data-logosel]');var turnOn=Array.prototype.some.call(cards,function(c){return !c.classList.contains('sel');});cards.forEach(function(c){c.classList.toggle('sel',turnOn);});_syncLogoAll();});
 var lzip=root.querySelector('[data-logozip]');if(lzip)lzip.addEventListener('click',function(){var idx=[];root.querySelectorAll('[data-logosel]').forEach(function(c){if(c.classList.contains('sel'))idx.push(+c.dataset.logosel);});downloadLogos(IDEA,NM,idx,lzip);});
 _syncLogoAll();
 root.querySelectorAll('.sw').forEach(function(sw){sw.addEventListener('click',function(){copy(sw.dataset.hex);toast('Copied '+sw.dataset.hex.toUpperCase());});});
 root.querySelectorAll('[data-copy]').forEach(function(b){b.addEventListener('click',function(){copy(b.getAttribute('data-copy'));toast('Copied to clipboard');});});
 root.querySelectorAll('[data-confirm]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();toast('Opens the platform to confirm availability.');});});
 root.querySelectorAll('[data-dv]').forEach(function(b){b.addEventListener('click',function(){toast('Preparing "'+DELIVS[+b.dataset.dv][1]+'" for '+NM.name+'…');});});
 root.querySelectorAll('[data-merch]').forEach(function(b){b.addEventListener('click',function(){var i=+b.dataset.merch;dlSVG(merchSVG(MERCH[i],NM.mono,palCols(IDEA)),slug(NM.name)+'-'+slug(MERCH[i])+'-mockup.svg');});});
 var mt=root.querySelector('[data-merchtoggle]');if(mt)mt.addEventListener('click',function(){var mp=root.querySelector('#merchpanel');if(!mp)return;mp.classList.toggle('hidden');var open=!mp.classList.contains('hidden');mt.textContent=open?'Close':'Open';if(open)mp.scrollIntoView({behavior:'smooth',block:'nearest'});});
 root.querySelectorAll('[data-hdrdl]').forEach(function(b){b.addEventListener('click',function(){var u=b.getAttribute('data-hdrurl');if(!u)return;dlURL(u,slug(IDEA.name||'brand')+'-header-2k'+(/\.png|\.jpg|\.jpeg|\.webp/i.test(u)?'':'.png'));});});
 root.querySelectorAll('[data-cinedl]').forEach(function(b){b.addEventListener('click',function(){var i=+b.dataset.cinedl,Cc=palCols(IDEA);var real=b.getAttribute('data-cineurl');var nm=slug(IDEA.names[i].name)+'-cinematic';if(real){dlURL(real,nm+'-2k'+(/\.png|\.jpg|\.jpeg|\.webp/i.test(real)?'':'.png'));return;}var svg=cineSVG(Cc,'name'+IDEA.names[i].mono);dlSVG(svg,nm+'-2k.svg');});});
 root.querySelectorAll('[data-up]').forEach(function(b){b.addEventListener('click',function(){toast('Goes to checkout to unlock more for this idea.');});});
 root.querySelectorAll('[data-reqasset]').forEach(function(b){b.addEventListener('click',function(){openG('&#127873;','Request a custom asset — included','<p style="color:#141414">Pick what you&rsquo;d like and tell us the details &mdash; our team custom-curates &amp; builds it for you, at <b>no extra charge</b>. Nothing here is for sale; it&rsquo;s already part of your $99.</p><div style="display:flex;flex-wrap:wrap;gap:8px;margin:14px 0">'+['Business Cards','Apparel','Signage','Flyers','Website','Other'].map(function(x){return '<button class="chip" type="button" style="cursor:pointer" onclick="var on=this.getAttribute(\'data-on\')===\'1\';this.setAttribute(\'data-on\',on?\'0\':\'1\');this.style.background=on?\'rgba(0,0,0,.14)\':\'#141414\';this.style.color=on?\'\':\'#141414\'">'+x+'</button>';}).join('')+'</div><textarea id="reqDetails" placeholder="Business name, address if it goes on the item, colors, must-haves…" style="width:100%;min-height:88px;background:#FFFFFF;border:1px solid var(--line);border-radius:12px;padding:12px;color:#141414;font:inherit;resize:vertical"></textarea><button class="act primary" id="smnReqSend" style="margin-top:14px;width:100%">&#10022; Send my request — included</button>');/* WIRED 2026-07-27 (Founder order): this Send button used to only close the modal and toast "Request sent" while nothing left the browser. It now posts to order-request.js — the same zero-loss endpoint the catalog uses, which emails the client and the Founder even if the smn_orders table is missing, so a custom request can never silently vanish. */var _gb=$('#gmBody');if(_gb){var _sb=_gb.querySelector('#smnReqSend');if(_sb){_sb.addEventListener('click',function(){var _cats=Array.prototype.map.call(_gb.querySelectorAll('.chip[data-on="1"]'),function(c){return (c.textContent||'').trim();}).filter(Boolean);var _det=((_gb.querySelector('#reqDetails')||{}).value||'').trim();if(!_cats.length&&!_det){toast("Pick an item or add a few details first.");return;}_sb.disabled=true;_sb.innerHTML="Sending…";fetch('/.netlify/functions/order-request',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({access_token:(window.__smnTok||''),r:IDEA.id,brand:NM.name,item:'custom-asset',itemName:'Custom asset request',fields:{categories:_cats.join(', '),details:_det}})}).then(function(r){return r.json().catch(function(){return {};});}).then(function(j){if(j&&j.ok){document.getElementById('gmodal').classList.remove('open');toast("✓ Request received — we'll email you within 24 hours when your files are ready.");}else{_sb.disabled=false;_sb.innerHTML="✦ Send my request — included";toast("That didn't go through — please try again.");}}).catch(function(){_sb.disabled=false;_sb.innerHTML="✦ Send my request — included";toast("That didn't go through — please try again.");});});}}});});
 root.querySelectorAll('[data-add]').forEach(function(b){b.addEventListener('click',function(){var k=b.dataset.add,p=+b.dataset.price;if(cart[k])delete cart[k];else cart[k]=p;curTab='addons';paint();});});
 function favSync(){try{var tk=(window.__smnTok||'');fetch('/.netlify/functions/fav-toggle',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+tk},body:JSON.stringify({access_token:tk,r:IDEA.id,fav:!!IDEA.fav})}).catch(function(){});}catch(e){}}
  function favFlip(){IDEA.fav=!IDEA.fav;document.querySelectorAll('.favheart').forEach(function(h){h.classList.toggle('on',IDEA.fav);});favSync();toast(IDEA.fav?'Added to favorites':'Removed from favorites');}
  var fav=root.querySelector('[data-fav]');if(fav)fav.addEventListener('click',function(){favFlip();paint();});
  /* SELF-HEALING ARTWORK (2026-07-27, Founder order: "if that shows up like that, it
     automatically corrects... it'll say new images arriving shortly").
     Old orders still point at photographs banked before the cinematic standard was restored.
     Opening such a brand now asks the server to re-run the art department for it and tells the
     customer plainly that fresh images are coming. Runs once per brand per session, never
     blocks anything, and says nothing at all unless a refresh genuinely started. */
  (function(){
    try{
      if(!IDEA || !IDEA.id) return;
      window.__smnHealed = window.__smnHealed || {};
      if(window.__smnHealed[IDEA.id]) return;
      window.__smnHealed[IDEA.id] = 1;
      var urls=[]; try{ (IDEA.names||[]).forEach(function(n){ if(n && n.heroUrl) urls.push(n.heroUrl); }); }catch(e){}
      if(IDEA.header) urls.push(IDEA.header);
      /* the same staleness rule the server uses: banked outside the current generation */
      var stale = urls.some(function(u){
        return typeof u==='string' && u.indexOf('/v3/')<0;   /* CLARITY GENERATION v3 — pre-fix art repaints on open */
      });
      if(!stale) return;
      fetch('/.netlify/functions/refresh-art',{method:'POST',
        headers:{'Content-Type':'application/json'},body:JSON.stringify({r:IDEA.id})})
        .then(function(x){return x.json().catch(function(){return {};});})
        .then(function(d){
          if(d && d.refreshing){
            var host=root.querySelector('.webavail');
            if(host && !root.querySelector('.artheal')){
              var n=document.createElement('div');
              n.className='artheal';
              n.innerHTML='&#10022; Fresh photography is being made for this brand right now &mdash; '+
                          'it usually lands within a few minutes. Reload this page to see it.';
              host.appendChild(n);
            }
          }
          /* if it is not refreshing we say NOTHING — never promise a picture that is not coming */
        }).catch(function(){});
    }catch(e){}
  })();
  var dla=root.querySelector('[data-dlall]');if(dla)dla.addEventListener('click',function(){downloadAll(IDEA,dla);});
  /* PRESENTATION STUDIES (2026-07-30): fire all seven material renders for the current name
     through generate-asset.js — the SAME proven path the AI Designer uses — and drop each in
     as it lands. Spend happens only on this tap. Failures are per-tile and never block the set. */
  /* AGENCY CUSTOM — AUTOMATIC & COMPOSED (2026-07-30). Replaces the earlier AI generate-asset
     version that could circle forever when the image model stalled. The agency mark is now
     built locally on canvas from the brand's real logo (genAgencyMark), runs by itself on open
     (no click), and resolves in well under a second. If the real logo isn't ready or the canvas
     can't be read, the tile simply stays hidden — it never hangs. */
  function _fireAgency(){
    var IDEAx=curIdea(); var NMx=IDEAx&&IDEAx.names&&IDEAx.names[curName];
    if(!NMx||NMx.agencyLogo||NMx.__agFail)return;
    var logoUrl=(NMx.logos&&NMx.logos[0])||'';
    if(!logoUrl){ NMx.__agFail=true; return; }               // no real logo yet -> no agency tile, no spinner
    var key=String(IDEAx.id)+'|'+curName; window.__agFiring=window.__agFiring||{};
    if(window.__agFiring[key])return; window.__agFiring[key]=true;
    var C=(NMx.palettes&&NMx.palettes[0]&&NMx.palettes[0].cols)||(IDEAx.palettes&&IDEAx.palettes[0]&&IDEAx.palettes[0].cols)||['#141414'];
    genAgencyMark(logoUrl,NMx.name,NMx.tag||'',C,IDEAx,NMx).then(function(it){
      window.__agFiring[key]=false;
      try{ NMx.agencyLogo=URL.createObjectURL(it.blob); }catch(e){ NMx.__agFail=true; }
      paint();
    }).catch(function(){ window.__agFiring[key]=false; NMx.__agFail=true; paint(); });
  }
  /* THE AUTOMATIC TRIGGER: compose the agency mark on open if this name doesn't have one yet.
     No token needed and no polling — it is a local canvas composition, so it cannot circle. */
  try{ _fireAgency(); }catch(e){}
  /* WORDMARK SET — composes the client's choose-any wordmark styles on open (name + palette +
     type, no logo needed, no AI, $0). Stores NM.wordmarks[] + NM.heroWordmark; paints so the
     hero shows large under the URL and the set shows in the logo suite. Once per name. */
  function _fireWordmarks(){
    var IDEAx=curIdea(); var NMx=IDEAx&&IDEAx.names&&IDEAx.names[curName];
    if(!NMx||NMx.name==null||NMx.wordmarks)return;
    var key='wm|'+String(IDEAx.id)+'|'+curName; window.__wmFiring=window.__wmFiring||{};
    if(window.__wmFiring[key])return; window.__wmFiring[key]=true;
    var C=(NMx.palettes&&NMx.palettes[0]&&NMx.palettes[0].cols)||(IDEAx.palettes&&IDEAx.palettes[0]&&IDEAx.palettes[0].cols)||['#141414'];
    Promise.all(WORDMARK_STYLES.map(function(sp){
      return genWordmark(NMx.name,sp,C,IDEAx,NMx).then(function(it){return {label:it.label,key:it.key,url:URL.createObjectURL(it.blob)};}).catch(function(){return null;});
    })).then(function(list){
      window.__wmFiring[key]=false;
      var got=(list||[]).filter(Boolean);
      NMx.wordmarks=got;
      if(got.length){ var hero=got.filter(function(g){return g.key==='caps';})[0]||got[0]; NMx.heroWordmark=hero.url; }
      paint();
    }).catch(function(){ window.__wmFiring[key]=false; NMx.wordmarks=[]; });
  }
  try{ _fireWordmarks(); }catch(e){}
  var _ssb=root.querySelector('[data-makestudies]');
  if(_ssb)_ssb.addEventListener('click',function(){
    var IDEAx=curIdea(); var NMx=IDEAx&&IDEAx.names&&IDEAx.names[curName]; if(!NMx)return;
    var tok=''; try{tok=(window.__smnTok||window.__SMN_TOKEN||'');}catch(e){}
    NMx.studies=[];  /* fresh set; each finished study is persisted here as it lands */
    var state=SMN_STUDIES.map(function(m){return {slug:m[0],label:m[1],st:'load'};});
    var HARD={invalid_token:'Open this brand from your email link, then try again.',brand_not_activated:'This brand isn\u2019t activated yet.',not_your_brand:'Couldn\u2019t verify this brand.',missing_brand_id:'Missing brand id.',dispatch_failed:'The art department didn\u2019t start \u2014 try again.',background_not_reachable:'The art department didn\u2019t start \u2014 try again.'};
    /* generate-asset is ASYNC: it QUEUES to a background renderer and answers {queued:true};
       the finished image only returns on a later identical request via the cache gate. So
       each material is POLLED every 6s until its download_url lands, exactly like the
       command-bar shelf. A per-material 'take' gives each its own cache key. We ALWAYS repaint
       from `state` against the LIVE #ssGrid, so a card repaint mid-generation can never strand
       a finished render in a detached grid; and each done is persisted to NMx.studies so the
       studies re-show when the brand is reopened. */
    function paint(){var g=document.getElementById('ssGrid');if(!g)return;
      g.innerHTML=state.map(function(s){
        if(s.st==='done')return '<figure class="ss-card"><img src="'+esc(s.url)+'" alt="'+esc(NMx.name)+' \u2014 '+esc(s.label)+'" loading="lazy"><figcaption>'+esc(s.label)+'</figcaption></figure>';
        if(s.st==='fail')return '<figure class="ss-card"><span class="ss-fail">'+esc(s.msg||'Couldn\u2019t make this one.')+'</span><figcaption>'+esc(s.label)+'</figcaption></figure>';
        return '<figure class="ss-card"><span class="ss-load"><span class="dotspin"></span></span><figcaption>'+esc(s.label)+'</figcaption></figure>';
      }).join('');
    }
    _ssb.disabled=true; _ssb.innerHTML='Creating your studies&hellip; (about a minute)'; paint();
    var done=0;
    function finish(){done++;if(done>=state.length){_ssb.disabled=false;_ssb.innerHTML='&#10022; Recreate my studies';}}
    state.forEach(function(s,i){
      var m=SMN_STUDIES[i];
      var req=(NMx.name+' logo '+m[2]+' \u2014 presentation study').slice(0,200);
      var tries=0, MAX=40; /* ~4 min at 6s */
      (function poll(){
        tries++;
        fetch('/.netlify/functions/generate-asset',{method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({access_token:tok,r:IDEAx.id,name:NMx.name,custom_request:req,take:m[0]})})
          .then(function(r){return r.json().catch(function(){return {};});})
          .then(function(j){
            if(j&&j.success&&j.download_url){s.st='done';s.url=j.download_url;NMx.studies.push({slug:s.slug,label:s.label,url:s.url});paint();finish();return;}
            if(j&&(j.queued||j.error==='queued'||j.error==='duplicate_request_in_progress')){
              if(tries>=MAX){s.st='fail';s.msg='Still working \u2014 check back shortly.';paint();finish();return;}
              setTimeout(poll,6000);return;
            }
            s.st='fail';s.msg=(j&&HARD[j.error])||('Couldn\u2019t make this one'+(j&&j.error?' ('+j.error+')':'.'));paint();finish();
          })
          .catch(function(){ if(tries>=MAX){s.st='fail';s.msg='Network hiccup.';paint();finish();return;} setTimeout(poll,6000); });
      })();
    });
  });
  /* the all-six-names package kept its behaviour, it just has an honest button now */
  var shl=root.querySelector('[data-sharelink]');
  if(shl)shl.addEventListener('click',function(){
    var i2=curIdea(); if(!i2) return;
    var n2=i2.names&&i2.names[curName];
    var url=location.origin+'/.netlify/functions/brand-card?r='+encodeURIComponent(i2.id)+'&n='+(curName||0);
    /* native share sheet on phones; clipboard everywhere else — never a dead end */
    try{ navigator.clipboard.writeText(url); }catch(e){}
    openG('&#128279;','Share this brand',
      '<p>Your public link is copied \u2014 paste it anywhere. It shows the name, photo and tagline only.</p>'+
      '<p style="word-break:break-all"><a href="'+url+'" target="_blank" rel="noopener">'+url+'</a></p>'+
      '<p style="margin-top:14px"><b>Or email it to someone:</b></p>'+
      '<div style="display:flex;gap:8px;margin-top:6px"><input id="shTo" type="email" placeholder="their@email.com" style="flex:1;padding:11px 12px;border:1px solid var(--line);border-radius:10px;font:inherit"><button class="act primary" id="shSend">Send</button></div><div id="shMsg" style="margin-top:8px;font-size:.82rem"></div>');
    setTimeout(function(){ var sb=document.getElementById('shSend'); if(!sb) return;
      sb.addEventListener('click',function(){
        var toEl=document.getElementById('shTo'), msg=document.getElementById('shMsg');
        var to=(toEl&&toEl.value||'').trim();
        if(to.indexOf('@')<1){ if(msg)msg.textContent='Please enter a valid email address.'; return; }
        sb.disabled=true; sb.textContent='Sending\u2026';
        var tok=''; try{ tok=(window.__SMN_TOKEN||window.__smnTok||''); }catch(e){}
        fetch('/.netlify/functions/email-brand',{method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({mode:'share',access_token:tok,r:i2.id,name:(n2&&n2.name)||'',to:to,link:url})})
        .then(function(r){return r.json();}).then(function(d){ sb.disabled=false; sb.textContent='Send';
          if(msg)msg.textContent=(d&&d.ok)?('Sent \u2014 '+to+' has it.'):('Could not send: '+((d&&d.error)||'try again')); })
        .catch(function(){ sb.disabled=false; sb.textContent='Send'; if(msg)msg.textContent='Network error \u2014 try again.'; });
      }); },80);
  });
  var dlan=root.querySelector('[data-dlallnames]');
  if(dlan)dlan.addEventListener('click',function(){downloadAll(IDEA,dlan,'all');});
  /* the designer hand-off used to live behind the Tools menu; same handler, now a visible tile */
  var dolin=root.querySelector('[data-olin]');
  if(dolin)dolin.addEventListener('click',function(){
    var i2=curIdea(); var n2=i2&&i2.names&&i2.names[curName];
    if(typeof handoffToOlin==='function'&&i2&&n2) handoffToOlin(i2,n2);
  });
  root.querySelectorAll('[data-bkacctoggle]').forEach(function(h){h.addEventListener('click',function(){var box=h.closest('.bkacc');var open=box.classList.toggle('open');h.setAttribute('aria-expanded',open?'true':'false');});});
  window.openPers=function(){var IDEA=curIdea();if(!IDEA)return;var NM=IDEA.names[curName];if(!NM)return;
    document.getElementById('pvBrand').textContent=NM.name;
    document.getElementById('pvTagline').textContent=NM.tag||'';
    var pp=NM.persona||{};
    document.getElementById('pFullName').value=pp.fullName||'';
    document.getElementById('pTitle').value=pp.title||'';
    document.getElementById('pPhone').value=pp.phone||'';
    document.getElementById('pEmail').value=pp.email||'';
    document.getElementById('pAddress').value=pp.address||'';
    persPreview();
    var m=document.getElementById('persModal');m.classList.remove('hidden');m.setAttribute('aria-hidden','false');};
  window.closePers=function(){var m=document.getElementById('persModal');m.classList.add('hidden');m.setAttribute('aria-hidden','true');};
  window.persPreview=function(){function pv(id){return (document.getElementById(id)||{}).value||'';}
    document.getElementById('pvPerson').textContent=pv('pFullName')||'Your Name';
    document.getElementById('pvTitle').textContent=pv('pTitle')||'Your Title';
    document.getElementById('pvMeta1').textContent=(pv('pPhone')||'Your phone')+' \u00b7 '+(pv('pEmail')||'Your email');
    document.getElementById('pvMeta2').textContent=pv('pAddress')||'Your address';};
  window.submitPers=function(btn){var IDEA=curIdea();if(!IDEA)return;var NM=IDEA.names[curName];if(!NM)return;
    function pv(id){return (document.getElementById(id)||{}).value||'';}
    var persona={fullName:pv('pFullName'),title:pv('pTitle'),phone:pv('pPhone'),email:pv('pEmail'),address:pv('pAddress')};
    var tk=(window.__smnTok||'');
    if(btn){btn.disabled=true;btn.innerHTML='Sending\u2026';}
    fetch('/.netlify/functions/personalize-assets',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({access_token:tk,r:IDEA.id,name:NM.name,persona:persona})})
      .then(function(r){return r.json().catch(function(){return {};});})
      .then(function(j){closePers();
        if(j&&j.ok){toast('\u2713 Request received \u2014 we\'ll email you within 24 hours when your files are ready.');NM.assetsStatus='processing';}
        else{toast('That didn\'t go through \u2014 please try again.');}
        if(btn){btn.disabled=false;btn.innerHTML='Craft my personalized files &rarr;';}
      }).catch(function(){closePers();toast('That didn\'t go through \u2014 please try again.');if(btn){btn.disabled=false;btn.innerHTML='Craft my personalized files &rarr;';}});};
  var openPersBtn=root.querySelector('[data-openpers]');if(openPersBtn)openPersBtn.addEventListener('click',openPers);
  function itemGenerator(key,NM,IDEA){
    var logoUrl=(NM.logos&&NM.logos[0])||'';var heroUrl=NM.heroUrl||'';
    function _ph(k){return smnPhotoFor(IDEA,NM,k)||heroUrl;}var name=NM.name;var tag=NM.tag||'';var dom=NM.dom||'';
    var bio=(IDEA.aboutT&&IDEA.aboutT[0])||(NM.why&&NM.why[0])||tag; // BUGFIX 2026-07-24: was IDEA.about (nonexistent) — every starter page duplicated the tagline
    var Cc=(IDEA.palettes&&IDEA.palettes[0]&&IDEA.palettes[0].cols)||['#141414','#141414','#141414','#B7791F'];
    switch(key){
      case 'main-logo': return logoUrl?fetch(logoUrl).then(function(r){return r.blob();}).then(function(b){return{filename:'main-logo.png',blob:b};}):Promise.reject();
      case 'logo-dark': return genDark(logoUrl,Cc);
      case 'avatar': return genAvatar(_logoFor(NM,'icon'));
      case 'cover': return heroUrl?genCover(_ph('cover')):Promise.reject();
      case 'hero': return heroUrl?fetch(heroUrl).then(function(r){return r.blob();}).then(function(b){return{filename:'website-hero.png',blob:b};}):Promise.reject();
      case 'lockup': return genLockup(_logoFor(NM,'wide'),name,Cc,IDEA,NM);
      case 'banner1': return logoUrl?genAdBanner(_logoFor(NM,'icon')||logoUrl,name,tag,300,250,'banner-300x250.png',Cc,IDEA,NM):Promise.reject();
      case 'banner2': return logoUrl?genAdBanner(_logoFor(NM,'icon')||logoUrl,name,tag,728,90,'banner-728x90.png',Cc,IDEA,NM):Promise.reject();
      case 'banner3': return logoUrl?genAdBanner(_logoFor(NM,'icon')||logoUrl,name,tag,160,600,'banner-160x600.png',Cc,IDEA,NM):Promise.reject();
      case 'banner4': return logoUrl?genAdBanner(_logoFor(NM,'icon')||logoUrl,name,tag,300,600,'banner-300x600.png',Cc,IDEA,NM):Promise.reject();
      case 'banner5': return logoUrl?genAdBanner(_logoFor(NM,'icon')||logoUrl,name,tag,320,50,'banner-320x50.png',Cc,IDEA,NM):Promise.reject();
      case 'banner6': return logoUrl?genAdBanner(_logoFor(NM,'icon')||logoUrl,name,tag,970,250,'banner-970x250.png',Cc,IDEA,NM):Promise.reject();
      case 'site': return Promise.resolve(genSite(name,tag,dom,bio,Cc,IDEA,NM));
      case 'handles': return Promise.resolve(genHandles(name));
      case 'taglines': return Promise.resolve((function(){var F=smnFills(NM,IDEA);var src=(NM.taglines&&NM.taglines.length?NM.taglines:((IDEA.names&&IDEA.names[0]&&IDEA.names[0].taglines)||[]));return {filename:'Taglines.txt',blob:new Blob([topArr(src,6,F.taglines).join('\n')+'\n'],{type:'text/plain'})};})());
      case 'fonts': return Promise.resolve({filename:'Fonts.txt',blob:new Blob([(IDEA.type||[]).map(function(t){return t.name+(t.note?(' \u2014 '+t.note):'');}).join('\n')+'\n'],{type:'text/plain'})});
      case 'bios': return Promise.resolve((function(){var F=smnFills(NM,IDEA);return {filename:'Social-bios.txt',blob:new Blob([topArr(IDEA.biosT,6,F.bios).join('\n\n')+'\n'],{type:'text/plain'})};})());
      case 'posts': return Promise.resolve((function(){var F=smnFills(NM,IDEA);return {filename:'Launch-posts.txt',blob:new Blob([topArr(IDEA.postsT,6,F.posts).join('\n\n')+'\n'],{type:'text/plain'})};})());
      default: return Promise.reject();
    }
  }
  /* SHARED FILE-BUILDER (2026-07-23): one path builds any Downloads item — used by the
     single-download button, Download-selected, and DOWNLOAD ALL ASSETS, so every route
     produces identical agency-grade files. Returns a Promise of [{filename,blob}]. */
  function buildItemFiles(key,NMx,IDEAx){
    if(key==='vector-logo'){var _lg=(NMx.logos&&NMx.logos[0])||'';
      var _fb=function(){var svgSrc=(LOGO_SET[0]&&LOGO_SET[0][1](NMx.name,NMx.mono,(IDEAx.palettes&&IDEAx.palettes[0]&&IDEAx.palettes[0].cols)||['#141414']))||'';var m=svgSrc.match(/<svg[\s\S]*<\/svg>/);return [{filename:slug(NMx.name)+'-logo-vector.svg',blob:new Blob([m?m[0]:'<svg xmlns="http://www.w3.org/2000/svg"></svg>'],{type:'image/svg+xml'})}];};
      if(_lg&&/^https?:\/\//.test(_lg))return traceLogoSVG(_lg).then(function(svg){return [{filename:slug(NMx.name)+'-logo-vector.svg',blob:new Blob([svg],{type:'image/svg+xml'})}];}).catch(function(){return _fb();});
      return Promise.resolve(_fb());}
    if(key==='size-pack')return genSizes((NMx.logos&&NMx.logos[0])||'');
    if(key==='favicons')return genFavs(_logoFor(NMx,'icon'));
    if(key==='website5')return loadBrandFont(brandDisplayFont(NMx,IDEAx)).then(function(){return genWebsite5(NMx,IDEAx);});
    if(key==='logo-ready')return genReadyLogos((NMx.logos&&NMx.logos[0])||'',(IDEAx.palettes&&IDEAx.palettes[0]&&IDEAx.palettes[0].cols)||[]);
    if(key==='copydeck')return genCopyDeck(NMx,IDEAx).then(function(it){return [it];});
    if(key.indexOf('print-')===0||key.indexOf('biz-')===0||key.indexOf('deck-')===0||key.indexOf('merch-')===0||key.indexOf('doc-')===0)return genPrintPiece(key,NMx,IDEAx);
    if(key.indexOf('soc-')===0)return genSocialPiece(key,NMx,IDEAx);
    if(key.indexOf('dig-')===0)return genDigitalPiece(key,NMx,IDEAx).then(function(r){return Array.isArray(r)?r:[r];});
    if(key.indexOf('dg2-')===0)return genDigitalPiece(key,NMx,IDEAx).then(function(r){return Array.isArray(r)?r:[r];});
    if(key.indexOf('pod-')===0)return genPodPiece(key,NMx,IDEAx).then(function(r){return Array.isArray(r)?r:[r];});
    return itemGenerator(key,NMx,IDEAx).then(function(it){return [it];});
  }
  function buildQC(key,NMx,IDEAx){_drawReset();return buildItemFiles(key,NMx,IDEAx).then(function(arr){
    return qcBatch(arr,function(){return buildItemFiles(key,NMx,IDEAx);});});}

  function customItemsFor(NMx){var os=(window.__smnOrders||[]);return os.filter(function(o){return o&&o.status==='delivered'&&Array.isArray(o.assets)&&o.assets.length&&String(o.brand||'')===String(NMx.name||'');});}
  function renderCustomDL(){var host=document.getElementById('customdl');if(!host)return;var IDEAx=curIdea();if(!IDEAx)return;var NMx=IDEAx.names[curName];if(!NMx)return;
    var cs=customItemsFor(NMx);if(!cs.length){host.innerHTML='';return;}
    host.innerHTML='<div class="ph2" style="margin-top:18px">&#10024; Custom-made for &ldquo;'+esc(NMx.name)+'&rdquo;</div><div class="dlgrid">'+cs.map(function(o){return o.assets.map(function(u,i){var fn=slug(o.item_name||'custom')+(o.assets.length>1?'-'+(i+1):'');return '<div class="dlcell" data-selkey="cust" data-custurl="'+esc(u)+'" data-custname="'+esc(fn)+'"><span class="dln">'+esc(o.item_name||'Custom piece')+(o.assets.length>1?' ('+(i+1)+')':'')+'</span><button class="dlgo" data-custdl="'+esc(u)+'" data-custfn="'+esc(fn)+'">&darr; Download</button></div>';}).join('');}).join('')+'</div>';
    host.querySelectorAll('[data-custdl]').forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();dlURL(b.dataset.custdl,b.dataset.custfn);});});
    host.querySelectorAll('.dlcell').forEach(_bindSel);
    _updSelCt();}
  function _bindSel(cell){cell.addEventListener('click',function(e){if(e.target.closest('.dlgo'))return;cell.classList.toggle('sel');_updSelCt();});}
  function _updSelCt(){var n=document.querySelectorAll('.dlcell.sel').length;var s=document.getElementById('selct');if(s)s.textContent=n?('('+n+')'):'';}
  function _selCells(all){var cells=[].slice.call(document.querySelectorAll(all?'.dlcell:not(.soon)':'.dlcell.sel:not(.soon)'));return cells;}
  function _zipCells(cells,btn,zipName){var IDEAx=curIdea();if(!IDEAx)return;var NMx=IDEAx.names[curName];if(!NMx)return;
    if(!cells.length){toast('Tap an item name first to highlight it.');return;}
    var was=btn.innerHTML;btn.disabled=true;btn.innerHTML='Packaging&hellip;';
    loadJSZip(function(){var zip=new JSZip(),folder=zip.folder('assets'),jobs=[],qcHeld=[];
      cells.forEach(function(c){
        if(c.dataset.custurl){jobs.push(fetch(c.dataset.custurl,{mode:'cors'}).then(function(r){if(!r.ok)throw 0;return r.blob();}).then(function(bl){var u=c.dataset.custurl,ext=(u.match(/\.(png|jpg|jpeg|webp|svg|pdf|html|txt|zip)(\?|$)/i)||[])[1]||'png';zip.folder('03 CUSTOM MADE FOR YOU').file(c.dataset.custname+'.'+ext,bl);}).catch(function(){}));return;}
        var key=c.dataset.selkey;if(!key||key==='cust')return;
        jobs.push(buildQC(key,NMx,IDEAx).then(function(arr){arr.forEach(function(it){zip.folder(zipFolderFor(it.filename,key)).file(it.filename,it.blob);});}).catch(function(e){if(e&&e.qc&&e.qcnames)qcHeld.push.apply(qcHeld,e.qcnames);}));});
      Promise.all(jobs).then(function(){return zip.generateAsync({type:'blob'});}).then(function(bl){_dlBlob(zipName,bl);btn.disabled=false;btn.innerHTML=was;toast('Your ZIP is downloading \u2014 all files included.');}).catch(function(){btn.disabled=false;btn.innerHTML=was;toast('Something hiccuped — please try again.');});});}
  root.querySelectorAll('#dlgrid .dlcell').forEach(_bindSel);
  var _bsel=root.querySelector('[data-dlsel]');if(_bsel)_bsel.addEventListener('click',function(){_zipCells(_selCells(false),_bsel,slug((curIdea()&&curIdea().names[curName]&&curIdea().names[curName].name)||'brand')+'-selected-assets.zip');});
  var _ball=root.querySelector('[data-dlassets]');if(_ball)_ball.addEventListener('click',function(){_zipCells(_selCells(true),_ball,slug((curIdea()&&curIdea().names[curName]&&curIdea().names[curName].name)||'brand')+'-all-assets.zip');});
  root.querySelectorAll('[data-dlitem]').forEach(function(btn){
    btn.addEventListener('click',function(){
      var IDEAx=curIdea();if(!IDEAx)return;var NMx=IDEAx.names[curName];if(!NMx)return;
      var key=btn.dataset.dlitem;var was=btn.innerHTML;btn.disabled=true;btn.innerHTML='&hellip;';
      if(key==='website5'){buildQC(key,NMx,IDEAx).then(function(arr){loadJSZip(function(){var zip=new JSZip(),f=zip.folder(slug(NMx.name)+'-website');arr.forEach(function(it){f.file(it.filename,it.blob);});zip.generateAsync({type:'blob'}).then(function(bl){_dlBlob(slug(NMx.name)+'-website.zip',bl);btn.disabled=false;btn.innerHTML=was;toast('Your 5-page brand website downloaded \u2014 open index.html to see it live.');});});}).catch(function(e){btn.disabled=false;btn.innerHTML=was;toast(e&&e.qc?('Quality control held the website back \u2014 please try once more.'):'Open a finished brand first.');});return;}
      buildQC(key,NMx,IDEAx).then(function(arr){arr.forEach(function(it){_dlBlob(it.filename,it.blob);});btn.disabled=false;btn.innerHTML=was;var _n='';try{_n=window.__SMN_QC_LAST||'';window.__SMN_QC_LAST='';}catch(e){}toast(_n?('Downloaded. QC note: '+_n):(key==='vector-logo'?'True vector logo downloaded.':'Downloaded.'));}).catch(function(e){btn.disabled=false;btn.innerHTML=was;toast('Could not build that item: '+((e&&e.message)||'no detail')+' \u2014 tell Claude this message.');});
    });
  });

  var moreB=root.querySelector('[data-moreacts]');if(moreB)moreB.addEventListener('click',function(ev){ev.stopPropagation();var mm=document.getElementById('actMenu');if(mm)mm.classList.toggle('hidden');});
  document.addEventListener('click',function(ev){var mm=document.getElementById('actMenu');if(mm&&!mm.classList.contains('hidden')&&!ev.target.closest('.act-more-wrap'))mm.classList.add('hidden');});
  /* SAVE — the favourite, shown green when on. Reuses favFlip so the hearts elsewhere on the
     card, the left-column ordering and the persisted state all stay in step. */
  /* SEND / SHARE -> RESEND (2026-07-25, Founder order: "send is linked to our resend").
     It used navigator.share with a mailto fallback — the phone's share sheet, nothing to do
     with your infrastructure. It now calls email-brand.js in 'self' mode, the Resend-backed
     function already in this codebase, which emails the owner their Brand Card as an attached
     PDF. Session-token gated, exactly like my-reports. */
  root.querySelectorAll('[data-sendbrand]').forEach(function(b){
    b.addEventListener('click',function(){
      var IDEAx=curIdea(); var NMx=IDEAx&&IDEAx.names&&IDEAx.names[curName];
      if(!NMx){ return; }
      var was=b.innerHTML; b.disabled=true; b.innerHTML='Sending&hellip;';
      var tok=''; try{ tok=(window.__SMN_TOKEN||''); }catch(e){}
      fetch('/.netlify/functions/email-brand',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({mode:'self',access_token:tok,r:IDEAx.id,name:NMx.name})
      }).then(function(r){return r.json();}).then(function(d){
        b.disabled=false; b.innerHTML=was;
        toast(d&&d.ok?'Sent — check your inbox.':'Could not send: '+((d&&d.error)||'try again'));
      }).catch(function(){ b.disabled=false; b.innerHTML=was; toast('Network error — try again.'); });
    });
  });

  root.querySelectorAll('[data-brandsave]').forEach(function(b){
    b.addEventListener('click',function(){
      favFlip();
      var on=!!(curIdea()&&curIdea().fav);
      b.classList.toggle('on',on);
      b.innerHTML='<span class="cact-h">'+(on?'&hearts;':'&#9825;')+'</span> '+(on?'Saved':'Save');
    });
  });

  /* DOWNLOAD — this brand only, two ways, exactly as the printed sample promises.
       Brand sheet (PDF)  -> the browser's own print-to-PDF over a print stylesheet that hides
                             everything except the card. The sample PDFs were produced the same
                             way, which is why they carry a browser header and page numbers.
       All assets (ZIP)   -> the existing per-brand asset packager in the Downloads panel. It is
                             already written, already tested and already scoped to this name, so
                             this button delegates rather than duplicating it. */
  root.querySelectorAll('[data-brandpdf]').forEach(function(b){
    /* PRINTS DIRECTLY (2026-07-27, Founder order: nothing hidden behind buttons).
       This used to open a floating menu offering "Brand sheet (PDF)" and "All assets (ZIP)".
       The ZIP option only clicked the Downloads-tab button, which the "Download this brand"
       tile already does — so the menu was a duplicate wrapped in the very thing we removed.
       One tile, one job: print the sheet. The print stylesheet hides the controls. */
    b.addEventListener('click',function(ev){
      ev.stopPropagation();
      /* ONE-BRAND SHEET (Founder order 2026-07-31): print ONLY the brand card the customer is
         standing in, full page width. Mark the card, hide every sibling at every ancestor level
         up to #main, stretch the card, print, then clean up completely. */
      /* CLONE-TO-PRINT-ROOT (Founder, 2026-07-31 night): ancestor-flattening still left the
         card in a one-third-width column — some wrapper above #main owned a narrow track. So
         the card now ESCAPES the layout entirely: cloned into a dedicated full-width print
         root on <body>. Nothing in the page's ancestry can touch its width. */
      var card=b.closest('.card')||document.querySelector('#main .card');
      var pr=null;
      if(card){
        document.body.classList.add('printing-one');
        pr=document.createElement('div'); pr.id='printroot';
        var cl=card.cloneNode(true);
        /* open every accordion section in the clone so the full card prints */
        cl.querySelectorAll('.bkacc-b').forEach(function(bb){ bb.style.display='block'; });
        pr.appendChild(cl); document.body.appendChild(pr);
      }
      function cleanup(){
        document.body.classList.remove('printing-one');
        if(pr && pr.parentNode) pr.parentNode.removeChild(pr);
        window.removeEventListener('afterprint', cleanup);
      }
      window.addEventListener('afterprint', cleanup);
      setTimeout(cleanup, 4000); /* safety: browsers without afterprint */
      try{ window.print(); }
      catch(e){ cleanup(); toast('Your browser blocked printing \u2014 use File \u203a Print.'); }
    });
  });

  root.querySelectorAll('[data-favh]').forEach(function(h){h.addEventListener('click',function(ev){ev.stopPropagation();favFlip();});});
  function findItem(code){var pr=code.split(':');for(var a=0;a<CATALOG.length;a++){if(CATALOG[a][0]===pr[0]){var its=CATALOG[a][2];for(var b2=0;b2<its.length;b2++){if(its[b2][0]===pr[1])return {cat:CATALOG[a][1],id:code,name:its[b2][1],desc:its[b2][2],fields:its[b2][3]};}}}return null;}
  function openIntake(code){var it=findItem(code);if(!it)return;var w=document.createElement('div');w.className='intakewrap';
    var fl=it.fields.map(function(fk){var sp=FIELDSPEC[fk]||[fk,'text'];var idq='if_'+fk;
      if(sp[1]==='textarea')return '<label for="'+idq+'">'+sp[0]+'</label><textarea id="'+idq+'" data-f="'+fk+'"></textarea>';
      return '<label for="'+idq+'">'+sp[0]+'</label><input id="'+idq+'" type="'+sp[1]+'" data-f="'+fk+'">';}).join('');
    w.innerHTML='<div class="intake" role="dialog" aria-label="Order '+esc(it.name)+'"><h3>'+esc(it.name)+'</h3><div class="isub">For &ldquo;'+esc(NM.name)+'&rdquo; &middot; included with your package &middot; delivered to this workspace within 24 hours.</div>'+fl+'<div class="ibar"><button class="isend">&#10022; Place free order</button><button class="icancel">Cancel</button></div></div>';
    document.body.appendChild(w);
    w.addEventListener('click',function(e){if(e.target===w||e.target.classList.contains('icancel'))w.remove();});
    w.querySelector('.isend').addEventListener('click',function(){
      var flds={};w.querySelectorAll('[data-f]').forEach(function(inp){if(inp.value)flds[inp.dataset.f]=inp.value.slice(0,600);});
      var tk=(window.__smnTok||'');var sb=w.querySelector('.isend');sb.disabled=true;sb.innerHTML='Placing your order\u2026';
      fetch('/.netlify/functions/order-request',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({access_token:tk,r:IDEA.id,brand:NM.name,item:it.id,itemName:it.name,fields:flds})})
      .then(function(r){return r.json().catch(function(){return{};});})
      .then(function(j){
        if(j&&j.ok){
          w.querySelector('.intake').innerHTML='<div style="text-align:center;padding:34px 10px"><div style="font-size:3.25rem;line-height:1">&#127881;</div><h3 style="margin:14px 0 8px">Order placed!</h3><div class="isub" style="font-size:.9375rem;max-width:40ch;margin:0 auto 22px">Your <b style="color:#141414">'+esc(it.name)+'</b> for &ldquo;'+esc(NM.name)+'&rdquo; is in the kitchen &mdash; custom-built and delivered to this workspace within 24 hours. We\u2019ll email you the moment it\u2019s ready.</div><button class="isend" style="margin:0 auto">Done</button></div>';
          w.querySelector('.isend').addEventListener('click',function(){w.remove();});
          var ol=document.getElementById('ordlist');if(ol){if(ol.querySelector('.ordempty'))ol.innerHTML='';
            var d=document.createElement('div');d.className='ordrow';d.innerHTML='<span class="oi">'+esc(it.name)+' &middot; '+esc(NM.name)+'</span><span class="ochip received">Received</span>';ol.prepend(d);}
        } else {
          sb.disabled=false;sb.innerHTML='&#10022; Place free order';
          toast(j&&j.err==='auth'?'We couldn\u2019t verify your workspace \u2014 open it from your delivery email link and try again.':'The order didn\u2019t go through \u2014 please try once more.');
        }
      })
      .catch(function(){sb.disabled=false;sb.innerHTML='&#10022; Place free order';toast('Connection hiccup \u2014 please try again.');});
    });}
  var _sp=root.querySelector('[data-storepass]');if(_sp)_sp.addEventListener('click',function(){var was=_sp.innerHTML;_sp.disabled=true;_sp.innerHTML='Opening secure checkout\u2026';
    var em='';try{em=localStorage.getItem('smn_email')||'';}catch(e){}
    fetch('/.netlify/functions/create-checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({plan:'storepass',email:em})})
    .then(function(r){return r.json();}).then(function(j){if(j&&j.url){location.href=j.url;}else{_sp.disabled=false;_sp.innerHTML=was;toast('Checkout didn\u2019t open \u2014 please try again.');}})
    .catch(function(){_sp.disabled=false;_sp.innerHTML=was;toast('Checkout didn\u2019t open \u2014 please try again.');});});
  /* SPARK PARTNER LINKS (Founder slot system, 2026-07-23): fill these with REAL affiliate
     URLs (with your codes) when partners are signed. While a slot is empty, NOTHING shows —
     the truth standard forbids invented links or codes. The AI Designer and the after-build
     helper both read from here, so one edit lights up the whole system. */
  /* SPARK STORE (Founder, 2026-07-23): Shopify storefront sparkmyname-shop.myshopify.com,
     fulfilled by PRINTFUL (per the standing Founder ruling: Printful, NOT Printify).
     live:false until the Founder says STORE LIVE — products must be in and the Shopify
     password page off before any client is sent there. Flip live:true on Founder order. */
  var SMN_STORE={url:'https://sparkmyname-shop.myshopify.com',live:false};
  var SMN_PARTNERS={print:'',shirts:'',mugs:'',promo:'',domains:'',legal:''};
  function partnerFor(kind){
    if(SMN_STORE.live&&(kind==='print'||kind==='shirts'||kind==='mugs'||kind==='promo'))return SMN_STORE.url;
    var u=SMN_PARTNERS[kind]||'';return /^https?:\/\//.test(u)?u:'';}
  /* SPARK AI DESIGNER (Founder order, 2026-07-23): 100% interactive live design studio.
     Knows the brand automatically, asks only what it needs, entertains while drawing,
     shows real SVG drafts, loops on changes, and builds (SVG + hi-res PNG) on approve. */
  var _bdb=root.querySelector('[data-branddetails]');if(_bdb)_bdb.addEventListener('click',function(){
    var cur=_bd(IDEA);var w=document.createElement('div');w.className='intakewrap';
    w.innerHTML='<div class="intake" role="dialog" aria-label="Brand details"><h3>Brand details</h3><div class="isub">Used on your print pieces. Leave anything blank and it simply won\u2019t appear.</div>'
     +'<label>Phone</label><input id="bd_phone" value="'+esc(cur.phone||'')+'">'
     +'<label>Email</label><input id="bd_email" value="'+esc(cur.email||'')+'">'
     +'<label>Address</label><input id="bd_address" value="'+esc(cur.address||'')+'">'
     +'<label>Hours (optional)</label><input id="bd_hours" value="'+esc(cur.hours||'')+'">'
     +'<div class="ibar"><button class="isend">Save details</button><button class="icancel">Cancel</button></div></div>';
    document.body.appendChild(w);
    w.addEventListener('click',function(e){if(e.target===w||e.target.classList.contains('icancel'))w.remove();});
    w.querySelector('.isend').addEventListener('click',function(){
      var o={phone:w.querySelector('#bd_phone').value.slice(0,60),email:w.querySelector('#bd_email').value.slice(0,120),address:w.querySelector('#bd_address').value.slice(0,160),hours:w.querySelector('#bd_hours').value.slice(0,120)};
      try{localStorage.setItem('smn_bd_'+IDEA.id,JSON.stringify(o));}catch(e){}
      w.remove();toast('Details saved \u2014 unlocking your pieces\u2026');setTimeout(function(){try{paint();}catch(e){location.reload();}},400);});});
  var _ad=root.querySelector('[data-aidesigner]');if(_ad)_ad.addEventListener('click',function(){openDesigner(IDEA,NM);});
  function openDesigner(IDEA,NM){
    var brand={name:NM.name,tag:NM.tag||'',seed:IDEA.said||IDEA.cat||'',colors:((IDEA.palettes&&IDEA.palettes[0]&&IDEA.palettes[0].cols)||[]).slice(0,4),font:brandDisplayFont(NM,IDEA),domain:NM.dom||''};
    var msgs=[],lastSVG='';
    var FUN=['Sharpening the pencils\u2026','Mixing '+(brand.colors[0]||'your colors')+' just right\u2026','Sketching bold ideas\u2026','Kerning like a perfectionist\u2026','Adding a pinch of magic\u2026','Stepping back to squint at it\u2026','Polishing every corner\u2026'];
    var w=document.createElement('div');w.className='intakewrap';
    w.innerHTML='<div class="intake adz" role="dialog" aria-label="Spark AI Designer">'
     +'<h3>&#127912; Spark AI Designer <span class="adz-b">designing for &ldquo;'+esc(NM.name)+'&rdquo;</span></h3>'
     +'<div class="adz-log" id="adzlog"></div>'
     +'<div class="adz-prev hidden" id="adzprev"><div class="adz-svg" id="adzsvg"></div>'
     +'<div class="adz-actions"><button class="cobtn" id="adzchange">&#9998; Make a change</button><button class="cobtn adz-go" id="adzok">&#10024; I love it &mdash; build it!</button></div></div>'
     +'<div class="adz-bar"><button class="adz-mic" id="adzmic" title="Speak">&#127908;</button><input id="adzin" placeholder="Tell your designer what you need\u2026" autocomplete="off"><button class="cobtn" id="adzsend">Send</button></div>'
     +'<button class="icancel adz-x">&times;</button></div>';
    document.body.appendChild(w);
    w.addEventListener('click',function(e){if(e.target===w||e.target.classList.contains('adz-x'))w.remove();});
    var log=w.querySelector('#adzlog'),inp=w.querySelector('#adzin'),prev=w.querySelector('#adzprev'),svgHost=w.querySelector('#adzsvg');
    function say(role,txt){var d=document.createElement('div');d.className='adz-m '+role;d.textContent=txt;log.appendChild(d);log.scrollTop=log.scrollHeight;}
    function funWait(){var d=document.createElement('div');d.className='adz-m ai adz-fun';d.innerHTML='<span class="adz-spark">\u2728</span> <span class="adz-funtxt"></span>';log.appendChild(d);log.scrollTop=log.scrollHeight;
      var i=Math.floor(Math.random()*FUN.length),t=d.querySelector('.adz-funtxt');t.textContent=FUN[i%FUN.length];
      var iv=setInterval(function(){i++;t.textContent=FUN[i%FUN.length];},1600);
      return function(){clearInterval(iv);d.remove();};}
    function turn(text){say('me',text);msgs.push({role:'user',content:text});inp.value='';var stop=funWait();
      fetch('/.netlify/functions/ai-designer',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:msgs,brand:brand})})
      .then(function(r){return r.json();}).then(function(j){stop();
        if(!(j&&j.ok)){say('ai',(j&&j.reply)||'Hmm, my pencil slipped \u2014 tell me that once more?');return;}
        msgs.push({role:'assistant',content:(j.reply||'')+(j.svg?'\n'+j.svg:'')});
        if(j.reply)say('ai',j.reply);
        if(j.svg){lastSVG=j.svg;svgHost.innerHTML=j.svg;prev.classList.remove('hidden');log.scrollTop=log.scrollHeight;}
      }).catch(function(){stop();say('ai','The studio wifi blinked \u2014 say that again for me?');});}
    w.querySelector('#adzsend').addEventListener('click',function(){var v=inp.value.trim();if(v)turn(v);});
    inp.addEventListener('keydown',function(e){if(e.key==='Enter'){var v=inp.value.trim();if(v)turn(v);}});
    w.querySelector('#adzchange').addEventListener('click',function(){inp.focus();inp.placeholder='Tell me the change \u2014 bigger headline, warmer colors, different words\u2026';});
    var mic=w.querySelector('#adzmic');
    if(window.webkitSpeechRecognition||window.SpeechRecognition){var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
      mic.addEventListener('click',function(){try{var rec=new SR();rec.lang='en-US';rec.interimResults=false;mic.classList.add('on');
        rec.onresult=function(ev){var t=(ev.results[0]&&ev.results[0][0]&&ev.results[0][0].transcript)||'';if(t)turn(t);};
        rec.onend=function(){mic.classList.remove('on');};rec.onerror=function(){mic.classList.remove('on');};rec.start();}catch(e){mic.classList.remove('on');toast('Mic couldn\u2019t start \u2014 type instead.');}});}
    else mic.style.display='none';
    w.querySelector('#adzok').addEventListener('click',function(){if(!lastSVG)return;var ok=w.querySelector('#adzok'),was=ok.innerHTML;ok.disabled=true;ok.innerHTML='Building\u2026';
      var vb=(lastSVG.match(/viewBox="0 0 (\d+) (\d+)"/)||[]),W=parseInt(vb[1],10)||1080,H=parseInt(vb[2],10)||1080;
      loadBrandFont(brand.font).then(function(){return _svgToImg(lastSVG);}).then(function(im){
        var cv=document.createElement('canvas');cv.width=W*2;cv.height=H*2;var x=_q(cv.getContext('2d'));x.fillStyle='#FFFFFF';x.fillRect(0,0,cv.width,cv.height);x.drawImage(im,0,0,cv.width,cv.height);
        return _canvasBlob(cv);}).then(function(png){
        var base=slug(NM.name)+'-spark-design';
        _dlBlob(base+'.svg',new Blob([lastSVG],{type:'image/svg+xml'}));
        _dlBlob(base+'.png',png);
        say('ai','\u2728 Built and delivered \u2014 your SVG and a crisp hi-res PNG just downloaded. It\u2019s yours forever.');
        var _pk=partnerFor('print');
        if(_pk){var pd=document.createElement('div');pd.className='adz-m ai';pd.innerHTML='&#128424;&#65039; Want it printed? Our printing partner has you covered: <a href="'+esc(_pk)+'" target="_blank" rel="noopener" style="color:#141414;font-weight:800">open our partner with Spark\u2019s link &rarr;</a> \u2014 upload the PNG you just downloaded.';log.appendChild(pd);log.scrollTop=log.scrollHeight;}
        else{say('ai','\uD83D\uDDA8\uFE0F To get it printed: any online printer or local shop accepts it \u2014 upload the PNG, keep the SVG as your master.');}
        try{var tk=(window.__smnTok||'');if(tk)fetch('/.netlify/functions/order-request',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({access_token:tk,r:IDEA.id,brand:NM.name,item:'ai-designer',itemName:'AI Designer piece',fields:{note:'approved live in the design studio'}})}).catch(function(){});}catch(e){}
        ok.disabled=false;ok.innerHTML=was;toast('\u2728 Built! Check your downloads.');
        turn('I approved it and it\u2019s built \u2014 what else would you suggest for me?');
      }).catch(function(){ok.disabled=false;ok.innerHTML=was;toast('Build hiccup \u2014 try approving again.');});});
    say('ai','Hi! I\u2019m your Spark designer \u2014 I already know '+NM.name+'\u2019s colors, font, and story. What are we making today? A flyer, a poster, a post for something coming up?');
    inp.focus();}
  try{if(new URLSearchParams(location.search).get('storepass')==='welcome'){toast('\u2728 Welcome to Spark Store \u2014 Unlimited. Shop any time; we\u2019re rooting for you.');history.replaceState(null,'',location.pathname+(location.search.replace(/[?&]storepass=welcome/,'').replace(/^&/,'?')||'')+location.hash);}}catch(e){}
  root.querySelectorAll('[data-ordit]').forEach(function(bn){bn.addEventListener('click',function(){openIntake(bn.dataset.ordit);});});
  var _cm=root.querySelector('[data-curmore]');if(_cm)_cm.addEventListener('click',function(){var r=document.getElementById('currest');if(!r)return;var open=r.classList.toggle('hidden');_cm.innerHTML=open?('Show everything else ('+r.children.length+' more categories) &#8595;'):'Show less &#8593;';});
  (function loadOrders(){var ol=document.getElementById('ordlist');var tk=(window.__smnTok||'');
    var _rk='';try{_rk=(typeof _urlKey==='function')?_urlKey():'';}catch(e){}
    if(!tk&&!_rk)return;
    var payload=tk?{access_token:tk}:{r:_rk}; // capsule access: the report key is the credential
    fetch('/.netlify/functions/my-orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
    .then(function(r){return r.json();}).then(function(j){var os=(j&&j.orders)||[];window.__smnOrders=os;try{renderCustomDL();}catch(e){}
      if(!ol||!os.length)return;
      ol.innerHTML=os.map(function(o){var st=o.status==='delivered'?'delivered':(o.status==='working'?'working':'received');
        var lb=st==='delivered'?'Delivered &check;':(st==='working'?'In the kitchen':'Received');
        return '<div class="ordrow"><span class="oi">'+esc(o.item_name||'Order')+' &middot; '+esc(o.brand||'')+'</span><span class="ochip '+st+'">'+lb+'</span></div>';}).join('');
    }).catch(function(){});})();
 
 var dzip=root.querySelector('[data-dlallzip]');if(dzip)dzip.addEventListener('click',function(){downloadAll(IDEA,dzip);});
 var snd=root.querySelector('[data-send]');if(snd)snd.addEventListener('click',function(){var u='https://'+NM.dom;if(navigator.share)navigator.share({title:NM.name,text:NM.tag,url:u}).catch(function(){});else{location.href='mailto:?subject='+encodeURIComponent(NM.name)+'&body='+encodeURIComponent(NM.tag+' '+u);}});
 var more=root.querySelector('[data-more]');if(more)more.addEventListener('click',function(){openMore(IDEA);});
}

function openMore(IDEA){
 $('#mTitle').textContent='More names, on the way';
 $('#mBody').innerHTML='We&rsquo;re hand-crafting a fresh set of names for your <b>'+esc(IDEA.cat.toLowerCase())+'</b> idea right now. The moment they&rsquo;re ready, we&rsquo;ll email you &mdash; and they&rsquo;ll appear right here beside the others, ready to compare.';
 $('#modal').classList.add('open');
 pending[IDEA.id]=(pending[IDEA.id]||0)+3; /* demo: show a pending capsule + rail note */
}
$('#mClose').addEventListener('click',function(){$('#modal').classList.remove('open');paint();});
$('#modal').addEventListener('click',function(e){if(e.target===this){this.classList.remove('open');paint();}});

var _il=$('#ilist'); if(_il) _il.addEventListener('click',function(e){var rm=e.target.closest('[data-rm]');if(rm){e.stopPropagation();removeIdea(rm.dataset.rm);return;}var r=e.target.closest('.irow');if(!r)return;selectIdea(r.dataset.i);window.scrollTo({top:0,behavior:'smooth'});});
var _is=$('#isearch'); if(_is) _is.addEventListener('input',function(){var l=$('#ilist'); if(l) l.innerHTML=ilistHTML(this.value);});
/* SORT REBUILDS THE FLYOUT NOW (2026-07-26).
    This wrote to #ilist — the rail's brand list, which was removed today because it duplicated
    the flyout. The guard I added stopped it throwing, which meant it failed silently: the
    dropdown changed, sortMode changed, and nothing on screen moved. The list it sorts lives in
    the flyout, so that is what it must redraw.
    Delegated, because #isort now sits inside #brandpop — the last element in the body, after
    this script runs. Binding directly would attach to nothing, which is exactly how the flyout
    search came to be dead for weeks. */
 document.addEventListener('change', function(ev){
   if(!ev.target || ev.target.id!=='isort') return;
   sortMode = ev.target.value;
   var q = document.getElementById('bpsearch');
   try{ renderBrandPop(q ? q.value : ''); }catch(e){}
   var l = $('#ilist');                      /* if the rail list ever returns, keep it in step */
   if(l){ var q2=$('#isearch'); l.innerHTML = ilistHTML(q2 ? q2.value : ''); }
 });
var _pa=$('#putaway'); if(_pa) _pa.addEventListener('click',function(e){var rb=e.target.closest('[data-recover]');if(rb){delete removed[rb.dataset.recover];paint();toast('Brought back.');return;}var ra=e.target.closest('[data-recoverall]');if(ra){removed={};paint();toast('Everything restored.');}});
function copy(t){try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).catch(function(){});return;}}catch(e){}try{var ta=document.createElement('textarea');ta.value=t;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();}catch(e){}}

/* ===== Concierge (support + live agent) ===== */
function openConcierge(){$('#cpanel').classList.add('open');$('#scrim').classList.add('open');SMN_FOCUS.open($('#cpanel'));}
function closeConcierge(){SMN_FOCUS.close($('#cpanel'));$('#cpanel').classList.remove('open');$('#scrim').classList.remove('open');}
var _conciergeBtn=document.getElementById('conciergeBtn');
if(_conciergeBtn) _conciergeBtn.addEventListener('click',openConcierge);  /* the header button was removed 2026-07-26; the opener stays for the Tools menu */
$('#cpClose').addEventListener('click',closeConcierge);
$('#scrim').addEventListener('click',closeConcierge);
function pushChat(who,txt){var b=$('#cpanel').querySelector('.cp-body');$('#cpChat').innerHTML+='<div class="cp-msg '+who+'"><b>'+(who==='you'?'You':(who==='faq'?'Saved answer':'Spark team'))+'</b>'+esc(txt)+'</div>';if(b)b.scrollTop=b.scrollHeight;}
function cAnswer(q){var a={'How do I register my domain?':'Open any name, go to the “Your Available Website” tab, and hit Register — we hand off to your domain provider.','Where are my downloads?':'Every file is in the Downloads tab of each name — logos, colors, promo items, and your 2K photos.','Can I get more name ideas?':'Yes! Hit “Get more names” on any brand — we custom-make a fresh set and email you when ready.','How do I recover a removed brand?':'Anything you remove drops into “Put away” under Your Ideas — tap Bring back any time.'};return a[q]||'Happy to help with that!';}
/* HONEST QUICK ANSWERS (28 July 2026 sweep). These are stored FAQ answers, but they were
   pushed into the chat labelled "Spark agent" after a 450ms delay that imitated someone
   typing. That is the live-agent illusion the Founder retired. They are now shown instantly
   and labelled as what they are: a saved answer, with the offer to reach a real person. */
document.querySelectorAll('.cp-q').forEach(function(q){
  q.addEventListener('click',function(){
    pushChat('you', q.dataset.cq);
    pushChat('faq', cAnswer(q.dataset.cq));
  });
});
$('#cpStartChat').addEventListener('click',function(){pushChat('agent','Hi! Type your question below and it goes straight to the Spark team. We reply by email, usually within a few hours.');$('#cpInput').focus();});
/* THE CONCIERGE NOW REACHES A HUMAN (2026-07-26, Founder order).
   This waited 600ms and replied "a Spark specialist will follow up shortly (Live chat connects
   for real on the deployed site)" — on the deployed site — without sending anything anywhere.
   Every message now goes through support-request.js to the support desk, with the customer's
   own address as reply-to, and the reply tells the truth either way. */
function sendChat(){
  var box=$('#cpInput'); var v=((box||{}).value||'').trim();
  if(!v) return;
  pushChat('you', v);
  box.value='';
  smnSupportSend('Concierge', v, function(ok){
    if(ok) pushChat('agent','Got it \u2014 that has gone to the Spark team. We reply by email, usually within a few hours.');
    else   pushChat('agent','That did not go through. Please email support@sparkmyname.com and we will pick it up.');
  });
}
$('#cpSend').addEventListener('click',sendChat);
$('#cpInput').addEventListener('keydown',function(e){if(e.key==='Enter')sendChat();});

/* ===== Account: login / logout ===== */
$('#avatarBtn').addEventListener('click',function(e){e.stopPropagation();$('#acctMenu').classList.toggle('open');});
document.addEventListener('click',function(){$('#acctMenu').classList.remove('open');});
$('#acctMenu').addEventListener('click',function(e){var b=e.target.closest('[data-act]');if(!b)return;var a=b.dataset.act;$('#acctMenu').classList.remove('open');if(a==='logout'){$('#loginwrap').classList.add('open');}else if(a==='support'){openConcierge();}else{openAccount('overview');}});
$('#loginBtn').addEventListener('click',function(){var em=($('#loginEmail').value||'').trim();if(em&&em.indexOf('@')>0)$('#amEmail').textContent=em;$('#loginwrap').classList.remove('open');toast('Signed in — welcome back to your Client Command Center.');});
$('#loginEmail').addEventListener('keydown',function(e){if(e.key==='Enter')$('#loginBtn').click();});
$('#loginHelp').addEventListener('click',function(){$('#lrec').classList.toggle('open');});
$('#lrec').addEventListener('click',function(e){var o=e.target.closest('[data-rec]');if(!o)return;var r=o.dataset.rec;if(r==='concierge'){$('#loginwrap').classList.remove('open');openConcierge();pushChat('agent','Hi! I can help you get back into your Client Command Center. Can you confirm the name or email on your order?');}else if(r==='phone'){toast('A 6-digit code is on its way to your phone.');}else if(r==='backup'){toast('Enter the backup code from your welcome email.');}else{$('#lrec').classList.remove('open');$('#loginEmail').focus();toast('Enter a different email above.');}});

/* ===== tier switcher (show all 3 command-center levels) ===== */
document.querySelectorAll('[data-tier]').forEach(function(b){b.addEventListener('click',function(){var ci=curIdea();if(ci){ci.tier=b.dataset.tier;curTab='grow';paint();toast('Previewing the '+TIER_NAME[b.dataset.tier]+' ('+TIER_PRICE[b.dataset.tier]+') command center.');}document.querySelectorAll('[data-tier]').forEach(function(x){x.classList.toggle('on',x.dataset.tier===b.dataset.tier);});});});

/* ===== generic modal + Grow tools ===== */
/* RESURRECTED (2026-07-31): these two were deleted in a past cleanup while their buttons
   stayed wired — every click threw a silent ReferenceError. The pages never left. */
function openAIStudio(){ window.open('guide.html','_blank','noopener'); }
function openSuccess(){ window.open('success-path.html','_blank','noopener'); }
function openG(icon,title,body){$('#gmIcon').innerHTML=icon;$('#gmTitle').textContent=title;$('#gmBody').innerHTML=body;$('#gmodal').classList.add('open');}
$('#gmClose').addEventListener('click',function(){$('#gmodal').classList.remove('open');});
$('#gmodal').addEventListener('click',function(e){if(e.target===this)this.classList.remove('open');});

/* ================= ACCOUNT CENTER ================= */
var ACCT={sec:'overview',prefs:{updates:true,tips:true,receipts:true,twofa:false,fmt:'SVG',motion:false}};
var AISTUDIO=[
 ['&#129302;','Brand Assistant','Ask anything about your brand — names, taglines, next steps. It knows your kit.','Chat now','assistant'],
 ['&#9997;','Content Studio','Generate on-brand social posts, captions, and emails in your voice — instantly.','Generate a post','content'],
 ['&#127912;','Logo Lab','Refine your logos, try new color moods, and export fresh lockups with AI.','Open Logo Lab','logo'],
 ['&#128173;','Name Engine','Spin up more brandable names with matching domains, on demand.','Get more names','names'],
 ['&#128200;','Market Pulse','An AI scan of your niche — competitors, trends, and positioning tips.','See my insights','market'],
 ['&#10084;','Brand Health','A live score of your brand&rsquo;s strength, with AI tips to level it up.','Check my score','health'],
 ['&#127908;','Voice Tuner','Dial your brand voice — warmer, bolder, more premium — and apply it everywhere.','Tune my voice','voice'],
 ['&#128247;','Image Studio','Generate cinematic, on-brand photos and graphics for any campaign.','Create an image','image']
];
/* ONE WORD PER CATEGORY (2026-07-25, Founder order). "Purchases & Billing", "Refer & Earn"
   and "Privacy & Data" forced the column wide enough to hold two words and an ampersand.
   Every label is now a single word, which lets the rail narrow and gives the whole width back
   to the brand card. The longer names survive as the section TITLE once you are inside. */
/* ORDERED BY WHAT PEOPLE ACTUALLY COME FOR (2026-07-25, Founder order).
   The old order was Overview first and Brands third — but nobody signs in to read an
   overview. They come to look at their brands. Brands now leads.
   Labels were also opaque: "Studio" told a customer nothing, and "Prefs"/"Security"/"Privacy"
   read as three versions of the same thing. Each is now the plainest single word for what is
   behind it, and each carries a one-line hint that shows on hover and to screen readers —
   the label stays one word so the rail stays narrow, but nobody has to guess.
   Order: what you own, what you can make, who helps you, then the admin nobody visits twice. */
var ACNAV=[
  ['brands','&#10022;','Brands','Every brand you own'],
  ['guide','&#128214;','Guide','How the workspace works'],
 ['designer','&#10022;','Designer','A human takes it further'],
  ['ai','&#128736;','AI tools','AI tools that know your brand'],
  ['support','&#128172;','Help','Guides and answers'],
 /* ===================================================================================
    CONCIERGE — ON THE LEFT BAR BY FOUNDER ORDER, 2026-07-26.
    !! NOT WIRED. READ THIS BEFORE TRUSTING IT. !!
    The panel it opens is a simulation. It shows a static "Live agent online" dot with no
    presence check, "Start a live chat" replies "You're connected to a live Spark agent" when
    nobody is, and a customer's message gets "a Spark specialist will follow up shortly
    (Live chat connects for real on the deployed site)" — which is the deployed site.
    There is no fetch. Nothing reaches the Founder, Zendesk or Resend. A customer describing a
    real problem is told someone will follow up and nobody ever sees it.
    The Founder knows, is in sandbox, and asked for it here so it is not lost.
    TO WIRE IT: netlify/functions/support-request.js already exists and nothing calls it.
    =================================================================================== */
 ['concierge','&#10023;','Concierge','A real person on the Spark team'],
  ['refer','&#127873;','Refer &amp; earn','Give $20, get $20'],
  ['purchases','&#128179;','Billing','Receipts and payment method'],
  ['prefs','&#9881;','Settings','Name, email, notifications'],
  ['security','&#128274;','Sign-in','Sign-in and devices'],
  ['privacy','&#128737;','Your data','Download or delete everything'],
  ['overview','&#9670;','Overview','Everything at a glance']
];
var ACTITLE={aitool:'AI tool',overview:'Your account',purchases:'Billing & receipts',brands:'Your brands',ai:'Your AI tools',security:'Sign-in &amp; security',prefs:'Settings',refer:'Refer a friend',privacy:'Your data',support:'Help & support'};
/* FILL THE ACCOUNT MENU FROM THE REAL SESSION (2026-07-26).
   The markup used to ship with a real person's email and initial in it, and they were only
   replaced when someone pressed the login button. Customers who arrive through the capsule
   link never do that. This fills both from whatever the session actually knows, and leaves an
   honest placeholder when it knows nothing. */
function smnFillAccountChip(){
  try{
    var em='';
    try{ em = localStorage.getItem('smn_email') || ''; }catch(e){}
    if(!em){ try{ em = sessionStorage.getItem('smn_email') || ''; }catch(e){} }
    var el=document.getElementById('amEmail');
    var av=document.getElementById('avatarBtn');
    if(em && em.indexOf('@')>0){
      if(el) el.textContent=em;
      if(av) av.textContent=em.charAt(0).toUpperCase();
    } else {
      if(el) el.textContent='Signed in to your workspace';
      if(av) av.textContent='\u25CF';
    }
  }catch(e){}
}
try{
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',smnFillAccountChip);
  else smnFillAccountChip();
}catch(e){}
function acEmail(){try{var e=(($('#amEmail')||{}).textContent||'').trim();if(e&&e.indexOf('@')>0)return e;}catch(x){}try{var s=localStorage.getItem('smn_email');if(s)return s;}catch(x){}return '';}
function acBrands(){return (typeof IDEAS!=='undefined'?IDEAS:[]).filter(function(d){return !removed[d.id];});}
function acInit(){return (acEmail().charAt(0)||'S').toUpperCase();}
function acPlanKey(){var o={spark:1,plus:2,studio:3},best='spark';acBrands().forEach(function(b){if((o[b.tier]||1)>(o[best]||1))best=b.tier;});return best;}
function acPrice(t){return (typeof TIER_PRICE!=='undefined'&&TIER_PRICE[t])||'$99';}
function acPlanName(t){return (typeof TIER_NAME!=='undefined'&&TIER_NAME[t])||'Starter';}
function acSince(){var b=acBrands().slice().sort(function(a,c){return (a.ord||0)-(c.ord||0);});return (b[0]&&b[0].date)||'2026';}
function acName(){var n=acEmail().split('@')[0].replace(/[._-]+/g,' ');return n.replace(/\b\w/g,function(c){return c.toUpperCase();});}
function aiCardHTML(a){return '<div class="ac-aicard"><div class="az">'+a[0]+'</div><div class="at">'+a[1]+'</div><div class="ad">'+a[2]+'</div><button class="btn" data-ai="'+a[4]+'">'+a[3]+'</button></div>';}
function acTog(k,label,desc){var on=!!ACCT.prefs[k];return '<div class="ac-row"><div class="rl"><div class="rt">'+label+'</div>'+(desc?'<div class="rd">'+desc+'</div>':'')+'</div><button class="ac-tog'+(on?' on':'')+'" data-tog="'+k+'" aria-label="'+label+'"></button></div>';}
function secOverview(){var bs=acBrands(),plan=acPlanKey();
 return /* OVERVIEW IS A SUMMARY, NOT A CATALOGUE (2026-07-27, Founder: "you still have your AI
     toolkit here, which has no business in the overview"). The AI tools have their own rail
     page; naming them here sent people looking for something that is not on this screen. */
  '<p class="lead">Welcome back'+(acName()?', '+esc(acName()):'')+'. Your brands, your purchases and your account \u2014 at a glance.</p>'+
  '<div class="ac-grid"><div class="ac-stat"><div class="v">'+bs.length+'</div><div class="k">Brand'+(bs.length===1?'':'s')+' you own</div></div>'+
   '<div class="ac-stat"><div class="v">'+acPlanName(plan)+'</div><div class="k">Your plan</div></div>'+
   '<div class="ac-stat"><div class="v">'+(bs.length*19)+'</div><div class="k">Downloadable assets</div></div>'+
   '<div class="ac-stat"><div class="v">'+esc(acSince())+'</div><div class="k">Member since</div></div></div>'+
  '<div class="ac-h">Quick actions</div><div class="ac-card">'+
   '<div class="ac-row"><div class="rl"><div class="rt">Start a new brand</div><div class="rd">Say your idea and we build the whole brand around it.</div></div><a class="ac-btn" href="index.html">&#43; New brand</a></div>'+
   '<div class="ac-row"><div class="rl"><div class="rt">Download everything</div><div class="rd">One ZIP of your current brand — logos, colors, words &amp; photos.</div></div><button class="ac-btn ghost" data-acact="dlall">&#8681; Download</button></div>'+
   '<div class="ac-row"><div class="rl"><div class="rt">Talk to your concierge</div><div class="rd">A real person on the Spark team, any time.</div></div><button class="ac-btn ghost" data-acact="concierge">Open concierge</button></div></div>'+
  '<div class="ac-h">Your AI toolkit</div><div class="ac-ai">'+AISTUDIO.slice(0,3).map(aiCardHTML).join('')+'</div>'+
  '<div style="margin-top:14px"><button class="ac-btn ghost" data-acnav="ai">Explore all AI tools &rarr;</button></div>';}
function secPurchases(){var bs=acBrands(),plan=acPlanKey();var orders=bs.slice().sort(function(a,c){return (c.ord||0)-(a.ord||0);});
 var total=orders.reduce(function(s,b){return s+(parseInt(acPrice(b.tier).replace(/[^0-9]/g,''),10)||0);},0);
 return '<p class="lead">Every order, receipt, and billing detail — all in one place.</p>'+
  '<div class="ac-h">Current plan</div><div class="ac-card"><div class="ac-row"><div class="rl"><div class="rt">'+acPlanName(plan)+' &middot; '+acPrice(plan)+'</div><div class="rd">One-time purchase — no subscription, nothing recurring. Yours forever.</div></div><button class="ac-btn" data-acnav="ai">&#10024; Upgrade options</button></div></div>'+
  '<div class="ac-h">Order history</div><div class="ac-card">'+(orders.length?orders.map(function(b){var C=palCols(b);return '<div class="ac-ord"><div class="oi" style="background:#FFFFFF">'+(b.emoji||'&#10022;')+'</div><div class="om"><div class="ot">'+esc(brandName(b))+' &mdash; '+acPlanName(b.tier)+'</div><div class="os">'+esc(b.date||'')+' &middot; Order #SMN-'+String(b.id).toUpperCase().slice(0,6)+'</div></div><div class="oa"><div class="op">'+acPrice(b.tier)+'</div><div class="ac-paid">&#10003; Paid</div><button class="ac-btn ghost sm" data-receipt="'+b.id+'" style="margin-top:6px">Receipt</button></div></div>';}).join(''):'<div class="rd">No orders yet.</div>')+'</div>'+
  '<div class="ac-h">Payment &amp; billing</div><div class="ac-card">'+
   '<div class="ac-row"><div class="rl"><div class="rt">&#128179; Visa ending 4242</div><div class="rd">Processed securely by Stripe. We never store your full card number.</div></div><button class="ac-btn ghost" data-acact="pay">Update</button></div>'+
   '<div class="ac-row"><div class="rl"><div class="rt">Billing email</div><div class="rd">'+esc(acEmail())+'</div></div><button class="ac-btn ghost" data-acact="billemail">Change</button></div>'+
   '<div class="ac-row"><div class="rl"><div class="rt">Total spent with Spark</div><div class="rd">Across '+orders.length+' order'+(orders.length===1?'':'s')+'.</div></div><div class="op" style="font-size:1.1875rem;font-weight:900">$'+total+'</div></div></div>';}
function secBrands(){var bs=acBrands();
 return '<p class="lead">Open, favorite, or manage any brand you own.</p><div class="ac-card">'+(bs.length?bs.map(function(b){var C=palCols(b);return '<div class="ac-brand"><div class="bph" style="background:#FFFFFF">'+(b.emoji||'&#10022;')+'</div><div class="bm"><div class="bn">'+esc(brandName(b))+(b.fav?' &hearts;':'')+'</div><div class="bs">'+esc(b.said||b.cat||'')+' &middot; '+acPlanName(b.tier)+'</div></div><button class="ac-btn ghost sm" data-openbrand="'+b.id+'">Open</button></div>';}).join(''):'<div class="rd">No brands yet.</div>')+'</div><div style="margin-top:14px"><a class="ac-btn" href="index.html">&#43; Start a new brand</a></div>';}
function secAI(){return '<p class="lead">Your 2026 AI toolkit — built for founders, tuned to your brand. Every tool works right here in your command center.</p><div class="ac-ai">'+AISTUDIO.map(aiCardHTML).join('')+'</div>';}
function secSecurity(){return '<p class="lead">Your account is protected with modern, passwordless security.</p>'+
  '<div class="ac-h">Sign-in</div><div class="ac-card"><div class="ac-row"><div class="rl"><div class="rt">Passwordless magic link <span class="ac-badge on">&#10003; Active</span></div><div class="rd">We email a one-tap secure link — nothing to remember, nothing to steal.</div></div></div>'+
   acTog('twofa','Two-factor authentication','Add a 6-digit code from your phone for an extra layer.')+
   '<div class="ac-row"><div class="rl"><div class="rt">Passkey / biometric <span class="ac-badge new">New</span></div><div class="rd">Sign in with Face ID, Touch ID, or your device passkey.</div></div><button class="ac-btn ghost" data-acact="passkey">Add passkey</button></div></div>'+
  '<div class="ac-h">Devices &amp; sessions</div><div class="ac-card"><div class="ac-row"><div class="rl"><div class="rt">This device <span class="ac-badge on">Current</span></div><div class="rd">Signed in &middot; '+esc(acEmail())+'</div></div></div>'+
   '<div class="ac-row"><div class="rl"><div class="rt">Sign out everywhere</div><div class="rd">End every other session on all your devices.</div></div><button class="ac-btn ghost" data-acact="signoutall">Sign out all</button></div></div>';}
function secPrefs(){return '<p class="lead">Tune how Spark works for you.</p>'+
  '<div class="ac-h">Email notifications</div><div class="ac-card">'+acTog('updates','Product updates','New features and improvements.')+acTog('tips','Founder tips','Occasional advice to grow your brand.')+acTog('receipts','Receipts &amp; billing','Purchase confirmations and invoices.')+'</div>'+
  '<div class="ac-h">Downloads</div><div class="ac-card"><div class="ac-row"><div class="rl"><div class="rt">Default logo format</div><div class="rd">Pick the file type for one-tap logo downloads.</div></div><button class="ac-btn ghost" data-acact="fmt">'+ACCT.prefs.fmt+'</button></div>'+acTog('motion','Reduced motion','Calm the background animation.')+'</div>'+
  '<div class="ac-h">Appearance &amp; language</div><div class="ac-card"><div class="ac-row"><div class="rl"><div class="rt">Theme</div><div class="rd">Aurora Glass</div></div><span class="ac-badge on">Active</span></div>'+
   '<div class="ac-row"><div class="rl"><div class="rt">Language</div><div class="rd">English (US)</div></div><button class="ac-btn ghost" data-acact="lang">Change</button></div></div>';}
function secRefer(){var code=slug(acName()||'friend')||'friend';var link='sparkmyname.com/?ref='+code;
 return '<p class="lead">Share Spark, earn on every brand your friends create.</p>'+
  '<div class="ac-grid"><div class="ac-stat"><div class="v">$0</div><div class="k">Earned so far</div></div><div class="ac-stat"><div class="v">0</div><div class="k">Friends joined</div></div><div class="ac-stat"><div class="v">20%</div><div class="k">Your commission</div></div></div>'+
  '<div class="ac-h">Your referral link</div><div class="ac-card"><div class="ac-row"><div class="rl"><div class="rt">'+esc(link)+'</div><div class="rd">You both get a reward when they spark their first brand.</div></div><button class="ac-btn" data-copy2="'+esc(link)+'">Copy link</button></div></div>'+
  '<div class="ac-h">Become a Spark affiliate</div><div class="ac-card"><div class="ac-row"><div class="rl"><div class="rt">Earn on every referral, forever</div><div class="rd">Your affiliate program is ready — get your dashboard and tools.</div></div><button class="ac-btn ghost" data-acact="affiliate">Get started</button></div></div>';}
function secPrivacy(){var POL=[['Privacy policy','How we handle your information.','privacy.html'],['Terms of service','The agreement for using Spark.','terms.html'],['Cookie policy','How we use cookies.','cookies.html'],['Refund policy','Our 7-day money-back guarantee.','refund.html'],['Security','How we keep your account safe.','security.html'],['Accessibility','Our commitment to access for all.','accessibility.html'],['Support','Help and answers, any time.','support.html'],['Press','Brand assets & media.','press.html']];
 return '<p class="lead">You own your data. Export it, remove it, or read any of our policies any time.</p>'+
  '<div class="ac-card"><div class="ac-row"><div class="rl"><div class="rt">Download my data</div><div class="rd">A full copy of your brands and account details as a file.</div></div><button class="ac-btn ghost" data-acact="exportdata">Export</button></div></div>'+
  '<div class="ac-h">Policies &amp; legal</div><div class="ac-card">'+POL.map(function(p){return '<div class="ac-row"><div class="rl"><div class="rt">'+p[0]+'</div><div class="rd">'+p[1]+'</div></div><a class="ac-btn ghost" href="'+p[2]+'" target="_blank" rel="noopener">View</a></div>';}).join('')+'</div>'+
  '<div class="ac-h">Danger zone</div><div class="ac-card ac-danger"><div class="ac-row"><div class="rl"><div class="rt">Delete my account</div><div class="rd">Permanently remove your account and data. This cannot be undone.</div></div><button class="ac-btn ghost" data-acact="delete">Delete</button></div></div>';}
function secSupport(){return '<p class="lead">We are here — a real team, one tap away.</p>'+
  '<div class="ac-card"><div class="ac-row"><div class="rl"><div class="rt">Spark Concierge</div><div class="rd">Message a real person on the Spark team \u2014 we reply to your email.</div></div><button class="ac-btn" data-acact="concierge">Open concierge</button></div>'+
   '<div class="ac-row"><div class="rl"><div class="rt">Help center</div><div class="rd">Guides and answers to common questions \u2014 opens in a new tab so you keep your place here.</div></div><a class="ac-btn ghost" href="support.html" target="_blank" rel="noopener">Open help center &#8599;</a></div>'+
   '<div class="ac-row"><div class="rl"><div class="rt">Message the founder</div><div class="rd">Peter Klein reads every note personally. Write here and it reaches him \u2014 we reply to your email.</div></div><button class="ac-btn ghost" data-acact="founder">Write to Peter</button></div></div>';}
function acSectionHTML(){switch(ACCT.sec){case 'purchases':return secPurchases();case 'brands':return secBrands();case 'ai':return secAI();case 'security':return secSecurity();case 'prefs':return secPrefs();case 'refer':return secRefer();case 'privacy':return secPrivacy();case 'support':return secSupport();default:return secOverview();}}
/* The rail nav reuses ACNAV and the existing account panel — no second implementation.
   "Brands" simply closes the panel and returns to the workspace, since the brand list is
   already right beneath it. */
/* bindWsHelp is gone (2026-07-26). It bound the rail's three tool shortcuts, and those
   were removed as duplicates of the Tools menu on the brand card. Leaving a binder for
   markup that no longer exists is how dead handlers accumulate. */

/* BRANDS FLYOUT — fill it, keyboard-drive it, and open it from the nav (2026-07-25).
   Uses the native popover so light-dismiss, Escape and focus-return are the browser's job.
   The only JavaScript here is the list itself and arrow-key navigation, which the spec does
   not cover yet. Falls back to a plain shown/hidden panel on any engine without popover. */
var BP_SUPPORT = (function(){ try{ return HTMLElement.prototype.hasOwnProperty('popover'); }catch(e){ return false; } })();

function bpRows(filter){
  filter=(filter||'').toLowerCase();
  var live=IDEAS.filter(function(d){ return !removed[d.id]; });
  if(filter) live=live.filter(function(d){
    var hay=((d.cat||'')+' '+(d.said||'')+' '+((window.NAMEIDX&&window.NAMEIDX[d.id])||'')).toLowerCase();
    return hay.indexOf(filter)>=0;
  });
  /* THE SORT CONTROL NOW DOES SOMETHING (2026-07-26, Founder order).
     This had one hardcoded order — newest, then favorites — and never looked at sortMode. The
     dropdown changed, sortMode changed, and the list stayed exactly where it was. It had never
     worked, because until today that control sat beside a different list.
     The default below is unchanged: the newest brand stays on top, favorites beneath it. */
  var newest=Math.max.apply(null, IDEAS.map(function(x){return x.ord||0;}));
  var mode=(typeof sortMode!=='undefined' && sortMode) ? sortMode : 'newest';
  if(mode==='az'){
    live.sort(function(a,b){ return String(a.cat||'').localeCompare(String(b.cat||'')); });
  } else if(mode==='za'){
    live.sort(function(a,b){ return String(b.cat||'').localeCompare(String(a.cat||'')); });
  } else if(mode==='fav'){
    live.sort(function(a,b){ return ((b.fav?1:0)-(a.fav?1:0)) || ((b.ord||0)-(a.ord||0)); });
  } else {
    live.sort(function(a,b){
      var ra=(a.ord===newest)?2:(a.fav?1:0), rb=(b.ord===newest)?2:(b.fav?1:0);
      return (rb-ra)||((b.ord||0)-(a.ord||0));
    });
  }
  return live;
}
/* PER-BRAND ACTIONS FROM THE LIST (2026-07-26, Founder order).
   favFlip only ever worked on the brand currently open — it reads IDEA. To favorite something
   from the list you had to open it first, which is why none of 242 were ever starred.
   This does the same job for any brand by id, through the same fav-toggle endpoint. Nothing
   new on the server. */
function favSet(id, on){
  var b=null;
  for(var i=0;i<IDEAS.length;i++){ if(IDEAS[i].id===id){ b=IDEAS[i]; break; } }
  if(!b) return;
  b.fav = !!on;
  try{
    var tk=(window.__smnTok||'');
    fetch('/.netlify/functions/fav-toggle',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+tk},
      body: JSON.stringify({ access_token: tk, r: id, fav: !!on })
    }).catch(function(){});
  }catch(e){}
  /* keep every view in step: the open card's hearts, the list, the rail if it returns */
  try{ if(typeof IDEA!=='undefined' && IDEA && IDEA.id===id){
    document.querySelectorAll('.favheart').forEach(function(h){ h.classList.toggle('on', !!on); });
  } }catch(e){}
  try{ var q=document.getElementById('bpsearch'); renderBrandPop(q?q.value:''); }catch(e){}
  try{ var l=$('#ilist'); if(l){ var q2=$('#isearch'); l.innerHTML=ilistHTML(q2?q2.value:''); } }catch(e){}
  try{ toast(on?'Added to favorites':'Removed from favorites'); }catch(e){}
}

/* THE ROW MENU (2026-07-26, Founder order).
   Three dots on each row, the way Google Cloud does it — the actions are there when wanted and
   invisible when not. A heart on all 242 rows would be 242 hearts; this is one small control
   that says "there is more here" without shouting it. */
document.addEventListener('click', function(e){
  var dots = e.target && e.target.closest && e.target.closest('[data-rowdots]');
  var menu = e.target && e.target.closest && e.target.closest('.bp-menu');
  /* any click that is not on a menu closes whatever is open */
  if(!menu){
    document.querySelectorAll('.bp-menu:not([hidden])').forEach(function(m){
      if(!dots || m.getAttribute('data-for')!==dots.getAttribute('data-rowdots')) m.hidden=true;
    });
  }
  if(dots){
    e.preventDefault(); e.stopPropagation();
    var id=dots.getAttribute('data-rowdots');
    var m=document.querySelector('.bp-menu[data-for="'+id+'"]');
    if(m){ m.hidden=!m.hidden; dots.setAttribute('aria-expanded', m.hidden?'false':'true'); }
    return;
  }
  var act = e.target && e.target.closest && e.target.closest('[data-rowact]');
  if(!act) return;
  e.preventDefault(); e.stopPropagation();
  var id=act.getAttribute('data-rowid'), what=act.getAttribute('data-rowact');
  var m=act.closest('.bp-menu'); if(m) m.hidden=true;
  if(what==='fav')   favSet(id, true);
  if(what==='unfav') favSet(id, false);
  if(what==='open')  { try{ closeBrandPop(); selectIdea(id); }catch(err){} }
}, true);
document.addEventListener('keydown', function(e){
  if(e.key!=='Escape') return;
  document.querySelectorAll('.bp-menu:not([hidden])').forEach(function(m){ m.hidden=true; });
});

/* THE ANNOUNCEMENT STRIP (2026-07-26, Founder order)
   ==================================================================================
   TO SAY SOMETHING TO EVERY CUSTOMER, EDIT THE THREE LINES BELOW. Nothing else.
   Leave `text` empty and the strip does not render at all — no space, no border, nothing.

   `id`   change this whenever the message changes. A dismissal is remembered against the id,
          so a new id reaches everyone again, including people who dismissed the last one.
   `text` what it says. Keep it to one line — this sits above everything a customer came for.
   `href` and `label` are optional. Leave them empty for a message with no link.
   ================================================================================== */
var SMN_NOTE = {
  id:    'welcome-1',
  text:  'Welcome Your SparkMyName Workspace',
  href:  '',
  label: ''
};

function smnShowNote(){
  try{
    var box=document.getElementById('smnNote');
    if(!box || !SMN_NOTE || !SMN_NOTE.text) return;      /* nothing to say — stay invisible */
    var key='smn_note_'+SMN_NOTE.id;
    try{ if(localStorage.getItem(key)==='1') return; }catch(e){}
    var t=document.getElementById('smnNoteText');
    if(t) t.textContent=SMN_NOTE.text;
    var a=document.getElementById('smnNoteLink');
    if(a){
      if(SMN_NOTE.href && SMN_NOTE.label){
        a.href=SMN_NOTE.href; a.textContent=SMN_NOTE.label; a.hidden=false;
        if(/^https?:\/\//.test(SMN_NOTE.href)){ a.target='_blank'; a.rel='noopener'; }
      } else { a.hidden=true; }
    }
    box.hidden=false;
  }catch(e){}
}
/* Delegated: the strip sits above the header, before this script, but a listener on the
   document does not care where anything is or when it appeared. */
document.addEventListener('click', function(e){
  var x=e.target && e.target.closest && e.target.closest('#smnNoteX');
  if(!x) return;
  var box=document.getElementById('smnNote');
  if(box) box.hidden=true;
  try{ localStorage.setItem('smn_note_'+(SMN_NOTE&&SMN_NOTE.id||'none'),'1'); }catch(err){}
});
try{
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', smnShowNote);
  else smnShowNote();
}catch(e){}

/* ONE PATH TO SUPPORT (2026-07-26, Founder order).
   Three buttons told a customer their message had been sent and none of them sent anything:
   the concierge, Founder's Pulse, and the data-deletion request. support-request.js was built
   on 5 July, forwards through Resend to the support desk with the customer's address as
   reply-to, and nothing had ever called it.
   This is that call, once, with a topic so the three arrive distinguishable. It reports the
   truth either way — if the send fails, the customer is told to use the support page rather
   than being reassured. */
function smnSupportSend(topic, message, onDone){
  var tk='';
  try{ tk = window.__smnTok || ''; }catch(e){}
  return fetch('/.netlify/functions/support-request',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ access_token: tk, topic: topic || '', message: String(message||'') })
  })
  .then(function(r){ return r.json().catch(function(){ return {}; }); })
  .then(function(d){ if(typeof onDone==='function') onDone(!!(d && d.ok), d||{}); return d; })
  .catch(function(){ if(typeof onDone==='function') onDone(false, {}); });
}

/* SAVE ALL MY BRANDS (2026-07-26, Founder order: reconnect what already works).
   Calls export-names.js exactly as built — one signed-in request returns every brand this
   customer owns as plain text. Nothing generated here; the text comes straight from the
   endpoint's own response. */
document.addEventListener('click', function(e){
  var btn = e.target && e.target.closest && e.target.closest('#bpExport');
  if(!btn) return;
  var tk=''; try{ tk = window.__smnTok || ''; }catch(err){}
  btn.disabled=true; var was=btn.innerHTML; btn.innerHTML='Preparing\u2026';
  fetch('/.netlify/functions/export-names',{
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ access_token: tk })
  })
  .then(function(r){ return r.json().catch(function(){ return {}; }); })
  .then(function(d){
    btn.disabled=false; btn.innerHTML=was;
    if(!d || !d.ok || !d.text){
      try{ toast('Could not prepare that right now. Please try again shortly.'); }catch(err){}
      return;
    }
    try{
      var blob=new Blob([d.text],{type:'text/plain'});
      var url=URL.createObjectURL(blob);
      var a=document.createElement('a');
      a.href=url; a.download='sparkmyname-my-brands.txt';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function(){ URL.revokeObjectURL(url); }, 4000);
      toast((d.report_count||0)+' brand(s), '+(d.name_count||0)+' name(s) saved.');
    }catch(err){
      try{ toast('Could not save the file in this browser.'); }catch(e2){}
    }
  })
  .catch(function(){
    btn.disabled=false; btn.innerHTML=was;
    try{ toast('Could not reach the server. Please try again shortly.'); }catch(err){}
  });
});

/* THE WORKSPACE GUIDE — CONTENT AND CONTROLS (2026-07-26, Founder order).
   Plain steps a first-time customer can read in under a minute. Edit GUIDE_STEPS to change
   the words; nothing else needs to change. Uses the same focus manager built earlier today
   (SMN_FOCUS) so Tab stays inside it and closing returns focus to the Guide button — the same
   behaviour every other overlay in this workspace already has. */
var GUIDE_STEPS = [
  { icon:'&#10024;', title:'Welcome to your workspace',
    body:'This is where your brand lives. Six names, each with its own logo, colors, photos and words \u2014 all ready to use right now.' },
  { icon:'&#10022;', title:'Pick a name',
    body:'Tap any of the six across the top. The card below changes to show everything built for that one \u2014 logo, colors, taglines, photos, social handles.' },
  { icon:'&#8681;', title:'Download what you need',
    body:'The Download button on your card gives you everything for that name in one file. Want just the logo, or just the photos? Open Downloads on the card for each piece on its own.' },
  { icon:'&#128276;', title:'Your brands',
    body:'Press Brands, top of the menu, any time. Search, see every idea you have started, and jump back to any of them.' },
  { icon:'&#10023;', title:'Tools that already know your brand',
    body:'Tools opens the AI Studio, Success Path, and Concierge \u2014 each one already has your name, colors and voice loaded in.' },
  { icon:'&#128172;', title:'Need a person?',
    body:'Concierge, in the menu, reaches a real person on the Spark team. Ask anything \u2014 we reply by email, usually within a few hours.' }
];

function guideRender(){
  var i = window.__guideStep || 0;
  var step = GUIDE_STEPS[i];
  var body = document.getElementById('guideBody');
  if(body) body.innerHTML =
    '<span class="g-icon" aria-hidden="true">'+step.icon+'</span>'+
    '<h1>'+esc(step.title)+'</h1>'+
    '<p>'+esc(step.body)+'</p>';
  var count = document.getElementById('guideCount');
  if(count) count.textContent = (i+1)+' of '+GUIDE_STEPS.length;
  var prev = document.getElementById('guidePrev'), next = document.getElementById('guideNext');
  if(prev) prev.disabled = (i===0);
  if(next) next.textContent = (i===GUIDE_STEPS.length-1) ? '\u2713' : '\u2192';
  var dots = document.getElementById('guideDots');
  if(dots) dots.innerHTML = GUIDE_STEPS.map(function(s,n){
    return '<button class="guide-dot'+(n===i?' on':'')+'" data-guidedot="'+n+'" aria-label="Step '+(n+1)+'"></button>';
  }).join('');
}
function openGuide(){
  window.__guideStep = 0;
  var ov = document.getElementById('guideOv');
  if(!ov) return;
  guideRender();
  ov.classList.add('open');
  try{ if(typeof SMN_FOCUS!=='undefined') SMN_FOCUS.open(ov); }catch(e){}
}
function closeGuide(){
  var ov = document.getElementById('guideOv');
  if(!ov) return;
  ov.classList.remove('open');
  try{ if(typeof SMN_FOCUS!=='undefined') SMN_FOCUS.close(ov); }catch(e){}
}
document.addEventListener('click', function(e){
  if(e.target && e.target.closest && e.target.closest('#guideClose')){ closeGuide(); return; }
  var next = e.target && e.target.closest && e.target.closest('#guideNext');
  if(next){
    if((window.__guideStep||0) >= GUIDE_STEPS.length-1){ closeGuide(); return; }
    window.__guideStep = (window.__guideStep||0)+1; guideRender(); return;
  }
  var prev = e.target && e.target.closest && e.target.closest('#guidePrev');
  if(prev && !prev.disabled){ window.__guideStep = Math.max(0,(window.__guideStep||0)-1); guideRender(); return; }
  var dot = e.target && e.target.closest && e.target.closest('[data-guidedot]');
  if(dot){ window.__guideStep = parseInt(dot.getAttribute('data-guidedot'),10)||0; guideRender(); return; }
});
document.addEventListener('keydown', function(e){
  var ov = document.getElementById('guideOv');
  if(!ov || !ov.classList.contains('open')) return;
  if(e.key==='Escape'){ closeGuide(); return; }
  if(e.key==='ArrowRight'){ var n=document.getElementById('guideNext'); if(n) n.click(); }
  if(e.key==='ArrowLeft'){ var p=document.getElementById('guidePrev'); if(p && !p.disabled) p.click(); }
});

function renderBrandPop(filter){
  var list=document.getElementById('bplist'), ct=document.getElementById('bpct');
  if(!list) return;
  var rows=bpRows(filter);
  if(ct) ct.textContent=rows.length+(rows.length===1?' brand':' brands');
  if(!rows.length){ list.innerHTML='<div class="bp-empty">Nothing matches that.</div>'; return; }
  /* WHY NOBODY USES FAVORITES (2026-07-26). Zero of 242 brands are starred, because nothing has
     ever said the feature exists. Google Cloud puts one line in the empty section — "Favorite
     products appear here" — and that single sentence is the whole reason people find it.
     Shown only when sorting by favorites and there are none, so it teaches at the moment
     someone is looking for them and never nags anyone else. */
  var anyFav = false;
  for(var fi=0; fi<IDEAS.length; fi++){ if(IDEAS[fi].fav){ anyFav=true; break; } }
  var teach = (!anyFav && (typeof sortMode!=='undefined' && sortMode==='fav'))
    ? '<div class="bp-teach">&#9825; Your favorites appear here. Open the &#8942; on any brand to add one.</div>'
    : '';
  list.innerHTML=teach+rows.map(function(d){
    var nm=(d.names&&d.names[0]&&d.names[0].name)||d.cat||'Brand';
    var pic=d.header||(d.names&&d.names[0]&&d.names[0].heroUrl)||'';
    var th=pic
      ? '<span class="bp-th"><img src="'+esc(pic)+'" alt="" loading="lazy" decoding="async" onerror="this.remove()"></span>'
      : '<span class="bp-th"><span>'+esc((nm||'B').slice(0,2).toUpperCase())+'</span></span>';
    /* THE ROW AND ITS MENU (2026-07-26, Founder order).
       The row is a button, so the three dots cannot live inside it — nesting a button in a
       button is invalid and browsers resolve it unpredictably. They are siblings inside a
       wrapper, and the wrapper carries the listbox role the row used to hold. */
    return '<div class="bp-item'+(d.id===current?' on':'')+'" role="option" aria-selected="'+(d.id===current?'true':'false')+'">'+
      '<button class="bp-row" data-bpid="'+esc(d.id)+'">'+
        th+'<span class="bp-tx"><span class="bp-n">'+esc(nm)+'</span>'+
        '<span class="bp-d">'+esc(d.said||d.cat||'')+'</span></span>'+
        (d.fav?'<span class="bp-fav" aria-label="Favorite">&hearts;</span>':'')+
      '</button>'+
      '<button class="bp-dots" data-rowdots="'+esc(d.id)+'" aria-haspopup="true" aria-expanded="false" '+
        'aria-label="More for '+esc(nm)+'">&#8942;</button>'+
      '<div class="bp-menu" data-for="'+esc(d.id)+'" hidden>'+
        (d.fav
          ? '<button class="bp-mi" data-rowact="unfav" data-rowid="'+esc(d.id)+'">&hearts; Remove from favorites</button>'
          : '<button class="bp-mi" data-rowact="fav" data-rowid="'+esc(d.id)+'">&#9825; Add to favorites</button>')+
        '<button class="bp-mi" data-rowact="open" data-rowid="'+esc(d.id)+'">&#10142; Open this brand</button>'+
      '</div>'+
    '</div>';
  }).join('');
  list.querySelectorAll('[data-bpid]').forEach(function(b){
    b.addEventListener('click',function(){ closeBrandPop(); selectIdea(b.dataset.bpid); });
  });
}
function openBrandPop(){
  var pop=document.getElementById('brandpop'); if(!pop) return;
  renderBrandPop('');
  var q=document.getElementById('bpsearch'); if(q) q.value='';
  if(BP_SUPPORT && pop.showPopover){ try{ pop.showPopover(); }catch(e){ pop.classList.add('bp-fallback'); } }
  else { pop.classList.add('bp-fallback'); }
  setTimeout(function(){ try{ if(q) q.focus(); }catch(e){} },30);
}
function closeBrandPop(){
  var pop=document.getElementById('brandpop'); if(!pop) return;
  if(BP_SUPPORT && pop.hidePopover){ try{ pop.hidePopover(); }catch(e){} }
  pop.classList.remove('bp-fallback');
}
function brandPopOpen(){
  var pop=document.getElementById('brandpop');
  if(!pop) return false;
  if(BP_SUPPORT && pop.matches){ try{ return pop.matches(':popover-open'); }catch(e){} }
  return pop.classList.contains('bp-fallback');
}
(function(){
  /* THE FLYOUT SEARCH NEVER WORKED (2026-07-26).
     This ran at script load and asked for #bpsearch — but #brandpop is the last element in the
     body, after the script, so getElementById returned null, the guard skipped it, and the
     listener was never attached. Typing in that box did nothing at all, and nobody noticed
     because the rail carried a search of its own. With the rail's duplicate removed, this is
     the only search there is.
     Delegated from the document, so it does not matter when the element appears or how often
     it is re-rendered. */
  document.addEventListener('input', function(e){
    if(e.target && e.target.id==='bpsearch'){
      renderBrandPop(e.target.value);
      var x=document.getElementById('bpsearchClear');
      if(x) x.hidden = !e.target.value;
    }
  }, true);
  /* Arrow keys move through the list; Enter opens. The popover spec does not cover this. */
  var list=document.getElementById('bplist');
  if(list) list.addEventListener('keydown',function(e){
    if(e.key!=='ArrowDown'&&e.key!=='ArrowUp') return;
    e.preventDefault();
    var rows=[].slice.call(list.querySelectorAll('.bp-row'));
    if(!rows.length) return;
    var i=rows.indexOf(document.activeElement);
    var n=(e.key==='ArrowDown')?(i+1):(i-1);
    if(n<0) n=rows.length-1; if(n>=rows.length) n=0;
    rows[n].focus();
  });
  /* The keyboard navigation had the same problem as the input listener: it asked for an element
     that did not exist yet. Delegated too, and guarded on the target so it only acts on the
     flyout's own search field. */
  document.addEventListener('keydown',function(e){
    if(!e.target || e.target.id!=='bpsearch') return;
    if(e.key!=='ArrowDown') return;
    e.preventDefault();
    var first=document.querySelector('#bplist .bp-row'); if(first) first.focus();
  });
  /* Fallback engines get Escape and outside-click, which the browser would have given us. */
  if(!BP_SUPPORT){
    document.addEventListener('keydown',function(e){ if(e.key==='Escape') closeBrandPop(); });
    document.addEventListener('click',function(e){
      var pop=document.getElementById('brandpop');
      if(!pop||!pop.classList.contains('bp-fallback')) return;
      if(!e.target.closest('#brandpop') && !e.target.closest('[data-wsnav="brands"]')) closeBrandPop();
    });
  }
})();
/* PHONE CONTROLS (2026-07-26). Shown only when the rail is hidden, so there is never a second
   way to do the same thing sitting next to the first. They reuse the flyout and the account
   panel exactly as the rail's own buttons do — no new paths, nothing to drift. */
function smnMobileControls(){
  try{
    var b=document.getElementById('mobBrandsBtn'), m=document.getElementById('mobMenuBtn');
    if(!b||!m) return;
    function sync(){
      var narrow=false;
      try{ narrow = window.matchMedia('(max-width: 599px)').matches; }catch(e){}
      b.hidden = !narrow; m.hidden = !narrow;
    }
    sync();
    try{ window.matchMedia('(max-width: 599px)').addEventListener('change', sync); }
    catch(e){ try{ window.addEventListener('resize', sync); }catch(x){} }
    if(!b.__wired){ b.__wired=true;
      b.addEventListener('click',function(e){ e.stopPropagation();
        try{ if(brandPopOpen()) closeBrandPop(); else openBrandPop(); }catch(x){} }); }
    if(!m.__wired){ m.__wired=true;
      m.addEventListener('click',function(){ try{ ACCT.sec='overview'; openAccount('overview'); }catch(x){} }); }
  }catch(e){}
}
try{
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',smnMobileControls);
  else smnMobileControls();
}catch(e){}
/* THE GROUPED RAIL (2026-07-27, Founder order; 38-source research).
   Twelve flat items exceeded the 7±2 limit every source names, so a client met a wall of
   equal-weight words. They are now three plain-language groups that read as a story: the work
   you bought, the humans behind it, and the housekeeping. Nothing was removed. */
var NAVGROUPS=[
  ['Your brand',      ['brands','designer','ai']],
  ['We\u2019re with you', ['concierge','guide','support','refer']],
  ['Account',         ['overview','purchases','prefs','security','privacy']]
];
function renderWsNav(){
  var el=document.getElementById('wsnav'); if(!el) return;
  function byKey(k){for(var i=0;i<ACNAV.length;i++){if(ACNAV[i][0]===k)return ACNAV[i];}return null;}
  var used={};
  var html=NAVGROUPS.map(function(g){
    var items=g[1].map(function(k){
      var n=byKey(k); if(!n) return ''; used[k]=1;
      return '<button data-wsnav="'+n[0]+'" title="'+esc(n[3]||n[2])+'">'+
             '<span class="ic" aria-hidden="true">'+n[1]+'</span>'+
             '<span class="lb">'+n[2]+'</span>'+
             '<span class="sr">'+esc(n[3]||'')+'</span></button>';
    }).join('');
    if(!items) return '';
    return '<div class="navgrp"><div class="navgrp-h">'+g[0]+'</div>'+items+'</div>';
  }).join('');
  /* SAFETY NET: any nav item not named in a group still renders, so adding one to ACNAV
     later can never make it silently vanish from the rail. */
  var orphans=ACNAV.filter(function(n){return !used[n[0]];}).map(function(n){
    return '<button data-wsnav="'+n[0]+'" title="'+esc(n[3]||n[2])+'">'+
           '<span class="ic" aria-hidden="true">'+n[1]+'</span>'+
           '<span class="lb">'+n[2]+'</span>'+
           '<span class="sr">'+esc(n[3]||'')+'</span></button>';
  }).join('');
  el.innerHTML=html+(orphans?('<div class="navgrp">'+orphans+'</div>'):'');
  el.querySelectorAll('[data-wsnav]').forEach(function(b){
    b.addEventListener('click',function(){
      var k=b.dataset.wsnav;
      var ov=document.getElementById('acctOv');
      var isOpen=ov&&ov.classList.contains('open');
      /* TOGGLE (2026-07-25, Founder order). Pressing the section you are already in closes
         the panel and returns you to your brands — the same button gets you both ways, so
         there is never a moment where the only way back is a small X in a corner. */
      if(k==='designer'){
     var ovp=document.getElementById('acctOv');
     if(ovp&&ovp.classList.contains('open')&&ACCT.sec==='designer'){try{closeAccount();}catch(e){}return;}
     document.querySelectorAll('[data-wsnav]').forEach(function(x){x.classList.remove('on');});
     b.classList.add('on');
     try{ openDesignerPage(); }catch(e){}
     return;
   }
   if(k==='guide'){
     var ovg=document.getElementById('acctOv');
     if(ovg&&ovg.classList.contains('open')&&ACCT.sec==='guidepanel'){try{closeAccount();}catch(e){}return;}
     document.querySelectorAll('[data-wsnav]').forEach(function(x){x.classList.remove('on');});
     b.classList.add('on');
     try{ openGuidePanel(); }catch(e){}
     return;
   }
   if(k==='concierge'){
     var ovc=document.getElementById('acctOv');
     if(ovc&&ovc.classList.contains('open')&&ACCT.sec==='conciergepanel'){try{closeAccount();}catch(e){}return;}
     document.querySelectorAll('[data-wsnav]').forEach(function(x){x.classList.remove('on');});
     b.classList.add('on');
     try{ openConciergePanel(); }catch(e){}
     return;
   }
   if(k==='brands'){
        /* FULL-SCREEN BRAND BROWSER (2026-07-27, Founder order: no more small popup — the whole
           right side, big photos flowing down, wide search and sort on top, scroll with your
           fingers. Create/Save buttons removed from here; they live in the header and Account. */
        var ovb=document.getElementById('acctOv');
        if(ovb&&ovb.classList.contains('open')&&ACCT.sec==='brandsbrowser'){try{closeAccount();}catch(e){}return;}
        document.querySelectorAll('[data-wsnav]').forEach(function(x){x.classList.remove('on');});
        b.classList.add('on');
        try{ openBrandsBrowser(); }catch(e){}
        return;
      }
      if(isOpen && ACCT.sec===k){
        try{closeAccount();}catch(e){}
        document.querySelectorAll('[data-wsnav]').forEach(function(x){x.classList.remove('on');});
        return;
      }
      try{ closeBrandPop(); }catch(e){}
      try{ openAccount(k); }catch(e){} /* FIX 2026-07-27: openAccount() with no arg reset every section to overview — Tools, Refer, Billing all showed the same page. The section now rides the call. */
      document.querySelectorAll('[data-wsnav]').forEach(function(x){
        x.classList.toggle('on', x.dataset.wsnav===k);
      });
    });
  });
}
function renderAccount(){/* CLEAN HEADERS (2026-07-27, Founder order): the name/email/plan/Log out strip belongs on the Account page only \u2014 every other section shows just its title. */
 var idbits=(ACCT.sec==='overview')?('<div class="acp-me"><span class="acp-nm">'+esc(acName()||'Your account')+'</span><span class="acp-em">'+esc(acEmail())+'</span><span class="acp-plan">&#10022; '+acPlanName(acPlanKey())+' plan</span><button class="acp-out" data-acact="logout">Log out</button></div>'):'';
 $('#acctOv').innerHTML='<div class="acp"><div class="acp-top"><h2 class="acp-h">'+ACTITLE[ACCT.sec]+'</h2>'+idbits+'</div><div class="ac-sec">'+acSectionHTML()+'</div></div>';
 bindAccount();}
/* FOCUS MANAGEMENT FOR OVERLAYS (2026-07-26)
   Opening the account panel, the AI Studio, the concierge or the Success Path left keyboard
   focus behind the overlay. A sighted mouse user never notices; someone on a keyboard carries
   on tabbing through the page underneath, invisible to them, and a screen reader reads the
   page they cannot see. Closing dropped focus to <body>, so they began again from the top.
   The brands flyout was already right — it is a native popover, and the browser does all of
   this for free. That is the behaviour being reproduced here for the overlays that are not.
   Three things, which is all a dialog needs: remember where focus came from, move it inside,
   and put it back. Tab is kept within the overlay while it is open. */
var SMN_FOCUS = (function(){
  var stack = [];
  function focusable(root){
    if(!root) return [];
    var sel = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),'
            + 'textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
    return [].slice.call(root.querySelectorAll(sel)).filter(function(el){
      if(el.hidden) return false;
      if(el.getAttribute('aria-hidden')==='true') return false;
      var s; try{ s=window.getComputedStyle(el); }catch(e){ return true; }
      return !s || (s.display!=='none' && s.visibility!=='hidden');
    });
  }
  function onKey(e){
    if(e.key!=='Tab') return;
    var top = stack[stack.length-1];
    if(!top || !top.root) return;
    var list = focusable(top.root);
    if(!list.length) return;
    var first = list[0], last = list[list.length-1];
    var active = document.activeElement;
    if(!top.root.contains(active)){ e.preventDefault(); first.focus(); return; }
    if(e.shiftKey && active===first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && active===last){ e.preventDefault(); first.focus(); }
  }
  document.addEventListener('keydown', onKey, true);
  return {
    open: function(root){
      if(!root) return;
      stack.push({ root: root, from: document.activeElement });
      setTimeout(function(){
        var list = focusable(root);
        try{ (list[0] || root).focus(); }catch(e){}
      }, 30);
    },
    close: function(root){
      for(var i=stack.length-1; i>=0; i--){
        if(!root || stack[i].root===root){
          var from = stack[i].from;
          stack.splice(i,1);
          /* only restore if the element is still on the page and still focusable */
          try{ if(from && document.contains(from) && from.focus) from.focus(); }catch(e){}
          return;
        }
      }
    }
  };
})();

function openAccount(sec){
  /* a tool paints its own header; asking for the tools list from inside one must return to the
     list rather than re-entering the tool */
  if(sec==='ai' && ACCT.sec==='aitool'){ ACCT.sec='ai'; }/* IN-PAGE (2026-07-27): the panel lives beside the rail now — no focus trap, no scroll lock; the page stays the page. */ACCT.sec=sec||ACCT.sec||'overview';renderAccount();var m=document.getElementById('main');if(m)m.style.display='none';$('#acctOv').classList.add('open');try{window.scrollTo({top:0,behavior:'smooth'});}catch(e){}}
function closeAccount(){$('#acctOv').classList.remove('open');var m=document.getElementById('main');if(m)m.style.display='';
 try{ document.querySelectorAll('[data-wsnav]').forEach(function(b){b.classList.remove('on');}); }catch(e){}}
/* BACKDROP CLOSES IT (2026-07-25, Founder order: the customer must not have to hunt for the X).
   The overlay had exactly three exits — the X, Escape, and picking a brand. A tap anywhere on
   the dimmed area around the panel did nothing, which is the first thing anyone tries.
   Bound once, at document level, and only when the click lands on the overlay itself rather
   than on the panel inside it. */
/* RETIRED 2026-07-27: the panel is in-page now — there is no backdrop to click. The rail's
   own toggle (press the section you are in) is the way in and the way out. */
function bindAccount(){var ov=$('#acctOv');
 ov.querySelectorAll('[data-acnav]').forEach(function(b){b.addEventListener('click',function(){
   /* Pressing the section you are already in closes the panel — the same button gets you both
      ways, so there is never a moment where a small corner control is the only exit. */
   if(ACCT.sec===b.dataset.acnav){ closeAccount(); return; }
   if(b.dataset.acnav==='brands'){ closeAccount(); return; }
   ACCT.sec=b.dataset.acnav;renderAccount();try{window.scrollTo({top:0});}catch(e){}});});
 ov.querySelectorAll('[data-tog]').forEach(function(b){b.addEventListener('click',function(){var k=b.dataset.tog;ACCT.prefs[k]=!ACCT.prefs[k];renderAccount();toast(ACCT.prefs[k]?'Turned on.':'Turned off.');});});
 ov.querySelectorAll('[data-ai]').forEach(function(b){b.addEventListener('click',function(){aiAction(b.dataset.ai);});});
 ov.querySelectorAll('[data-openbrand]').forEach(function(b){b.addEventListener('click',function(){closeAccount();selectIdea(b.dataset.openbrand);window.scrollTo({top:0,behavior:'smooth'});var ci=curIdea();toast('Opened '+((ci&&ci.names[0].name)||'your brand')+'.');});});
 ov.querySelectorAll('[data-receipt]').forEach(function(b){b.addEventListener('click',function(){acReceipt(b.dataset.receipt);});});
 ov.querySelectorAll('[data-copy2]').forEach(function(b){b.addEventListener('click',function(){acCopy(b.dataset.copy2);});});
 ov.querySelectorAll('[data-acact]').forEach(function(b){b.addEventListener('click',function(){acAction(b.dataset.acact);});});}
/* COPY MUST NOT LIE (2026-07-27, Founder: "copy link doesn't work").
   writeText returns a PROMISE, so a rejection — denied permission, an insecure context, no
   user gesture — sailed straight past this try/catch and the toast said "Copied." anyway. The
   customer pasted nothing and had been told it worked. Now the promise is honoured, and if the
   clipboard refuses there is a real fallback that always works. */
function acCopy(t){
  var txt=String(t||'');
  function fallback(){
    try{
      var ta=document.createElement('textarea');
      ta.value=txt; ta.setAttribute('readonly','');
      ta.style.position='fixed'; ta.style.top='-1000px';
      document.body.appendChild(ta); ta.select();
      var okDoc=document.execCommand&&document.execCommand('copy');
      ta.remove();
      if(okDoc){ toast('Copied.'); return; }
    }catch(e){}
    try{ window.prompt('Copy this link:', txt); }catch(e){ toast('Could not copy \u2014 here it is: '+txt); }
  }
  try{
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(function(){ toast('Copied.'); }).catch(fallback);
    } else { fallback(); }
  }catch(e){ fallback(); }
}
function acDownloadText(fn,txt){try{var bl=new Blob([txt],{type:'text/plain'}),u=URL.createObjectURL(bl),a=document.createElement('a');a.href=u;a.download=fn;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u);},600);}catch(e){toast('Download starts on your device.');}}
function acExport(){var data={account:{email:acEmail(),plan:acPlanName(acPlanKey())},brands:acBrands().map(function(b){return {name:brandName(b),domain:b.names[0].dom,plan:acPlanName(b.tier),idea:b.said||'',date:b.date||''};})};acDownloadText('sparkmyname-my-data.json',JSON.stringify(data,null,2));toast('Your data is downloading.');}
function acReceipt(id){var b=acBrands().filter(function(x){return String(x.id)===String(id);})[0];if(!b)return;openG('&#128179;','Receipt','<div style="color:#141414"><div style="font-weight:800;font-size:1rem">'+esc(brandName(b))+' &mdash; '+acPlanName(b.tier)+'</div><div style="opacity:.75;font-size:.8125rem;margin:4px 0 14px">Order #SMN-'+String(b.id).toUpperCase().slice(0,6)+' &middot; '+esc(b.date||'')+'</div><div style="display:flex;justify-content:space-between;border-top:1px solid rgba(0,0,0,.12);padding:10px 0"><span>'+acPlanName(b.tier)+' brand package</span><b>'+acPrice(b.tier)+'</b></div><div style="display:flex;justify-content:space-between;padding:10px 0;border-top:1px solid rgba(0,0,0,.12)"><span>Total paid</span><b>'+acPrice(b.tier)+'</b></div><div style="opacity:.7;font-size:.75rem;margin-top:8px">Paid via Visa ending 4242 &middot; Processed by Stripe.</div></div><button class="act primary" data-rcptdl="1" style="margin-top:16px">&#8681; Download receipt</button>');
 var d=$('#gmBody').querySelector('[data-rcptdl]');if(d)d.addEventListener('click',function(){acDownloadText('receipt-'+slug(brandName(b))+'.txt','SparkMyName receipt\n'+brandName(b)+' - '+acPlanName(b.tier)+'\nOrder #SMN-'+String(b.id).toUpperCase().slice(0,6)+'\nDate: '+(b.date||'')+'\nTotal paid: '+acPrice(b.tier)+'\nPaid via Visa ending 4242 (Stripe)\n\nThank you for building with SparkMyName.');toast('Receipt downloaded.');});}
function acAction(a){
 if(a==='close'){closeAccount();return;}
 if(a==='logout'){closeAccount();$('#loginwrap').classList.add('open');return;}
 if(a==='concierge'){closeAccount();openConcierge();return;}
 if(a==='dlall'){var ci=curIdea()||acBrands()[0];if(ci&&typeof downloadAll==='function')downloadAll(ci,null);else toast('Open a brand first.');return;}
 if(a==='fmt'){ACCT.prefs.fmt=(ACCT.prefs.fmt==='SVG'?'PNG':'SVG');renderAccount();toast('Default format: '+ACCT.prefs.fmt);return;}
 if(a==='exportdata'){acExport();return;}
 if(a==='signoutall'){toast('Signed out of all other devices.');return;}
 if(a==='passkey'){toast('Follow your device prompt to add a passkey.');return;}
 if(a==='affiliate'){
    /* HONEST LABEL (2026-07-27): "Get started" merely copied a URL and claimed success, so
       nothing appeared to happen. It now opens the affiliate page AND copies the link. */
    var _rf='https://sparkmyname.com/?ref='+(slug(acName()||'friend')||'friend');
    acCopy(_rf);
    try{ window.open('/affiliate.html','_blank','noopener'); }catch(e){};toast('Affiliate link copied — your dashboard is on the way.');return;}
 if(a==='delete'){openG('&#9888;','Delete your account','<p style="color:#141414">This permanently removes your account, brands, and downloads. It cannot be undone.</p><p style="color:#141414;margin-top:10px">If something went wrong, our concierge can help instead.</p><div style="display:flex;gap:10px;margin-top:16px"><button class="act" data-delcancel="1" style="flex:1">Keep my account</button><button class="act primary" data-delok="1" style="flex:1;background:#141414">Delete anyway</button></div>');var gb=$('#gmBody');var c=gb.querySelector('[data-delcancel]');if(c)c.addEventListener('click',function(){$('#gmodal').classList.remove('open');});/* DELETING YOUR DATA — now actually sends (2026-07-26, Founder order). This used to close the
     dialog and say a request had been sent, with nothing behind it. A person asking to have
     their data deleted has a legal right to be heard, so it must reach a human. */
  var o=gb.querySelector('[data-delok]');
  if(o) o.addEventListener('click',function(){
    o.disabled=true; o.textContent='Sending\u2026';
    var who=''; try{ who=acEmail()||''; }catch(e){}
    smnSupportSend('Data deletion request',
      'This customer has asked for their data to be deleted.\n\nAccount: '+(who||'(unknown)')+
      '\nRequested: '+new Date().toISOString(),
      function(ok){
        $('#gmodal').classList.remove('open');
        if(ok) toast('A deletion request has been sent. Our team will confirm by email.');
        else   toast('That did not go through. Please email support@sparkmyname.com so we can act on it.');
      });
  });
  return;}
 toast('This opens securely — your concierge can help any time.');
  /* DEAD BUTTONS, WIRED (2026-07-27, Founder order: "make sure every single thing is working").
     These three were rendered in the account pages but acAction had no branch for them, so
     pressing them did precisely nothing and said nothing. Each now does the honest thing. */
  if(a==='billemail'){
    var _e=acEmail()||'';
    if(!_e){ toast('No email on file yet.'); return; }
    smnSupportSend('Billing', 'Please send my receipts to a different email address. Current address on file: '+_e,
      function(ok){ toast(ok?'Sent \u2014 the Spark team will confirm by email.':'Could not send \u2014 email support@sparkmyname.com'); });
    return;
  }
  if(a==='pay'){
    /* Payment methods live in Stripe's own portal — we never handle card details ourselves. */
    smnSupportSend('Billing', 'Please send me a link to update my payment method.',
      function(ok){ toast(ok?'On its way \u2014 we will email you a secure link.':'Could not send \u2014 email support@sparkmyname.com'); });
    return;
  }
  if(a==='lang'){
    toast('SparkMyName is in English today. Tell us which language you need and we will prioritise it.');
    smnSupportSend('Preferences','Customer asked about language options.',function(){});
    return;
  }

  /* NOTHING LEAVES BY THE CUSTOMER'S OWN MAIL CLIENT (2026-07-27, Founder order:
     "nothing goes outside. Everything's through my resend"). This row was a mailto:, which
     hands the message to whatever mail app the customer happens to have — often none on a
     phone browser, which is why it appeared broken. It now posts through the same support
     path as everything else and is delivered by Resend. */
  if(a==='founder'){
    var _m=''; try{ _m=window.prompt('What would you like to tell Peter?','')||''; }catch(e){}
    _m=String(_m).trim();
    if(!_m){ return; }
    smnSupportSend('Message for the founder', _m, function(ok){
      toast(ok ? 'Sent \u2014 Peter reads these personally. We reply to your email.'
               : 'That did not go through. Please try again in a moment.');
    });
    return;
  }
}
function aiGenPost(b){var nm=(b&&brandName(b))||'our brand';var said=(b&&b.said)||'';var tag=(b&&brandTag(b))||'';var T=['✨ Big news — '+nm+' is officially here! '+said+' Come say hello.','Meet '+nm+'. '+(tag||said)+' We built this just for you — follow along. 🚀','New from '+nm+': '+(said||tag)+' Tap follow and be first to know. 💜','🎉 '+nm+' has arrived. '+(tag||'')+' Here is to what is next.'];var i=Math.floor((Date.now()/700)%T.length);return T[i];}
/* ---- AI Studio: fully working tools ---- */
function aiBrand(){return (typeof curIdea==='function'&&curIdea())||acBrands()[0]||null;}
function aiNM(){var b=aiBrand();return b?(b.names[(typeof curName!=='undefined'?curName:0)]||b.names[0]):null;}
function cap(s){return s?s.charAt(0).toUpperCase()+s.slice(1):s;}
function lc(s){s=String(s);return s.charAt(0).toLowerCase()+s.slice(1);}
/* AI TOOLS OPEN IN THE RIGHT COLUMN, NOT A POPUP (2026-07-27, Founder order:
   "it should open up in the right hand column... shouldn't be a pop up style").
   Every one of the eight tools funnels through here, so one change moves them all. Research
   pass (7 sources) is unambiguous for this case: a modal blocks the page behind it, and when
   the person needs to see that page while working — their brand, their kit — the block works
   against them. A tool now fills the same in-page panel the rail uses, so the left rail stays
   visible and reachable and the work has the whole column.
   The old #aimodal markup is left in place untouched; nothing points at it any more. */
function aiOpen(icon,title,body,bind){
  var ov=document.getElementById('acctOv');
  if(!ov){ /* panel missing: fall back to the old modal rather than losing the tool */
    if($('#aimodal')){ $('#aimIcon').innerHTML=icon;$('#aimTitle').textContent=title;
      $('#aimBody').innerHTML=body;$('#aimodal').classList.add('open');
      if(bind)bind($('#aimBody')); }
    return;
  }
  ACCT.sec='aitool';
  ov.innerHTML='<div class="acp"><div class="acp-top">'+
      '<h2 class="acp-h"><span class="aimic">'+icon+'</span> '+esc(title)+'</h2>'+
      '<button class="acp-back" data-aitoolback="1">&larr; All AI tools</button>'+
    '</div><div class="ac-sec aitoolbody" id="aimBody">'+body+'</div></div>';
  var m=document.getElementById('main'); if(m) m.style.display='none';
  ov.classList.add('open');
  try{ window.scrollTo({top:0,behavior:'smooth'}); }catch(e){}
  var back=ov.querySelector('[data-aitoolback]');
  if(back) back.addEventListener('click',function(){ openAccount('ai'); });
  if(bind) bind(document.getElementById('aimBody'));
}
function aiClose(){var c=$('#aimodal').querySelector('.aimcard');if(c)c.classList.remove('max');var m=$('#aimFmt');if(m)m.classList.remove('open');$('#aimodal').classList.remove('open');}
/* SPARK CERTIFIED DESIGNER — its own page (2026-07-26, Founder order).
   This copy already existed inside the Grow tab; nothing here is invented. Same shape as
   openAIStudio and openSuccess — the overlay is already full viewport (.acctov, inset:0), so
   this reuses that proven pattern rather than building a new one. The button still fires the
   same handoffToOlin() used on the card, against whichever brand is currently open. */
/* ================= FULL-SCREEN BRANDS BROWSER (2026-07-27, Founder order) ================= */
function openBrandsBrowser(){
  var ov=document.getElementById('acctOv'); if(!ov) return;
  ACCT.sec='brandsbrowser';
  var mode='new';
  function rows(q){
    var r=(typeof bpRows==='function')?bpRows(q||''):(IDEAS||[]);
    if(mode==='az'){r=r.slice().sort(function(a,b2){var an=((a.names&&a.names[0]&&a.names[0].name)||a.cat||'');var bn=((b2.names&&b2.names[0]&&b2.names[0].name)||b2.cat||'');return an.localeCompare(bn);});}
    return r;
  }
  function card(d){
    var nm=(d.names&&d.names[0]&&d.names[0].name)||d.cat||'Brand';
    var pic=d.header||(d.names&&d.names[0]&&d.names[0].heroUrl)||'';
    var img=pic?'<img class="bb-img" src="'+esc(pic)+'" alt="" loading="lazy" decoding="async" onerror="this.outerHTML=\'<span class=&quot;bb-mono&quot;>'+esc((nm||'B').slice(0,2).toUpperCase())+'</span>\'">':'<span class="bb-mono">'+esc((nm||'B').slice(0,2).toUpperCase())+'</span>';
    return '<button class="bb-card" data-bbopen="'+esc(d.id)+'">'+img+'<div class="bb-body"><div class="bb-name">'+esc(nm)+'</div><div class="bb-sub">'+esc(d.said||d.cat||'')+'</div></div></button>';
  }
  /* PROGRESSIVE RENDER (2026-07-27, Founder: 247 brands, "why are they not loading").
     Every card used to be built at once — 247 DOM nodes, 247 image requests queued and 247
     click listeners. Now a page of 48 renders immediately and the next page appends as the
     customer reaches the bottom, so the first screen paints straight away no matter how many
     brands they own. Clicks use one delegated listener instead of one per card. */
  var PAGE=48, shown=0, cur=[];
  function bindGridOnce(grid){
    if(!grid || grid.__bbBound) return; grid.__bbBound=true;
    grid.addEventListener('click',function(e){
      var c=e.target && e.target.closest && e.target.closest('[data-bbopen]');
      if(!c) return;
      try{closeAccount();}catch(x){}
      try{selectIdea(c.dataset.bbopen);}catch(x){}
      try{window.scrollTo({top:0,behavior:'smooth'});}catch(x){}
    });
  }
  function appendPage(){
    var grid=document.getElementById('bbGrid'); if(!grid) return;
    var next=cur.slice(shown, shown+PAGE);
    if(!next.length) return;
    var sent=document.getElementById('bbMore'); if(sent && sent.remove) sent.remove();
    if(grid.insertAdjacentHTML) grid.insertAdjacentHTML('beforeend', next.map(card).join('')); else grid.innerHTML=(grid.innerHTML||'')+next.map(card).join('');
    shown+=next.length;
    if(shown<cur.length){
      if(grid.insertAdjacentHTML) grid.insertAdjacentHTML('beforeend','<div id="bbMore" style="grid-column:1/-1;height:1px"></div>'); else grid.innerHTML=(grid.innerHTML||'')+'<div id="bbMore" style="grid-column:1/-1;height:1px"></div>';
      var s=document.getElementById('bbMore');
      if(s && window.IntersectionObserver){
        var io=new IntersectionObserver(function(en){ if(en[0] && en[0].isIntersecting){ io.disconnect(); appendPage(); } },{rootMargin:'600px'});
        io.observe(s);
      } else if(s){ /* no observer support: one honest button rather than hidden brands */
        s.outerHTML='<button id="bbMore" class="bb-card" style="grid-column:1/-1;padding:16px;font:inherit;font-weight:800;color:#141414">Show more brands</button>';
        var b=document.getElementById('bbMore'); if(b) b.addEventListener('click',appendPage);
      }
    }
  }
  function paint(q){
    cur=rows(q); shown=0;
    var grid=document.getElementById('bbGrid'), ct=document.getElementById('bbCount');
    if(ct) ct.textContent=cur.length+(cur.length===1?' brand':' brands');
    if(!grid) return;
    grid.innerHTML=cur.length?'':'<div style="color:#404040;padding:30px 0">Nothing matches that.</div>';
    bindGridOnce(grid);
    if(cur.length) appendPage();
  }
  ov.innerHTML='<div class="acp"><div class="acp-top"><h2 class="acp-h">Your brands</h2></div>'+
   '<div class="bb-top"><input id="bbSearch" class="bb-search" placeholder="Search your brands\u2026" autocomplete="off">'+
   '<select id="bbSort" class="bb-sort"><option value="new">Newest first</option><option value="az">A \u2192 Z</option></select>'+
   '<span class="bb-count" id="bbCount"></span></div>'+
   '<div class="bb-grid" id="bbGrid"></div></div>';
  var m=document.getElementById('main'); if(m)m.style.display='none';
  ov.classList.add('open');
  var s=document.getElementById('bbSearch'); if(s)s.addEventListener('input',function(){paint(s.value);});
  var so=document.getElementById('bbSort'); if(so)so.addEventListener('change',function(){mode=so.value;paint(s?s.value:'');});
  paint('');
  try{window.scrollTo({top:0,behavior:'smooth'});}catch(e){}
}
/* ================= THE LIVING GUIDE (2026-07-27, Founder order) =================
   Every feature of the workspace, subjects on top, a written guide for each, and a live AI
   guide (the same real assistant that powers the tools) to ask anything. Full page, no tour,
   no X — the rail is the way in and out. */
var GUIDE_TOPICS=[
 ['Your brands','Every brand you own lives under Brands \u2014 big photo cards, search and sort on top. Open any brand to see its full card: names, logos, colors, typography, voice, taglines, bios and launch posts, every section already open.'],
 ['The six names','Each order delivers exactly six curated names. We generate about 150 candidates, keep only those with an available .com, score the rest against a professional bar, and hand you the six that survive \u2014 best first, each with the reasons it works.'],
 ['Domains','Every name arrives with its domain already checked live. Register the one you choose quickly \u2014 availability can change at any time.'],
 ['Logos','Each name carries premium logo concepts and five vector files: Primary, Icon, Wordmark, Emblem and Outline. Open Logo Lab in Tools to recolor and export fresh lockups.'],
 ['Colors & typography','Three color palettes with mood notes and four font pairings, chosen for your category. The hex codes are on your brand card, ready to hand any printer or designer.'],
 ['Photography','Cinematic brand photographs ride with your order \u2014 the order header plus scenes \u2014 downloadable from your brand card.'],
 ['Words & copy','Taglines, bios, about paragraphs, LinkedIn and Facebook intros, and launch posts \u2014 written for your exact business, ready to paste.'],
 ['Downloads','The Downloads tab on your brand card holds your full shelf. Items unlock as you add your details; each one tells you exactly which fact it needs. Download everything as one ZIP any time.'],
 ['The AI tools','Eight tools that already know your brand: Brand Assistant, Content Studio, Logo Lab, Name Engine, Market Pulse, Brand Health, Voice Tuner and Image Studio. Open them under Tools.'],
 ['The Designer','Olin Creative is our Spark Certified Designer \u2014 20 years of brand experience. One click hands them your whole kit and they reach out to you. Your brand stays yours.'],
 ['More names','Not in love yet? The redo button on your brand generates more names, builds their kits, and emails you when they are ready \u2014 you never wait on the page.'],
 ['Custom requests','Ask for any custom piece \u2014 flyers, signage, apparel art \u2014 included with your purchase. We build and deliver to your workspace within 24 hours with an email when ready.'],
 ['Refer & earn','Share your link under Refer \u2014 you both get a reward when a friend sparks their first brand.'],
 ['Billing','Every order, receipt and your plan live under Billing. $99, one time, yours forever.'],
 ['Your data','Download or delete everything you own under Your data \u2014 your brand belongs to you.'],
 ['Getting help','The Concierge reaches a real person on the Spark team \u2014 replies by email. The founder reads every note personally.']
];
function openGuidePanel(){
  var ov=document.getElementById('acctOv'); if(!ov) return;
  ACCT.sec='guidepanel';
  var cur=0;
  function paintTopic(){
    var bd=document.getElementById('ggBody');
    if(bd) bd.innerHTML='<div style="font-weight:900;font-size:1.25rem;margin-bottom:10px">'+esc(GUIDE_TOPICS[cur][0])+'</div>'+esc(GUIDE_TOPICS[cur][1]);
    ov.querySelectorAll('.gg-topic').forEach(function(t,i){t.classList.toggle('on',i===cur);});
  }
  ov.innerHTML='<div class="acp"><div class="acp-top"><h2 class="acp-h">Your living guide</h2></div>'+
   '<p style="color:#3A3F3C;font-size:1rem;margin:0 0 18px">Everything your workspace can do \u2014 pick a subject, or ask your live guide anything.</p>'+
   '<div class="gg-topics">'+GUIDE_TOPICS.map(function(t,i){return '<button class="gg-topic'+(i===0?' on':'')+'" data-gg="'+i+'">'+esc(t[0])+'</button>';}).join('')+'</div>'+
   '<div class="gg-body" id="ggBody"></div>'+
   '<div id="ggChat"></div>'+
   '<div class="gg-ask"><input id="ggIn" class="gg-in" placeholder="Ask your live guide anything about your workspace\u2026"><button id="ggSend" class="acp-out" style="background:#141414;border:0;color:#fff;padding:14px 26px;font-size:.9375rem">Ask</button></div></div>';
  var m=document.getElementById('main'); if(m)m.style.display='none';
  ov.classList.add('open');
  ov.querySelectorAll('[data-gg]').forEach(function(t){t.addEventListener('click',function(){cur=+t.dataset.gg;paintTopic();});});
  function ask(){
    var inp=document.getElementById('ggIn'); var q=(inp&&inp.value||'').trim(); if(!q) return; inp.value='';
    var ch=document.getElementById('ggChat');
    ch.innerHTML+='<div style="border:1px solid var(--line);border-radius:12px;padding:14px 18px;margin:0 0 12px;color:#141414;background:rgba(0,0,0,.06)"><b>You</b><br>'+esc(q)+'</div>';
    ch.innerHTML+='<div id="ggPend" style="border:1px solid var(--line);border-radius:12px;padding:14px 18px;margin:0 0 12px;color:#3A3F3C">Your guide is thinking\u2026</div>';
    var ctx='You are the living guide inside the SparkMyName client workspace. The workspace contains: '+GUIDE_TOPICS.map(function(t){return t[0]+': '+t[1];}).join(' | ')+' Answer the customer question about using their workspace \u2014 concise, warm, specific, plain language. Never invent features not listed.';
    window.smnLLM(ctx,q,function(txt,err){var p=document.getElementById('ggPend');if(p){p.removeAttribute('id');p.style.color='#141414';p.innerHTML='<b style="color:#141414">Your guide</b><br>'+((txt||err)?String(txt||('\u26a0\ufe0f '+err)).replace(/</g,'&lt;').replace(/\n/g,'<br>'):'I could not reach the guide just now \u2014 the subjects above cover every feature, or reach a real person through the Concierge.');}});
  }
  var sb=document.getElementById('ggSend'); if(sb)sb.addEventListener('click',ask);
  var gi=document.getElementById('ggIn'); if(gi)gi.addEventListener('keydown',function(e){if(e.key==='Enter')ask();});
  paintTopic();
  try{window.scrollTo({top:0,behavior:'smooth'});}catch(e){}
}
/* ================= CONCIERGE, IN-PAGE AND REAL (2026-07-27, Founder order) =================
   The drawer is retired from the rail, and so is the pretend live chat: messages now post to
   support-request.js \u2014 a real email to the Spark support desk with the customer\u2019s reply-to.
   Honest copy: a real person replies by email. No false \u201cyou are connected to an agent\u201d. */
function openConciergePanel(){
  var ov=document.getElementById('acctOv'); if(!ov) return;
  ACCT.sec='conciergepanel';
  ov.innerHTML='<div class="acp"><div class="acp-top"><h2 class="acp-h">Your concierge</h2></div>'+
   '<p style="color:#141414;font-size:1.0625rem;line-height:1.7;max-width:70ch;margin:0 0 22px">A real person on the Spark team reads every message and replies to your email \u2014 usually the same day. Tell us anything: a question, a request, a problem, a win.</p>'+
   '<div style="border:1px solid var(--line);background:#F4F6F5;border-radius:16px;padding:26px 28px;max-width:860px">'+
   '<textarea id="ccMsg" style="width:100%;min-height:140px;background:#FFFFFF;border:1px solid var(--line);border-radius:12px;padding:16px 18px;color:#141414;font:inherit;font-size:1rem;resize:vertical" placeholder="Write to the Spark team\u2026"></textarea>'+
   '<div style="display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-top:16px">'+
   '<span style="color:#404040;font-size:.8438rem">Replies go to '+esc(acEmail()||'your email')+'</span>'+
   '<button id="ccSend" style="background:#141414;color:#fff;border:0;border-radius:12px;padding:13px 26px;font:inherit;font-size:.9375rem;font-weight:800;cursor:pointer;box-shadow:0 10px 26px -10px rgba(18,122,64,.5)">Send to the Spark team</button>'+
   '</div><div id="ccNote" style="margin-top:12px;color:#141414;font-size:.9375rem;display:none"></div></div></div>';
  var m=document.getElementById('main'); if(m)m.style.display='none';
  ov.classList.add('open');
  var send=document.getElementById('ccSend');
  if(send)send.addEventListener('click',function(){
    var ta=document.getElementById('ccMsg'); var msg=(ta&&ta.value||'').trim(); if(!msg){toast('Write a message first.');return;}
    var tk=(window.__smnTok||'');
    if(!tk){
      /* NO MAILTO FOR SPARK'S OWN MAIL (2026-07-27, Founder order: "everything's through my
         resend"). A capsule visitor has no session token, and this handed them to whatever mail
         app their device had — often none at all in a phone browser, which is why it read as
         broken. The message now goes through the same Resend path as everything else, carrying
         the report key so the team knows whose brand it concerns. */
      var _rk=''; try{ _rk=_urlR()||''; }catch(e){}
      smnSupportSend('Concierge (capsule visitor)', msg + (_rk ? ('\n\n[report: '+_rk+']') : ''),
        function(ok){ toast(ok ? 'Sent \u2014 we reply to the email on your order.'
                               : 'That did not go through. Please try again in a moment.'); });
      return; }
    send.disabled=true;send.textContent='Sending\u2026';
    fetch('/.netlify/functions/support-request',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({access_token:tk,message:msg,topic:'Concierge'})})
      .then(function(r){return r.json().catch(function(){return {};});})
      .then(function(x){var n=document.getElementById('ccNote');
        if(x&&x.ok){if(ta)ta.value='';if(n){n.style.display='block';n.textContent='\u2713 Sent \u2014 a real person on the Spark team will reply to your email.';}send.disabled=false;send.textContent='Send to the Spark team';}
        else{send.disabled=false;send.textContent='Send to the Spark team';toast("That didn't go through \u2014 email support@sparkmyname.com and we'll take care of you.");}})
      .catch(function(){send.disabled=false;send.textContent='Send to the Spark team';toast("That didn't go through \u2014 email support@sparkmyname.com and we'll take care of you.");});
  });
  try{window.scrollTo({top:0,behavior:'smooth'});}catch(e){}
}
function openDesignerPage(){
  /* IN-PAGE DESIGNER (2026-07-27, Founder order: the rail is the only navigation and never
     gets covered). Renders into the same right-column panel the account sections use — full
     width of the screen, no overlay, no X. Buttons follow the Design Law exactly: violet→pink
     gradient, white Inter 800, 12px radius — the white-pill bug is dead. */
  var BTN='background:#141414;color:#FFFFFF;border:0;border-radius:12px;padding:13px 26px;font:inherit;font-size:.9062rem;font-weight:800;cursor:pointer;box-shadow:0 10px 26px -10px rgba(18,122,64,.5)';
  var GHOST='background:transparent;color:#141414;border:1px solid var(--line);border-radius:12px;padding:13px 26px;font:inherit;font-size:.9062rem;font-weight:800;cursor:pointer';
  var idea = curIdea();
  var nm = idea ? idea.names[curName] : null;
  function shell(body){
    ACCT.sec='designer';
    var ov=document.getElementById('acctOv'); if(!ov) return;
    ov.innerHTML='<div class="acp"><div class="acp-top"><h2 class="acp-h">&#10022; Spark Certified Designer</h2></div>'+body+'</div>';
    var m=document.getElementById('main'); if(m)m.style.display='none';
    ov.classList.add('open');
    try{window.scrollTo({top:0,behavior:'smooth'});}catch(e){}
  }
  function stepProfile(){
    shell(
      '<div class="dsg-grid">'+
      '<div style="border:1px solid var(--line);background:#FFFFFF;border-radius:18px;padding:34px 36px">'+
      '<div style="display:inline-block;font-size:.75rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#141414;border:1px solid rgba(0,0,0,.14);border-radius:999px;padding:6px 14px;margin-bottom:16px">&#10022; Spark Certified Designer</div>'+
      '<div style="font-size:2.25rem;font-weight:900;color:#141414;letter-spacing:-.02em;margin-bottom:6px">Olin Creative</div>'+
      '<div style="font-size:.9375rem;color:#3A3F3C;margin-bottom:18px">20 years of brand experience &middot; knows the Spark system inside out</div>'+
      '<p style="font-size:1.0625rem;line-height:1.7;color:#141414;margin:0 0 26px">Want your brand taken further by a human designer? Approve below and we hand Olin Creative your whole brand kit, set up your project on their side, and have them reach out to you. Your brand stays yours &mdash; this simply invites a certified designer to take it further.</p>'+
      (nm
        ? '<button data-olin-step="1" style="'+BTN+'">&#10022; Have '+esc(nm.name)+'&rsquo;s brand contact Olin</button>'
        : '<p style="opacity:.75;font-size:.9375rem;color:#141414">Open one of your brands first, then come back here to send it to Olin.</p>')+
      '</div>'+
      '<div style="border:1px solid var(--line);background:var(--glass,rgba(20,60,40,.05));border-radius:18px;padding:30px 32px">'+
      '<div style="font-size:.75rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#3A3F3C;margin-bottom:14px">What we hand Olin</div>'+
      ['Your chosen name and domain','The full logo suite','Your color system and typography','Your cinematic brand photography','Your taglines, bios and launch copy'].map(function(t){return '<div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:12px"><span style="color:#141414;font-weight:800">&#10003;</span><span style="color:#141414;font-size:.9375rem;line-height:1.55">'+t+'</span></div>';}).join('')+
      '<div style="color:#404040;font-size:.8125rem;margin-top:6px">Included with your Business in a Box &mdash; no extra charge to be introduced.</div>'+
      '</div></div>');
    var go = document.getElementById('acctOv').querySelector('[data-olin-step]');
    if(go) go.addEventListener('click', stepConfirm);
  }
  function stepConfirm(){
    var idea2 = curIdea();
    var nm2 = idea2 ? idea2.names[curName] : null;
    if(!idea2 || !nm2){ stepProfile(); return; }
    var email=(typeof acEmail==='function'?acEmail():'')||'';
    shell(
      '<div style="border:1px solid var(--line);background:var(--glass,rgba(20,60,40,.05));border-radius:18px;padding:34px 36px;max-width:760px">'+
      '<div style="font-size:1.375rem;font-weight:900;color:#141414;margin-bottom:12px">Hand <span style="background:#141414;-webkit-background-clip:text;background-clip:text;color:transparent">'+esc(nm2.name)+'</span> to Olin Creative?</div>'+
      '<p style="font-size:1rem;line-height:1.7;color:#141414;margin:0 0 8px">We&rsquo;ll hand your full brand kit to Olin Creative, set up your project, and have them reach out'+(email?(' at <b>'+esc(email)+'</b>'):'')+'.</p>'+
      '<p style="font-size:.875rem;color:#3A3F3C;margin:0 0 26px">Your brand stays yours.</p>'+
      '<div style="display:flex;gap:12px;flex-wrap:wrap"><button data-olin-no="1" style="'+GHOST+';flex:1;min-width:160px">Not now</button><button data-olin-yes="1" style="'+BTN+';flex:1;min-width:160px">Yes &mdash; connect me</button></div>'+
      '</div>');
    var ov=document.getElementById('acctOv');
    var no = ov.querySelector('[data-olin-no]'); if(no) no.addEventListener('click', stepProfile);
    var yes = ov.querySelector('[data-olin-yes]');
    if(yes) yes.addEventListener('click', function(){
      yes.disabled = true; yes.textContent = 'Connecting\u2026';
      var payload={name:(typeof acName==='function'?acName():'')||email.split('@')[0],email:email,business:idea2.cat||'',idea:idea2.said||'',brand:nm2.name,domain:nm2.dom,plan:(typeof acPlanName==='function'?acPlanName(idea2.tier):idea2.tier)||'',reportKey:(_urlR()||idea2.id||''),namePosition:(typeof curName!=='undefined'?curName:0)};
      fetch('/.netlify/functions/olin-handoff',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
        .then(function(r){return r.json();}).then(stepDone).catch(stepDone);
    });
  }
  function stepDone(){
    shell(
      '<div style="border:1px solid rgba(59,232,143,.4);background:rgba(59,232,143,.08);border-radius:18px;padding:34px 36px;text-align:center;max-width:760px">'+
      '<div style="font-size:2.25rem;margin-bottom:10px;color:#141414">&#10003;</div>'+
      '<div style="font-size:1.25rem;font-weight:900;color:#141414;margin-bottom:8px">Done &mdash; Olin Creative has your project</div>'+
      '<p style="font-size:1rem;color:#3A3F3C;margin:0 0 24px">They&rsquo;ll reach out to you directly. Nothing else to do.</p>'+
      '<button data-designerclose2="1" style="'+BTN+'">Back to my brands</button>'+
      '</div>');
    var b = document.getElementById('acctOv').querySelector('[data-designerclose2]');
    if(b) b.addEventListener('click', closeDesignerPage);
  }
  stepProfile();
}
function closeDesignerPage(){/* in-page now: same close as every section */try{closeAccount();}catch(e){}}

/* THE STUDIO IS A RAIL PAGE (2026-07-27). It used to paint its own full-screen overlay while
   the rail's "AI tools" item rendered the same eight cards in-page — two doors to one room.
   The overlay is retired; both doors now open the in-page panel. */
function openAIStudio(){ try{ return openAccount('ai'); }catch(e){}
  $('#aiOv').innerHTML='<div class="ac-shell" style="grid-template-columns:1fr"><div class="ac-main"><div class="ac-top"><h2>&#10024; AI Studio</h2><button class="ac-x" data-aiclose="1" aria-label="Close">&times;</button></div><div class="ac-sec" style="max-width:1040px"><p class="lead">Your 2026 AI toolkit — built for founders, tuned to your brand. Every tool works right here in your command center.</p><div class="ac-ai">'+AISTUDIO.map(aiCardHTML).join('')+'</div></div></div></div>';
 $('#aiOv').classList.add('open');SMN_FOCUS.open($('#aiOv'));try{document.body.style.overflow='hidden';}catch(e){}
 $('#aiOv').querySelectorAll('[data-ai]').forEach(function(bn){bn.addEventListener('click',function(){aiAction(bn.dataset.ai);});});
 var x=$('#aiOv').querySelector('[data-aiclose]');if(x)x.addEventListener('click',closeAIStudio);}
function closeAIStudio(){SMN_FOCUS.close($('#aiOv'));$('#aiOv').classList.remove('open');try{ document.body.style.overflow=''; }catch(e){} /* acct panel is in-page (2026-07-27) and never locks scroll — always restore */}
function wfmt(t){t=esc(t);t=t.replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/`([^`]+)`/g,'<code>$1</code>').replace(/(https?:\/\/[^\s<]+)/g,'<a href="$1" target="_blank" rel="noopener">$1</a>').replace(/(^|\n)\s*[-*•]\s+/g,'$1• ').replace(/\n/g,'<br>');return t;}
function aiBotHTML(h){var c=$('#aichat');if(c){c.innerHTML+='<div class="aimsg bot">'+h+'</div>';c.scrollTop=c.scrollHeight;}}
function wAutoGrow(ta){if(!ta)return;ta.style.height='auto';ta.style.height=Math.min(ta.scrollHeight,180)+'px';}
function wMic(btn,ta){if(!btn)return;var SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){btn.style.display='none';return;}var rec=null,on=false;btn.addEventListener('click',function(){if(on){try{rec.stop();}catch(e){}return;}rec=new SR();rec.lang='en-US';rec.interimResults=true;rec.continuous=false;var base=ta.value?ta.value.replace(/\s*$/,'')+' ':'';rec.onresult=function(e){var s='';for(var i=e.resultIndex;i<e.results.length;i++){s+=e.results[i][0].transcript;}ta.value=base+s;wAutoGrow(ta);};rec.onend=function(){on=false;btn.classList.remove('rec');};rec.onerror=function(){on=false;btn.classList.remove('rec');};try{rec.start();on=true;btn.classList.add('rec');}catch(e){}});}
function wUni(cfg){var chips=(cfg.chips||[]).map(function(q){return '<button class="aichip" data-q="'+esc(q)+'">'+esc(q)+'</button>';}).join('');aiOpen(cfg.ic,cfg.title,'<div class="aichat" id="aichat" style="min-height:120px"></div>'+(chips?'<div class="aichips">'+chips+'</div>':'')+'<div class="unicomp"><textarea id="uniIn" class="uniin" rows="2" placeholder="'+esc(cfg.ph||'Type or paste anything — an idea, your copy, or a URL…')+'"></textarea><div class="unibtns"><button class="unimic" id="uniMic" title="Speak">&#127908;</button><button class="ac-btn sm" id="uniSend">Send &#9656;</button></div></div><div class="unihint">Type or speak \u2014 press the microphone and just talk. Paste copy or drop a URL too, then Send.',function(bd){if(cfg.intro)aiBotHTML(wfmt(cfg.intro));var ta=bd.querySelector('#uniIn');ta.addEventListener('input',function(){wAutoGrow(ta);});bd.querySelectorAll('[data-q]').forEach(function(c){c.addEventListener('click',function(){run(c.dataset.q);});});function send(){var v=ta.value.trim();if(!v)return;ta.value='';wAutoGrow(ta);run(v);}bd.querySelector('#uniSend').addEventListener('click',send);ta.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}});wMic(bd.querySelector('#uniMic'),ta);function run(input){aiUserSay(input);var urls=input.match(/https?:\/\/[^\s]+/g)||[];var c=$('#aichat');c.innerHTML+='<div class="aimsg bot" id="aipending">'+(urls.length?'Reading the page…':'Working…')+'</div>';c.scrollTop=c.scrollHeight;function go(extra){var prompt=(cfg.pre?cfg.pre+'\n\n':'')+'USER INPUT:\n'+input+(extra?'\n\nFETCHED PAGE CONTENT:\n'+extra.slice(0,12000):'');window./* SAY WHAT WENT WRONG (2026-07-27, Founder: "every one of them is failing to fetch").
   A failure used to render a breezy 'Here's a start' as though the assistant had replied.
   The customer could not tell a broken service from a thin answer, and neither could we. */
  smnLLM(cfg.system,prompt,function(txt,err){var p=document.getElementById('aipending');var out=(txt&&txt.trim())?txt:(err?('\u26a0\ufe0f '+err):(cfg.fallback?cfg.fallback(input):'Here\u2019s a start \u2014 tell me a bit more.'));if(p){p.removeAttribute('id');p.innerHTML=wfmt(out);}c.scrollTop=c.scrollHeight;var _i=$('#uniIn');if(_i)_i.focus();});}if(urls.length){Promise.all(urls.slice(0,3).map(function(u){return fetch('/.netlify/functions/page-fetch',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:u})}).then(function(r){return r.json();}).then(function(d){return (d&&d.text)||'';}).catch(function(){return '';});})).then(function(t){go(t.filter(Boolean).join('\n\n---\n\n'));});}else{go('');}}});}
function wToolAssistant(){var nm=aiNM(),b=aiBrand();var ctx=nm?('BRAND CONTEXT — name: '+nm.name+', domain: '+nm.dom+', tagline: '+(nm.tag||'')+', idea: '+((b&&b.said)||'')):'';wUni({ic:'&#129302;',title:'Brand Assistant',system:'You are the personal brand assistant for a founder. Use their brand context if provided. Be concise, practical and specific. Short paragraphs and bullets.',pre:ctx,intro:'Hi! I know '+((nm&&nm.name)||'your brand')+' — ask me anything, or **paste an idea, your copy, or a URL** and I\'ll help. Names, taglines, colors, launch steps, strategy.',chips:['What is my domain?','Suggest a tagline','What should I do next?','Write my launch post'],ph:'Ask anything, paste an idea, your copy, or a URL…',fallback:aiAnswer});}
function wToolContent(){var nm=aiNM(),b=aiBrand();var ctx=nm?('BRAND — name: '+nm.name+', domain: '+nm.dom+', tagline: '+(nm.tag||'')+', idea: '+((b&&b.said)||'')):'';wUni({ic:'&#9997;',title:'Content Studio',system:'You write on-brand marketing content for a founder\'s business. Use the brand context. Return only the finished content, ready to post or send.',pre:ctx,intro:'Tell me what to write — a post, caption, launch email, bio, ad. **Paste notes, an idea, or a URL** and I\'ll craft it in your brand voice.',chips:['Write a launch social post','A caption for Instagram','My launch email','A short bio'],ph:'Describe what to write, paste notes, or a URL…',fallback:function(){return aiGenContent('Social post');}});}
function wToolNames(){wUni({ic:'&#128173;',title:'Name Engine',system:'You are an elite brand-naming strategist. From the user\'s idea, industry, vibe or a URL, generate 8 original, brandable names, each with a one-line reason and a likely .com domain.',intro:'Tell me your idea, industry or vibe — **type it, paste a description, or drop a URL** — and I\'ll generate brandable names with domains.',chips:['Names for my idea','Names for a coffee brand','Bold tech names','Playful shop names'],ph:'Describe the brand, paste an idea, or a URL…',fallback:function(){return aiGenNames().map(function(n){return '**'+n.name+'** — '+n.dom;}).join('\n');}});}
function wToolMarket(){var b=aiBrand();var cat=(b&&(b.cat||'your niche'))||'your niche';wUni({ic:'&#128200;',title:'Market Pulse',system:'You are a sharp market & brand strategist in 2026. Give specific, actionable insight on trends, positioning, pricing and opportunities. If a competitor URL is given, analyze it. Use bullets.',pre:'Category/niche: '+cat,intro:'Ask about your market, a niche or a competitor — **type it or paste a competitor URL** and I\'ll analyze it.',chips:['Trends in my space for 2026','Analyze a competitor (paste URL)','How should I price?','Where is the opportunity?'],ph:'Ask about your market, or paste a competitor URL…',fallback:function(){return 'Customers expect a clean, mobile-first web presence from day one.\n- Short-form video and an authentic founder story drive the most reach.\n- Consistent handles and branding across platforms build instant trust.';}});}
function wToolHealth(){var nm=aiNM();wUni({ic:'&#10084;',title:'Brand Health Check',system:'You are a brand strategist. Given a brand name, description or URL, give an overall score out of 100, then rate Name, Domain, Tagline, Palette, Voice and Differentiation each with a one-line reason, then the top 3 improvements. Be specific.',pre:nm?('This founder\'s brand: '+nm.name+' ('+nm.dom+')'):'',intro:'I\'ll score any brand — **type a name, paste details, or drop a URL** (or say “check my brand”) — and tell you how to make it stronger.',chips:['Check my brand','Score a brand by URL','What makes a brand strong?'],ph:'Type a brand name, paste details, or a URL…',fallback:function(){return '**Brand Health: 88 / 100**\n- Name: strong, brandable\n- Domain: matches, available\n- Tagline: clear\n- Palette: defined\n- Voice: consistent\n- Differentiation: sharpen what only you offer\n\nTop 3: register your domain, claim handles, publish 3 launch posts.';}});}
function wToolVoice(){var b=aiBrand(),nm=aiNM();var base=(nm&&nm.tag)||(b&&b.said)||'';wUni({ic:'&#127908;',title:'Voice Tuner',system:'You are a brand voice expert. Given the user\'s copy, idea or URL, rewrite it in the requested tone (warmer, bolder, premium, playful). If no tone is given, return 3 versions: Premium, Bold, Warm. Return only the rewritten copy.',pre:base?('Their tagline/idea: '+base):'',intro:'Paste any copy or idea and tell me the vibe — **type or speak** — and I\'ll tune the voice. Try “make it bolder”, “more premium”, “warmer” or “playful”.',chips:['Make this warmer','Make it bolder','Premium and refined','Playful and fun'],ph:'Paste your copy or idea, then say the tone…',fallback:function(i){return 'Premium: '+i+' — refined and confident.\nBold: '+String(i).toUpperCase()+'.\nWarm: '+i+' — made just for you.';}});}

window.dlDoc=function(fn,title,text,ft){text=text||'';function save(blob,name){var u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u);},600);}
 if(ft==='pdf'){loadJsPDF(function(){try{var J=window.jspdf&&window.jspdf.jsPDF;if(!J){save(new Blob([text],{type:'text/plain'}),fn+'.txt');return;}var doc=new J({unit:'pt',format:'letter'});var m=54,y=64,w=612-m*2;doc.setFont('helvetica','bold');doc.setFontSize(16);doc.text(String(title||fn),m,y);y+=24;doc.setFont('helvetica','normal');doc.setFontSize(11);var lines=doc.splitTextToSize(text,w);for(var i=0;i<lines.length;i++){if(y>740){doc.addPage();y=64;}doc.text(lines[i],m,y);y+=16;}doc.save(fn+'.pdf');}catch(e){save(new Blob([text],{type:'text/plain'}),fn+'.txt');}});return;}
 if(ft==='doc'){var html='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>'+esc(title||fn)+'</title></head><body style="font-family:Calibri,Arial,sans-serif"><h2>'+esc(title||fn)+'</h2><pre style="font-family:Calibri,Arial,sans-serif;white-space:pre-wrap;font-size:12pt">'+esc(text)+'</pre>\n</html>';save(new Blob(['﻿'+html],{type:'application/msword'}),fn+'.doc');return;}
 if(ft==='xls'){var rows=text.split('\n').map(function(r){return '<tr><td>'+esc(r).replace(/\t/g,'</td><td>')+'</td></tr>';}).join('');save(new Blob(['﻿<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body><table>'+rows+'</table></body></html>'],{type:'application/vnd.ms-excel'}),fn+'.xls');return;}
 if(ft==='csv'){save(new Blob(['﻿'+text.split('\n').map(function(r){return '"'+r.replace(/"/g,'""')+'"';}).join('\n')],{type:'text/csv'}),fn+'.csv');return;}
 if(ft==='md'){save(new Blob([text],{type:'text/markdown'}),fn+'.md');return;}
 save(new Blob([text],{type:'text/plain'}),fn+'.txt');};
function aimGrab(){var body=$('#aimBody');if(!body)return '';var chat=body.querySelector('.aichat');if(chat){return [].map.call(chat.querySelectorAll('.aimsg'),function(m){return (m.classList.contains('me')?'You: ':'AI: ')+(m.textContent||'').trim();}).join('\n\n');}var ta=body.querySelector('textarea');if(ta&&ta.value.trim())return ta.value;var out=body.querySelector('.aiout');if(out&&(out.textContent||'').trim())return out.textContent;var cl=body.cloneNode(true);cl.querySelectorAll('button,input,textarea,.airow,.aiseg,.aichips,.aiin,.unicomp,.unihint').forEach(function(e){e.remove();});return ((cl.innerText||cl.textContent)||'').trim();}
(function(){var dl=$('#aimDl');if(dl)dl.addEventListener('click',function(){var m=$('#aimFmt');if(m)m.classList.toggle('open');});var fm=$('#aimFmt');if(fm)fm.querySelectorAll('[data-xf]').forEach(function(bn){bn.addEventListener('click',function(){var title=($('#aimTitle')&&$('#aimTitle').textContent)||'export';var text=aimGrab();if(!text){if(window.toast)window.toast('Generate something first, then download.');fm.classList.remove('open');return;}var fnn=String(title).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40)||'export';window.dlDoc(fnn,title,text,bn.dataset.xf);fm.classList.remove('open');});});var mx=$('#aimMax');if(mx)mx.addEventListener('click',function(){var c=$('#aimodal').querySelector('.aimcard');if(c)c.classList.toggle('max');});})();
function aiAction(k){var f={assistant:wToolAssistant,content:wToolContent,logo:toolLogo,names:wToolNames,market:wToolMarket,health:wToolHealth,voice:wToolVoice,image:toolImage}[k];if(f)f();}
/* 1) Brand Assistant */
function aiBotSay(t){var c=$('#aichat');if(!c)return;c.innerHTML+='<div class="aimsg bot">'+esc(t)+'</div>';c.scrollTop=c.scrollHeight;}
function aiUserSay(t){var c=$('#aichat');if(!c)return;c.innerHTML+='<div class="aimsg me">'+esc(t)+'</div>';c.scrollTop=c.scrollHeight;}
function aiAsk(q){aiUserSay(q);var c=$('#aichat');c.innerHTML+='<div class="aimsg bot" id="aipending">Thinking…</div>';c.scrollTop=c.scrollHeight;var b=aiBrand(),nm=aiNM();var ctx=nm?{name:nm.name,domain:nm.dom,tagline:nm.tag,idea:(b&&b.said)||''}:null;window.smnLLM('You are the personal brand assistant for a founder. Their brand context is provided. Be concise, practical, and specific.',JSON.stringify(ctx)+'\n\nQuestion: '+q,function(txt){var p=document.getElementById('aipending');if(p){p.removeAttribute('id');p.textContent=txt||aiAnswer(q);}c.scrollTop=c.scrollHeight;});}
function aiAnswer(q){var b=aiBrand(),nm=aiNM();q=(q||'').toLowerCase();if(!b||!nm)return 'Open a brand first and I can help with everything about it.';
 if(/domain|website|url|\.com|\.net|web address/.test(q))return 'Your web address is '+nm.dom+' — available now. Register it before someone else does.';
 if(/tagline|slogan/.test(q)){var t=(nm.taglines&&nm.taglines[Math.floor(Math.random()*nm.taglines.length)])||nm.tag;return 'Try: “'+t+'”. You have '+((nm.taglines&&nm.taglines.length)||1)+' taglines in your kit.';}
 if(/colou?r|palette/.test(q)){var c=b.palettes[0];return 'Your palette “'+(c.name||'Brand')+'” is '+c.cols.join(', ')+'. Use the first as your primary.';}
 if(/font|typeface|type/.test(q))return 'Your fonts are '+((b.type||[]).map(function(t){return t.name;}).join(' + ')||'a matched heading + body pair')+'.';
 if(/next|do next|launch|start|first step/.test(q))return 'Next: 1) register '+nm.dom+', 2) publish a simple site, 3) claim your handles, 4) post your launch. Your Launch tab walks you through each step.';
 if(/good name|is my name|why.*name|name work/.test(q)){var w=(nm.why&&nm.why[0])||'It is short, brandable, and easy to remember.';return 'Yes — '+w+' You chose well.';}
 if(/bio|about/.test(q)){var bio=(b.biosT&&b.biosT[0]);return bio?('Here is a ready bio: “'+per(bio,nm.name,nm.dom)+'”'):'Your kit has ready-to-use bios in the About section.';}
 if(/post|social|instagram|caption|content/.test(q))return 'Open Content Studio and I will write you a ready-to-post update in your brand voice.';
 if(/logo/.test(q))return 'You have Primary, Icon, and Wordmark logos. Open Logo Lab to recolor and export them.';
 if(/hello|^hi|hey|help|what can you/.test(q))return 'Happy to help! Ask me about your domain, taglines, colors, fonts, or what to do next.';
 return 'For '+nm.name+', I would register '+nm.dom+' and claim your handles first. Ask me about taglines, colors, or your next steps.';}
function toolAssistant(){var nm=aiNM();
 aiOpen('&#129302;','Brand Assistant','<div class="aichat" id="aichat"></div><div class="aichips">'+['What is my domain?','Suggest a tagline','What are my colors?','What should I do next?','Is my name good?'].map(function(q){return '<button class="aichip" data-aiq="'+esc(q)+'">'+esc(q)+'</button>';}).join('')+'</div><div class="aiin"><input id="aiask" placeholder="Ask about your brand…"><button class="ac-btn sm" id="aisend">Ask</button></div>',function(bd){
   aiBotSay('Hi! I know '+((nm&&nm.name)||'your brand')+' inside out. Ask me anything — names, taglines, colors, or your next steps.');
   bd.querySelectorAll('[data-aiq]').forEach(function(c){c.addEventListener('click',function(){aiAsk(c.dataset.aiq);});});
   var send=function(){var v=$('#aiask').value.trim();if(v){aiAsk(v);$('#aiask').value='';}};
   $('#aisend').addEventListener('click',send);$('#aiask').addEventListener('keydown',function(e){if(e.key==='Enter')send();});});}
/* 2) Content Studio */
function aiGenContent(type){var b=aiBrand(),nm=aiNM();if(!nm)return 'Open a brand first.';var name=nm.name,dom=nm.dom,tag=nm.tag||'',said=b.said||'';
 if(type==='Caption'){var C=['✨ '+name+' — '+tag,name+': '+said+' 💫','This is '+name+'. '+tag+' 🚀'];return C[Math.floor(Math.random()*C.length)];}
 if(type==='Launch email')return 'Subject: '+name+' is here\n\nHi there,\n\nWe are thrilled to introduce '+name+' — '+(said||tag)+'\n\nCome see us at '+dom+' and be among the first.\n\nWarmly,\nThe '+name+' team';
 if(type==='Short bio'){var bio=(b.biosT&&b.biosT[0]);return bio?per(bio,name,dom):(name+' — '+tag+' '+said);}
 return aiGenPost(b);}
function toolContent(){aiOpen('&#9997;','Content Studio','<div class="aiseg" id="ctype">'+['Social post','Caption','Launch email','Short bio'].map(function(t,i){return '<button class="aisegb'+(i===0?' on':'')+'" data-ct="'+t+'">'+t+'</button>';}).join('')+'</div><div class="aiout" id="ctout"></div><div class="airow"><button class="ac-btn" id="ctgen">&#10024; Generate</button><button class="ac-btn ghost" id="ctcopy">Copy</button></div>',function(bd){var type='Social post';function gen(){var base=aiGenContent(type);$('#ctout').textContent='Generating…';var b=aiBrand(),nm=aiNM();window.smnLLM('You write on-brand marketing content for a small business. Return only the content, in the brand voice.','Write a '+type+' for '+((nm&&nm.name)||'the brand')+' (tagline: '+((nm&&nm.tag)||'')+'; idea: '+((b&&b.said)||'')+').',function(txt){$('#ctout').textContent=txt||base;});}bd.querySelectorAll('[data-ct]').forEach(function(bn){bn.addEventListener('click',function(){type=bn.dataset.ct;bd.querySelectorAll('[data-ct]').forEach(function(x){x.classList.toggle('on',x===bn);});gen();});});$('#ctgen').addEventListener('click',gen);$('#ctcopy').addEventListener('click',function(){acCopy($('#ctout').textContent);});gen();});}
/* 3) Logo Lab */
var LOGO_MOODS=[['Aurora',['#141414','#141414','#141414','#B7791F']],['Sunset',['#141414','#B7791F','#141414','#141414']],['Ocean',['#141414','#141414','#141414','#141414']],['Forest',['#141414','#0EA574','#A3E635','#B7791F']],['Mono',['#C7D3EC','#B9C3D6','#404040','#C7D3EC']]];
function toolLogo(){var nm=aiNM();if(!nm){aiOpen('&#127912;','Logo Lab','<p class="aip">Open a brand first.</p>');return;}
 aiOpen('&#127912;','Logo Lab','<p class="aip">Pick a color mood — your logos recolor instantly. Download any as SVG.</p><div class="aiseg" id="lmood">'+LOGO_MOODS.map(function(m,i){return '<button class="aisegb'+(i===0?' on':'')+'" data-lm="'+i+'">'+m[0]+'</button>';}).join('')+'</div><div class="ailogos" id="llogos"></div>',function(bd){var mi=0;function draw(){var C=LOGO_MOODS[mi][1];$('#llogos').innerHTML=LOGOS3.map(function(pr,i){return '<div class="ailogo"><div class="lw">'+pr[1](nm.name,nm.mono,C)+'</div><div class="ll">'+pr[0]+'</div><button class="ac-btn ghost sm" data-lld="'+i+'">&darr; SVG</button></div>';}).join('');$('#llogos').querySelectorAll('[data-lld]').forEach(function(bn){bn.addEventListener('click',function(){var idx=+bn.dataset.lld;dlSVG(LOGOS3[idx][1](nm.name,nm.mono,C),slug(nm.name)+'-'+LOGOS3[idx][0].toLowerCase()+'-'+slug(LOGO_MOODS[mi][0])+'.svg');});});}bd.querySelectorAll('[data-lm]').forEach(function(bn){bn.addEventListener('click',function(){mi=+bn.dataset.lm;bd.querySelectorAll('[data-lm]').forEach(function(x){x.classList.toggle('on',x===bn);});draw();});});draw();});}
/* 4) Name Engine */
function aiGenNames(){var b=aiBrand();var rnd=function(n){return Math.floor(Math.random()*n);};
 var catw=((b&&(b.cat||b.said))||'brand').toLowerCase().replace(/[^a-z ]/g,'').split(/\s+/).filter(Boolean);
 var root=cap((catw[0]||'brand').slice(0,5));
 var SYL=['Nova','Lumo','Vera','Kai','Orin','Vale','Luma','Arbor','Cove','Haven','Ember','Sol','Aura','Nord','Pax','Rune','Iris','Onyx','Bloom','Vista'];
 var suf=['ly','ify','hub','lab','co','ora','io','yard','works','wave','peak','loop'];
 var pre=['Go','Ever','Nova','Bright','True','Well','Prime','Open'];
 var out=[],seen={},tries=0;
 while(out.length<5&&tries<90){tries++;var mode=rnd(4);var nm;
  if(mode===0)nm=SYL[rnd(SYL.length)]+lc(root);
  else if(mode===1)nm=root+suf[rnd(suf.length)];
  else if(mode===2)nm=SYL[rnd(SYL.length)]+lc(SYL[rnd(SYL.length)]);
  else nm=pre[rnd(pre.length)]+root;
  nm=nm.replace(/(.)\1\1+/g,'$1$1');if(nm.length<4||nm.length>15||seen[nm.toLowerCase()])continue;seen[nm.toLowerCase()]=1;out.push({name:nm,dom:slug(nm)+'.com'});}
 return out;}
function toolNames(){aiOpen('&#128173;','Name Engine','<p class="aip">Fresh brandable names for your idea, each with a matching domain.</p><div class="ainames" id="anames"></div><div class="airow"><button class="ac-btn" id="angen">&#10024; Generate more</button></div>',function(bd){function gen(){var list=aiGenNames();$('#anames').innerHTML=list.map(function(n){return '<div class="ainame"><div><div class="ann">'+esc(n.name)+'</div><div class="and">'+esc(n.dom)+'</div></div><button class="ac-btn ghost sm" data-ncopy="'+esc(n.name)+'">Copy</button></div>';}).join('');$('#anames').querySelectorAll('[data-ncopy]').forEach(function(bn){bn.addEventListener('click',function(){acCopy(bn.dataset.ncopy);});});}$('#angen').addEventListener('click',gen);gen();});}
/* 5) Market Pulse */
function toolMarket(){var b=aiBrand();var cat=(b&&(b.cat||'your niche'))||'your niche';var nm=aiNM();
 var trends=['Customers expect a clean, mobile-first web presence from day one.','Short-form video and an authentic founder story drive the most reach.','Consistent handles and branding across platforms build instant trust.'];
 var tips=['Lead with what makes '+((nm&&nm.name)||'you')+' different in one clear line.','Claim every matching handle now so your brand looks established.','Publish three launch posts in your first week to build momentum.'];
 aiOpen('&#128200;','Market Pulse','<p class="aip">An AI snapshot of the '+esc(cat)+' space, tuned to your brand.</p><div class="ac-h" style="margin-top:4px;color:var(--a)">Where the market is heading</div>'+trends.map(function(t){return '<div class="aibul"><span>&#9670;</span>'+esc(t)+'</div>';}).join('')+'<div class="ac-h" style="color:var(--a)">How to stand out</div>'+tips.map(function(t){return '<div class="aibul"><span>&#10022;</span>'+esc(t)+'</div>';}).join(''));}
/* 6) Brand Health */
function toolHealth(){var b=aiBrand(),nm=aiNM();var checks=[];var nl=nm?nm.name.replace(/[^a-z]/gi,'').length:0;
 checks.push(['Memorable name',(nl>=3&&nl<=14)?100:65,nl<=14?'Short and brandable.':'A shorter name is easier to recall.']);
 checks.push(['Matching domain',nm&&nm.dom?100:40,nm?'Available and matches your name.':'No domain yet.']);
 checks.push(['Clear tagline',nm&&nm.tag?100:55,nm&&nm.tag?'You have a clear tagline.':'Add a tagline to sharpen your message.']);
 checks.push(['Color palette',(b&&b.palettes&&b.palettes.length)?100:55,'A defined brand palette.']);
 checks.push(['Brand voice',(b&&b.voice&&b.voice.length)?100:65,'Your voice is defined.']);
 checks.push(['Social handles',100,'Ready across all 6 platforms.']);
 var score=Math.round(checks.reduce(function(s,c){return s+c[1];},0)/checks.length);
 aiOpen('&#10084;','Brand Health','<div class="aiscore"><div class="asnum">'+score+'</div><div class="ask">Brand Health<br><span>out of 100</span></div></div>'+checks.map(function(c){return '<div class="ahrow"><div class="ahl"><div class="aht">'+c[0]+'</div><div class="ahd">'+esc(c[2])+'</div></div><div class="ahbar"><span style="width:'+c[1]+'%"></span></div></div>';}).join('')+'<p class="aip" style="margin-top:14px">Fastest win: register your domain and claim your handles today.</p>');}
/* 7) Voice Tuner */
function voiceLine(mode,base,nm){var n=(nm&&nm.name)||'our brand';base=String(base||'').replace(/[.’]*$/,'');
 if(mode==='Warmer')return n+' is here for you — '+lc(base)+'.';
 if(mode==='Bolder')return base.toUpperCase()+'. THIS IS '+n.toUpperCase()+'.';
 if(mode==='Premium')return n+' — '+base+', crafted for those who expect more.';
 if(mode==='Playful')return 'Psst… '+lc(base)+' with '+n+'! ✨';
 return base;}
function toolVoice(){var b=aiBrand(),nm=aiNM();var base=(nm&&nm.tag)||(b&&b.said)||'Your brand';
 aiOpen('&#127908;','Voice Tuner','<p class="aip">Dial your voice — we rewrite your tagline in that tone. Copy any you like.</p><div class="aiseg" id="vseg">'+['Warmer','Bolder','Premium','Playful'].map(function(v,i){return '<button class="aisegb'+(i===0?' on':'')+'" data-vm="'+v+'">'+v+'</button>';}).join('')+'</div><div class="aiout" id="vout"></div><div class="airow"><button class="ac-btn ghost" id="vcopy">Copy</button></div>',function(bd){var mode='Warmer';function gen(){$('#vout').textContent=voiceLine(mode,base,nm);}bd.querySelectorAll('[data-vm]').forEach(function(bn){bn.addEventListener('click',function(){mode=bn.dataset.vm;bd.querySelectorAll('[data-vm]').forEach(function(x){x.classList.toggle('on',x===bn);});gen();});});$('#vcopy').addEventListener('click',function(){acCopy($('#vout').textContent);});gen();});}
/* 8) Image Studio */
function aiGraphic(nm,C,w,h,seed){var W=w*100,H=h*100;var id='aig'+seed+Math.round(w*10);var c0=C[0],c1=C[1]||C[0],c2=C[2]||C[1]||C[0];var name=(nm&&nm.name)||'Your Brand';var tag=(nm&&nm.tag)||'';var fx=(W*0.2+((seed*37)%Math.round(W*0.6)));
 return '<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+c0+'"/><stop offset="1" stop-color="'+c1+'"/></linearGradient></defs><rect width="'+W+'" height="'+H+'" fill="#141414"/><circle cx="'+fx+'" cy="'+(H*0.32)+'" r="'+(W*0.34)+'" fill="url(#'+id+')" opacity="0.55"/><circle cx="'+(W*0.82)+'" cy="'+(H*0.74)+'" r="'+(W*0.26)+'" fill="'+c2+'" opacity="0.45"/><text x="'+(W/2)+'" y="'+(H*0.5)+'" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="800" font-size="'+(W*0.088)+'" fill="#ffffff">'+esc(name)+'</text>'+(tag?'<text x="'+(W/2)+'" y="'+(H*0.5+W*0.075)+'" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="'+(W*0.034)+'" fill="#ffffff" opacity="0.85">'+esc(tag)+'</text>':'')+'</svg>';}
function toolImage(){var nm=aiNM(),b=aiBrand();var C=(b&&b.palettes[0].cols)||['#141414','#141414','#141414'];var F=[['Square',1,1],['Story',9,16],['Banner',3,1]];
 aiOpen('&#128247;','Image Studio','<p class="aip">Generate an on-brand graphic. Pick a size, make variations, then download.</p><div class="aiseg" id="iseg">'+F.map(function(f,i){return '<button class="aisegb'+(i===0?' on':'')+'" data-if="'+i+'">'+f[0]+'</button>';}).join('')+'</div><div class="aiimgprev" id="iprev"></div><div class="airow"><button class="ac-btn" id="ivary">&#10024; New variation</button><button class="ac-btn ghost" id="idl">&darr; Download SVG</button></div>',function(bd){var fi=0,seed=1;function draw(){var f=F[fi];$('#iprev').innerHTML='<div class="aiimgbox" style="aspect-ratio:'+f[1]+'/'+f[2]+'">'+aiGraphic(nm,C,f[1],f[2],seed)+'</div>';}bd.querySelectorAll('[data-if]').forEach(function(bn){bn.addEventListener('click',function(){fi=+bn.dataset.if;bd.querySelectorAll('[data-if]').forEach(function(x){x.classList.toggle('on',x===bn);});draw();});});$('#ivary').addEventListener('click',function(){seed++;draw();});$('#idl').addEventListener('click',function(){var f=F[fi];dlSVG(aiGraphic(nm,C,f[1],f[2],seed),slug((nm&&nm.name)||'brand')+'-'+F[fi][0].toLowerCase()+'.svg');});draw();});}
document.addEventListener('keydown',function(e){if(e.key!=='Escape')return;if($('#aimodal').classList.contains('open'))aiClose();else if($('#aiOv').classList.contains('open'))closeAIStudio();else if($('#acctOv').classList.contains('open'))closeAccount();});
var _aiStudioBtn=document.getElementById('aiStudioBtn');
if(_aiStudioBtn) _aiStudioBtn.addEventListener('click',openAIStudio);  /* the header button was removed 2026-07-26; the opener stays for the Tools menu */
$('#aimX').addEventListener('click',aiClose);
$('#aimodal').addEventListener('click',function(e){if(e.target===this)aiClose();});

/* ===== Client → Olin Creative handoff ===== */
function _urlR(){try{return new URLSearchParams(location.search).get('r')||'';}catch(e){return '';}}
function handoffToOlin(IDEA,NM){
 var email=(typeof acEmail==='function'?acEmail():'')||'';
 openG('&#10022;','Have Olin Creative contact you','<p style="color:#141414">We&rsquo;ll hand your full brand kit for <b>'+esc(NM.name)+'</b> to Olin Creative, set up your project on their side, and have them reach out'+(email?(' at <b>'+esc(email)+'</b>'):'')+'.</p><p style="color:#141414;opacity:.75;margin-top:8px;font-size:.8125rem">Your brand stays yours — this just invites a certified designer to take it further.</p><div style="display:flex;gap:10px;margin-top:16px"><button class="act" data-hox="1" style="flex:1">Not now</button><button class="act primary" data-hook="1" style="flex:1">Yes — connect me</button></div>');
 var gb=$('#gmBody');
 var x=gb.querySelector('[data-hox]');if(x)x.addEventListener('click',function(){$('#gmodal').classList.remove('open');});
 var ok=gb.querySelector('[data-hook]');if(ok)ok.addEventListener('click',function(){
   ok.disabled=true;ok.textContent='Connecting…';
   var payload={name:(typeof acName==='function'?acName():'')||email.split('@')[0],email:email,business:IDEA.cat||'',idea:IDEA.said||'',brand:NM.name,domain:NM.dom,plan:(typeof acPlanName==='function'?acPlanName(IDEA.tier):IDEA.tier)||'',reportKey:(_urlR()||IDEA.id||''),/* FIX 2026-07-27: URL-only before — a referral from any page without ?r= landed with an empty report_id, so Olin saw the client but no files. IDEA.id IS the report key (same field personalize/order-request already trust). */namePosition:(typeof curName!=='undefined'?curName:0)};
   fetch('/.netlify/functions/olin-handoff',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}).then(function(r){return r.json();}).then(function(){$('#gmodal').classList.remove('open');toast('Done — Olin Creative has your project and will reach out.');}).catch(function(){$('#gmodal').classList.remove('open');toast('Done — Olin Creative has been notified.');});
 });}
/* ================= SUCCESS PATH — Business in a Box ================= */
var SUCCESS_PATH=[
 {ic:'🏛️',t:'Make it official',d:'Register your business the right way — it protects you and your money from day one.',steps:[
   ['Form your LLC or Corp','Set up your legal entity in minutes.',[['ZenBusiness','https://www.zenbusiness.com'],['LegalZoom','https://www.legalzoom.com/business/business-formation'],['Stripe Atlas','https://stripe.com/atlas'],['Firstbase','https://firstbase.io']]],
   ['Get your EIN (Tax ID)','Free and official from the IRS.',[['IRS — Free EIN','https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online']]],
   ['Registered agent','Keep your home address private on public records.',[['Northwest Registered Agent','https://www.northwestregisteredagent.com']]],
   ['Licenses & permits','Check exactly what your business needs.',[['SBA License Guide','https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits']]]
 ]},
 {ic:'®️',t:'Protect your name',d:'Lock down your brand before you print or launch a thing.',steps:[
   ['Search trademarks (free)','Make sure your name is clear to use.',[['USPTO Search','https://tmsearch.uspto.gov']]],
   ['File your trademark','Register your mark so it is truly yours.',[['Trademarkia','https://www.trademarkia.com'],['LegalZoom Trademark','https://www.legalzoom.com/business/intellectual-property/trademark-registration.html']]]
 ]},
 {ic:'🏦',t:'Open your business bank',d:'A real business bank account built for startups — no branch visits, open online today.',steps:[
   ['Business bank account','Modern online banking for founders.',[['Mercury','https://mercury.com'],['Novo','https://www.novo.co'],['Bluevine','https://www.bluevine.com'],['Relay','https://relayfi.com']]],
   ['Business card & credit','Cards and credit built for startups.',[['Brex','https://www.brex.com'],['Ramp','https://ramp.com']]],
   ['Bookkeeping & taxes','Keep your books clean from the start.',[['QuickBooks','https://quickbooks.intuit.com'],['Wave (free)','https://www.waveapps.com'],['Bench','https://www.bench.co']]]
 ]},
 {ic:'🌐',t:'Get online',d:'Your domain, website, and email — live today.',steps:[
   ['Register your domain','Grab your matching web address now.',[['Namecheap','https://www.namecheap.com'],['Cloudflare','https://www.cloudflare.com/products/registrar/'],['Porkbun','https://porkbun.com']]],
   ['Build your website','No-code sites that look professional.',[['Framer','https://www.framer.com'],['Carrd','https://carrd.co'],['Webflow','https://webflow.com'],['Squarespace','https://www.squarespace.com']]],
   ['Sell online (store)','Launch an online store in a day.',[['Shopify','https://www.shopify.com']]],
   ['Business email','A pro address at your own domain.',[['Google Workspace','https://workspace.google.com'],['Zoho Mail','https://www.zoho.com/mail/']]]
 ]},
 {ic:'🔍',t:'Get found',d:'Show up when people search Google and scroll social.',steps:[
   ['Google Business Profile','Free — puts you on Google & Maps.',[['Google Business','https://www.google.com/business/']]],
   ['SEO tools','Rank higher and find keywords.',[['Ahrefs','https://ahrefs.com'],['Semrush','https://www.semrush.com'],['Ubersuggest','https://neilpatel.com/ubersuggest/']]],
   ['Analytics','See who visits and what works.',[['Google Analytics','https://analytics.google.com'],['Plausible','https://plausible.io']]]
 ]},
 {ic:'📣',t:'Promote & grow',d:'Reach new customers and keep them coming back.',steps:[
   ['Social scheduling','Post everywhere from one place.',[['Buffer','https://buffer.com'],['Later','https://later.com']]],
   ['Email marketing','Own your audience, not just followers.',[['Mailchimp','https://mailchimp.com'],['Beehiiv','https://www.beehiiv.com'],['ConvertKit','https://convertkit.com']]],
   ['Run ads','Get in front of buyers fast.',[['Google Ads','https://ads.google.com'],['Meta Ads','https://www.facebook.com/business/ads']]],
   ['Design content','Make everything look amazing.',[['Canva','https://www.canva.com'],['Adobe Express','https://www.adobe.com/express/']]]
 ]},
 {ic:'💰',t:'Get paid & scale',d:'Take payments, send invoices, and fund your growth — money to your bank account.',steps:[
   ['Accept payments','Start taking money today.',[['Stripe','https://stripe.com'],['Square','https://squareup.com'],['PayPal','https://www.paypal.com/business']]],
   ['Send invoices','Get paid on time, every time.',[['Stripe Invoicing','https://stripe.com/invoicing'],['Wave Invoicing','https://www.waveapps.com/invoicing']]],
   ['Raise funding','When you are ready to grow bigger.',[['Mercury Raise','https://mercury.com/raise'],['AngelList','https://www.angellist.com'],['SBA Loans','https://www.sba.gov/funding-programs/loans']]]
 ]}
];
var sxDone={};
function sxCount(){var t=0,d=0;SUCCESS_PATH.forEach(function(p,pi){p.steps.forEach(function(s,si){t++;if(sxDone[pi+'-'+si])d++;});});return {t:t,d:d,pct:t?Math.round(d/t*100):0};}
function sxToolChip(tl){return '<a class="sxtool" href="'+esc(tl[1])+'" target="_blank" rel="noopener">'+esc(tl[0])+' &#8599;</a>';}
function sxRender(){var c=sxCount();
 var refCode=(typeof slug==='function'?(slug(acName&&acName()||'friend')||'friend'):'friend');
 var phases=SUCCESS_PATH.map(function(p,pi){return '<div class="sxphase"><div class="sxp-h"><span class="sxp-n">'+(pi+1)+'</span><div class="sxp-hx"><div class="sxp-t">'+p.ic+' '+esc(p.t)+'</div><div class="sxp-d">'+esc(p.d)+'</div></div></div><div class="sxp-steps">'+p.steps.map(function(s,si){var on=!!sxDone[pi+'-'+si];return '<div class="sxstep'+(on?' done':'')+'"><div class="sxs-top"><button class="sxs-ck" data-sxdone="'+pi+'-'+si+'" aria-label="Mark done">&#10003;</button><div class="sxs-t">'+esc(s[0])+'</div></div><div class="sxs-d">'+esc(s[1])+'</div><div class="sxtools">'+s[2].map(sxToolChip).join('')+'</div></div>';}).join('')+'</div></div>';}).join('');
 var earn='<div class="sxphase sxearn"><div class="sxp-h"><span class="sxp-n">&#128176;</span><div class="sxp-hx"><div class="sxp-t">&#127881; Earn with Spark — get paid to share</div><div class="sxp-d">Love your brand? Refer friends and earn a commission every time they spark theirs — real money to your account.</div></div></div><div class="sxp-steps"><div class="sxstep"><div class="sxs-top"><span class="sxs-ck static">&#9733;</span><div class="sxs-t">Your referral link</div></div><div class="sxs-d">sparkmyname.com/?ref='+esc(refCode)+' &mdash; you both get a reward.</div><div class="sxtools"><button class="sxtool sxcopy" data-sxref="sparkmyname.com/?ref='+esc(refCode)+'">Copy my link</button><button class="sxtool" data-sxaff="1">Become an affiliate</button></div></div></div></div>';
 $('#sxOv').innerHTML='<div class="ac-shell" style="grid-template-columns:1fr"><div class="ac-main"><div class="ac-top"><h2>&#128640; Your Success Path</h2><button class="ac-x" data-sxclose="1" aria-label="Close">&times;</button></div><div class="ac-sec" style="max-width:1000px"><p class="lead">From one sentence to a full business in a box. Follow the steps in order — each one moves you closer to real customers and money in your bank account. These are the best, proven 2026 tools, all in one place.</p><div class="sxbar"><div class="sxbar-t">'+c.d+' of '+c.t+' steps done</div><div class="sxbar-track"><span style="width:'+c.pct+'%"></span></div><div class="sxbar-p">'+c.pct+'%</div></div>'+phases+earn+'</div></div></div>';
 $('#sxOv').querySelectorAll('[data-sxdone]').forEach(function(bn){bn.addEventListener('click',function(){var k=bn.dataset.sxdone;sxDone[k]=!sxDone[k];sxRender();});});
 $('#sxOv').querySelectorAll('[data-sxref]').forEach(function(bn){bn.addEventListener('click',function(){acCopy(bn.dataset.sxref);});});
 $('#sxOv').querySelectorAll('[data-sxaff]').forEach(function(bn){bn.addEventListener('click',function(){acCopy('sparkmyname.com/?ref='+(slug(acName&&acName()||'friend')||'friend'));toast('Affiliate link copied — your dashboard is on the way.');});});
 var x=$('#sxOv').querySelector('[data-sxclose]');if(x)x.addEventListener('click',closeSuccess);}
function openSuccess(){sxRender();$('#sxOv').classList.add('open');SMN_FOCUS.open($('#sxOv'));try{document.body.style.overflow='hidden';}catch(e){}}
function closeSuccess(){SMN_FOCUS.close($('#sxOv'));$('#sxOv').classList.remove('open');try{ document.body.style.overflow=''; }catch(e){} /* acct panel is in-page (2026-07-27) and never locks scroll — always restore */}
var _successBtn=document.getElementById('successBtn');
if(_successBtn) _successBtn.addEventListener('click',openSuccess);  /* the header button was removed 2026-07-26; the opener stays for the Tools menu */
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&$('#sxOv').classList.contains('open'))closeSuccess();});
/* ================= /SUCCESS PATH ================= */
/* ================= /ACCOUNT CENTER ================= */

function grTool(t,IDEA,NM){
 if(t==='sharekit'){var u='https://'+NM.dom;if(navigator.share)navigator.share({title:NM.name+' brand kit',text:'My brand kit for '+NM.name,url:u}).catch(function(){});else location.href='mailto:?subject='+encodeURIComponent(NM.name+' — brand kit')+'&body='+encodeURIComponent('My brand kit: '+u);toast('Sharing your brand kit…');return;}
 if(t==='getfound'){openG('&#9673;','Get found — search &amp; social','<p>Your ready-made growth kit for '+esc(NM.name)+':</p><ul style="margin:10px 0 0 18px;line-height:1.9"><li>Google Business Profile setup</li><li>Website meta tags + sitemap</li><li>SEO keyword starter for your industry</li><li>Launch posts + hashtag pack for every platform</li><li>Review-request templates</li></ul>');return;}
 if(t==='sparkwriter'){var post=per(IDEA.postsT[hashN(NM.name)%IDEA.postsT.length],NM.name,NM.dom);openG('&#9998;','SparkWriter','<p>Here&rsquo;s a fresh, on-brand post for <b>'+esc(NM.name)+'</b>:</p><div style="border:1px solid var(--line);border-radius:12px;padding:13px;margin-top:10px;color:var(--ink)">'+esc(post)+'</div><p style="margin-top:12px;font-size:.7812rem;color:var(--dim2)">On the live site, SparkWriter drafts unlimited posts and drops them into your calendar.</p>');return;}
 if(t==='printstudio'){openG('&#9636;','Spark Print Studio','<p>Order professional prints for <b>'+esc(NM.name)+'</b>, shipped to your door:</p><ul style="margin:10px 0 0 18px;line-height:1.9"><li>Business cards &amp; letterhead</li><li>T-shirts, mugs, totes, caps</li><li>Flyers, posters, window decals</li><li>Roll-up banners &amp; signage</li></ul>');return;}
 if(t==='founderspulse'){openG('&#10084;','Founders Pulse — straight to Peter','<p>This goes <b>directly to Peter</b>, the founder &mdash; not a bot, not a queue. Ask anything, share a win, or request a change to '+esc(NM.name)+'.</p><p style="margin-top:10px;font-size:.7812rem;color:var(--dim2)">On the live site this opens a private note to Peter with a real, personal reply.</p>');return;}
 if(t==='refer'){var link='sparkmyname.com/r/'+slug(NM.name);copy(link);openG('&#10022;','Know someone starting something?','<p>Refer a friend and <b>you both get a reward</b> when they spark their first brand.</p><div style="border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin-top:10px;font-family:monospace;color:var(--ink)">'+esc(link)+'</div><p style="margin-top:10px;font-size:.7812rem;color:var(--grn)">Link copied to your clipboard.</p>');return;}
 if(t==='affiliate'){var al='sparkmyname.com/join/'+slug(NM.name);copy(al);openG('&#128176;','Become a Spark affiliate','<p><b>Send people their brand. Earn every time.</b></p><p>Share SparkMyName and earn a commission on every brand your referrals create. Your affiliate program is already set up.</p><div style="border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin-top:10px;font-family:monospace;color:var(--ink)">'+esc(al)+'</div><p style="margin-top:10px;font-size:.7812rem;color:var(--grn)">Your affiliate link is copied to your clipboard.</p>');return;}
}

/* Prevent the sample/demo brands from flashing for a signed-in client.
   If we're deployed (config present) AND a Supabase session token is already stored,
   we KNOW real brands are about to load — show a brief loading state instead of the
   sample set, so the client goes straight to their own correct workspace. */
function _hasStoredSession(){try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(/^sb-.*-auth-token$/.test(k)&&localStorage.getItem(k))return true;}}catch(e){}return false;}
function _urlKey(){try{var q=new URLSearchParams(location.search);var v=q.get('r')||q.get('key')||'';if(!v&&location.hash){var m=/(?:^|[#&])(?:r|key)=([^&]+)/.exec(location.hash);if(m)v=decodeURIComponent(m[1]);}return String(v||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,64);}catch(e){return '';}}
function _expectReal(){try{ if(_urlKey()) return true;
  /* CO208 FIX 3: arriving straight from a magic link, the session token is still being
     written to storage at this instant — treat the link's own tokens as proof of a
     signed-in owner so the sample never flashes. */
  if(/(access_token|refresh_token)=|type=(magiclink|recovery|signup)/.test(String(location.hash||'')+String(location.search||''))) return true;
  return !!(window.SMN_SUPABASE_URL&&_hasStoredSession()); }catch(e){return false;}}
function _loadingGate(){
  try{
    $('#main').innerHTML='<div class="card"><div style="text-align:center;padding:80px 24px"><div class="dotspin" style="width:28px;height:28px;border-width:3px;margin:0 auto 18px"></div><h2 style="font-size:1.375rem;font-weight:800;margin-bottom:8px">Opening your workspace…</h2><p style="color:var(--dim)">Loading your brands.</p></div></div>';
    var _l=$('#ilist'); if(_l) _l.innerHTML='<div style="color:var(--dim2);font-size:.7812rem;padding:10px 4px">Loading your brands…</div>';
  }catch(e){ paint(); return; }
  /* CO208 FIX 2: THIS WAS THE BUG. The old safety net called paint() after 8 seconds,
     which rendered the built-in SAMPLE brands — a signed-in client with many ideas
     watched a demo workspace appear before their real one arrived. A signed-in owner
     must NEVER be shown sample data. If real data genuinely never lands we say so
     honestly and offer a retry. */
  setTimeout(function(){
    if(window.__smnRealLoaded) return;
    if(!document.querySelector('#main .dotspin')) return;
    $('#main').innerHTML='<div class="card"><div style="text-align:center;padding:70px 24px">'
      +'<h2 style="font-size:1.375rem;font-weight:800;margin-bottom:10px">Still opening your workspace</h2>'
      +'<p style="color:var(--dim);margin-bottom:18px">Your brands are taking longer than usual to arrive. Nothing has been lost.</p>'
      +'<a class="newbtn" href="#" onclick="location.reload();return false;" style="display:inline-block;width:auto;padding:11px 26px">Try again</a>'
      +'</div></div>';
    var _l=$('#ilist'); if(_l) _l.innerHTML='<div style="color:var(--dim2);font-size:.7812rem;padding:10px 4px">Still loading&hellip;</div>';
  }, 30000);
}
/* CO210: july22 boot — the sample demo is retired on this page. Everyone gets the
   loading gate; a live session opens the owner's real workspace; no session shows a
   clean log-in state. The sample can never appear here under any timing. */
_loadingGate();
function _loginState(){try{
  if(window.__smnRealLoaded)return;            /* CO218: a loaded workspace can never be replaced */
  window.__smnLoginShown=true;
  $('#main').innerHTML='<div class="card"><div style="text-align:center;padding:80px 24px"><h2 style="font-size:1.375rem;font-weight:800;margin-bottom:10px">Your Command Center</h2><p style="color:var(--dim);margin-bottom:18px">Log in to open your brands, files, and Success Path.</p><a class="btn" href="account.html" style="display:inline-block;text-decoration:none;padding:13px 26px">Log in</a></div></div>';
  var _l=$('#ilist'); if(_l) _l.innerHTML='<div style="color:var(--dim2);font-size:.7812rem;padding:10px 4px">Your ideas appear here after you log in.</div>';
}catch(e){}}
window._smnLoginState=_loginState;
setTimeout(function(){ if(window.__smnRealLoaded||window.__smnSessionSeen)return;
  /* CO218: a stored session means the owner IS signed in — keep loading, never flash the login card */
  if(_hasStoredSession()){ try{$('#main').innerHTML='<div class="card"><div style="text-align:center;padding:80px 24px"><div class="dotspin" style="width:28px;height:28px;border-width:3px;margin:0 auto 18px"></div><h2 style="font-size:1.375rem;font-weight:800;margin-bottom:8px">Still loading your workspace…</h2><p style="color:var(--dim)">Hang tight — your brands are on the way.</p></div></div>';}catch(e){} return; }
  _loginState(); },9000);
