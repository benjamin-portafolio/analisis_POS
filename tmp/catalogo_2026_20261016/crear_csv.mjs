import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { Workbook } from '@oai/artifact-tool';

const root='/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis ';
const scratch=path.join(root,'tmp/catalogo_2026_20261016');
const output=path.join(root,'outputs/catalogo_2026_20261018');
const records=JSON.parse(await fs.readFile(path.join(scratch,'datos_reconciliados.json'),'utf8'));
const headers=['categoria','nombre_articulo','tipo_venta','unidad_venta','nombre_variante','precio_venta','precio_coste','seguimiento_existencias','existencias','codigo_barras'];
const ready=records.filter(r=>r.price!==null);
const pending=records.filter(r=>r.price===null);
assert.equal(records.length,85);
assert.equal(ready.length,70);
assert.equal(pending.length,15);
assert.equal(ready.filter(r=>r.barcode).length,59);
assert.equal(new Set(records.map(r=>r.name.normalize('NFKC').toLowerCase())).size,85);
assert.equal(new Set(records.filter(r=>r.barcode).map(r=>r.barcode)).size,60);
assert(records.every(r=>r.name.length<=160 && !/[\r\n]/.test(r.name)));
assert(ready.every(r=>r.price>0 && r.price_url));
assert(records.every(r=>!r.barcode || /^\d{12,13}$/.test(r.barcode)));

const wb=Workbook.create();
const load=wb.worksheets.add('Carga masiva');
const todo=wb.worksheets.add('Pendientes');
const sources=wb.worksheets.add('Revisión y fuentes');
const row=r=>[null,r.name,'unidad',null,null,r.price,null,'no',null,r.barcode||null];
load.getRange(`A1:J${ready.length+1}`).values=[headers,...ready.map(row)];
todo.getRange(`A1:J${pending.length+1}`).values=[headers,...pending.map(row)];
const sourceHeaders=['numero','pagina_pdf','clave_catalogo','nombre_articulo','presentacion','precio_referencia_mxn','codigo_barras','estado','fuente_precio','fuente_codigo_barras','fecha_consulta','observaciones','precio_paquete_referencia_mxn','piezas_en_paquete_referencia','precio_por_pieza_derivado_mxn','fuente_paquete_referencia'];
sources.getRange(`A1:P${records.length+1}`).values=[sourceHeaders,...records.map(r=>[
  r.id,r.page,r.internal_code,r.name,r.pack,r.price,r.barcode||null,r.status,
  r.price_url||null,r.barcode_url||null,r.consulted||null,
  [r.notes,r.pending_reason].filter(Boolean).join(' ')||null,
  r.reference_pack_price,r.reference_pack_units,r.reference_unit_price,r.reference_pack_url||null,
])];

for(const [sheet,rows,cols] of [[load,ready.length+1,10],[todo,pending.length+1,10],[sources,records.length+1,16]]) {
  sheet.showGridLines=false;
  const range=sheet.getRangeByIndexes(0,0,rows,cols);
  range.format.font={name:'Arial',size:10,color:'#243447'};
  range.format.rowHeight=28;
  range.format.verticalAlignment='center';
  const head=sheet.getRangeByIndexes(0,0,1,cols);
  head.format.fill='#19446B';
  head.format.font={name:'Arial',size:10,bold:true,color:'#FFFFFF'};
  head.format.wrapText=true;
  head.format.horizontalAlignment='center';
  head.format.rowHeight=48;
  sheet.freezePanes.freezeRows(1);
}
for(const sheet of [load,todo]) {
  [16,72,16,18,20,18,18,27,18,23].forEach((w,i)=>sheet.getRangeByIndexes(0,i,sheet.getUsedRange().rowCount,1).format.columnWidth=w);
  sheet.getRange(`F2:G${sheet.getUsedRange().rowCount}`).setNumberFormat('0.00');
  sheet.getRange(`J2:J${sheet.getUsedRange().rowCount}`).setNumberFormat('@');
}
todo.getRange(`F2:F${pending.length+1}`).format.fill='#FFF2CC';
load.tabColor='#19446B';
todo.tabColor='#B78221';
sources.tabColor='#7791A5';
const widths=[10,13,19,73,18,23,24,38,85,85,20,125,26,23,26,85];
widths.forEach((w,i)=>sources.getRangeByIndexes(0,i,records.length+1,1).format.columnWidth=w);
sources.getRange(`F2:F${records.length+1}`).setNumberFormat('0.00');
sources.getRange(`G2:G${records.length+1}`).setNumberFormat('@');
sources.getRange(`M2:M${records.length+1}`).setNumberFormat('0.00');
sources.getRange(`O2:O${records.length+1}`).setNumberFormat('0.00');
wb.recalculate();

const actual=load.getRange(`A2:J${ready.length+1}`).values;
for(let i=0;i<ready.length;i++) {
  assert.equal(actual[i][1],ready[i].name);
  assert.equal(actual[i][5],ready[i].price);
  assert.equal(actual[i][9]??'',ready[i].barcode);
  assert.equal(actual[i][6]??null,null);
}
const inspection=await wb.inspect({kind:'table',range:'Carga masiva!A1:J7',include:'values,formulas',tableMaxRows:7,tableMaxCols:10,maxChars:3500});
await fs.writeFile(path.join(scratch,'inspeccion.ndjson'),inspection.ndjson);
const scan=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:20},maxChars:1500});
assert(!/"cell"|"address"/.test(scan.ndjson),scan.ndjson);
await fs.writeFile(path.join(scratch,'verificacion.ndjson'),scan.ndjson);

function field(v,i,moneyColumns) {
  if(v===null || v===undefined || v==='')return '';
  const s=moneyColumns.has(i)?Number(v).toFixed(2):String(v);
  return /[,"\r\n]/.test(s)?'"'+s.replaceAll('"','""')+'"':s;
}
await fs.mkdir(output,{recursive:true});
for(const [sheet,file,rows,cols,moneyColumns] of [
  [load,'catalogo_2026_carga_masiva.csv',ready.length+1,10,new Set([5,6])],
  [todo,'catalogo_2026_pendientes.csv',pending.length+1,10,new Set([5,6])],
  [sources,'catalogo_2026_revision_y_fuentes.csv',records.length+1,16,new Set([5,12,14])],
]) {
  const matrix=sheet.getRangeByIndexes(0,0,rows,cols).values;
  const csv='\uFEFF'+matrix.map((r,ri)=>r.map((v,i)=>field(v,i,ri?moneyColumns:new Set())).join(',')).join('\r\n')+'\r\n';
  await fs.writeFile(path.join(output,file),csv,'utf8');
}
for(const [sheetName,range,file] of [
  ['Carga masiva','A1:J9','carga_preview.png'],
  ['Pendientes','A1:J8','pendientes_preview.png'],
  ['Revisión y fuentes','A1:H9','fuentes_preview.png'],
]) {
  const png=await wb.render({sheetName,range,scale:1.2,format:'png'});
  await fs.writeFile(path.join(scratch,file),new Uint8Array(await png.arrayBuffer()));
}
await fs.writeFile(path.join(scratch,'resumen.json'),JSON.stringify({total:records.length,ready:ready.length,pending:pending.length,readyBarcodes:ready.filter(r=>r.barcode).length,allBarcodes:records.filter(r=>r.barcode).length,files:await fs.readdir(output)},null,2));
console.log(JSON.stringify({total:records.length,ready:ready.length,pending:pending.length,barcodes:ready.filter(r=>r.barcode).length,output}));
