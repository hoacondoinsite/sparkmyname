// namingIntelligence.js — SparkMyName Universal Naming Intelligence Layer
// Sits BETWEEN the homepage form and the generator. It does NOT generate names.
// It classifies the request, builds a hidden Naming Profile, and returns it so the
// generator can name with the correct psychology. It also exposes a deterministic
// junk filter and a feedback-signal schema. Runs locally (no AI, no latency, no cost).
//
// Public API:
//   buildProfile(selectedType, rawInput)  -> Naming Profile JSON (the structure Peter specified)
//   profilePrompt(profile)                -> string injected into the generator prompt
//   isJunk(name, profile)                 -> true if a candidate violates the profile
//   junkReason(name, profile)             -> reason code if junk, else null
//   feedbackSignal(action, name, profile, reasonCode) -> structured row ready to persist
//   REASON_CODES, PARENTS, MASTER_CATEGORIES

const intel = require('./name-intel.js');

const MASTER_CATEGORIES = [
  'Local Services','Home Services','Professional Services','Health & Wellness','Food & Beverage',
  'Restaurant / Hospitality','Beauty / Personal Care','Creative Services','Media / Creator','Podcast / Audio',
  'YouTube / Video','Newsletter / Publishing','Education / Course','Coaching / Consulting','Technology / SaaS',
  'AI Tools','Mobile Apps','E-commerce / Shop','Retail Brand','Product Brand','Real Estate / Property',
  'Finance / Insurance','Legal / Compliance','Construction / Trades','Automotive','Fitness / Sports',
  'Travel / Tourism','Kids / Family','Pets / Animals','Events / Entertainment','Nonprofit / Cause',
  'Luxury / Premium Brand','Industrial / Manufacturing','Agriculture / Outdoors','Community / Membership',
  'Website / Digital Property','Personal Brand','Local Business','Global Brand','Other / Unknown'
];

