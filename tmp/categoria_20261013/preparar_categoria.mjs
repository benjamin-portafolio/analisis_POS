import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { Workbook, SpreadsheetFile } from '@oai/artifact-tool';

const root = '/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis ';
const outputDir = path.join(root, 'outputs/categoria_20261013');
const supportDir = path.join(root, 'tmp/categoria_20261013');
const exportSource = await fs.readFile('/Users/benjamin/Projects/POS/pos_flutter/lib/data/local/export/articulo_catalog_csv.dart', 'utf8');
const headerBlock = exportSource.match(/static const columnas = <String>\[([\s\S]*?)\];/)[1];
const headers = [...headerBlock.matchAll(/'([^']+)'/g)].map(match => match[1]);
assert.equal(headers.length, 10);

// Each entry is one printed price line. Alternatives become variant rows.
const sources = [];
const mapped = [];
function add(brand, category, printed, cost, sale, products, note = '') {
  const sourceId = sources.length + 1;
  sources.push({ sourceId, brand, category, printed, cost, sale, note });
  for (const [name, variant = ''] of products) {
    mapped.push({ sourceId, row: ['', name, 'unidad', '', variant, sale, cost, 'no', '', ''] });
  }
}
function simple(brand, category, printed, cost, sale, name, note = '') {
  add(brand, category, printed, cost, sale, [[`${brand} ${name}`]], note);
}
function flavors(brand, category, printed, cost, sale, name, variants, note = '') {
  add(brand, category, printed, cost, sale, variants.map(v => [`${brand} ${name}`, v]), note);
}

// Marinela - Galletas: 21 printed lines.
flavors('Marinela', 'Galletas', 'Barritas Fresa, Moras y Piña 75g', 13.44, 16, 'Barritas 75 g', ['Fresa', 'Moras', 'Piña']);
simple('Marinela', 'Galletas', 'Barritas Two Pack 110g', 16.80, 20, 'Barritas Two Pack 110 g');
flavors('Marinela', 'Galletas', 'Bites Canelitas y Triki Trakes 80g', 12.60, 15, 'Bites 80 g', ['Canelitas', 'Triki Trakes']);
simple('Marinela', 'Galletas', 'Bombonete 55g', 12.60, 15, 'Bombonete 55 g');
simple('Marinela', 'Galletas', 'Canelitas 120g +2p', 18.48, 22, 'Canelitas 120 g +2 p');
add('Marinela', 'Galletas', 'Galleta Gansito 43g y Pingüino 40g', 8.40, 10, [['Marinela Galleta Gansito 43 g'], ['Marinela Galleta Pingüino 40 g']]);
add('Marinela', 'Galletas', 'Galleta Pingüino 160g y Gansito 215g', 28.56, 34, [['Marinela Galleta Pingüino 160 g'], ['Marinela Galleta Gansito 215 g']]);
simple('Marinela', 'Galletas', 'Fruti Sponch 8p 124g', 20.16, 24, 'Fruti Sponch 8 p 124 g');
simple('Marinela', 'Galletas', 'Lors 98g', 15.12, 18, 'Lors 98 g');
simple('Marinela', 'Galletas', 'Mini Barritas Fresa 8p 98g', 16.80, 20, 'Mini Barritas Fresa 8 p 98 g');
simple('Marinela', 'Galletas', 'Mini Rocko 10g', 3.36, 4, 'Mini Rocko 10 g');
simple('Marinela', 'Galletas', 'Mobi 30g', 6.72, 8, 'Mobi 30 g');
simple('Marinela', 'Galletas', 'Platívolos 90g', 15.12, 18, 'Platívolos 90 g');
simple('Marinela', 'Galletas', 'Polvorones 6p 148g +2p', 18.48, 22, 'Polvorones 6 p 148 g +2 p');
flavors('Marinela', 'Galletas', 'Príncipe 126g 12p (Chocolate, Avellana, Choc. Blanco, Limón)', 18.48, 22, 'Príncipe 12 p 126 g', ['Chocolate', 'Avellana', 'Chocolate blanco', 'Limón']);
simple('Marinela', 'Galletas', 'Rocko 44g', 8.40, 10, 'Rocko 44 g');
simple('Marinela', 'Galletas', 'Sponch 120g', 18.48, 22, 'Sponch 120 g');
flavors('Marinela', 'Galletas', 'Suavicremas 100g (Chocolate, Fresa, Vainilla)', 16.80, 20, 'Suavicremas 100 g', ['Chocolate', 'Fresa', 'Vainilla']);
simple('Marinela', 'Galletas', 'Triki Trakes 85g', 16.80, 20, 'Triki Trakes 85 g');
simple('Marinela', 'Galletas', 'Triki Trakes Bombon 10p 85g', 16.80, 20, 'Triki Trakes Bombón 10 p 85 g');
flavors('Marinela', 'Galletas', 'MaxiTubos (Príncipe, Triki Trakes, Canelitas, Sponch, Lors, Polvorones, Mini Barritas Fresa y Piña)', 26.88, 32, 'MaxiTubos', ['Príncipe', 'Triki Trakes', 'Canelitas', 'Sponch', 'Lors', 'Polvorones', 'Mini Barritas Fresa', 'Mini Barritas Piña'], 'El PDF no indica el gramaje de los MaxiTubos.');

