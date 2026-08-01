// category-dna.js — SparkMyName Category DNA Library (Top 50 revenue categories).
// Single source of truth for category understanding. Feeds BOTH the name engine
// (generate-names.js) and the brand-kit builder (build-kit.js). Each profile carries:
// world / audience / outcome / vocabulary / avoid / structures / feel / examples.
// match(seed) returns the most specific profile (array order = priority, specific first)
// or null. promptBlock(p) -> rich CATEGORY DNA block for the name prompt.
// kitHint(p) -> outcome/feel cue for the kit so palette+voice+posts express the outcome.

const PROFILES = [
  // ---------------- FOOD ----------------
  { key:'chinese', match:/\bchinese\b|sichuan|szechuan|cantonese|hunan|dim sum|\bwok\b|mandarin (kitchen|house)/,
    category:'Chinese Restaurant', world:'lanterns, the wok, fire and breath (wok hei), jade, pearl, plum, lotus, silk, the night market', audience:'locals and families wanting authentic, vivid, craveable Chinese food',
    outcome:'authentic heat and welcome — a place worth the trip', vocabulary:['Lantern', 'Jade', 'Pearl', 'Lotus', 'Plum', 'Silk', 'Wok', 'Phoenix', 'Bamboo', 'Ember', 'Eight', 'Crimson', 'Pepper', 'Hour'],
    avoid:['Golden Dragon / Panda tropes','Harvest/Table/Rustic (reads American)','Fork/Spoon','generic Asian Fusion'], structures:['one evocative word (Red Lantern, Wok Hei)','culture word + place (Jade Hour, Lotus Pavilion)','two-word heat/spice (Plum & Pepper)'],
    feel:'lantern-lit, bold, proud, authentic', examples:['Red Lantern', 'Jade Hour', 'Wok Hei', 'Plum & Pepper', 'Lotus Pavilion'] },
  { key:'italian', match:/\bitalian\b|trattoria|osteria|ristorante|pizzeria napole|cucina|salumeria/,
    category:'Italian Restaurant', world:'the courtyard, the hearth, olive and vine, marble, the table, the village square, nonna\'s kitchen', audience:'people wanting warm, real, rustic-elegant Italian food',
    outcome:'warmth, craft, the family table', vocabulary:['Cortile', 'Tavola', 'Forno', 'Vino', 'Olivo', 'Lume', 'Verace', 'Salt', 'Vine', 'Fico', 'Marble', 'Rosso', 'Bella'],
    avoid:['generic American-rustic (Willowmire, Thornwood)','Olive Garden tropes','Fork/Spoon/Plate'], structures:['real Italian word (Cortile, Lume, Forno)','Italian word + English (Salt & Vine)','village-name feel (Osteria Lume)'],
    feel:'warm, rustic-elegant, hand-made', examples:['Cortile', 'Salt & Vine', 'Osteria Lume', 'Forno & Fico', 'Vino Verace'] },
  { key:'mexican', match:/\bmexican\b|taqueria|cantina|taco shop|burrito|mexican grill|tex.?mex|birria/,
    category:'Mexican Restaurant', world:'agave, lime, fire-grill, the cantina, sun, chili, maize, marigold, fiesta', audience:'people wanting vibrant, fresh, festive Mexican food',
    outcome:'vibrant, fresh, festive flavor', vocabulary:['Agave', 'Lima', 'Sol', 'Maíz', 'Fuego', 'Cantina', 'Marigold', 'Calor', 'Verde', 'Mezcal', 'Chili', 'Brasa'],
    avoid:['sombrero/cartoon tropes','generic "Mexican Grill"','English-rustic words'], structures:['Spanish word (Agave, Brasa)','Spanish + English (Sol & Lima)','warm one-word (Maíz)'],
    feel:'sun-warm, festive, fresh', examples:['Agave & Lima', 'Sol Cantina', 'Brasa', 'Maíz', 'Mezcal Rosa'] },
  { key:'coffee', match:/\bcoffee\b|espresso|roaster|roastery|coffeehouse|barista|cold ?brew|cappuccino|latte/,
    category:'Coffee Shop', world:'crema, roast, steam, ember, the bean, the pour, the morning, the corner', audience:'locals who want a warm, characterful morning ritual',
    outcome:'a warm, unhurried morning ritual', vocabulary:['Ember', 'Crema', 'Roast', 'Steam', 'Pour', 'Bean', 'Day', 'Dawn', 'Cortado', 'Kettle', 'Stone', 'Hum', 'Slow'],
    avoid:['generic "Coffee Co"','tech jargon','the BANNED cliches','cold/clinical words'], structures:['one warm word (Emberline, Dayblend)','craft word + place (Steam & Stone)','the [ritual] (The Pour House)'],
    feel:'warm, crafted, neighborly', examples:['Emberline', 'Dayblend', 'Steam & Stone', 'The Pour House', 'Roastline'] },
  { key:'bakery', match:/bakery|baker\b|bakeshop|patisserie|pastry|cupcake|\bcake shop|bread\b|boulangerie/,
    category:'Bakery', world:'butter, flour, honey, crumb, the oven, warmth, sugar, bloom, the morning batch', audience:'people wanting fresh, charming, hand-made baked goods',
    outcome:'fresh, hand-made warmth', vocabulary:['Butter', 'Honey', 'Crumb', 'Bloom', 'Flour', 'Whisk', 'Sugar', 'Maple', 'Hearth', 'Loaf', 'Dough', 'Velvet'],
    avoid:['cold/corporate words','tech words','the BANNED cliches'], structures:['warm compound (Honeycrumb)','ingredient + ingredient (Butter & Bloom)','craft persona (Sugarsmith)'],
    feel:'charming, sweet, warm', examples:['Honeycrumb', 'Butter & Bloom', 'Sugarsmith', 'Maple & Whisk', 'Hearthloaf'] },
  { key:'icecream', match:/ice ?cream|gelato|creamery|\bscoop|frozen ?yogurt|froyo|sorbet|sundae|soft serve|custard stand/,
    category:'Ice Cream Shop', world:'the scoop, the cone, swirl, cloud, frost, churn, sprinkle, sweetness, summer', audience:'families and treat-seekers wanting joyful frozen desserts',
    outcome:'pure joy and sweetness', vocabulary:['Scoop', 'Cloud', 'Swirl', 'Churn', 'Frost', 'Sprinkle', 'Drizzle', 'Cone', 'Dollop', 'Cream', 'Sundae'],
    avoid:['corporate/clinical words','tech words','the BANNED cliches'], structures:['playful compound (Cloudscoop)','one fun word (Churned)','sweet pairing (Frost & Swirl)'],
    feel:'playful, sweet, joyful', examples:['Cloudscoop', 'Frostline', 'Churned', 'Swirl & Sprinkle', 'Dollop'] },
  { key:'steakhouse', match:/steakhouse|steak house|chophouse|\bsteak\b|prime rib|grill house/,
    category:'Steakhouse', world:'fire, the grill, coal, smoke, oak, the cut, embers, the cellar, marbled char', audience:'people wanting a serious, premium grilled-meat experience',
    outcome:'fire-cooked craft and occasion', vocabulary:['Ember', 'Coal', 'Smoke', 'Oak', 'Char', 'Hearth', 'Flame', 'Cellar', 'Cut', 'Brand', 'Iron', 'Hall'],
    avoid:['cute/soft words','tech words','the BANNED cliches'], structures:['fire word + hall/yard (Emberhall, The Coalyard)','fire + material (Smoke & Oak)'],
    feel:'warm-premium, smoky, masculine-classic', examples:['Emberhall', 'The Coalyard', 'Smoke & Oak', 'Char & Cellar', 'Ironflame'] },
  { key:'bargrill', match:/bar (and|&) grill|gastropub|sports bar|\bpub\b|taproom|tavern|brewpub|alehouse/,
    category:'Bar & Grill', world:'the taproom, hops, the local, the corner, oak, copper, the crowd, game night', audience:'locals wanting a relaxed neighborhood spot for food and drinks',
    outcome:'the easy local hangout', vocabulary:['Tap', 'Oak', 'Copper', 'Local', 'Corner', 'Barrel', 'Hop', 'Ember', 'Forge', 'Common'],
    avoid:['fine-dining pretension','tech words','the BANNED cliches'], structures:['the [place] (The Corner Tap)','material + tap/room (Copper & Oak)'],
    feel:'relaxed, neighborly, warm', examples:['The Corner Tap', 'Copper & Oak', 'Barrel & Forge', 'Common House'] },

  // ---------------- TRADES / HOME ----------------
  { key:'hvac', match:/\bhvac\b|heating (and|&) (air|cooling)|air ?condition|\bcooling\b|furnace|hvac/,
    category:'HVAC', world:'air, comfort, climate, the even temperature, fresh, calm, all-season ease', audience:'homeowners who want a comfortable, reliable home year-round',
    outcome:'year-round comfort you forget about', vocabulary:['Air', 'Comfort', 'Climate', 'Even', 'Fresh', 'Calm', 'Fair', 'Mild', 'Breeze', 'Hearth', 'Season'],
    avoid:['tools/parts (Duct, Compressor, Filter)','BANNED cliches (Apex, Summit, Peak)','cute words'], structures:['comfort word compound (Evenair)','feeling + trade (Comfort Line)','weather word (Fairweather)'],
    feel:'trustworthy, calm, dependable', examples:['Evenair', 'Comfort Line', 'Fairweather', 'Stillair'] },
  { key:'plumbing', match:/plumb|\bdrain\b|sewer|water heater|repipe/,
    category:'Plumbing', world:'water, flow, the source, the spring, clear, the current, reliability under pressure', audience:'homeowners who want fast, honest, reliable plumbing',
    outcome:'water that just works, no worry', vocabulary:['Flow', 'Clear', 'Source', 'Spring', 'Current', 'Main', 'Well', 'Tide', 'Cascade', 'Rapid'],
    avoid:['tools/parts (Pipe, Valve, Wrench, Drain)','BANNED cliches','cute words'], structures:['water word compound (Clearwater, Cascade)','water + main/spring (Mainspring)'],
    feel:'reliable, clean, honest', examples:['Clearwater', 'Mainspring', 'Wellspring', 'Cascade'] },
  { key:'design', match:/\b(graphic|web|interior|ux|ui|visual|product|industrial|logo|brand)\s+design\b|\bdesign\s+(studio|agency|firm|group|practice)\b|\billustration\b|\bbrand\s+identity\b/,
    category:'Design Studio', world:'craft and the studio, the eye, form and line, composition, type and ink, color and light, the hand of the maker, the portfolio, considered aesthetics', audience:'clients needing visual, brand, or spatial design - graphic, web, interior, product, brand identity',
    outcome:'a crafted, distinctive aesthetic - work that looks considered, original, and made by a real studio', vocabulary:['Atelier','Folio','Forma','Contour','Serif','Kerning','Pigment','Ink','Hue','Tint','Palette','Canvas','Vellum','Muse','Grain','Verve','Aperture','Silhouette','Proportion','Mark'],
    avoid:['tech-monoculture words (Quartz, Vela, Cobalt, Nimbus, Onyx, Zenith, Slate, Lattice, Layer, Sync, Loop, Stack, Bit, Grid, Logic, Core, Hq)','multi-world words that bleed (Render, Spectrum, Maker, Forge, bare Studio)','generic corporate filler (Solutions, Group, Global, Ventures, Hub)'], structures:['an evocative craft word + Studio / Atelier / & Co','a single aesthetic word as the brand (Vellum, Contour, Folio)','a founder-name studio is acceptable here'],
    feel:'crafted, warm, considered, aesthetic, made-by-hand - never cold, systemic, or tech', examples:['Atelier Verve','Folio Studio','Pigment & Co','Vellum','Contour'] },
  { key:'engineering', match:/\bengineer/,
    category:'Engineering Firm', world:'the PERCEPTION that wins an engineering client: permanence, trust, stability, confidence, long-term reliability - a firm a client can build their future on. Express this PERCEPTION; never name from the tools or jargon of engineering.', audience:'clients hiring a serious engineering firm for high-stakes work - they are choosing WHO TO TRUST, not buying a technical vocabulary',
    outcome:'the owner is proud to put it on the door and on a proposal, and a client instantly trusts it - confidence and permanence, never a technical description of the work', vocabulary:['EXPLORE brand DIRECTIONS that express the perception (these are approaches, not words to use literally)', 'an evocative OBJECT signaling foundation and permanence', 'a PLACE or geographic mark signaling precision and roots', 'a FOUNDER surname with gravity (+ & Associates / Partners)', 'a confident ABSTRACT word signaling strength', 'a coined, ownable mark'],
    avoid:['engineering tools / jargon - NEVER name from these (Torque, Datum, Truss, Gauge, Span, Plumb, Tolerance, Beam, Caliper, Schematic, Blueprint, Lateral, Fulcrum, Cantilever)','jewelry / precious-metal (Jewel, Karat, Sapphire, Gem, Aurum, Signet, Lustre, Bezel, Filigree, Opal, Gilded, Crown, Goldsmith, Platinum, Facet, Diamond)','tech-monoculture (Quartz, Cobalt, Onyx, Slate, Lattice, Vela, Orbit, Cinder, Nimbus, Zenith + Layer, Sync, Loop, Stack, Bit, Hq, Logic, Core, Grid, Forge)','corporate cliche (Apex, Summit, Peak, Pinnacle)','generic filler (Solutions, Group, Global, Ventures, Hub)'], structures:['a single ownable word as the brand','a founder surname (+ & Associates / Partners)','an object or place mark','stay FAR from the trade - the name must read as a serious firm that could belong in any high-stakes industry (portability test)'],
    feel:'trustworthy, permanent, established, strong, confident - a firm clients build their future on; never reads as a tool, a gem, or a tech startup', examples:['Bastion', 'Northcross', 'Halloran & Partners', 'Granite Ridge', 'Ironpoint'] },
  { key:'electrical', match:/electric|electrician|wiring|\bvolt|lighting (contractor|install)/,
    category:'Electrical', world:'current, light, the spark, the circuit, power, bright, the live wire, safety', audience:'homeowners and builders who want safe, expert electrical work',
    outcome:'safe, bright, powered-up', vocabulary:['Current', 'Bright', 'Volt', 'Circuit', 'Live', 'Beacon', 'Bolt', 'Lumen', 'Wire', 'Spark', 'Charge', 'Arc'],
    avoid:['tools/parts','BANNED cliches','overly cute words'], structures:['power word + trade (Brightpath Electric)','one charged word (Voltline, Livewire)'],
    feel:'sharp, safe, capable', examples:['Brightpath Electric', 'Voltline', 'Livewire', 'Beacon Electric', 'Arcwell'] },
  { key:'roofing', match:/\broof|reroof|shingle/,
    category:'Roofing', world:'the ridge, the peak of the house, shelter, the crown, weathertight, solid overhead', audience:'homeowners who want a roof that protects and lasts',
    outcome:'shelter that holds for decades', vocabulary:['Ridge', 'Crown', 'Shelter', 'Beam', 'Solid', 'Crest', 'Slate', 'Stone', 'Weather'],
    avoid:['BANNED cliches (Apex, Summit, Peak — overused in roofing)','tools','cute words'], structures:['ridge/crest word (Ridgeline)','solid + trade (Ridge Roofing)'],
    feel:'solid, protective, lasting', examples:['Ridgeline', 'Crestwell', 'Ridge Roofing', 'Slate & Beam', 'Stoneguard'] },
  { key:'landscaping', match:/landscap|lawn care|lawn service|\bgarden(ing| design)|hardscap|tree service|irrigation/,
    category:'Landscaping', world:'green, root, meadow, grove, stone, the seasons, the cared-for yard, growth', audience:'homeowners wanting a beautiful, well-kept outdoor space',
    outcome:'a green space they\'re proud of', vocabulary:['Green', 'Root', 'Meadow', 'Stone', 'Fern', 'Verdant', 'Field', 'Cedar', 'Bloom', 'Terra', 'Leaf'],
    avoid:['BANNED cliches','tools (Mower, Rake)','tech words'], structures:['nature compound (Greenfield, Stoneroot)','plant + place (Fernwell)'],
    feel:'natural, rooted, cared-for', examples:['Greenfield', 'Stoneroot', 'Fernwell', 'Verdant & Co', 'Cedar & Stone'] },
  { key:'construction', match:/construction|general contractor|home build|custom home|remodel|renovation|builder\b|framing/,
    category:'Construction', world:'the build, the frame, beam, stone, the blueprint, craft, the foundation, made-to-last', audience:'homeowners and developers wanting quality builds and remodels',
    outcome:'built right, built to last', vocabulary:['Built', 'Beam', 'Stone', 'Frame', 'Craft', 'Oak', 'Forge', 'Bedrock', 'Foundry', 'Plumb'],
    avoid:['BANNED cliches (Apex, Summit)','tools','cute words'], structures:['build word compound (Stonecraft)','material + build (Oakframe)'],
    feel:'solid, capable, proud', examples:['Stonecraft', 'Oakframe', 'Bedrock Builders'] },
  { key:'painting', match:/painting (contractor|company|service)|house painter|\bpainter\b|repaint/,
    category:'Painting Contractor', world:'color, the finish, the clean line, the fresh coat, hue, brush, transformation', audience:'homeowners wanting clean, beautiful, lasting paint work',
    outcome:'a fresh, flawless finish', vocabulary:['Hue', 'Finish', 'Coat', 'Brush', 'Color', 'Crisp', 'Fresh', 'Line', 'Pigment', 'Bright', 'Canvas'],
    avoid:['BANNED cliches','tools beyond brush','cute words'], structures:['color word compound','finish word + trade (Crisp Line Painting)'],
    feel:'clean, crisp, transformative', examples:['Crisp Line', 'Freshcoat', 'Brushwork', 'Canvas & Co'] },
  { key:'cleaning', match:/cleaning (service|company)|house cleaning|maid service|janitorial|housekeep|tidy/,
    category:'Cleaning Service', world:'fresh, bright, sparkle, calm, the spotless room, lightness, a clean reset', audience:'busy people wanting a spotless, fresh home or office',
    outcome:'a spotless, fresh reset', vocabulary:['Fresh', 'Bright', 'Sparkle', 'Tidy', 'Clear', 'Pure', 'Sweep', 'Glow', 'Crisp', 'Spruce', 'Lumen', 'Dust'],
    avoid:['tools (Mop, Broom)','BANNED cliches','clinical words'], structures:['fresh word compound (Freshsweep)','bright + place (Brightnest)'],
    feel:'fresh, bright, calming', examples:['Freshsweep', 'Brightnest', 'Sparrow Clean', 'Spruce & Co', 'Tidewell'] },
  { key:'autorepair', match:/auto repair|\bmechanic|car repair|auto shop|\btransmission|brake shop|oil change|muffler/,
    category:'Auto Repair', world:'the road, the engine, the tune, getting you running, reliability, the open road', audience:'drivers wanting honest, capable car repair',
    outcome:'back on the road, worry-free', vocabulary:['Road', 'Gear', 'Tune', 'Drive', 'Motor', 'Mile', 'Engine', 'Torque', 'Axle', 'Throttle', 'Pit'],
    avoid:['BANNED cliches','overly corporate words','cute words'], structures:['car word compound','road word + shop (Milepost Auto)'],
    feel:'honest, capable, local', examples:['Milepost Auto', 'Throttle & Sons', 'Open Road Auto', 'Pitlane'] },
  { key:'carwash', match:/car wash|auto detail|car detail|detailing/,
    category:'Car Wash / Detail', world:'shine, gleam, the mirror finish, water, the showroom look, pride in your ride', audience:'drivers who want their car gleaming',
    outcome:'a showroom shine', vocabulary:['Gleam', 'Shine', 'Mirror', 'Gloss', 'Wave', 'Suds', 'Crystal', 'Showroom', 'Polish', 'Splash', 'Lustre'],
    avoid:['BANNED cliches','clinical words'], structures:['shine word compound (Gleamline)','shine + place (Mirror Auto Spa)'],
    feel:'sleek, fresh, satisfying', examples:['Gleamline', 'Mirror Auto Spa', 'Crystal Wash', 'Gloss & Go', 'Showroom'] },
  { key:'locksmith', match:/locksmith|lock (and|&) key|key cutting|rekey/,
    category:'Locksmith', world:'the key, security, access, the trusted hand, getting back in, peace of mind', audience:'people locked out or wanting better security',
    outcome:'secure, and never locked out', vocabulary:['Key', 'Bolt', 'Guard', 'Secure', 'Trust', 'Lock', 'Vault', 'Shield', 'Master', 'Pin', 'Latch'],
    avoid:['BANNED cliches','clinical words'], structures:['key/lock compound','guard word (Boltguard)'],
    feel:'trustworthy, quick, reassuring', examples:['Boltguard', 'Masterlatch', 'Keywise', 'Vault & Key'] },
  { key:'pestcontrol', match:/pest control|exterminat|termite|bug (control|guy)|rodent/,
    category:'Pest Control', world:'protection, the guard, the clean perimeter, peace of mind, a defended home', audience:'homeowners wanting their home pest-free and protected',
    outcome:'a protected, pest-free home', vocabulary:['Guard', 'Shield', 'Defend', 'Clear', 'Barrier', 'Sentry', 'Perimeter', 'Safe', 'Bastion', 'Ward'],
    avoid:['bug imagery (no cute bugs)','BANNED cliches','clinical words'], structures:['guard word compound','defense + place (Sentryline)'],
    feel:'protective, reliable, reassuring', examples:['Sentryline', 'Bastion Pest', 'Clearward', 'Shield & Co'] },

  // ---------------- PROFESSIONAL / FINANCE (abstract: name the OUTCOME + niche) ----------------
  { key:'realestate', match:/real estate|realty|realtor|real ?estate agent|home (buying|seller) agent|listing agent/,
    category:'Real Estate Agent', world:'home, the key, the threshold, belonging, the neighborhood, the place that\'s yours', audience:'buyers and sellers making the biggest move of their lives',
    outcome:'belonging — the place that\'s finally yours', vocabulary:['Hearth', 'Key', 'Threshold', 'Home', 'Door', 'Homestead', 'Nest', 'Place', 'Roost', 'Local'],
    avoid:['lending/financing words (those are mortgage)','BANNED cliches (Premier, Summit, Elite Realty)','cold corporate words'], structures:['home word pairing (Hearth & Key)','one home word (Doorstep, Homestead)'],
    feel:'warm, local, belonging', examples:['Hearth & Key', 'Doorstep', 'Homestead', 'Threshold', 'The Key Co'] },
  { key:'propertymgmt', match:/property management|property manager|\bhoa\b management|rental management|leasing (company|office)/,
    category:'Property Management', world:'stewardship, the well-run building, reliability, the cared-for property, smooth tenancy', audience:'owners and tenants wanting a property run smoothly',
    outcome:'a property in steady, capable hands', vocabulary:['Steward', 'Keyhold', 'Hearth', 'Reliant', 'Pillar', 'Tenant', 'Homestead', 'Crest'],
    avoid:['BANNED cliches','cold corporate words','overlap with sales-realty tone'], structures:['steady word + property (Steward Property)','keep/hold compound (Keyhold)'],
    feel:'steady, dependable, organized', examples:['Keyhold', 'Steward & Co', 'Pillar Management'] },
  { key:'mortgage', match:/mortgage|\bloan\b|loan officer|home loan|\blending\b|\blender\b|refinanc|hard money/,
    category:'Mortgage Broker', world:'financing, approval, the path to a yes, rates, the close, guidance, confidence to buy', audience:'buyers needing a clear, confident path to financing a home',
    outcome:'a clear, confident path to approved', vocabulary:['Clearpath', 'Bridge', 'North', 'Fairway', 'Greenlight', 'Guidepost', 'Mainstay', 'Gateway'],
    avoid:['REAL-ESTATE/home/property/nature words (home, grove, woods, hearth, key, door)','BANNED cliches'], structures:['path/bridge word (Clearpath, Bridgepoint)','guidance word + lending (Northstar Lending)'],
    feel:'clear, reassuring, guiding', examples:['Clearpath Mortgage', 'Bridgepoint', 'Northstar Lending', 'Fairway'] },
  { key:'financialplanner', match:/financial (planner|planning|advisor|advisory)|wealth (management|advisor)|retirement planning|investment (advisor|firm|manage)|asset manage|family office|fiduciary/,
    category:'Financial Planner', world:'confidence, the future, independence, freedom, steadiness, the long horizon, legacy', audience:'people building a secure, free financial future',
    outcome:'confidence and freedom about the future', vocabulary:['Evergreen', 'Bedrock', 'Steadyhand', 'Harbor', 'Keelwise', 'Acorn', 'North', 'Horizon', 'Legacy'],
    avoid:['BANNED cliches (Summit, Apex, Premier Capital)','cold grey-corporate feel','jargon'], structures:['steady/growth word (Steadyhand, Evergreen)','nature-of-growth + capital (Acorn & Oak)'],
    feel:'grounded, optimistic, trustworthy', examples:['Evergreen Capital', 'Steadyhand', 'Harbor Point', 'Bedrock Wealth', 'Northwise'] },
  { key:'insurance', match:/insurance|\bcoverage\b|underwrit|\bpolicy (agency|broker)/,
    category:'Insurance Agency', world:'protection, peace of mind, the safe harbor, being covered, the steady hand when things go wrong', audience:'people and businesses wanting to be protected and looked after',
    outcome:'peace of mind — you\'re covered', vocabulary:['Safeharbor', 'Shelter', 'Bulwark', 'Provident', 'Restwell', 'Guardian', 'Mainstay', 'Kindred', 'Cover', 'Steadfast'],
    avoid:['BANNED cliches','generic corporate-blue feel','cold words'], structures:['protection word (Safeharbor, Bulwark)','shelter compound (Shelterwell)'],
    feel:'calm, protective, human', examples:['Safeharbor', 'Shelterwell', 'Provident', 'Bulwark', 'Restwell'] },
  { key:'accounting', match:/\baccounting\b|\bcpa\b|\baccountant|chartered account/,
    category:'Accounting Firm', world:'order, clarity, the balanced ledger, control, no surprises, the trusted books', audience:'businesses and individuals wanting their finances in order',
    outcome:'order and clarity, no surprises', vocabulary:['Ledger', 'Sound', 'Tally', 'Balance', 'North', 'Clearbook', 'Sterling'],
    avoid:['BANNED cliches','dry/cold feel','jargon'], structures:['ledger/balance word (Ledgerstone)','surname + advisory (Ledger Books)'],
    feel:'precise, trustworthy, clear', examples:['Ledgerstone', 'Sterling Tally', 'Soundbooks'] },
  { key:'bookkeeping', match:/bookkeep|book keeping|\bbooks\b (service)?/,
    category:'Bookkeeping Service', world:'tidy books, clarity, peace of mind, the small business kept on track, the relief of clean numbers', audience:'small businesses wanting clean, current books',
    outcome:'clean books and a clear mind', vocabulary:['Tally', 'Ledger', 'Tidy', 'Balance', 'Clearbook', 'Sound', 'Even', 'Margin'],
    avoid:['BANNED cliches','cold corporate feel'], structures:['tidy/balance word (Tidybooks)','ledger compound (Ledgerwell)'],
    feel:'tidy, reassuring, approachable', examples:['Tidybooks', 'Ledgerwell', 'Even & Co', 'Soundkeep'] },
  { key:'taxservice', match:/\btax (service|preparation|prep|advisor|firm|relief)|enrolled agent|tax resolution/,
    category:'Tax Service', world:'relief, clarity, the maximized return, no fear of the IRS, the confident filing', audience:'people and businesses wanting stress-free, optimized taxes',
    outcome:'relief and a confident filing', vocabulary:['Clearpath', 'Sterling', 'Return', 'North', 'Refund', 'Sound'],
    avoid:['BANNED cliches','cold/clinical feel','fear words'], structures:['clarity word + tax (Clearpath Tax)','surname (Return Tax)'],
    feel:'reassuring, sharp, trustworthy', examples:['Clearpath Tax', 'Sterling Returns', 'Northpoint Tax'] },
  { key:'consultant', match:/consult|advisory firm|\bstrateg(y|ic)|business coach|management consult/,
    category:'Business Consultant', world:'clarity, focus, alignment, momentum, the through-line from problem to result, traction', audience:'leaders who need clarity and momentum on hard problems',
    outcome:'clarity and momentum toward results', vocabulary:['Throughline', 'Clearfield', 'Cadence', 'Plainsight', 'Keel', 'Anchorpoint', 'Helm', 'Forge'],
    avoid:['BANNED cliches (Summit, Apex, Strategic, Synergy, Catalyst, Momentum)','jargon','vague filler'], structures:['outcome word (Throughline, Clearfield)','direction word + partners (Clearfield Partners)'],
    feel:'sharp, plain, confident', examples:['Throughline', 'Clearfield', 'Cadence Partners', 'Plainsight'] },
  { key:'marketing', match:/marketing agency|\bad agency|advertising|branding agency|digital agency|\bseo\b|growth agency|creative agency|\bpr firm|public relations/,
    category:'Marketing Agency', world:'signal, reach, the spark, attention, the story told well, growth, standing out', audience:'businesses wanting to be seen, heard, and grown',
    outcome:'attention that turns into growth', vocabulary:['Signal', 'North', 'Reach', 'Loud', 'Field', 'Beacon', 'Anthem', 'Current', 'Wildfire', 'Echo', 'Bold'],
    avoid:['BANNED cliches','generic [Word] Media/Group','overused Spark/Ignite/Elevate'], structures:['punchy one word (Anthem, Wildfire)','signal word + co (Signal & Co)'],
    feel:'bold, sharp, creative', examples:['Anthem', 'Wildfire', 'Signal & Co', 'Northbound', 'Loudfield'] },
  { key:'familylaw', match:/family law|divorce (attorney|lawyer)|custody|family attorney/,
    category:'Family Law',
    professionalMeaning:'a family-law attorney guides people through divorce, custody, and family change with dignity - the name must signal a steady, humane hand, not a courtroom brawler',
    world:'resolution, common ground, steady hands through hard transitions, a fair new beginning, protecting what matters', audience:'people navigating divorce, custody, and family change',
    outcome:'a fair resolution and a steady path forward', feel:'steady, humane, resolving, dignified',
    vocabularyDirections:['a sense of steady, humane guidance through change','common ground and fair resolution','protection of family and what matters most','a calm, dignified new beginning','quiet strength rather than combativeness','a credible founder name that feels caring and capable'],
    structures:['a warm/steadying concept + Law / Family Law','a credible founder surname (invent fresh; never reuse a stock set)','a fair-new-beginning phrase'],
    wrongNeighbors:['personal-injury / aggressive trial law','generic business consulting','therapy / counseling clinic'],
    literalMisreadsToBlock:['"family" is the legal practice area, not a daycare, family-photo, or family-restaurant brand','"custody" is legal, never security/storage'],
    avoid:['aggressive/combative words','BANNED cliches','cold corporate feel','do NOT reuse the stock legal surnames (Sterling, Caldwell, Marlowe, Wren, Ironwood, Bedrock, Charter, Hallow, Bracken, Oakhurst)'],
    vocabulary:['Resolution','Common Ground','Steady','Kindred'], examples:[] },
  { key:'injurylaw', match:/personal injury|injury (lawyer|attorney|law)|accident (lawyer|attorney)|trial (lawyer|attorney)/,
    category:'Personal Injury Law',
    professionalMeaning:'a personal-injury attorney is the fierce advocate who stands up for the hurt against powerful insurers - the name must signal strength, tenacity, and being firmly in your corner',
    world:'standing up, advocacy, the fight in your corner, getting what you are owed, strength against the powerful', audience:'people hurt and needing a fierce advocate',
    outcome:'someone who stands up and wins for you', feel:'strong, dependable, on your side',
    vocabularyDirections:['fierce advocacy and standing up for the wronged','tenacity and unshakeable strength','a guardian / protector in your corner','justice pursued relentlessly','steadfast dependability under pressure'],
    structures:['a strength/advocacy concept + Law','a guardian/champion sense (invent fresh)','a single strong, dependable mark'],
    wrongNeighbors:['estate / family law (soft posture)','generic consulting','insurance agency (the opponent)'],
    literalMisreadsToBlock:['"injury" is the legal practice, not a medical clinic or first-aid brand','"accident" is legal context, never an apology brand'],
    avoid:['BANNED cliches (Vanguard, Apex)','ambulance-chaser cheese','weak/soft words','do NOT reuse the stock legal surnames (Sterling, Caldwell, Marlowe, Wren, Ironwood, Bedrock, Charter, Hallow, Bracken, Oakhurst)'],
    vocabulary:['Advocate','Stand','Strength','Guardian'], examples:[] },
  { key:'estatelaw', match:/estate planning|\bprobate|\bwills?\b (attorney|lawyer)|trust attorney|elder law/,
    category:'Estate Planning Attorney',
    professionalMeaning:'an estate-planning attorney protects a family legacy across generations - the name must signal permanence, dignity, and trusted stewardship of what someone leaves behind',
    world:'legacy, what you leave behind, protecting family, the enduring, the well-laid plan, peace of mind across generations', audience:'people protecting their family future and legacy',
    outcome:'a protected legacy and peace of mind', feel:'enduring, trusted, dignified',
    vocabularyDirections:['legacy and what endures across generations','trusted stewardship and careful planning','permanence and a well-laid foundation','heritage and lineage','dignified peace of mind','a credible heritage founder name'],
    structures:['a legacy/heritage concept + Law / Counsel','a credible founder surname or pairing (invent fresh)','a single enduring mark'],
    wrongNeighbors:['real estate / property','financial advisory / wealth management','funeral / memorial (death-adjacent - avoid)'],
    literalMisreadsToBlock:['"estate" is the legal practice, NEVER real-estate property','"trust" is the legal instrument, not generic branding','"probate" is legal, never a generic process brand'],
    avoid:['morbid/death words','BANNED cliches','cold feel','do NOT reuse the stock legal surnames (Sterling, Caldwell, Marlowe, Wren, Ironwood, Bedrock, Charter, Hallow, Bracken, Oakhurst)'],
    vocabulary:['Legacy','Heritage','Enduring','Lineage'], examples:[] },
  { key:'lawfirm', match:/\blaw firm|\blawyer|\battorney|\blegal\b|law office|law group|counsel\b/,
    category:'Law Firm (general)',
    professionalMeaning:'a law firm is the advocate and counsel a client trusts with high-stakes matters - the name must signal standing, sound judgment, and the weight to be taken seriously',
    world:'trust, standing, resolution, steady counsel, advocacy, weight and credibility', audience:'people and businesses needing capable, serious legal counsel',
    outcome:'capable counsel you can stand behind - authority and trust', feel:'authoritative, established, trusted, serious',
    vocabularyDirections:['institutional authority and standing','quiet confidence rather than aggression','a credible founder-surname sense of an established firm (invent fresh ones every time)','heritage and long-standing credibility','a cornerstone / landmark sense of stability','sound judgment and reputation protection','a single dignified abstract conveying weight'],
    structures:['a credible founder surname or surname pairing - INVENT NEW ones, never reuse a stock set','an institutional/heritage concept + Law / Counsel / Advocates','a single dignified mark'],
    wrongNeighbors:['real estate / property agency','financial advisory','generic business consulting','insurance agency','accounting firm'],
    literalMisreadsToBlock:['a specialty word names the LEGAL practice, never another industry: "real estate" lawyer is legal NOT a property agent; "tax" lawyer is legal NOT an accountant; "patent" lawyer is legal NOT inventing products; "white collar" is a legal idiom NEVER clothing; "civil" is the legal sense not civil rights unless stated; "construction" lawyer is legal not a builder; "medical malpractice" is legal NOT a clinic'],
    avoid:['BANNED cliches (Summit, Apex Legal, Pinnacle)','cute/playful words','techy words','MONOCULTURE BAN: do NOT default to the stock surnames Sterling, Caldwell, Marlowe, Wren, Ironwood, Bedrock, Charter, Hallow, Bracken, Oakhurst - they have become repetitive; invent DIFFERENT fresh surnames and concepts every time'],
    vocabulary:['Counsel','Standing','Authority','Charterstone'], examples:[] },

  // ---------------- MEDICAL ----------------
  { key:'pediatric', match:/pediatric|children'?s (clinic|doctor|dentist)|kids? (clinic|dentist)/,
    category:'Pediatric Practice', world:'warmth, growth, little roots, bright mornings, gentle care, a safe place for kids', audience:'parents wanting gentle, trusted care for their children',
    outcome:'gentle care kids and parents trust', vocabulary:['Little', 'Roots', 'Sunny', 'Bright', 'Sprout', 'Cub', 'Lane', 'Acorn', 'Meadow', 'Star', 'Bloom', 'Nest'],
    avoid:['clinical/cold words','BANNED cliches','scary words'], structures:['warm small word (Little Roots)','sunny place (Sunny Lane Pediatrics)'],
    feel:'warm, gentle, bright', examples:['Little Roots', 'Sunny Lane', 'Acorn Pediatrics', 'Bright Sprout', 'Meadowlark Kids'] },
  { key:'dental', match:/dental|dentist|orthodont|endodont|periodont|\bteeth\b|smile (clinic|center)/,
    category:'Dental Practice', world:'a bright healthy smile, gentle care, clean and calm, confidence, the easy visit', audience:'patients wanting gentle, modern dental care',
    outcome:'a bright, healthy smile with zero dread', vocabulary:['Brightsmile', 'Cedar', 'Clearpath', 'Bright', 'Pearl', 'Aspen', 'Northstar', 'Willow', 'Crisp', 'Beam', 'Smile'],
    avoid:['drill/clinical words','BANNED cliches','cold feel'], structures:['smile/bright word (Brightsmile)','calm nature + Dental (Cedar Dental)'],
    feel:'bright, calm, modern', examples:['Brightsmile', 'Cedar Dental', 'Brightsmile Dental', 'Willow Dental'] },
  { key:'medspa', match:/med ?spa|medical spa|aesthetic (clinic|spa)|botox|injectable|cosmetic (clinic|spa)|aesthetics/,
    category:'Med Spa', world:'radiance and renewal backed by clinical precision and advanced aesthetics, expert care, restored beauty, science-led glow, refined luxury - medical credibility meeting luxe beauty (NOT a hospital)', audience:'clients wanting advanced aesthetic treatments delivered with medical credibility in a luxe setting',
    outcome:'expert, precise, science-backed radiance', vocabulary:['Lumiere', 'Radiance', 'Renew', 'Halo', 'Aura', 'Refine', 'Restore', 'Precision', 'Method', 'Clarity', 'Aesthète', 'Verve'],
    avoid:['hospital/surgical/cold-clinical words','harsh sounds','BANNED cliches','overly traditional day-spa softness'], structures:['glow/luxe word (Lumiere, Radiance)','luxe + a precision/method word (Refine Aesthetics, Method & Glow)','expert + radiance (Renew Aesthetics)'],
    feel:'luxe, precise, expert, radiant', examples:['Refined Radiance', 'Lumiere', 'Renew Aesthetics', 'Precision Glow', 'Aura Med Spa'] },
  { key:'addiction', match:/addiction|substance (abuse|use)|sober(iety)?( living| coaching| home)?|recovery (center|counsel|program)|drug (rehab|counsel|treatment)|alcohol (rehab|counsel|treatment)/,
    category:'Addiction Counseling Practice', world:'recovery and renewal, a fresh start, the strength to break free, a new chapter, milestones reclaimed, hope without judgment, the road back', audience:'people fighting addiction and the families beside them - they want non-judgmental support, real hope, and the strength to reclaim their life',
    outcome:'recovery, renewal, and a reclaimed life', vocabulary:['Renewal', 'Recovery', 'Rise', 'Fresh', 'Dawn', 'Milestone', 'Freedom', 'Reclaim', 'Anew', 'Forward', 'Resolve', 'Threshold'],
    avoid:['stigma/shame words (Addict, Junkie, Relapse, Broken)','overused comfort cliches (Stillwater, Haven, Anchor, Grove, Roots)','cold clinical words','judgmental tone'], structures:['renewal/rise word + Recovery/Counseling (Renewal Recovery)','fresh-start word + Recovery Center (Dawn Recovery Center)','single word (Milestone, Threshold)'],
    feel:'hopeful, strong, fresh-start, non-judgmental', examples:['Renewal Recovery', 'Milestone Counseling', 'Dawn Recovery Center', 'Reclaim Recovery', 'Forward Sobriety'] },

  { key:'trauma', match:/trauma|\bptsd\b|\bemdr\b|post.?traumatic/,
    category:'Trauma Therapy Practice', world:'healing after harm, safety and steadiness, resilience, reclaiming yourself, becoming whole again, gentle strength, processing and moving forward', audience:'people healing from trauma who want a safe, steady, skilled space to process and reclaim their sense of self',
    outcome:'safe, steady healing and reclaimed resilience', vocabulary:['Healing', 'Resilience', 'Restore', 'Reclaim', 'Mend', 'Steady', 'Safe', 'Renew', 'Rise', 'Light', 'Ground', 'Bridge'],
    avoid:['overused comfort cliches (Stillwater, Quiet Harbor, Haven, Anchor, Grove, Roots)','harsh/re-traumatizing words','stigma words','cold clinical words'], structures:['healing/resilience word + Therapy/Counseling (Resilience Therapy)','restore/reclaim word + Healing (Reclaim Healing)','single word (Mend, Steady Ground)'],
    feel:'safe, healing, resilient, gently strong', examples:['Resilience Therapy', 'Reclaim Healing', 'Mend Counseling', 'Steady Ground Therapy', 'Renew Trauma Therapy'] },

  { key:'counseling', match:/counsel(ing|or)/,
    category:'Counseling Practice', world:'support and guidance, being heard, steady forward motion, a bridge through a hard time, clarity and growth, an open door', audience:'people seeking support and guidance through life challenges - they want to be heard, understood, and helped to move forward',
    outcome:'support, clarity, and steady forward motion', vocabulary:['Bridge', 'Forward', 'Path', 'Guide', 'Steady', 'Open', 'Reach', 'Anew', 'Vista', 'Clarity', 'Ground'],
    avoid:['overused comfort cliches (Stillwater, Quiet Harbor, Haven, Anchor, Grove, Roots, Cedar, Willow)','stigma words','cold clinical words'], structures:['guidance/forward word + Counseling/Therapy (Forward Counseling)','bridge word + Counseling (Bridge Counseling)','single word (Threshold)'],
    feel:'supportive, steady, warm, forward-moving', examples:['Forward Counseling', 'Bridge Counseling', 'Open Path Counseling', 'Clarity Counseling'] },

  { key:'occupationaltherapy', match:/occupational therap|\bot (clinic|practice|therap)|hand therapy|occupational rehab|life skills (therapy|rehab)/,
    category:'Occupational Therapy Clinic', world:'function and independence regained, the everyday skills of life relearned, adapting and thriving, hands and abilities restored, doing daily life again', audience:'people relearning everyday skills and independence after injury, stroke, or for developmental needs - they want function, independence, and the ability to do daily life',
    outcome:'restored function, independence, and everyday ability', vocabulary:['Function', 'Independence', 'Ability', 'Adapt', 'Capable', 'Skill', 'Everyday', 'Enable', 'Thrive', 'Restore', 'Reach', 'Forward'],
    avoid:['mental-health/calm words (Stillwater, Haven, Mindful, Calm, Serenity)','generic medical suffixes (Care, Health, Clinic, Medical)','pain/weakness words'], structures:['function/ability word + Occupational Therapy/Rehab (Function Occupational Therapy)','independence word + Therapy/Rehab (Independence Rehab)','single word (Enable, Thrive)'],
    feel:'capable, independent, practical, progressive', examples:['Function Occupational Therapy', 'Independence Rehab', 'Enable Therapy', 'Thrive Occupational Therapy', 'Adapt Rehabilitation'] },

  { key:'psychiatry', match:/psychiatr/,
    category:'Psychiatry Practice', world:'the mind treated with medical care, restored balance and clarity, stability, being understood and taken seriously, steady ground, relief', audience:'people seeking expert medical help for mental health - they want competent, non-judgmental clinical care, stability and relief, to be taken seriously',
    outcome:'a clear, balanced, stable mind under expert care', vocabulary:['Clarity', 'Lucid', 'Equilibrium', 'Balance', 'Cognition', 'Resolve', 'Insight', 'Vantage', 'Steady', 'Anew'],
    avoid:['stigma/scary words (Crazy, Asylum, Disorder, Crisis)','overused therapy cliches (Stillwater, Haven, Anchor, Cedar, Willow, Grove)','cold/sterile clinical words','cutesy words'], structures:['clarity/balance word + Psychiatry/Mental Health (Clarity Psychiatry)','mind word + Wellness/Health (Lucid Mind)','single steady word (Equilibrium, Resolve)'],
    feel:'clear, balanced, steady, expert, humane', examples:['Clarity Psychiatry', 'Equilibrium Mental Health', 'Lucid Mind', 'Resolve Psychiatry'] },

  { key:'psychology', match:/psycholog/,
    category:'Psychology Practice', world:'insight, growth, being heard, self-understanding, the safe room, steady progress, becoming whole', audience:'people seeking insight, growth, and healing through talk and behavioral work - they want to be understood, to grow, and a safe, competent space',
    outcome:'insight, growth, and a steadier sense of self', vocabulary:['Insight', 'Growth', 'Wholeness', 'Forward', 'Threshold', 'Clarity', 'Reflect', 'Anew', 'Vista', 'Path', 'Understanding'],
    avoid:['stigma words','overused therapy cliches (Stillwater, Haven, Anchor, Cedar, Willow, Grove, Roots, Bloom)','cold clinical words','cutesy words'], structures:['insight/growth word + Psychology/Counseling (Insight Psychology)','forward/path word + Mind (Forward Mind)','single word (Wholeness, Threshold)'],
    feel:'insightful, warm, growth-oriented, safe', examples:['Insight Psychology', 'Forward Mind', 'Threshold Counseling', 'Wholeness Psychology', 'Anew Psychological'] },

  { key:'physicaltherapy', match:/physical therap|physiotherap|\bphysio\b|sports rehab|movement (clinic|therapy|studio)/,
    category:'Physical Therapy Clinic', world:'movement restored, recovery, function regained, strength rebuilt, mobility, progress and momentum, getting back to life - PHYSICAL rehab, never the calm mental-health room', audience:'people recovering from injury or surgery who want to regain movement, strength and function - they want hands-on skill and visible progress',
    outcome:'restored movement, strength, and a return to daily life', vocabulary:['Motion', 'Movement', 'Mobility', 'Recovery', 'Restore', 'Rebuild', 'Strength', 'Stride', 'Range', 'Function', 'Momentum', 'Progress'],
    avoid:['mental-health/calm words (Stillwater, Haven, Calm, Mindful, Serenity)','generic medical suffixes (Care, Health, Clinic, Medical)','pain/weakness words','BANNED cliches'], structures:['movement/recovery word + Physical Therapy/Rehab (Motion Physical Therapy)','restore word + Rehab/Movement (Restore Rehab)','single kinetic word (Stride, Momentum)'],
    feel:'kinetic, restorative, progressive, hands-on', examples:['Motion Physical Therapy', 'Restore Rehab', 'Stride Movement', 'Rebuild Physical Therapy', 'Momentum Physiotherapy'] },

  { key:'therapy', match:/therapy|therapist|counsel(ing|or)|mental health|psycholog|psychiatr|wellness (center|practice)|behavioral health/,
    category:'Therapy Practice', world:'calm, stillness, safe harbor, growth, the quiet room, being heard, steady ground', audience:'people seeking support, calm, and growth',
    outcome:'a calm, safe place to grow', vocabulary:['Stillwater', 'Quiet Harbor', 'Calm', 'Cedar', 'Still', 'Roots', 'Clearing', 'Willow', 'Steady'],
    avoid:['clinical/cold words','BANNED cliches','intense/edgy words'], structures:['calm water/place word (Stillwater, Quiet Harbor)','grounding word + Counseling (Stillwater Counseling)'],
    feel:'calm, safe, grounding', examples:['Stillwater Counseling', 'Quiet Harbor', 'Quiet Harbor Therapy', 'The Clearing'] },
  { key:'chiropractic', match:/chiropract|\bchiro\b|spine (clinic|center)|adjustment clinic/,
    category:'Chiropractic Practice', world:'alignment, movement, relief, the body in balance, motion restored, standing tall', audience:'people wanting pain relief and better movement',
    outcome:'aligned, moving, pain-free', vocabulary:['Align', 'Motion', 'Axis', 'Upright', 'Restore', 'Flow', 'Spine', 'Posture', 'Balance', 'Core'],
    avoid:['BANNED cliches','clinical-cold words','aggressive words'], structures:['alignment word (Align, Axis)','motion word + Chiro (Motionwell)'],
    feel:'restorative, capable, energizing', examples:['Align', 'Axis Chiropractic', 'Motionwell', 'Upright'] },
  // ---------------- MEDICAL SPECIALTY DNA (PILOT) ----------------
  // CARDIOLOGY: the heart = mortality + reassurance. Vital, steady, precise, life-sustaining - NOT the
  // generic wellness/clinic voice (Wellspring/Haven/Cedar), NOT beauty, NOT alarm words. Placed BEFORE
  // 'medical' so it wins. Validates the specialty-DNA method before the other five specialties.
  { key:'cardiology', match:/cardiolog|cardiac|cardiovascular|heart (center|clinic|institute|practice|associates|specialists?|health|care|group)|heart (and |& )?vascular/,
    category:'Cardiology Practice', world:'the vital organ, a steady expert hand on the heart, life sustained, enduring strength, rhythm and pulse, precision that reassures, deeply trusted heart care', audience:'patients and families trusting a cardiologist with the most vital organ - they want deep competence, steadiness, and reassurance, never novelty or flash',
    outcome:'a steady, precise, trusted hand keeping your heart strong', vocabulary:['Vital', 'Pulse', 'Rhythm', 'Cardiac', 'Vascular', 'Lifeline', 'Vigor', 'Vessel', 'Aria', 'Vita', 'Steadfast', 'Core', 'Cardio', 'Heartline'],
    avoid:['alarm words (Attack, Failure, Critical, Risk, Flatline)','beauty/cosmetic words','frivolous startup words (Spark, Zap, Boost, Buzz)','over-promise (Cure, Perfect, Best)','global comfort words (Haven, Cedar, Grove, Ember, Beacon, Anchor, Summit, Apex)','any death-adjacent word'], structures:['vital word + Heart/Cardiac (Vital Heart)','Heart/Cardiac + Institute/Center/Associates','single enduring word (Lifeline, Steadfast)'],
    feel:'vital, steady, reassuring, precise, life-sustaining', examples:['Vital Rhythm Cardiology', 'Lifeline Heart Associates', 'Vigor Cardiology'] },

  { key:'orthopedic', match:/orthopedic|orthopaedic|orthoped|sports medicine|joint (replacement|surgery|center|institute|clinic)|spine (center|institute|surgery|clinic|group)|musculoskeletal/,
    category:'Orthopedic Surgery Practice', world:'motion restored, mobility and strength, alignment, the return to activity and performance, joints and spine made strong, momentum toward recovery, structural integrity', audience:'injured athletes and active or aging people in pain who want to MOVE again - they want surgical skill and momentum toward recovery, not soft clinic warmth',
    outcome:'restored motion, strength, and a return to the activity you love', vocabulary:['Motion', 'Mobility', 'Strength', 'Align', 'Alignment', 'Recovery', 'Performance', 'Joint', 'Spine', 'Kinetic', 'Stride', 'Pivot', 'Range', 'Momentum', 'Vertex', 'Restore'],
    avoid:['generic medical suffixes (Care, Health, Clinic, Medical)','weakness/pain words (Break, Fracture, Ache, Pain)','BANNED cliches (Apex, Summit, Peak, Pinnacle)','global comfort words (Haven, Cedar, Anchor, Ember)','soft/cosmetic words'], structures:['motion/strength word + Orthopedics/Orthopedic Surgery (Kinetic Orthopedics)','alignment word + Sports Medicine/Joint/Spine (Align Sports Medicine, Vertex Spine)','single strong word (Momentum, Stride)'],
    feel:'strong, kinetic, structural, momentum toward recovery', examples:['Kinetic Orthopedics', 'Align Sports Medicine', 'Range Joint Institute', 'Vertex Spine', 'Momentum Orthopedic Surgery'] },

  { key:'plasticsurgery', match:/plastic surger|plastic surgeon|cosmetic surger|aesthetic surger|reconstructive surger|surgical (aesthetics|arts)/,
    category:'Plastic Surgery Practice', world:'refinement, elegance, artistry, natural beauty, the refined contour, sculpted form, confidence restored, poise - held to a credible surgical bar', audience:'cosmetic patients wanting natural, refined results from safe expert hands, and reconstructive patients wanting restoration with dignity - both prize elegance and credibility over flash',
    outcome:'refined, natural results from a skilled, trusted hand', vocabulary:['Contour', 'Form', 'Silhouette', 'Profile', 'Refine', 'Aesthetic', 'Sculpt', 'Define', 'Elegance', 'Grace', 'Poise', 'Renew', 'Artistry', 'Aria', 'Aurelle', 'Vera'],
    avoid:['generic medical suffixes (Care, Health, Clinic, Medical)','discount/over-promise (Cheap, Deal, Perfect, Flawless, Dream)','sexualized or objectifying words','overused luxe comfort (Velvet, Lumiere, Radiance, Bloom)','global comfort words','clinical-scary words'], structures:['form/contour word + Plastic Surgery/Aesthetics (Contour Plastic Surgery)','refinement word + Surgical Arts/Aesthetic (Refine Aesthetics, Form Surgical Arts)','single elegant word (Silhouette, Poise)'],
    feel:'refined, elegant, artful, credible', examples:['Contour Plastic Surgery', 'Form Aesthetic Institute', 'Silhouette Surgical Arts', 'Refine Aesthetics', 'Profile Plastic Surgery'] },

  { key:'oncology', match:/oncolog|cancer (center|care|institute|clinic|treatment|specialists?)|hematology.?oncology|chemotherapy/,
    category:'Oncology Practice', world:'hope, strength, advanced and compassionate care, resilience, light, partnership through treatment, forward motion toward life', audience:'patients facing cancer who are reaching for hope, the best advanced treatment, and a compassionate expert partner - tone must be hopeful and strong, never grim',
    outcome:'hope, strength, and advanced compassionate care', vocabulary:['Horizon', 'Hope', 'Light', 'Dawn', 'Renewal', 'Strength', 'Courage', 'Resilience', 'Vitality', 'Pathway', 'Aurora'],
    avoid:['ANY death/grief-adjacent word (End, Final, Loss, Farewell, Sunset, Memorial, Twilight)','false-promise (Cure, Miracle, Beat, Win)','fear words','saccharine/greeting-card tone','global comfort words (Beacon, Haven)','BANNED cliches (Summit, Apex)'], structures:['hope/light word + Oncology/Cancer Center (Horizon Cancer Center)','pathway word + Oncology (Aurora Oncology)','single hopeful word (Renewal, Aurora)'],
    feel:'hopeful, strong, advanced, human', examples:['Horizon Cancer Center', 'Aurora Cancer Care', 'Renewal Oncology', 'Dawn Cancer Institute'] },

  { key:'neurosurgery', match:/neurosurg|neurosurgeon|neurological surgery|brain (surgery|tumor|institute)|neuroscience (institute|center)/,
    category:'Neurosurgery Practice', world:'elite precision, mastery, advanced technology, the most intricate surgery, steady authority, clarity and command - the best hands for the brain and spine', audience:'patients and families facing brain or spine surgery who want the most precise, most advanced expert - they want elite skill and steady hope, never flash',
    outcome:'elite, precise, advanced surgical expertise', vocabulary:['Precision', 'Vertex', 'Axis', 'Pathway', 'Cortex', 'Cerebral', 'Element', 'Vector', 'Crown', 'Method', 'Neuro'],
    avoid:['frightening words (Damage, Lesion, Failure, Risk)','cute/playful/startup words','wellness fluff','global comfort words','BANNED cliches (Apex, Summit, Pinnacle)','over-promise'], structures:['precision/neuro word + Neurosurgery/Neuroscience (Precision Neurosurgery)','vertex/pathway word + Brain & Spine/Neuroscience (Vertex Neuroscience)','single precise word (Element)'],
    feel:'precise, elite, advanced, authoritative', examples:['Precision Neurosurgery', 'Vertex Neuroscience Institute', 'Pathway Brain & Spine', 'Cortex Brain & Spine'] },

  { key:'animalrehab', match:/animal rehab|animal rehabilitation|veterinary rehab|canine rehab|equine rehab|pet rehab|animal (physical therapy|recovery)|dog rehab/,
    category:'Animal Rehabilitation Clinic', world:'a beloved animal moving and thriving again, recovery of stride and strength, gentle rehab, companions back on their feet, the joy of motion restored', audience:'pet owners whose animal is recovering from injury or surgery and needs rehab to move, run, and thrive again - they want caring, expert animal recovery',
    outcome:'a recovered, mobile, thriving animal companion', vocabulary:['Stride', 'Bound', 'Paw', 'Pace', 'Spring', 'Companion', 'Romp', 'Trail', 'Gait', 'Mobility', 'Recovery', 'Leap'],
    avoid:['human-medical words (Wellspring, Vital, Health-as-cliche)','overused comfort cliches (Haven, Cedar, Grove)','cold clinical words','mental-calm words'], structures:['movement/animal word + Animal Rehab/Veterinary Rehab (Stride Animal Rehab)','paw/bound word + Animal Recovery (Bound Animal Recovery)','single word (Romp, Bound)'],
    feel:'energetic, caring, recovery-focused, warm', examples:['Stride Animal Rehab', 'Bound Veterinary Rehab', 'Paw & Pace Animal Recovery', 'Companion Animal Rehab', 'Leap Canine Rehab'] },

  { key:'animalhospital', match:/animal hospital|veterinary hospital|emergency (vet|animal|veterinary)|pet hospital/,
    category:'Animal Hospital', world:'comprehensive, trusted animal medicine, compassion and capability, the beloved companion cared for fully, serious care delivered with warmth', audience:'pet owners needing fuller medical, surgical, or emergency care for an animal they love like family - they want advanced animal medicine plus compassion',
    outcome:'comprehensive, trusted, compassionate care for a beloved animal', vocabulary:['Companion', 'Kindred', 'Guardian', 'Fellow', 'Trusted', 'Steadfast', 'Paw', 'Creature', 'Wildwood', 'Meadowbrook', 'Den', 'Refuge'],
    avoid:['human-medical words (Wellspring, Vital, Health-as-cliche)','cold/sterile clinical words','global comfort words (Haven, Cedar, Grove)','cutesy-only words'], structures:['companion/guardian word + Animal Hospital/Veterinary (Companion Animal Hospital)','kindred/trusted word + Veterinary Hospital (Kindred Veterinary)','warm place name (Meadowbrook Animal Hospital)'],
    feel:'trusted, comprehensive, compassionate, warm', examples:['Companion Animal Hospital', 'Guardian Veterinary Hospital', 'Kindred Animal Hospital', 'Meadowbrook Animal Hospital', 'Fellow Creatures Veterinary'] },

  { key:'vetclinic', match:/veterinar|\bvet (clinic|practice|care|group)|animal (clinic|care|wellness)|small animal|large animal|equine|pet (clinic|wellness)/,
    category:'Veterinary Clinic', world:'the family pet cared for with warmth, gentle trusted hands, companions and creatures, friendly neighborhood animal care, kindness', audience:'pet owners who love their animal like family and want gentle, trusted, caring treatment for their companion',
    outcome:'gentle, trusted, caring treatment for a beloved pet', vocabulary:['Companion', 'Paw', 'Tail', 'Kindred', 'Fellow', 'Creature', 'Whisker', 'Trusted', 'Gentle', 'Den', 'Burrow', 'Pack'],
    avoid:['human-medical words (Wellspring, Vital, Health-as-cliche)','cold clinical words','global comfort words (Haven, Cedar, Grove, Willow)','overly cutesy words'], structures:['companion/paw word + Veterinary/Animal Care (Companion Veterinary)','paw/tail pairing (Paw & Tail Animal Care)','warm word + Vet Clinic (Kindred Vet)'],
    feel:'warm, gentle, trusted, friendly', examples:['Companion Veterinary', 'Kindred Animal Care', 'Paw & Tail Veterinary', 'Fellow Creatures Vet', 'Trusted Paw Animal Clinic'] },

  { key:'medical', match:/medical (practice|clinic|center|group)|family (practice|medicine)|primary care|\bdoctor\b|physician|urgent care|\bclinic\b|health center/,
    category:'Medical Practice', world:'wellness, steady care, the trusted clinic, health restored, the caring hand, calm competence', audience:'patients wanting trusted, caring primary medical care',
    outcome:'trusted care that keeps you well', vocabulary:['Wellspring', 'Northlight', 'Evergreen', 'Clear', 'Cedar', 'Brightleaf', 'Pinegrove'],
    avoid:['BANNED cliches (Thrive, Prime)','spa-overlap words','cold/clinical feel'], structures:['wellness word + Health (Wellspring Health)','nature + Care (Northlight Care)'],
    feel:'caring, steady, clean', examples:['Wellspring Health', 'Northlight Care', 'Evergreen Family Health', 'Brightleaf'] },

  // ---------------- FITNESS / BEAUTY ----------------
  { key:'yoga', match:/\byoga\b|pilates|\bbarre\b|meditation (studio|center)|\bzen\b studio/,
    category:'Yoga Studio', world:'breath, stillness, flow, roots, the mat, calm strength, balance, the present moment', audience:'people seeking calm, flexibility, and centered strength',
    outcome:'calm, centered, and strong', vocabulary:['Breath', 'Still', 'Flow', 'Roots', 'Tide', 'Lotus', 'Cedar', 'Rise', 'Sage', 'Bend'],
    avoid:['aggressive gym words','BANNED cliches','techy words'], structures:['calm word (Stillwater, Rooted)','breath/tide pairing (Tide & Breath)'],
    feel:'calm, grounded, restorative', examples:['Stillwater', 'Rooted', 'Tide & Breath', 'Sage & Flow', 'Lotus Lane'] },
  { key:'fitness', match:/\bgym\b|fitness|crossfit|\bworkout|bootcamp|personal train|training (studio|gym)|strength (gym|studio)|spin studio|boxing gym|hiit/,
    category:'Fitness Studio', world:'forge, grit, iron, the engine, tempo, the rep, momentum of the body, getting strong', audience:'people who want to get strong, fit, and consistent',
    outcome:'stronger, fitter, unstoppable', vocabulary:['Forge', 'Grit', 'Anvil', 'Tempo', 'Stride', 'Iron', 'Ember', 'Kindle', 'Engine', 'Cadence', 'Foundry', 'Lift'],
    avoid:['BANNED cliches (Apex, Summit, Peak, Titan, Spartan)','cutesy words','techy words'], structures:['strong word + Athletic (Anvil Athletic)','grit pairing (Grit & Iron)'],
    feel:'strong, kinetic, motivating', examples:['Anvil Athletic', 'Grit & Iron', 'Tempo', 'Stride Collective', 'Foundry Strength'] },
  { key:'salon', match:/hair salon|\bsalon\b|hairstyl|hairdress|blow ?dry|hair studio/,
    category:'Beauty Salon', world:'glow, gloss, the transformation, lush, elegant, the polished look, radiance', audience:'clients wanting to look and feel beautiful',
    outcome:'a glowing, polished transformation', vocabulary:['Glow', 'Gloss', 'Lush', 'Halo', 'Rosewood', 'Velvet', 'Bloom', 'Mane', 'Gild', 'Luxe', 'Sleek', 'Honey'],
    avoid:['clinical/cold words','BANNED cliches','harsh sounds'], structures:['glow/lush pairing (Halo & Honey)','luxe place (The Glasshouse, Rosewood)'],
    feel:'elegant, glowing, refined', examples:['Rosewood', 'The Glasshouse', 'Halo & Honey', 'Lush & Gloss', 'Velvet Mane'] },
  { key:'barbershop', match:/barber|barbershop|men'?s grooming|fade (shop|bar)|gentlemen'?s (cut|barber)/,
    category:'Barbershop', world:'the chair, the fade, classic craft, the straight razor, masculine ritual, the neighborhood shop', audience:'men wanting a sharp cut and a classic experience',
    outcome:'a sharp cut and a good chair', vocabulary:['Blade', 'Chair', 'Fade', 'Classic', 'Sharp', 'Mane', 'Iron', 'Oak', 'Brick', 'Razor', 'Gent', 'Honor'],
    avoid:['feminine-salon words','BANNED cliches','techy words'], structures:['classic word + Barber (Blade & Co)','the [place] (The Chair, Brick & Blade)'],
    feel:'classic, sharp, masculine', examples:['Blade & Co', 'The Chair', 'Brick & Blade', 'Ironside Barber', 'Honor Cuts'] },
  { key:'nailsalon', match:/nail salon|\bnails?\b|manicure|pedicure|nail bar|lash (bar|studio)/,
    category:'Nail Salon', world:'polish, gloss, color, the pampered hour, glow, pretty details, the treat', audience:'clients wanting beautiful nails and a little luxury',
    outcome:'polished, pretty, pampered', vocabulary:['Polish', 'Gloss', 'Bloom', 'Petal', 'Luxe', 'Gild', 'Lacquer', 'Honey', 'Velvet', 'Halo', 'Pearl', 'Tip'],
    avoid:['clinical words','BANNED cliches','harsh sounds'], structures:['polish/petal pairing (Gloss & Petal)','luxe one word (Lacquer)'],
    feel:'pretty, luxe, fresh', examples:['Gloss & Petal', 'Lacquer', 'Honey & Halo', 'Bloom Nail Bar', 'Velvet Tips'] },

  // ---------------- COMMERCE / TECH / CONTENT ----------------
  { key:'ecommerce', match:/ecommerce|e-commerce|online (store|shop|brand)|\bdtc\b|direct.?to.?consumer|shopify (store|brand)|product brand/,
    category:'Ecommerce Brand', world:'the product, the unboxing, the modern shelf, curated, desirable, the brand people screenshot', audience:'online shoppers wanting a desirable, modern brand',
    outcome:'a brand people want to own and share', vocabulary:['Folk', 'Linen', 'Ember', 'Oak', 'Lumen', 'Daily', 'Nomad', 'Maven', 'Edit', 'Standard', 'Wilder', 'Cove'],
    avoid:['generic [Word] Co/Supply if empty','BANNED cliches','channel words (online, web)'], structures:['one modern word (Lumen, Wilder)','curated pairing (The Daily Edit)'],
    feel:'modern, curated, desirable', examples:['Wilder', 'Lumen', 'The Daily Edit', 'Folk & Co', 'Nomad Standard'] },
  { key:'retail', match:/retail (store|shop)|boutique|gift shop|\bshop\b|home goods|furniture store|bookstore|florist|candle (shop|company)|jewelry/,
    category:'Retail Store', world:'the curated shelf, the welcoming shop, finds, character, the local destination, the well-chosen', audience:'shoppers wanting a characterful local or specialty store',
    outcome:'a shop worth coming back to', vocabulary:['Folk', 'House', 'Lane', 'Goods', 'Linen', 'Marigold', 'Willow', 'Cove', 'Maker', 'Field', 'Supply', 'Society'],
    avoid:['generic Emporium/Solutions','BANNED cliches','cold corporate words'], structures:['warm word + House/Lane (Linen House)','curated pairing (Folk & Field)'],
    feel:'curated, warm, characterful', examples:['Linen House', 'Folk & Field', 'Marigold Lane', 'Willow & Co', 'The Cove'] },
  { key:'saas', match:/\bsaas\b|software (company|startup|platform)|\bapp\b|web app|platform\b|\bai\b (startup|tool|platform)|fintech|devtool|\bapi\b|cloud (platform|software)|cyber|analytics/,
    category:'SaaS Startup', world:'speed, clarity, the clean tool, leverage, the modern stack, momentum, invented language', audience:'businesses and builders wanting a sharp modern software tool',
    outcome:'a sharp tool that just works', vocabulary:['Lumen', 'Cobalt', 'Vela', 'Halcyon', 'Quill', 'Nimbus', 'Sift', 'Orbit', 'Slate', 'Cinder', 'Forge', 'Helix'],
    avoid:['trade words (Air, Comfort)','tired +ify/+ly','overlong names'], structures:['beautiful coined word (Lumen, Vela)','short real word (Slate, Orbit)'],
    feel:'modern, sharp, inventive', examples:['Lumen', 'Cobalt', 'Vela', 'Halcyon', 'Sift'] },
  { key:'influencer', match:/influencer|instagram (creator|model|personality|brand)|personal brand|lifestyle (blogger|creator)|micro.?influencer|\bIG\b creator/,
    category:'Instagram Influencer / Personal Brand', world:'personal taste, lifestyle, aspiration, the curated feed, aesthetic, a PERSON with a point of view - never a company; the handle people follow because of who they are', audience:'a creator building a personal lifestyle handle people follow for their taste',
    outcome:'a handle that feels like a tasteful person, not a media company', vocabulary:['Muse', 'Maven', 'Reverie', 'Vignette', 'Golden', 'Sunlit', 'Wander', 'Daily', 'Aura', 'Edit', 'Lane', 'Honey'],
    avoid:['Collective','Hub','Nexus','Media','Agency','Studio','Group','Co - it must feel like a PERSON, not a company','BANNED cliches'], structures:['aesthetic one word (Reverie, Vignette, Muse)','warm lifestyle pairing (Golden Hour, Sunlit Lane)','a persona / first-person handle ([Name] Daily, The [Name] Edit)'],
    feel:'personal, aspirational, tasteful, like a person', examples:['Reverie', 'Golden Hour', 'The Muse Edit', 'Sunlit', 'Wander & Wild'] },
  { key:'podcast', match:/podcast|\bshow\b|audio (show|series)|talk show|interview show/,
    category:'Podcast', world:'authority, insight, perspective, expertise, thought leadership - a voice worth trusting; keep the signal, the voice, the story, the conversation, the considered take', audience:'listeners who follow a host for authority, insight, and perspective',
    outcome:'a show people trust, quote, and subscribe to for the take', vocabulary:['Signal', 'Voice', 'Insight', 'Perspective', 'Vantage', 'Lens', 'Brief', 'Discourse', 'Forum', 'Premise', 'Frame', 'Story'],
    avoid:['generic small-talk / social filler (Chatter, Buzz, Hangout, Vibes)','[Word] Media/Studios/Group','BANNED cliches (Elevate, Ignite, Rise)','corporate/software words'], structures:['authority phrase (The Long View, Perspective Weekly)','insight pairing (Signal & Story, Voice & Vision)','the considered take (The Insight Room)'],
    feel:'authoritative, insightful, identity-forward', examples:['Signal & Story', 'The Insight Room', 'Perspective Weekly', 'The Long View', 'Voice & Vision'] },
  { key:'youtube', match:/youtube|\bvlog|video (channel|blog)|content creator|streamer|\btiktok\b|channel\b/,
    category:'YouTube Channel', world:'the thumbnail, the persona, the hook, the feed, the binge, identity, the recognizable handle', audience:'viewers and subscribers scrolling for a channel to follow',
    outcome:'a channel people follow and recognize', vocabulary:['Loop', 'Frame', 'Reel', 'Pixel', 'Daily', 'Wander', 'Maker', 'Lab', 'Field', 'Bold', 'Hype', 'Loud'],
    avoid:['[Word] Media/Studios/Productions','BANNED cliches','corporate words'], structures:['punchy persona/one word (Wildframe, Loud)','hook handle ([Name] Daily)'],
    feel:'punchy, personal, feed-ready', examples:['Wildframe', 'Loop & Co', 'The Daily Reel', 'Boldfield', 'Maker Lab'] }
];

