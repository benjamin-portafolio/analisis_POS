import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { Workbook, FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const root = '/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis ';
const scratch = path.join(root,'tmp/catalogo3_20261013');
const output = path.join(root,'outputs/catalogo3_20261013');
const workbookPath = path.join(output,'catalogo3_revision.xlsx');
const csvPath = path.join(output,'catalogo3_carga_masiva.csv');
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
const sheet = workbook.worksheets.getItem('Carga masiva');
const review = workbook.worksheets.getItem('Revisión origen');

if (process.argv.includes('--inspect')) {
  console.log((await workbook.inspect({kind:'region',sheetId:'Carga masiva',range:'E1:J7',maxChars:2500,tableMaxRows:7,tableMaxCols:6})).ndjson);
  console.log(workbook.help('table.resize',{include:'index,examples,notes',maxChars:2500}).ndjson);
  const baseline = await workbook.render({sheetName:'Carga masiva',range:'E1:J7',scale:1.5,format:'png'});
  await fs.writeFile(path.join(scratch,'barcodes_antes.png'),new Uint8Array(await baseline.arrayBuffer()));
  process.exit(0);
}
const evidence = JSON.parse(await fs.readFile(path.join(scratch,'codigos_verificados.json'),'utf8'));
const mapping = JSON.parse(await fs.readFile(path.join(scratch,'mapeo_validado.json'),'utf8'));
const n = mapping.mapped.length;
const before = sheet.getRange(`A2:J${n+1}`).values;
const reviewBefore = review.getRange(`A8:N${n+8}`).values;
const formulasBefore = sheet.getRange(`F2:G${n+1}`).formulas;
const costFormulasBefore = review.getRange(`K9:K${n+8}`).formulas;
const key = (name,variant) => JSON.stringify([name,variant || '']);
const verified = new Map(evidence.matches.map(row => [key(row[0],row[1]),row]));
const codeCells = [], originCells = [];
let filled = 0;
for (let i=0;i<n;i++) {
  const r = before[i];
  const match = verified.get(key(r[1],r[4]));
  const sourceRow = mapping.mapped[i];
  assert.equal(r[1],sourceRow.row[1]);
  assert.equal(r[4] || '',sourceRow.row[4]);
  if (match) {
    const [name,variant,code,source,description] = match;
    assert(/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(code));
    const sum = [...code.slice(0,-1)].reverse().reduce((a,d,i)=>a+Number(d)*(i%2===0?3:1),0);
    assert.equal((10-sum%10)%10,Number(code.at(-1)),code);
    codeCells.push([code]);
    originCells.push([code,evidence.sources[source],`Coincidencia: ${description}`]);
    sourceRow.row[9] = code;
    filled++;
  } else {
    codeCells.push([null]);
    let reason = 'Pendiente: no se obtuvo una coincidencia verificable para la presentación exacta.';
    if (sourceRow.page===3) reason = 'Pendiente: falta identificar el sabor o verificar el código de la pieza individual.';
    if (['Sabores retornables','Sabores no retornables','Bebidas no carbonatadas','Jugos y néctares'].includes(sourceRow.section) || /Exprim|Twist|Frutal|UHT 180|UHT 250|Monster|Predator|Bacardí|Silk/.test(r[1])) reason = 'Pendiente: la fila agrupa sabores o variedades y no determina un GTIN único.';
    originCells.push([null,null,reason]);
    sourceRow.row[9] = '';
  }
}
assert.equal(filled,verified.size);
assert.equal(new Set(codeCells.flat().filter(Boolean)).size,filled);

// Keep all existing cells/formulas intact except the requested barcode data
// and the sentence that formerly said every barcode was blank.
sheet.getRange(`J2:J${n+1}`).setNumberFormat('@');
sheet.getRange(`J2:J${n+1}`).values = codeCells;
review.getRange(`O9:Q${n+8}`).values = originCells;
review.getRange('O8:Q8').copyFrom(review.getRange('K8:M8'),'all');
review.getRange('O8:Q8').values = [['codigo_barras','Fuente del código','Coincidencia o motivo pendiente']];
review.getRange(`O9:Q${n+8}`).format.font = {name:'Arial',size:10,color:'#182C40'};
review.getRange(`O9:Q${n+8}`).format.verticalAlignment = 'center';
review.getRange(`O9:O${n+8}`).setNumberFormat('@');
review.getRange(`O8:O${n+8}`).format.columnWidth = 24;
review.getRange(`P8:P${n+8}`).format.columnWidth = 110;
review.getRange(`Q8:Q${n+8}`).format.columnWidth = 100;
review.getRange(`P9:Q${n+8}`).format.wrapText = true;
for (let i=0;i<n;i++) {
  const range = review.getRange(`A${i+9}:Q${i+9}`);
  range.format.rowHeight = Math.max(Number(review.getRange(`A${i+9}`).format.rowHeight) || 24,36);
}
review.getRange(`Q9:Q${n+8}`).conditionalFormats.add('containsText',{text:'Pendiente:',format:{fill:'#FFF2CC',font:{color:'#805000'}}});
review.getRange('A5').values = [[`Categorías y existencias vacías; seguimiento: no. ${filled} códigos de barras con fuente; ${n-filled} pendientes de identificar.`]];

// The public API does not document table resizing. Recreate only this table,
// retaining its name and style while including the new provenance columns.
const originalTable = review.tables.items[0];
const originalName = originalTable.name;
const originalStyle = originalTable.style;
originalTable.delete();
review.tables.add(`A8:Q${n+8}`,true,originalName).style = originalStyle;
review.getRange('O8:Q8').format.fill = '#163D68';
review.getRange('O8:Q8').format.font = {name:'Arial',size:10,bold:true,color:'#FFFFFF'};
review.getRange('O8:Q8').format.horizontalAlignment = 'center';
review.getRange('O8:Q8').format.wrapText = true;
// Explicit digit-width display also prevents the preview renderer from
// abbreviating numeric text into scientific notation. Values stay strings.
codeCells.forEach(([code],i) => {
  if (!code) return;
  sheet.getRange(`J${i+2}`).setNumberFormat('0'.repeat(code.length));
  review.getRange(`O${i+9}`).setNumberFormat('0'.repeat(code.length));
});
sheet.getRange(`J2:J${n+1}`).format.horizontalAlignment = 'left';
review.getRange(`O9:O${n+8}`).format.horizontalAlignment = 'left';
workbook.recalculate();
assert.deepEqual(sheet.getRange(`A2:I${n+1}`).values,before.map(r=>r.slice(0,9)));
assert.deepEqual(review.getRange(`A8:N${n+8}`).values,reviewBefore);
assert.deepEqual(sheet.getRange(`F2:G${n+1}`).formulas,formulasBefore);
assert.deepEqual(review.getRange(`K9:K${n+8}`).formulas,costFormulasBefore);
const after = sheet.getRange(`A2:J${n+1}`).values;
after.forEach((r,i)=>assert.equal(r[9],codeCells[i][0]));
const errors = await workbook.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:20},maxChars:1500});
assert(!/"cell"|"address"/.test(errors.ndjson),errors.ndjson);

