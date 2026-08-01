// name-intel.js — Category Naming Intelligence + Name Safety Gate (BROAD)
// Auto-generated. Pure functions, no network. Covers 300 categories + 6 family fallbacks.
const BLOCK_WORDS = new Set(["ass","arse","damn","piss","dick","cock","bastard","bitch","crap","prick","twat","larder","fat","obese","slob","ugly","stupid","dumb","idiot","loser","freak","lazy","gross","disgusting","hag","creep","dork","runt","dwarf","sex","nude","naked","xxx","nsfw","escort","fetish","kill","murder","rape","slay","nazi","terror","drug","meth","crack","dope","thug","kkk","klan","hitler","isis","jihad","aryan","reich","supremacy","genocide","nigger","nigga","faggot","kike","spic","chink","wetback","tranny","retard","coon","gook"]);
const BLOCK_SUBSTR = ["fuck","shit","bitch","whore","slut","cunt","porn","cocaine","heroin","rapist","molest","obese","slob","nazi","murder","killhouse"];
function splitWords(name){ return String(name).replace(/([a-z])([A-Z])/g,"$1 $2").toLowerCase().split(/[^a-z]+/).filter(Boolean); }
function isSafeName(name){ if(!name) return false; const lower=String(name).toLowerCase(); if(splitWords(name).some(t=>BLOCK_WORDS.has(t))) return false; if(BLOCK_SUBSTR.some(s=>lower.includes(s))) return false; return true; }
function safetyInstruction(){ return "NEVER produce a name that is offensive, profane, hateful, racial, sexual, violent, or demeaning in any way (including body-shaming or anything that could insult or hurt the customer or any group). When in doubt, leave it out."; }