function norm(seed){ return String(seed||'').toLowerCase(); }

// Return the most specific matching profile (array order = priority) or null.
function match(seed){
  const s = norm(seed);
  for (let i=0;i<PROFILES.length;i++){ if (PROFILES[i].match.test(s)) return PROFILES[i]; }
  return null;
}

// Rich CATEGORY DNA block for the NAME prompt.
function promptBlock(p){
  if (!p) return '';
  return '\n\nCATEGORY DNA for this exact business (' + p.category + ') - name from THIS, nothing generic:' +
    '\n- World: ' + p.world + '.' +
    '\n- Audience: ' + p.audience + '.' +
    '\n- Outcome to express: ' + p.outcome + '.' +
    '\n- Vocabulary to draw from (use as inspiration, do not just bolt together): ' + p.vocabulary.join(', ') + '.' +
    '\n- Naming structures that work here: ' + p.structures.join('; ') + '.' +
    '\n- Brand feel: ' + p.feel + '.' +
    '\n- AVOID (these make it generic or wrong-category): ' + p.avoid.join('; ') + '.' +
    '\n- Real businesses here are named like this (match the caliber and feel, but INVENT fresh names whose .com is likely open - never copy these): ' + p.examples.join(', ') + '.';
}

// Professional-Service Specialty DNA Standard builder. Used ONLY for profiles carrying
// the new template (vocabularyDirections present). Teaches perception, never literal words.
function proPromptBlock(p){
  if (!p) return '';
  var L = ['\n\nPROFESSIONAL-SERVICE DNA for this exact business (' + p.category + ') - name from the PROFESSION\u2019S IDENTITY and the client\u2019s perception, NEVER from a list of favorite words:'];
  if (p.professionalMeaning) L.push('- What this profession IS: ' + p.professionalMeaning + '.');
  if (p.world)    L.push('- World: ' + p.world + '.');
  if (p.audience) L.push('- Client: ' + p.audience + '.');
  if (p.outcome)  L.push('- Outcome the name must convey: ' + p.outcome + '.');
  if (p.feel)     L.push('- Feel: ' + p.feel + '.');
  if (p.vocabularyDirections) L.push('- EXPLORE these DIRECTIONS (perception spaces to INVENT within - NOT words to reuse): ' + p.vocabularyDirections.join('; ') + '. Invent FRESH names inside these directions; never reuse the same surnames or words across names.');
  if (p.structures) L.push('- Naming structures that work here: ' + p.structures.join('; ') + '.');
  if (p.wrongNeighbors) L.push('- WRONG NEIGHBORS (the name must NOT read as any of these adjacent categories): ' + p.wrongNeighbors.join('; ') + '.');
  if (p.literalMisreadsToBlock) L.push('- LITERAL MISREADS TO BLOCK (never take these words literally): ' + p.literalMisreadsToBlock.join('; ') + '.');
  if (p.avoid) L.push('- AVOID: ' + p.avoid.join('; ') + '.');
  L.push('- Critically: do NOT default to a small stock set of legal surnames or comfort words. Every name must feel freshly invented within the perception above, never selected from a comfort list.');
  return L.join('\n');
}

// Outcome/feel cue for the KIT builder so palette+voice+posts express the outcome.
function kitHint(p){
  if (!p) return '';
  return ' CATEGORY DNA (' + p.category + '): express the OUTCOME - ' + p.outcome +
    '. Brand feel: ' + p.feel + '. World: ' + p.world +
    '. Make the palette, voice, and posts feel made for THIS exact business - never a generic default.';
}

module.exports = { PROFILES, match, promptBlock, proPromptBlock, kitHint, count: PROFILES.length };
