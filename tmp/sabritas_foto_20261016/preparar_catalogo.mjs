import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {Workbook} from '@oai/artifact-tool';

const taskDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(taskDir, '../..');
const outputDir = path.join(root, 'outputs/sabritas_foto_20261016');
const catalog = JSON.parse(await fs.readFile(path.join(taskDir, 'catalogo_tienda.json'), 'utf8'));
const pharmacy = 'https://www.fpsf.mx/products/';
const rappi = 'https://promos.rappi.com/mexico/2026/6/12/trminos-y-condiciones-carrera-de-compras-watching-party-verano-rappi';
const photo = '/Users/benjamin/Downloads/WhatsApp Image 2026-10-16 at 10.57.15.jpeg';
const topNote = 'El nivel superior muestra etiqueta impresa $26 y anotación manuscrita $25. Se interpreta $25 para Bolzaza; confirmar en tienda.';
const commonNote = 'Gramaje estimado según tamaño de la bolsa y presentación comercial consultada; no es una lectura del peso en la foto. El código corresponde a la presentación de referencia, no fue escaneado del empaque fotografiado. Confirmar peso y código en el producto físico.';

// Una fila por producto/presentación, sin contar bolsas repetidas como existencias.
// Los precios de foto conservan la incertidumbre de la asociación por nivel.
const products = [
  ['Paketaxo Quexo',81,20,'7500478044139',pharmacy+'paketaxo-quexo-70-g-copia-copia','Foto: anotación manuscrita Paketaxo $20','Foto; anotación en conflicto','Junto al producto también aparece etiqueta impresa $25. Se usa el importe manuscrito que nombra Paketaxo; confirmar precio.'],
  ['Cheetos Xtra Flamin Hot Bolzaza',115,25,'7500478044283','https://lamaschiquita.com/products/cheetos-extra-flamin-hot-115g','Foto: anotación Bolzaza $25','Foto; precio por nivel',topNote+' Bolsa morada y amarilla.'],
  ['Cheetos Torciditos Bolzaza',120,25,'7500478033904','https://cliente.laos.mx/tienda/Details?id=2967&name=Cheetos%2520torciditos%2520Bolzaza%2520120%2520g&sku=7500478033904','Foto: anotación Bolzaza $25','Foto; precio por nivel',topNote+' Bolsa naranja parcialmente cubierta.'],
  ['Sabritas Original Bolzaza',74,25,'7500478044320',pharmacy+'sabritas-original-68-g-bolzaza-copia','Foto: anotación Bolzaza $25','Foto; precio por nivel',topNote],
  ['Ruffles Queso Bolzaza',88,25,'7500478044269',pharmacy+'ruffles-queso-82-g-sabritas-bolzaza','Foto: anotación Bolzaza $25','Foto; precio por nivel',topNote],
  ['Sabritas Original',45,22,'7501011101456',pharmacy+'sabritas-original-45-g','Foto: cenefa amarilla $22','Foto; precio por nivel','Bolsa amarilla parcialmente cubierta en el segundo nivel.'],
  ['Sabritas Adobadas',45,22,'7501011101463',pharmacy+'sabritas-adobadas-45-g','Foto: cenefa amarilla $22','Foto; precio por nivel','Bolsa roja.'],
  ['Sabritas Receta Crujiente Flamin Hot',49,22,'7500478038664',pharmacy+'sabritas-receta-crujiente-flamin-hot-49-g-copia','Foto: cenefa amarilla $22','Foto; identificación por empaque','Identificación inferida de la bolsa roja y negra del segundo nivel; texto de sabor parcialmente cubierto.'],
  ['Sabritas Crema y Especias',45,22,'7500478043965',pharmacy+'sabritas-crema-y-especias-45-g','Foto: cenefa amarilla $22','Foto; identificación por empaque','Identificación inferida de la bolsa blanca del segundo nivel.'],
  ['Sabritas Habanero',45,22,'7501011137431',pharmacy+'sabritas-habanero-45-g','Foto: cenefa amarilla $22','Foto; identificación por empaque','Identificación inferida de la bolsa rosa del segundo nivel.'],
  ['Doritos Nacho',61,22,'7501011123588',pharmacy+'doritos-nachos-58-g-sabritas','Foto: cenefa verde $22','Foto; precio por nivel',''],
  ['Ruffles Queso',52,22,'7501011104099',pharmacy+'ruffles-queso-50-g-sabritas','Foto: cenefa verde $22','Foto; precio por nivel',''],
  ['Sabritas Flamin Hot',44,22,'7500478043941','https://onixsuper.com/producto/sabritas-flamin-hot-45-gr/','Foto: cenefa verde $22','Foto; precio por nivel','Bolsa morada con chile y limón a la derecha del tercer nivel. Código contrastado con el SKU público de Onix y Farmacia Santa Fe, porque un campo barcode de esta última concatena dos códigos.'],
  ['Doritos Dinamita Chile y Limón',70,22,'7500478018512',pharmacy+'doritos-dinamita-65-g','Foto: cenefa roja Doritos $22','Foto; precio por nivel',''],
  ['Doritos Dinamita Flamin Hot',70,22,'7500478026036',pharmacy+'doritos-dinamita-flamin-hot-70-g','Foto: cenefa roja Doritos $22','Foto; precio por nivel',''],
  ['Doritos Incógnita',61,22,'7501011123878',pharmacy+'doritos-incognita-61-g-sabritas-1','Foto: cenefa roja Doritos $22','Foto; identificación por empaque','Bolsa morada inclinada a la derecha de Dinamita; identificación de sabor por diseño.'],
  ['Crujitos Queso y Chile',42,18,'7501011142299',pharmacy+'crujitos-43-g-sabritas','Foto: $18 manuscrito bajo Crujitos','Foto; anotación bajo producto','En el mismo nivel existe etiqueta $20 bajo Fritos/Rancheritos. Se conserva $18 para Crujitos por ubicación de la anotación; confirmar.'],
  ['Fritos Chorizo y Chipotle',60,20,'7501011112254',pharmacy+'fritos-salsa-negra-70g-copia','Foto: cenefa roja $20','Foto; precio por nivel',''],
  ['Rancheritos Original',58,20,'7501011111028',pharmacy+'rancheritos-60-g-sabritas','Foto: cenefa roja $20','Foto; precio por nivel',''],
  ['Cheetos Torciditos',48,18,'7501011143586',pharmacy+'cheetos-torciditos-sabritas-52-g','Foto: cenefa negra Cheetos $18','Foto; precio por nivel','Bolsa naranja al lado izquierdo del nivel Cheetos.'],
  ['Cheetos Poffs',38,18,'7500478014606',pharmacy+'cheetos-poffs-sabritas-41-g','Foto: cenefa negra Cheetos $18','Foto; precio por nivel','Bolsas azules con texto Poffs.'],
  ['Cheetos Colmillos',27,18,'7500478044184','https://farmaciasanjorge.com/products/26993','Foto: cenefa negra Cheetos $18','Foto; precio por nivel','El catálogo consultado usa EAN 7500478044184; su imagen conserva un código anterior en el nombre del archivo. Se usa el EAN declarado, sujeto a confirmación física.'],
  ['Cheetos Jalaqueño',58,18,'7500478046034',rappi,'Foto: cenefa negra Cheetos $18','Foto; precio por nivel','Bolsas verdes. La fuente de Rappi asocia expresamente el código a Jalaqueño 58 g.'],
  ['Cheetos Bolitas',42,18,'7500478044214',pharmacy+'cheetos-bolitas-42-gr-sabritas-copia','Foto: cenefa naranja inferior $18','Foto; precio por nivel',''],
  ['Sabritas Donitas Sal y Limón',50,18,'7500478052271',pharmacy+'sabritones-donitas-sal-y-limon-50g','Internet: Farmacia Santa Fe, una bolsa','Internet; confirmar presentación','Bolsa verde colgante a la derecha sin precio propio legible. La ficha actual lo comercializa como Sabritones Donitas Sal y Limón; confirmar código por diferencia de marca/diseño.'],
  ['Karate Cacahuates Japoneses',72,15,'7500478025985',pharmacy+'karate-cacahuate-estilo-japones-75-g','Internet: Farmacia Santa Fe, una bolsa','Internet; sin precio legible en foto','Tira de bolsas azules con logotipo de puño blanco a la izquierda. No se aplica la etiqueta $20 de Chips a esta tira.'],
  ['Karate Cacahuates Enchilados',62,10,'7500478025992',pharmacy+'karate-cacahuates-enchilado-62-g','Internet: Farmacia Santa Fe, una bolsa','Internet; identificación por empaque','Bolsa verde colgante junto a la tira azul; sabor inferido del diseño.'],
  ['Barcel Hot Nuts Original',125,20,'757528044121',pharmacy+'hot-nuts-original-barcel-100-g','Internet: Farmacia Santa Fe, una bolsa','Internet; identificación por empaque','Bolsa café en la esquina superior izquierda. Código UPC-A de 12 dígitos; no se agrega un dígito.'],
  ['Barcel Hot Nuts Fuego',125,22,'757528044138',pharmacy+'hot-nuts-fuego-barcel-125-g','Internet: Farmacia Santa Fe, una bolsa','Internet; identificación por empaque','Bolsa naranja en la esquina superior izquierda; sabor inferido del diseño. Código UPC-A de 12 dígitos.'],
  ['Barcel Big Mix Clásico',80,15,'7500810005033',pharmacy+'big-mix-clasico-con-tostachos-takis-valentones-arealos-65-g-barcel','Internet: Farmacia Santa Fe, una bolsa','Internet; identificación por empaque','Bolsa café/roja a la izquierda; identificación inferida del diseño.'],
  ['Barcel Big Mix Fuego',80,20,'7500810013199',pharmacy+'big-mix-fuego-con-tostachos-takis-valentones-arelos-65-g-barcel','Internet: Farmacia Santa Fe, una bolsa','Internet; identificación por empaque','Bolsa morada en la parte inferior izquierda. La ficha actual de este código indica 80 g; se usa ese gramaje de referencia.'],
  ['Barcel Big Mix Jalapeño',75,25,'7503031361551','https://superdtodo.com/product/big-mix-jalapeno-75-gr','Internet: Super D Todo, una bolsa','Internet; identificación por empaque','Bolsa verde parcialmente cortada en el lado izquierdo. Precio publicado $25; la ficha indica agotado. No es precio leído de la foto.'],
].map(([base,grams,price,barcode,url,priceSource,status,note]) => ({base,grams,price,barcode,url,priceSource,status,note,name:`${base} ${grams} g`}));