const C = {
  "fine_dining": {label:"fine dining restaurant", style:"substantial AND appetizing like 'Copper Table' \u2014 sounds like a real established restaurant a stranger instantly trusts; broad appeal; NEVER cutesy, NEVER a fireplace/rustic vibe", A:["Copper", "Sterling", "Marble", "Crown", "Slate", "Onyx", "Vintry", "Gilded"], B:["Table", "Room", "House", "Kitchen", "& Co"]},
  "restaurant": {label:"restaurant / eatery", style:"warm, inviting, appetizing; broad appeal; easy to say; never narrow or climate-locked", A:["Harvest", "Copper", "Garden", "Orchard", "Hearthstone", "Cedar", "Stone", "Meadow"], B:["Kitchen", "Spoon", "Table", "House", "Grill"]},
  "cafe": {label:"coffee shop / cafe", style:"substantial AND appetizing like a real established coffee company (e.g. 'Daybreak Coffee'); clean, broad appeal; NEVER cutesy or twee", A:["Sterling", "Reserve", "Heritage", "Premier", "Crown", "Estate", "Gold", "Roast"], B:["Roasters", "Coffee Co", "Roasting Co", "Coffee", "& Co"]},
  "bakery": {label:"bakery", style:"warm, sweet, hand-made, flour-and-butter charm", A:["Flour", "Sugar", "Maple", "Hazel", "Crumb", "Honey", "Birch", "Daisy"], B:["& Co", "Bakehouse", "Bakery", "Lane", "Kitchen"]},
  "bar": {label:"bar / pub", style:"spirited, convivial, a little dim and golden", A:["Copper", "Ember", "Oak", "Crow", "Lantern", "Velvet", "Iron", "Maple"], B:["& Oak", "Tavern", "Room", "House", "Social", "Lounge"]},
  "brewery": {label:"brewery", style:"bold, craft, hometown pride", A:["Iron", "Vanguard", "Cedar", "Granite", "Wild", "Copper", "Forge", "Crane"], B:["Brewing", "& Co", "Works", "Hops", "Taproom"]},
  "food_truck": {label:"food truck", style:"appetizing and positive like 'Zesty Kitchen'; substantial enough to trust; NEVER a negative association, NEVER cutesy", A:["Zesty", "Savory", "Gourmet", "Fresh", "Hearty", "Flavor", "Sizzle", "Crisp"], B:["Kitchen", "Wheels", "Truck", "Eats", "& Co"]},
  "juice": {label:"juice / smoothie bar", style:"fresh, bright, vibrant, healthy", A:["Fresh", "Bloom", "Citrus", "Verde", "Sunny", "Pulp", "Glow", "Leaf"], B:["& Co", "Juicery", "Bar", "Press", "Bowl"]},
  "dessert": {label:"dessert / ice cream", style:"sweet, playful, nostalgic, indulgent", A:["Sugar", "Scoop", "Velvet", "Honey", "Frost", "Sprinkle", "Cocoa", "Cloud"], B:["& Co", "Creamery", "Sweets", "Parlor", "Shop"]},
  "catering": {label:"catering", style:"warm, generous, polished hospitality", A:["Harvest", "Hearth", "Saffron", "Olive", "Copper", "Sage", "Maple", "Crane"], B:["& Co", "Catering", "Table", "Kitchen", "Events"]},
  "boutique": {label:"clothing boutique", style:"modern, confident, broadly wearable; clean and real, never cutesy nature wordplay", A:["Thread", "Linen", "Marlowe", "Mode", "Velvet", "Indigo", "Atlas", "Form"], B:["Room", "& Stitch", "& Co", "Edit", "Atelier"]},
  "shoes_athletic": {label:"athletic / sneaker store", style:"punchy, kinetic, coined sneaker energy", A:["Kick", "Pace", "Tread", "Pivot", "Sprint", "Bolt", "Surge", "Dash"], B:["+smith", "& Co", "Lab", "+works", "Athletic"]},
  "shoes_designer": {label:"designer footwear", style:"elegant, refined, French or Italian fashion feel", A:["Maison", "Bella", "Velour", "Soler", "Vianne", "Mode", "Lace"], B:["Sole", "& Co", "Steps", "Atelier"]},
  "shoes_outdoor": {label:"outdoor / hiking footwear", style:"terrain, trail, summit, rugged but warm", A:["Trail", "Terra", "Ridge", "Trek", "Mesa", "Bound", "Path", "Summit"], B:["+head", "+foot", "Footwear", "& Co", "+works"]},
  "shoes_general": {label:"shoe store", style:"friendly neighborhood footwear shop; feet, steps, walking; approachable", A:["Sole", "Step", "Stride", "Ever", "Lace", "Cobble", "Main", "Walk"], B:["& Stride", "+well", "Parlor", "& Co", "Footwear", "Lane"]},
  "jewelry": {label:"jewelry store", style:"luminous, precious, refined sparkle", A:["Lumen", "Gilt", "Aurelle", "Opal", "Halo", "Stone", "Ember", "Luna"], B:["& Co", "Jewelers", "Fine", "Atelier", "Studio"]},
  "bookstore": {label:"bookstore", style:"literary, cozy, curious, ink-and-paper", A:["Margin", "Chapter", "Ink", "Folio", "Owl", "Quill", "Maple", "Fable"], B:["& Co", "Books", "Pages", "Shop", "House"]},
  "gift_shop": {label:"gift shop", style:"charming, delightful, curated little finds", A:["Trinket", "Posy", "Maple", "Wren", "Clover", "Birch", "Hazel", "Folk"], B:["& Co", "Gifts", "Shop", "Goods", "Lane"]},
  "home_goods": {label:"home goods / decor", style:"warm, tactile, beautifully made for the home", A:["Hearth", "Linen", "Cedar", "Clay", "Maple", "Stone", "Willow", "Loom"], B:["& Co", "Home", "Goods", "House", "Studio"]},
  "florist": {label:"florist / flower shop", style:"lush, fresh, romantic, garden-fresh", A:["Petal", "Bloom", "Stem", "Posy", "Wild", "Fern", "Marigold", "Dahlia"], B:["& Co", "Floral", "Flowers", "Studio", "Lane"]},
  "grocery": {label:"grocery / market", style:"fresh, local, abundant, neighborly", A:["Harvest", "Green", "Maple", "Cedar", "Daily", "Meadow", "Crate", "Bushel"], B:["& Co", "Market", "Grocer", "Provisions", "Goods"]},
  "thrift": {label:"thrift / vintage", style:"curated, nostalgic, treasure-hunt charm", A:["Relic", "Revive", "Maple", "Magpie", "Velvet", "Folk", "Ever", "Hazel"], B:["& Co", "Vintage", "Finds", "Shop", "Goods"]},
  "ecommerce": {label:"online store / ecommerce", style:"friendly, brandable, shelf-ready direct-to-consumer", A:["Folk", "Tide", "Pine", "Marlowe", "Drift", "Hazel", "Maple", "Birch"], B:["& Co", "Goods", "Supply", "Shop", "Lane"]},
  "candles": {label:"candles / home scent", style:"cozy, fragrant, hand-poured warmth", A:["Ember", "Wick", "Honey", "Sage", "Birch", "Maple", "Amber", "Hearth"], B:["& Co", "Candle", "& Wax", "Goods", "Studio"]},
  "cosmetics": {label:"beauty products / cosmetics", style:"luminous, modern, clean-beauty glow", A:["Lumen", "Glow", "Dewy", "Bare", "Bloom", "Velvet", "Halo", "Luna"], B:["& Co", "Beauty", "Skin", "Lab", "Studio"]},
  "yoga": {label:"yoga studio", style:"calm, breath, flow, grounding, light, nature; soft open sounds; studio, space, sanctuary; avoid corporate or kinetic filler", A:["Still", "Root", "Breathe", "Lotus", "Sage", "Calm", "Drift", "Bloom"], B:["Yoga", "Studio", "Space", "+well", "& Light", "Sanctuary"]},
  "fitness": {label:"gym / fitness", style:"strong, kinetic, motivating", A:["Iron", "Pulse", "Forge", "Rise", "Vital", "Peak", "Drive", "Grit"], B:["Fitness", "& Co", "Athletic", "Lab", "Strength"]},
  "dental": {label:"dental practice", style:"clean, bright, gentle, trustworthy", A:["Bright", "Clear", "Pure", "Pearl", "Lumen", "North", "Gentle", "Crisp"], B:["Dental", "Smile", "& Co", "Dentistry", "Family Dental"]},
  "medical": {label:"medical clinic", style:"reassuring, clean, capable care", A:["Vita", "Cedar", "North", "Bright", "Pulse", "Clear", "Harbor"], B:["Health", "Care", "Medical", "Clinic", "& Co"]},
  "therapy": {label:"therapy / counseling", style:"warm, safe, hopeful, steady", A:["Willow", "Vanguard", "Bloom", "Still", "Cedar", "Bright", "Open"], B:["Therapy", "Counseling", "& Co", "Wellness", "Path"]},
  "chiro": {label:"chiropractic", style:"aligned, restorative, capable", A:["Align", "Spine", "Motion", "Core", "Pivot", "Apex", "North"], B:["Chiropractic", "Spine", "& Co", "Health", "Care"]},
  "massage": {label:"massage / spa", style:"serene, restorative, soothing", A:["Serene", "Lotus", "Stillwater", "Sage", "Luna", "Drift", "Calm"], B:["Spa", "& Co", "Wellness", "Retreat", "Studio"]},
  "nutrition": {label:"nutrition / dietitian", style:"fresh, balanced, vital, supportive", A:["Nourish", "Verde", "Vital", "Bloom", "Root", "Fresh", "Sage", "Balance"], B:["Nutrition", "& Co", "Wellness", "Health", "Kitchen"]},
  "optometry": {label:"optometry / eye care", style:"clear, modern, precise", A:["Clear", "Lumen", "Focus", "Vista", "Bright", "Iris", "North", "Crisp"], B:["Eyecare", "Vision", "Optical", "& Co", "Eyewear"]},
  "salon": {label:"hair salon", style:"polished, elevated, substantial; chic but not small-boutique cutesy", A:["Crown", "Polished", "Grace", "Luxe", "Vanity", "Mirror", "Gloss", "Mode"], B:["Salon", "Hair Studio", "& Co", "Beauty", "Hair"]},
  "barber": {label:"barbershop", style:"classic, sharp, neighborhood", A:["Iron", "Crown", "Blade", "Oak", "Maple", "Vanguard", "Brick", "Hatch"], B:["Barber", "& Co", "Barbershop", "Grooming", "Shop"]},
  "nail": {label:"nail salon", style:"polished, pretty, pampered", A:["Polish", "Petal", "Lacquer", "Bloom", "Luxe", "Halo", "Bella", "Glaze"], B:["Nails", "& Co", "Studio", "Bar", "Lounge"]},
  "skincare": {label:"skincare / esthetics", style:"clean, glowing, dewy, calm", A:["Dewy", "Glow", "Bare", "Lumen", "Verve", "Silk", "Luna", "Bloom"], B:["Skin", "& Co", "Studio", "Aesthetics", "Bar"]},
  "tattoo": {label:"tattoo studio", style:"bold, artful, edgy-cool", A:["Ink", "Iron", "Raven", "Electric", "Sacred", "Wild", "Crow", "Ember"], B:["Ink", "Tattoo", "& Co", "Studio", "Parlor"]},
  "plumbing": {label:"plumbing", style:"dependable, prompt, local pro", A:["Clear", "Prime", "Vanguard", "Cedar", "Flow", "Apex", "Beacon"], B:["Plumbing", "& Co", "Pro", "Services", "Works"]},
  "electrical": {label:"electrician", style:"bright, reliable, current", A:["Bright", "Volt", "Spark", "Prime", "Beacon", "Apex", "Current"], B:["Electric", "& Co", "Pro", "Power", "Services"]},
  "engineering": {label:"engineering firm", style:"precise, rigorous, technical and trustworthy, serious B2B caliber", A:["Fulcrum", "Datum", "Vector", "Span", "Lateral", "Vertex", "Caliber", "Truss", "Cantilever", "Plumb", "Beam", "Torque", "Gauge", "Meridian", "Axiom"], B:["Engineering", "& Associates", "Group", "Works", "Partners", "Consulting"]},
  "hvac": {label:"HVAC / heating & air", style:"clean trust and comfort", A:["Peak", "Clear", "Prime", "Comfort", "Cedar", "Apex", "North"], B:["Air", "Comfort", "Climate", "Heating", "& Co"]},
  "roofing": {label:"roofing", style:"sturdy, weatherproof, trustworthy", A:["Summit", "Apex", "Ironclad", "Peak", "Cedar", "Sterling", "Vanguard", "Crown"], B:["Roofing", "& Co", "Exteriors", "Roof", "Pro"]},
  "landscaping": {label:"landscaping / lawn", style:"natural, premium, well-kept", A:["Stoneleaf", "Everbloom", "Greenmark", "Cedar", "Wildroot", "Verde", "Oak", "Fern"], B:["Landscapes", "& Co", "Outdoors", "Lawn", "Grounds"]},
  "cleaning": {label:"cleaning service", style:"fresh, spotless, sparkling, trustworthy", A:["Sparkle", "Fresh", "Pure", "Tidy", "Bright", "Crisp", "Shine", "Clear"], B:["Clean", "& Co", "Cleaning", "Services", "Maids"]},
  "pest": {label:"pest control", style:"protective, thorough, reliable", A:["Shield", "Guard", "Apex", "Fortress", "Prime", "Sentry", "Vanguard"], B:["Pest", "& Co", "Defense", "Services", "Control"]},
  "painting": {label:"painting / painter", style:"crisp, fresh, true-color craft", A:["Brush", "Hue", "Crisp", "Prime", "Spectrum", "Cedar", "Fresh"], B:["Painting", "& Co", "Painters", "Coatings", "Works"]},
  "handyman": {label:"handyman / repair", style:"dependable, capable, friendly fix-it", A:["Trusty", "Handy", "Vanguard", "Cedar", "Toolbox", "Mend", "Oak"], B:["& Co", "Handyman", "Repairs", "Services", "Home"]},
  "moving": {label:"moving / movers", style:"strong, careful, smooth", A:["Vanguard", "Sure", "Swift", "Atlas", "Pace", "Cedar"], B:["Moving", "& Co", "Movers", "Logistics", "Relocation"]},
  "pool": {label:"pool service", style:"crystal, refreshing, dependable", A:["Crystal", "Clear", "Aqua", "Blue", "Splash", "Pristine", "Marine", "Tide"], B:["Pools", "& Co", "Pool", "Aquatics", "Services"]},
  "construction": {label:"construction / contractor", style:"solid, capable, built to last", A:["Ironclad", "Summit", "Cedar", "Granite", "Vanguard", "Forge", "Apex"], B:["Construction", "& Co", "Builders", "Build", "Contracting"]},
  "interior_design": {label:"interior design", style:"tasteful, elevated, beautifully composed", A:["Hearth", "Linen", "Atelier", "Vesta", "Maison", "Cedar", "Muse", "Loom"], B:["Interiors", "Design", "& Co", "Studio", "Home"]},
  "law": {label:"law firm", style:"grounded, credible, surname-style; trustworthy counsel", A:["Sterling", "North", "Vanguard", "Oakline", "Harbor"], B:["& North", "Law", "Legal", "Partners", "Advisory"]},
  "accounting": {label:"accounting / CPA", style:"precise, trustworthy, solid", A:["Ledger", "Sterling", "North", "Sum", "Vanguard", "Tally"], B:["& Co", "Accounting", "CPA", "Advisory", "Partners"]},
  "consulting": {label:"consulting", style:"sharp, credible, results-driven", A:["Vantora", "Keelpoint", "North", "Brightford", "Apex", "Lattice", "Vantage"], B:["& Co", "Consulting", "Advisory", "Partners", "Group"]},
  "marketing": {label:"marketing agency", style:"bold, creative, modern", A:["Spark", "Bolt", "Cobalt", "Northbound", "Ampersand", "Wild", "Lumen", "Verve"], B:["& Co", "Agency", "Studio", "Media", "Labs"]},
  "real_estate": {label:"real estate", style:"trustworthy, established, warm", A:["Harborview", "Brightkey", "Vanguard", "Lantern", "Cedar", "Oak"], B:["& Co", "Realty", "Homes", "Properties", "Group"]},
  "insurance": {label:"insurance", style:"secure, dependable, protective", A:["Shield", "Vanguard", "Sterling", "Beacon", "Guardian", "Harbor"], B:["& Co", "Insurance", "Assurance", "Group", "Partners"]},
  "financial": {label:"financial advisor / wealth", style:"trustworthy, steady, prosperous", A:["Sterling", "Summit", "Cedar", "Harbor", "North", "Vantage"], B:["& Co", "Wealth", "Capital", "Advisors", "Financial"]},
  "banking": {label:"bank / credit union", style:"trustworthy, solid, established; clean confident finance words that sound like a real bank", A:["Summit", "Sterling", "Brightstone", "Harbor", "Prospero"], B:["Bank", "Banking", "Reserve", "Finance", "& Co", "Trust"]},
  "marine": {label:"boat / yacht / charter", style:"nautical, coastal, adventurous; harbor, tide, sail, and wave imagery", A:["Harbor", "Coastal", "Mariner", "Regatta", "Vanguard", "Tide", "Nautica", "Bayside", "Azure", "Wavecrest"], B:["Charters", "& Co", "Marine", "Yachts", "Shores", "Sailing"]},
  "vape": {label:"vape / smoke shop", style:"modern, bold, cloud-and-vapor imagery; clean and contemporary", A:["Cloud", "Haze", "Vapor", "Drift", "Ember", "Mist", "Nimbus", "Crest"], B:["Vapes", "& Co", "Smoke", "Vapor", "Shop", "Lounge"]},
  "staffing": {label:"staffing / recruiting", style:"sharp, connective, growth-minded", A:["Talent", "Bridge", "Pivot", "North", "Apex", "Catalyst", "Beacon", "Forge"], B:["& Co", "Talent", "Staffing", "Search", "Partners"]},
  "architecture": {label:"architecture firm", style:"clean, structural, refined", A:["Axis", "Form", "Atelier", "Vector", "Cedar", "Vesta", "Plumb"], B:["Architecture", "& Co", "Studio", "Design", "Works"]},
  "saas": {label:"software / SaaS / startup", style:"short, coined, modern, app-store friendly", A:["Lumen", "Node", "Vextra", "Loop", "Quanta", "Cobalt", "Vertex", "Flux"], B:["Labs", "Stack", "Flow", "Base", "Grid", "Sync", "HQ"]},
  "webdev": {label:"web design / dev agency", style:"modern, sharp, digital craft", A:["Pixel", "Cobalt", "Stack", "Northbound", "Bit", "Lumen", "Vector", "Forge"], B:["Labs", "& Co", "Studio", "Digital", "Works"]},
  "it_services": {label:"IT services", style:"reliable, secure, capable", A:["Cobalt", "Sentinel", "Apex", "Node", "Beacon", "Prime", "Stack", "Vertex"], B:["IT", "& Co", "Tech", "Systems", "Solutions"]},
  "cybersecurity": {label:"cybersecurity", style:"secure, vigilant, fortress-strong", A:["Sentinel", "Aegis", "Cipher", "Fortress", "Shield", "Vault", "Iron", "Sable"], B:["Security", "& Co", "Labs", "Defense", "Systems"]},
  "ai_startup": {label:"AI startup", style:"coined, sleek, futuristic", A:["Cortex", "Lumen", "Nous", "Synth", "Quanta", "Cohere", "Vextra", "Flux"], B:["AI", "Labs", "& Co", "Intelligence", "Systems"]},
  "gaming": {label:"gaming / game studio", style:"bold, playful, imaginative", A:["Pixel", "Rogue", "Ember", "Nova", "Wild", "Forge", "Arcade", "Vortex"], B:["Games", "Studio", "& Co", "Interactive", "Labs"]},
  "fintech": {label:"fintech", style:"clean, trustworthy, flowing", A:["Lumen", "Flow", "Mint", "Vault", "Ledger", "Cobalt", "Pace", "North"], B:["Pay", "& Co", "Finance", "Labs", "Money"]},
  "photography": {label:"photographer", style:"light, moments, artful, personal", A:["Still", "Lumen", "Goldhour", "Fawnlight", "Vera", "Frame", "Aperture", "Luna"], B:["Studio", "Photography", "& Co", "Frames", "Light"]},
  "videography": {label:"videographer / film", style:"cinematic, story-driven, bold", A:["Reel", "Lumen", "Northlight", "Frame", "Motion", "Ember", "Vista", "Echo"], B:["Films", "Studio", "& Co", "Pictures", "Media"]},
  "graphic_design": {label:"graphic design", style:"sharp, expressive, modern", A:["Pixel", "Form", "Cobalt", "Hue", "Northbound", "Muse", "Vector", "Folk"], B:["Studio", "Design", "& Co", "Works", "Lab"]},
  "podcast": {label:"podcast", style:"audio-native, candid, memorable; easy to say", A:["Roomtone", "Sidebar", "Echo", "Hush", "Offmic", "Longform", "Static", "Wavelength"], B:["Sessions", "Pod", "Radio", "& Co", "FM"]},
  "youtube": {label:"youtube / video channel", style:"punchy, personable, bingeable", A:["Daily", "Bright", "Echo", "Wild", "Northbound", "Banter", "Spark", "Curious"], B:["& Co", "Media", "Channel", "Studio", "Show"]},
  "newsletter": {label:"newsletter", style:"smart, curated, voice-forward", A:["Margin", "Dispatch", "Brief", "Folio", "Tangent", "Ledger", "Sunday", "Signal"], B:["& Co", "Dispatch", "Weekly", "Letter", "Brief"]},
  "music": {label:"music / band", style:"evocative, rhythmic, original", A:["Velvet", "Ember", "Midnight", "Echo", "Wild", "Neon", "Luna", "Saffron"], B:["& Co", "Sound", "Records", "Audio", "Collective"]},
  "art_studio": {label:"art studio / artist", style:"expressive, tactile, original", A:["Ochre", "Muse", "Cobalt", "Kiln", "Folk", "Wild", "Saffron", "Ember"], B:["Studio", "& Co", "Art", "Works", "Atelier"]},
  "author": {label:"author / writer", style:"literary, thoughtful, voice-forward", A:["Margin", "Ink", "Quill", "Folio", "Fable", "Chapter", "Vellum", "Sage"], B:["& Co", "Press", "Words", "Studio", "Ink"]},
  "tutoring": {label:"tutoring", style:"encouraging, smart, growth", A:["Bright", "Scholar", "Summit", "Spark", "Beacon", "Ladder", "Owl", "Quest"], B:["Learning", "Tutoring", "& Co", "Academy", "Prep"]},
  "course": {label:"online course / education", style:"empowering, clear, modern learning", A:["Bright", "Ascend", "Lumen", "Spark", "Summit", "Quest", "Forge"], B:["Academy", "Learning", "& Co", "Labs", "School"]},
  "school": {label:"school / academy", style:"nurturing, bright, foundational", A:["Bright", "Maple", "Cedar", "Beacon", "Meadow", "Sage", "Lantern"], B:["Academy", "School", "& Co", "Learning", "Prep"]},
  "coaching": {label:"life / business coaching", style:"empowering, forward, clarity", A:["Ascend", "Catalyst", "North", "Summit", "Forge", "Clarity", "Bright", "Pivot"], B:["Coaching", "& Co", "Method", "Partners", "Lab"]},
  "childcare": {label:"daycare / childcare", style:"warm, safe, playful, nurturing", A:["Bright", "Little", "Maple", "Sprout", "Meadow", "Cubby", "Sunny", "Acorn"], B:["& Co", "Kids", "Childcare", "Academy", "Nest"]},
  "language": {label:"language learning", style:"global, lively, fluent", A:["Lingua", "Fluent", "Babel", "Verba", "Bright", "Echo", "Sol"], B:["& Co", "Languages", "Learning", "Lab", "Studio"]},
  "auto_repair": {label:"auto repair / mechanic", style:"dependable, capable, hometown garage", A:["Apex", "Iron", "Gear", "Cedar", "Vanguard", "Prime", "Torque"], B:["Auto", "& Co", "Garage", "Motors", "Service"]},
  "car_dealer": {label:"car dealership", style:"trustworthy, sharp, drive-away", A:["Apex", "Summit", "Prime", "Sterling", "North", "Crown", "Pace"], B:["Motors", "Auto", "& Co", "Automotive", "Cars"]},
  "detailing": {label:"auto detailing / car wash", style:"shine, pristine, showroom", A:["Gloss", "Pristine", "Shine", "Mirror", "Slick", "Crisp", "Prism", "Detail"], B:["Detailing", "& Co", "Auto", "Shine", "Garage"]},
  "pet_grooming": {label:"pet grooming", style:"playful, caring, fresh-and-fluffy", A:["Paws", "Fluff", "Bubbly", "Wag", "Cedar", "Posh", "Furry", "Bark"], B:["& Co", "Grooming", "Paws", "Studio", "Spa"]},
  "pet_store": {label:"pet store", style:"friendly, playful, animal-loving", A:["Paws", "Wag", "Whisker", "Barker", "Cedar", "Critter", "Furry", "Den"], B:["& Co", "Pets", "Supply", "Shop", "Pantry"]},
  "vet": {label:"veterinary", style:"caring, trusted, gentle", A:["Cedar", "Bright", "Companion", "Meadow", "Vanguard", "Willow", "Pawcare"], B:["Vet", "Animal", "& Co", "Veterinary", "Care"]},
  "dog_training": {label:"dog training", style:"confident, positive, capable", A:["Pack", "Loyal", "Heel", "Bright", "Alpha", "Cedar", "Companion", "Wag"], B:["& Co", "K9", "Training", "Dogs", "Academy"]},
  "event_planning": {label:"event planning", style:"polished, celebratory, seamless", A:["Soiree", "Gather", "Lumen", "Velvet", "Marquee", "Confetti", "Grand", "Bloom"], B:["Events", "& Co", "Occasions", "Studio", "Productions"]},
  "wedding": {label:"wedding planning", style:"romantic, elegant, timeless", A:["Everafter", "Bloom", "Velvet", "Lace", "Vow", "Ivory", "Marigold", "Forever"], B:["Weddings", "& Co", "Events", "Bridal", "Studio"]},
  "hotel": {label:"hotel / lodging / B&B", style:"inviting, restful, characterful", A:["Harbor", "Cedar", "Lantern", "Summit", "Stonegate", "Vista", "Rest"], B:["& Co", "Inn", "Lodge", "House", "Stay"]},
  "travel": {label:"travel agency", style:"adventurous, worldly, wanderlust", A:["Beacon", "Atlas", "Summit", "Coastline", "Lighthouse", "Voyage", "Trailhead"], B:["Travel", "Voyages", "Journeys", "Tours", "& Co"]},
  "dj": {label:"DJ / entertainment", style:"energetic, rhythmic, party-ready", A:["Pulse", "Neon", "Echo", "Bass", "Vibe", "Electric", "Midnight", "Spin"], B:["& Co", "Sound", "Events", "Entertainment", "Audio"]},
  "personal_brand": {label:"personal brand / creator", style:"personal, expressive, memorable", A:["Wildhart", "Daily", "Brightside", "Maker", "Heyday", "Folk", "Lumen", "Muse"], B:["& Co", "Media", "Studio", "House", "Collective"]},
  "nonprofit": {label:"nonprofit", style:"hopeful, communal, mission-driven", A:["Bridge", "Beacon", "Roots", "Hope", "Harbor", "Circle", "Lift"], B:["Foundation", "& Co", "Project", "Fund", "Alliance"]},
  "church": {label:"church / ministry", style:"warm, hopeful, gathering", A:["Grace", "Harbor", "Cedar", "Beacon", "Living", "Hope", "Wellspring"], B:["Church", "Ministry", "& Co", "Fellowship", "Chapel"]},
  "subscription_box": {label:"subscription box", style:"delightful, curated, surprise in a box", A:["Crate", "Posy", "Monthly", "Bundle", "Hatch", "Maple", "Wonder", "Folk"], B:["& Co", "Box", "Crate", "Club", "Goods"]},
  "handmade": {label:"handmade / crafts", style:"tactile, charming, hand-made-with-love", A:["Folk", "Maple", "Hazel", "Wren", "Birch", "Clover", "Loom", "Posy"], B:["& Co", "Made", "Goods", "Crafts", "Studio"]},
  "fashion_designer": {label:"fashion designer / label", style:"refined, original, runway-ready", A:["Maison", "Atelier", "Vesper", "Noir", "Vela", "Mode", "Lumen", "Saffron"], B:["& Co", "Atelier", "Label", "Studio", "Maison"]},
  "casino": {label:"casino / gaming", style:"bold, glamorous, trustworthy high-roller energy; broad appeal, never seedy", A:["Royale", "Monarch", "Gilded", "Empire", "Fortune", "Crown", "Velvet", "Aurelia"], B:["Casino", "Club", "Gaming", "Resort", "& Co"]},
  "venture": {label:"venture capital / investment / private equity", style:"substantial, institutional, established and trustworthy; sounds like a serious firm", A:["Sterling", "Vantage", "Summit", "Beacon", "Crestview", "Aldridge"], B:["Capital", "Partners", "Ventures", "Holdings", "& Co"]},
  "crypto": {label:"crypto / web3 / blockchain", style:"modern, secure, substantial fintech; trustworthy not gimmicky; never coined gibberish", A:["Vault", "Summit", "Sentinel", "Citadel", "Bastion", "Pinnacle", "Vanguard"], B:["Digital", "Markets", "Capital", "Holdings", "& Co"]},
  "luxury": {label:"luxury brand", style:"refined, elegant, timeless, expensive-feeling; restraint over flash; broadly aspirational", A:["Maison", "Aurelia", "Noir", "Lumiere", "Sterling", "Onyx", "Vellis", "Marquess"], B:["Maison", "Atelier", "& Co", "Collection", "Couture"]},
  "fashion_brand": {label:"fashion / apparel brand", style:"modern, confident, broadly wearable consumer label", A:["Vela", "Atlas", "Mode", "Form", "Reign", "Marlowe", "Noor", "Edit"], B:["& Co", "Apparel", "Studio", "Label", "Collective"]},
  "gas_station": {label:"gas station / fuel", style:"clear, dependable, on-the-go fuel and convenience", A:["Clearway", "Summit", "Mileway", "Beacon", "Express", "Crossroads", "Pitstop", "Northgate"], B:["Fuel", "Station", "Stop", "Mart", "& Co"]},
  "towing": {label:"towing / roadside", style:"dependable, strong, 24/7 rescue; trustworthy", A:["Ironclad", "Summit", "Rapid", "Clearway", "Sentinel", "Vanguard", "Titan", "Frontline"], B:["Recovery", "Towing", "Roadside", "Pro", "Auto Recovery"]},
  "senior_care": {label:"senior care / assisted living", style:"dignified, warm, safe, respectful; never clinical-cold", A:["Harborview", "Cedarcrest", "Evergreen", "Stonebridge", "Oakmont", "Fairhaven", "Brookhaven"], B:["Senior Living", "Senior Living", "Living", "Senior Care", "Residence"]},
  "agriculture": {label:"farm / agriculture", style:"rooted, hearty, honest land and harvest; broad", A:["Harvest", "Fieldstone", "Greenacre", "Homestead", "Ridgeline", "Meadowland", "Bountiful"], B:["Farms", "Acres", "Agriculture", "Harvest", "& Co"]},
  "manufacturing": {label:"manufacturing", style:"sturdy, capable, industrial-grade, dependable", A:["Ironworks", "Vanguard", "Precision", "Summit", "Atlas", "Bedrock", "Forge"], B:["Manufacturing", "Industries", "Works", "Fabrication", "& Co"]},
  "logistics": {label:"logistics / freight", style:"fast, reliable, capable; moves the world", A:["Swift", "Vantage", "Express", "Velocity", "Vanguard", "Clearway"], B:["Logistics", "Freight", "Supply", "Transport", "& Co"]},
  "cruise": {label:"cruise line / maritime", style:"expansive, elegant, oceanic, premium escape", A:["Azure", "Voyager", "Oceanic", "Celeste", "Horizon", "Coastline", "Marlin"], B:["Cruises", "Lines", "Voyages", "Maritime", "& Co"]},
  "winery": {label:"winery / vineyard", style:"premium, established, estate feel", A:["Crown", "Copper Ridge", "Sterling", "Hillcrest", "Stonebridge", "Cedar Ridge"], B:["Cellars", "Vineyards", "Winery", "Estate"]},
  "butcher": {label:"butcher shop", style:"warm, honest, local, literal", A:["The Butcher", "Harvest", "Heritage", "The Local", "Prime"], B:["House", "Meats", "Butcher", "Co"]},
  "liquor_store": {label:"wine & liquor store", style:"clean, premium retail", A:["Crown", "Harborview", "Sterling", "The Wine", "Summit"], B:["Wine & Spirits", "Cellars", "Spirits", "Co"]},
  "storage": {label:"self storage", style:"clear, secure, dependable", A:["Summit", "Clearway", "Pinnacle", "Stronghold", "Vault"], B:["Storage", "Self Storage", "Co"]},
  "junk_removal": {label:"junk removal / hauling", style:"fast, literal, strong", A:["Rapid", "Junk Squad", "Haul Pro", "Summit", "Clearway"], B:["Junk Removal", "Hauling", "Pro", "Co"]},
  "tree_service": {label:"tree service / arborist", style:"strong, natural, dependable", A:["Stoneridge", "Summit", "Evergreen", "Timberline", "Ironwood"], B:["Tree Service", "Tree Co", "Arborists", "Co"]},
  "solar": {label:"solar installer", style:"modern, clean, capable trade", A:["Summit", "Clearway", "Solaris", "Vanguard", "Sunpeak"], B:["Solar", "Solar Co", "Energy"]},
  "locksmith": {label:"locksmith", style:"fast, literal, trustworthy", A:["Rapid", "Lock Pro", "Summit", "Clearway", "Sentinel", "Stronghold"], B:["Locksmith", "Lock & Key", "Pro"]},
  "mortgage": {label:"mortgage broker / lender", style:"gravitas, trustworthy finance", A:["Sterling", "Summit", "Vanguard", "Crown"], B:["Mortgage", "Lending", "Loans", "Co"]},
  "title_escrow": {label:"title & escrow company", style:"gravitas, trustworthy, clean", A:["Sterling", "Vanguard", "Summit", "Pinnacle"], B:["Title", "Title & Escrow", "Escrow", "Co"]},
  "printing": {label:"printing / print shop", style:"clean, fast, functional", A:["Rapid", "Print Pro", "Summit", "Mainstreet", "Crisp"], B:["Printing", "Print Co", "Press", "Pro"]},
  "dry_cleaning": {label:"dry cleaning / laundry", style:"clean, literal, fresh", A:["Spotless", "Pristine", "Summit", "Crisp", "Mainstreet"], B:["Cleaners", "Laundry", "Co"]},
  "martial_arts": {label:"martial arts / dojo", style:"strong, disciplined, bold", A:["Dragon", "Summit", "Apex", "Titan", "Vanguard"], B:["Martial Arts", "Dojo", "Academy"]},
  "dance": {label:"dance studio", style:"warm, graceful, simple", A:["The Dance", "The Studio", "Summit", "Mainstreet", "Grace"], B:["House", "Dance", "Studio"]},
  "music_school": {label:"music lessons / school", style:"warm, clear, simple", A:["The Music", "Crescendo", "Summit", "Sterling", "Bright Note"], B:["House", "Music", "Music School"]},
  "tutoring": {label:"tutoring / test prep", style:"clear, capable, trustworthy", A:["Bright Scholars", "Summit", "Pinnacle"], B:["Tutoring", "Learning", "Prep", "Academy"]},
  "acupuncture": {label:"acupuncture / holistic wellness", style:"calm, balanced, clear", A:["Sanctuary", "Serenity", "Summit", "Balance", "Clearpath"], B:["Wellness", "Acupuncture", "Co"]},
  "physical_therapy": {label:"physical therapy clinic", style:"clear, capable, trustworthy", A:["Summit", "Pinnacle", "Harborview"], B:["Physical Therapy", "PT", "Rehab"]},
  "funeral": {label:"funeral home", style:"dignified, gentle, established", A:["Harborview", "Evergreen", "Gracewood", "Sterling", "Summit"], B:["Funeral Home", "Memorial", "Co"]},
  "art_gallery": {label:"art gallery", style:"refined, clean, cultured", A:["The Art", "Crown", "Sterling", "Heritage", "Harborview"], B:["House", "Gallery", "Co"]},
  "magazine": {label:"magazine / publication", style:"editorial, confident, punchy", A:["The Quarterly", "Beacon", "The Review", "The Journal", "Sterling", "Crown"], B:["Magazine", "Press", "Review", "Co"]},
  "publisher": {label:"book publisher", style:"established, literary, clean", A:["The Press Room", "Sterling House", "Crown", "Harbor"], B:["Press", "Publishing", "Books"]},
  "newsletter": {label:"newsletter / email media", style:"punchy, editorial, confident", A:["The Wire", "The Roundup", "Headline", "The Dispatch", "The Daily Brief", "Beacon"], B:["", "Brief", "Wire", "Dispatch"]},
  "news_site": {label:"news / digital media site", style:"punchy, editorial, confident", A:["Headline", "The Daily", "Beacon", "The Wire", "The Dispatch", "The Signal"], B:["", "News", "Media", "Wire"]},
  "blog": {label:"blog / content site", style:"punchy, simple, editorial", A:["Headline", "The Journal", "The Studio", "The Daily", "Field Notes", "The Desk"], B:["", "Journal", "Studio"]},
  "podcast_network": {label:"podcast network", style:"confident, candid, simple", A:["Open Mic", "The Roundtable", "The Signal", "The Studio", "Frontline"], B:["", "Audio", "Network"]},
  "zine": {label:"literary journal / zine", style:"literary, spare, editorial", A:["The Quarterly", "The Review", "Field Notes", "The Press Room", "Folio", "Margin"], B:["", "Review", "Quarterly"]},
  "mobile_app": {label:"mobile app", style:"short, clean, modern", A:["Summit", "Loop", "Tempo", "Beacon", "Vantage"], B:["", "App", "Co"]},
  "productivity_app": {label:"productivity app", style:"clean, modern, simple", A:["Focus", "Tempo", "Summit", "Flow", "Cadence"], B:["", "App", "Co"]},
  "dating_app": {label:"dating app", style:"warm, simple, modern", A:["Spark", "Match House", "Bloom", "Kindred", "Pair", "Heyday"], B:["", "House", "Co"]},
  "marketplace": {label:"marketplace platform", style:"clean, broad, modern", A:["The Market", "Summit Market", "Mainstreet", "Trove", "Harbor Market", "Tradehouse"], B:["", "Market", "Co"]},
  "community_app": {label:"social / community app", style:"warm, connective, simple", A:["Circle", "Commons", "Roundtable", "Gather", "Kindred", "Hearth"], B:["", "Co"]},
  "elearning": {label:"e-learning / course platform", style:"clear, capable, scholarly", A:["Bright Scholars", "Summit", "Clearpath", "Scholar"], B:["Learning", "Academy", "Co"]},
  "creator_tool": {label:"creator / newsletter tool", style:"modern, clean, simple", A:["Headline", "The Studio", "Beacon", "Creator", "Loom", "Folio"], B:["", "Co", "Studio"]},
  "dev_tool": {label:"no-code / dev tool", style:"sharp, modern, technical", A:["Vantage", "Forge", "Summit", "Northstack", "Brightstack", "Clearstack"], B:["", "Stack", "Co"]},
  "analytics": {label:"analytics / data platform", style:"clean, sharp, trustworthy data", A:["Vantage", "Northstar", "Lighthouse", "Summit", "Beacon"], B:["Analytics", "Data", "Co"]},
  "crm": {label:"CRM / business software", style:"gravitas, capable, clean", A:["Summit", "Vantage", "Pipeline"], B:["CRM", "Software", "Systems", "Co"]},
  "fintech_app": {label:"fintech / payments app", style:"trustworthy, solid, clean finance", A:["Summit", "Vault", "Clearway", "North"], B:["Pay", "Pay", "Ledger"]},
  "fitness_app": {label:"health / fitness app", style:"kinetic, clean, motivating", A:["Pulse", "Peak", "Thrive", "Summit", "Cadence", "Vital"], B:["", "App", "Co"]},
  "ai_tool": {label:"AI / automation tool", style:"sharp, gravitas, modern; trustworthy AI", A:["Summit", "Vantage", "Northstar", "Lumen"], B:["AI", "Intelligence", "Co"]},
  "snack_brand": {label:"snack / food brand", style:"appetizing, wholesome, simple", A:["Harvest", "Crave", "Field Day", "Wholesome", "Golden", "Bright Bites"], B:["", "Co", "Snacks"]},
  "beverage_brand": {label:"beverage / soda brand", style:"bright, refreshing, crisp", A:["Zest", "Crisp", "Sunny", "Clearwater", "Bright", "Golden"], B:["", "Co"]},
  "energy_drink": {label:"energy drink brand", style:"punchy, electric, powerful", A:["Surge", "Volt", "Ignite", "Charge", "Bolt", "Apex"], B:["", "Energy"]},
  "tea_brand": {label:"tea brand", style:"premium, warm, calm", A:["Sterling", "Harvest", "Golden Leaf", "The Tea", "Heritage", "Bright Leaf"], B:["Tea Co", "Tea", "House"]},
  "supplement_brand": {label:"supplement / vitamin brand", style:"clean, vital, trustworthy", A:["Wellspring", "Vital", "Balance", "Pure", "Thrive"], B:["", "Co", "Nutrition"]},
  "protein_brand": {label:"protein / fitness nutrition", style:"strong, fuel, kinetic", A:["Peak Fuel", "Forge", "Apex", "Vital", "Summit", "Ironworks"], B:["", "Fuel", "Nutrition"]},
  "pet_food": {label:"pet food brand", style:"wholesome, caring, honest", A:["Companion", "Wholesome Paws", "Field & Farm", "Bright Paws", "Pure Paws", "Harvest Pet"], B:["", "Co", "Pet Co"]},
  "personal_care": {label:"personal care brand", style:"clean, glowing, elegant", A:["Radiance", "Lumiere", "Pure", "Bare", "Bloom", "Verdant"], B:["", "Co"]},
  "baby_brand": {label:"baby / kids products brand", style:"gentle, warm, playful", A:["Bright Start", "Little Sprout", "Sunny Days", "Tinytown", "Cubby", "Gentle"], B:["", "Co"]},
  "toy_brand": {label:"toy brand", style:"playful, bright, fun", A:["Playwell", "Joybox", "Wonder", "Tinker", "Sprout", "Cubby"], B:["", "Co"]},
  "eyewear": {label:"eyewear / sunglasses brand", style:"clean, modern, sharp", A:["Vista", "Sterling Optics", "Frame", "Lumen", "Bright"], B:["", "Co", "Optics"]},
  "toy_store": {label:"toy store", style:"playful, friendly, simple", A:["The Toy", "The Play", "Wonder", "Bright", "Tinkertown", "Mainstreet"], B:["House", "Toys", "Co"]},
  "comic_shop": {label:"comic / hobby shop", style:"fun, collector, literal", A:["The Comic", "Vault", "Mainstreet", "Heroes", "The Hobby"], B:["House", "Comics", "Co"]},
  "record_store": {label:"record / vinyl store", style:"cool, literal, simple", A:["The Record", "The Vinyl", "Mainstreet", "Spin", "Heritage", "Vinyl"], B:["House", "Records", "& Co"]},
  "craft_store": {label:"craft / art supply store", style:"warm, literal, simple", A:["The Craft", "The Art", "Mainstreet", "The Supply", "Maker"], B:["House", "Crafts", "Co"]},
  "hardware_store": {label:"hardware store", style:"sturdy, literal, dependable", A:["The Hardware", "Mainstreet", "Summit", "Sterling", "Stonewall"], B:["House", "Hardware", "Co"]},
  "garden_center": {label:"garden center / nursery", style:"natural, warm, simple", A:["The Garden", "Greenfield", "Evergreen", "Stonefield", "Harvest"], B:["House", "Nursery", "Gardens", "Co"]},
  "gourmet_shop": {label:"gourmet / specialty food shop", style:"warm, abundant, literal", A:["The Pantry", "Harvest", "The Gourmet", "Heritage", "Mainstreet"], B:["Provisions", "House", "Pantry", "Co"]},
  "chocolate_shop": {label:"chocolate / candy shop", style:"indulgent, warm, literal", A:["The Chocolate", "Velvet", "Harvest", "Golden Cocoa", "Sweet", "Crown"], B:["House", "Confections", "Chocolate", "Co"]},
  "furniture_store": {label:"furniture store", style:"warm, established, literal", A:["The Home", "Sterling", "Mainstreet", "Heritage", "Summit"], B:["House", "Furniture", "Home", "Co"]},
  "coworking": {label:"coworking space", style:"clean, communal, simple", A:["The Workspace", "The Commons", "Summit", "Mainstreet", "Workwell"], B:["Workspace", "Commons", "Co"]},
  "event_venue": {label:"event venue / banquet hall", style:"grand, elegant, established", A:["The Grand", "Sterling", "The Manor", "Crown", "The Estate"], B:["Venue", "Hall", "Co"]},
  "food_hall": {label:"food hall / market hall", style:"abundant, communal, literal", A:["The Market Hall", "The Food", "Harvest", "Mainstreet", "Garden"], B:["Hall", "House", "Co"]},
  "meal_kit": {label:"meal prep / meal kit", style:"fresh, wholesome, appetizing", A:["Harvest Kitchen", "Fresh", "Wholesome", "Bright Plate", "Garden Table"], B:["", "Co", "Kitchen"]},
  "distillery": {label:"distillery", style:"craft, heritage, copper-and-oak", A:["Ironside", "Heritage", "Stonewall", "Copper & Oak", "Summit"], B:["Distilling", "Distillery", "Co"]},
  "private_chef": {label:"private chef / personal chef", style:"elegant, intimate, culinary", A:["The Private", "The Chef's", "Harvest", "The Personal", "Heritage"], B:["Table", "Private Chef", "Culinary", "Kitchen"]},
  "mobile_bar": {label:"mobile bartending", style:"fun, spirited, on-the-go", A:["The Traveling", "Top Shelf", "The Pour", "The Tap", "The Mobile", "Crafted"], B:["Bar", "House", "Co", "Bartending"]},
  "car_rental": {label:"car rental", style:"clean, simple, dependable", A:["Rapid", "Summit", "Clearway", "Crown", "Mainstreet"], B:["Car Rental", "Rentals", "Auto Rental"]},
  "limo": {label:"limo / chauffeur service", style:"premium, elegant, black-tie", A:["Crown", "Sterling", "Premier", "Black Tie", "Summit", "Elite"], B:["Limousine", "Car Service", "Chauffeur", "Limo"]},
  "driving_school": {label:"driving school", style:"capable, clear, reassuring", A:["Pro Drive", "Summit", "Safe Roads", "Mainstreet", "Clearway", "Premier"], B:["Driving School", "Academy", "Driving Academy"]},
  "bike_shop": {label:"bike shop / repair", style:"friendly, local, simple", A:["The Bike", "Pedal Pro", "Mainstreet", "Summit", "The Cycle"], B:["House", "Bikes", "Cycles", "Co"]},
  "motorcycle": {label:"motorcycle shop", style:"rugged, bold, iron", A:["Ironside", "Throttle", "Iron Horse", "Crown", "Summit", "Heritage"], B:["Motorcycles", "Moto", "Cycles", "Co"]},
  "tire_shop": {label:"tire shop", style:"fast, literal, dependable", A:["Rapid", "Tire Pro", "Mainstreet", "Summit", "Pro"], B:["Tire", "Tires", "Pro", "Co"]},
  "auto_glass": {label:"auto glass repair", style:"clear, fast, literal", A:["Rapid", "Summit", "Crystal", "Pro"], B:["Auto Glass", "Glass", "Co"]},
  "window_tint": {label:"window tinting", style:"sharp, fast, clean", A:["Rapid", "Shade Pro", "Summit", "Pro"], B:["Tint", "Tinting", "Pro"]},
  "fence": {label:"fence company", style:"sturdy, secure, strong", A:["Ironclad", "Sentinel", "Summit", "Mainstreet", "Clearway"], B:["Fence", "Fencing", "Fence Co"]},
  "concrete": {label:"concrete / masonry", style:"solid, heavy, foundational", A:["Summit", "Stonewall", "Bedrock", "Granite", "Ironclad"], B:["Concrete", "Masonry", "Co"]},
  "welding": {label:"welding / metal fabrication", style:"strong, industrial, iron", A:["Ironworks", "Vanguard", "Steelhouse", "Forge", "Summit", "Iron"], B:["Welding", "Fabrication", "Metalworks", "Co"]},
  "paving": {label:"paving / asphalt", style:"fast, literal, heavy-duty", A:["Blacktop Pro", "Rapid", "Summit", "Mainstreet", "Clearway"], B:["Paving", "Asphalt", "Pro"]},
  "flooring": {label:"flooring installer", style:"warm, literal, quality", A:["The Floor", "Summit", "Mainstreet", "Heritage", "Clearway"], B:["House", "Flooring", "Floors"]},
  "cabinetry": {label:"cabinetry / cabinet maker", style:"crafted, warm, quality", A:["The Cabinet", "Heritage", "Summit", "Mainstreet", "Sterling"], B:["House", "Cabinetry", "Cabinets"]},
  "countertop": {label:"countertop / granite", style:"solid, premium, literal", A:["Granite Pro", "Stoneworks", "Summit", "Heritage", "Mainstreet"], B:["Countertops", "Stone", "Pro"]},
  "garage_door": {label:"garage door company", style:"fast, literal, dependable", A:["Rapid", "Overhead Pro", "Summit", "Mainstreet", "Pro", "Clearway"], B:["Garage Doors", "Garage Door", "Pro"]},
  "gutter": {label:"gutter installation", style:"fast, literal, simple", A:["Rapid", "Gutter Pro", "Summit", "Mainstreet", "Pro", "Clearway"], B:["Gutters", "Gutter", "Pro"]},
  "waterproofing": {label:"waterproofing / foundation", style:"strong, protective, solid", A:["Ironclad", "Stronghold", "Summit", "Bedrock", "Clearway"], B:["Waterproofing", "Foundation", "Co"]},
  "chimney": {label:"chimney sweep", style:"fast, literal, classic", A:["Rapid", "Clean Sweep", "Summit", "Mainstreet", "Hearthside"], B:["Chimney", "Sweep", "Co"]},
  "septic": {label:"septic service", style:"fast, literal, dependable", A:["Rapid", "Septic Pro", "Summit", "Mainstreet", "Pro"], B:["Septic", "Pro", "Co"]},
  "power_washing": {label:"power washing / pressure washing", style:"clean, fast, literal", A:["Rapid", "Pressure Pro", "Spotless", "Pristine", "Summit", "Clearway"], B:["Power Washing", "Power Wash", "Pro"]},
  "snow_removal": {label:"snow removal", style:"fast, literal, dependable", A:["Snow Pro", "Rapid", "Summit", "Pro", "Clearway"], B:["Snow Removal", "Snow", "Pro"]},
  "home_staging": {label:"home staging", style:"polished, elegant, refined", A:["The Staged", "Polished", "Summit", "Sterling", "The Styled"], B:["House", "Staging", "Home Staging"]},
  "property_mgmt": {label:"property management", style:"trustworthy, established, professional", A:["Summit", "Sterling", "Pinnacle", "Harborview"], B:["Property Management", "Properties", "Property Group"]},
  "surveying": {label:"land surveying", style:"precise, professional, exact", A:["Precision", "Summit", "Vanguard", "Mainstreet"], B:["Surveying", "Land Surveying", "Surveyors"]},
  "notary": {label:"notary / signing agent", style:"fast, literal, mobile", A:["Mobile Notary Pro", "Rapid", "Pro", "Mobile", "Summit", "Clearway"], B:["Notary", "Notary Pro", "Co"]},
  "private_investigator": {label:"private investigator", style:"discreet, sharp, vigilant", A:["Sentinel", "Summit", "Vanguard"], B:["Investigations", "Investigative", "Co"]},
  "translation": {label:"translation service", style:"global, clear, professional", A:["Global Bridge", "Lingua", "Summit", "Linguava"], B:["Translation", "Translations", "Co"]},
  "recording_studio": {label:"recording studio", style:"creative, sonic, cool", A:["The Sound", "Northlight", "Summit", "Frontline", "The Record"], B:["House", "Studios", "Sound", "Records"]},
  "sign_company": {label:"sign company / signage", style:"fast, literal, sharp", A:["Sign Pro", "Summit", "Mainstreet", "Pro", "Clearway"], B:["Signs", "Sign Co", "Pro"]},
  "screen_printing": {label:"screen printing / embroidery", style:"fast, literal, maker", A:["Print Pro", "Pro", "Summit", "Mainstreet", "Ink", "Thread"], B:["Printing", "Print Co", "Apparel", "Pro"]},
  "equip_rental": {label:"equipment / tool rental", style:"fast, literal, dependable", A:["Pro Rentals", "Rapid", "Summit", "Mainstreet", "Clearway"], B:["Rentals", "Equipment Rental", "Co"]},
  "party_rental": {label:"party rental", style:"festive, simple, warm", A:["The Party", "Summit", "Mainstreet", "Crown", "Grand"], B:["House", "Party Rentals", "Event Rentals"]},
  "photo_booth": {label:"photo booth rental", style:"fun, snappy, simple", A:["The Photo", "Snap", "Summit", "Crown", "Bright", "Mainstreet"], B:["House", "Photo Booth", "Booth", "Co"]},
  "surf_shop": {label:"surf shop", style:"coastal, cool, laid-back", A:["The Surf", "Tidewater", "Summit", "Coastline", "Wave", "The Wave"], B:["House", "Surf", "Surf Co", "& Co"]},
  "dive_shop": {label:"dive shop / scuba", style:"oceanic, cool, adventurous", A:["The Dive", "Coastline", "Bluewater", "Mainstreet", "Summit", "Tidewater"], B:["House", "Dive Co", "Scuba", "Dive"]},
  "gun_shop": {label:"gun shop / firearms", style:"strong, secure, vigilant", A:["Sentinel", "Mainstreet", "Vanguard", "Liberty"], B:["Firearms", "Arms", "Co"]},
  "pool_service": {label:"pool cleaning service", style:"clean, fast, literal", A:["Pool Pro", "Rapid", "Crystal Clear", "Crystal", "Summit", "Mainstreet"], B:["Pro", "Pool Service", "Pools"]},
  "pool_builder": {label:"pool builder", style:"premium, oasis, built", A:["Oasis", "Summit", "Heritage", "Bluewater", "Crystal"], B:["Pools", "Pool Co", "Co"]},
  "irrigation": {label:"irrigation / sprinkler", style:"fast, literal, green", A:["Rapid", "Sprinkler Pro", "Summit", "Greenfield", "Evergreen", "Pro"], B:["Irrigation", "Sprinklers", "Pro"]},
  "deck_builder": {label:"deck builder", style:"crafted, literal, warm", A:["The Deck", "Deck Pro", "Summit", "Heritage", "Pro"], B:["House", "Decks", "Pro"]},
  "hardscape": {label:"patio / hardscape", style:"solid, crafted, stone", A:["The Patio", "Summit", "Stoneworks", "Heritage", "Granite"], B:["House", "Hardscapes", "Hardscape"]},
  "handyman": {label:"handyman service", style:"fast, friendly, literal", A:["Handyman Pro", "Rapid", "Honest", "Summit", "Mainstreet", "Pro"], B:["Pro", "Handyman", "Co"]},
  "appliance_repair": {label:"appliance repair", style:"fast, literal, dependable", A:["Appliance Pro", "Rapid", "Fix Pro", "Summit", "Mainstreet", "Pro"], B:["Pro", "Appliance Repair", "Appliance"]},
  "painter": {label:"house painter", style:"clean, literal, crisp", A:["Pro Painters", "Summit", "Heritage", "Mainstreet", "Pro"], B:["Painting", "Painters", "Co"]},
  "demolition": {label:"demolition", style:"strong, fast, heavy", A:["Wrecking Pro", "Rapid", "Summit", "Pro", "Iron"], B:["Demolition", "Pro", "Co"]},
  "excavation": {label:"excavation / grading", style:"earthy, strong, literal", A:["Earthworks", "Summit", "Bedrock", "Mainstreet", "Pro"], B:["Excavation", "Earthworks", "Co"]},
  "duct_cleaning": {label:"air duct cleaning", style:"clean, fresh, fast", A:["Duct Pro", "Rapid", "Fresh Air Pro", "Pristine", "Summit", "Pro"], B:["Pro", "Duct Cleaning", "Air Duct"]},
  "mold": {label:"mold remediation", style:"clean, pure, fast", A:["Rapid", "Pure Air Pro", "Summit", "Pristine", "Pro"], B:["Mold Removal", "Mold Remediation", "Pro"]},
  "restoration": {label:"damage restoration", style:"fast, restorative, literal", A:["Restore Pro", "Rapid", "Summit", "Pro", "Mainstreet"], B:["Restoration", "Pro", "Co"]},
  "mosquito": {label:"mosquito control", style:"fast, literal, sharp", A:["Mosquito Pro", "Rapid", "Skeeter Pro", "Summit", "Pro", "Mainstreet"], B:["Pro", "Mosquito Control", "Co"]},
  "wildlife": {label:"wildlife removal", style:"fast, literal, rugged", A:["Critter Pro", "Rapid", "Wildlife Pro", "Summit", "Pro", "Mainstreet"], B:["Pro", "Wildlife Removal", "Co"]},
  "lawn_care": {label:"lawn care / fertilization", style:"green, fresh, literal", A:["Lawn Pro", "Greenfield", "Summit", "Evergreen", "Mainstreet", "Pro"], B:["Pro", "Lawn Care", "Co"]},
  "holiday_lighting": {label:"holiday lighting", style:"festive, bright, literal", A:["Holiday Pro", "Bright Lights", "Twinkle Pro", "Summit", "Evergreen", "Pro"], B:["Pro", "Lighting", "Co"]},
  "closet_org": {label:"closet & garage organization", style:"tidy, clean, literal", A:["The Closet", "Tidy Pro", "Summit", "Mainstreet", "Pro", "Neatly"], B:["House", "Closets", "Pro"]},
  "epoxy": {label:"epoxy garage flooring", style:"sharp, modern, literal", A:["Epoxy Pro", "Summit", "Pro", "Granite", "Mainstreet"], B:["Pro", "Epoxy", "Coatings"]},
  "car_wrap": {label:"car wrap / vinyl", style:"sharp, modern, literal", A:["Wrap Pro", "Summit", "Pro", "Mainstreet", "Apex"], B:["Pro", "Wraps", "Co"]},
  "car_audio": {label:"car audio / stereo", style:"sharp, literal, sound", A:["Sound Pro", "Summit", "Pro", "Mainstreet", "Apex", "Bass"], B:["Pro", "Car Audio", "Co"]},
  "upholstery": {label:"auto upholstery", style:"crafted, literal, quality", A:["Summit", "Heritage", "Stitch Pro", "Mainstreet", "Pro"], B:["Upholstery", "Pro", "Co"]},
  "oil_change": {label:"oil change / quick lube", style:"fast, literal, pit-stop", A:["Quick Lube Pro", "Rapid", "Pit Stop Pro", "Summit", "Pro", "Mainstreet"], B:["Pro", "Quick Lube", "Lube"]},
  "brake_muffler": {label:"brake & muffler shop", style:"fast, literal, tough", A:["Brake Pro", "Rapid", "Pro Muffler", "Summit", "Pro", "Mainstreet"], B:["Pro", "Brake & Muffler", "Brakes"]},
  "transmission": {label:"transmission shop", style:"fast, literal, mechanical", A:["Transmission Pro", "Rapid", "Summit", "Pro", "Gear", "Mainstreet"], B:["Pro", "Transmission", "Co"]},
  "used_car": {label:"used car dealership", style:"heritage, trusted, mainstreet", A:["Heritage", "Crown", "Mainstreet", "Summit", "Liberty"], B:["Motors", "Auto Sales", "Motorcars"]},
  "mobile_mechanic": {label:"mobile mechanic", style:"fast, literal, on-the-go", A:["Wrench Pro", "Rapid", "Mobile Mechanic Pro", "Summit", "Pro", "Mainstreet"], B:["Pro", "Mobile Mechanic", "Mobile Auto"]},
  "marine_repair": {label:"boat / marine repair", style:"coastal, capable, literal", A:["Coastal Marine Pro", "Harbor", "Bluewater", "Summit", "Tidewater", "Pro"], B:["Marine", "Marine Repair", "Marine Pro"]},
  "rv_dealer": {label:"RV dealer", style:"open-road, adventurous, literal", A:["Open Road", "Crossroads", "Summit", "Mainstreet", "Liberty", "Frontier"], B:["RV", "RV Co", "Motorhomes"]},
  "pizzeria": {label:"pizzeria", style:"warm, fiery, literal", A:["Brick & Fire", "The Pizza", "Slice House", "Mainstreet", "The Slice", "Bella"], B:["Kitchen", "Pizza", "House"]},
  "deli": {label:"sandwich shop / deli", style:"warm, local, literal", A:["The Sandwich", "Harvest", "Mainstreet", "The Corner", "Heritage", "The Local"], B:["House", "Deli", "Sandwiches"]},
  "bagel": {label:"bagel shop", style:"warm, simple, literal", A:["The Bagel", "Mainstreet", "Daybreak", "Sunrise", "Heritage", "The Local"], B:["House", "Bagels", "Co"]},
  "donut": {label:"donut shop", style:"sweet, simple, literal", A:["The Donut", "Mainstreet", "Daybreak", "Golden", "Sunrise", "Glaze"], B:["House", "Donuts", "Co"]},
  "taqueria": {label:"taqueria / taco shop", style:"warm, literal, fun", A:["The Taco", "Mainstreet", "The Local", "Heritage", "Casa", "Fuego"], B:["House", "Tacos", "Co"]},
  "sushi": {label:"sushi restaurant", style:"clean, fresh, coastal", A:["The Sushi", "Blue Wave", "Coastal", "Sakura", "Mainstreet", "Umi"], B:["House", "Sushi", "Co"]},
  "steakhouse": {label:"steakhouse", style:"premium, hearty, literal", A:["The Steak", "Prime & Oak", "Sterling", "Heritage", "Mainstreet", "Crown"], B:["House", "Steakhouse", "Co"]},
  "seafood": {label:"seafood restaurant", style:"coastal, fresh, literal", A:["Coastal Catch", "Tidewater", "The Oyster", "Harbor", "Blue Dock", "Mainstreet"], B:["Seafood", "House", "Catch"]},
  "bbq": {label:"BBQ joint", style:"smoky, hearty, literal", A:["The Smoke", "Smokehouse", "Mainstreet", "The Pit", "Heritage", "Ember"], B:["House", "BBQ", "Smokehouse"]},
  "ramen": {label:"ramen / noodle bar", style:"warm, simple, literal", A:["The Noodle", "Mainstreet", "Steam", "Umami", "Coastal", "The Ramen"], B:["House", "Noodle Bar", "Co"]},
  "juice_bar": {label:"juice / smoothie bar", style:"fresh, bright, literal", A:["The Juice", "Harvest", "Daily", "Green", "Mainstreet", "Sunny"], B:["House", "Juice Co", "Bar"]},
  "acai": {label:"acai bowl shop", style:"fresh, tropical, literal", A:["The Bowl", "Harvest", "Tropic", "Sunrise", "Mainstreet", "Daybreak"], B:["House", "Bowls", "Co"]},
  "ice_cream": {label:"ice cream shop", style:"sweet, warm, literal", A:["The Scoop", "Sugarhill", "Mainstreet", "Heritage", "Sweet", "Frost"], B:["House", "Creamery", "Scoop"]},
  "wine_bar": {label:"wine bar", style:"warm, refined, literal", A:["The Cellar", "The Tasting Room", "Vintage", "Harvest", "Sterling", "The Vine"], B:["", "Wine Bar", "Cellars"]},
  "sports_bar": {label:"sports bar", style:"fun, local, spirited", A:["The Dugout", "The Tap Room", "Mainstreet", "Overtime", "The Lineup", "The Bullpen"], B:["", "Sports Bar", "Co"]},
  "cheese_shop": {label:"cheese shop", style:"warm, artisan, literal", A:["The Cheese", "Mainstreet", "Heritage", "The Cheesemonger", "Harvest", "Curd"], B:["House", "Cheese", "Co"]},
  "spice_shop": {label:"spice shop", style:"warm, aromatic, literal", A:["The Spice", "Mainstreet", "Heritage", "Saffron", "Harvest", "The Pantry"], B:["House", "Spice", "Co"]},
  "shoe_store": {label:"shoe store", style:"clean, literal, simple", A:["The Shoe", "Mainstreet", "Summit", "Heritage", "Sole"], B:["House", "Shoes", "Co"]},
  "sneaker": {label:"sneaker / streetwear shop", style:"cool, sharp, urban", A:["The Sneaker", "Laced", "Mainstreet", "Soled", "Heat", "Crown"], B:["House", "Kicks", "Co"]},
  "consignment": {label:"consignment / thrift shop", style:"curated, revival, literal", A:["Revival", "Mainstreet", "Heritage", "Second Story", "The Found", "The Second"], B:["", "Consignment", "Co"]},
  "pawn": {label:"pawn shop", style:"literal, local, simple", A:["Mainstreet", "Summit", "Crown", "Heritage", "Liberty"], B:["Pawn", "Pawn Co", "Co"]},
  "antique": {label:"antique shop", style:"heritage, warm, literal", A:["The Antique", "Mainstreet", "Heritage", "The Vintage", "Bygone"], B:["House", "Antiques", "Co"]},
  "cigar": {label:"cigar / smoke shop", style:"warm, refined, literal", A:["The Cigar", "The Humidor", "Mainstreet", "Heritage", "Ash", "Crown"], B:["House", "Cigars", "Co"]},
  "vape": {label:"vape shop", style:"modern, literal, simple", A:["Vapor House", "Mainstreet", "Summit", "Cloud", "Crown", "Clearway"], B:["", "Vape", "Co"]},
  "pet_store2": {label:"pet store", style:"warm, friendly, literal", A:["The Pet", "Wag", "Mainstreet", "Summit", "Heritage"], B:["House", "& Co", "Pets"]},
  "aquarium": {label:"aquarium / fish store", style:"coastal, cool, literal", A:["The Reef", "Bluewater", "Coral", "Mainstreet", "Summit", "Tidewater"], B:["House", "Aquatics", "Co"]},
  "feed_store": {label:"feed & farm supply", style:"honest, rural, literal", A:["The Feed", "Mainstreet", "Heritage", "Field & Farm", "Harvest"], B:["House", "Feed", "Feed & Supply"]},
  "watch_shop": {label:"watch shop / repair", style:"refined, literal, classic", A:["The Watch", "Sterling", "Mainstreet", "Heritage", "Crown", "Tick"], B:["House", "Watch Co", "Co"]},
  "fabric": {label:"fabric / sewing shop", style:"warm, crafty, literal", A:["The Fabric", "Stitch House", "Mainstreet", "Heritage", "Thread"], B:["House", "Fabrics", "Co"]},
  "yarn": {label:"yarn shop", style:"warm, cozy, literal", A:["The Yarn", "Mainstreet", "The Knit", "Loop", "Wool", "Heritage"], B:["House", "Yarn", "Co"]},
  "cookware": {label:"kitchen / cookware shop", style:"warm, literal, quality", A:["The Kitchen", "The Pantry", "Mainstreet", "Heritage", "Copper"], B:["House", "Kitchen", "Cookware"]},
  "board_game": {label:"board game store", style:"fun, literal, playful", A:["The Game", "Mainstreet", "Meeple", "Heritage", "The Dice", "Tabletop"], B:["House", "Games", "Co"]},
  "cobbler": {label:"shoe repair / cobbler", style:"honest, literal, classic", A:["The Cobbler", "Mainstreet", "Heritage", "Sole Pro", "Resole"], B:["House", "Cobbler", "Shoe Repair"]},
  "chiropractor": {label:"chiropractor", style:"clean, capable, literal", A:["Summit", "Align", "Mainstreet", "Wellspring"], B:["Chiropractic", "Chiro", "Co"]},
  "orthodontist": {label:"orthodontist", style:"bright, friendly, literal", A:["Brightsmile", "Summit", "Mainstreet", "Heritage"], B:["Orthodontics", "Ortho", "Co"]},
  "dermatology": {label:"dermatology clinic", style:"radiant, premium, clean", A:["Radiance", "Summit", "Mainstreet", "Heritage"], B:["Dermatology", "Derm", "Co"]},
  "urgent_care": {label:"urgent care", style:"fast, trusted, literal", A:["Rapid", "Mainstreet", "Summit"], B:["Care", "Urgent Care", "Co"]},
  "iv_therapy": {label:"IV therapy / drip bar", style:"clinical-cool, vital, modern", A:["The Drip Bar", "Revive", "Replenish", "Vital", "Summit"], B:["", "IV", "IV Therapy"]},
  "home_health": {label:"home health care", style:"warm, caring, literal", A:["Companion", "Comfort", "Summit", "Heritage"], B:["Home Care", "Home Health", "Co"]},
  "pharmacy": {label:"pharmacy", style:"warm, heritage, literal", A:["Mainstreet", "Heritage", "Wellspring", "Summit"], B:["Pharmacy", "Apothecary", "Co"]},
  "audiology": {label:"audiology / hearing", style:"clear, crisp, literal", A:["Crisp", "Summit", "Mainstreet", "Heritage"], B:["Hearing", "Audiology", "Co"]},
  "crossfit": {label:"crossfit / functional gym", style:"strong, gritty, kinetic", A:["Forge", "Summit", "Iron & Grit", "Apex", "Mainstreet", "Grit"], B:["Fitness", "CrossFit", "Co"]},
  "pilates": {label:"pilates studio", style:"calm, balanced, literal", A:["The Pilates", "Studio Pilates", "Align", "Core", "Summit", "Balance"], B:["Studio", "Pilates", "Co"]},
  "spin_studio": {label:"cycling / spin studio", style:"kinetic, rhythmic, literal", A:["The Spin", "Cadence", "Revolution", "Pulse", "Summit", "Mainstreet"], B:["House", "Cycling", "Spin"]},
  "boxing": {label:"boxing gym", style:"strong, bold, literal", A:["The Ring", "Ironside", "Title", "Knockout", "Summit", "Mainstreet"], B:["House", "Boxing", "Boxing Club"]},
  "climbing": {label:"climbing gym", style:"strong, vertical, literal", A:["Summit", "The Crag", "Ascent", "Vertical", "Apex", "Boulder"], B:["Climbing", "House", "Co"]},
  "escape_room": {label:"escape room", style:"fun, suspenseful, literal", A:["The Escape", "Lockdown", "Breakout", "The Vault", "Summit", "Mainstreet"], B:["House", "Escape Rooms", "Co"]},
  "axe_throwing": {label:"axe throwing", style:"bold, fun, literal", A:["The Axe", "Bullseye", "Summit", "Timber", "Lumber", "Mainstreet"], B:["House", "Axe", "Co"]},
  "nail_salon": {label:"nail salon", style:"chic, polished, literal", A:["The Nail Bar", "Bella", "Summit", "Lacquer", "Mainstreet", "Polished"], B:["", "Nails", "Nail Bar"]},
  "lash": {label:"lash & brow studio", style:"chic, pretty, literal", A:["The Lash", "Bella", "Summit", "Lash & Co", "Mainstreet", "Flutter"], B:["House", "Lash Studio", "Lash"]},
  "moving": {label:"moving company", style:"strong, fast, literal", A:["Summit", "Rapid", "Mainstreet", "Crown", "Heritage"], B:["Moving", "Movers", "Moving Co"]},
  "_retail": {label:"retail / shop", style:"friendly, brandable, shelf-ready", A:["Folk", "Tide", "Pine", "Marlowe", "Drift", "Hazel", "Slate", "Birch"], B:["& Co", "House", "Goods", "Supply", "Lane", "Market"]},
  "_food": {label:"food / hospitality", style:"warm, appetizing, inviting; broad appeal, never narrow or negative", A:["Harvest", "Olive", "Copper", "Sage", "Garden", "Golden", "Meadow"], B:["& Co", "Table", "House", "Kitchen", "Room", "Grill"]},
  "_professional": {label:"professional services", style:"credible, grounded, established", A:["North", "Sterling", "Vanguard", "Harbor", "Cedar", "Bridge"], B:["& Co", "Partners", "Group", "Advisory", "Collective"]},
  "_creative": {label:"creative / media", style:"expressive, modern, confident; substantial not twee", A:["Cobalt", "Northbound", "Lumen", "Vector", "Echo", "Form", "Atlas"], B:["Studio", "& Co", "Media", "Lab", "Works"]},
  "_wellness": {label:"health / wellness", style:"calm, restorative, caring", A:["Vita", "Bloom", "Cedar", "Still", "Bright", "Willow", "Sage"], B:["& Co", "Wellness", "Health", "Care", "Studio"]},
  "_service": {label:"local service", style:"dependable, capable, friendly local pro", A:["Prime", "Cedar", "Vanguard", "Beacon", "Apex", "Bright", "Summit"], B:["& Co", "Services", "Pro", "Works", "Group"]},
  _generic: {label:"business", style:"substantial, clear, trustworthy, real-company words that work for the broad masses anywhere; never cute, never narrow, never filler", A:["Summit", "Sterling", "Harborview", "Vantage", "Northgate"], B:["Group", "Partners", "Holdings", "& Co", "Collective", "Co"]},
};