// Tía Rosa - Pan dulce: 18 printed lines.
flavors('Tía Rosa', 'Pan dulce (Tía Rosa)', 'Bigotes Cajeta y Chocolate 80g', 13.28, 16, 'Bigotes 80 g', ['Cajeta', 'Chocolate']);
simple('Tía Rosa', 'Pan dulce (Tía Rosa)', 'Bigotes Duo Chocolate 160g', 23.24, 28, 'Bigotes Dúo Chocolate 160 g');
simple('Tía Rosa', 'Pan dulce (Tía Rosa)', 'Conchas 2p 130g', 18.26, 22, 'Conchas 2 p 130 g');
simple('Tía Rosa', 'Pan dulce (Tía Rosa)', 'Cuernitos 2p 100g', 16.60, 20, 'Cuernitos 2 p 100 g');
simple('Tía Rosa', 'Pan dulce (Tía Rosa)', 'Divididas en Tiras Doraditas 127g', 14.94, 18, 'Divididas en Tiras Doraditas 127 g');
simple('Tía Rosa', 'Pan dulce (Tía Rosa)', 'Doraditas Nuez 127g', 14.94, 18, 'Doraditas Nuez 127 g');
simple('Tía Rosa', 'Pan dulce (Tía Rosa)', 'Madalenas Cuadradas 44g', 8.30, 10, 'Madalenas Cuadradas 44 g');
simple('Tía Rosa', 'Pan dulce (Tía Rosa)', 'Mantecadas Vainilla 3p 157g', 21.58, 26, 'Mantecadas Vainilla 3 p 157 g');
simple('Tía Rosa', 'Pan dulce (Tía Rosa)', 'Mantecadas Vainilla 52.5g', 8.30, 10, 'Mantecadas Vainilla 52.5 g');
simple('Tía Rosa', 'Pan dulce (Tía Rosa)', 'Mantecadas Chocolate 3p 143g', 21.58, 26, 'Mantecadas Chocolate 3 p 143 g');
simple('Tía Rosa', 'Pan dulce (Tía Rosa)', 'Mantecadas Naranja 3p 165g', 21.58, 26, 'Mantecadas Naranja 3 p 165 g');
simple('Tía Rosa', 'Pan dulce (Tía Rosa)', 'Mini Divididas en Tiras Doraditas 58g', 8.30, 10, 'Mini Divididas en Tiras Doraditas 58 g');
simple('Tía Rosa', 'Pan dulce (Tía Rosa)', 'Muffin Casero 130g', 14.94, 18, 'Muffin Casero 130 g');
simple('Tía Rosa', 'Pan dulce (Tía Rosa)', 'Pachoncitos 2p 140g', 18.26, 22, 'Pachoncitos 2 p 140 g');
simple('Tía Rosa', 'Pan dulce (Tía Rosa)', 'Panqué Casero 235g', 29.05, 35, 'Panqué Casero 235 g');
simple('Tía Rosa', 'Pan dulce (Tía Rosa)', 'Semitas 1p 92g', 11.62, 14, 'Semitas 1 p 92 g');
simple('Tía Rosa', 'Pan dulce (Tía Rosa)', 'Semitas 2p 184g', 20.75, 25, 'Semitas 2 p 184 g');
simple('Tía Rosa', 'Pan dulce (Tía Rosa)', 'Julitas 40 g', 5.10, 6, 'Julitas 40 g');