for (const [file,backup] of [[csvPath,'catalogo3_antes_de_codigos.csv'],[workbookPath,'catalogo3_antes_de_codigos.xlsx']]) {
  try { await fs.access(path.join(scratch,backup)); }
  catch { await fs.copyFile(file,path.join(scratch,backup)); }
}
const csvWorkbook = await Workbook.fromCSV((await fs.readFile(csvPath,'utf8')).replace(/^\uFEFF/,''),{sheetName:'Importación'});
const csvSheet = csvWorkbook.worksheets.getItemAt(0);
csvSheet.getRange(`J2:J${n+1}`).values = codeCells;
const csvValues = csvSheet.getRange(`A1:J${n+1}`).values;
const field = value => {
  const text = value == null ? '' : String(value);
  return /[,"\r\n]/.test(text) ? `"${text.replaceAll('"','""')}"` : text;
};
const csv = '\uFEFF' + csvValues.map((r,i)=>r.map((v,c)=>i>0 && (c===5||c===6)?Number(v).toFixed(2):field(v)).join(',')).join('\r\n') + '\r\n';
await fs.writeFile(csvPath,csv,'utf8');
const file = await SpreadsheetFile.exportXlsx(workbook);
await file.save(workbookPath);
mapping.barcodes = {filled,pending:n-filled,sources:evidence.sources};
await fs.writeFile(path.join(scratch,'mapeo_validado.json'),JSON.stringify(mapping,null,2));
for (const [sheetName,range,filename] of [
  ['Carga masiva','E1:J12','barcodes_despues.png'],
  ['Revisión origen','O8:Q15','barcodes_fuentes.png'],
]) {
 const png = await workbook.render({sheetName,range,scale:1.5,format:'png'});
 await fs.writeFile(path.join(scratch,filename),new Uint8Array(await png.arrayBuffer()));
}
console.log(JSON.stringify({filled,pending:n-filled,products:172,variants:n,formulaErrors:errors.ndjson},null,2));
