import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { Workbook } from '@oai/artifact-tool';

const scratch = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scratch, '../..');
const csvPath = path.join(root, 'outputs/catalogo_1_2_2_20261015/catalogo_1_2_2_carga_masiva.csv');
const evidence = JSON.parse(await fs.readFile(path.join(scratch, 'codigos_verificados.json'), 'utf8'));
const original = await fs.readFile(csvPath, 'utf8');
const workbook = await Workbook.fromCSV(original.replace(/^\uFEFF/, ''), { sheetName: 'Carga masiva' });
const sheet = workbook.worksheets.getItemAt(0);
const before = sheet.getRange('A1:J156').values.map(row => row.map(value => value ?? ''));
assert.equal(before[0][9], 'codigo_barras');
const key = (name, variant) => JSON.stringify([name, variant || '']);
const mapping = new Map(evidence.verificados.map(item => [key(item.nombre, item.variante), item]));
let updated = 0;
const codeColumn = before.slice(1).map((row, index) => {
  const match = mapping.get(key(row[1], row[4]));
  if (!match) return [row[9]];
  assert.equal(index + 2, match.filaCsv);
  assert.ok(row[9] === '' || row[9] === match.codigo_barras, 'Código preexistente diferente');
  const code = match.codigo_barras;
  assert.match(code, /^(?:\d{8}|\d{12}|\d{13}|\d{14})$/);
  const sum = [...code.slice(0, -1)].reverse().reduce((a, d, i) => a + Number(d) * (i % 2 === 0 ? 3 : 1), 0);
  assert.equal((10 - sum % 10) % 10, Number(code.at(-1)));
  updated++;
  return [code];
});
assert.equal(updated, evidence.con_codigo);

sheet.getRange('J2:J156').setNumberFormat('@');
sheet.getRange('J2:J156').values = codeColumn;
codeColumn.forEach(([code], i) => {
  if (code) sheet.getRange(`J${i + 2}`).setNumberFormat('0'.repeat(code.length));
});
sheet.getRange('A1:J156').format.font = { name: 'Arial', size: 10 };
sheet.getRange('A1:J156').format.rowHeight = 24;
sheet.getRange('A1:J1').format = { fill: '#263C50', font: { name: 'Arial', size: 10, bold: true, color: '#FFFFFF' }, rowHeight: 30 };
sheet.getRange('B1:B156').format.columnWidth = 69;
sheet.getRange('C1:D156').format.columnWidth = 18;
sheet.getRange('E1:E156').format.columnWidth = 26;
sheet.getRange('F1:G156').format.columnWidth = 17;
sheet.getRange('H1:H156').format.columnWidth = 28;
sheet.getRange('I1:J156').format.columnWidth = 22;
sheet.getRange('J2:J156').format.horizontalAlignment = 'left';
sheet.showGridLines = true;
workbook.recalculate();
const after = sheet.getRange('A1:J156').values.map(row => row.map(value => value ?? ''));
assert.deepEqual(after.map(row => row.slice(0, 9)), before.map(row => row.slice(0, 9)));
assert.equal(after.slice(1).filter(row => row[9]).length, 73);
assert.equal(new Set(after.slice(1).map(row => row[9]).filter(Boolean)).size, 73);
assert.ok(after.slice(1).every(row => row[2] === 'unidad'));
assert.ok(after.slice(1).every(row => row[5] === '' && row[6] === ''));

const preview = await workbook.render({ sheetName: 'Carga masiva', range: 'B60:J75', scale: 1.2, format: 'png' });
await fs.writeFile(path.join(scratch, 'codigos_vista_previa.png'), new Uint8Array(await preview.arrayBuffer()));
const inspect = await workbook.inspect({ kind: 'table', range: 'Carga masiva!F1:J12', include: 'values', tableMaxRows: 12, tableMaxCols: 5, maxChars: 3000 });
await fs.writeFile(path.join(scratch, 'codigos_revision.ndjson'), inspect.ndjson);

const backup = path.join(scratch, 'catalogo_1_2_2_antes_codigos.csv');
try { await fs.access(backup); } catch { await fs.writeFile(backup, original, 'utf8'); }
const field = value => /[,"\r\n]/.test(String(value))
  ? `"${String(value).replaceAll('"', '""')}"` : String(value);
const csv = '\uFEFF' + after.map(row => row.map(field).join(',')).join('\r\n') + '\r\n';
await fs.writeFile(csvPath, csv, 'utf8');
console.log(JSON.stringify({ archivo: csvPath, filas: after.length - 1, codigos: 73, pendientes: 82, todosPorUnidad: true, preciosVacios: true, otrasColumnasSinCambios: true }, null, 2));