// Keyword signatures, checked in order (specific -> broad). First hit wins.
const PARENTS = [
  ['Legal / Compliance', ['law firm','law office','law group','lawyer','legal','attorney','counsel','paralegal','compliance','notary','title company','escrow','litigation']],
  ['Finance / Insurance', ['account','bookkeep','tax','financ','insurance','bank','mortgage','lending','investment','wealth','venture','crypto','fintech','payment','credit','ledger','payroll']],
  ['Real Estate / Property', ['real estate','realtor','property','brokerage','staging','appraisal','hoa','escrow']],
  ['Construction / Trades', ['plumb','electric','hvac','roofing','construction','contractor','concrete','masonry','welding','paving','asphalt','flooring','cabinet','countertop','garage door','gutter','waterproof','chimney','septic','fence','excavation','demolition','handyman','drywall','insulation','framing','deck builder','patio','hardscape','epoxy','machine shop','metal fab']],
  ['Home Services', ['cleaning','landscap','lawn','pest','tree service','junk','power wash','pressure wash','window cleaning','carpet clean','duct','mold','restoration','mosquito','wildlife','holiday lighting','closet','pool service','pool builder','irrigation','sprinkler','appliance repair','painter','painting','snow removal','solar','locksmith','security','alarm','smart home','generator','moving','courier']],
  ['Automotive', ['auto ','car ','tire','detailing','car wash','mechanic','transmission','brake','muffler','oil change','upholstery','car wrap','car audio','window tint','auto glass','motorcycle','rv dealer','boat','marine','dealership','used car','towing']],
  ['Beauty / Personal Care', ['salon','barber','spa','nail','lash','brow','tattoo','beauty','cosmetic','skincare','hair','waxing','tanning','makeup','microblading','grooming','aesthetic','botox','laser hair','perfume','fragrance','soap','bath & body','personal care']],
  ['Health & Wellness', ['medical','clinic','dental','dentist','therap','counsel','massage','optometr','chiropract','orthodont','dermatolog','urgent care','iv therapy','drip bar','home health','pharmacy','audiolog','physical therapy','acupunc','wellness','pediatric','ob/gyn','cardiolog','orthopedic','podiatry','occupational','speech','fertility','oral surg','denture','hearing','rehab']],
  ['Funeral / Memorial', ['funeral','memorial','mortuary','cemeter','cremat','burial','casket','hospice','undertaker','interment','columbarium','headstone']],
  ['Pets / Animals', ['pet','dog','cat','grooming','kennel','boarding','doggy','aquarium','reef','vet','veterinar','horse','equestrian','stable','animal']],
  ['Nightlife / Lounge', ['nightclub','night club','speakeasy','cocktail lounge','cocktail bar','rooftop bar','hookah','cabaret','nightlife','dance club','dj venue','after-hours','supper club','martini bar','tiki bar']],
  ['Restaurant / Hospitality', ['restaurant','cafe','coffee shop','bakery',' bar','pub','brewery','dessert','catering','food truck','diner','brunch','pizzeria','pizza','deli','sandwich','bagel','donut','taqueria','taco','sushi','steakhouse','seafood','bbq','barbecue','ramen','noodle','juice','smoothie','acai','ice cream','creamery','wine bar','sports bar','gastropub','cidery','boba','frozen yogurt','cupcake','cake','pie shop','macaron','patisserie','churro','pretzel','crepe','waffle','hotel','motel',' inn','bed & breakfast','food hall','trattoria','bistro','eatery']],
  ['Food & Beverage', ['butcher','winery','vineyard','distillery','tea brand','coffee brand','energy drink','snack','beverage','soda','supplement','protein','pet food','cheese shop','spice shop','gourmet','grocery','meal kit','produce','fishmonger','greengrocer','honey','chocolate','candy','liquor','growler','cookware','farm stand']],
  ['Education / Course', ['course','e-learning','elearning','school','academy','tutor','test prep','montessori','preschool','daycare','curriculum','class','lesson','workshop','bootcamp','training program','university','college','stem','coding academy','culinary','cosmetology school','trade school','admissions']],
  ['Coaching / Consulting', ['coach','consult','advisor','advisory','mentor','strateg']],
  ['AI Tools', ['ai tool','ai platform','ai assistant','ai software','automation','machine learning','artificial intelligence','llm','agent','copilot']],
  ['Technology / SaaS', ['saas','software','platform','crm','analytics','dashboard','api','dev tool','no-code','cybersecurity','cyber','it support','managed services','data ','cloud','infrastructure','startup','tech ']],
  ['Mobile Apps', ['mobile app','ios app','android app',' app','dating app','productivity app','fitness app','social app']],
  ['Podcast / Audio', ['podcast','audio show','radio show','audio network','recording studio']],
  ['YouTube / Video', ['youtube','video channel','vlog','streamer','twitch','video production','film production','animation']],
  ['Newsletter / Publishing', ['newsletter','publish','magazine','journal','zine','substack','digest','press','book publisher','literary']],
  ['Media / Creator', ['blog','content site','media site','news site','creator','influencer','channel']],
  ['E-commerce / Shop', ['ecommerce','e-commerce','online store','shopify','etsy','dropship','online shop','marketplace']],
  ['Retail Brand', ['store','shop','boutique','retail','outlet']],
  ['Product Brand', ['product','gadget','device','widget','brand of','line of','goods']],
  ['Fitness / Sports', ['gym','fitness','crossfit','pilates','yoga','spin','cycling studio','boxing','climbing','martial arts','dance studio','swim','gymnastics','cheer','sports','athletic','trainer','golf','tennis']],
  ['Travel / Tourism', ['travel','tour','tourism','vacation','charter','glamping','campground','shuttle','valet','jet ski','boat rental','bike rental','airbnb']],
  ['Kids / Family', ['kids','children','baby','toddler','family','maternity','nursery','toy','playground','camp']],
  ['Events / Entertainment', ['event','wedding','party','dj','entertainment','venue','banquet','photo booth','escape room','axe throwing','arcade','bowling','rental']],
  ['Nonprofit / Cause', ['nonprofit','non-profit','charity','foundation','cause','ngo','volunteer','community service','relief']],
  ['Industrial / Manufacturing', ['manufactur','industrial','factory','fabrication','packaging','warehouse','fulfillment','wholesale','distribution','freight','trucking','logistics','recycling','supply']],
  ['Agriculture / Outdoors', ['farm','agricultur','ranch','nursery','garden center','apiary','beekeep','orchard','outdoors','landscaping supply']],
  ['Creative Services', ['photograph','videograph','design studio','branding','creative','marketing','advertis','pr ','public relations','web design','graphic','copywrit','studio']],
  ['Professional Services', ['staffing','recruit','translation','surveying','architecture','engineering','investigat','virtual assistant','consulting']],
  ['Community / Membership', ['membership','community','club','co-op','coworking','association','network']],
  ['Local Services', ['repair','cobbler','tailor','dry clean','laundr','printing','sign company','screen print','print shop']]
];