// Lara - Galletas: 13 printed lines.
simple('Lara', 'Galletas', 'Animalitos Karamelo 200g', 18.48, 22, 'Animalitos Karamelo 200 g');
simple('Lara', 'Galletas', 'Canapinas 80g', 11.76, 14, 'Canapinas 80 g');
simple('Lara', 'Galletas', 'Canapinas 140g', 16.80, 20, 'Canapinas 140 g');
simple('Lara', 'Galletas', 'Decanelas Rosquillas 185g', 20.16, 24, 'Decanelas Rosquillas 185 g');
flavors('Lara', 'Galletas', 'Deliciosas Chocochispas y Vainilla 60g', 8.40, 10, 'Deliciosas 60 g', ['Chocochispas', 'Vainilla']);
flavors('Lara', 'Galletas', 'Deliciosas Chocochispas y Vainilla 130g', 16.80, 20, 'Deliciosas 130 g', ['Chocochispas', 'Vainilla']);
simple('Lara', 'Galletas', 'Deliciosas Bombon 170g', 25.20, 30, 'Deliciosas Bombón 170 g');
flavors('Lara', 'Galletas', 'Deliciosas 230g (Betunadas, Chochitos, Chocochispas y Vainilla)', 23.52, 28, 'Deliciosas 230 g', ['Betunadas', 'Chochitos', 'Chocochispas', 'Vainilla']);
flavors('Lara', 'Galletas', 'Favoritas 100g Nuez y Vainilla', 10.08, 12, 'Favoritas 100 g', ['Nuez', 'Vainilla']);
flavors('Lara', 'Galletas', 'Favoritas 155g Nuez y Vainilla', 15.12, 18, 'Favoritas 155 g', ['Nuez', 'Vainilla']);
simple('Lara', 'Galletas', 'Magnas 200g', 21.00, 25, 'Magnas 200 g');
simple('Lara', 'Galletas', 'Marías 170g', 15.12, 18, 'Marías 170 g');
simple('Lara', 'Galletas', 'Saladas 175g', 16.80, 20, 'Saladas 175 g');

// Marinela - Pasteles: 15 printed lines.
simple('Marinela', 'Pasteles', 'Choco Roles 25pct más 2p 100g', 18.26, 22, 'Choco Roles 25% más 2 p 100 g');
simple('Marinela', 'Pasteles', 'Dona Gansito 1p 85g', 12.45, 15, 'Dona Gansito 1 p 85 g');
flavors('Marinela', 'Pasteles', 'Dúo Mini Pay Piña 110g / Nuez 96g', 20.75, 25, 'Dúo Mini Pay', ['Piña 110 g', 'Nuez 96 g']);
simple('Marinela', 'Pasteles', 'Dúo Napolitano 140g', 20.75, 25, 'Dúo Napolitano 140 g');
simple('Marinela', 'Pasteles', 'Gansito 50g', 14.94, 18, 'Gansito 50 g');
simple('Marinela', 'Pasteles', 'Mini Choco Roles 28g', 6.64, 8, 'Mini Choco Roles 28 g');
simple('Marinela', 'Pasteles', 'Mini Gansito 24g', 6.64, 8, 'Mini Gansito 24 g');
simple('Marinela', 'Pasteles', 'Mini Pingüino 25g', 6.64, 8, 'Mini Pingüino 25 g');
simple('Marinela', 'Pasteles', 'Pastelito Hershey’s 1p 40g', 11.62, 14, 'Pastelito Hershey\'s 1 p 40 g');
simple('Marinela', 'Pasteles', 'Pastelito Bocadin 40g', 6.64, 8, 'Pastelito Bocadín 40 g');
simple('Marinela', 'Pasteles', 'Pingüinos 2p 80g', 18.26, 22, 'Pingüinos 2 p 80 g');
simple('Marinela', 'Pasteles', 'Pingüinos 3p 120g', 23.24, 28, 'Pingüinos 3 p 120 g');
simple('Marinela', 'Pasteles', 'Pingüinos Hershey’s 2p 80g', 18.26, 22, 'Pingüinos Hershey\'s 2 p 80 g');
simple('Marinela', 'Pasteles', 'Rollo Fresa 75g', 14.94, 18, 'Rollo Fresa 75 g');
flavors('Marinela', 'Pasteles', 'Submarinos 105g (Chocolate, Fresa, Vainilla)', 16.60, 20, 'Submarinos 105 g', ['Chocolate', 'Fresa', 'Vainilla']);

