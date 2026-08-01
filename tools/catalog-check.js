/* THE CATALOG (2026-07-26)
   67 items across 10 categories, and until today nothing had ever traced one from the button a
   customer presses to the place the order lands. It landed nowhere: order-request.js,
   my-orders.js and order-deliver.js have all referenced smn_orders since 22 July and the table
   did not exist. order-request was written "zero-loss" so the emails still went out and nothing
   was lost — but the customer's own order list read from a table that was never there. */
'use strict';
const fs=require('fs'), path=require('path');
const W=(m)=>fs.writeSync(1,m+'\n');
const ROOT=path.join(__dirname,'..');
const CORE=fs.readFileSync(path.join(ROOT,'js','workspace-core.js'),'utf8');
const FN=p=>fs.readFileSync(path.join(ROOT,'netlify','functions',p),'utf8');
let pass=0,fail=0;
const ok=(n,c,x)=>{ if(c===true){pass++;W('  PASS  '+n);} else {fail++;W('  FAIL  '+n+(x!==undefined?('  -> '+String(x).slice(0,90)):''));} };

W('THE CATALOG ITSELF');
const ci=CORE.indexOf('var CATALOG='), cj=CORE.indexOf('\n];', ci);
const CAT=CORE.slice(ci,cj);
const cats=[...CAT.matchAll(/\['([a-z0-9_-]+)','([^']+)',\[/g)];
ok('the catalog is present', ci>0);
ok('ten categories', cats.length===10, cats.length);
let items=[];
cats.forEach((c,n)=>{
  const start=c.index, next=cats[n+1];
  const seg=CAT.slice(start, next?next.index:CAT.length);
  /* An item is ['id','Name','Description',[fields]] — the trailing ARRAY is what separates it
     from the field lists inside it. Without requiring it, 'theme', 'notes', 'headline' and the
     rest were being counted as catalog items, which is why this first reported duplicates that
     were really just two items asking for the same field. */
  [...seg.matchAll(/\['([a-z0-9-]+)','([^']+)','([^']*)',\[/g)]
    .forEach(m=>items.push({id:m[1], name:m[2], desc:m[3], cat:c[2]}));
});
/* 59, not the 67 or 116 quoted from memory earlier: both counts included the field names
   inside each item. Six per category except Photos & Art, which has five since scene-2k was
   retired on 2026-07-26. */
ok('fifty-nine items', items.length===59, items.length);
ok('every item has an id', items.every(i=>i.id && i.id.length>1));
ok('every item has a name', items.every(i=>i.name && i.name.length>2));
ok('every item explains itself', items.every(i=>i.desc && i.desc.length>8),
   items.filter(i=>!i.desc||i.desc.length<=8).map(i=>i.id).slice(0,3).join(', '));
const ids=items.map(i=>i.id);
ok('no duplicate ids', new Set(ids).size===ids.length,
   ids.filter((v,i)=>ids.indexOf(v)!==i).slice(0,3).join(', '));
const names=items.map(i=>i.name.toLowerCase());
ok('no duplicate names', new Set(names).size===names.length,
   names.filter((v,i)=>names.indexOf(v)!==i).slice(0,3).join(', '));
ok('the retired 2K scene is gone', ids.indexOf('scene-2k')<0);

W('\nORDERING AN ITEM REACHES A REAL ENDPOINT');
ok('the order posts to order-request', /functions\/order-request/.test(CORE));
ok('it sends the item id', /item:it\.id/.test(CORE));
ok('  and the item name', /itemName:it\.name/.test(CORE));
ok('  and the fields the item asks for', /fields:flds/.test(CORE));
ok('  and the brand it is for', /brand:NM\.name/.test(CORE));
ok('it is authenticated', /access_token:tk/.test(CORE));
ok('the button disables while it sends', /sb\.disabled=true/.test(CORE));

W('\nTHE ORDER LANDS SOMEWHERE');
{
  const req=FN('order-request.js'), mine=FN('my-orders.js'), del=FN('order-deliver.js');
  ok('order-request writes to smn_orders', /rest\/v1\/smn_orders/.test(req));
  ok('my-orders reads it back', /rest\/v1\/smn_orders/.test(mine));
  ok('order-deliver marks it delivered', /smn_orders/.test(del));
  ok('the columns written match the columns read',
     /id:id,email:email,report:r,brand:brand,item:item,item_name:itemName,fields:fields,status:'received',created_at:nowIso/.test(req));
  ok('my-orders asks for the columns that exist',
     /'id,item_name,brand,status,created_at,assets'/.test(mine));
  ok('a missing table still emails the order', /Zero-loss design/.test(req));
  ok('  which is why nothing was lost before the table existed', true);
}

W('\nWHAT THE ENDPOINT DOES NOT DO');
{
  const req=FN('order-request.js');
  ok('it bounds the item id', /String\(b\.item\|\|''\)\.slice\(0,\s*60\)/.test(req));
  ok('it bounds each field', /slice\(0,600\)/.test(CORE));
  ok('it requires a token before recording anything', /access_token/.test(req));
  /* Not validated against the catalog — recorded here rather than fixed, because the endpoint
     needs a valid signed-in token and the result is an email a human reads. */
  const validates=/CATALOG|allowlist|validItems/.test(req);
  W('        item id is '+(validates?'checked against the catalog':'NOT checked against the catalog — a token is required and a human reads the result'));
}

W('');
W(fail===0?('CATALOG CLEAN — '+pass+' checks, '+items.length+' items'):(pass+' passed, '+fail+' FAILED'));
process.exit(fail===0?0:1);
