/* DOWNLOAD LOG WIRE (2026-07-26). The logger discards any request without an email, and the
   caller never sent one — so smn_download_log sat empty from 5 July. Real DOM, real fetch capture. */
'use strict';
const fs=require('fs'), path=require('path');
const {JSDOM,VirtualConsole}=require('jsdom');
const W=(m)=>fs.writeSync(1,m+'\n');
function workspaceSource(root){
  var fsx=require('fs'), px=require('path');
  var out = fsx.readFileSync(px.join(root,'workspace.html'),'utf8');
  return out.replace(/<script[^>]*src="(js\/[^"]+)"[^>]*><\/script>/g, function(m, rel){
    try{ return '<scr'+'ipt>' + fsx.readFileSync(px.join(root, rel),'utf8') + '</scr'+'ipt>'; }
    catch(e){ return m; }
  });
}
let pass=0,fail=0;
const ok=(n,c,x)=>{ if(c===true){pass++;W('  PASS  '+n);} else {fail++;W('  FAIL  '+n+(x!==undefined?('  -> '+String(x).slice(0,120)):''));} };

function boot(email){
  const calls=[]; const vc=new VirtualConsole(); vc.on('jsdomError',()=>{});
  const dom=new JSDOM(workspaceSource(path.join(__dirname,'..')),{
    runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/workspace.html',virtualConsole:vc,
    beforeParse(w){
      w.scrollTo=()=>{}; w.HTMLElement.prototype.scrollIntoView=function(){};
      w.matchMedia=w.matchMedia||(q=>({matches:false,media:q,addListener(){},addEventListener(){},removeEventListener(){}}));
      w.fetch=function(u,o){ calls.push({url:String(u), body:(o&&o.body)||''});
        return Promise.resolve({ok:true,json:()=>Promise.resolve({ok:true})}); };
      try{ if(email) w.localStorage.setItem('smn_email', email);
           else w.localStorage.removeItem('smn_email'); }catch(e){}
    }});
  return {dom,win:dom.window,calls};
}

W('WITH A KNOWN CUSTOMER EMAIL');
{
  const b=boot('someone@example.com');
  b.win.logDl('brand-board.svg','logo');
  const c=b.calls.filter(x=>x.url.indexOf('log-download')>=0);
  ok('a request is sent', c.length===1, c.length);
  if(c.length){
    let body={}; try{ body=JSON.parse(c[0].body); }catch(e){}
    ok('it carries an email', !!body.email && body.email.indexOf('@')>0, JSON.stringify(body.email));
    ok('  the logger will NOT discard it', !!body.email);
    ok('it names the asset', body.asset==='brand-board.svg', body.asset);
    ok('it names the section', body.section==='logo', body.section);
    ok('allowed is sent as true (not undefined)', body.allowed===true, String(body.allowed));
  }
  b.dom.window.close();
}

W('\nWITH NO EMAIL AVAILABLE');
{
  const b=boot('');
  const before=b.calls.filter(x=>x.url.indexOf('log-download')>=0).length;
  b.win.logDl('x.svg','logo');
  const after=b.calls.filter(x=>x.url.indexOf('log-download')>=0).length;
  W('        calls during boot: '+before+', after logDl: '+after);
  /* The account chip no longer ships with a real address baked in, so with no session there
     is genuinely no email to attribute a download to. */
  let acv=''; try{ acv=b.win.acEmail(); }catch(e){ acv='THREW'; }
  W('        acEmail() with no session: '+JSON.stringify(acv));
  ok('no pointless request is sent', after===before, 'before '+before+' after '+after);
  b.dom.window.close();
}

W('\nTHE LOGGER ITSELF');
{
  const fn=fs.readFileSync(path.join(__dirname,'..','netlify','functions','log-download.js'),'utf8');
  ok('still rejects an empty email (unchanged)', /if \(!email\) return/.test(fn));
  ok('stores allowed as a strict boolean', /allowed: b\.allowed === true/.test(fn));
}

W('\nNO PERSONAL DATA SHIPPED IN THE MARKUP');
{
  const page=fs.readFileSync(path.join(__dirname,'..','workspace.html'),'utf8');
  const core=fs.readFileSync(path.join(__dirname,'..','js','workspace-core.js'),'utf8');
  ok('no real email baked into the page', page.indexOf('peterkleinusa')<0);
  ok('no real email baked into the core', core.indexOf('peterkleinusa')<0);
  ok('the account chip starts neutral', /id="amEmail">Loading your account/.test(page));
  ok('the avatar starts neutral', /id="avatarBtn" title="Account">&#9679;</.test(page));
  ok('it is filled from the real session', /function smnFillAccountChip/.test(core));
  ok('acEmail no longer invents an address', core.indexOf("you@yourbrand.com")<0);
}

W('');
W(fail===0?('DOWNLOAD LOG CLEAN — '+pass+' checks'):(pass+' passed, '+fail+' FAILED'));
process.exit(fail===0?0:1);
