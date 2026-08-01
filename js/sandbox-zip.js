// File: js/sandbox-zip.js | Date: 2026-07-15 | Time: 19:35 UTC | Purpose: tiny in-browser ZIP builder (store method) so the customer can choose ONE zip instead of 35 separate downloads — fully self-contained, no libraries, no network | Author: Sandbox_Build_v1
(function(){
  'use strict';
  var CRC_TABLE = (function(){
    var t = [], c;
    for (var n = 0; n < 256; n++){
      c = n;
      for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(bytes){
    var c = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  function strBytes(s){ return new TextEncoder().encode(s); }
  function u16(v){ return [v & 255, (v >> 8) & 255]; }
  function u32(v){ return [v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >>> 24) & 255]; }

  /* files: [{name: 'a.svg', data: '<svg…>'}] → Blob (application/zip) */
  function buildZip(files){
    var chunks = [], central = [], offset = 0;
    files.forEach(function(f){
      var nameB = strBytes(f.name);
      var dataB = (f.data instanceof Uint8Array) ? f.data : strBytes(String(f.data));
      var crc = crc32(dataB);
      var local = [].concat(
        u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(0), u16(0),
        u32(crc), u32(dataB.length), u32(dataB.length),
        u16(nameB.length), u16(0));
      chunks.push(new Uint8Array(local), nameB, dataB);
      var cent = [].concat(
        u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0),
        u32(crc), u32(dataB.length), u32(dataB.length),
        u16(nameB.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset));
      central.push(new Uint8Array(cent), nameB);
      offset += local.length + nameB.length + dataB.length;
    });
    var centralSize = central.reduce(function(a, c){ return a + c.length; }, 0);
    var eocd = [].concat(
      u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length),
      u32(centralSize), u32(offset), u16(0));
    var all = chunks.concat(central, [new Uint8Array(eocd)]);
    return new Blob(all, { type: 'application/zip' });
  }
  window.SBX_ZIP = { build: buildZip };
})();