const CLASSMAP = [["engineering", ["engineering firm","engineering agency","engineering studio","engineering group","engineering practice","engineering company","engineering consult","engineering services","civil engineering","structural engineering","mechanical engineering","electrical engineering","environmental engineering","geotechnical engineering","industrial engineering","chemical engineering","aerospace engineering"]], ["fine_dining", ["fine dining", "steakhouse", "upscale restaurant", "tasting menu", "fine-dining"]], ["restaurant", ["restaurant", "eatery", "diner", "bistro", "grill", "cantina", "taqueria", "trattoria"]], ["cafe", ["coffee", "cafe", "cafe", "espresso", "roaster", "coffeehouse"]], ["bakery", ["bakery", "baker", "patisserie", "pastry", "bread shop"]], ["bar", ["bar ", "pub ", "tavern", "lounge", "cocktail"]], ["brewery", ["brewery", "brewing", "craft beer", "taproom", "distillery"]], ["food_truck", ["food truck", "street food", "food cart"]], ["juice", ["juice", "smoothie", "acai", "juice bar"]], ["dessert", ["ice cream", "gelato", "dessert", "creamery", "sweets", "candy shop", "donut"]], ["catering", ["catering", "caterer"]], ["boutique", ["boutique", "clothing", "apparel", "fashion store", "dress shop", "clothes"]], ["shoes_athletic", ["running shoe", "athletic shoe", "sneaker", "sports shoe", "running store"]], ["shoes_designer", ["designer shoe", "luxury shoe", "women shoe", "heels", "dress shoe"]], ["shoes_outdoor", ["hiking boot", "hiking shoe", "outdoor footwear", "trail shoe", "work boot"]], ["shoes_general", ["shoe", "footwear"]], ["jewelry", ["jewelry", "jeweler", "jewellery", "gems", "diamond"]], ["bookstore", ["bookstore", "books shop", "bookshop", "book store"]], ["gift_shop", ["gift shop", "gifts", "gift store"]], ["home_goods", ["home goods", "home decor", "furniture", "decor", "homeware"]], ["florist", ["florist", "flower", "floral"]], ["grocery", ["grocery", "grocer", "provisions", "farmers market"]], ["thrift", ["thrift", "vintage", "consignment", "second-hand", "resale"]], ["ecommerce", ["online store", "ecommerce", "e-commerce", "dropship", "online shop"]], ["candles", ["candle", "soap shop", "home scent", "wax melt"]], ["cosmetics", ["cosmetics", "makeup brand", "beauty products", "skincare brand", "beauty brand"]], ["yoga", ["yoga", "pilates", "meditation"]], ["fitness", ["gym", "fitness", "crossfit", "workout", "personal trainer", "training studio"]], ["dental", ["dental", "dentist", "orthodont"]], ["medical", ["clinic", "medical", "doctor", "physician", "health center", "urgent care"]], ["therapy", ["therapy", "counseling", "counselor", "therapist", "mental health"]], ["chiro", ["chiropract", "chiro", "spine clinic"]], ["massage", ["massage", "day spa", "spa ", "wellness spa"]], ["nutrition", ["nutrition", "dietitian", "dietician", "wellness coach"]], ["optometry", ["optometry", "optometrist", "eye care", "vision center", "eyewear"]], ["salon", ["salon", "hair stylist", "hairdresser", "blowout", "hair studio"]], ["barber", ["barber", "barbershop", "fade", "mens grooming"]], ["nail", ["nail", "manicure", "pedicure"]], ["skincare", ["esthetic", "facial", "skincare clinic", "skin studio", "med spa", "medspa"]], ["tattoo", ["tattoo", "ink studio", "tattoo shop"]], ["plumbing", ["plumb", "plumber"]], ["electrical", ["electric", "electrician", "wiring"]], ["hvac", ["hvac", "heating", "cooling", "air conditioning", "furnace", "ac repair"]], ["roofing", ["roof", "roofing", "roofer"]], ["landscaping", ["landscap", "lawn", "yard service", "gardening service"]], ["cleaning", ["cleaning", "maid", "janitorial", "housekeeping"]], ["pest", ["pest", "exterminat", "pest control"]], ["painting", ["painting", "painter", "house painting"]], ["handyman", ["handyman", "home repair", "odd jobs"]], ["moving", ["moving company", "movers", "relocation"]], ["pool", ["pool service", "pool cleaning", "pool company"]], ["construction", ["construction", "contractor", "builder", "remodel", "renovation", "general contractor"]], ["interior_design", ["interior design", "interior designer", "home staging"]], ["law", ["law firm", "attorney", "legal", "lawyer", "law office"]], ["accounting", ["accounting", "accountant", "cpa", "tax service", "bookkeeping"]], ["consulting", ["consult", "consultant", "advisory firm", "strategy firm"]], ["marketing", ["marketing", "advertising", "ad agency", "branding agency", "digital agency", "seo agency"]], ["real_estate", ["real estate", "realtor", "realty", "property management", "homes for sale"]], ["insurance", ["insurance", "insurer", "coverage agency"]], ["financial", ["financial advisor", "wealth", "investment firm", "financial planning"]], ["banking", ["bank", "banking", "credit union", "savings bank"]], ["marine", ["boat", "yacht", "charter", "marina", "sailing", "watercraft", "marine"]], ["vape", ["vape", "vaping", "smoke shop", "tobacco", "cigar", "e-cig"]], ["staffing", ["staffing", "recruiting", "recruiter", "talent agency", "headhunt"]], ["architecture", ["architect", "architecture"]], ["saas", ["saas", "software", "platform", "app", "application", "startup", "tech company", "b2b"]], ["webdev", ["web design", "web development", "website agency", "web agency"]], ["it_services", ["it services", "managed it", "tech support", "it support", "msp"]], ["cybersecurity", ["cybersecurity", "security software", "infosec", "cyber"]], ["ai_startup", ["artificial intelligence", "machine learning", "ai startup", "ai app", "ai tool"]], ["gaming", ["game studio", "gaming", "video game", "indie game"]], ["fintech", ["fintech", "payments app", "banking app", "finance app"]], ["photography", ["photograph", "photo studio"]], ["videography", ["videograph", "video production", "film studio", "filmmaker", "cinematograph"]], ["graphic_design", ["graphic design", "design studio", "brand designer", "logo design"]], ["podcast", ["podcast"]], ["youtube", ["youtube", "video channel", "content creator"]], ["newsletter", ["newsletter", "substack", "email newsletter"]], ["music", ["band", "musician", "music artist", "recording"]], ["art_studio", ["art studio", "artist", "gallery", "ceramics", "pottery"]], ["author", ["author", "writer", "novelist", "copywriter"]], ["tutoring", ["tutor", "tutoring", "test prep"]], ["course", ["online course", "e-learning", "course creator", "online academy"]], ["school", ["school", "academy", "montessori"]], ["coaching", ["life coach", "business coach", "executive coach", "coaching"]], ["childcare", ["daycare", "childcare", "preschool", "nanny", "babysit"]], ["language", ["language learning", "language school", "esl", "spanish class"]], ["auto_repair", ["auto repair", "mechanic", "car repair", "auto shop"]], ["car_dealer", ["car dealership", "auto dealer", "used cars", "car lot"]], ["detailing", ["detailing", "car detail", "auto detail", "car wash"]], ["pet_grooming", ["pet groom", "dog groom", "grooming"]], ["pet_store", ["pet store", "pet shop", "pet supplies"]], ["vet", ["veterinary", "vet clinic", "animal hospital", "veterinarian"]], ["dog_training", ["dog training", "dog trainer", "obedience"]], ["event_planning", ["event planning", "event planner", "party planner"]], ["wedding", ["wedding", "bridal", "wedding planner"]], ["hotel", ["hotel", "motel", "bed and breakfast", "b&b", "inn ", "lodge", "airbnb", "vacation rental"]], ["travel", ["travel agency", "travel agent", "tour company", "trip planning"]], ["dj", ["dj ", "disc jockey", "entertainment company"]], ["personal_brand", ["personal brand", "influencer", "creator brand", "my own brand"]], ["nonprofit", ["nonprofit", "non-profit", "charity", "foundation", "ngo"]], ["church", ["church", "ministry", "congregation", "faith"]], ["subscription_box", ["subscription box", "monthly box", "sub box"]], ["handmade", ["handmade", "crafts", "etsy", "artisan", "maker shop"]], ["fashion_designer", ["fashion designer", "fashion label", "clothing line"]], ["casino", ["casino", "gaming resort", "gambling", "slots", "casino resort"]], ["venture", ["venture capital", "private equity", "hedge fund", "investment fund", "vc firm", "capital partners", "investment firm"]], ["crypto", ["crypto", "web3", "blockchain", "digital asset", "defi", "token exchange", "crypto exchange"]], ["luxury", ["luxury brand", "luxe brand", "high-end brand", "premium label", "luxury label"]], ["fashion_brand", ["fashion brand", "clothing brand", "apparel company", "streetwear brand", "fashion company"]], ["gas_station", ["gas station", "fuel stop", "filling station", "petrol station", "gas and convenience"]], ["towing", ["towing", "tow truck", "roadside assistance", "wrecker", "auto recovery", "tow company"]], ["senior_care", ["senior care", "assisted living", "elderly care", "retirement home", "memory care", "nursing home"]], ["agriculture", ["farm", "agriculture", "ranch", "agribusiness", "produce farm", "crop"]], ["manufacturing", ["manufacturing", "factory", "fabrication", "industrial", "production plant"]], ["logistics", ["logistics", "freight", "shipping company", "supply chain", "fulfillment", "trucking company"]], ["cruise", ["cruise", "cruise line", "cruise ship", "ocean liner", "maritime travel"]], ["winery", ["winery", "vineyard", "wine estate"]], ["butcher", ["butcher", "meat shop", "meat market"]], ["liquor_store", ["liquor store", "wine shop", "wine and spirits", "bottle shop"]], ["storage", ["self storage", "storage units", "storage facility"]], ["junk_removal", ["junk removal", "hauling", "junk hauling", "debris removal"]], ["tree_service", ["tree service", "arborist", "tree removal", "tree care"]], ["solar", ["solar", "solar panel", "solar installer", "solar energy"]], ["locksmith", ["locksmith", "lock and key", "lock smith"]], ["mortgage", ["mortgage", "lender", "home loan", "mortgage broker", "lending"]], ["title_escrow", ["title company", "escrow", "title and escrow", "title agency"]], ["printing", ["print shop", "printing", "printer", "print services"]], ["dry_cleaning", ["dry clean", "laundromat", "laundry", "dry cleaner"]], ["martial_arts", ["martial arts", "karate", "dojo", "jiu jitsu", "taekwondo"]], ["dance", ["dance studio", "dance school", "ballet studio"]], ["music_school", ["music school", "music lessons", "music academy", "music teacher"]], ["tutoring", ["tutoring", "test prep", "tutor", "learning center"]], ["acupuncture", ["acupuncture", "holistic", "wellness center", "reiki"]], ["physical_therapy", ["physical therapy", "physiotherapy", "rehab clinic"]], ["funeral", ["funeral home", "funeral", "mortuary", "memorial home"]], ["art_gallery", ["art gallery", "gallery", "fine art"]], ["magazine", ["magazine", "publication", "periodical"]], ["publisher", ["book publisher", "publishing house", "publisher"]], ["newsletter", ["newsletter", "email newsletter", "email media", "digest"]], ["news_site", ["news site", "digital media", "online news", "news outlet"]], ["blog", ["blog", "content site", "online magazine"]], ["podcast_network", ["podcast network", "audio network", "podcast studio"]], ["zine", ["literary journal", "zine", "literary magazine"]], ["mobile_app", ["mobile app", "ios app", "android app"]], ["productivity_app", ["productivity app", "task app", "to-do app", "focus app"]], ["dating_app", ["dating app", "dating site", "matchmaking app"]], ["marketplace", ["marketplace", "online marketplace", "platform"]], ["community_app", ["community app", "social app", "social network", "forum"]], ["elearning", ["e-learning", "online course", "course platform", "lms"]], ["creator_tool", ["creator tool", "creator platform", "newsletter tool"]], ["dev_tool", ["dev tool", "no-code", "developer tool", "sdk"]], ["analytics", ["analytics", "data platform", "business intelligence", "dashboard"]], ["crm", ["crm", "business software", "sales software", "saas platform"]], ["fintech_app", ["fintech", "payments app", "payment platform", "money app"]], ["fitness_app", ["fitness app", "health app", "workout app", "wellness app"]], ["ai_tool", ["ai tool", "ai platform", "automation", "ai assistant", "ai software"]], ["snack_brand", ["snack brand", "snack company", "cpg snack", "packaged food"]], ["beverage_brand", ["soda brand", "beverage brand", "drink brand", "sparkling"]], ["energy_drink", ["energy drink", "energy brand"]], ["tea_brand", ["tea brand", "tea company", "loose leaf"]], ["supplement_brand", ["supplement", "vitamin brand", "nutraceutical"]], ["protein_brand", ["protein brand", "protein powder", "fitness nutrition", "pre workout"]], ["pet_food", ["pet food", "dog food", "cat food", "pet nutrition"]], ["personal_care", ["personal care", "soap brand", "skincare brand", "grooming brand"]], ["baby_brand", ["baby brand", "kids products", "baby products"]], ["toy_brand", ["toy brand", "toy company", "toymaker"]], ["eyewear", ["eyewear", "sunglasses", "glasses brand", "optical brand"]], ["toy_store", ["toy store", "toy shop"]], ["comic_shop", ["comic shop", "comic store", "hobby shop", "game shop"]], ["record_store", ["record store", "vinyl shop", "record shop"]], ["craft_store", ["craft store", "art supply", "hobby supply", "craft shop"]], ["hardware_store", ["hardware store", "hardware shop"]], ["garden_center", ["garden center", "nursery", "plant shop", "garden shop"]], ["gourmet_shop", ["gourmet shop", "specialty food", "provisions", "deli market"]], ["chocolate_shop", ["chocolate shop", "candy store", "confectionery", "sweets shop"]], ["furniture_store", ["furniture store", "furniture shop", "home furnishings"]], ["coworking", ["coworking", "shared office", "workspace", "cowork"]], ["event_venue", ["event venue", "banquet hall", "wedding venue", "reception hall"]], ["food_hall", ["food hall", "market hall", "food market"]], ["meal_kit", ["meal kit", "meal prep", "meal delivery"]], ["distillery", ["distillery", "distilling", "distiller"]], ["private_chef", ["private chef", "personal chef", "private dining"]], ["mobile_bar", ["mobile bar", "bartending", "bartender service"]], ["car_rental", ["car rental", "auto rental", "rental car"]], ["limo", ["limo", "limousine", "chauffeur", "car service"]], ["driving_school", ["driving school", "driving lessons", "driver education"]], ["bike_shop", ["bike shop", "bicycle shop", "bike repair", "bicycle repair"]], ["motorcycle", ["motorcycle", "moto shop", "motorbike"]], ["tire_shop", ["tire shop", "tire store"]], ["auto_glass", ["auto glass", "windshield"]], ["window_tint", ["window tint", "tinting", "auto tint"]], ["fence", ["fence company", "fencing", "fence install"]], ["concrete", ["concrete", "masonry", " mason "]], ["welding", ["welding", "metal fab", "fabrication", "welder"]], ["paving", ["paving", "asphalt", "blacktop", "sealcoat"]], ["flooring", ["flooring", "floor install", "hardwood floor"]], ["cabinetry", ["cabinet", "cabinetry", "cabinet maker"]], ["countertop", ["countertop", "granite install", "quartz counter"]], ["garage_door", ["garage door"]], ["gutter", ["gutter"]], ["waterproofing", ["waterproofing", "foundation repair", "basement waterproof"]], ["chimney", ["chimney"]], ["septic", ["septic"]], ["power_washing", ["power washing", "pressure washing", "power wash", "pressure wash"]], ["snow_removal", ["snow removal", "snow plow", "snowplow"]], ["home_staging", ["home staging", "staging company", "home stager"]], ["property_mgmt", ["property management", "property manager", "rental management"]], ["surveying", ["surveying", "land survey", "land surveyor"]], ["notary", ["notary", "signing agent", "notary public"]], ["private_investigator", ["private investigator", "investigation", "detective agency", "investigator"]], ["translation", ["translation", "interpreter", "language services"]], ["recording_studio", ["recording studio", "music studio", "sound studio"]], ["sign_company", ["sign company", "signage", "sign shop"]], ["screen_printing", ["screen printing", "screen print", "embroidery", "custom apparel"]], ["equip_rental", ["equipment rental", "tool rental", "rental equipment"]], ["party_rental", ["party rental", "tent rental", "event rental"]], ["photo_booth", ["photo booth"]], ["surf_shop", ["surf shop", "surfboard", "surf store"]], ["dive_shop", ["dive shop", "scuba", "diving shop"]], ["gun_shop", ["gun shop", "firearms", "gun store"]], ["pool_service", ["pool service", "pool cleaning"]], ["pool_builder", ["pool builder", "pool construction"]], ["irrigation", ["irrigation", "sprinkler"]], ["deck_builder", ["deck builder", "deck install"]], ["hardscape", ["patio", "hardscape", "paver"]], ["handyman", ["handyman"]], ["appliance_repair", ["appliance repair"]], ["painter", ["painting", "painter", "house paint"]], ["demolition", ["demolition", "demo"]], ["excavation", ["excavation", "grading"]], ["duct_cleaning", ["air duct", "duct cleaning"]], ["mold", ["mold remediation", "mold removal"]], ["restoration", ["damage restoration", "water damage", "fire damage"]], ["mosquito", ["mosquito control", "mosquito"]], ["wildlife", ["wildlife removal", "animal removal"]], ["lawn_care", ["lawn care", "lawn fertiliz"]], ["holiday_lighting", ["holiday lighting", "christmas light"]], ["closet_org", ["closet", "garage organization"]], ["epoxy", ["epoxy", "garage floor coating"]], ["car_wrap", ["car wrap", "vinyl wrap"]], ["car_audio", ["car audio", "car stereo"]], ["upholstery", ["auto upholstery", "reupholstery"]], ["oil_change", ["oil change", "quick lube"]], ["brake_muffler", ["brake", "muffler"]], ["transmission", ["transmission"]], ["used_car", ["used car", "auto sales", "car dealership"]], ["mobile_mechanic", ["mobile mechanic"]], ["marine_repair", ["boat repair", "marine repair", "marine mechanic"]], ["rv_dealer", ["rv dealer", "rv park", "rv sales"]], ["pizzeria", ["pizzeria", "pizza"]], ["deli", ["sandwich shop", "deli"]], ["bagel", ["bagel"]], ["donut", ["donut", "doughnut"]], ["taqueria", ["taqueria", "taco"]], ["sushi", ["sushi"]], ["steakhouse", ["steakhouse", "steak house"]], ["seafood", ["seafood", "oyster"]], ["bbq", ["bbq", "barbecue"]], ["ramen", ["ramen", "noodle bar", "noodle shop"]], ["juice_bar", ["juice bar", "smoothie"]], ["acai", ["acai", "bowl shop"]], ["ice_cream", ["ice cream", "creamery", "gelato"]], ["wine_bar", ["wine bar"]], ["sports_bar", ["sports bar"]], ["cheese_shop", ["cheese shop", "cheesemonger"]], ["spice_shop", ["spice shop"]], ["shoe_store", ["shoe store"]], ["sneaker", ["sneaker", "streetwear"]], ["consignment", ["consignment", "thrift"]], ["pawn", ["pawn"]], ["antique", ["antique"]], ["cigar", ["cigar", "smoke shop", "humidor"]], ["vape", ["vape"]], ["pet_store2", ["pet store", "pet shop"]], ["aquarium", ["aquarium", "fish store"]], ["feed_store", ["feed store", "farm supply"]], ["watch_shop", ["watch shop", "watch repair"]], ["fabric", ["fabric shop", "sewing"]], ["yarn", ["yarn", "knitting"]], ["cookware", ["cookware", "kitchen shop", "kitchen store"]], ["board_game", ["board game", "game store"]], ["cobbler", ["cobbler", "shoe repair"]], ["chiropractor", ["chiropract"]], ["orthodontist", ["orthodont"]], ["dermatology", ["dermatolog"]], ["urgent_care", ["urgent care"]], ["iv_therapy", ["iv therapy", "drip bar", "iv drip"]], ["home_health", ["home health", "home care"]], ["pharmacy", ["pharmacy"]], ["audiology", ["audiolog", "hearing aid"]], ["crossfit", ["crossfit", "functional gym"]], ["pilates", ["pilates"]], ["spin_studio", ["spin studio", "cycling studio"]], ["boxing", ["boxing"]], ["climbing", ["climbing gym", "rock climbing"]], ["escape_room", ["escape room"]], ["axe_throwing", ["axe throwing"]], ["nail_salon", ["nail salon", "nail bar"]], ["lash", ["lash", "brow studio", "microblading"]], ["moving", ["moving company", "movers"]], ["_retail", ["shop", "store", "retail", "goods"]], ["_food", ["food", "kitchen", "grill", "bar "]], ["_professional", ["consult", "agency", "firm", "advisor", "services", "group"]], ["_creative", ["studio", "media", "design", "art", "creative"]], ["_wellness", ["health", "wellness", "care", "clinic", "therapy"]], ["_service", ["service", "repair", "install", "maintenance"]]];
function classify(seed){ var s=" "+normalize(seed)+" ";
  if(s.indexOf("veterinary")>=0||s.indexOf("veterinarian")>=0||s.indexOf("animal hospital")>=0||s.indexOf("vet clinic")>=0) return "vet";
  if(s.indexOf("detail")>=0) return "detailing";
  var dz=(s.indexOf("designer")>=0||s.indexOf("luxury")>=0||s.indexOf("women")>=0||s.indexOf("heel")>=0);
  var sz=(s.indexOf("shoe")>=0||s.indexOf("footwear")>=0);
  if(dz&&sz) return "shoes_designer";
  // --- specific-before-generic precedence (prevents broad categories from shadowing precise ones) ---
  // tech: route precise software types before generic saas / ai_startup
  if(s.indexOf("analytics")>=0||s.indexOf("business intelligence")>=0||s.indexOf("data platform")>=0||s.indexOf("dashboard")>=0) return "analytics";
  if(s.indexOf(" crm")>=0||s.indexOf("sales software")>=0||s.indexOf("customer relationship")>=0) return "crm";
  if(s.indexOf("fintech")>=0||s.indexOf("payments app")>=0||s.indexOf("payment platform")>=0||s.indexOf("money app")>=0) return "fintech_app";
  if(s.indexOf("e-learning")>=0||s.indexOf("elearning")>=0||s.indexOf("online course")>=0||s.indexOf("course platform")>=0||s.indexOf(" lms ")>=0) return "elearning";
  if(s.indexOf("dating")>=0) return "dating_app";
  if(s.indexOf("marketplace")>=0) return "marketplace";
  if(s.indexOf("productivity")>=0||s.indexOf("to-do")>=0||s.indexOf("task app")>=0||s.indexOf("task manager")>=0) return "productivity_app";
  if(s.indexOf("ai tool")>=0||s.indexOf("ai platform")>=0||s.indexOf("ai assistant")>=0||s.indexOf("ai software")>=0||s.indexOf("automation tool")>=0) return "ai_tool";
  if(s.indexOf("ai startup")>=0||s.indexOf("ai company")>=0) return "ai_startup";
  if(s.indexOf("mobile app")>=0||s.indexOf("ios app")>=0||s.indexOf("android app")>=0) return "mobile_app";
  // health: precise practices before generic medical clinic
  if(s.indexOf("physical therapy")>=0||s.indexOf("physiotherap")>=0) return "physical_therapy";
  if(s.indexOf("acupuncture")>=0) return "acupuncture";
  if(s.indexOf("eyewear")>=0||s.indexOf("sunglasses")>=0) return "eyewear";
  if(s.indexOf("optometr")>=0||s.indexOf("eye doctor")>=0||s.indexOf("eye care")>=0) return "optometry";
  if(s.indexOf("med spa")>=0||s.indexOf("medical spa")>=0||s.indexOf("medspa")>=0) return "medical";
  if(s.indexOf("therap")>=0&&s.indexOf("physical")<0&&s.indexOf("massage")<0&&s.indexOf("spa")<0&&s.indexOf("iv ")<0&&s.indexOf("drip")<0) return "therapy";
  // services & retail: precise before broad
  if(s.indexOf("grooming")>=0) return "pet_grooming";
  if(s.indexOf("music school")>=0||s.indexOf("music lesson")>=0||s.indexOf("music academy")>=0) return "music_school";
  if(s.indexOf("furniture")>=0) return "furniture_store";
  if(s.indexOf("gourmet")>=0||s.indexOf("specialty food")>=0||s.indexOf("provisions")>=0) return "gourmet_shop";
  if(s.indexOf("energy drink")>=0) return "energy_drink";
  if(s.indexOf("book publisher")>=0||s.indexOf("publishing house")>=0||s.indexOf("publisher")>=0) return "publisher";
  if(s.indexOf("distillery")>=0||s.indexOf("distilling")>=0) return "distillery";
  if(s.indexOf("driving school")>=0||s.indexOf("driving lesson")>=0||s.indexOf("driver education")>=0) return "driving_school";
  if(s.indexOf("concrete")>=0||s.indexOf("masonry")>=0) return "concrete";
  if(s.indexOf("waterproofing")>=0||s.indexOf("foundation repair")>=0) return "waterproofing";
  if(s.indexOf("home staging")>=0||s.indexOf("home stager")>=0||s.indexOf("staging company")>=0) return "home_staging";
  if(s.indexOf("screen print")>=0||s.indexOf("embroidery")>=0||s.indexOf("custom apparel")>=0) return "screen_printing";
  if(s.indexOf("property management")>=0||s.indexOf("property manager")>=0) return "property_mgmt";
  if(s.indexOf("recording studio")>=0||s.indexOf("music studio")>=0||s.indexOf("sound studio")>=0) return "recording_studio";
  if(s.indexOf("car service")>=0||s.indexOf("limousine")>=0||s.indexOf("chauffeur")>=0) return "limo";
  if(s.indexOf("investigat")>=0||s.indexOf("detective")>=0) return "private_investigator";
  if(s.indexOf("pool cleaning")>=0||s.indexOf("pool service")>=0) return "pool_service";
  if(s.indexOf("pool builder")>=0||s.indexOf("pool construction")>=0) return "pool_builder";
  if(s.indexOf("irrigation")>=0||s.indexOf("sprinkler")>=0) return "irrigation";
  if(s.indexOf("deck builder")>=0||s.indexOf("deck install")>=0) return "deck_builder";
  if(s.indexOf("hardscape")>=0||s.indexOf("patio")>=0) return "hardscape";
  if(s.indexOf("handyman")>=0) return "handyman";
  if(s.indexOf("appliance repair")>=0) return "appliance_repair";
  if(s.indexOf("painting")>=0||s.indexOf("painter")>=0||s.indexOf("house paint")>=0) return "painter";
  if(s.indexOf("demolition")>=0) return "demolition";
  if(s.indexOf("excavation")>=0||s.indexOf("grading")>=0) return "excavation";
  if(s.indexOf("air duct")>=0||s.indexOf("duct cleaning")>=0) return "duct_cleaning";
  if(s.indexOf("mold remediation")>=0||s.indexOf("mold removal")>=0) return "mold";
  if(s.indexOf("damage restoration")>=0||s.indexOf("water damage")>=0||s.indexOf("fire damage")>=0) return "restoration";
  if(s.indexOf("mosquito")>=0) return "mosquito";
  if(s.indexOf("wildlife removal")>=0||s.indexOf("animal removal")>=0) return "wildlife";
  if(s.indexOf("lawn care")>=0||s.indexOf("lawn fertiliz")>=0) return "lawn_care";
  if(s.indexOf("holiday lighting")>=0||s.indexOf("christmas light")>=0) return "holiday_lighting";
  if(s.indexOf("closet")>=0||s.indexOf("garage organization")>=0) return "closet_org";
  if(s.indexOf("epoxy")>=0||s.indexOf("garage floor coat")>=0) return "epoxy";
  if(s.indexOf("car wrap")>=0||s.indexOf("vinyl wrap")>=0) return "car_wrap";
  if(s.indexOf("car audio")>=0||s.indexOf("car stereo")>=0) return "car_audio";
  if(s.indexOf("upholstery")>=0) return "upholstery";
  if(s.indexOf("oil change")>=0||s.indexOf("quick lube")>=0) return "oil_change";
  if(s.indexOf("brake")>=0||s.indexOf("muffler")>=0) return "brake_muffler";
  if(s.indexOf("transmission")>=0) return "transmission";
  if(s.indexOf("used car")>=0||s.indexOf("auto sales")>=0||s.indexOf("car dealership")>=0) return "used_car";
  if(s.indexOf("mobile mechanic")>=0) return "mobile_mechanic";
  if(s.indexOf("boat repair")>=0||s.indexOf("marine repair")>=0||s.indexOf("marine mechanic")>=0) return "marine_repair";
  if(s.indexOf("rv dealer")>=0||s.indexOf("rv park")>=0||s.indexOf("rv sales")>=0) return "rv_dealer";
  if(s.indexOf("pizzeria")>=0||s.indexOf("pizza")>=0) return "pizzeria";
  if(s.indexOf("sandwich shop")>=0||s.indexOf("deli")>=0) return "deli";
  if(s.indexOf("bagel")>=0) return "bagel";
  if(s.indexOf("donut")>=0||s.indexOf("doughnut")>=0) return "donut";
  if(s.indexOf("taqueria")>=0||s.indexOf("taco")>=0) return "taqueria";
  if(s.indexOf("sushi")>=0) return "sushi";
  if(s.indexOf("steakhouse")>=0||s.indexOf("steak house")>=0) return "steakhouse";
  if(s.indexOf("seafood")>=0||s.indexOf("oyster bar")>=0) return "seafood";
  if(s.indexOf("bbq")>=0||s.indexOf("barbecue")>=0) return "bbq";
  if(s.indexOf("ramen")>=0||s.indexOf("noodle bar")>=0||s.indexOf("noodle shop")>=0) return "ramen";
  if(s.indexOf("juice bar")>=0||s.indexOf("smoothie")>=0) return "juice_bar";
  if(s.indexOf("acai")>=0||s.indexOf("bowl shop")>=0) return "acai";
  if(s.indexOf("ice cream")>=0||s.indexOf("creamery")>=0||s.indexOf("gelato")>=0) return "ice_cream";
  if(s.indexOf("wine bar")>=0) return "wine_bar";
  if(s.indexOf("sports bar")>=0) return "sports_bar";
  if(s.indexOf("cheese shop")>=0||s.indexOf("cheesemonger")>=0) return "cheese_shop";
  if(s.indexOf("spice shop")>=0) return "spice_shop";
  if(s.indexOf("shoe store")>=0) return "shoe_store";
  if(s.indexOf("sneaker")>=0||s.indexOf("streetwear")>=0) return "sneaker";
  if(s.indexOf("consignment")>=0||s.indexOf("thrift")>=0) return "consignment";
  if(s.indexOf("pawn")>=0) return "pawn";
  if(s.indexOf("antique")>=0) return "antique";
  if(s.indexOf("cigar")>=0||s.indexOf("smoke shop")>=0) return "cigar";
  if(s.indexOf("vape")>=0) return "vape";
  if(s.indexOf("pet store")>=0||s.indexOf("pet shop")>=0) return "pet_store2";
  if(s.indexOf("aquarium")>=0||s.indexOf("fish store")>=0) return "aquarium";
  if(s.indexOf("feed store")>=0||s.indexOf("farm supply")>=0) return "feed_store";
  if(s.indexOf("watch shop")>=0||s.indexOf("watch repair")>=0) return "watch_shop";
  if(s.indexOf("fabric shop")>=0||s.indexOf("sewing")>=0) return "fabric";
  if(s.indexOf("yarn")>=0||s.indexOf("knitting")>=0) return "yarn";
  if(s.indexOf("cookware")>=0||s.indexOf("kitchen shop")>=0||s.indexOf("kitchen store")>=0) return "cookware";
  if(s.indexOf("board game")>=0||s.indexOf("game store")>=0) return "board_game";
  if(s.indexOf("cobbler")>=0||s.indexOf("shoe repair")>=0) return "cobbler";
  if(s.indexOf("chiropract")>=0) return "chiropractor";
  if(s.indexOf("orthodont")>=0) return "orthodontist";
  if(s.indexOf("dermatolog")>=0) return "dermatology";
  if(s.indexOf("urgent care")>=0) return "urgent_care";
  if(s.indexOf("iv therapy")>=0||s.indexOf("drip bar")>=0||s.indexOf("iv drip")>=0) return "iv_therapy";
  if(s.indexOf("home health")>=0||s.indexOf("home care")>=0) return "home_health";
  if(s.indexOf("pharmacy")>=0) return "pharmacy";
  if(s.indexOf("audiolog")>=0||s.indexOf("hearing aid")>=0) return "audiology";
  if(s.indexOf("crossfit")>=0||s.indexOf("functional gym")>=0) return "crossfit";
  if(s.indexOf("pilates")>=0) return "pilates";
  if(s.indexOf("spin studio")>=0||s.indexOf("cycling studio")>=0) return "spin_studio";
  if(s.indexOf("boxing")>=0) return "boxing";
  if(s.indexOf("climbing gym")>=0||s.indexOf("rock climbing")>=0) return "climbing";
  if(s.indexOf("escape room")>=0) return "escape_room";
  if(s.indexOf("axe throwing")>=0) return "axe_throwing";
  if(s.indexOf("nail salon")>=0||s.indexOf("nail bar")>=0) return "nail_salon";
  if(s.indexOf("lash")>=0||s.indexOf("brow studio")>=0||s.indexOf("microblading")>=0) return "lash";
  if(s.indexOf("moving company")>=0||s.indexOf("movers")>=0) return "moving";
  for(var i=0;i<CLASSMAP.length;i++){ var key=CLASSMAP[i][0],kws=CLASSMAP[i][1]; for(var j=0;j<kws.length;j++){ if(s.indexOf(kws[j])>=0) return key; } } return "_generic"; }

