import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { Workbook } from '@oai/artifact-tool';

const root = process.cwd();
const scratch = path.join(root, 'tmp/bebidas_foto_20261016');
const out = path.join(root, 'outputs/bebidas_foto_20261016');
await fs.mkdir(out, { recursive: true });
const snapshots = JSON.parse(await fs.readFile(path.join(scratch, 'catalogos_chedraui.json'), 'utf8'));
const products = new Map();
for (const snapshot of snapshots) for (const p of snapshot.products ?? []) products.set(p.url, p);
const selections = [
  ['3061527','Pepsi Kick 500 ml',500,'Estante superior, izquierda','Marca legible.'],
  ['3922393','7UP Pink Lemonade 600 ml',600,'Estante superior, botellas rosadas','Identificación probable por logotipo y color. Confirmar sabor en la botella.'],
  ['3095645','Gatorade moras 600 ml',600,'Estante superior, bebida azul','Sabor inferido por color y gama comercial.'],
  ['3095647','Gatorade lima limón 600 ml',600,'Estante superior, bebida verde amarilla','Sabor inferido por color y gama comercial.'],
  ['3095651','Gatorade naranja 600 ml',600,'Estante superior, bebida naranja','Sabor probable. Puede confundirse con mandarina.'],
  ['3096881','Gatorade ponche de frutas 600 ml',600,'Estante superior, derecha, bebida roja','Sabor inferido por color y gama comercial.'],
  ['3253118','Pepsi regular 400 ml',400,'Segundo estante, botella pequeña del centro izquierdo','Presentación pequeña estimada frente a las botellas de 600 ml.'],
  ['3080138','Pepsi regular 600 ml',600,'Segundo estante, izquierda','Las botellas repetidas de igual presentación se agruparon.'],
  ['3672661','7UP lima limón 600 ml',600,'Segundo estante, botella verde al centro','Marca legible. No se distingue la formulación exacta.'],
  ['3062099','Mirinda naranja 600 ml',600,'Segundo estante, botella naranja al centro','Marca legible.'],
  ['3516917','Squirt toronja 400 ml',400,'Segundo estante, botella verde pequeña con tapa amarilla','Se estimó 400 ml por ser más pequeña que Mirinda de 600 ml.'],
  ['3061601','Sangría Casera 600 ml',600,'Segundo estante, botella oscura con etiqueta vino','Marca legible.'],
  ['3244908','Jumex Fresh Citrus 600 ml',600,'Segundo estante, extremo derecho, bebida amarilla','Marca visible. Sabor Citrus inferido por el color.'],
  ['3061480','Pepsi regular 1 L',1000,'Tercer estante, segunda botella desde la izquierda','Tamaño estimado respecto de la Pepsi de 1.5 L contigua.'],
  ['3140943','Pepsi regular 1.5 L',1500,'Tercer estante, extremo izquierdo','Tamaño estimado por proporción y presentación comercial.'],
  ['3856238','7UP lima limón 1.5 L',1500,'Tercer estante, botella verde','Tamaño estimado. La botella verde de la puerta no se contó como presentación adicional.'],
  ['3856239','Mirinda naranja 1.5 L',1500,'Tercer estante, botella naranja','Tamaño estimado por proporción y presentación comercial.'],
  ['3908468','Manzanita Sol manzana 1.5 L',1500,'Tercer estante, botella con tapa roja y etiqueta roja','La botella parcialmente oculta contigua no se contó como tamaño adicional.'],
  ['3061553','Sangría Casera 2 L',2000,'Tercer estante, extremo derecho','Tamaño estimado. Confirmar si el envase real es de 1.75 L o 2 L.'],
  ['3061476','Pepsi regular 2 L',2000,'Cuarto estante, botellas azules al centro','Tamaño estimado. Confirmar frente a la presentación de 2.5 L.'],
  ['3062119','Manzanita Sol manzana 2.5 L',2500,'Cuarto estante, botellas grandes de la izquierda','Tamaño estimado. Confirmar frente a la presentación de 2 L.'],
  ['3080171','Squirt toronja 2 L',2000,'Cuarto estante, botella verde con etiqueta amarilla','Tamaño estimado. Confirmar frente a la presentación de 2.5 L.'],
  ['3245137','Jumex Fresh Conga 2 L',2000,'Cuarto estante, extremo derecho, bebida rosada','Marca visible. Sabor Conga inferido por el color.'],
  ['3061511','Pepsi regular 3 L',3000,'Estante inferior, izquierda','Tamaño estimado por proporción y presentación comercial.'],
  ['3062072','Manzanita Sol manzana 3 L',3000,'Estante inferior, centro','Tamaño estimado por proporción y presentación comercial.'],
  ['3062136','Sangría Casera 2.5 L',2500,'Estante inferior, centro derecho','Tamaño estimado. Confirmar frente a la presentación de 3 L.'],
  ['3245135','Jumex Fresh Citrus 2 L',2000,'Estante inferior, extremo derecho, bebida amarilla','Sabor y tamaño estimados. Confirmar frente a la presentación de 3 L.'],
];
function validGtin(code) {
  if (!/^(?:\d{12}|\d{13})$/.test(code)) return false;
  const body = code.slice(0,-1).split('').reverse();
  const sum = body.reduce((s,c,i)=>s+Number(c)*(i%2===0?3:1),0);
  return (10-sum%10)%10 === Number(code.at(-1));
}
const data = selections.map(([id,name,ml,location,note])=>{
  const p = [...products.values()].find(x=>x.url.endsWith(`-${id}/p`));
  assert(p, `Producto ausente: ${id}`);
  const item = p.items[0];
  const imageCode = new URL(item.image).pathname.split('/').at(-1).split('_')[0].split('.')[0];
  const code = imageCode.length===11 ? imageCode.padStart(12,'0') : imageCode;
  assert(validGtin(code), `GTIN inválido: ${name}: ${code}`);
  assert(item.price > 0, `Precio ausente: ${name}`);
  return {name,ml,location,note,price:item.price,code,url:p.url,image:item.image,sourceName:p.nombre,
    identification: note.startsWith('Identificación probable') || /Sabor|sabor/i.test(note) ? 'Confirmar sabor y contenido' : 'Confirmar contenido'};
});
assert.equal(data.length,27);
assert.equal(new Set(data.map(x=>x.code)).size, data.length);
assert.equal(new Set(data.map(x=>x.name)).size, data.length);

