import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { Workbook, SpreadsheetFile } from '@oai/artifact-tool';

const root = '/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis ';
const scratch = path.join(root, 'tmp/catalogo3_20261013');
const output = path.join(root, 'outputs/catalogo3_20261013');
const source = JSON.parse(await fs.readFile(path.join(scratch, 'transcripcion.json'), 'utf8'));
const headers = ['categoria','nombre_articulo','tipo_venta','unidad_venta','nombre_variante','precio_venta','precio_coste','seguimiento_existencias','existencias','codigo_barras'];
const byProduct = new Map();
const sourceCounts = {1:0,2:0,3:0};
let sourceId = 0;
for (const group of source.groups) {
  for (const [label,cost,publicPrice,meta = {}] of group.rows) {
    sourceCounts[group.page]++;
    sourceId++;
    const units = meta.units ?? 1;
    const purchaseMinor = Math.round(cost * 100);
    const unitMinor = Math.floor((2 * purchaseMinor + units) / (2 * units));
    const saleMinor = Math.round(publicPrice * 100);
    if (group.page === 2) assert.equal(saleMinor * units - purchaseMinor, Math.round(meta.utility * 100));
    const productNames = meta.products ?? [meta.product ?? `${group.brand} ${label}`];
    const variants = meta.variants ?? [''];
    for (const product of productNames) {
      for (const variant of variants) {
        const row = ['',product,'unidad','',variant,saleMinor / 100,unitMinor / 100,'no','',''];
        const record = {
          row, sourceId, page:group.page, section:group.section,
          original:meta.original ?? label, pack:meta.pack ?? (group.page === 1 ? 'Presentación de la lista' : 'Pieza'),
          units, purchaseMinor, saleMinor, unitMinor, utility:meta.utility ?? null,
          note:meta.note ?? '', validity:group.validity,
        };
        if (!byProduct.has(product)) byProduct.set(product, []);
        byProduct.get(product).push(record);
      }
    }
  }
}
const mapped = [...byProduct.values()].flat();
assert.deepEqual(sourceCounts, {1:84,2:67,3:28});
assert.equal(sourceId,179);
assert.equal(mapped.length,191);
assert.equal(byProduct.size,172);
for (const [name,records] of byProduct) {
  assert(name.length <= 160);
  if (records.length > 1) assert(records.every(r => r.row[4]));
  assert.equal(new Set(records.map(r => r.row[4].normalize('NFKC').toLowerCase())).size, records.length);
}
await fs.mkdir(output,{recursive:true});
const workbook = Workbook.create();
const load = workbook.worksheets.add('Carga masiva');
const review = workbook.worksheets.add('Revisión origen');
load.showGridLines = false;
review.showGridLines = false;
load.tabColor = '#163D68';
review.tabColor = '#8297AA';
const n = mapped.length;
const loadEnd = n + 1;
const reviewStart = 9;
const reviewEnd = n + reviewStart - 1;
load.getRange(`A1:J${loadEnd}`).values = [headers,...mapped.map(r => r.row.map(v => v === '' ? null : v))];
review.getRange('A2').values = [['Catálogo para el POS - revisión de origen']];
review.getRange('A3').values = [[`${byProduct.size} artículos · ${n} variantes · ${sourceId} renglones del PDF`]];
review.getRange('A4').values = [['Coste por pieza = precio de compra / piezas de compra, redondeado a centavos. Panificados conservan el paquete de venta.']];
review.getRange('A5').values = [['Categorías, existencias y códigos de barras vacíos. Seguimiento de existencias: no. Importar el CSV adjunto.']];
review.getRange('A6').values = [['Fuente: catalogo3.pdf, páginas 1-3. Se conservan los precios y las vigencias de cada lista.']];
const reviewHeaders = ['Renglón origen','Página','Sección de la lista','Producto en la lista','nombre_articulo','nombre_variante','Empaque de compra','Piezas por compra','Precio de compra MXN','Precio público MXN','Coste por pieza MXN','Utilidad por caja MXN','Observaciones','Vigencia de la lista'];
review.getRange(`A8:N${reviewEnd}`).values = [reviewHeaders,...mapped.map(r => [r.sourceId,r.page,r.section,r.original,r.row[1],r.row[4] || null,r.pack,r.units,r.purchaseMinor/100,r.saleMinor/100,null,r.utility,r.note || null,r.validity])];
review.getRange('K9').formulas = [['=ROUND(ROUND(I9*100,0)/H9,0)/100']];
review.getRange(`K9:K${reviewEnd}`).fillDown();
load.getRange(`F2:G${loadEnd}`).formulas = mapped.map((r,i) => [`='Revisión origen'!J${i+reviewStart}`,`='Revisión origen'!K${i+reviewStart}`]);

