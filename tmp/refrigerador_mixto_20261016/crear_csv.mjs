import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { Workbook } from '@oai/artifact-tool';

const root = process.cwd();
const scratch = path.join(root, 'tmp/refrigerador_mixto_20261016');
const output = path.join(root, 'outputs/refrigerador_mixto_20261016');
await fs.mkdir(output, { recursive: true });
const snapshots = JSON.parse(await fs.readFile(path.join(scratch, 'catalogos.json'), 'utf8'));
const catalog = snapshots.flatMap(s => s.products ?? []);
const selections = [
  ['3706962','New Mix Cantarito','Lata 473 ml','Estante superior, izquierda','Sabor legible; contenido inferido por el formato alto de lata.'],
  ['3268750','New Mix Paloma','Lata 473 ml','Estante superior, latas azules','Sabor legible en la lata del extremo derecho; contenido inferido por formato.'],
  ['3268752','New Mix Vampiro','Lata 473 ml','Estante superior, lata roja','Sabor legible; contenido inferido por formato.'],
  ['3610379','Amper Energy original','Lata 473 ml','Estante superior, centro','Versión original identificada por el diseño azul, negro y amarillo. Confirmar contenido en envase.'],
  ['3660515','Volt Blue Energy mora azul','Lata 473 ml','Estante superior, lata turquesa','Versión probable por color y diseño. Confirmar sabor y contenido en envase.'],
  ['3708135','Volt Dark Energy frutos del bosque','Lata 473 ml','Estante superior, lata morada con borde verde','Contenido 473 ml visible; versión por color y diseño.'],
  ['3515704','Corona Mega','Botella retornable 1200 ml','Estante medio, botellas de vidrio','Nombre y contenido 1.2 L legibles. El precio público puede requerir intercambio de envase o depósito adicional.'],
  ['3750583','Modelo Especial','Lata 710 ml','Estante medio, latas altas blancas al fondo izquierdo','Diseño blanco con borde dorado coincide con lata de 710 ml. Confirmar contenido, oculto en la foto.'],
  [null,'Victoria','Lata 473 ml','Estante medio, latas rojas del frente','Marca legible; contenido inferido por el formato. Referencia de precio por lata individual, no por paquete.'],
  ['3288036','Red Cola','Botella 3 L','Estante inferior, izquierda y centro','Contenido 3 L legible en la botella frontal; botellas parcialmente ocultas no se cuentan como tamaños adicionales.'],
  ['3110190','Jarritos limón','Botella 2 L','Estante inferior, botella de etiqueta verde','Sabor legible; contenido 2 L estimado por envase. Confirmar antes de importar.'],
  ['3431360','Jarritos uva','Botella 2 L','Estante inferior, derecha','Sabor probable por el color de etiqueta y líquido. Contenido 2 L estimado. Precio sugerido $26 impreso en el envase.'],
];

function validGtin(code) {
  if (!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(code)) return false;
  const sum = [...code.slice(0,-1)].reverse().reduce((s,c,i)=>s+Number(c)*(i%2===0?3:1),0);
  return (10-sum%10)%10 === Number(code.at(-1));
}

