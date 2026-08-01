/* File: sandbox/js/agency-docs.js | 2026-07-17 | Phase 2 Step 3C — Business Ops engine.
   Client-side generators for REAL, EDITABLE office documents + high-quality PDFs,
   pre-populated with the brand's name, tagline, palette, and details. Built as raw
   OOXML (DOCX/XLSX/PPTX) via JSZip, plus a dependency-free PDF writer. No server round-trip.
   Editorial integrity: accents/headers use the brand's Ink/Paper/Accent palette.
   Exposes window.AGENCY_DOCS (async builders returning { n, blob, mime }). */
(function () {
  // local, dependency-free, offline zip (store method) — OOXML reads it fine.
  function zipBlob(files, mime){ var b = window.SBX_ZIP.build(files); return (mime && b.slice) ? b.slice(0, b.size, mime) : b; }
  function xml(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;' }[c]; }); }
  function hexNoHash(h){ return String(h || '#000000').replace('#',''); }

  /* ============================ DOCX ============================ */
  // blocks: [{t:'h1'|'h2'|'p'|'bullet', text}] ; accent hex colors headings
  function docxXml(title, blocks, accent){
    var ac = hexNoHash(accent);
    function para(b){
      var sz = b.t === 'h1' ? 40 : b.t === 'h2' ? 28 : 22;
      var bold = (b.t === 'h1' || b.t === 'h2');
      var color = b.t === 'h1' ? '111014' : b.t === 'h2' ? ac : '2E2E2E';
      var pPr = '<w:pPr><w:spacing w:before="' + (b.t==='h1'?'240':b.t==='h2'?'200':'40') + '" w:after="' + (b.t==='p'||b.t==='bullet'?'120':'80') + '"/>'
        + (b.t === 'bullet' ? '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>' : '') + '</w:pPr>';
      var rPr = '<w:rPr>' + (bold ? '<w:b/>' : '') + '<w:color w:val="' + color + '"/><w:sz w:val="' + sz + '"/><w:szCs w:val="' + sz + '"/><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/></w:rPr>';
      return '<w:p>' + pPr + '<w:r>' + rPr + '<w:t xml:space="preserve">' + xml(b.text) + '</w:t></w:r></w:p>';
    }
    var body = [{ t:'h1', text: title }].concat(blocks).map(para).join('');
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      + '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
      + '<w:body>' + body + '<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>';
  }
  function numberingXml(){
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      + '<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
      + '<w:abstractNum w:abstractNumId="0"><w:lvl w:ilvl="0"><w:numFmt w:val="bullet"/><w:lvlText w:val="&#8226;"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr></w:lvl></w:abstractNum>'
      + '<w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num></w:numbering>';
  }
  function buildDocx(title, blocks, accent){
    var files = [
      { name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        + '<Default Extension="xml" ContentType="application/xml"/>'
        + '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
        + '<Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/></Types>' },
      { name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        + '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>' },
      { name: 'word/document.xml', data: docxXml(title, blocks, accent) },
      { name: 'word/numbering.xml', data: numberingXml() },
      { name: 'word/_rels/document.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        + '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/></Relationships>' }
    ];
    return Promise.resolve(zipBlob(files, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'));
  }

  /* ============================ XLSX ============================ */
  // rows: array of arrays; cell = string | number | {v, bold, accent}
  function colRef(i){ var s=''; i++; while(i>0){ var m=(i-1)%26; s=String.fromCharCode(65+m)+s; i=Math.floor((i-1)/26); } return s; }
  function sheetXml(rows){
    var body = rows.map(function(row, r){
      var cells = row.map(function(cell, c){
        var ref = colRef(c) + (r+1);
        var v = (cell && typeof cell === 'object') ? cell.v : cell;
        var style = (cell && typeof cell === 'object' && cell.bold) ? ' s="1"' : (cell && typeof cell === 'object' && cell.accent) ? ' s="2"' : '';
        if (typeof v === 'number' && isFinite(v)) return '<c r="' + ref + '"' + style + '><v>' + v + '</v></c>';
        if (typeof v === 'string' && v.charAt(0) === '=') return '<c r="' + ref + '"' + style + '><f>' + xml(v.slice(1)) + '</f></c>'; // real formula
        return '<c r="' + ref + '" t="inlineStr"' + style + '><is><t xml:space="preserve">' + xml(v) + '</t></is></c>';
      }).join('');
      return '<row r="' + (r+1) + '">' + cells + '</row>';
    }).join('');
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      + '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
      + '<cols><col min="1" max="1" width="34" customWidth="1"/><col min="2" max="8" width="16" customWidth="1"/></cols>'
      + '<sheetData>' + body + '</sheetData></worksheet>';
  }
  function stylesXml(accent){
    var ac = hexNoHash(accent);
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      + '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
      + '<fonts count="3"><font><sz val="11"/><name val="Calibri"/></font>'
      + '<font><b/><sz val="11"/><color rgb="FF111014"/><name val="Calibri"/></font>'
      + '<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts>'
      + '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>'
      + '<fill><patternFill patternType="solid"><fgColor rgb="FF' + ac + '"/></patternFill></fill></fills>'
      + '<borders count="1"><border/></borders>'
      + '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
      + '<cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
      + '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>'
      + '<xf numFmtId="0" fontId="2" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs></styleSheet>';
  }
  function buildXlsx(sheetName, rows, accent){
    var files = [
      { name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        + '<Default Extension="xml" ContentType="application/xml"/>'
        + '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
        + '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
        + '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>' },
      { name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        + '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
      { name: 'xl/workbook.xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        + '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        + '<sheets><sheet name="' + xml(sheetName).slice(0,31) + '" sheetId="1" r:id="rId1"/></sheets></workbook>' },
      { name: 'xl/_rels/workbook.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        + '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
        + '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
      { name: 'xl/styles.xml', data: stylesXml(accent) },
      { name: 'xl/worksheets/sheet1.xml', data: sheetXml(rows) }
    ];
    return Promise.resolve(zipBlob(files, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'));
  }

  /* ============================ PDF (drawn text + rules) ============================ */
  function buildPdfBlob(title, brand, lines, accent){
    var PW=595, PH=842, MX=56, MTOP=792, MBOT=56, CW=PW-2*MX;
    function esc2(t){ return String(t).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)').replace(/[^\x20-\x7E]/g,function(ch){var m={'—':'-','–':'-','‘':"'",'’':"'",'“':'"','”':'"','•':'*','·':'*','…':'...'};return m[ch]||'';}); }
    function ac(){ var h=hexNoHash(accent); return (parseInt(h.slice(0,2),16)/255).toFixed(3)+' '+(parseInt(h.slice(2,4),16)/255).toFixed(3)+' '+(parseInt(h.slice(4,6),16)/255).toFixed(3); }
    function wrap(t,size){ var mx=CW/(size*0.5),ws=String(t).split(/\s+/),o=[],c=''; ws.forEach(function(w){ if((c+' '+w).trim().length>mx){if(c)o.push(c);c=w;}else c=(c?c+' ':'')+w;}); if(c)o.push(c); return o.length?o:['']; }
    var pages=[],ops=[],y=MTOP;
    function np(){ if(ops.length)pages.push(ops); ops=[]; y=MTOP; }
    ops.push('0 0 0 rg BT /FB 22 Tf '+MX+' '+y+' Td ('+esc2(title)+') Tj ET'); y-=20;
    ops.push(ac()+' rg '+MX+' '+y+' 120 3 re f'); y-=24;
    ops.push('0.36 0.32 0.25 rg BT /F 10 Tf '+MX+' '+y+' Td ('+esc2(brand)+') Tj ET'); y-=26;
    lines.forEach(function(L){ var size=L.size||11,bold=!!L.bold,lead=Math.round(size*1.5);
      if(L.rule){ if(y<MBOT+10)np(); ops.push(ac()+' rg '+MX+' '+y+' '+CW+' 1.4 re f'); y-=14; return; }
      wrap(L.t,size).forEach(function(seg){ if(y<MBOT)np(); var col=L.head?ac():'0.16 0.16 0.16'; ops.push(col+' rg BT /'+(bold?'FB':'F')+' '+size+' Tf '+MX+' '+y+' Td ('+esc2(seg)+') Tj ET'); y-=lead; }); y-=(L.gap||4);
    });
    if(ops.length)pages.push(ops);
    var objs=[]; var kids=pages.map(function(_,i){return (4+i*2)+' 0 R';}).join(' ');
    objs.push('1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj');
    objs.push('2 0 obj << /Type /Pages /Kids ['+kids+'] /Count '+pages.length+' >> endobj');
    objs.push('3 0 obj << /F << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /FB << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> >> endobj');
    pages.forEach(function(pg,i){ var st=pg.join('\n');
      objs.push((4+i*2)+' 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 '+PW+' '+PH+'] /Resources << /Font 3 0 R >> /Contents '+(5+i*2)+' 0 R >> endobj');
      objs.push((5+i*2)+' 0 obj << /Length '+st.length+' >> stream\n'+st+'\nendstream endobj'); });
    var body='%PDF-1.4\n',offs=[]; objs.forEach(function(o){offs.push(body.length);body+=o+'\n';});
    var xref=body.length; body+='xref\n0 '+(objs.length+1)+'\n0000000000 65535 f \n'+offs.map(function(o){return String(o).padStart(10,'0')+' 00000 n \n';}).join('')+'trailer << /Size '+(objs.length+1)+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF';
    return new Blob([body], { type: 'application/pdf' });
  }

  /* ============================ PPTX (minimal, valid) ============================ */
  function slideXml(s, accent){
    var ac = hexNoHash(accent);
    function tx(id, x, y, w, h, size, bold, color, txt){
      return '<p:sp><p:nvSpPr><p:cNvPr id="' + id + '" name="t' + id + '"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>'
        + '<p:spPr><a:xfrm><a:off x="' + x + '" y="' + y + '"/><a:ext cx="' + w + '" cy="' + h + '"/></a:xfrm>'
        + '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr>'
        + '<p:txBody><a:bodyPr wrap="square"/><a:p><a:r><a:rPr lang="en-US" sz="' + size + '" b="' + (bold?1:0) + '"><a:solidFill><a:srgbClr val="' + color + '"/></a:solidFill></a:rPr><a:t>' + xml(txt) + '</a:t></a:r></a:p></p:txBody></p:sp>';
    }
    var shapes = tx(2, 457200, 500000, 8229600, 900000, 3200, 1, '111014', s.title || '');
    shapes += '<p:sp><p:nvSpPr><p:cNvPr id="3" name="rule"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="457200" y="1500000"/><a:ext cx="1200000" cy="45000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="' + ac + '"/></a:solidFill></p:spPr><p:txBody><a:bodyPr/><a:p/></p:txBody></p:sp>';
    if (s.body) shapes += tx(4, 457200, 1900000, 8229600, 3600000, 1800, 0, '2E2E2E', s.body);
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      + '<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">'
      + '<p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/>' + shapes + '</p:spTree></p:cSld><p:clrMapOvr><a:overrideClrMapping bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/></p:clrMapOvr></p:sld>';
  }
  function buildPptx(slides, accent){
    var sldRefs = slides.map(function(_,i){ return '<p:sldId id="' + (256+i) + '" r:id="rId' + (i+2) + '"/>'; }).join('');
    var ov = slides.map(function(_,i){ return '<Override PartName="/ppt/slides/slide' + (i+1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>'; }).join('');
    var files = [];
    files.push({ name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
      + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
      + '<Default Extension="xml" ContentType="application/xml"/>'
      + '<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>'
      + '<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>'
      + '<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>'
      + '<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>'
      + ov + '</Types>' });
    files.push({ name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>' });
    files.push({ name: 'ppt/presentation.xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      + '<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">'
      + '<p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>'
      + '<p:sldIdLst>' + sldRefs + '</p:sldIdLst><p:sldSz cx="9144000" cy="6858000"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>' });
    var prel = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
      + '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>';
    slides.forEach(function(_,i){ prel += '<Relationship Id="rId' + (i+2) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide' + (i+1) + '.xml"/>'; });
    prel += '<Relationship Id="rIdT" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/></Relationships>';
    files.push({ name: 'ppt/_rels/presentation.xml.rels', data: prel });
    slides.forEach(function(s,i){
      files.push({ name: 'ppt/slides/slide' + (i+1) + '.xml', data: slideXml(s, accent) });
      files.push({ name: 'ppt/slides/_rels/slide' + (i+1) + '.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/></Relationships>' });
    });
    files.push({ name: 'ppt/slideMasters/slideMaster1.xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst></p:sldMaster>' });
    files.push({ name: 'ppt/slideMasters/_rels/slideMaster1.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rIdT" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/></Relationships>' });
    files.push({ name: 'ppt/slideLayouts/slideLayout1.xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1"><p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>' });
    files.push({ name: 'ppt/slideLayouts/_rels/slideLayout1.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>' });
    files.push({ name: 'ppt/theme/theme1.xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Editorial"><a:themeElements><a:clrScheme name="Editorial"><a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1><a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="111014"/></a:dk2><a:lt2><a:srgbClr val="EFEBE3"/></a:lt2><a:accent1><a:srgbClr val="' + hexNoHash(accent) + '"/></a:accent1><a:accent2><a:srgbClr val="7E6018"/></a:accent2><a:accent3><a:srgbClr val="8A9A7B"/></a:accent3><a:accent4><a:srgbClr val="B08D57"/></a:accent4><a:accent5><a:srgbClr val="33383D"/></a:accent5><a:accent6><a:srgbClr val="7C2B34"/></a:accent6><a:hlink><a:srgbClr val="0563C1"/></a:hlink><a:folHlink><a:srgbClr val="954F72"/></a:folHlink></a:clrScheme><a:fontScheme name="Editorial"><a:majorFont><a:latin typeface="Georgia"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme><a:fmtScheme name="Editorial"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>' });
    return Promise.resolve(zipBlob(files, 'application/vnd.openxmlformats-officedocument.presentationml.presentation'));
  }

  /* ============================ BUSINESS-OPS GENERATORS ============================ */
  function P(spec){ return spec.palette || { ink:'#111014', paper:'#EFEBE3', accent:'#7C2B34' }; }
  function brandline(spec){ return spec.name + (spec.tagline ? '  —  ' + spec.tagline : '') + (spec.domain ? '  ·  ' + spec.domain : ''); }
  // light industry phrase from the business seed (e.g. "a wine bar" → "wine bar"); safe when absent
  function industry(spec){ var s = String(spec.seed || '').trim().replace(/^(a|an|the)\s+/i,'').replace(/[.]+$/,''); return s.length > 2 && s.length < 60 ? s : ''; }

  var GEN = {
    businessPlan: function(spec){ var nm=spec.name, tg=spec.tagline||'';
      return buildDocx(nm + ' — Business Plan', [
        {t:'h2',text:'Executive Summary'},
        {t:'p',text:nm + ' is a brand built around one idea: "' + tg + '." This plan outlines the market, model, and milestones to launch and grow it.'},
        {t:'h2',text:'Company Overview'},
        {t:'bullet',text:'Brand: ' + nm}, {t:'bullet',text:'Positioning: ' + tg}, {t:'bullet',text:'Web: ' + (spec.domain||'—')},
        {t:'h2',text:'Market Opportunity'},
        {t:'p',text:'Describe your target customer, the problem you solve, and why now. Size the market and name the segments you will win first.'},
        {t:'h2',text:'Products & Services'},
        {t:'p',text:'List what you sell, how it is priced, and what makes it distinct.'},
        {t:'h2',text:'Go-to-Market'},
        {t:'bullet',text:'Channels: where your customers already are.'},{t:'bullet',text:'Launch offer and first 90 days.'},{t:'bullet',text:'Partnerships and referrals.'},
        {t:'h2',text:'Operations'}, {t:'p',text:'Suppliers, fulfillment, tools, and the team you need to deliver.'},
        {t:'h2',text:'Financial Plan'}, {t:'p',text:'Summarize revenue model, unit economics, and the milestones in the attached projections.'},
        {t:'h2',text:'Milestones'}, {t:'bullet',text:'Month 1 — Launch.'},{t:'bullet',text:'Month 3 — First 100 customers.'},{t:'bullet',text:'Month 6 — Break-even.'}
      ], P(spec).accent).then(function(b){ return { n: spec.slug + '-business-plan.docx', blob: b, mime: 'docx' }; }); },

    salesScripts: function(spec){ var nm=spec.name;
      return buildDocx(nm + ' — Sales Scripts', [
        {t:'h2',text:'Cold outreach (email)'},
        {t:'p',text:'Subject: A quick idea for [Company]. Hi [Name] — I run ' + nm + '. ' + (spec.tagline||'') + ' We help [outcome]. Worth a 10-minute look? — [You]'},
        {t:'h2',text:'Discovery call opener'},
        {t:'p',text:'"Thanks for the time. Before I show you ' + nm + ', tell me what prompted you to take this call — what would a win look like for you?"'},
        {t:'h2',text:'Objection — price'},
        {t:'p',text:'"Totally fair. Most clients weigh it against [cost of the problem]. If ' + nm + ' returns that in [timeframe], is price still the blocker?"'},
        {t:'h2',text:'Close'},
        {t:'p',text:'"Here is what I would suggest as a first step... Shall we get you started this week?"'},
        {t:'h2',text:'Follow-up'},
        {t:'bullet',text:'Day 2: recap + one proof point.'},{t:'bullet',text:'Day 5: a relevant example.'},{t:'bullet',text:'Day 9: a simple yes/no ask.'}
      ], P(spec).accent).then(function(b){ return { n: spec.slug + '-sales-scripts.docx', blob: b, mime: 'docx' }; }); },

    projections: function(spec){ var nm=spec.name, ac=P(spec).accent;
      var rows=[[{v:nm+' — 12-Month Revenue Projections',accent:true},'','','','','','']];
      rows.push([{v:'Month',bold:true}].concat(['1','2','3','4','5','6','7','8','9','10','11','12'].map(function(m){return {v:'M'+m,bold:true};})));
      rows.push(['New customers',5,8,12,16,20,26,32,40,48,58,70,84]);
      rows.push(['Avg price ($)',29,29,29,29,39,39,39,39,49,49,49,49]);
      rows.push(['Revenue ($)','=B3*B4','=C3*C4','=D3*D4','=E3*E4','=F3*F4','=G3*G4','=H3*H4','=I3*I4','=J3*J4','=K3*K4','=L3*L4','=M3*M4']);
      return buildXlsx('Projections', rows, ac).then(function(b){ return { n: spec.slug + '-financial-projections.xlsx', blob: b, mime: 'xlsx' }; }); },

    cashflow: function(spec){ var nm=spec.name, ac=P(spec).accent;
      var rows=[[{v:nm+' — Cash Flow Forecast',accent:true},'','','',''],
        [{v:'Item',bold:true},{v:'Q1',bold:true},{v:'Q2',bold:true},{v:'Q3',bold:true},{v:'Q4',bold:true}],
        ['Opening balance',5000,'','',''],
        ['Cash in (sales)',6000,9000,14000,22000],
        ['Cash out (costs)',4000,5000,7000,9000],
        ['Net cash','=B4-B5','=C4-C5','=D4-D5','=E4-E5'],
        ['Closing balance','=B3+B6','=B7+C6','=C7+D6','=D7+E6']];
      return buildXlsx('Cash Flow', rows, ac).then(function(b){ return { n: spec.slug + '-cash-flow-forecast.xlsx', blob: b, mime: 'xlsx' }; }); },

    breakeven: function(spec){ var nm=spec.name, ac=P(spec).accent;
      var rows=[[{v:nm+' — Break-Even Analysis',accent:true},''],
        [{v:'Fixed costs / month ($)',bold:true},2000],
        [{v:'Price per unit ($)',bold:true},29],
        [{v:'Variable cost per unit ($)',bold:true},9],
        [{v:'Contribution margin ($)',bold:true},'=B3-B4'],
        [{v:'Break-even units / month',bold:true},'=B2/B5'],
        [{v:'Break-even revenue ($)',bold:true},'=B6*B3']];
      return buildXlsx('Break-Even', rows, ac).then(function(b){ return { n: spec.slug + '-break-even-analysis.xlsx', blob: b, mime: 'xlsx' }; }); },

    invoice: function(spec){ var nm=spec.name, ac=P(spec).accent;
      var rows=[[{v:nm+' — INVOICE',accent:true},'','',''],
        ['From: '+nm,'','','Invoice #: 0001'],
        [spec.domain||'','','','Date: '],
        ['Bill to:','','','Due: '],
        ['','','',''],
        [{v:'Description',bold:true},{v:'Qty',bold:true},{v:'Unit ($)',bold:true},{v:'Amount ($)',bold:true}],
        ['Service / product 1',1,0,'=B7*C7'],
        ['Service / product 2',1,0,'=B8*C8'],
        ['Service / product 3',1,0,'=B9*C9'],
        ['','','Subtotal','=D7+D8+D9'],
        ['','','Tax','=D10*0.0'],
        ['','',{v:'TOTAL',bold:true},{v:'=D10+D11',bold:true}]];
      return buildXlsx('Invoice', rows, ac).then(function(b){ return { n: spec.slug + '-invoice-template.xlsx', blob: b, mime: 'xlsx' }; }); },

    quote: function(spec){ var nm=spec.name, ac=P(spec).accent;
      var rows=[[{v:nm+' — QUOTE / ESTIMATE',accent:true},'','',''],
        ['From: '+nm,'','','Quote #: Q-0001'],
        [spec.domain||'','','','Valid until: '],
        ['Prepared for:','','',''],
        ['','','',''],
        [{v:'Item',bold:true},{v:'Qty',bold:true},{v:'Unit ($)',bold:true},{v:'Amount ($)',bold:true}],
        ['Scope item 1',1,0,'=B7*C7'],['Scope item 2',1,0,'=B8*C8'],['Scope item 3',1,0,'=B9*C9'],
        ['','',{v:'Estimated total',bold:true},{v:'=D7+D8+D9',bold:true}],
        ['','','',''],
        ['Notes: this estimate is valid for 30 days.','','','']];
      return buildXlsx('Quote', rows, ac).then(function(b){ return { n: spec.slug + '-quote-estimate.xlsx', blob: b, mime: 'xlsx' }; }); },

    pricingGuide: function(spec){ var nm=spec.name;
      return Promise.resolve(buildPdfBlob(nm + ' — Pricing Strategy Guide', brandline(spec), [
        {t:'HOW TO PRICE ' + nm.toUpperCase(),head:true,size:13,gap:8},
        {t:'Pricing is a positioning decision, not a math problem. This guide walks the three levers that set your price and protect your margin.'},
        {rule:true},
        {t:'1 · Value, not cost',bold:true,size:12,gap:4},
        {t:'Anchor to the outcome you create, not the hours you spend. Name the before/after in dollars or time saved.'},
        {t:'2 · Three tiers',bold:true,size:12,gap:4},
        {t:'Offer Good / Better / Best. Most buyers pick the middle — design it as your target. The top tier makes the middle feel safe.'},
        {t:'3 · Protect the floor',bold:true,size:12,gap:4},
        {t:'Set a walk-away price. Discount with conditions (scope, term, testimonial), never for free.'},
        {rule:true},
        {t:'A STARTING LADDER',head:true,size:12,gap:6},
        {t:'Essentials — entry price, one clear outcome.'},
        {t:'Growth — the target tier, most popular, best value.'},
        {t:'Full — premium, done-for-you, priority.'},
        {t:'Review your prices every quarter. Raise them when demand outpaces capacity.'}
      ], P(spec).accent)).then(function(b){ return { n: spec.slug + '-pricing-strategy.pdf', blob: b, mime: 'pdf' }; }); },

    orgChart: function(spec){ var nm=spec.name;
      return Promise.resolve(buildPdfBlob(nm + ' — Organization Chart', brandline(spec), [
        {t:'A SIMPLE STRUCTURE TO GROW INTO',head:true,size:12,gap:8},
        {t:'Founder / CEO — vision, sales, final call.',bold:true},
        {t:'   ├─  Operations — delivery, suppliers, quality.'},
        {t:'   ├─  Marketing — brand, content, growth.'},
        {t:'   └─  Finance & Admin — invoicing, cash, compliance.'},
        {rule:true},
        {t:'As you grow, split each branch: Operations → fulfillment + support; Marketing → content + paid; Finance → bookkeeping + planning.'},
        {t:'Fill the roles you feel most, first. One person can hold several boxes at the start — name them anyway, so hand-off is easy later.'}
      ], P(spec).accent)).then(function(b){ return { n: spec.slug + '-org-chart.pdf', blob: b, mime: 'pdf' }; }); },

    pitchDeck: function(spec){ var nm=spec.name, tg=spec.tagline||'';
      var slides=[
        {title:nm, body:tg + '\n' + (spec.domain||'')},
        {title:'The Problem', body:'The pain your customer feels today — sharp, specific, worth paying to remove.'},
        {title:'The Solution', body:nm + ' — how it removes that pain in one sentence.'},
        {title:'Why Now', body:'The shift that makes this the right moment.'},
        {title:'Market', body:'Who buys, how many, and the beachhead you win first.'},
        {title:'Product', body:'What it is and the one thing it does better than anything else.'},
        {title:'Business Model', body:'How you make money — price, repeat, and margin.'},
        {title:'Go-to-Market', body:'The first three channels and the launch offer.'},
        {title:'Traction & Milestones', body:'What is done, and the next three proof points.'},
        {title:'The Ask', body:'What you want from this room — and what happens next. ' + (spec.domain||'')}
      ];
      return buildPptx(slides, P(spec).accent).then(function(b){ return { n: spec.slug + '-pitch-deck.pptx', blob: b, mime: 'pptx' }; }); },

    /* ===================== CATEGORY E · MARKETING EMAILS (T3) =====================
       Five editable email templates as real DOCX, pre-populated with the brand's
       name, tagline, domain + voice. Editorial tone; bracketed spots are yours to fill. */
    emailWelcome: function(spec){ var nm=spec.name, tg=spec.tagline||'';
      return buildDocx(nm + ' — Welcome Email', [
        {t:'h2',text:'When to send'},
        {t:'p',text:'The moment someone joins your list or makes their first purchase. Send within the hour, while ' + nm + ' is fresh in mind.'},
        {t:'h2',text:'Subject line'},
        {t:'p',text:'Welcome to ' + nm + ' — you’re in.'},
        {t:'h2',text:'Preview text'},
        {t:'p',text:'A quick hello, and what to expect next.'},
        {t:'h2',text:'Body'},
        {t:'p',text:'Hi [First name],'},
        {t:'p',text:'Welcome to ' + nm + '. ' + (tg ? '“' + tg + '” — ' : '') + 'that’s the idea behind everything we make, and you’re now part of it.'},
        {t:'p',text:'Here’s what happens next: over the coming days I’ll share [what you can expect — a first offer, a short story, a useful tip]. No noise, just the things worth your time.'},
        {t:'p',text:'If you ever want to reach me, reply to this email — it comes straight to my inbox.'},
        {t:'h2',text:'Call to action'},
        {t:'p',text:'[Start here →] ' + (spec.domain || '[your link]')},
        {t:'h2',text:'Sign-off'},
        {t:'p',text:'Warmly,'}, {t:'p',text:'[Your name], ' + nm}
      ], P(spec).accent).then(function(b){ return { n: spec.slug + '-email-welcome.docx', blob: b, mime: 'docx' }; }); },

    emailLaunch: function(spec){ var nm=spec.name, tg=spec.tagline||'';
      return buildDocx(nm + ' — Launch Email', [
        {t:'h2',text:'When to send'},
        {t:'p',text:'Launch day. Build to it with one teaser 48 hours before, then send this the moment you open.'},
        {t:'h2',text:'Subject line'},
        {t:'p',text:nm + ' is here.'},
        {t:'h2',text:'Preview text'},
        {t:'p',text:'The wait is over — take a first look.'},
        {t:'h2',text:'Body'},
        {t:'p',text:'Hi [First name],'},
        {t:'p',text:'Today’s the day. ' + nm + ' is officially live.'},
        {t:'p',text:(tg ? '“' + tg + '” ' : '') + '[One or two sentences on what it is and the one problem it solves. Make the reader feel it.]'},
        {t:'bullet',text:'[Highlight one — what they get.]'},
        {t:'bullet',text:'[Highlight two — why it’s different.]'},
        {t:'bullet',text:'[Highlight three — the reason to act now.]'},
        {t:'p',text:'To celebrate the launch, [name your opening offer — a first-week price, a bonus, early access]. It runs until [date].'},
        {t:'h2',text:'Call to action'},
        {t:'p',text:'[See it now →] ' + (spec.domain || '[your link]')},
        {t:'h2',text:'Sign-off'},
        {t:'p',text:'[Your name], ' + nm}
      ], P(spec).accent).then(function(b){ return { n: spec.slug + '-email-launch.docx', blob: b, mime: 'docx' }; }); },

    emailSales: function(spec){ var nm=spec.name;
      return buildDocx(nm + ' — Sales Email', [
        {t:'h2',text:'When to send'},
        {t:'p',text:'When you have a specific offer with a clear deadline. One send, one ask.'},
        {t:'h2',text:'Subject line'},
        {t:'p',text:'[The offer, stated plainly] — until [date].'},
        {t:'h2',text:'Preview text'},
        {t:'p',text:'A reason to act this week, not someday.'},
        {t:'h2',text:'Body'},
        {t:'p',text:'Hi [First name],'},
        {t:'p',text:'[Open with the outcome they want, in their words. Name the before and the after.]'},
        {t:'p',text:'For the next [number] days, ' + nm + ' is offering [the offer, in one line]. Here’s what’s included:'},
        {t:'bullet',text:'[What they get — item one.]'},
        {t:'bullet',text:'[What they get — item two.]'},
        {t:'bullet',text:'[The bonus or guarantee that removes the risk.]'},
        {t:'p',text:'This closes on [date] at [time]. After that, [what changes — price returns, doors close].'},
        {t:'h2',text:'Call to action'},
        {t:'p',text:'[Claim it →] ' + (spec.domain || '[your link]')},
        {t:'h2',text:'Sign-off'},
        {t:'p',text:'[Your name], ' + nm}
      ], P(spec).accent).then(function(b){ return { n: spec.slug + '-email-sales.docx', blob: b, mime: 'docx' }; }); },

    emailFollowup: function(spec){ var nm=spec.name;
      return buildDocx(nm + ' — Follow-Up Email', [
        {t:'h2',text:'When to send'},
        {t:'p',text:'Two to three days after an offer, a demo, or a first reply — when interest was real but the reply never came.'},
        {t:'h2',text:'Subject line'},
        {t:'p',text:'Still thinking it over?'},
        {t:'h2',text:'Preview text'},
        {t:'p',text:'A quick nudge, and an easy way to say yes or no.'},
        {t:'h2',text:'Body'},
        {t:'p',text:'Hi [First name],'},
        {t:'p',text:'I wanted to circle back on [what you last spoke about]. No pressure — I know inboxes fill up fast.'},
        {t:'p',text:'If ' + nm + ' still feels like a fit, here’s the simplest next step: [one clear action].'},
        {t:'p',text:'If the timing isn’t right, just reply “not now” and I’ll follow up later. And if it’s a no, that’s completely fine too — a quick reply helps me more than silence.'},
        {t:'h2',text:'Call to action'},
        {t:'p',text:'[Pick up where we left off →] ' + (spec.domain || '[your link]')},
        {t:'h2',text:'Sign-off'},
        {t:'p',text:'[Your name], ' + nm}
      ], P(spec).accent).then(function(b){ return { n: spec.slug + '-email-follow-up.docx', blob: b, mime: 'docx' }; }); },

    emailReengage: function(spec){ var nm=spec.name, tg=spec.tagline||'';
      return buildDocx(nm + ' — Re-Engagement Email', [
        {t:'h2',text:'When to send'},
        {t:'p',text:'To subscribers who haven’t opened or clicked in 60–90 days. One honest note to win them back — or let them go.'},
        {t:'h2',text:'Subject line'},
        {t:'p',text:'Is this goodbye?'},
        {t:'h2',text:'Preview text'},
        {t:'p',text:'We’ve missed you — and we’d love to stay.'},
        {t:'h2',text:'Body'},
        {t:'p',text:'Hi [First name],'},
        {t:'p',text:'It’s been a while since we last heard from you, and I don’t want to crowd an inbox that isn’t interested. So here’s an honest question: do you still want to hear from ' + nm + '?'},
        {t:'p',text:'If yes, here’s what’s new: [one line on what’s changed or what’s coming]. ' + (tg ? '“' + tg + '” still holds — ' : '') + 'and there’s more worth your time ahead.'},
        {t:'p',text:'If not, no hard feelings — you can step away with the link below and I’ll stop sending. Either way, thank you for having been here.'},
        {t:'h2',text:'Call to action'},
        {t:'p',text:'[Yes, keep me in →] ' + (spec.domain || '[your link]') + '     ·     [No, remove me →] [unsubscribe link]'},
        {t:'h2',text:'Sign-off'},
        {t:'p',text:'[Your name], ' + nm}
      ], P(spec).accent).then(function(b){ return { n: spec.slug + '-email-re-engagement.docx', blob: b, mime: 'docx' }; }); },

    /* ===================== CATEGORY E · SEO STARTER KIT (T3) =====================
       A technical checklist (PDF), a ready-to-paste meta-tag set (HTML), and a
       site-map structure (XML) — every one pre-populated with the brand + domain. */
    seoChecklist: function(spec){ var nm=spec.name, dom=spec.domain||'[your domain]';
      return Promise.resolve(buildPdfBlob(nm + ' — Technical SEO Checklist', brandline(spec), [
        {t:'GET ' + nm.toUpperCase() + ' FOUND',head:true,size:13,gap:8},
        {t:'Work top to bottom. Each item is a one-time setup that keeps paying off. Tick them for ' + dom + ' before you chase rankings with content.'},
        {rule:true},
        {t:'1 · Foundations',bold:true,size:12,gap:4},
        {t:'[ ]  Register ' + dom + ' in Google Search Console and Bing Webmaster Tools.'},
        {t:'[ ]  Install analytics (GA4 or a privacy-first alternative) on every page.'},
        {t:'[ ]  Serve the whole site over HTTPS; force http → https redirects.'},
        {t:'[ ]  Pick one canonical host (www or non-www) and redirect the other.'},
        {t:'2 · Crawlability',bold:true,size:12,gap:4},
        {t:'[ ]  Publish robots.txt and link your sitemap from it.'},
        {t:'[ ]  Submit sitemap.xml (included in this kit) to Search Console.'},
        {t:'[ ]  Add a canonical tag to every page to avoid duplicate content.'},
        {t:'[ ]  Fix broken links and redirect chains; return clean 404s.'},
        {t:'3 · On-page',bold:true,size:12,gap:4},
        {t:'[ ]  One unique <title> (50–60 chars) and meta description (150–160) per page.'},
        {t:'[ ]  Exactly one H1 per page; structure the rest with H2/H3.'},
        {t:'[ ]  Descriptive alt text on every meaningful image.'},
        {t:'[ ]  Human-readable URLs (' + dom + '/services, not /?p=42).'},
        {t:'4 · Performance & mobile',bold:true,size:12,gap:4},
        {t:'[ ]  Pass Core Web Vitals (LCP, CLS, INP) on mobile and desktop.'},
        {t:'[ ]  Compress images; lazy-load below the fold.'},
        {t:'[ ]  Confirm the site is responsive and tap-friendly on phones.'},
        {t:'5 · Trust & structure',bold:true,size:12,gap:4},
        {t:'[ ]  Add Organization + Website schema (JSON-LD) with your name and logo.'},
        {t:'[ ]  Add LocalBusiness schema if you serve a place; claim your map profile.'},
        {t:'[ ]  Paste the Open Graph + Twitter tags (included) so shares look sharp.'},
        {rule:true},
        {t:'Re-check this list each quarter. Search rules shift; the fundamentals above rarely do.'}
      ], P(spec).accent)).then(function(b){ return { n: spec.slug + '-seo-checklist.pdf', blob: b, mime: 'pdf' }; }); },

    metaTags: function(spec){ var nm=spec.name, tg=spec.tagline||'', dom=spec.domain||'example.com';
      var url = /^https?:/.test(dom) ? dom : ('https://' + dom);
      var title = nm + (tg ? ' — ' + tg : '');
      var desc = (tg ? tg + '. ' : '') + nm + ' — [write 150–160 characters describing what you offer and who it’s for].';
      var e = xml;
      var out = '<!-- ' + nm + ' — paste inside <head>. Replace the bracketed notes. -->\n'
        + '<!-- Primary meta tags -->\n'
        + '<title>' + e(title) + '</title>\n'
        + '<meta name="title" content="' + e(title) + '">\n'
        + '<meta name="description" content="' + e(desc) + '">\n'
        + '<link rel="canonical" href="' + e(url) + '/">\n'
        + '<meta name="robots" content="index, follow">\n\n'
        + '<!-- Open Graph / Facebook -->\n'
        + '<meta property="og:type" content="website">\n'
        + '<meta property="og:url" content="' + e(url) + '/">\n'
        + '<meta property="og:title" content="' + e(title) + '">\n'
        + '<meta property="og:description" content="' + e(desc) + '">\n'
        + '<meta property="og:image" content="' + e(url) + '/og-image.png">\n'
        + '<meta property="og:site_name" content="' + e(nm) + '">\n\n'
        + '<!-- Twitter / X -->\n'
        + '<meta name="twitter:card" content="summary_large_image">\n'
        + '<meta name="twitter:url" content="' + e(url) + '/">\n'
        + '<meta name="twitter:title" content="' + e(title) + '">\n'
        + '<meta name="twitter:description" content="' + e(desc) + '">\n'
        + '<meta name="twitter:image" content="' + e(url) + '/og-image.png">\n\n'
        + '<!-- Structured data (Organization) -->\n'
        + '<script type="application/ld+json">\n'
        + '{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "' + e(nm) + '",\n'
        + '  "url": "' + e(url) + '/",\n  "slogan": "' + e(tg) + '",\n  "logo": "' + e(url) + '/logo.png"\n}\n'
        + '</script>\n';
      return Promise.resolve({ n: spec.slug + '-meta-tags.html', blob: new Blob([out], { type: 'text/html' }), mime: 'html' }); },

    sitemap: function(spec){ var dom=spec.domain||'example.com';
      var url = (/^https?:/.test(dom) ? dom : ('https://' + dom)).replace(/\/$/,'');
      var pages = [ ['/', '1.0', 'weekly'], ['/about', '0.8', 'monthly'], ['/services', '0.9', 'monthly'],
        ['/work', '0.7', 'monthly'], ['/blog', '0.8', 'weekly'], ['/contact', '0.6', 'yearly'] ];
      var body = pages.map(function(p){
        return '  <url>\n    <loc>' + xml(url + p[0]) + '</loc>\n    <changefreq>' + p[2] + '</changefreq>\n    <priority>' + p[1] + '</priority>\n  </url>';
      }).join('\n');
      var out = '<?xml version="1.0" encoding="UTF-8"?>\n'
        + '<!-- ' + xml(spec.name) + ' sitemap — edit the paths to match your pages, then submit to Search Console. -->\n'
        + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + '\n</urlset>\n';
      return Promise.resolve({ n: spec.slug + '-sitemap.xml', blob: new Blob([out], { type: 'application/xml' }), mime: 'xml' }); },

    /* ===================== CATEGORY L · SALES ENABLEMENT (T3) =====================
       Closing & conversion engine — a prospect-facing sales deck, a ready-to-send
       commercial proposal, and an objection-handling playbook. Reuses the proven
       document engine; brand-populated; editorial Ink/Paper/Accent throughout. */
    salesDeck: function(spec){ var nm=spec.name, tg=spec.tagline||'', ind=industry(spec);
      var slides=[
        {title:nm, body:(tg?tg+'\n':'') + 'A proposal for [Client name]  ·  ' + (spec.domain||'')},
        {title:'The challenge', body:'[Name the problem your prospect is living with today' + (ind?', as a '+ind+' owner would feel it':'') + '. Make it specific and true.]'},
        {title:'What it’s costing you', body:'[Put the pain in numbers — time lost, revenue left on the table, customers who don’t return. This is why doing nothing is the expensive option.]'},
        {title:'A better way', body:nm + ' — [one clear sentence on how you remove that pain]. ' + (tg?'“'+tg+'”':'')},
        {title:'How it works', body:'A simple path: 1) [first step]  →  2) [second step]  →  3) [the result they can see and feel].'},
        {title:'The proof', body:'[Drop your strongest evidence here — a result, a before/after, a client’s words. One vivid proof beats five vague claims.]'},
        {title:'What you get', body:'[List the concrete deliverables. Be generous and specific — the reader should picture exactly what lands on their desk.]'},
        {title:'Your investment', body:'Essentials [$—]  ·  Growth [$—, most popular]  ·  Full [$—]. [Anchor to the value, not the hours. Make the middle tier the easy yes.]'},
        {title:'Why ' + nm, body:'[Three reasons you’re the right choice — the thing you do that no one else does, the risk you remove, the standard you hold.]'},
        {title:'Next steps', body:'Ready when you are. Reply to confirm and we’ll [the immediate first action]. ' + (spec.domain||'')}
      ];
      return buildPptx(slides, P(spec).accent).then(function(b){ return { n: spec.slug + '-sales-presentation.pptx', blob: b, mime: 'pptx' }; }); },

    proposal: function(spec){ var nm=spec.name, tg=spec.tagline||'', ind=industry(spec);
      return buildDocx(nm + ' — Commercial Proposal', [
        {t:'p',text:'Prepared for: [Client name]        Date: [   ]        Valid for 30 days'},
        {t:'p',text:'Prepared by: ' + nm + (spec.domain ? '  ·  ' + spec.domain : '')},
        {t:'h2',text:'1 · Overview'},
        {t:'p',text:'Thank you for the opportunity. This proposal outlines how ' + nm + ' will help [Client name] [reach the outcome they want]. ' + (tg?'Everything we do is guided by one idea: “'+tg+'.”':'')},
        {t:'h2',text:'2 · Understanding your needs'},
        {t:'p',text:'[Restate the client’s goals and challenges in your own words' + (ind?', in the language of a '+ind+' business':'') + '. When a client feels understood, half the sale is already made.]'},
        {t:'bullet',text:'Goal: [what success looks like for them].'},
        {t:'bullet',text:'Challenge: [the obstacle in the way today].'},
        {t:'bullet',text:'Priority: [what matters most, first].'},
        {t:'h2',text:'3 · Scope of work'},
        {t:'p',text:'The engagement includes the following deliverables:'},
        {t:'bullet',text:'[Deliverable one — what it is and what it produces.]'},
        {t:'bullet',text:'[Deliverable two.]'},
        {t:'bullet',text:'[Deliverable three.]'},
        {t:'p',text:'Out of scope: [name what is not included, so expectations are clear from day one].'},
        {t:'h2',text:'4 · Timeline'},
        {t:'bullet',text:'Week 1 — Kickoff and discovery.'},
        {t:'bullet',text:'Weeks 2–4 — [core delivery].'},
        {t:'bullet',text:'Week 5 — Review, handoff, and launch.'},
        {t:'h2',text:'5 · Investment'},
        {t:'p',text:'Choose the level that fits:'},
        {t:'bullet',text:'Essentials — [$—]. [The entry option and one clear outcome.]'},
        {t:'bullet',text:'Growth — [$—]. Most popular. [The recommended scope and best value.]'},
        {t:'bullet',text:'Full — [$—]. [The done-for-you option, priority delivery.]'},
        {t:'p',text:'Payment: [e.g. 50% to begin, 50% on delivery]. All figures in [currency].'},
        {t:'h2',text:'6 · Next steps'},
        {t:'p',text:'To proceed, reply to confirm the tier you’d like and we’ll send a start date within one business day. Questions are welcome any time — reach me at [email].'},
        {t:'p',text:'With thanks,  [Your name] — ' + nm}
      ], P(spec).accent).then(function(b){ return { n: spec.slug + '-proposal-template.docx', blob: b, mime: 'docx' }; }); },

    salesPlaybook: function(spec){ var nm=spec.name, ind=industry(spec);
      return buildDocx(nm + ' — Sales Playbook', [
        {t:'h2',text:'How to use this'},
        {t:'p',text:'These are your rebuttals and answers for the moments a deal wobbles. Read them once, make them yours, and keep them close on every call. Confidence comes from having already thought it through.'},
        {t:'h2',text:'Discovery questions (ask before you pitch)'},
        {t:'bullet',text:'“What made you look into this now?”'},
        {t:'bullet',text:'“If we solved [problem], what would change for you?”'},
        {t:'bullet',text:'“Who else is involved in the decision?”'},
        {t:'bullet',text:'“What would make this an easy yes?”'},
        {t:'h2',text:'Objection — “It’s too expensive.”'},
        {t:'p',text:'“I understand. Most clients weigh it against the cost of the problem staying unsolved. If ' + nm + ' returns that in [timeframe], is the price the real question, or is it whether it’ll work?”'},
        {t:'h2',text:'Objection — “I need to think about it.”'},
        {t:'p',text:'“Totally fair — it’s a real decision. What’s the one thing you’re still weighing? Let’s look at it together now, while I’m here to answer it.”'},
        {t:'h2',text:'Objection — “Now isn’t a good time.”'},
        {t:'p',text:'“I hear that a lot, and often ‘later’ just moves the cost forward. What would need to be true for the timing to work? We can plan around it.”'},
        {t:'h2',text:'Objection — “We already have a solution.”'},
        {t:'p',text:'“Good — that means you know the value. Where does your current setup fall short? If ' + nm + ' closes that gap, it’s worth a side-by-side look.”'},
        {t:'h2',text:'Objection — “How do I know it’ll work?”'},
        {t:'p',text:'“The fairest answer is proof: [your result or example]. And we start with [a small first step] so you see it working before you go all in.”'},
        {t:'h2',text:'Objection — “I need to check with someone.”'},
        {t:'p',text:'“Makes sense. What will they want to know? Let’s get you everything to make that conversation easy — I’ll put it in one page you can forward.”'},
        {t:'h2',text:'Frequently asked' + (ind?' (' + ind + ')':'')},
        {t:'bullet',text:'“How soon can we start?” — [your typical lead time].'},
        {t:'bullet',text:'“What do you need from me?” — [the short list].'},
        {t:'bullet',text:'“What if it’s not a fit?” — [your simple, fair answer].'},
        {t:'bullet',text:'“Can you handle [industry-specific need]?” — [your honest scope].'},
        {t:'h2',text:'Closing lines that work'},
        {t:'bullet',text:'“Shall we get you started this week?”'},
        {t:'bullet',text:'“Which tier feels right — Growth, or Full?” (assume the yes).'},
        {t:'bullet',text:'“I can hold [date] for you. Want me to?”'}
      ], P(spec).accent).then(function(b){ return { n: spec.slug + '-sales-playbook.docx', blob: b, mime: 'docx' }; }); },

    /* ===================== CATEGORY M · CUSTOMER & RETENTION (T3) =====================
       Keep the customers you win — an onboarding/success protocol, a churn-prevention
       pulse loop, and a loyalty/referral engine. Reuses the document engine; brand-populated. */
    onboardingProtocol: function(spec){ var nm=spec.name, ind=industry(spec);
      return buildDocx(nm + ' — Client Onboarding & Success Protocol', [
        {t:'h2',text:'Purpose'},
        {t:'p',text:'The first 30 days decide whether a customer stays for years. This protocol makes ' + nm + '’s welcome feel deliberate' + (ind?', the way a great '+ind+' should':'') + ' — so every new client reaches their first win fast.'},
        {t:'h2',text:'Day 0 — The welcome'},
        {t:'bullet',text:'Send the welcome email within one hour of sign-up (template in your Marketing kit).'},
        {t:'bullet',text:'Confirm what they bought, what happens next, and who their point of contact is.'},
        {t:'bullet',text:'Set the first-value goal: “By [date], you’ll have [the first tangible result].”'},
        {t:'h2',text:'Week 1 — Kickoff'},
        {t:'bullet',text:'Kickoff call or setup session: confirm goals, timeline, and access.'},
        {t:'bullet',text:'Deliver a quick early win — something they can see working in the first few days.'},
        {t:'bullet',text:'Share the success plan: milestones for days 7, 14, and 30.'},
        {t:'h2',text:'Weeks 2–3 — Momentum'},
        {t:'bullet',text:'Check in on progress; remove any blocker before it festers.'},
        {t:'bullet',text:'Introduce one feature or service they haven’t used yet.'},
        {t:'bullet',text:'Ask: “Is this tracking to what you hoped?” — and act on the answer.'},
        {t:'h2',text:'Day 30 — The review'},
        {t:'bullet',text:'Recap what was achieved against the first-value goal.'},
        {t:'bullet',text:'Agree the next 60-day plan.'},
        {t:'bullet',text:'If they’re thrilled, this is the moment to invite a review or referral.'},
        {t:'h2',text:'Service standards (your handoff SLA)'},
        {t:'p',text:'Publish these so nothing slips between hands:'},
        {t:'bullet',text:'First response: within [e.g. 1 business day].'},
        {t:'bullet',text:'Resolution target: [e.g. 3 business days] for standard requests.'},
        {t:'bullet',text:'Owner: [who owns the account] · Backup: [who covers when they’re out].'},
        {t:'bullet',text:'Escalation: [how an urgent issue reaches a decision-maker].'},
        {t:'h2',text:'Kickoff checklist'},
        {t:'bullet',text:'[ ] Welcome sent   [ ] Contact confirmed   [ ] Goals agreed'},
        {t:'bullet',text:'[ ] Access set up   [ ] Early win delivered   [ ] 30-day review booked'}
      ], P(spec).accent).then(function(b){ return { n: spec.slug + '-onboarding-success-protocol.docx', blob: b, mime: 'docx' }; }); },

    churnPulse: function(spec){ var nm=spec.name;
      return buildDocx(nm + ' — Churn-Prevention Feedback Loop', [
        {t:'h2',text:'How to use this'},
        {t:'p',text:'Unhappy customers rarely complain — they just leave. This pulse check catches them first. Send it on a regular cadence (every 30–60 days, or after a key milestone) and act on the reds within 48 hours.'},
        {t:'h2',text:'The one number — NPS'},
        {t:'p',text:'“How likely are you to recommend ' + nm + ' to a friend or colleague?” (0 = not at all, 10 = extremely likely.)'},
        {t:'bullet',text:'9–10 Promoters — delighted. Route to the referral program.'},
        {t:'bullet',text:'7–8 Passives — satisfied, not loyal. One good experience wins them.'},
        {t:'bullet',text:'0–6 Detractors — at risk. Personal outreach within 48 hours.'},
        {t:'h2',text:'The pulse questions (keep it under a minute)'},
        {t:'bullet',text:'“What’s working best for you right now?”'},
        {t:'bullet',text:'“What’s one thing we could do better?”'},
        {t:'bullet',text:'“Are you getting the result you signed up for?” (Yes / Partly / No)'},
        {t:'bullet',text:'“How easy is it to work with us?” (1–5)'},
        {t:'bullet',text:'“Anything you’re unsure about or thinking of changing?”'},
        {t:'h2',text:'Red-flag triggers (act now)'},
        {t:'bullet',text:'Score drops vs last pulse · usage falls off · “No” to getting results.'},
        {t:'bullet',text:'Silence — no response two pulses running is itself a signal.'},
        {t:'bullet',text:'A support issue that took too long to resolve.'},
        {t:'h2',text:'The save play'},
        {t:'bullet',text:'Reach out personally — a call beats an email. Lead with “I saw your note and I want to make this right.”'},
        {t:'bullet',text:'Listen fully before pitching a fix. Name the problem back to them.'},
        {t:'bullet',text:'Agree one concrete action and a date. Follow up when you said you would.'},
        {t:'bullet',text:'Close the loop: tell them what changed because of their feedback.'},
        {t:'h2',text:'Track it'},
        {t:'bullet',text:'Log every score, the reason, and the action taken.'},
        {t:'bullet',text:'Watch the trend, not just the snapshot — direction matters more than any one number.'}
      ], P(spec).accent).then(function(b){ return { n: spec.slug + '-churn-prevention-loop.docx', blob: b, mime: 'docx' }; }); },

    loyaltyReferral: function(spec){ var nm=spec.name;
      return buildDocx(nm + ' — Loyalty & Referral Engine', [
        {t:'h2',text:'The idea'},
        {t:'p',text:'Your happiest customers are your best sales team — if you make it easy and rewarding to send friends your way. This document sets up a referral program for ' + nm + ' that runs on its own.'},
        {t:'h2',text:'The offer (make it two-sided)'},
        {t:'p',text:'Reward both people — the giver and the friend. Two-sided offers convert far better than one.'},
        {t:'bullet',text:'The friend gets: [e.g. their first month at a special rate / a welcome bonus].'},
        {t:'bullet',text:'The referrer gets: [e.g. account credit / a thank-you gift] for each friend who joins.'},
        {t:'bullet',text:'Keep it simple to explain in one sentence.'},
        {t:'h2',text:'How it works'},
        {t:'bullet',text:'1 · The customer shares their personal link or code.'},
        {t:'bullet',text:'2 · The friend uses it and receives their welcome offer.'},
        {t:'bullet',text:'3 · Once the friend’s first [purchase / month] completes, the referrer’s reward unlocks.'},
        {t:'h2',text:'The loyalty ladder'},
        {t:'p',text:'Reward repeat customers, not just new ones. A simple three-rung ladder:'},
        {t:'bullet',text:'Regular — [perk after their first repeat purchase].'},
        {t:'bullet',text:'Insider — [bigger perk + early access] after [milestone].'},
        {t:'bullet',text:'Champion — [your best perk] for your top referrers and longest-standing clients.'},
        {t:'h2',text:'When to ask (timing is everything)'},
        {t:'bullet',text:'Right after a win — a great result, a 5-star review, a “thank you”.'},
        {t:'bullet',text:'At the 30-day review, when a Promoter scores you 9–10.'},
        {t:'bullet',text:'Never during an open problem — solve first, ask later.'},
        {t:'h2',text:'The ask (scripts)'},
        {t:'bullet',text:'“So glad this is working for you. Who else do you know who’d want the same result? I’ll take great care of them.”'},
        {t:'bullet',text:'“If you know one person this could help, here’s your link — and there’s a little thank-you in it for you both.”'},
        {t:'h2',text:'Track it'},
        {t:'bullet',text:'Record referrals sent, joined, and rewards paid.'},
        {t:'bullet',text:'Watch your referral rate — aim to lift it a little every quarter.'}
      ], P(spec).accent).then(function(b){ return { n: spec.slug + '-loyalty-referral-engine.docx', blob: b, mime: 'docx' }; }); },

    /* ===================== CATEGORY N · PEOPLE & TEAM (T3) =====================
       Hire and grow a team — a reusable job description, a culture/DNA handbook, and a
       performance-review + 1-on-1 template. Reuses the document engine; brand-populated.
       Deliberately cultural/administrative — never employment policy or legal terms. */
    jobDescription: function(spec){ var nm=spec.name, tg=spec.tagline||'', ind=industry(spec);
      return buildDocx(nm + ' — Job Description Template', [
        {t:'h2',text:'How to use this'},
        {t:'p',text:'A reusable template for any role at ' + nm + '. Fill the brackets, then tune the depth to the seniority: a Junior role leans on “what you bring,” a Senior or Lead role leans on ownership and outcomes. Remove the level notes before you post it.'},
        {t:'h2',text:'The header'},
        {t:'bullet',text:'Role title: [e.g. Marketing Coordinator]'},
        {t:'bullet',text:'Department: [e.g. Marketing / Operations / Sales]'},
        {t:'bullet',text:'Level: [Junior · Mid · Senior · Lead]'},
        {t:'bullet',text:'Reports to: [manager title]        Location: [on-site / hybrid / remote]'},
        {t:'h2',text:'About ' + nm},
        {t:'p',text:nm + (tg ? ' — “' + tg + '.” ' : ' ') + '[Two sentences on what you do' + (ind?', as a '+ind+' business':'') + ' and why the work matters. This is what makes a great candidate lean in.]'},
        {t:'h2',text:'The role'},
        {t:'p',text:'[One short paragraph: what this person owns, and the outcome they’re here to create.]'},
        {t:'h2',text:'What you’ll do'},
        {t:'bullet',text:'[Core responsibility one — start with a verb.]'},
        {t:'bullet',text:'[Core responsibility two.]'},
        {t:'bullet',text:'[Core responsibility three.]'},
        {t:'bullet',text:'[Stretch responsibility for higher levels — scope up for Senior/Lead.]'},
        {t:'h2',text:'What you bring'},
        {t:'bullet',text:'Must have: [the non-negotiables — skills or experience.]'},
        {t:'bullet',text:'Nice to have: [the bonuses that make you smile.]'},
        {t:'bullet',text:'How you work: [the traits that fit our culture — see our handbook.]'},
        {t:'h2',text:'Level guide (remove before posting)'},
        {t:'bullet',text:'Junior — learns fast, executes with guidance. Emphasize potential.'},
        {t:'bullet',text:'Mid — owns their lane independently. Emphasize track record.'},
        {t:'bullet',text:'Senior — sets the standard, lifts others. Emphasize judgment.'},
        {t:'bullet',text:'Lead — owns outcomes and people. Emphasize vision and trust.'},
        {t:'h2',text:'How to apply'},
        {t:'p',text:'[Tell them exactly what to send and to whom — ' + (spec.domain?'careers@' + String(spec.domain).replace(/^https?:\/\//,'') :'[email]') + ' — and what happens next. A clear, warm process is itself a signal of a good place to work.]'}
      ], P(spec).accent).then(function(b){ return { n: spec.slug + '-job-description.docx', blob: b, mime: 'docx' }; }); },

    teamHandbook: function(spec){ var nm=spec.name, tg=spec.tagline||'';
      return buildDocx(nm + ' — Team Handbook & Culture Guide', [
        {t:'p',text:'A living guide to how we work and what we stand for. It’s our culture in writing — not a formal policy or contract. Keep it current as we grow.'},
        {t:'h2',text:'Welcome'},
        {t:'p',text:'Welcome to ' + nm + '. This is the “company DNA” — the shared understanding that lets a team move fast without stepping on each other. Read it, question it, help it get better.'},
        {t:'h2',text:'Our mission'},
        {t:'p',text:(tg ? '“' + tg + '.” ' : '') + '[Say, in one clear sentence, the change ' + nm + ' exists to make — and who it’s for.]'},
        {t:'h2',text:'What we believe (our values)'},
        {t:'bullet',text:'[Value one] — [what it looks like in daily behavior, not just a word on a wall.]'},
        {t:'bullet',text:'[Value two] — [the behavior.]'},
        {t:'bullet',text:'[Value three] — [the behavior.]'},
        {t:'h2',text:'How we work'},
        {t:'bullet',text:'Communication: [where we talk, how fast we reply, when to call vs. write.]'},
        {t:'bullet',text:'Meetings: [we keep them few and useful — agenda in, decision out.]'},
        {t:'bullet',text:'Decisions: [how we decide, and who has the final call when it’s close.]'},
        {t:'bullet',text:'Feedback: [we give it kindly and directly, in the moment, both ways.]'},
        {t:'h2',text:'What great looks like here'},
        {t:'p',text:'[Describe the standard — the quality of work, the ownership, the care for the customer — that earns trust on this team.]'},
        {t:'h2',text:'How we treat each other'},
        {t:'p',text:'Respect, candor, and generosity — assume good intent, share what you know, and make it safe to be wrong. We disagree on ideas without making it personal.'},
        {t:'h2',text:'How we grow'},
        {t:'p',text:'[How people develop here — 1-on-1s, goals, learning time, the path from good to great. Growth is a shared responsibility between you and your manager.]'}
      ], P(spec).accent).then(function(b){ return { n: spec.slug + '-team-handbook.docx', blob: b, mime: 'docx' }; }); },

    performanceReview: function(spec){ var nm=spec.name;
      return buildDocx(nm + ' — Performance Review & 1-on-1 Template', [
        {t:'h2',text:'How to use this'},
        {t:'p',text:'Two tools in one: a light weekly 1-on-1, and a fuller periodic review. Use the same voice ' + nm + ' uses everywhere — warm, specific, and honest. Feedback lands when it’s kind and concrete, not vague or harsh.'},
        {t:'p',text:'Team member: [name]        Manager: [name]        Date: [   ]'},
        {t:'h2',text:'Part 1 — The weekly 1-on-1 (15–30 min)'},
        {t:'bullet',text:'Wins since last time: [what went well — start here, always].'},
        {t:'bullet',text:'Blockers: [what’s in the way, and how I can help remove it].'},
        {t:'bullet',text:'Priorities for next week: [the two or three things that matter most].'},
        {t:'bullet',text:'Growth: [one thing you’re working on getting better at].'},
        {t:'bullet',text:'Feedback both ways: [what would make me a better manager for you?].'},
        {t:'h2',text:'Part 2 — The performance review'},
        {t:'p',text:'Review period: [from] to [to].'},
        {t:'h2',text:'Goals set last period — and how they went'},
        {t:'bullet',text:'[Goal one] — [result: met / partly / missed, and the story behind it].'},
        {t:'bullet',text:'[Goal two] — [result].'},
        {t:'bullet',text:'[Goal three] — [result].'},
        {t:'h2',text:'Strengths (be specific)'},
        {t:'p',text:'[Name real moments where this person shone. Specifics prove you were paying attention — and they’re what people remember.]'},
        {t:'h2',text:'Where to grow (kind and forward-looking)'},
        {t:'p',text:'[Frame growth as the next chapter, not a verdict. One or two focused areas beat a long list. Pair each with support.]'},
        {t:'h2',text:'Goals for next period'},
        {t:'bullet',text:'[Goal one — clear, measurable, owned.]'},
        {t:'bullet',text:'[Goal two.]'},
        {t:'bullet',text:'[Goal three.]'},
        {t:'h2',text:'Your voice'},
        {t:'p',text:'[Space for the team member: how do you feel about your work, your role, and what you need to do your best? The best reviews are a conversation, not a verdict.]'}
      ], P(spec).accent).then(function(b){ return { n: spec.slug + '-performance-review.docx', blob: b, mime: 'docx' }; }); }
  };

  window.AGENCY_DOCS = {
    buildDocx: buildDocx, buildXlsx: buildXlsx, buildPptx: buildPptx, buildPdfBlob: buildPdfBlob,
    GEN: GEN
  };
})();