const headers = ['categoria','nombre_articulo','tipo_venta','unidad_venta','nombre_variante','precio_venta','precio_coste','seguimiento_existencias','existencias','codigo_barras'];
const exporter = await fs.readFile('/Users/benjamin/Projects/POS/pos_flutter/lib/data/local/export/articulo_catalog_csv.dart','utf8');
const block = exporter.match(/static const columnas = <String>\[([\s\S]*?)\];/)[1];
assert.deepEqual(headers,[...block.matchAll(/'([^']+)'/g)].map(m=>m[1]));
assert.equal(products.length,32);
assert.equal(new Set(products.map(p=>p.name)).size,products.length);
assert.equal(new Set(products.map(p=>p.barcode)).size,products.length);
for (const p of products) {
  assert.match(p.barcode,/^(?:\d{12}|\d{13})$/);
  const digits=[...p.barcode.slice(0,-1)].reverse();
  const sum=digits.reduce((a,n,i)=>a+Number(n)*(i%2===0?3:1),0);
  assert.equal((10-sum%10)%10,Number(p.barcode.at(-1)),`Código inválido: ${p.name}`);
  assert.ok(p.price>0 && p.name.length<=160);
  const source=catalog.find(q=>q.url===p.url);
  if (source) {
    assert.ok(source.variants.some(v=>v.barcode===p.barcode||v.sku===p.barcode), `Código no coincide con fuente: ${p.name}`);
    assert.ok(source.title.includes(String(p.grams)), `Gramaje no coincide con título: ${p.name}`);
    if(p.priceSource.startsWith('Internet:')) assert.ok(source.variants.some(v=>v.price===Math.round(p.price*100)),`Precio no coincide con fuente: ${p.name}`);
  }
}

const workbook=Workbook.create();
const sheet=workbook.worksheets.add('Carga masiva');
const rows=products.map(p=>['',p.name,'unidad','','',p.price,'','no','',p.barcode]);
sheet.getRange(`A1:J${rows.length+1}`).values=[headers,...rows];
sheet.getRange(`F2:G${rows.length+1}`).setNumberFormat('0.00');
sheet.getRange(`J2:J${rows.length+1}`).setNumberFormat('0');

const refHeaders=['nombre_articulo','gramaje_estimado_g','precio_venta_mxn','codigo_barras_referencia','origen_precio','estado_revision','fuente_codigo_y_presentacion','fuente_precio','observaciones','fecha_consulta'];
const refRows=products.map(p=>[p.name,p.grams,p.price,p.barcode,p.priceSource,p.status,p.url,p.priceSource.startsWith('Internet:')?p.url:photo,[commonNote,p.note].filter(Boolean).join(' '),'2026-10-16']);
const omitted=[
  ['Barcel Big Mix bolsa azul','','','','Foto','Omitido de carga: sabor no legible','','','Se ve la marca en el lateral izquierdo; no se distingue el sabor con suficiente seguridad.','2026-10-16'],
  ['Bolsas moradas y rosa del nivel inferior','','','','Foto','Omitido de carga: producto no legible','','','No se asigna una marca, sabor o código sin poder identificarlo.','2026-10-16'],
  ['Otros empaques parcialmente cortados en los bordes','','','','Foto','Omitido de carga: producto no legible','','','Incluye empaques parciales superiores y pan/botanas del borde derecho.','2026-10-16'],
];
const review=workbook.worksheets.add('Referencias');
review.getRange(`A1:J${refRows.length+omitted.length+1}`).values=[refHeaders,...refRows,...omitted];
review.getRange(`C2:C${refRows.length+1}`).setNumberFormat('0.00');
review.getRange(`D2:D${refRows.length+1}`).setNumberFormat('0');

for (const ws of [sheet,review]) {
  const end=ws===sheet?rows.length+1:refRows.length+omitted.length+1;
  ws.showGridLines=false;
  ws.getRange(`A1:J${end}`).format.font={name:'Arial',size:10};
  ws.getRange('A1:J1').format={fill:'#1E3A5F',font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'},rowHeight:36,wrapText:true,horizontalAlignment:'center',verticalAlignment:'center'};
  ws.getRange(`A2:J${end}`).format.rowHeight=24;
  ws.freezePanes.freezeRows(1);
}
for(const [col,width] of [['A',14],['B',53],['C',13],['D',16],['E',20],['F',17],['G',17],['H',25],['I',14],['J',23]]) sheet.getRange(`${col}1:${col}${rows.length+1}`).format.columnWidth=width;
for(const [col,width] of [['A',53],['B',17],['C',17],['D',23],['E',47],['F',47],['G',80],['H',80],['I',160],['J',17]]) review.getRange(`${col}1:${col}${refRows.length+omitted.length+1}`).format.columnWidth=width;
workbook.recalculate();
const actual=sheet.getRange(`A1:J${rows.length+1}`).values.map(row=>row.map(v=>v??''));
assert.deepEqual(actual,[headers,...rows]);
const actualRefs=review.getRange(`A1:J${refRows.length+omitted.length+1}`).values.map(row=>row.map(v=>v??''));
assert.deepEqual(actualRefs,[refHeaders,...refRows,...omitted]);

const escape=v=>/[",\r\n]/.test(String(v??''))?`"${String(v).replaceAll('"','""')}"`:String(v??'');
const csv=(matrix,decimalCols)=>'\uFEFF'+matrix.map((row,i)=>row.map((value,j)=>escape(i>0&&decimalCols.includes(j)&&value!==''?Number(value).toFixed(2):value)).join(',')).join('\r\n')+'\r\n';
await fs.mkdir(outputDir,{recursive:true});
const output=path.join(outputDir,'sabritas_productos_carga_masiva.csv');
const references=path.join(outputDir,'sabritas_referencias_y_estimaciones.csv');
await fs.writeFile(output,csv(actual,[5,6]),'utf8');
await fs.writeFile(references,csv(actualRefs,[2]),'utf8');
const inspection=await workbook.inspect({kind:'region',sheetId:sheet.name,range:'A1:J9',tableMaxRows:9,tableMaxCols:10,maxChars:4500});
await fs.writeFile(path.join(taskDir,'revision.ndjson'),inspection.ndjson);
const errorCheck=await workbook.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:20},maxChars:1000});
await fs.writeFile(path.join(taskDir,'errores.ndjson'),errorCheck.ndjson);
for(const [ws,range,file] of [[sheet,'A1:J11','vista_previa.png'],[review,'A1:F11','referencias_vista_previa.png']]) {
  const preview=await workbook.render({sheetName:ws.name,range,scale:1,format:'png'});
  await fs.writeFile(path.join(taskDir,file),new Uint8Array(await preview.arrayBuffer()));
}
const summary={output,references,articulos:products.length,conCodigo:products.filter(p=>p.barcode).length,preciosFoto:products.filter(p=>p.priceSource.startsWith('Foto:')).length,preciosInternet:products.filter(p=>p.priceSource.startsWith('Internet:')).length,nota:'Todos los gramajes son estimados. Códigos consultados de presentaciones de referencia; requieren comprobación contra el producto físico. Precios ambiguos documentados. Categorías y costos vacíos; sin inventar saldos de inventario.',products};
await fs.writeFile(path.join(taskDir,'validacion.json'),JSON.stringify(summary,null,2));
console.log(JSON.stringify({...summary,products:undefined},null,2));
