import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {Workbook} from '@oai/artifact-tool';

const taskDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(taskDir, '../..');
const outputDir = path.join(root, 'outputs/barcel_foto_20261016');
const consultedPrices = process.argv.includes('--precios-consultados');
const pharmacy = 'https://www.fpsf.mx/products/';
const nogales = 'https://vinaterialosnogales.com/index.php?categoria=FRITURAS+Y+BOTANAS';
const fenix = 'https://superfenix.mx/producto/cacahuates-kiyakis-japoneses-60-g/';
const commonNote = 'Gramaje estimado por el tamaño de la bolsa en la foto, autorizado por el usuario. Código consultado para esa presentación; confirmar contra el empaque físico.';

// The photo identifies the product/flavour and shelf prices. Package weights
// are estimates explicitly requested by the user, not transcribed weights.
const products = [
  ['Barcel Chips crema y especias',62,20,'7500810039168',pharmacy+'chips-sal-62-gr-barcel-copia','Foto: cenefa Chips $20','También se publica como 52 g con el mismo código. Se usa la presentación de 62 g de la fuente citada.'],
  ['Barcel Chips sal de mar',62,20,'7500810024560',pharmacy+'chips-sal-de-mar-56-gr-barcel-copia','Foto: cenefa Chips $20',''],
  ['Barcel Chips Fuego',62,20,'7500810024546',pharmacy+'chips-fuego-limon-62-gr-barcel','Foto: cenefa Chips $20',''],
  ['Takis Pix explosión de queso',65,20,'7500810046609',pharmacy+'takis-pix-explosion-de-queso-65-g','Foto: cenefa del nivel $20','Bolsa naranja con logotipo Pix.'],
  ['Takis Intense Nacho',70,20,'7500810041307',pharmacy+'takis-limon-70-g-barcel-copia-1','Foto: cenefa Takis $20',''],
  ['Takis Chile Limón',70,20,'7500810036822',pharmacy+'takis-fuego-70-g-barcel-copia','Foto: cenefa Takis $20',''],
  ["Takis Buckin' Ranch",70,20,'7500810040904',pharmacy+'takis-limon-70-g-barcel-copia','Foto: cenefa Takis $20','Identificado por la bolsa morada y celeste con imagen de aderezo blanco.'],
  ['Takis Fuego',70,20,'7500810003671',pharmacy+'takis-fuego-65-g','Foto: cenefa Takis $20',''],
  ['Takis Original',70,20,'7500810000441','https://mercadosnatura.com/product/takis-original-70g-barcel','Foto: cenefa Takis $20',''],
  ['Takis Salsa Brava',70,20,'7500810000502',nogales,'Foto: cenefa Takis $20',''],
  ['Takis Huakamoles',70,20,'7500810000489','https://popsamerica.com/es/patatas-fritas-americanas/1658-taki-huakamoles-70g.html','Foto: cenefa Takis $20',''],
  ['Takis Blue Heat',70,20,'7500810028353','https://maxder.mx/maxder/compras/producto/takis-blue-heat-70g/7500810028353-8288/','Foto: cenefa Takis $20',''],
  ['Barcel Pop Karameladas',45,18,'7500810005040',pharmacy+'pop-karameladas-barcel-50-g','Foto: cenefa inferior $18','Se incluye una sola fila aunque aparece más de una bolsa.'],
  ['Barcel Pop queso cheddar',45,18,'7500810013564','https://store13343.store.link/product/sp-barcel-pop-queso-cheddar-45-gr-popsenque45g-7500810013564/','Foto: cenefa inferior $18',''],
  ['Barcel Toreadas habanero',45,18,'7500810027813','https://superfenix.mx/producto/papas-fritas-barcel-toreadas-chile-habanero-45-g/','Foto: cenefa inferior $18',''],
  ['Barcel chicharrón de cerdo natural',30,18,'7503030199728',pharmacy+'chicharron-100-de-cerdo-natural-30-g-barcel','Foto: cenefa Runners $18',''],
  ['Barcel Chipotles queso y chipotle',65,18,'7500810027646',nogales,'Foto: cenefa Runners $18',''],
  ['Barcel Runners Fuego',72,18,'7500810027820',nogales,'Foto: cenefa Runners $18','Bolsa morada.'],
  ['Barcel Runners salsa picante',72,18,'7500810027837',nogales,'Foto: cenefa Runners $18','Bolsa roja. La fuente también lo identifica como Runners o Chile Limón.'],
  ['Barcel Big Mix Fuego',75,20,'7500810013199','https://superdtodo.com/product/big-mix-fuego-75-gr','Foto: $20 impreso en la bolsa',''],
  ['Barcel Big Mix Jalapeño',75,20,'7503031361551','https://superdtodo.com/product/big-mix-jalapeno-75-gr','Foto: $20 impreso en la bolsa',''],
  ['Karate cacahuates japoneses',75,10,'7500478023516','https://es.scribd.com/document/699626333/inventario-paginae','Foto: precio impreso parcialmente cubierto, interpretado como $10','Código de la presentación de 75 g de un catálogo público de inventario. El empaque también se vende en otros gramajes; confirmar presentación y precio.'],
  ['Barcel Kiyakis clásicos',60,17.10,'7500810027714',fenix,'Internet: Fénix, precio consultado el 2026-10-16','El precio de la foto no es legible. Se usa $17.10 como referencia externa, no como precio observado en el exhibidor.'],
].map(([base,grams,price,barcode,url,priceSource,note]) => ({base,grams,price,barcode,url,priceSource,note,name:`${base} ${grams} g`}));

