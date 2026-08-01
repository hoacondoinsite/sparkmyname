const fs=require('fs');
const src=fs.readFileSync('/home/claude/site/js/workspace-core.js','utf8');
function body(n){const i=src.indexOf('function '+n+'(');let d=0,k=src.indexOf('{',i);
 for(let p=k;p<src.length;p++){if(src[p]==='{')d++;if(src[p]==='}'){d--;if(d===0)return src.slice(i,p+1);}}return '';}
const dl=body('downloadAll');
let fail=0;const ok=(n,c)=>{console.log((c?'PASS  ':'FAIL  ')+n);if(!c)fail++;};

// --- the kit must describe the brand you downloaded ---
ok('kit uses the ACTIVE name, not names[0]', dl.includes("var N0=(_all ? IDEA.names[0] : (_list[0] || IDEA.names[0]))"));
ok('title matches the active brand', dl.includes("_all ? (IDEA.cat||'') : ((N0&&N0.name)||IDEA.cat||'')"));
ok('all-names mode still titled by order', dl.includes('_all ?'));

// --- the presented PDF ---
ok('typeset deck included in the ZIP', dl.includes('genCopyDeck(n, IDEA)'));
ok('deck saved with the brand name', dl.includes("slug(n.name)+'-Brand-Kit.pdf'"));
ok('a failed PDF cannot lose the download', /genCopyDeck[\s\S]{0,200}catch\(function\(\)\{\}\)/.test(dl));
ok('deck builder still exists', src.includes('function genCopyDeck('));
ok('deck is typeset, not plain', src.includes('Brand Copy Deck') && src.includes("format:'letter'"));

// --- punctuation ---
ok('nodot strips ! and ? too', src.includes("replace(/\\s*[.!?]+\\s*$/,'')"));
ok('dotIf helper exists', src.includes('function dotIf(x)'));
ok('bio line no longer force-appends a period', !src.includes("(tclean?tclean.toLowerCase():'built with care')+'.'"));
console.log(fail===0?'\nBRAND KIT CLEAN':'\n'+fail+' FAILED');process.exit(fail?1:0);