// Marinela - Bebidas lácteas: 2 printed lines.
simple('Marinela', 'Bebidas lácteas', 'Leche Gansito 236ml', 12.45, 15, 'Leche Gansito 236 ml');
simple('Marinela', 'Bebidas lácteas', 'Leche Nito 236ml', 12.45, 15, 'Leche Nito 236 ml');

// Tía Rosa - Galletas: 6 printed lines.
simple('Tía Rosa', 'Galletas (Tía Rosa)', 'Galleta con Avena, Arándano 66g', 10.08, 12, 'Galleta con Avena y Arándano 66 g');
simple('Tía Rosa', 'Galletas (Tía Rosa)', 'Panera Polvoroncitos Caseros 20p 300g', 1.68, 2, 'Panera Polvoroncitos Caseros 20 p 300 g', 'El PDF publica $1.68 / $2.00. Confirmar si son precios por pieza o por panera de 20 p.');
simple('Tía Rosa', 'Galletas (Tía Rosa)', 'Pastitas Cuadradas 54g', 10.08, 12, 'Pastitas Cuadradas 54 g');
simple('Tía Rosa', 'Galletas (Tía Rosa)', 'Polvoroncitos 6p 90g', 15.12, 18, 'Polvoroncitos 6 p 90 g');
flavors('Tía Rosa', 'Galletas (Tía Rosa)', 'Tartinas 8p 133.3g (Fresa, Piña, Zarzamora)', 16.80, 20, 'Tartinas 8 p 133.3 g', ['Fresa', 'Piña', 'Zarzamora']);
simple('Tía Rosa', 'Galletas (Tía Rosa)', 'Mini Polvoroncitos 5p 50g', 10.08, 12, 'Mini Polvoroncitos 5 p 50 g');

// Suandy: 4 printed lines.
simple('Suandy', 'Suandy', 'Pastisetas 90g', 23.52, 28, 'Pastisetas 90 g');
simple('Suandy', 'Suandy', 'Pastisetas Chocolate 125g', 25.20, 30, 'Pastisetas Chocolate 125 g');
simple('Suandy', 'Suandy', 'Pastisetas Sin Azúcar 84g', 25.20, 30, 'Pastisetas Sin Azúcar 84 g');
simple('Suandy', 'Suandy', 'Tartaletas Cuadradas de Fresa', 23.52, 28, 'Tartaletas Cuadradas de Fresa', 'El PDF no indica gramaje ni número de piezas.');

// Gabi: 8 printed lines.
simple('Gabi', 'Gabi', 'Besos de Nuez y Chocolate 1p 60g', 8.30, 10, 'Besos de Nuez y Chocolate 1 p 60 g');
simple('Gabi', 'Gabi', 'Besos de Nuez 1p 90g', 11.62, 14, 'Besos de Nuez 1 p 90 g');
simple('Gabi', 'Gabi', 'Mias de Arandano 12p 96g', 13.28, 16, 'Mias de Arándano 12 p 96 g');
simple('Gabi', 'Gabi', 'Orejitas de Mantequilla 71g', 11.62, 14, 'Orejitas de Mantequilla 71 g');
simple('Gabi', 'Gabi', 'Panera Orejita 22p 180g', 24.90, 30, 'Panera Orejita 22 p 180 g');
simple('Gabi', 'Gabi', 'Surtido Fino Variedad 200g', 31.54, 38, 'Surtido Fino Variedad 200 g');
simple('Gabi', 'Gabi', 'Surtido Fino Variedad 375g', 51.46, 62, 'Surtido Fino Variedad 375 g');
simple('Gabi', 'Gabi', 'Qé Chox', 10.08, 12, 'Qé Chox', 'El PDF no indica gramaje ni número de piezas.');