if (consultedPrices) {
  const pharmacyQuotes = JSON.parse(await fs.readFile(path.join(taskDir,'precios_tienda_consultados.json'),'utf8'));
  const otherQuotes = JSON.parse(await fs.readFile(path.join(taskDir,'precios_referencia_adicionales.json'),'utf8'));
  const refs = new Map(otherQuotes.referencias.map(q=>[q.barcode,q]));
  const missing = new Map(otherQuotes.sin_referencia_actual.map(q=>[q.barcode,q.note]));
  for (const q of pharmacyQuotes) {
    const variant=q.variants.find(v=>v.barcode===q.barcode);
    assert.ok(variant,`El código no coincide con la fuente: ${q.barcode}`);
    assert.equal(variant.compare_at_price,null,'Revisar descuentos antes de elegir un precio regular.');
    assert.equal(variant.available,true);
    const product=products.find(p=>p.barcode===q.barcode);
    assert.ok(q.title.includes(String(product.grams)),`Gramaje diferente: ${q.title}`);
    refs.set(q.barcode,{barcode:q.barcode,grams:product.grams,price:variant.price/100,shop:'Farmacia Santa Fe',url:q.source,status:'Precio regular consultado',note:'Precio de una bolsa. La ficha no declara un precio anterior ni descuento.'});
  }
  assert.equal(refs.size,21);
  for (const p of products) {
    p.previousPrice=p.price;
    p.previousPriceSource=p.priceSource;
    p.priceRef=refs.get(p.barcode)??null;
    if (p.priceRef) {
      assert.equal(p.priceRef.grams,p.grams);
      p.price=p.priceRef.price;
      p.priceSource=`Internet: ${p.priceRef.shop}, precio regular o publicado de una bolsa en MXN`;
    } else {
      assert.ok(missing.has(p.barcode));
      p.priceSource='Foto: se conserva el precio anterior por falta de referencia actual coincidente';
    }
    p.pricingNote=p.priceRef?.note??missing.get(p.barcode);
  }
}

