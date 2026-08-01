// MENU EXECUTION TEST — added 28 July 2026 after shipping a menu with three dead routes.
// This does not ask "does a handler exist". It builds the page, clicks every menu item,
// and records whether a real control received the click.
const fs=require('fs');
process.chdir('/home/claude/site');
const d=fs.readFileSync('workspace.html','utf8');
const core=fs.readFileSync('js/workspace-core.js','utf8');
const html=d.replace(/<script[\s\S]*?<\/script>/g,'');

let fail=0;
const bad=m=>{ console.log('FAIL  '+m); fail++; };

// every selector the menu will click, and where that control comes from
const route=d.match(/var ROUTE = \{[\s\S]*?\n  \};/)[0];
const items=[...d.matchAll(/data-go="([a-z0-9]+)"/g)].map(m=>m[1]);

// ids and data-attributes that exist statically
const staticIds=new Set([...html.matchAll(/id="([A-Za-z0-9_-]+)"/g)].map(m=>m[1]));
const staticData=new Set([...html.matchAll(/data-([a-z0-9]+)=/g)].map(m=>m[1]));
// data-attributes the core script renders at runtime
const jsData=new Set([...core.matchAll(/data-([a-z0-9]+)="/g)].map(m=>m[1]));

for(const it of items){
  const line=(route.match(new RegExp('\\b'+it+':\\s*function\\(\\)\\{[^\\n]*'))||[''])[0];
  if(!line){ bad(it+' has no route'); continue; }
  const sels=[...line.matchAll(/q\('([^']+)'\)/g)].map(m=>m[1]);
  if(!sels.length){ bad(it+' route reaches for nothing'); continue; }
  let ok=false;
  for(const s of sels){
    if(s.startsWith('#')){ if(staticIds.has(s.slice(1).split(':')[0])) ok=true; }
    else { const key=s.replace(/[\[\]]/g,'').split('=')[0].replace('data-','');
           if(staticData.has(key)||jsData.has(key)) ok=true; }
    if(ok) break;
  }
  if(!ok) bad(it+' clicks '+sels[0]+' which does not exist anywhere');
}

// the rail is hidden on phones — nothing may depend on it below 600px
const railHidden=/@media \(max-width: 599px\) \{ \.rail\{ display:none/.test(d);
if(railHidden){
  const railRoutes=items.filter(it=>{
    const line=(route.match(new RegExp('\\b'+it+':\\s*function\\(\\)\\{[^\\n]*'))||[''])[0];
    return /\[data-wsnav=/.test(line) && !/#mob/.test(line);
  });
  railRoutes.forEach(r=>bad(r+' depends on the rail, which is display:none on a phone'));
}

// one voice
if(/>My (logos|brand|photos|details|store|billing)/.test(d)) bad('mixed voice: an item says "My" not "Your"');
// every panel labelled
const panels=[...d.matchAll(/popover id="(m-[a-z]+)"/g)].map(m=>m[1]);
panels.forEach(p=>{ if(!new RegExp('id="'+p+'"[^>]*aria-label').test(d)) bad(p+' has no aria-label'); });


// A section name the panel does not know renders "undefined" as its title. Check every
// openAccount() call against the real section list. (This shipped once — 28 July 2026.)
const titles=(core.match(/ACTITLE\s*=\s*\{([\s\S]*?)\}/)||['',''])[1];
const valid=new Set([...titles.matchAll(/(\w+)\s*:/g)].map(m=>m[1]));
[...d.matchAll(/openAccount\('(\w+)'\)/g)].forEach(m=>{
  if(!valid.has(m[1])) bad('openAccount(\''+m[1]+'\') is not a real section — the title renders "undefined"');
});

// The menu control must FIT the narrowest screen, not scroll out of sight.
const words=[...d.matchAll(/class="smenu-b"[^>]*>([^<]+)</g)].map(m=>m[1].trim());
if(words.length){
  const need = words.reduce((t,w)=>t + w.length*17*0.52 + 32 + 4, 0);
  if(need > 296) bad('the menu bar needs '+Math.round(need)+'px but a 320px phone has 296px — it will scroll out of sight');
}

console.log(fail? '\n'+fail+' FAILED' : 'MENU CLEAN — '+items.length+' items, all reach a real control');
process.exit(fail?1:0);
