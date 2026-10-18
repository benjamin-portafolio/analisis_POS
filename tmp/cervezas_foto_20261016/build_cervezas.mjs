import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { Workbook } from '@oai/artifact-tool';

const root = '/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis ';
const outDir = `${root}/outputs/cervezas_foto_20261016`;
const tmpDir = `${root}/tmp/cervezas_foto_20261016`;
const sources = {
  seven2025: 'https://www.7pass.mx/uploads/711_tyc_empieza2025.pdf',
  seven2026: 'https://www.7pass.mx/uploads/TyCBuyWin_TecatePalcosVIP2026.pdf',
  tecate: 'https://www.7pass.mx/uploads/711-tyc-tecate_eagle.pdf',
  chedraui: 'https://chedrauimx.vteximg.com.br/arquivos/productos-participantes-bonificacion-michedraui-cupon-vinos-licores-marzo-2023.pdf',
  sol: 'https://www.basicos.mx/cerveza-sol-mangoyada-lata-473-mll',
  xx473: 'https://www.lagranbodega.com.mx/cerveza-xx-lager-473-ml/p',
  xx355: 'https://canmuseum.com/Detail.aspx?CanID=149172',
};

// Capacidades estimadas a partir de la foto y presentaciones comerciales.
// Los códigos corresponden a estas presentaciones; no se leen de la foto.
const records = [
  { name: 'Sol Mezclas Mangoyada', variant: 'Lata 473 ml', price: 27, barcode: '7503032272375', source: 'sol', note: 'Etiqueta de $27 bajo las latas sabor mango.' },
  { name: 'Sol Mezclas Clamato', variant: 'Lata 473 ml', price: 25, barcode: '7501049967062', source: 'seven2025', note: 'Etiqueta de $25 bajo las latas de Clamato.' },
  { name: 'Dos Equis Lager', variant: 'Lata 473 ml', price: 27, barcode: '7501049912284', source: 'xx473', note: 'Lata del entrepaño superior; etiqueta de $27.' },
  { name: 'Dos Equis Lager', variant: 'Lata 355 ml', price: 26, barcode: '75003821', source: 'xx355', note: 'Lata del segundo entrepaño; etiqueta de $26. Capacidad especialmente pendiente de confirmar.' },
  { name: 'Dos Equis Lager', variant: 'Botella retornable 190 ml', price: 9, barcode: '75005283', source: 'seven2025', note: 'Se tomó $9 de la etiqueta que dice XX 1/4. Hay otra etiqueta genérica de $8 cerca; confirmar el precio.' },
  { name: 'Dos Equis Lager', variant: 'Botella retornable 1200 ml', price: 48, barcode: '7501049912215', source: 'chedraui', note: 'Precio $48 asignado por las etiquetas con silueta dorada en el borde sobre el entrepaño inferior; confirmar correspondencia.' },
  { name: 'Tecate Original', variant: 'Lata 710 ml', price: 36, barcode: '7501061671244', source: 'tecate', note: 'Etiqueta de $36 del entrepaño superior. Las latas rojas del segundo entrepaño se consideraron repetidas de esta presentación.' },
  { name: 'Tecate Original', variant: 'Botella retornable 1200 ml', price: 44, barcode: '7501061668930', source: 'seven2026', note: 'Etiqueta de $44 debajo de las botellas Tecate. Hay etiquetas cercanas de $48; confirmar que $44 corresponde a Tecate.' },
  { name: 'Indio', variant: 'Botella retornable 190 ml', price: 8, barcode: '75015541', source: 'seven2025', note: 'Etiqueta digital de $8 bajo las botellas pequeñas de Indio.' },
  { name: 'Indio', variant: 'Botella retornable 1200 ml', price: 44, barcode: '75019303', source: 'seven2026', note: 'Precio $44 asignado por la etiqueta con silueta verde sobre las botellas grandes Indio; confirmar correspondencia.' },
  { name: 'Heineken 0.0', variant: 'Lata 355 ml', price: 21, barcode: '7503024416510', source: 'chedraui', note: 'Etiqueta digital de $21 a la derecha del segundo entrepaño.' },
  { name: 'Carta Blanca', variant: 'Lata 473 ml', price: 22, barcode: '7503028412587', source: 'chedraui', note: 'Etiqueta digital de $22 bajo las latas blancas altas.' },
  { name: 'Carta Blanca', variant: 'Lata 355 ml', price: 24, barcode: '7501061651543', source: 'seven2025', note: 'Etiqueta de $24 bajo la lata más baja con franja dorada. Capacidad especialmente pendiente de confirmar.' },
];

const headers = ['categoria','nombre_articulo','tipo_venta','unidad_venta','nombre_variante','precio_venta','precio_coste','seguimiento_existencias','existencias','codigo_barras'];
const matrix = [headers, ...records.map(r => ['', r.name, 'unidad', '', r.variant, r.price, '', 'no', '', r.barcode])];
const workbook = Workbook.create();
const sheet = workbook.worksheets.add('Productos');
sheet.getRange(`A1:J${matrix.length}`).values = matrix;
sheet.showGridLines = false;
sheet.getRange(`A1:J${matrix.length}`).format.font = { name: 'Arial', size: 10 };
sheet.getRange(`A1:J${matrix.length}`).format.rowHeight = 27;
sheet.getRange(`A1:J${matrix.length}`).format.verticalAlignment = 'center';
sheet.getRange('A1:J1').format = { fill: '#263544', font: {name:'Arial', size:10, bold:true, color:'#FFFFFF'}, horizontalAlignment:'center', rowHeight:32 };
const widths = [100, 220, 95, 110, 245, 100, 100, 190, 100, 150];
for (let i=0; i<widths.length; i++) sheet.getRangeByIndexes(0,i,matrix.length,1).format.columnWidthPx = widths[i];
sheet.getRange(`F2:F${matrix.length}`).setNumberFormat('0.00');
// El renderizador muestra cadenas numéricas largas en notación científica
// con @. El formato 0 conserva las cadenas y permite ver todos los dígitos.
sheet.getRange(`J2:J${matrix.length}`).setNumberFormat('0');
for (let r=2; r<=matrix.length; r++) if (r % 2 === 0) sheet.getRange(`A${r}:J${r}`).format.fill = '#F1F4F7';
sheet.freezePanes.freezeRows(1);
workbook.recalculate();