const data = selections.map(([id,name,variant,location,note]) => {
  if (id === null) return {
    name,variant,location,note,price:24,code:'7501064194139',
    sourceName:'CERVEZA VICTORIA 24/473 ML',store:'Garis',
    priceOrigin:'Precio público por lata individual (de 1 a 23 latas)',
    priceUrl:'https://ecommerce.garis.com.mx/online/detail_ProductTW.html?products=CERVEZA-VICTORIA-24%2F473-ML',
    codeUrl:'https://ecommerce.garis.com.mx/online/detail_ProductTW.html?products=CERVEZA-VICTORIA-24%2F473-ML',
    codeMethod:'SKU publicado por el comercio para la lata de 473 ml',
  };
  const p = catalog.find(p=>p.url.endsWith(`-${id}/p`));
  assert(p, `No encontrado: ${id}`);
  const item = p.items[0];
  // El campo ean del catálogo contiene códigos truncados o de caja en varias
  // fichas. Se conserva el identificador completo de la imagen comercial.
  const imageCode = new URL(item.image).pathname.split('/').at(-1).split('_')[0].split('.')[0];
  assert(validGtin(imageCode), `GTIN inválido para ${name}: ${imageCode}`);
  assert(item.price > 0, `Precio no disponible: ${name}`);
  return {
    name,variant,location,note,price:id==='3431360'?26:item.price,code:imageCode,
    sourceName:p.nombre,store:id==='3431360'?'Envase de la fotografía':'Chedraui',
    priceOrigin:id==='3431360'?'Precio sugerido impreso en el envase':'Precio público por pieza del catálogo, sin sucursal seleccionada',
    priceUrl:id==='3431360'?'Fotografía proporcionada: óvalo $26 en la botella derecha':p.url,
    codeUrl:item.image,
    codeMethod:'GTIN completo en el nombre de imagen del catálogo comercial; cotejar con el envase físico',
    catalogUrl:p.url,catalogPrice:item.price,
  };
});
assert.equal(data.length,12);
assert.equal(new Set(data.map(p=>p.code)).size,12);
assert(data.every(p=>validGtin(p.code) && p.price>0));