// Per-parent naming psychology. dials are 1..10.
function P(emotion, style, avoid, must, mustnot, audience, cre, tru, cla, pre, pla) {
  return { emotion, style, avoid, must, mustnot, audience,
    levels: { creativity: cre, trust: tru, clarity: cla, premium: pre, playfulness: pla } };
}
const PROFILES = {
  'Legal / Compliance':        P(['trust','authority','stability'], ['serious','stable','established','trustworthy'], ['playful','cute','trendy','coined-nonsense'], 'a serious, established firm clients trust with high stakes', 'a startup, a toy, or a joke', 'people facing serious legal/financial matters', 2,10,9,7,1),
  'Finance / Insurance':       P(['trust','security','confidence'], ['solid','trustworthy','clear','established'], ['playful','cute','gimmicky'], 'a institution that protects your money', 'risky, gimmicky, or unstable', 'individuals and businesses protecting assets', 3,10,9,7,1),
  'Real Estate / Property':    P(['trust','aspiration','stability'], ['established','premium','clear','local-rooted'], ['cheap','cutesy','tech-jargon'], 'a trusted, premium local property name', 'a flashy gimmick', 'buyers, sellers, owners, investors', 3,9,8,7,2),
  'Construction / Trades':     P(['reliability','speed','strength'], ['literal','dependable','strong','no-nonsense; "Pro"/"Rapid" lockups work'], ['abstract','cutesy','tech-coined'], 'a fast, reliable, get-it-done local pro', 'a tech startup or an abstract brand', 'homeowners and GCs who need it done right', 2,9,9,3,2),
  'Home Services':             P(['reliability','speed','relief'], ['literal','clean','fast; "Pro"/"Rapid" work well'], ['abstract','corporate-gravitas','cutesy'], 'a dependable local crew that shows up', 'a cold corporation or an abstract brand', 'homeowners who want the problem gone', 2,9,9,3,3),
  'Automotive':                P(['speed','trust','reliability'], ['literal','fast','dependable; "Pro" works'], ['cutesy','abstract','luxury-soft'], 'a fast, trustworthy shop', 'a joke or an abstract brand', 'drivers who need quick reliable work', 3,9,9,3,2),
  'Beauty / Personal Care':    P(['confidence','beauty','self-care'], ['elegant','glowing','chic','evocative'], ['clinical-cold','industrial','blunt'], 'a polished, elegant, desirable brand', 'a hardware store or a law firm', 'clients seeking to look and feel their best', 7,6,6,8,5),
  'Health & Wellness':         P(['care','trust','relief'], ['clean','reassuring','clear','calm'], ['cutesy','gimmicky','cold-corporate'], 'a caring, capable, trustworthy practice', 'a gimmick or a cold corporation', 'patients seeking care they can trust', 4,9,8,5,2),
  'Funeral / Memorial':        P(['compassion','dignity','trust'], ['dignified','compassionate','timeless','gentle'], ['cute','punny','jokey','flippant','salesy'], 'a compassionate, dignified, trusted memorial provider', 'a joke, a pun, or anything flippant about loss', 'families honoring a loved one', 2,10,9,6,1),
  'Pets / Animals':            P(['warmth','playfulness','love'], ['warm','friendly','a little playful'], ['cold-corporate','clinical'], 'a warm, friendly, pet-loving brand', 'a sterile corporation', 'pet owners who treat pets like family', 6,7,7,5,7),
  'Restaurant / Hospitality':  P(['appetite','warmth','atmosphere'], ['warm','appetizing','evocative; "The ___ House" works'], ['corporate','techy','clinical'], 'an inviting place you want to eat at', 'an office park or a software company', 'hungry locals and visitors', 6,7,7,6,5),
  'Nightlife / Lounge':        P(['excitement','status','allure'], ['magnetic','current','exclusive','energetic'], ['corporate','stiff','dated','clinical'], 'a buzzy, exclusive, of-the-moment nightlife brand', 'a chain restaurant or an office park', 'people who want to be where the night is happening', 8,4,5,7,7),
  'Food & Beverage':           P(['craving','quality','freshness'], ['appetizing','premium or honest','clear'], ['corporate','clinical','off-putting words'], 'a craveable, quality food/drink brand', 'a chemical company', 'shoppers choosing on the shelf', 6,7,7,6,5),
  'Education / Course':        P(['growth','clarity','transformation'], ['outcome-based','clear','aspirational'], ['vague','gimmicky','childish-unless-kids'], 'a clear path to a real outcome', 'a vague buzzword salad', 'learners seeking a result', 5,8,8,5,3),
  'Coaching / Consulting':     P(['confidence','clarity','growth'], ['credible','clear','aspirational'], ['vague-guru','cheesy','generic'], 'a credible expert who gets results', 'a cheesy guru', 'clients seeking expert guidance', 5,8,8,6,3),
  'AI Tools':                  P(['intelligence','speed','clarity'], ['modern','sharp','clean; gravitas+AI works (Summit AI)'], ['cutesy','cartoonish','overlong'], 'a smart, modern, trustworthy AI product', 'a toy or a joke', 'builders and pros adopting AI', 8,7,7,6,2),
  'Technology / SaaS':         P(['confidence','efficiency','trust'], ['modern','short','brandable','investor-grade'], ['cutesy','literal-clunky','overlong'], 'a credible, scalable software company', 'a corner shop or a gimmick', 'businesses and developers', 7,7,7,6,2),
  'Mobile Apps':               P(['ease','delight','simplicity'], ['short','modern','easy to spell','app-store friendly'], ['long','hard-to-spell','corporate'], 'a clean, modern, tappable app', 'an enterprise contract', 'everyday phone users', 7,6,7,5,4),
  'Podcast / Audio':           P(['curiosity','connection','identity'], ['curious','spoken','memorable','cover-art ready'], ['corporate','techy','generic'], 'a show you want to tune into', 'a B2B vendor or a tire shop', 'listeners who subscribe', 7,5,6,5,5),
  'YouTube / Video':           P(['curiosity','energy','identity'], ['punchy','identity-forward','feed-ready'], ['corporate','stiff','generic'], 'a channel/handle people follow', 'a corporation', 'viewers and subscribers', 7,5,6,4,6),
  'Newsletter / Publishing':   P(['authority','curiosity','loyalty'], ['authoritative','curious','repeat-read; punchy "The ___"'], ['corporate-soft','vague'], 'a must-read with a point of view', 'a corporate memo', 'subscribers who open every issue', 6,7,7,5,3),
  'Media / Creator':           P(['curiosity','identity','trust'], ['punchy','editorial','memorable'], ['corporate','generic-media'], 'a sharp editorial voice', 'a faceless content farm', 'an audience that returns', 7,6,6,5,4),
  'E-commerce / Shop':         P(['discovery','trust','delight'], ['friendly','memorable','commercial'], ['corporate','abstract','hard-to-spell'], 'a shop people enjoy buying from', 'a faceless conglomerate', 'online shoppers', 6,7,7,5,5),
  'Retail Brand':              P(['discovery','belonging','quality'], ['friendly','memorable','product-relevant'], ['corporate','abstract'], 'a store people love to visit', 'a B2B vendor', 'in-store and online shoppers', 6,7,7,5,5),
  'Product Brand':             P(['benefit','trust','desire'], ['clear benefit','short','usable','category-aware'], ['vague','abstract','overlong'], 'a product whose name says the benefit', 'a random coined word', 'buyers comparing on a shelf', 6,7,8,6,4),
  'Fitness / Sports':          P(['energy','strength','motivation'], ['kinetic','bold','motivating'], ['soft','corporate','clinical'], 'an energizing, strong brand', 'a law firm', 'members chasing a goal', 6,7,7,5,5),
  'Travel / Tourism':          P(['adventure','escape','wonder'], ['evocative','place-rooted','inviting'], ['corporate','clinical'], 'an inviting escape', 'a cubicle', 'travelers seeking experiences', 7,6,6,6,5),
  'Kids / Family':             P(['warmth','safety','joy'], ['warm','bright','friendly'], ['cold','edgy','clinical'], 'a warm, safe, joyful brand', 'an industrial supplier', 'parents and kids', 6,7,7,4,7),
  'Events / Entertainment':    P(['excitement','celebration','fun'], ['festive','memorable','spirited'], ['stiff','corporate'], 'a fun, celebratory brand', 'an accounting firm', 'people celebrating', 6,6,6,5,6),
  'Nonprofit / Cause':         P(['hope','trust','purpose'], ['hopeful','clear','dignified'], ['corporate','flashy','salesy'], 'a credible cause people support', 'a sales pitch', 'donors and beneficiaries', 5,9,8,4,3),
  'Industrial / Manufacturing':P(['strength','reliability','scale'], ['solid','industrial','dependable'], ['cutesy','soft','playful'], 'a strong, capable industrial firm', 'a boutique or a toy', 'procurement and B2B buyers', 3,9,8,5,1),
  'Agriculture / Outdoors':    P(['honesty','earthiness','quality'], ['earthy','honest','rooted'], ['corporate','techy'], 'an honest, rooted, quality operation', 'a software company', 'growers, buyers, locals', 4,8,7,5,3),
  'Creative Services':         P(['craft','vision','trust'], ['polished','distinctive','professional','client-ready'], ['craft-fair-cutesy','whimsical-coined','corporate-stiff'], 'a polished creative studio clients trust with real budgets', 'a craft fair or an IT vendor', 'clients buying craft, vision, and reliability', 6,7,7,7,3),
  'Professional Services':     P(['competence','trust','clarity'], ['credible','clear','established'], ['cutesy','gimmicky'], 'a competent, trustworthy firm', 'a joke or a toy', 'businesses hiring expertise', 4,9,8,5,2),
  'Community / Membership':    P(['belonging','identity','warmth'], ['inviting','identity-forward','warm'], ['corporate','cold'], 'a place people belong', 'a faceless org', 'members and joiners', 6,6,6,5,5),
  'Website / Digital Property': P(['clarity','discovery','trust'], ['clear-topic','searchable','memorable'], ['vague','abstract'], 'a clear, findable digital property', 'a confusing abstraction', 'visitors who search and land', 6,6,8,4,4),
  'Personal Brand':            P(['identity','trust','distinctiveness'], ['personal','memorable','authentic'], ['corporate','generic'], 'an authentic personal brand', 'a faceless corporation', 'an audience following a person', 6,6,6,6,4),
  'Local Business':            P(['trust','familiarity','warmth'], ['approachable','local-rooted','clear'], ['corporate-cold','abstract'], 'a trusted neighborhood name', 'a distant conglomerate', 'local customers', 4,8,8,4,4),
  'Global Brand':              P(['ambition','distinctiveness','trust'], ['short','scalable','distinctive','world-ready'], ['narrow','local-locked','clunky'], 'a brand that travels the world', 'a hyper-local shop', 'a global audience', 7,7,7,7,3),
  'Luxury / Premium Brand':    P(['prestige','desire','refinement'], ['refined','elegant','restrained','premium'], ['cheap','loud','gimmicky'], 'a refined, prestigious brand', 'a discount outlet', 'discerning premium buyers', 7,7,6,10,2),
  'Local Services':            P(['reliability','trust','speed'], ['approachable','clear','dependable'], ['corporate-cold','abstract'], 'a dependable local service', 'a faceless corporation', 'local customers needing help', 4,8,8,4,4),
  'Other / Unknown':           P(['trust','clarity','appeal'], ['clear','substantial','real-company'], ['cutesy','random-word-mixer','overlong'], 'a real, credible business', 'a joke or a random word salad', 'a broad audience', 5,7,7,5,4)
};

