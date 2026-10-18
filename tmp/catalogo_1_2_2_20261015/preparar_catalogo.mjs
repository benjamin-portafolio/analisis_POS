import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { Workbook } from '@oai/artifact-tool';

const taskDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(taskDir, '../..');
const outDir = path.join(root, 'outputs/catalogo_1_2_2_20261015');
const source = JSON.parse(await fs.readFile(path.join(taskDir, 'catalogo.json'), 'utf8'));
const headers = ['categoria', 'nombre_articulo', 'tipo_venta', 'unidad_venta',
  'nombre_variante', 'precio_venta', 'precio_coste', 'seguimiento_existencias',
  'existencias', 'codigo_barras'];
const exporterPath = '/Users/benjamin/Projects/POS/pos_flutter/lib/data/local/export/articulo_catalog_csv.dart';
const exporter = await fs.readFile(exporterPath, 'utf8');
const headerBlock = exporter.match(/static const columnas = <String>\[([\s\S]*?)\];/)[1];
const actualHeaders = [...headerBlock.matchAll(/'([^']+)'/g)].map(x => x[1]);
assert.deepEqual(headers, actualHeaders);

const seen = new Map();
const rows = [];
const mapping = [];
const duplicates = [];
let cards = 0;
for (const page of source.paginas) {
  assert.equal(page.fichas.length, page.pagina === 13 ? 13 : 12);
  for (const [refs, name] of page.fichas) {
    cards++;
    const codes = refs.split('-');
    assert.ok(name.length > 0 && name.length <= 160);
    assert.ok(!/[\r\n]/.test(name));
    for (const ref of codes) {
      assert.match(ref, /^\d+$/);
      if (seen.has(ref)) {
        assert.equal(seen.get(ref).nombre, name);
        duplicates.push({ referencia: ref, pagina: page.pagina, primeraPagina: seen.get(ref).pagina });
        continue;
      }
      seen.set(ref, { nombre: name, pagina: page.pagina });
      // Una referencia no se convierte en código de barras. Cuando la ficha
      // agrupa varios códigos sin distinguirlos, se conserva su descripción
      // y se distinguen únicamente mediante referencias literales del PDF.
      const variant = codes.length > 1 ? `Ref. proveedor ${ref}` : '';
      rows.push(['', name, 'unidad', '', variant, '', '', 'no', '', '']);
      mapping.push({ pagina: page.pagina, referencia: ref, filaCsv: rows.length + 1, nombre: name, variante: variant });
    }
  }
}
assert.equal(cards, 145);
assert.equal(duplicates.length, 2);
assert.deepEqual(duplicates.map(x => x.referencia).sort(), ['116', '453']);
assert.equal(rows.length, 155);
assert.equal(new Set(rows.map(x => `${x[1]}\0${x[4]}`)).size, rows.length);

const workbook = Workbook.create();
const sheet = workbook.worksheets.add('Carga masiva');
sheet.getRange(`A1:J${rows.length + 1}`).values = [headers, ...rows];
sheet.getRange(`A1:J${rows.length + 1}`).format.font = { name: 'Arial', size: 10 };
sheet.getRange('A1:J1').format = {
  fill: '#263C50', font: { name: 'Arial', size: 10, bold: true, color: '#FFFFFF' },
  rowHeight: 30, verticalAlignment: 'center',
};
sheet.getRange(`A2:J${rows.length + 1}`).format.rowHeight = 24;
sheet.getRange('A1:A156').format.columnWidth = 14;
sheet.getRange('B1:B156').format.columnWidth = 69;
sheet.getRange('C1:D156').format.columnWidth = 18;
sheet.getRange('E1:E156').format.columnWidth = 26;
sheet.getRange('F1:G156').format.columnWidth = 17;
sheet.getRange('H1:H156').format.columnWidth = 28;
sheet.getRange('I1:J156').format.columnWidth = 19;
sheet.showGridLines = true;
sheet.freezePanes.freezeRows(1);
workbook.recalculate();

const values = sheet.getRange(`A1:J${rows.length + 1}`).values;
assert.deepEqual(values.map(r => r.map(v => v ?? '')), [headers, ...rows]);
const inspect = await workbook.inspect({ kind: 'table', range: 'Carga masiva!A1:J8',
  include: 'values', tableMaxRows: 8, tableMaxCols: 10, maxChars: 5000 });
await fs.writeFile(path.join(taskDir, 'revision.ndjson'), inspect.ndjson);
const preview = await workbook.render({ sheetName: 'Carga masiva', range: 'A1:J12', scale: 1.25, format: 'png' });
await fs.writeFile(path.join(taskDir, 'vista_previa.png'), new Uint8Array(await preview.arrayBuffer()));

// Exportación de los valores del libro al contrato CSV UTF-8 con BOM del POS.
const escape = value => {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const csv = '\uFEFF' + values.map(row => row.map(escape).join(',')).join('\r\n') + '\r\n';
await fs.mkdir(outDir, { recursive: true });
const output = path.join(outDir, 'catalogo_1_2_2_carga_masiva.csv');
await fs.writeFile(output, csv, 'utf8');
const summary = { archivo: output, fichasPDF: cards, duplicadosEliminados: duplicates,
  filasCsv: rows.length, articulos: new Set(rows.map(r => r[1])).size,
  variantesPorReferencia: rows.filter(r => r[4] !== '').length,
  preciosVentaVacios: rows.filter(r => r[5] === '').length,
  preciosCosteVacios: rows.filter(r => r[6] === '').length,
  codigosBarrasVacios: rows.filter(r => r[9] === '').length,
  referencias: mapping };
await fs.writeFile(path.join(taskDir, 'validacion.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ ...summary, referencias: undefined }, null, 2));