const columns = ['categoria','nombre_articulo','tipo_venta','unidad_venta','nombre_variante','precio_venta','precio_coste','seguimiento_existencias','existencias','codigo_barras'];
const sourceColumns = ['nombre_articulo','nombre_variante','precio_referencia_mxn','codigo_barras','observaciones','ubicacion_en_foto','origen_precio','comercio_o_fuente','fuente_precio','fuente_codigo','metodo_codigo','producto_en_catalogo','pagina_catalogo','precio_catalogo_mxn','fecha_consulta'];
const wb = Workbook.create();
const upload = wb.worksheets.add('Carga masiva');
const references = wb.worksheets.add('Referencias');
upload.getRange('A1:J13').values = [columns,...data.map(p=>[null,p.name,'unidad',null,p.variant,p.price,null,'no',null,p.code])];
references.getRange('A1:O13').values = [sourceColumns,...data.map(p=>[p.name,p.variant,p.price,p.code,p.note,p.location,p.priceOrigin,p.store,p.priceUrl,p.codeUrl,p.codeMethod,p.sourceName,p.catalogUrl??p.codeUrl,p.catalogPrice??p.price,'2026-10-16'])];
for (const sheet of [upload,references]) {
  sheet.showGridLines = false;
  const used = sheet.getUsedRange();
  used.format.font = {name:'Arial',size:10,color:'#172B3A'};
  used.format.rowHeight = 25;
  used.format.columnWidth = 22;
  const header = sheet.getRange(sheet===upload?'A1:J1':'A1:O1');
  header.format.fill = '#334155';
  header.format.font = {name:'Arial',size:10,bold:true,color:'#FFFFFF'};
  header.format.rowHeight = 42;
  header.format.wrapText = true;
}
upload.getRange('B1:B13').format.columnWidth=43;
upload.getRange('E1:E13').format.columnWidth=31;
upload.getRange('F2:G13').setNumberFormat('0.00');
upload.getRange('J2:J13').setNumberFormat('@');
references.getRange('A1:A13').format.columnWidth=43;
references.getRange('B1:B13').format.columnWidth=31;
references.getRange('C2:C13').setNumberFormat('0.00');
references.getRange('D2:D13').setNumberFormat('@');
references.getRange('E1:E13').format.columnWidth=105;
references.getRange('F1:O13').format.columnWidth=85;
references.getRange('N2:N13').setNumberFormat('0.00');
for (let i=0;i<data.length;i++) {
  const mask = '0'.repeat(data[i].code.length);
  upload.getRange(`J${i+2}`).setNumberFormat(mask);
  references.getRange(`D${i+2}`).setNumberFormat(mask);
}
wb.recalculate();
const inspected = await wb.inspect({kind:'table',range:'Carga masiva!A1:J13',include:'values',tableMaxRows:13,tableMaxCols:10,maxChars:2000});
await fs.writeFile(path.join(scratch,'inspeccion.ndjson'),inspected.ndjson);
for (const [sheet,range,file] of [[upload,'B1:F13','vista_carga.png'],[references,'A1:E13','vista_referencias.png']]) {
  const rendered = await wb.render({sheetName:sheet.name,range,scale:1,format:'png'});
  await fs.writeFile(path.join(scratch,file),new Uint8Array(await rendered.arrayBuffer()));
}
const quote = v => {
  const s=v===null||v===undefined?'':String(v);
  return /[",\r\n]/.test(s)?`"${s.replaceAll('"','""')}"`:s;
};
const csv = (rows,prices) => '\uFEFF'+rows.map((row,r)=>row.map((v,c)=>quote(r>0 && typeof v==='number' && prices.includes(c)?v.toFixed(2):v)).join(',')).join('\r\n')+'\r\n';
const uploadValues=upload.getRange('A1:J13').values;
assert.deepEqual(uploadValues[0],columns);
assert.deepEqual(uploadValues.slice(1).map(row=>row[9]),data.map(p=>p.code));
await fs.writeFile(path.join(output,'productos_carga_masiva.csv'),csv(uploadValues,[5,6]),'utf8');
await fs.writeFile(path.join(output,'productos_referencias.csv'),csv(references.getRange('A1:O13').values,[2,13]),'utf8');
await fs.writeFile(path.join(scratch,'productos_seleccionados.json'),JSON.stringify(data,null,2),'utf8');
await fs.writeFile(path.join(output,'LEEME.md'),`# Productos de la fotografía del refrigerador

12 presentaciones para revisar e importar. Moneda: MXN por pieza. Fecha de consulta: 16 de octubre de 2026.

## Archivos

- productos_carga_masiva.csv: usa exclusivamente las diez columnas aceptadas por el POS.
- productos_referencias.csv: documenta observaciones, precios, códigos y fuentes. No cargar este archivo como catálogo.

## Precios

Los precios son referencias públicas por pieza de Chedraui y Garis. Jarritos uva utiliza $26, el precio sugerido impreso que se alcanza a leer en la fotografía. Su precio de catálogo consultado es $25 y queda documentado por separado. No se conoce el precio de venta real del negocio. Ajustar precio_venta según corresponda. Para Corona Mega, confirmar si el proveedor cobra depósito por envase o requiere intercambio.

## Identificación

Nombre y contenido de Corona Mega 1.2 L y Red Cola 3 L se leen en la imagen. La lata morada Volt indica 473 ml. Los demás contenidos se seleccionaron según diseño y proporción del envase y requieren confirmación física, especialmente Modelo Especial 710 ml, Victoria 473 ml y Jarritos 2 L. Volt Blue y Jarritos uva requieren confirmar también el sabor.

Los códigos no se pudieron leer de la fotografía. Son referencias comerciales de las presentaciones seleccionadas: códigos completos de los nombres de imagen de Chedraui o SKU de Garis. No se completaron códigos truncados calculando números faltantes. Se verificó longitud, dígito de control y ausencia de duplicados; esto no prueba que el envase fotografiado tenga el mismo código. Cotejar las presentaciones con los envases antes de importar.

La lata plateada de espaldas, situada entre New Mix Vampiro y Amper, se omitió porque no es posible confirmar marca y presentación. Los envases repetidos se agruparon y los productos tapados no se trataron como presentaciones adicionales.

## Importación

UTF-8 con BOM, separador coma y precios con dos decimales. Los códigos se conservan como texto sin apóstrofos. Categoría, coste y existencias quedan vacíos; seguimiento de existencias desactivado. Cada lata o botella se vende como una unidad. La validación del formato se realiza sobre un catálogo vacío y no comprueba duplicados con los artículos ya existentes en tu negocio. No se escribió en ninguna base de datos.
`,'utf8');
console.log(JSON.stringify({presentaciones:data.length,codigos_validos:data.length,precios_mxn:data.map(p=>[p.name,p.variant,p.price,p.code]),archivos:[path.join(output,'productos_carga_masiva.csv'),path.join(output,'productos_referencias.csv')]}));