// homepage button -> authoritative parent for "format" types
const TYPE_PARENT = {
  restaurant: 'Restaurant / Hospitality', podcast: 'Podcast / Audio', app: 'Mobile Apps',
  course: 'Education / Course', newsletter: 'Newsletter / Publishing', website: 'Website / Digital Property',
  shop: 'E-commerce / Shop', product: 'Product Brand'
};
// homepage button -> naming-style line (Peter's STYLE RULES table)
const TYPE_STYLE = {
  business: 'Trustworthy, clear, professional, easy to say.',
  startup: 'Modern, short, scalable, brandable, investor-quality.',
  brand: 'Memorable, emotional, visual, distinctive.',
  product: 'Clear benefit, short, usable, category-aware.',
  app: 'Short, modern, easy to spell, app-store friendly.',
  shop: 'Friendly, memorable, commercial, product-relevant.',
  restaurant: 'Appetite, atmosphere, location, cuisine, warmth.',
  podcast: 'Curiosity, audio feel, easy to say, cover-art potential.',
  website: 'Clear topic, searchable, memorable.',
  newsletter: 'Authority, curiosity, repeat-read value.',
  course: 'Outcome-based, clear, transformational.',
  other: 'Classify first, then borrow the closest naming psychology.'
};

function parentFromText(text) {
  const s = ' ' + String(text || '').toLowerCase() + ' ';
  for (let i = 0; i < PARENTS.length; i++) {
    const kws = PARENTS[i][1];
    for (let j = 0; j < kws.length; j++) { if (s.indexOf(kws[j]) >= 0) return PARENTS[i][0]; }
  }
  return null;
}