function validGtin(code) {
  if (!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(code)) return false;
  const body = code.slice(0,-1).split('').reverse();
  const sum = body.reduce((n,d,i) => n + Number(d) * (i % 2 === 0 ? 3 : 1),0);
  return (10 - sum % 10) % 10 === Number(code.at(-1));
}
assert.equal(records.length, 13);
assert.equal(new Set(records.map(r=>r.name)).size, 7);
assert.equal(new Set(records.map(r=>r.barcode)).size, records.length);
for (const r of records) {
  assert.ok(validGtin(r.barcode), `Dígito de control incorrecto: ${r.barcode}`);
  assert.ok(r.price > 0);
  assert.ok(sources[r.source]);
}
const inspected = await workbook.inspect({kind:'table', range:`Productos!A1:J${matrix.length}`, include:'values,formulas', tableMaxRows:14, tableMaxCols:10, maxChars:2000});
console.log(inspected.ndjson);
const errors = await workbook.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:20},summary:'Errores finales'});
console.log(errors.ndjson);

const escaped = v => {
  const s = v == null ? '' : String(v);
  return /[,"\n\r]/.test(s) ? `"${s.replaceAll('"','""')}"` : s;
};
const values = sheet.getRange(`A1:J${matrix.length}`).values;
assert.equal(values.length,14);
assert.deepEqual(values[0],headers);
const csv = '\uFEFF' + values.map((row,i) => row.map((v,c)=>escaped(i>0 && c===5 ? Number(v).toFixed(2) : v)).join(',')).join('\r\n') + '\r\n';
await fs.mkdir(outDir,{recursive:true});
await fs.writeFile(`${outDir}/cervezas_productos_carga_masiva.csv`,csv,'utf8');

const notes = [
  '# Productos de la fotografía del refrigerador',
  '',
  'Fecha de preparación: 16 de octubre de 2026. El CSV contiene 13 presentaciones agrupadas en 7 artículos, con las 10 columnas que exige el importador actual del POS Flutter. Importar solamente el archivo CSV.',
  '',
  '## Alcance de los datos',
  '',
  '- Todos los precios están en MXN por pieza y proceden de etiquetas de la fotografía. Las asociaciones dudosas se detallan abajo. No se sustituyeron por precios de tiendas en línea.',
  '- Todas las capacidades son estimaciones autorizadas, basadas en el tamaño relativo y presentaciones comerciales. Al ser bebidas se expresan en ml. Confirmar especialmente Dos Equis lata de 355 ml y Carta Blanca lata de 355 ml.',
  '- Los códigos se consultaron para las presentaciones elegidas. No se pudieron leer directamente del envase en la foto. Tienen longitud y dígito de control válidos, pero una capacidad o envase diferente puede llevar otro código.',
  '- Las latas Tecate rojas de ambos entrepaños se consideraron una sola presentación de 710 ml por su apariencia. No se creó una segunda presentación sin evidencia suficiente.',
  '- Categoría y precio de coste quedan vacíos porque no se conoce la categoría existente del dispositivo ni el coste de compra. El importador no crea categorías automáticamente.',
  '- No se dedujeron existencias de las unidades visibles. seguimiento_existencias es no y existencias queda vacío. Los saldos se pueden registrar después de un conteo.',
  '- La venta es por unidad. Las capacidades se guardan como parte de nombre_variante; unidad_venta queda vacía, como exige el contrato del POS para venta por pieza.',
  '',
  '## Presentaciones y observaciones',
  '',
  '| Artículo | Presentación estimada | Precio MXN | Código consultado | Lectura y observación | Fuente del código |',
  '|---|---|---:|---|---|---|',
  ...records.map(r=>`| ${r.name} | ${r.variant} | ${r.price.toFixed(2)} | ${r.barcode} | ${r.note} | [Consultar](${sources[r.source]}) |`),
  '',
  '## Comprobaciones',
  '',
  'Se comprobó encabezado, delimitador coma, BOM UTF-8, 13 filas de datos, precios positivos, códigos sin duplicados y dígitos de control. La validación del archivo se realiza sin cargar productos ni modificar la base de datos. La importación real también depende de que esos nombres de artículos no existan ya en el catálogo del dispositivo.',
  '',
].join('\n');
await fs.writeFile(`${outDir}/notas_y_fuentes.md`,notes,'utf8');
await fs.writeFile(`${tmpDir}/datos_validacion.json`,JSON.stringify(records,null,2),'utf8');
const preview = await workbook.render({sheetName:'Productos',range:`A1:J${matrix.length}`,scale:1,format:'png'});
await fs.writeFile(`${tmpDir}/vista_previa.png`,new Uint8Array(await preview.arrayBuffer()));
const saved = await fs.readFile(`${outDir}/cervezas_productos_carga_masiva.csv`,'utf8');
assert.ok(saved.startsWith('\uFEFF'));
assert.equal(saved.trimEnd().split(/\r?\n/).length,14);
assert.ok(!/[=]"?/.test(saved));
console.log(JSON.stringify({presentaciones:records.length,productos:7,codigos:13,archivo:`${outDir}/cervezas_productos_carga_masiva.csv`}));