const wb = Workbook.create();
const upload = wb.worksheets.add('Carga masiva');
const review = wb.worksheets.add('Referencias');
const headers = ['categoria','nombre_articulo','tipo_venta','unidad_venta','nombre_variante','precio_venta','precio_coste','seguimiento_existencias','existencias','codigo_barras'];
upload.getRange(`A1:J${data.length+1}`).values = [headers,...data.map(p=>[null,p.name,'unidad',null,null,p.price,null,'no',null,p.code])];
const refHeaders = ['nombre_articulo','contenido_estimado_ml','precio_referencia_mxn','codigo_barras','revision_necesaria','ubicacion_en_foto','observaciones','producto_en_fuente','fuente_precio','fuente_codigo','fecha_consulta'];
review.getRange(`A1:K${data.length+1}`).values = [refHeaders,...data.map(p=>[p.name,p.ml,p.price,p.code,p.identification,p.location,p.note,p.sourceName,p.url,p.image,'2026-10-16'])];
for (const sheet of [upload,review]) {
  sheet.showGridLines = false;
  sheet.freezePanes.freezeRows(1);
  const used = sheet.getUsedRange();
  used.format.font = { name:'Calibri', size:11, color:'#172B3A' };
  used.format.rowHeight = 26;
  const header = sheet.getRange(sheet===upload?'A1:J1':'A1:K1');
  header.format.fill = '#155E75';
  header.format.font = { name:'Calibri', size:11, bold:true, color:'#FFFFFF' };
  header.format.rowHeight = 42;
  header.format.wrapText = true;
}
upload.getRange('A1:J28').format.columnWidth = 20;
upload.getRange('B1:B28').format.columnWidth = 45;
upload.getRange('F2:G28').setNumberFormat('0.00');
upload.getRange('J2:J28').setNumberFormat('@');
review.getRange('A1:A28').format.columnWidth = 43;
review.getRange('B1:B28').format.columnWidth = 21;
review.getRange('C1:C28').format.columnWidth = 21;
review.getRange('D1:D28').format.columnWidth = 22;
review.getRange('E1:E28').format.columnWidth = 34;
review.getRange('F1:K28').format.columnWidth = 70;
review.getRange('C2:C28').setNumberFormat('0.00');
review.getRange('D2:D28').setNumberFormat('@');
// El renderizador interpreta los identificadores numéricos como números.
// La máscara conserva su lectura completa en las vistas internas.
for (let i=0;i<data.length;i++) {
  const mask = '0'.repeat(data[i].code.length);
  upload.getRange(`J${i+2}`).setNumberFormat(mask);
  review.getRange(`D${i+2}`).setNumberFormat(mask);
}
review.getRange('E3').format.fill = '#FFF3C4';
wb.recalculate();
const inspected = await wb.inspect({kind:'table',range:'Carga masiva!A1:J28',include:'values',tableMaxRows:28,tableMaxCols:10,maxChars:1600});
await fs.writeFile(path.join(scratch,'inspeccion.ndjson'),inspected.ndjson);
const scan = await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:30},summary:'Validación final'});
await fs.writeFile(path.join(scratch,'errores.ndjson'),scan.ndjson);
for (const [sheet,range,file] of [[upload,'B1:F15','vista_carga.png'],[review,'A1:E28','vista_referencias.png']]) {
  const preview = await wb.render({sheetName:sheet.name,range,scale:1,format:'png'});
  await fs.writeFile(path.join(scratch,file),new Uint8Array(await preview.arrayBuffer()));
}
const escape = v => {
  const text = v===null || v===undefined ? '' : String(v);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"','""')}"` : text;
};
function csv(matrix,priceCols) {
  return '\uFEFF' + matrix.map((row,r)=>row.map((v,c)=>escape(r>0 && typeof v==='number' && priceCols.includes(c)?v.toFixed(2):v)).join(',')).join('\r\n')+'\r\n';
}
const uploadValues = upload.getRange('A1:J28').values;
const reviewValues = review.getRange('A1:K28').values;
assert.deepEqual(uploadValues[0],headers);
assert.equal(uploadValues[3][9],'036731136916');
await fs.writeFile(path.join(out,'bebidas_carga_masiva.csv'),csv(uploadValues,[5,6]),'utf8');
await fs.writeFile(path.join(out,'bebidas_referencias_y_estimaciones.csv'),csv(reviewValues,[2]),'utf8');
await fs.writeFile(path.join(scratch,'productos_seleccionados.json'),JSON.stringify(data,null,2));
const notes = `# Bebidas de la fotografía\n\n27 presentaciones. Consulta de precios: 16 de octubre de 2026. Moneda: MXN por botella.\n\nEl archivo bebidas_carga_masiva.csv contiene únicamente las diez columnas del importador del POS. Se vende cada botella como una unidad. Los mililitros o litros se incluyen en el nombre, no como venta a granel.\n\nLos contenidos son estimaciones visuales solicitadas por el usuario. Los códigos son referencias comerciales de las presentaciones elegidas, obtenidas de fichas e imágenes del catálogo de Chedraui. Ningún código se pudo leer directamente en la foto. Se verificaron longitud, dígito de control y ausencia de duplicados. La foto no permite confirmar que cada botella tenga ese mismo código.\n\nLos precios son referencias públicas de venta de Chedraui consultadas sin sucursal seleccionada. Pueden variar por sucursal y promoción. No son precios leídos de la foto ni costes de compra.\n\nEl archivo bebidas_referencias_y_estimaciones.csv permite revisar nombre, volumen estimado, precio, código, ubicación en la foto y fuentes. No se debe cargar como catálogo en el POS.\n\nRevisar especialmente:\n\n1. 7UP Pink Lemonade de la parte superior: identificación probable por el logotipo y el líquido rosado.\n2. Los sabores de Gatorade se infirieron por color. La bebida naranja puede ser mandarina.\n3. Sangría Casera del tercer estante se estimó en 2 L y la inferior en 2.5 L.\n4. Las botellas grandes pueden corresponder a tamaños contiguos, como 2 L, 2.5 L o 3 L.\n5. Jumex Fresh Citrus y Conga se infirieron por el color y la gama comercial.\n\nLa botella oscura con tapa naranja del segundo estante tiene la etiqueta de espaldas y no se añadió por falta de identificación suficiente. La botella verde de la puerta y las botellas parcialmente ocultas no se trataron como presentaciones nuevas. Las botellas repetidas de igual presentación están agrupadas.\n\nCategoría, coste y existencias quedan vacíos. El seguimiento de existencias está desactivado. No se inventaron cantidades de inventario. Los códigos se guardaron como texto sin apóstrofos; subir el CSV original conserva los ceros iniciales de Gatorade.\n\nLa validación utiliza un catálogo vacío para comprobar el formato; no comprueba si los artículos ya existen en tu negocio.\n`;
await fs.writeFile(path.join(out,'LEEME.md'),notes,'utf8');
console.log(JSON.stringify({articulos:data.length,codigos_validos:data.length,archivos:[path.join(out,'bebidas_carga_masiva.csv'),path.join(out,'bebidas_referencias_y_estimaciones.csv')]}));