// The core: build the hidden Naming Profile.
function buildProfile(selectedType, rawInput) {
  const type = String(selectedType || 'other').toLowerCase().trim();
  const raw = String(rawInput || '').trim();

  // 1) specific category from the 300-category taste engine
  const scored = intel.classifyScored(raw || type);
  const specific = scored.label || 'business';
  const key = scored.key;

  // 2) parent category: format-type buttons are authoritative; then trust the engine's
  //    specific-category judgment; then fall back to a raw keyword scan.
  let parent = TYPE_PARENT[type] || parentFromText(specific) || parentFromText(raw);
  if (!parent) {
    // brand/startup/business/other fall back to sensible defaults
    if (type === 'startup') parent = 'Technology / SaaS';
    else if (type === 'brand') parent = 'Retail Brand';
    else if (type === 'business' || type === 'local') parent = parentFromText(raw) || 'Local Business';
    else parent = parentFromText(raw) || 'Other / Unknown';
  }
  const pr = PROFILES[parent] || PROFILES['Other / Unknown'];

  // 3) good/bad language patterns: pull straight from the founder's taste exemplars for this category
  const ex = (intel.EXEMPLARS && intel.EXEMPLARS[key]) || { love: [], avoid: [] };
  const good = (ex.love || []).slice(0, 6);
  const bad = (ex.avoid || []).slice(0, 6);

  // 4) naming style = button style + parent style
  const namingStyle = [];
  if (TYPE_STYLE[type]) namingStyle.push(TYPE_STYLE[type]);
  pr.style.forEach(x => namingStyle.push(x));

  // 5) dial nudges by button (a startup wants more creativity; a business wants more trust/clarity)
  const lv = Object.assign({}, pr.levels);
  if (type === 'startup') { lv.creativity = Math.min(10, lv.creativity + 1); }
  if (type === 'brand')   { lv.creativity = Math.min(10, lv.creativity + 1); lv.premium = Math.min(10, lv.premium + 1); }
  if (type === 'business'){ lv.trust = Math.min(10, lv.trust + 1); lv.clarity = Math.min(10, lv.clarity + 1); }
  if (type === 'product') { lv.clarity = Math.min(10, lv.clarity + 1); }

  return {
    raw_user_input: raw,
    selected_type: selectedType || '',
    detected_use_case: 'naming a ' + specific + (type && type !== 'other' ? ' (' + type + ')' : ''),
    parent_category: parent,
    specific_category: specific,
    audience: pr.audience,
    customer_emotion: pr.emotion,
    naming_style: namingStyle,
    avoid_styles: pr.avoid,
    good_language_patterns: good,
    bad_language_patterns: bad.concat(['joke-like','random word-mixer','hard to spell','hard to say','off-industry','too long']),
    must_sound_like: pr.must,
    must_not_sound_like: pr.mustnot,
    creativity_level: lv.creativity,
    trust_level: lv.trust,
    clarity_level: lv.clarity,
    premium_level: lv.premium,
    playfulness_level: lv.playfulness,
    _key: key,
    _confidence: scored.confidence
  };
}