function combine(a,b){ if(b.startsWith("+")) return a+b.slice(1); return a+" "+b; }
function fallbackNames(seed,n){ n=n||12; const cat=C[classify(seed)]||C._generic; const out=[],seen=new Set(); const A=cat.A,B=cat.B; let bi=0;
  for(let i=0;i<A.length&&out.length<n;i++){ for(let k=0;k<2&&out.length<n;k++){ const b=B[(bi++)%B.length]; const bWord=b.replace(/^[+&]\s?/,"").toLowerCase(); if(bWord===A[i].toLowerCase()) continue; const name=combine(A[i],b).replace(/\s+/g," ").trim(); const key=name.toLowerCase(); if(seen.has(key)) continue; var ww=name.toLowerCase().split(" "); var dup=false; for(var di=1;di<ww.length;di++){ if(ww[di]===ww[di-1]){dup=true;break;} } if(dup) continue; if(!screenName(name,seed).ok) continue; seen.add(key); out.push(name); } } return out.slice(0,n); }
function briefFor(seed){ const key=classify(seed); const cat=C[key]||C._generic; return {key, label:cat.label, style:cat.style}; }
function brandRules(){ return "BRAND RULES (the founder's standard, apply strictly): prefer SUBSTANTIAL, CLEAR, TRUSTWORTHY names that sound like a real established company and work for the broad masses anywhere. AVOID narrow or climate-locked words (e.g. hearth, frost, igloo), words with negative or off-putting associations (e.g. smoke, ash, grime), cutesy nature wordplay (e.g. '& Willow', '& Oak', 'Wander'), small-boutique suffixes used as a crutch (Studio/Lounge/Bar), and generic interchangeable filler. For food, prefer appetizing, positive words. Keep range; never force a single style. "; }
var EXEMPLARS = {
  cafe:{love:["Sterling Roasters", "Premier Roasters", "Roasthouse", "Heritage Coffee", "Reserve Coffee"],avoid:["Meridian Coffee","Harborview Coffee","Crema Bar","Crown Coffee Co","Estate Coffee","Goldleaf Coffee"]},
  fine_dining:{love:["Copper Table", "The Sterling Room", "Crown Room", "Sterling Table"],avoid:["Salt House","Grove & Grain","Smoke Kitchen","Olive & Crown","The Vault","Onyx","Slate & Stone"]},
  restaurant:{love:["Harvest Kitchen", "Copper Spoon", "Garden Table", "The Copper Kitchen", "Harvest House"],avoid:["Foxglove","The Bluebird","Meridian Grill","Bramble & Co","Sage House","Copperline Kitchen"]},
  food_truck:{love:["Zesty Kitchen", "Gourmet Wheels", "Fresh Fire Kitchen", "Hearty Eats"],avoid:["Smoke & Spice","Golden Skillet","Spice Truck","Crave Kitchen","Sizzle Kitchen","Bold Bites","Smokestack Kitchen"]},
  travel:{love:["Beacon Travel"],avoid:["Wander Travel","Meridian Voyages","Horizon Travel","Nomad Trips"]},
  crypto:{love:["Vault Digital", "Summit Digital"],avoid:["Bedrock Markets","MoonByte","Axiom Protocol","Meridian Digital","Hodlify","Cipher Labs"]},
  senior_care:{love:["Harborview Senior Living", "Cedarcrest Senior Living"],avoid:["Golden Years","Gracewood Residence","Wellspring Care","Sunny Meadows"]},
  towing:{love:["Ironclad Recovery", "Summit Towing", "Rapid Recovery", "Clearway Recovery", "Tow Pro"],avoid:["Anchor Towing","Cardinal Towing"]},
  bakery:{love:["Golden Crust", "The Bread House", "Harvest Bakery", "Golden Crumb"],avoid:["Wildflour","Daisy & Crumb","Sugarhouse","Copper Oven","Daily Bread Co","The Flour House"]},
  bar:{love:["Brass Tap", "Copper Tavern"],avoid:["Anchor & Oak","Crow & Barrel","Velvet Lounge"]},
  salon:{love:["The Blowout Bar"],avoid:["Polished","Gloss & Co","Halo Salon","Mane Lounge","Gild Salon","Salon Sterling","Crown & Co Salon","Luxe Salon Co"]},
  law:{love:["Harborview Law", "Vanguard Legal", "Sterling Law", "Whitfield & Stone"],avoid:["Meridian Law","Bramble Law"]},
  real_estate:{love:["Harborview Homes", "Sterling Properties", "Pinnacle Realty"],avoid:["Anchor Realty","Bluebird Homes"]},
  dental:{love:["Sterling Dental", "Bright Smile Dental", "Summit Dental"],avoid:["Clearview Dental","Pearl Dental","Gentle Care Dental"]},
  fitness:{love:["Pulse Fitness"],avoid:["Forge Gym","Grit & Iron"]},
  plumbing:{love:["Rapid Plumbing", "Summit Plumbing"],avoid:["TruFlow Plumbing","Anchor Plumbing","Ironclad Plumbing"]},
  landscaping:{love:["Evergreen Landscapes", "Stoneleaf Landscaping"],avoid:["Cornerstone Outdoors","Wildroot","Meadowland Lawns"]},
  accounting:{love:["Sterling CPA", "Vanguard CPA"],avoid:["Tallyhouse","Meridian Accounting"]},
  boutique:{love:["The Boutique House"],avoid:["Marlowe","Mode Boutique","Atlas Apparel","Velvet & Vine","Wildflower Boutique","The Edit","The Closet"]},
  jewelry:{love:["Crown Jewelers", "Heritage Jewelers"],avoid:["Marquise Jewelers","Gilded","Opal & Co","Lumen Fine Jewelry"]},
  photography:{love:["Northlight Studio"],avoid:["Aperture","Stillframe","Goldhour","Frame & Light","Lumen Photography"]},
  marketing:{love:["Summit Media Group", "Vanguard Media Group", "Crown Media", "Pinnacle Marketing"],avoid:["Northbound","Cobalt Agency","Catalyst","Spark & Co","Meridian Media","Clearway Marketing"]},
  construction:{love:["Summit Construction", "Vanguard Construction"],avoid:["Forge & Stone"]},
  auto_repair:{love:["Summit Motors", "Clearway Auto"],avoid:["Torque Auto","Cardinal Auto","Ironclad Auto"]},
  pet_grooming:{love:["The Groom Room", "Wag & Co", "Bright Paws", "Posh Paws"],avoid:["Cedar & Paws"]},
  cleaning:{love:["Summit Cleaning", "Spotless Pro", "Bright & Tidy"],avoid:["Crisp Clean Co"]},
  florist:{love:["Garden Room Florals", "The Flower House", "Bloom & Co"],avoid:["Fern & Petal","Marigold","Petal & Stem","Stonefield Florals"]},
  roofing:{love:["Summit Roofing", "Sterling Roofing", "Crown Roofing"],avoid:["Anchor Roofing","Apex Exteriors","Ironclad Roofing"]},
  brewery:{love:["Crown Brewing"],avoid:["Copper Kettle Brewing","Crow & Barrel","Anvil Brewing","Iron Horse Brewing","Stonewall Brewing","Foundry Brewing"]},
  juice:{love:["Harvest Juice", "Greenhouse Juice"],avoid:["Golden Press","Pulp & Co","Fresh Co","Verde","Sunrise Juice Co","Vital Press"]},
  dessert:{love:["Sugarhill Creamery"],avoid:["Copper Scoop","Frostline","Sprinkle & Co","Sweet Cream Co","Golden Scoop"]},
  catering:{love:["Garden Table Events"],avoid:["Saffron & Co","Cornerstone Catering","Olive Branch Catering","Harvest Catering"]},
  bookstore:{love:[],avoid:["The Reading Room","Chapter House","Fable & Co","Inkwell Books","Hardcover Books"]},
  gift_shop:{love:[],avoid:["Copper & Co","Wren & Co","Keepsake Co","Trinket & Co","Garland Gifts","The Present Co","The Gift Co"]},
  grocery:{love:["Garden Market"],avoid:["Cornerstone Grocery","Crate & Co","Summit Provisions","Daily Market"]},
  cosmetics:{love:["Radiance", "Lumiere"],avoid:["Lumen Beauty","Glow & Co","Halo Beauty","Dewy Skin Co","Veil","Aura","Crown Cosmetics","Sterling Beauty Co"]},
  yoga:{love:["Sanctuary Yoga"],avoid:["Lotus & Light","Root Yoga","Stillpoint Yoga"]},
  medical:{love:["Summit Health", "Pinnacle Medical", "Wellbridge"],avoid:["Vita Care","Cedar Medical","Brightcare","Mainstreet Medical"]},
  therapy:{love:["Brightpath", "Clearpath Counseling", "Wellspring Counseling", "Sound Mind"],avoid:["Stillwater Counseling","Haven Therapy","Cedar Counseling","New Leaf Counseling"]},
  massage:{love:["Serenity Day Spa"],avoid:["Cedar & Sage Spa","Harborview Spa","Stillwater Spa"]},
  optometry:{love:["Bright Vision"],avoid:["Clearview Eye Care","Crisp Vision","Iris & Co"]},
  barber:{love:["Classic Cuts"],avoid:["Ironside Barber","Copper Barber","Crow & Blade","Hatchet & Co"]},
  vet:{love:["Companion Vet", "Mainstreet Animal Hospital", "Summit Animal Hospital", "Crown Animal Hospital"],avoid:["Harborview Vet","Petwell","Cedarcrest Vet"]},
  electrical:{love:["Rapid Electric"],avoid:["Clearway Electric","Bright Spark","Current Electric"]},
  engineering:{love:["Meridian Engineering","Datum & Associates","Fulcrum Group","Vector Works","Caliber Engineering"],avoid:["Jewel Forge","Karat Stone","Sapphire Craft","Gemstone Works","Diamond Vault","Goldsmith Associates","Platinum Forge","Quartz Core","Cobalt Forge","Zenith Forge","Aurum Vault","Signet Craft","Lustre Works","Bezel Group","Filigree Lane","Opal Works","Gilded Path","Crown Jewel","Onyx Logic","Nimbus Stack","Vela Forge","Slate Grid","Lattice Loop"]},
  hvac:{love:["Rapid Heating & Air", "Comfort Pro"],avoid:[]},
  pest:{love:["Rapid Pest Control"],avoid:["Sentinel Pest"]},
  event_planning:{love:["Marquee Events"],avoid:["Harborview Events","Grand & Co","Celebration Co","Garland Events"]},
  hotel:{love:["The Grand", "Sterling Hotel", "The Summit Hotel", "Crown Hotel", "Evergreen Inn"],avoid:["The Lantern"]},
  shoes_athletic:{love:["Stride"],avoid:["Tempo Sports","Velocity","Kinetic","Pivot Athletic","Sprint Co","Apex Athletic","Crown Athletic"]},
  shoes_designer:{love:["Bella Sole"],avoid:["Soler","Noir Sole","Atelier Sole","Sterling Sole","Mode Footwear","Vianne","Maison Sole"]},
  shoes_outdoor:{love:[],avoid:["Trailhead","Trek Co","Switchback","Mesa","Bound","Terra Trail","Ridgeline"]},
  shoes_general:{love:["Stride", "The Shoe House"],avoid:["The Sole Co","Sterling Shoes","Walkwell","Stepwell","Mainstreet Shoes","Sole & Co"]},
  thrift:{love:["Revival", "Heritage Finds"],avoid:["Relic & Co","Sterling Vintage","The Attic","Second Story"]},
  ecommerce:{love:[],avoid:["Summit Goods","Cornerstone Goods","The Supply Co","Clearway Goods","Sterling Goods","Daily Supply Co","The Goods Co"]},
  subscription_box:{love:["The Curated Box"],avoid:["The Discovery Box","Boxwell","Monthly Goods","Keepsake Box","Summit Box","Bright Box","Crate & Co","The Monthly Co"]},
  handmade:{love:[],avoid:["Goodmade","Crafted & Co","Mainstreet Makers","Heritage Made","Sterling Made","Handcraft Co","The Maker House"]},
  fashion_designer:{love:[],avoid:["The House of","Noir & Co","Heritage Label","Mode House","Vela","Crown Atelier","Atelier","Maison Noir"]},
  fashion_brand:{love:[],avoid:["Crown Apparel","Mode","Form","Atlas Apparel","Vela","Clearway Apparel","Northwell"]},
  staffing:{love:["Talent Bridge", "Summit Staffing", "Vanguard Talent"],avoid:["Sterling Search"]},
  architecture:{love:["Vanguard Architects", "Axis Architecture", "Studio North", "Stonebridge Architects"],avoid:["Form Architecture"]},
  marine:{love:["Coastal Charters", "Harborview Charters", "Summit Marine", "Bluewater Charters", "Crown Yachts", "Tidewater Charters"],avoid:["Mariner & Co"]},
  vape:{love:["Vapor House"],avoid:["Nimbus","Haze & Co","Drift Vapor","Mist Co","Vapor Works","Cloud Nine","Cloud Co"]},
  gaming:{love:[],avoid:["Vortex Games","Bitforge","Arcade Co","Pixelworks","Rogue Studios","Pixel Forge"]},
  podcast:{love:["Open Mic", "The Roundtable"],avoid:["Front Porch","Static","Soundcheck","Wavelength","Longform"]},
  language:{love:[],avoid:["Fluent Co","Clearway Languages","Sol Languages","Verba","Babel","Lingua"]},
  personal_brand:{love:["Headline", "The Studio"],avoid:["Muse","Folk","Wildhart","Maker"]},
  casino:{love:["Royale", "Empire"],avoid:["Monarch","Gilded","Aurelia","Velvet","Summit Gaming","Regent"]},
  venture:{love:["Sterling Ventures", "Vanguard Partners", "Summit Capital", "Harborview Capital", "Crestview Partners", "Stonebridge Capital"],avoid:[]},
  gas_station:{love:["Express Fuel"],avoid:["Mainstreet Fuel","Fuelhouse","Beacon Fuel","Crossroads","Mileway","Pinnacle Fuel"]},
  agriculture:{love:["Harvest Farms"],avoid:["Fieldstone","Homestead","Bountiful"]},
  manufacturing:{love:["Vanguard Manufacturing", "Summit Industries", "Precision", "Titan Industries"],avoid:["Ironworks","Bedrock","Forge Works"]},
  logistics:{love:["Rapid Freight", "Swift Logistics", "Vanguard Logistics", "Summit Freight", "Express Freight"],avoid:["Clearway Logistics","Cardinal Freight"]},
  cruise:{love:["Voyager", "Oceanic", "Horizon Cruises", "Summit Cruises", "Crown Cruises", "Regent Cruises"],avoid:["Marlin","Coastline","Celeste","Azure"]},
  winery:{love:["Crown Cellars", "Copper Ridge Winery", "Sterling Cellars", "Hillcrest Winery"],avoid:["Evergreen Vineyards","Wildflower Vineyards","Cornerstone Cellars"]},
  butcher:{love:["The Butcher House"],avoid:["Copper & Cleaver","Golden Cleaver","Prime Cut Co","Stockyard"]},
  liquor_store:{love:["Crown Wine & Spirits", "Harborview Wine & Spirits"],avoid:["Vintage Cellars","Bottle & Co"]},
  storage:{love:["Summit Storage", "Clearway Storage"],avoid:["Secure Storage Co","Rapid Storage","Stronghold Storage"]},
  junk_removal:{love:["Rapid Junk Removal", "Junk Squad", "Haul Pro"],avoid:["Clearout Co","Swift Hauling","Cleanslate Hauling"]},
  tree_service:{love:["Stoneridge Tree Service", "Summit Tree Service"],avoid:["Timberline Tree Co","Ironwood Tree Service","Crown Tree Co","Treewise"]},
  solar:{love:["Summit Solar", "Clearway Solar", "Solaris"],avoid:["Bright Solar Co","Sunpeak Solar"]},
  locksmith:{love:["Rapid Locksmith", "Lock Pro", "Summit Lock & Key", "Clearway Locksmith", "Sentinel Locksmith"],avoid:["Stronghold Lock & Key","Keywise"]},
  mortgage:{love:["Sterling Mortgage", "Summit Lending", "Vanguard Mortgage", "Crown Mortgage"],avoid:["Harborview Mortgage","Clearview Mortgage"]},
  title_escrow:{love:["Vanguard Title", "Sterling Title", "Summit Title & Escrow"],avoid:["Harborview Title","Clearview Title","Heritage Title"]},
  printing:{love:["Rapid Print", "Print Pro"],avoid:["Clearway Print Co","Mainstreet Print Co","Crisp Print Co","Inkwell Press","Sterling Print Co"]},
  dry_cleaning:{love:["Spotless Cleaners", "Pristine Cleaners"],avoid:["Clearway Cleaners","Bright Cleaners"]},
  martial_arts:{love:["Dragon Martial Arts"],avoid:["Ironclad Martial Arts","Vanguard Martial Arts","Titan Martial Arts","Apex Martial Arts","Warrior Way","Crown Martial Arts"]},
  dance:{love:["The Dance House", "The Studio"],avoid:["Grace Dance Studio","Crown Dance","Pirouette","Evergreen Dance"]},
  music_school:{love:["The Music House"],avoid:["Harborview Music"]},
  tutoring:{love:["Bright Scholars", "Summit Tutoring"],avoid:["Pinnacle Prep","Clearview Tutoring","Mainstreet Tutoring"]},
  acupuncture:{love:["Sanctuary Wellness"],avoid:["Bright Wellness","Stillwater Wellness","Balance Wellness"]},
  physical_therapy:{love:["Summit Physical Therapy"],avoid:["Motion Physical Therapy","Bright Path PT"]},
  funeral:{love:["Harborview Funeral Home", "Evergreen Memorial", "Gracewood Funeral Home"],avoid:["Heritage Funeral Home","Summit Funeral Home","Restful Pines","Crown Memorial"]},
  art_gallery:{love:["The Art House", "Crown Gallery", "Sterling Gallery"],avoid:["Cornerstone Gallery","Harborview Gallery","Gilded Gallery"]},
  magazine:{love:["Beacon Magazine"],avoid:["The Quarterly","Cornerstone Media","Harbor Press"]},
  publisher:{love:["The Press Room"],avoid:["Heritage Press"]},
  newsletter:{love:["The Wire", "The Roundup", "Headline"],avoid:["Cornerstone Newsletter","The Memo"]},
  news_site:{love:["Headline", "The Daily", "Beacon News"],avoid:["The Dispatch","Cornerstone News","Harbor Media"]},
  blog:{love:["Headline"],avoid:["Mainstreet Media","Folk","The Desk"]},
  podcast_network:{love:["Open Mic", "The Roundtable"],avoid:["Harbor Audio","Cornerstone Audio"]},
  zine:{love:["The Quarterly", "The Review"],avoid:["Margin","Folio"]},
  mobile_app:{love:[],avoid:["Clearview","Nyla","Vantage","Bright"]},
  productivity_app:{love:[],avoid:["Loop","Brightwork","Cadence"]},
  dating_app:{love:["Spark", "Match House"],avoid:["Pair","Kindred","Crush","Loom","Heyday"]},
  marketplace:{love:[],avoid:["Trove","Clearway","Marketplace Co","Harbor Market","Tradehouse"]},
  community_app:{love:[],avoid:["Kindred","Hearth","Folk"]},
  elearning:{love:["Bright Scholars", "Summit Academy"],avoid:["Clearpath Learning","Studyhall","Learnwell"]},
  creator_tool:{love:[],avoid:["Brightwork","Creator Co","Loom"]},
  dev_tool:{love:[],avoid:["Northstack","Stack Co","Buildwell","Clearstack","Brightstack"]},
  analytics:{love:["Vantage", "Summit Analytics", "Beacon Data", "Brightdata", "Lighthouse", "Northstar"],avoid:["Insight Co"]},
  crm:{love:["Summit Software"],avoid:["Pipeline Co","Hub Co"]},
  fintech_app:{love:["Summit Pay", "Vault", "Clearway Pay", "Northpay"],avoid:["Brightledger","Ledger Co"]},
  fitness_app:{love:["Pulse", "Peak"],avoid:["Vital","Bright","Clearview","Cadence"]},
  ai_tool:{love:["Summit AI", "Vantage AI", "Northstar AI", "Lumen AI"],avoid:["Brightmind"]},
  snack_brand:{love:[],avoid:["Goodbatch","Field Day","Mainstreet Snacks"]},
  beverage_brand:{love:[],avoid:["Harvest","Fizz Co","Golden","Crisp","Bright"]},
  energy_drink:{love:["Surge", "Volt", "Ignite"],avoid:["Apex","Bolt","Charge","Summit"]},
  tea_brand:{love:["Sterling Tea Co", "Harvest Tea", "Golden Leaf", "The Tea House", "Heritage Tea"],avoid:["Garden Tea Co","Steep Co"]},
  supplement_brand:{love:[],avoid:["Summit","Bright","Thrive"]},
  protein_brand:{love:["Peak Fuel"],avoid:["Pulse"]},
  pet_food:{love:["Companion", "Wholesome Paws", "Bright Paws", "Field & Farm"],avoid:["Goodbowl","Wag"]},
  personal_care:{love:["Radiance"],avoid:["Pure Co","Bare","Bright","Heritage","Verdant","Bloom"]},
  baby_brand:{love:[],avoid:["Little Sprout","Wee Co","Cubby","Bloom"]},
  toy_brand:{love:[],avoid:["Cubby","Bright","Sprout","Sunny"]},
  eyewear:{love:["Vista", "Sterling Optics"],avoid:["Horizon","Iris"]},
  toy_store:{love:["The Toy House"],avoid:["Wonder Co","Cubby's","Sprout Toys"]},
  comic_shop:{love:["The Comic House", "Vault Comics", "Mainstreet Comics", "Heroes & Co", "The Hobby House"],avoid:["The Game House"]},
  record_store:{love:["The Record House", "Mainstreet Records", "Vinyl & Co", "Spin", "Heritage Records", "The Vinyl House"],avoid:["Soundwell","Crown Records"]},
  craft_store:{love:["The Craft House", "The Art House", "Mainstreet Crafts"],avoid:["Bright Supply","Maker Supply","Folk"]},
  hardware_store:{love:["The Hardware House", "Mainstreet Hardware", "Summit Hardware", "Sterling Hardware"],avoid:["Bright Hardware","Stonewall Hardware"]},
  garden_center:{love:["The Garden House", "Greenfield Nursery"],avoid:["Harvest Garden Co"]},
  gourmet_shop:{love:["The Pantry", "Harvest Provisions", "The Gourmet House", "Garden Market", "Heritage Provisions", "Mainstreet Provisions"],avoid:["Golden Pantry"]},
  chocolate_shop:{love:["The Chocolate House", "Velvet Chocolate", "Harvest Confections", "Golden Cocoa", "Sweet Co", "Cocoa & Co", "Crown Confections"],avoid:["Bright Sweets"]},
  furniture_store:{love:["The Home House", "Sterling Furniture", "Mainstreet Furniture", "Heritage Furniture", "Summit Home"],avoid:["Harvest Home Co"]},
  coworking:{love:["The Workspace", "The Commons", "Summit Workspace"],avoid:["Hearth","Mainstreet Cowork","Workwell"]},
  event_venue:{love:["The Grand", "Sterling Hall"],avoid:["Harborview Hall","The Manor","Evergreen Venue","The Estate"]},
  food_hall:{love:["The Market Hall"],avoid:["Garden Hall","The Commons","Summit Hall"]},
  meal_kit:{love:["Harvest Kitchen", "Fresh Co", "Wholesome Co", "Bright Plate"],avoid:["Mainstreet Meals","Goodplate"]},
  distillery:{love:[],avoid:[]},
  private_chef:{love:["The Private Table", "Harvest Private Chef", "The Chef's Table"],avoid:[]},
  mobile_bar:{love:["The Traveling Bar", "Top Shelf"],avoid:["Copper & Co","Sterling Bar Co","Summit Bartending"]},
  car_rental:{love:[],avoid:["Mainstreet Rentals"]},
  limo:{love:["Crown Limousine", "Sterling Car Service", "Premier Chauffeur", "Black Tie Limo", "Summit Limo"],avoid:["Harborview Car Service"]},
  driving_school:{love:["Pro Drive Academy", "Summit Driving School", "Safe Roads Driving School", "Mainstreet Driving School"],avoid:[]},
  bike_shop:{love:["The Bike House", "Pedal Pro", "Mainstreet Bikes", "Summit Cycles"],avoid:[]},
  motorcycle:{love:["Ironside Motorcycles"],avoid:["Summit Moto","Mainstreet Moto","Cornerstone Cycles"]},
  tire_shop:{love:["Rapid Tire", "Tire Pro"],avoid:["Clearway Tire"]},
  auto_glass:{love:["Rapid Auto Glass"],avoid:["Clear Pro"]},
  window_tint:{love:["Rapid Tint", "Shade Pro"],avoid:["Tint Co"]},
  fence:{love:["Ironclad Fence", "Sentinel Fence"],avoid:[]},
  concrete:{love:[],avoid:[]},
  welding:{love:["Ironworks Welding", "Vanguard Fabrication", "Steelhouse"],avoid:[]},
  paving:{love:["Blacktop Pro", "Rapid Paving"],avoid:[]},
  flooring:{love:["The Floor House"],avoid:["Clearway Floors"]},
  cabinetry:{love:["The Cabinet House", "Heritage Cabinetry"],avoid:["Sterling Cabinets"]},
  countertop:{love:["Granite Pro"],avoid:[]},
  garage_door:{love:["Rapid Garage Door", "Overhead Pro"],avoid:["Clearway Garage Doors","Cornerstone Garage Doors"]},
  gutter:{love:["Rapid Gutter", "Gutter Pro"],avoid:["Clearway Gutters","Cornerstone Gutters"]},
  waterproofing:{love:["Ironclad Waterproofing"],avoid:["Bedrock Foundation","Clearway Waterproofing"]},
  chimney:{love:["Rapid Chimney"],avoid:[]},
  septic:{love:["Rapid Septic", "Septic Pro"],avoid:["Clearway Septic"]},
  power_washing:{love:["Rapid Power Wash", "Pressure Pro", "Spotless Power Washing", "Pristine Power Washing"],avoid:[]},
  snow_removal:{love:["Snow Pro", "Rapid Snow Removal"],avoid:["Clearway Snow","Cornerstone Snow Removal","Mainstreet Snow Removal"]},
  home_staging:{love:["The Staged House", "Polished Staging", "Summit Home Staging"],avoid:["Harborview Staging"]},
  property_mgmt:{love:[],avoid:[]},
  surveying:{love:["Precision Surveying"],avoid:[]},
  notary:{love:["Mobile Notary Pro", "Rapid Notary"],avoid:["Mainstreet Notary","Summit Notary","Cornerstone Notary","Clearway Notary"]},
  private_investigator:{love:["Sentinel Investigations", "Summit Investigations", "Vanguard Investigations"],avoid:["Stonewall Investigations"]},
  translation:{love:["Global Bridge", "Lingua"],avoid:["Mainstreet Translation"]},
  recording_studio:{love:["The Sound House", "Northlight Studios"],avoid:["Soundwell"]},
  sign_company:{love:["Sign Pro"],avoid:["Clearway Signs","Bright Sign Co"]},
  screen_printing:{love:["Print Pro"],avoid:["Threadworks","Inkhouse","Mainstreet Printing","Cornerstone Apparel","Summit Print Co"]},
  equip_rental:{love:["Pro Rentals", "Rapid Rentals"],avoid:[]},
  party_rental:{love:["The Party House"],avoid:[]},
  photo_booth:{love:["The Photo House"],avoid:["Mainstreet Photo Booth"]},
  surf_shop:{love:["The Surf House", "Summit Surf", "Tidewater Surf", "Wave & Co"],avoid:["Mainstreet Surf"]},
  dive_shop:{love:["The Dive House", "Coastline Scuba"],avoid:["Summit Dive","Tidewater Dive"]},
  gun_shop:{love:["Sentinel Firearms", "Mainstreet Firearms", "Vanguard Firearms"],avoid:["Summit Firearms","Frontier Firearms"]},
  pool_service:{love:["Crystal Clear Pools", "Pool Pro", "Rapid Pool Service"],avoid:["Bluebird Pools"]},
  pool_builder:{love:["Oasis Pools"],avoid:["Bluewater Pools","Azure Pools"]},
  irrigation:{love:["Rapid Irrigation", "Sprinkler Pro"],avoid:["Clearwater Irrigation"]},
  deck_builder:{love:["Deck Pro", "The Deck House"],avoid:["Cedar & Co"]},
  hardscape:{love:["The Patio House", "Summit Hardscapes", "Stoneworks"],avoid:["Bramble Hardscapes"]},
  handyman:{love:["Handyman Pro", "Rapid Handyman"],avoid:[]},
  appliance_repair:{love:["Appliance Pro", "Rapid Appliance Repair", "Fix Pro"],avoid:["Clearway Appliance"]},
  painter:{love:["Pro Painters"],avoid:["Crisp Painting"]},
  demolition:{love:["Wrecking Pro", "Rapid Demolition"],avoid:["Bedrock Demolition","Ironclad Demolition"]},
  excavation:{love:["Earthworks"],avoid:["Ironclad Excavation","Cornerstone Excavation"]},
  duct_cleaning:{love:["Duct Pro", "Rapid Duct Cleaning", "Fresh Air Pro", "Pristine Duct"],avoid:[]},
  mold:{love:["Rapid Mold Removal", "Pure Air Pro", "Summit Mold Remediation"],avoid:[]},
  restoration:{love:["Restore Pro", "Rapid Restoration"],avoid:[]},
  mosquito:{love:["Mosquito Pro", "Rapid Mosquito Control", "Skeeter Pro"],avoid:[]},
  wildlife:{love:["Critter Pro", "Rapid Wildlife Removal", "Wildlife Pro"],avoid:[]},
  lawn_care:{love:["Lawn Pro"],avoid:["Cornerstone Lawn Care"]},
  holiday_lighting:{love:["Holiday Pro"],avoid:[]},
  closet_org:{love:["The Closet House"],avoid:["Cornerstone Closets","Clearway Closets"]},
  epoxy:{love:["Epoxy Pro"],avoid:["Granite Coatings"]},
  car_wrap:{love:["Wrap Pro"],avoid:["Apex Wraps"]},
  car_audio:{love:["Sound Pro"],avoid:["Apex Car Audio","Bass Co","Clearway Audio"]},
  upholstery:{love:[],avoid:["Leather & Co"]},
  oil_change:{love:["Quick Lube Pro", "Pit Stop Pro"],avoid:[]},
  brake_muffler:{love:["Rapid Brake & Muffler", "Brake Pro", "Pro Muffler"],avoid:[]},
  transmission:{love:["Transmission Pro", "Rapid Transmission"],avoid:["Clearway Transmission"]},
  used_car:{love:["Heritage Motors", "Crown Auto Sales", "Mainstreet Motors"],avoid:["Clearway Auto Sales"]},
  mobile_mechanic:{love:["Wrench Pro", "Rapid Mobile Mechanic", "Mobile Mechanic Pro", "Summit Mobile Auto"],avoid:["Clearway Mobile Mechanic"]},
  marine_repair:{love:["Coastal Marine Pro", "Harbor Marine Repair", "Bluewater Marine", "Summit Marine"],avoid:["Mainstreet Marine"]},
  rv_dealer:{love:["Open Road RV", "Crossroads RV"],avoid:["Cornerstone RV","Heritage RV"]},
  pizzeria:{love:["Brick & Fire", "The Pizza Kitchen", "Slice House"],avoid:["Copper Oven"]},
  deli:{love:["The Sandwich House", "Harvest Deli", "Mainstreet Deli", "The Corner Deli"],avoid:["Stacked","Copper Spoon Deli"]},
  bagel:{love:["The Bagel House"],avoid:["Copper Kettle Bagels","Boiled & Baked"]},
  donut:{love:["The Donut House"],avoid:["Sugar Ring"]},
  taqueria:{love:["The Taco House"],avoid:["Casa Verde","El Camino","Fuego","Coastal Tacos"]},
  sushi:{love:["The Sushi House", "Blue Wave Sushi"],avoid:["Umi","Mainstreet Sushi"]},
  steakhouse:{love:["The Steak House"],avoid:["Copper Grill","Cut & Co"]},
  seafood:{love:["Coastal Catch", "Tidewater Seafood"],avoid:["Harbor & Sea","Blue Dock"]},
  bbq:{love:["The Smokehouse"],avoid:["Copper Smoke","Ember & Oak"]},
  ramen:{love:["The Noodle House"],avoid:["Umami","Slurp","Coastal Ramen","Steam & Bowl"]},
  juice_bar:{love:["The Juice House"],avoid:["Daily Press","Green Press","Sunny Blends"]},
  acai:{love:["The Bowl House", "Harvest Bowls", "Tropic"],avoid:["Sunrise Bowls","Daybreak Bowls"]},
  ice_cream:{love:["The Scoop House"],avoid:["Copper Cow Creamery","Frost & Co","Sweet Cream"]},
  wine_bar:{love:["The Cellar", "The Tasting Room", "Vintage", "Harvest Wine Bar"],avoid:["Copper & Vine"]},
  sports_bar:{love:["The Dugout"],avoid:["Copper & Crown","The Tap Room"]},
  cheese_shop:{love:["The Cheese House"],avoid:["Harvest Cheese Co","Curd & Co"]},
  spice_shop:{love:["The Spice House"],avoid:["Harvest Spice Co","Saffron & Co"]},
  shoe_store:{love:["The Shoe House"],avoid:["Cornerstone Shoes"]},
  sneaker:{love:["The Sneaker House", "Laced"],avoid:["Soled","Heat","Crown Sneakers"]},
  consignment:{love:["Revival"],avoid:["Second Story","The Found House"]},
  pawn:{love:[],avoid:[]},
  antique:{love:["The Antique House", "Mainstreet Antiques", "Heritage Antiques"],avoid:["Bygone & Co"]},
  cigar:{love:["The Cigar House", "The Humidor"],avoid:["Ash & Oak"]},
  vape:{love:["Vapor House"],avoid:["Cloud Co","Summit Vape","Clearway Vape"]},
  pet_store2:{love:["The Pet House", "Wag & Co"],avoid:["Summit Pet Co","Heritage Pets"]},
  aquarium:{love:["The Reef House"],avoid:[]},
  feed_store:{love:["The Feed House", "Mainstreet Feed", "Heritage Feed Co", "Field & Farm"],avoid:[]},
  watch_shop:{love:["The Watch House"],avoid:["Crown Watch Co","Tick & Co"]},
  fabric:{love:["The Fabric House", "Stitch House"],avoid:["Cornerstone Fabrics"]},
  yarn:{love:["The Yarn House", "Mainstreet Yarn", "The Knit House"],avoid:[]},
  cookware:{love:["The Pantry House", "The Kitchen House"],avoid:["Copper & Cast"]},
  board_game:{love:["The Game House"],avoid:["Meeple & Co","The Dice House","Tabletop Co"]},
  cobbler:{love:["The Cobbler House", "Mainstreet Cobbler", "Heritage Shoe Repair", "Sole Pro"],avoid:["Resole & Co"]},
  chiropractor:{love:[],avoid:["Align Chiropractic","Clearview Chiropractic","Cornerstone Chiropractic","Summit Chiropractic"]},
  orthodontist:{love:["Brightsmile Orthodontics"],avoid:[]},
  dermatology:{love:["Radiance Dermatology"],avoid:["Clearview Dermatology","Heritage Dermatology"]},
  urgent_care:{love:["Rapid Care", "Mainstreet Urgent Care", "Summit Urgent Care"],avoid:["Cornerstone Urgent Care","Clearview Urgent Care"]},
  iv_therapy:{love:["The Drip Bar", "Revive IV", "Summit IV Therapy", "Replenish", "Vital Drip"],avoid:["Clearview IV"]},
  home_health:{love:["Companion Home Care", "Comfort Home Care"],avoid:["Clearview Home Care"]},
  pharmacy:{love:["Mainstreet Pharmacy", "Heritage Pharmacy"],avoid:["Cornerstone Pharmacy","Summit Pharmacy"]},
  audiology:{love:["Crisp Hearing"],avoid:["Cornerstone Hearing","Summit Audiology","Clearview Hearing","Heritage Audiology"]},
  crossfit:{love:[],avoid:["Bramble Fitness"]},
  pilates:{love:["The Pilates Studio", "Studio Pilates"],avoid:[]},
  spin_studio:{love:["The Spin House", "Cadence", "Revolution Spin", "Pulse Cycling"],avoid:[]},
  boxing:{love:["The Ring House", "Ironside Boxing", "Title Boxing Club", "Knockout"],avoid:[]},
  climbing:{love:["Summit Climbing"],avoid:[]},
  escape_room:{love:["The Escape House", "Lockdown", "Breakout", "The Vault"],avoid:[]},
  axe_throwing:{love:["The Axe House", "Bullseye"],avoid:["Timber & Co","Lumber Co"]},
  nail_salon:{love:["The Nail Bar", "Bella Nails"],avoid:["Polished"]},
  lash:{love:["The Lash House", "Bella Lash"],avoid:["Summit Lash Studio","Flutter"]},
  moving:{love:["Summit Moving", "Rapid Movers"],avoid:["Cornerstone Moving"]}
};
function exemplarText(key){ var e=EXEMPLARS[key]; if(!e) return ""; var t=""; if(e.love&&e.love.length) t+=" The founder LOVES these names for this exact category — study them and generate in this same style and register: "+e.love.join(", ")+"."; if(e.avoid&&e.avoid.length) t+=" He REJECTS this style for this category — never produce names like: "+e.avoid.join(", ")+"."; return t; }
function groundingPrompt(seed){ const b=briefFor(seed); return "CATEGORY: "+b.label+". NAMING STYLE TO MATCH: "+b.style+"."+exemplarText(b.key)+" "+brandRules()+safetyInstruction(); }
// DNA-DOMINANT grounding: when a specialty CATEGORY DNA owns the seed, drop the generic category
// label + "founder loves/rejects" exemplars (which fight the DNA) and keep only the universal brand
// rules + safety. The DNA block becomes the sole category authority.
function groundingMinimal(){ return brandRules()+safetyInstruction(); }