function tableStyle(sheet,rangeName,headerName) {
  const range = sheet.getRange(rangeName);
  range.format.font = {name:'Arial',size:10,color:'#182C40'};
  range.format.verticalAlignment = 'center';
  range.format.rowHeight = 24;
  const header = sheet.getRange(headerName);
  header.format.fill = '#163D68';
  header.format.font = {name:'Arial',size:10,bold:true,color:'#FFFFFF'};
  header.format.horizontalAlignment = 'center';
  header.format.wrapText = true;
  header.format.rowHeight = 40;
}
tableStyle(load,`A1:J${loadEnd}`,'A1:J1');
tableStyle(review,`A8:N${reviewEnd}`,'A8:N8');
const loadWidths = [22,63,16,18,28,19,19,27,18,24];
const reviewWidths = [13,9,29,60,63,27,23,21,23,23,23,24,110,34];
loadWidths.forEach((width,i) => load.getRangeByIndexes(0,i,loadEnd,1).format.columnWidth = width);
reviewWidths.forEach((width,i) => review.getRangeByIndexes(7,i,reviewEnd-7,1).format.columnWidth = width);
load.getRange(`F2:G${loadEnd}`).setNumberFormat('0.00');
load.getRange(`J2:J${loadEnd}`).setNumberFormat('@');
review.getRange(`I9:L${reviewEnd}`).setNumberFormat('0.00');
review.getRange(`A9:B${reviewEnd}`).setNumberFormat('0');
review.getRange(`H9:H${reviewEnd}`).setNumberFormat('0');
review.getRange('A2').format.font = {name:'Arial',size:16,bold:true,color:'#163D68'};
review.getRange('A2:N2').format.rowHeight = 30;
review.getRange('A3:N6').format.font = {name:'Arial',size:10,color:'#485F73'};
review.getRange('A3:N6').format.rowHeight = 23;
review.getRange(`M9:M${reviewEnd}`).format.wrapText = true;
review.getRange(`M9:M${reviewEnd}`).conditionalFormats.add('containsText', {text:'REVISAR',format:{fill:'#FFF2CC',font:{color:'#805000',bold:true}}});
mapped.forEach((r,i) => {
  if (r.note) review.getRange(`A${i+reviewStart}:N${i+reviewStart}`).format.rowHeight = 44;
});
const loadTable = load.tables.add(`A1:J${loadEnd}`,true,'CatalogoParaCarga');
loadTable.style = 'TableStyleMedium2';
const reviewTable = review.tables.add(`A8:N${reviewEnd}`,true,'DetalleCatalogoOrigen');
reviewTable.style = 'TableStyleMedium2';
load.freezePanes.freezeRows(1);
load.freezePanes.freezeColumns(2);
review.freezePanes.freezeRows(8);
review.freezePanes.freezeColumns(2);
workbook.recalculate();
const values = load.getRange(`A2:J${loadEnd}`).values;
mapped.forEach((r,i) => {
  assert.equal(Math.round(values[i][5]*100),r.saleMinor,`Sale price ${r.row[1]}`);
  assert.equal(Math.round(values[i][6]*100),r.unitMinor,`Cost ${r.row[1]}`);
});
const errorScan = await workbook.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:20},maxChars:1500});
await fs.writeFile(path.join(scratch,'formula_scan.ndjson'),errorScan.ndjson);
assert(!/"cell"|"address"/.test(errorScan.ndjson),errorScan.ndjson);

// Check a real input change and restore it before exporting.
const multiIndex = mapped.findIndex(r => r.row[1] === 'Danonino Maxi - pieza de cuadro 336 g');
const multiReviewRow = multiIndex + reviewStart;
const multiLoadRow = multiIndex + 2;
review.getRange(`I${multiReviewRow}`).values = [[40]];
assert.equal(load.getRange(`G${multiLoadRow}`).values[0][0],10);
review.getRange(`I${multiReviewRow}`).values = [[35.3]];
workbook.recalculate();
assert.equal(load.getRange(`G${multiLoadRow}`).values[0][0],8.83);

const field = v => {
  const text = v === null || v === undefined ? '' : String(v);
  return /[,"\r\n]/.test(text) ? `"${text.replaceAll('"','""')}"` : text;
};
const finalValues = load.getRange(`A2:J${loadEnd}`).values;
const csvRows = finalValues.map(row => row.map((v,i) => i === 5 || i === 6 ? Number(v).toFixed(2) : field(v)).join(','));
const csv = '\uFEFF' + [headers.join(','),...csvRows].join('\r\n') + '\r\n';
await fs.writeFile(path.join(output,'catalogo3_carga_masiva.csv'),csv,'utf8');
await fs.writeFile(path.join(scratch,'mapeo_validado.json'),JSON.stringify({sourceCounts,products:byProduct.size,variants:n,mapped},null,2));
const file = await SpreadsheetFile.exportXlsx(workbook);
await file.save(path.join(output,'catalogo3_revision.xlsx'));
for (const [sheetName,range,filename] of [
  ['Carga masiva','A1:J14','carga_preview.png'],
  ['Revisión origen','A1:L15','origen_preview.png'],
  ['Revisión origen',`G${multiReviewRow-2}:N${multiReviewRow+3}`,'multipack_preview.png'],
]) {
  const png = await workbook.render({sheetName,range,scale:1.5,format:'png'});
  await fs.writeFile(path.join(scratch,filename),new Uint8Array(await png.arrayBuffer()));
}
console.log(JSON.stringify({sourceCounts,sourceRows:sourceId,products:byProduct.size,variants:n,formulaErrors:errorScan.ndjson,output},null,2));