// Prompt fragment the generator injects, so names are made FROM the profile.
function profilePrompt(p) {
  const dial = (n, v) => n + ' ' + v + '/10';
  const solemn = /funeral|memorial|hospice|cemeter|mortuary|cremat/i.test(String(p.parent_category) + ' ' + String(p.specific_category || ''));
  const vibe = /nightlife|nightclub|night club|lounge|speakeasy|cocktail|rooftop|hookah|cabaret|sports bar|dating app|streetwear|festival|\brave\b|dance club|after-hours/i.test(String(p.parent_category) + ' ' + String(p.specific_category || '') + ' ' + String(p.must_sound_like || ''));
  const food = /restaurant|hospitalit|food|beverage|baker|bakehouse|\bcafe\b|caf\u00e9|bistro|brasserie|trattoria|diner|eatery|\bgrill\b|kitchen|pizz|steakhouse|seafood|sushi|ramen|noodle|taco|taquer|cantina|\bdeli\b|patisser|creamer|gelat|\bbbq\b|barbecue|cuisine|pie shop|pastr|donut|bagel|sandwich|catering/i.test(String(p.parent_category) + ' ' + String(p.specific_category || '') + ' ' + String(p.must_sound_like || ''));
  const credibility = (!solemn && p.playfulness_level <= 3);
  const toneLine = solemn
    ? 'TONE \u2014 DIGNIFIED & SOLEMN: this is a serious, emotional, life-and-death field. Names must be compassionate, respectful, and quietly strong. Absolutely NO wordplay, puns, cute, clever, or lighthearted names \u2014 nothing that could read as flippant about loss. Grace and trust only.'
    : (credibility
      ? 'CREDIBILITY FIRST: clients in this field must take the brand seriously, so favor solid, established, professional names a discerning client would trust \u2014 the calibre a top advertising agency would present. Creativity is seasoning, not the dish: at most one light, intelligent twist (the simple confidence of "Pool Pros" or "Tire Pros"). NO cute, craft-fair, whimsical, gimmicky, or coined-nonsense names.'
      : 'Be genuinely creative and distinctive here \u2014 memorable, ownable, with real character \u2014 but every name must still feel like a real brand a customer respects, never random word-salad or filler.');
  const lines = [
    'NAMING PROFILE (follow strictly — generate names that hit these exact targets):',
    'This is ' + p.must_sound_like + '. Category: ' + p.specific_category + ' (' + p.parent_category + ').',
    'Audience: ' + p.audience + '.',
    'It must FEEL: ' + p.customer_emotion.join(', ') + '.',
    'Naming style: ' + p.naming_style.join(' '),
    'MUST sound like: ' + p.must_sound_like + '. MUST NOT sound like: ' + p.must_not_sound_like + '.',
    'Avoid these styles: ' + p.avoid_styles.join(', ') + '.',
    (p.good_language_patterns.length ? 'Names in exactly this winning style: ' + p.good_language_patterns.join(', ') + '.' : ''),
    'Never produce names that read as: ' + p.bad_language_patterns.join(', ') + '.',
    'Dials: ' + [dial('creativity', p.creativity_level), dial('trust', p.trust_level), dial('clarity', p.clarity_level), dial('premium', p.premium_level), dial('playfulness', p.playfulness_level)].join(', ') + '. Match these precisely.',
    toneLine,
    (vibe ? 'ENERGY & POSITIONING: this is a high-energy, trend-driven space \u2014 names should feel current, magnetic, and a little exclusive: the kind people screenshot and want to be seen at. Lean into energy, status, and modern edge over anything safe or corporate. Still real and pronounceable, never gibberish.' : ''),
    'RED-FLAG SCREEN (reject before showing): no offensive, vulgar, or negative-slang meanings in any common language; no embarrassing initials or acronyms; nothing that resembles a famous brand or trademark; no guaranteed-outcome or medical/legal promises (e.g. "CureAll", "Guaranteed"); no confusing spellings or unpronounceable mashups.',
    'REAL-WORLD TEST: each name must work on a truck, a sign, a business card, an invoice, and a Google listing \u2014 and a real customer should grasp it in about 3 seconds and feel safe contacting the business.',
    'AGENCY BAR: judge every name the way a five-person branding agency would \u2014 a brand strategist (does it fit the market?), a creative director (is it memorable and brandable?), a consumer psychologist (would customers trust or desire it?), a marketing director (can it be advertised clearly?), and a real business owner (would they actually put it on a sign, truck, and invoice?). Show only names all five would be proud to present. Fewer excellent names beat many average ones \u2014 never pad the set to hit a number.',
    'QUALITY FLOOR: hold serious, high-trust fields (funeral, legal, finance, accounting, medical) to the strictest bar \u2014 only names a cautious professional would trust; for trendy, high-energy fields (nightlife, dating, streetwear) reward memorability and energy. When in doubt, drop a name rather than ship a merely-okay one.',
    'FRESHNESS (mandatory): reject the first clich\u00e9 that comes to mind for this category. Do NOT lean on tired crutch words \u2014 e.g. Bella, Belle, Luxe, Glow, Chic, Mane, Tress (beauty); Rustic, Olive, Harvest, Hearth, Sterling, Heritage (food/serious); Elevate, Apex, Summit, Peak, Catalyst, Ignite, Thrive (corporate). Replace any obvious clich\u00e9 with something fresher and more distinctive. For elegant or ethnic styling (French, Italian, Greek, etc.), choose real, well-made words a native speaker would respect \u2014 never the most obvious tourist word.',
    (food ? 'FOOD & CUISINE (mandatory for food businesses): the name should tell a passerby what they would eat here \u2014 lean into the cuisine and the actual food. If a cuisine or nationality is signalled or implied (Italian, Greek, French, Japanese, Chinese, Mexican, Thai, Korean, Vietnamese, American, etc.), build the name from THAT culture\u2019s own real food, dish, ingredient, and place words and sounds, so a Chinese spot unmistakably reads Chinese, a French one reads French, a Greek one reads Greek \u2014 someone driving past should know the cuisine from the name. Match the EXACT sub-type to what they actually make: a bread bakery, a pastry shop, a pie shop, an ice-cream shop, and a full bakery-cafe should each read differently and true to their products. ABSOLUTELY do NOT default to the worn-out food clich\u00e9s \u2014 banned: Olive, Olive Oil, Hearth, Rustic, Harvest, Heritage, Bella, Tuscan, Artisan, Savory, and Fork/Spoon/Plate filler. Be fresh, specific, appetizing, and unmistakably of that food.' : ''),
    'JUNK FILTER: silently reject any candidate that is too silly for this category, too generic, too long, hard to spell or say, off-industry, a joke, or sounds like a random word-mixer. Replace rejects with stronger names. Quality over quantity — never pad with filler.'
  ];
  return lines.filter(Boolean).join(' ');
}