var TYPO={"docter":"doctor","dentis":"dentist","atterney":"attorney","attourney":"attorney","resturant":"restaurant","restraunt":"restaurant","resaurant":"restaurant","bewery":"brewery","phtography":"photography","photgraphy":"photography","salom":"salon","barbar":"barber","jewlery":"jewelry","jewellry":"jewelry","boutiqe":"boutique","accountent":"accountant","plumer":"plumber","electricion":"electrician","landscapeing":"landscaping","vetrinary":"veterinary","vetinary":"veterinary","coffe":"coffee","cafee":"cafe","bakary":"bakery","tatoo":"tattoo","massauge":"massage","plummer":"plumber","plumbar":"plumber","fotography":"photography","fotographer":"photographer","photographe":"photographer","morgage":"mortgage","mortage":"mortgage","mortgauge":"mortgage","resturaunt":"restaurant","restront":"restaurant","chiropracter":"chiropractor","accupuncture":"acupuncture","acupunture":"acupuncture","cleening":"cleaning","roofin":"roofing","electritian":"electrician","contracter":"contractor","insurence":"insurance","attorny":"attorney","hvack":"hvac","landscaper":"landscaping","cabnet":"cabinet","cabnetry":"cabinetry"};
function normalize(seed){ var s=String(seed||"").toLowerCase(); s=s.replace(/([a-z])\1{2,}/g,"$1$1"); s=s.replace(/[a-z]+/g,function(w){return TYPO[w]||w;}); return s; }
var FAMILYKEYS={_retail:1,_food:1,_professional:1,_creative:1,_wellness:1,_service:1};
var BROAD=new Set(["medical","law","restaurant","consulting","marketing","fitness","financial","insurance","real_estate","photography","coaching","construction","saas"]);
function classifyScored(seed){ var key=classify(seed); var conf; if(key==="_generic") conf=0.30; else if(FAMILYKEYS[key]) conf=0.55; else conf=0.90; var lab=((C[key]&&C[key].label)||"").toLowerCase().split(/[^a-z]+/).filter(Boolean); var ns=normalize(seed); var hits=0; for(var i=0;i<lab.length;i++){ if(lab[i].length>3&&ns.indexOf(lab[i])>=0) hits++; } if(hits>=2&&conf<0.95) conf=Math.min(0.95,conf+0.10); var broad=BROAD.has(key); return {key:key,label:(C[key]||C._generic).label,confidence:Math.round(conf*100)/100,needsRefine:(conf<0.70),broad:broad,offerRefine:(conf<0.70||broad)}; }
var FAMOUS=new Set(["nike","adidas","reebok","lululemon","patagonia","gucci","prada","chanel","rolex","ferrari","sephora","starbucks","mcdonalds","wendys","chipotle","dunkin","walmart","costco","kroger","netflix","spotify","disney","google","amazon","microsoft","apple","samsung","nintendo","playstation","xbox","lego","ikea","gillette","heineken","budweiser","pepsi","cocacola","pfizer","mastercard","paypal","stripe","shopify","salesforce","fedex","tesla","airbnb","oracle","adobe","verizon","facebook","instagram","tiktok","marlboro"]);
function isClearName(name){ var toks=splitWords(name); for(var i=0;i<toks.length;i++){ if(FAMOUS.has(toks[i])) return false; } return true; }
var WHITELIST=new Set(["skillshare","classpass","brasserie","glasswing"]);
function screenName(name,seed){ var lower=String(name).toLowerCase().replace(/[^a-z]/g,""); if(WHITELIST.has(lower)) return {ok:true,reason:"whitelisted"}; if(!isSafeName(name)) return {ok:false,reason:"unsafe"}; if(!isClearName(name)) return {ok:false,reason:"trademark"}; return {ok:true,reason:"clear"}; }

module.exports = { isSafeName, safetyInstruction, classify, classifyScored, normalize, screenName, isClearName, briefFor, groundingPrompt, groundingMinimal, exemplarText, fallbackNames, CATEGORIES: C, EXEMPLARS: EXEMPLARS };