const headers = ['categoria','nombre_articulo','tipo_venta','unidad_venta','nombre_variante','precio_venta','precio_coste','seguimiento_existencias','existencias','codigo_barras'];
const exporter = await fs.readFile('/Users/benjamin/Projects/POS/pos_flutter/lib/data/local/export/articulo_catalog_csv.dart','utf8');
const block = exporter.match(/static const columnas = <String>\[([\s\S]*?)\];/)[1];
assert.deepEqual(headers,[...block.matchAll(/'([^']+)'/g)].map(m=>m[1]));
assert.equal(products.length,23);
assert.equal(new Set(products.map(p=>p.name)).size,products.length);
assert.equal(new Set(products.map(p=>p.barcode)).size,products.length);
for (const p of products) {
  assert.match(p.barcode,/^\d{13}$/);
  const sum = [...p.barcode.slice(0,-1)].reduce((total,n,i)=>total+Number(n)*(i%2?3:1),0);
  assert.equal((10-sum%10)%10,Number(p.barcode.at(-1)),`EAN inválido: ${p.name}`);
  assert.ok(p.price>0 && Number.isInteger(Math.round(p.price*100)));
  assert.ok(p.name.length<=160);
}

const rows = products.map(p=>['',p.name,'unidad','','',p.price,'','no','',p.barcode]);
const workbook = Workbook.create();
const sheet = workbook.worksheets.add('Carga masiva');
sheet.getRange(`A1:J${rows.length+1}`).values = [headers,...rows];
sheet.showGridLines = false;
sheet.getRange(`A1:J${rows.length+1}`).format.font = {name:'Arial',size:10};
sheet.getRange('A1:J1').format = {fill:'#1E3A5F',font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'},rowHeight:32};
sheet.getRange(`A2:J${rows.length+1}`).format.rowHeight = 24;
for(const [col,width] of [['A',14],['B',55],['C',15],['D',16],['E',20],['F',17],['G',17],['H',28],['I',14],['J',22]]) {
  sheet.getRange(`${col}1:${col}${rows.length+1}`).format.columnWidth=width;
}
sheet.getRange(`F2:G${rows.length+1}`).setNumberFormat('0.00');
sheet.getRange(`J2:J${rows.length+1}`).setNumberFormat('0');
sheet.freezePanes.freezeRows(1);
workbook.recalculate();
const actual=sheet.getRange(`A1:J${rows.length+1}`).values.map(row=>row.map(v=>v??''));
assert.deepEqual(actual,[headers,...rows]);

const reviewHeaders=consultedPrices
  ? ['nombre_articulo','gramaje_estimado_g','codigo_barras','precio_archivo_anterior_mxn','origen_precio_anterior','precio_regular_consultado_mxn','precio_aplicado_mxn','tienda_precio','fuente_precio','estado_precio','fecha_consulta','fuente_codigo_y_presentacion','observaciones']
  : ['nombre_articulo','gramaje_estimado_g','precio_venta_mxn','codigo_barras','origen_precio','fuente_codigo_y_presentacion','observaciones','fecha_consulta'];
const reviewRows=products.map(p=>consultedPrices
  ? [p.name,p.grams,p.barcode,p.previousPrice,p.previousPriceSource,p.priceRef?.price??'',p.price,p.priceRef?.shop??'',p.priceRef?.url??'',p.priceRef?.status??'Sin referencia actual: se conserva la foto','2026-10-16',p.url,[commonNote,p.note,p.pricingNote,'Referencia de venta al público de la tienda citada; no es un precio sugerido oficial del fabricante.'].filter(Boolean).join(' ')]
  : [p.name,p.grams,p.price,p.barcode,p.priceSource,p.url,[commonNote,p.note].filter(Boolean).join(' '),'2026-10-16']);
const review=workbook.worksheets.add('Referencias');
const lastReviewCol=consultedPrices?'M':'H';
review.getRange(`A1:${lastReviewCol}${reviewRows.length+1}`).values=[reviewHeaders,...reviewRows];
for (const col of consultedPrices?['D','F','G']:['C']) review.getRange(`${col}2:${col}${reviewRows.length+1}`).setNumberFormat('0.00');
review.getRange(`${consultedPrices?'C':'D'}2:${consultedPrices?'C':'D'}${reviewRows.length+1}`).setNumberFormat('0');
workbook.recalculate();
assert.deepEqual(review.getRange(`A1:${lastReviewCol}${reviewRows.length+1}`).values,[reviewHeaders,...reviewRows]);

const escape=v=>/[",\r\n]/.test(String(v??''))?`"${String(v).replaceAll('"','""')}"`:String(v??'');
const csv=(matrix,decimalColumns)=>'\uFEFF'+matrix.map((row,i)=>row.map((value,j)=>escape(i>0&&decimalColumns.includes(j)&&value!==''?Number(value).toFixed(2):value)).join(',')).join('\r\n')+'\r\n';
await fs.mkdir(outputDir,{recursive:true});
const output=path.join(outputDir,consultedPrices?'barcel_productos_precios_consultados.csv':'barcel_productos_carga_masiva.csv');
const references=path.join(outputDir,consultedPrices?'barcel_comparacion_precios.csv':'barcel_referencias_y_estimaciones.csv');
await fs.writeFile(output,csv(actual,[5,6]),'utf8');
await fs.writeFile(references,csv([reviewHeaders,...reviewRows],consultedPrices?[3,5,6]:[2]),'utf8');
const inspection=await workbook.inspect({kind:'region',sheetId:sheet.name,range:'A1:J8',tableMaxRows:8,tableMaxCols:10,maxChars:5000});
await fs.writeFile(path.join(taskDir,consultedPrices?'revision_precios.ndjson':'revision.ndjson'),inspection.ndjson);
const preview=await workbook.render({sheetName:sheet.name,range:'A1:J12',scale:1,format:'png'});
await fs.writeFile(path.join(taskDir,consultedPrices?'vista_previa_precios.png':'vista_previa.png'),new Uint8Array(await preview.arrayBuffer()));
const summary={output,references,articulos:products.length,conCodigo:products.filter(p=>p.barcode).length,preciosFoto:products.filter(p=>p.priceSource.startsWith('Foto:')).length,preciosInternet:products.filter(p=>p.priceSource.startsWith('Internet:')).length,cambiosDePrecio:consultedPrices?products.filter(p=>p.price!==p.previousPrice).length:0,nota:'Todos los gramajes son estimaciones autorizadas, no lecturas de la foto. Costos vacíos y seguimiento de existencias desactivado para no inventar saldos.',omitidos:'Bolsas amarilla y roja parcialmente tapadas: no se identifica con seguridad el producto o sabor.',products};
await fs.writeFile(path.join(taskDir,consultedPrices?'validacion_precios.json':'validacion.json'),JSON.stringify(summary,null,2));
console.log(JSON.stringify({...summary,products:undefined},null,2));