// ---- deterministic local junk filter (free, instant; runs on candidates before display) ----
const HARD_TO_SAY = /(.)\1\1|[bcdfghjklmnpqrstvwxz]{5,}/i;
function isJunk(name, p) { return junkReason(name, p) !== null; }
function junkReason(name, p) {
  const n = String(name || '').trim();
  if (!n) return 'too generic';
  const words = n.split(/\s+/);
  if (n.length > 26 || words.length > 4) return 'too long';
  if (HARD_TO_SAY.test(n.replace(/\s/g, ''))) return 'hard to say';
  const low = n.toLowerCase();
  // off-register: very playful name in a serious category
  if (p && p.playfulness_level <= 3 && /(giggle|jelly|pop|happy|silly|funky|zoom|whoosh|bonkers|wacky|yum|boop)/.test(low)) return 'too silly';
  // bad patterns lifted from the founder's taste (avoid list)
  if (p && p.bad_language_patterns) {
    for (let i = 0; i < p.bad_language_patterns.length; i++) {
      const b = String(p.bad_language_patterns[i]).toLowerCase();
      if (b.length > 3 && b.indexOf(' ') < 0 && low.indexOf(b) >= 0) return 'wrong category';
    }
  }
  if (!intel.screenName(n).ok) return 'wrong category';
  return null;
}

// ---- feedback schema (Keep / Modify / Junk + reason codes) ----
const REASON_CODES = ['too generic','too weird','too silly','wrong category','too boring','too long','hard to say','not premium enough','not clear enough','not creative enough'];
function feedbackSignal(action, name, profile, reasonCode) {
  const a = String(action || '').toLowerCase();
  const signal = a === 'keep' ? 1 : a === 'modify' ? 0 : a === 'junk' ? -1 : 0;
  return {
    ts: new Date().toISOString(),
    action: a, signal,
    name: String(name || ''),
    reason_code: REASON_CODES.indexOf(String(reasonCode)) >= 0 ? reasonCode : null,
    parent_category: profile && profile.parent_category || null,
    specific_category: profile && profile.specific_category || null,
    category_key: profile && profile._key || null
  };
}

module.exports = {
  buildProfile, profilePrompt, isJunk, junkReason, feedbackSignal,
  REASON_CODES, MASTER_CATEGORIES, PARENTS
};
