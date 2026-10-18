import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {Workbook} from '@oai/artifact-tool';

const taskDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(taskDir, '../..');
const outputDir = path.join(root, 'outputs/gamesa_20261015');
const source = JSON.parse(await fs.readFile(path.join(taskDir, 'catalogo.json'), 'utf8'));
const codes = JSON.parse(await fs.readFile(path.join(taskDir, 'codigos.json'), 'utf8'));
const byId = new Map(codes.codigos.map(([id, barcode, url]) => [id, {barcode, url: codes[url] ?? url}]));
const headers = ['categoria','nombre_articulo','tipo_venta','unidad_venta','nombre_variante','precio_venta','precio_coste','seguimiento_existencias','existencias','codigo_barras'];
const exporter = await fs.readFile('/Users/benjamin/Projects/POS/pos_flutter/lib/data/local/export/articulo_catalog_csv.dart', 'utf8');
const headerBlock = exporter.match(/static const columnas = <String>\[([\s\S]*?)\];/)[1];
assert.deepEqual(headers, [...headerBlock.matchAll(/'([^']+)'/g)].map(m => m[1]));
assert.equal(source.filas.length, 56);
assert.equal(new Set(source.filas.map(r => r[0])).size, 56);
assert.equal(byId.size, codes.codigos.length);

function eanValido(code) {
  if (!/^\d{13}$/.test(code)) return false;
  const sum = [...code.slice(0,12)].reduce((total, ch, index) => total + Number(ch) * (index % 2 ? 3 : 1), 0);
  return (10 - sum % 10) % 10 === Number(code[12]);
}
const mapped = source.filas.map(([id, marca, sku, nombre, gramos, coste, venta]) => {
  const barcode = byId.get(id)?.barcode ?? '';
  if (barcode) assert.ok(eanValido(barcode), `EAN inválido: ${id} ${barcode}`);
  assert.ok(venta > coste && coste > 0);
  const row = ['', `${nombre} ${gramos} g`, 'unidad', '', '', venta, coste, 'no', '', barcode];
  return {id, marca, sku, gramos, row, barcodeFuente: byId.get(id)?.url ?? null};
});
const rows = mapped.map(r => r.row);
assert.equal(new Set(rows.map(r => r[1])).size, 56);
const populatedCodes = rows.map(r => r[9]).filter(Boolean);
assert.equal(new Set(populatedCodes).size, populatedCodes.length);
assert.equal(rows[1][9], '');
assert.equal(rows[12][1], 'Gamesa Chokis Chocobase 73.5 g');
assert.equal(rows[51][1], 'Gamesa Chokis rollo 180.5 g');

const workbook = Workbook.create();
const sheet = workbook.worksheets.add('Carga masiva');
sheet.getRange('A1:J57').values = [headers, ...rows];
sheet.getRange('A1:J57').format.font = {name:'Arial', size:10};
sheet.getRange('A1:J1').format = {fill:'#082B62', font:{name:'Arial', size:10, bold:true, color:'#FFFFFF'}, rowHeight:32};
sheet.getRange('A2:J57').format.rowHeight = 24;
for (const [column,width] of [['A',14],['B',56],['C',15],['D',16],['E',20],['F',17],['G',17],['H',28],['I',14],['J',22]]) {
  sheet.getRange(`${column}1:${column}57`).format.columnWidth = width;
}
sheet.getRange('F2:G57').format.numberFormat = '0.00';
sheet.getRange('J2:J57').format.numberFormat = '0';
sheet.freezePanes.freezeRows(1);
workbook.recalculate();
const actual = sheet.getRange('A1:J57').values.map(row => row.map(v => v ?? ''));
assert.deepEqual(actual, [headers,...rows]);
const inspection = await workbook.inspect({kind:'table', range:'Carga masiva!A1:J7', include:'values', tableMaxRows:7, tableMaxCols:10, maxChars:5000});
await fs.writeFile(path.join(taskDir, 'revision.ndjson'), inspection.ndjson);
const preview = await workbook.render({sheetName:'Carga masiva', range:'A1:J10', scale:1, format:'png'});
await fs.writeFile(path.join(taskDir,'vista_previa.png'), new Uint8Array(await preview.arrayBuffer()));

const escape = value => /[",\r\n]/.test(String(value ?? '')) ? `"${String(value).replaceAll('"','""')}"` : String(value ?? '');
const csvRows = actual.map((row,index) => row.map((value,col) => index > 0 && [5,6].includes(col) ? Number(value).toFixed(2) : value));
const csv = '\uFEFF' + csvRows.map(row => row.map(escape).join(',')).join('\r\n') + '\r\n';
await fs.mkdir(outputDir, {recursive:true});
const output = path.join(outputDir, 'gamesa_carga_masiva.csv');
await fs.writeFile(output, csv, 'utf8');
const summary = {archivo:output, filas:rows.length, articulos:56, conCodigo:populatedCodes.length, sinCodigo:56-populatedCodes.length, notas:source.notas, mapped};
await fs.writeFile(path.join(taskDir,'validacion.json'), JSON.stringify(summary,null,2));
console.log(JSON.stringify({...summary,mapped:undefined},null,2));