const rows = mapped.map(record => record.row);
assert.equal(sources.length, 87);
assert.equal(rows.length, 117);
assert.equal(new Set(rows.map(row => row[1])).size, 89);
assert.equal(new Set(mapped.map(record => record.sourceId)).size, 87);
const groups = new Map();
for (const record of mapped) {
  const row = record.row;
  const source = sources[record.sourceId - 1];
  assert.equal(row.length, 10);
  assert.equal(row[0], '');
  assert.equal(row[2], 'unidad');
  assert.equal(row[3], '');
  assert.equal(row[7], 'no');
  assert.equal(row[8], '');
  assert.equal(row[9], '');
  assert.equal(row[5], source.sale);
  assert.equal(row[6], source.cost);
  assert.ok(row[5] > 0 && row[6] >= 0);
  assert.ok(row[1].length <= 160 && row[4].length <= 160);
  const key = row[1].normalize('NFKC').trim().toLowerCase();
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(row);
}
for (const group of groups.values()) {
  if (group.length > 1) assert.ok(group.every(row => row[4]));
  assert.equal(new Set(group.map(row => row[4].normalize('NFKC').toLowerCase())).size, group.length);
}

const csvEscape = value => /[",\r\n]/.test(String(value)) ? `"${String(value).replaceAll('"', '""')}"` : String(value);
const csvRows = rows.map(row => row.map((value, index) => index === 5 || index === 6 ? value.toFixed(2) : value));
const csv = '\uFEFF' + [headers, ...csvRows].map(row => row.map(csvEscape).join(',')).join('\n') + '\n';
await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(path.join(outputDir, 'productos_categoria_carga_masiva.csv'), csv, 'utf8');
await fs.writeFile(path.join(supportDir, 'transcripcion.json'), JSON.stringify({ headers, sources, mapped }, null, 2));

const workbook = Workbook.create();
const upload = workbook.worksheets.add('Carga masiva');
const reference = workbook.worksheets.add('Referencia PDF');
upload.showGridLines = false;
reference.showGridLines = false;
upload.tabColor = '#1E3A5F';
upload.getRange(`A1:J${rows.length + 1}`).values = [headers, ...rows];
upload.getRange(`A1:J${rows.length + 1}`).format.font = { name: 'Arial', size: 10, color: '#1F2937' };
upload.getRange(`A1:J${rows.length + 1}`).format.rowHeight = 23;
upload.getRange(`A1:J${rows.length + 1}`).format.verticalAlignment = 'center';
const uploadWidths = [17, 57, 16, 16, 29, 17, 17, 25, 16, 23];
uploadWidths.forEach((width, index) => upload.getRangeByIndexes(0, index, rows.length + 1, 1).format.columnWidth = width);
upload.getRange(`F2:G${rows.length + 1}`).setNumberFormat('"$"#,##0.00');
upload.getRange(`F2:G${rows.length + 1}`).format.horizontalAlignment = 'right';
upload.getRange(`J2:J${rows.length + 1}`).setNumberFormat('@');
upload.tables.add(`A1:J${rows.length + 1}`, true, 'ProductosCarga');
upload.getRange('A1:J1').format = {
  fill: '#1E3A5F', font: { name: 'Arial', size: 10, bold: true, color: '#FFFFFF' },
  horizontalAlignment: 'center', verticalAlignment: 'center', wrapText: true, rowHeight: 38,
};
upload.freezePanes.freezeRows(1);

reference.getRange('A2').values = [['Productos del PDF']];
reference.getRange('A3').values = [['Fuente: categoria.pdf, página 1. Lista de precios sugeridos RM. Importes en MXN.']];
reference.getRange('A4').values = [['Vigencia indicada: 11 de agosto de 2025. Mayoreo → coste. Sugerido → venta.']];
reference.getRange('A6').values = [['CSV: 89 productos, 117 variantes. Sin categoría. Venta por unidad de presentación.']];
reference.getRange('A7').values = [['Sin códigos de barras ni saldos en el PDF. Seguimiento de existencias desactivado.']];
reference.getRange('A8').values = [['Revisar Panera Polvoroncitos Caseros: el PDF indica coste $1.68 y venta $2.00.']];
const sourceHeaders = ['Fila PDF', 'Marca', 'Categoría del PDF', 'Producto / presentación del PDF', 'Mayoreo (MXN)', 'Sugerido (MXN)', 'Observación'];
const sourceRows = sources.map(item => [item.sourceId, item.brand, item.category, item.printed, item.cost, item.sale, item.note]);
const lastSourceRow = 10 + sources.length;
reference.getRange(`A10:G${lastSourceRow}`).values = [sourceHeaders, ...sourceRows];
reference.getRange(`A1:G${lastSourceRow}`).format.font = { name: 'Arial', size: 10, color: '#1F2937' };
reference.getRange(`A1:G${lastSourceRow}`).format.rowHeight = 23;
reference.getRange(`A1:G${lastSourceRow}`).format.verticalAlignment = 'center';
reference.getRange('A2').format.font = { name: 'Arial', size: 15, bold: true, color: '#1E3A5F' };
reference.getRange('A3:A4').format.font = { name: 'Arial', size: 10, italic: true, color: '#475569' };
reference.getRange('A8').format.font = { name: 'Arial', size: 10, color: '#92400E' };
const sourceWidths = [11, 16, 25, 106, 18, 18, 112];
sourceWidths.forEach((width, index) => reference.getRangeByIndexes(0, index, lastSourceRow, 1).format.columnWidth = width);
reference.getRange(`E11:F${lastSourceRow}`).setNumberFormat('"$"#,##0.00');
reference.getRange(`E11:F${lastSourceRow}`).format.horizontalAlignment = 'right';
reference.tables.add(`A10:G${lastSourceRow}`, true, 'ReferenciaPrecios');
reference.getRange('A10:G10').format = {
  fill: '#334155', font: { name: 'Arial', size: 10, bold: true, color: '#FFFFFF' },
  horizontalAlignment: 'center', verticalAlignment: 'center', wrapText: true, rowHeight: 32,
};
reference.freezePanes.freezeRows(10);

workbook.recalculate();
for (const spec of [
  { range: 'Carga masiva!A1:J8', tableMaxRows: 8, tableMaxCols: 10 },
  { range: 'Carga masiva!B109:G118', tableMaxRows: 10, tableMaxCols: 6 },
  { range: 'Referencia PDF!D80:G82', tableMaxRows: 3, tableMaxCols: 4 },
]) {
  const check = await workbook.inspect({ kind: 'table', include: 'values,formulas', maxChars: 3500, ...spec });
  console.log(check.ndjson);
}
const errors = await workbook.inspect({ kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!', options: { useRegex: true, maxResults: 20 }, maxChars: 1500 });
console.log(errors.ndjson);
for (const [filename, sheetName, range] of [
  ['carga_preview.png', 'Carga masiva', 'A1:G13'],
  ['carga_inventario_preview.png', 'Carga masiva', 'H1:J13'],
  ['referencia_preview.png', 'Referencia PDF', 'A1:F17'],
  ['panera_preview.png', 'Referencia PDF', 'D79:G82'],
]) {
  const preview = await workbook.render({ sheetName, range, scale: 1.3, format: 'png' });
  await fs.writeFile(path.join(supportDir, filename), new Uint8Array(await preview.arrayBuffer()));
}
const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(path.join(outputDir, 'productos_categoria_revision.xlsx'));
console.log(JSON.stringify({ sourceLines: sources.length, products: groups.size, variants: rows.length, files: ['productos_categoria_carga_masiva.csv', 'productos_categoria_revision.xlsx'] }));
