import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { Workbook } from '@oai/artifact-tool';

const root = process.cwd();
const scratch = path.join(root, 'tmp/limpieza_abarrotes_20261019');
const output = path.join(root, 'outputs/limpieza_abarrotes_20261019');
const date = '2026-10-19';
const photo1 = 'WhatsApp Image 2026-10-19 at 17.46.09 (1).jpeg';
const photo2 = 'WhatsApp Image 2026-10-19 at 17.46.09.jpeg';
const limpieza = 'https://www.michedraui.com.mx/tyc/2023/2024/2023/tablas/02-febrero/productos/productos-participantes-limpiadores-febrero-2023.html';
const lavatrastes = 'https://www.michedraui.com.mx/tyc/2023/2024/2023/tablas/02-febrero/productos/productos-participantes-lavatrastes-febrero-2023.html';
const tang = 'https://www.rappi.com.mx/p/tang-bebida-en-polvo-horchata-3137957';
const tangCodigos = 'https://www.scribd.com/document/551682216/REVISAR-FALTANTES-TITAN';
const p = [];
function add(name, price, photo, location, confirmedSize, refSize, code, candidate, webPrice, webPriceSource, sizeCodeSource, note, include = true, onlySign = false) {
  p.push({name, price, photo, location, confirmedSize, refSize, code, candidate, webPrice, webPriceSource, sizeCodeSource, note, include, onlySign});
}

// Precios del negocio: rótulos de las fotografías; referencias web aparte.
add('Fabuloso 3X Mar Fresco 1 L',30,photo1,'Botella azul del extremo izquierdo','1 L','1 L','7501035910041','',35.10,'https://www.lagranbodega.com.mx/fabuloso-limpiador-multiusos-mar-fresco-1-lt/p',limpieza,'Etiqueta y contenido de 1 litro visibles. Se aplica el rótulo Fabuloso G $30.');
add('Fabuloso 3X Fresco Amanecer 1 L',30,photo1,'Botella verde con ramas y piñas de pino','1 L','1 L','7501035910096','',29.90,'https://www.klyns.mx/limp-liq-fabuloso-f-amanecer-1-lto/p','https://www.klyns.mx/limp-liq-fabuloso-f-amanecer-1-lto/p | https://www.scorpion.com.mx/fabuloso-limpiador-liquido-fresco-amanecer-1-lt.html','Identificación corroborada comparando el diseño verde con piñas de pino de Fresco Amanecer. Rótulo Fabuloso G $30.');
add('Fabuloso 3X Fresca Lavanda 1 L',30,photo1,'Botella morada central','1 L','1 L','7501035910034','',null,'',limpieza,'Contenido de 1 litro visible. Rótulo Fabuloso G $30. La fuente histórica se usa para EAN, no para precio actual.');
add('Fabuloso 3X Energía Naranja 1 L',30,photo1,'Botella naranja con etiqueta posterior','1 L','1 L','7509546008202','',null,'','https://www.propapel.mx/index.php?product_id=2506&route=product%2Fproduct','Contenido de 1 litro visible en la etiqueta posterior; variedad identificada por el líquido y etiqueta naranja. Rótulo Fabuloso G $30.');
add('Pinol limpiador multiusos (botella)',28,photo1,'Detrás de Salvo, tapa clara y líquido oscuro','','Aromas lavanda: 828 ml o 1 L','','7501025400118 | 7501025462116',25,'https://www.heb.com.mx/pinol-limpiador-multiusos-aromas-lavanda-828-ml-370341/p',limpieza+' | https://www.walmart.com.mx/ip/limpiador-liquido-pinol-aromas-lavanda-1-l/00750102546211','Pinol y precio $28 identificables. Aroma y contenido quedan ocultos; no se añaden al nombre. Precio web corresponde a 828 ml, solo referencia; ambos EAN son candidatos.');
add('Salvo Triple Poder limón líquido 300 ml',26,photo1,'Botella verde frontal con tapa roja','300 ml','300 ml','7506195196984','',null,'',lavatrastes,'La etiqueta dice CONT NET 300 ml. El texto 50% más es una comparación comercial; no se convierte el contenido en 450 ml. Rótulo Salvo $26.');
add('La Golondrina blanqueador 500 ml',9,photo1,'Botella verde pequeña frontal','500 ml','500 ml','','',4.20,'https://farmaciaparis.com/products/5273','https://farmaciaparis.com/products/5273','Precio del rótulo Golondrina Ch $9. No se encontró EAN suficientemente verificable; no se inventó.');
add('La Golondrina blanqueador (botella grande)',15,photo1,'Botella verde alta detrás de la de 500 ml','','1 L; una ficha comercial declara 960 ml','','',null,'','https://www.sams.com.mx/ip/cloro-liquido-la-golondrina-12-botellas-de-1-l-c-u/000323133 | https://www.expercom.mx/producto/blanqueador-la-golondrina-cloro-1-lt','Rótulo Golondrina $15. Contenido exacto oculto. Las fuentes describen 1 L y 960 ml; se conserva el nombre sin capacidad y sin EAN.');
add('Cloralex El Rendidor 500 ml',11,photo1,'Botella turquesa pequeña frontal','500 ml','500 ml','75000608','',10.09,'https://garis.mayoreoenlinea.mx/products/cloralex-regular-20-500-ml','https://farmaciasanjorge.com/products/42236','Rótulo Cloralex Ch $11. EAN-8 publicado para 500 ml; se conserva con sus ocho dígitos. Precio web por pieza de 1 a 19.');
add('Cloralex El Rendidor 1.17 L',19,photo1,'Botella turquesa grande derecha con 23% gratis','1.17 L','1.17 L','7501025405311','',15.90,'https://www.scorpion.com.mx/tienda/cloralex-blanqueador-1-17-l-28243.html','https://www.scorpion.com.mx/tienda/cloralex-blanqueador-1-17-l-28243.html','Contenido de 1.17 L visible; el 23% gratis ya forma parte de ese contenido. Rótulo Cloralex G $19.');
add('Tang limón (sobre)',10,photo1,'Exhibidor derecho, sobre verde superior','','11 g y 13 g según presentación','','',6.50,'https://www.heb.com.mx/tang-bebida-en-polvo-limon-13-gr-101960/p','https://www.heb.com.mx/tang-bebida-en-polvo-limon-13-gr-101960/p','Sabor limón legible y rótulo Tang $10. No se lee contenido neto: no se fija gramaje ni EAN. La ficha actual declara 11 g aunque la URL menciona 13 g.');
add('Tang tamarindo (sobre)',10,photo1,'Exhibidor derecho, sobre blanco y marrón','','11 g y 13 g según presentación','','',6.50,tang,'https://www.walmart.com.mx/ip/bebida-en-polvo-tang-tamarindo-13-g/00762221057294','Sabor tamarindo legible; rótulo Tang $10. Se encontraron versiones de 11 y 13 g; el contenido del sobre fotografiado no es legible. Sin EAN asignado.');
add('Tang uva (sobre)',10,photo1,'Exhibidor derecho, sobre morado','','11 g, 13 g y 14 g según referencia','','7622210563125',6.50,tang,tangCodigos,'Color y nombre uva reconocibles; rótulo Tang $10. El EAN candidato se documenta como 14 g y no se asigna al sobre de gramaje ilegible.');
add('Tang horchata (sobre)',10,photo1,'Exhibidor derecho, sobre claro junto al de uva','','11 g, 13 g y 14 g según referencia','','7622210562975',6.50,tang,'https://alsuper.com/producto/bebida-en-polvo-516718 | '+tangCodigos,'Horchata se distingue en la banda superior. Rótulo Tang $10. Candidato de 14 g sin asignar; la presentación actual consultada es de 11 g.');
add('Tang jamaica (sobre)',10,photo1,'Exhibidor derecho, sobre rojo inferior','','11 g, 13 g y 14 g según referencia','','7622210562951',6.50,tang,tangCodigos,'Sabor jamaica identificado en el sobre rojo; rótulo Tang $10. Gramaje ilegible; el EAN candidato corresponde a una referencia de 14 g.');
add('La Moderna pasta Caracol No. 2 200 g',10,photo1,'Bolsa al frente en la parte inferior izquierda','200 g','200 g','7501018310561','',9.95,'https://www.mayoreototal.mx/collections/all/venta-de-abarrotes-al-mayoreo?page=31','https://tulum.gob.mx/Transparenciaftp/2023/DIF/IX/4to%20Trim/20%20DICIEMBRE%20TOMO%202/D000306-000341-000416.pdf','Rótulo Sopas $10. Nombre y 200 g visibles. Precio web unitario calculado: caja $199 entre 20 bolsas; no es precio de una bolsa publicado por separado.');
add('La Moderna pasta Fideo No. 2 200 g',10,photo1,'Bolsa superior de la pila derecha','200 g','200 g','7501018310035','',9,'https://cremeriayabarroteshh.com/product/pasta-la-moderna-fideo-2-200gr','https://cremeriayabarroteshh.com/product/pasta-la-moderna-fideo-2-200gr','Nombre Fideo 2 y contenido 200 g visibles. Rótulo Sopas $10.');
add('La Moderna pasta Codo No. 2 200 g',10,photo1,'Bolsas de la parte media e inferior de la pila derecha','200 g','200 g','7501018310523','',null,'','https://terapoint.mx/productos','Codo 2 y 200 g visibles en las bolsas de la pila. Rótulo Sopas $10. Se agrupan las bolsas repetidas, sin deducir existencias.');
add('1-2-3 aceite vegetal 500 ml',25,photo2,'Botella pequeña frontal con tapa roja','500 ml, por rótulo del anaquel','500 ml','75005443','',25,'https://www.soriana.com/aceite-comestible-vegetal-1-2-3-500-ml/690016.html','https://maxder.mx/maxder/compras/producto/aceite-1-2-3-comestible-500ml/75005443-12/','El anaquel identifica 1 2 3 500 ml, pero no permite leer un precio inequívoco. Se usa referencia de venta por pieza en Soriana; confirmar precio del negocio.');
add('1-2-3 aceite vegetal 1 L',40,photo2,'Botella grande central con tapa roja','1 L, por rótulo del anaquel','1 L','75002343','',40,'https://kiosco.www.walmart.com.mx/ip/Aceite-vegetal-1-2-3-1-l/00000007500234','https://ammatiendita.com/productos/aceite-vegetal-comestible-123-1-litro-1-2-3/','El anaquel identifica 1 2 3 1 L. Precio de carga tomado de Walmart, vendido por Walmart; confirmar precio del negocio. EAN-8 publicado también con ceros iniciales de relleno; se conserva la forma de ocho dígitos.');
add('Cristal aceite vegetal 500 ml',25,photo2,'Botellas pequeñas frontales con tapa blanca','500 ml','500 ml','7501048100200','',null,'','https://cremeriayabarroteshh.com/product/aceite-cristal-500ml','Etiqueta 500 ml visible. Precio de anaquel Aceite 500 ml $25. Corresponde a aceite vegetal; no se usa el código de Cristal de maíz.');
add('Cristal aceite vegetal 1 L',42,photo2,'Botellas de tapa blanca detrás de las de 500 ml','1 L, por rótulo del anaquel','1 L','7501048100163','',49,'https://www.abasto.com.mx/','https://superflash.com.mx/producto/aceite-cristal-1l/','Rótulo del anaquel Aceite 1 L y precio manuscrito $42. Se agrupan las botellas repetidas.');
add('Cristal aceite vegetal 1.5 L',70,photo2,'Botella grande del extremo derecho','1.5 L','1.5 L','7501048100248','',66,'https://www.basicos.mx/aceite-cristal-vegetal-15-lts','https://www.basicos.mx/aceite-cristal-vegetal-15-lts','Contenido de 1.5 L visible y anaquel 1.5 L $70. Se distingue del Cristal de maíz, que tiene otro EAN.');
add('Valentina salsa picante etiqueta amarilla 1 L',37,photo2,'Botella de salsa grande, etiqueta amarilla y tapa roja','','1 L','097339000030','',37,'https://www.walmart.com.mx/ip/salsa-picante-valentina-etiqueta-amarilla-1-l/00009733900003','https://dulceria-sam-y-clau.odoo.com/shop/a01841-valentina-amarilla-1l-bo-c12-16727?category=10','Presentación de 1 L identificada por el envase grande y su correspondencia con fichas comerciales; el contenido neto no se lee en la foto. Precio web por pieza, confirmar precio del negocio y el UPC en el envase. Se conserva el cero inicial.');
add('La Botanera salsa clásica (botella)',20,photo2,'Botellas pequeñas de tapa amarilla del lado izquierdo','','370 g según fabricante; tiendas también la describen como 370 ml','','7503024085990 | 738545010481',17.50,'https://www.farmaciasguadalajara.com/alimentos/aderezos-y-salsas/salsa-picante-la-botanera-clasica--370-ml.-1318179.html','https://www.labotanera.com/producto/clasica/ | https://michedraui.com.mx/tyc/2023/tablas/03-marzo/productos/productos-quedate-marzo-2026.pdf | https://www.basicos.mx/salsa-botanera-clasica-370-mll','Rótulo inferior Botanera $20. Contenido neto ilegible; no se añade al nombre. Se encontraron códigos de presentaciones distintas; quedan únicamente como candidatos.');

// Productos adicionales identificados únicamente en la lista manuscrita.
add('Carisma detergente en polvo 1 kg',50,photo1,'Lista manuscrita: Carisma 1 k $50','1 kg, por rótulo','1 kg','','',49,'https://www.walmart.com.mx/ip/detergente-en-polvo-carisma-para-ropa-blanca-y-de-color-1-kg/00750102602303','https://www.soriana.com/detergente-en-polvo-para-ropa-carisma-biodegradable-1-kg/11205748.html','Identificación y precio solo desde rótulo. No se ve el empaque; no se asigna EAN ni se afirma que exista inventario.',true,true);
add('Roma detergente en polvo 1 kg',42,photo1,'Lista manuscrita: Roma 1 k $42','1 kg, por rótulo','1 kg','','7501026004605',44.30,'https://siltecsa.mx/products/roma-detergente-de-1-kg?variant=46458171195645','https://laresistente.com.mx/product/detergente-roma-1-kg/','Identificación, capacidad y precio solo desde rótulo. El EAN encontrado queda como candidato porque el empaque no aparece.',true,true);
add('Salvo detergente en polvo 500 g',22,photo1,'Lista manuscrita: Salvo 500 g $22','500 g, por rótulo','Multiusos 500 g; también se encontraron otros Salvo de 500 g','','7500435160902',26.90,'https://www.scorpion.com.mx/tienda/salvo-detergente-multiusos-500-gr.html','https://www.scribd.com/document/917178497/Invent-a-Rio','Solo rótulo; variedad exacta no confirmada. Precio web es de Multiusos; EAN candidato sin asignar.',true,true);
add('Roma detergente en polvo 500 g',23,photo1,'Lista manuscrita: Roma 500 g $23','500 g, por rótulo','500 g','','',null,'','https://multiglobalproducts.com/wp-content/uploads/2025/08/MGP-Catalog.2.pdf','Identificación, capacidad y precio solo desde rótulo. No se ve empaque. No se asignó código de barras.',true,true);

// Detecciones que no permiten crear un producto suficientemente identificado.
add('Tang sobre amarillo (sabor sin confirmar)',10,photo1,'Exhibidor Tang, extremo inferior derecho','','Sobre; gramaje no legible','','',null,'','','Solo se distingue parte del sobre amarillo; no se elige entre piña, mango u otro sabor.',false);
add('Aceite de etiqueta verde (marca sin confirmar)',40,photo2,'Botella de tapa verde detrás de 1-2-3','','Contenido no legible','','',null,'','','Se observa $40 escrito en el cuello. Marca y contenido no legibles; no se asigna a Nutrioli, Ave u otra marca por parecido.',false);
add('Salsa Valentina pequeña (presentación sin confirmar)',null,photo2,'Botella pequeña de tapa roja parcialmente oculta detrás de La Botanera','','Contenido no legible','','',null,'','','No se distingue su etiqueta completa, capacidad ni precio; no se crea una segunda presentación de Valentina.',false);
add('Mole en frasco (marca sin confirmar)',null,photo2,'Esquina inferior izquierda, anaquel inferior','','Contenido no legible','','',null,'','','Mole visible, pero marca, tamaño y precio no están suficientemente claros. No se asigna EAN por semejanza del frasco.',false);
add('Fabuloso chico (aroma y capacidad sin confirmar)',13,photo1,'Lista manuscrita: Fabuloso Ch $13','','Capacidad y fragancia no especificadas','','',null,'','','El rótulo no identifica aroma ni capacidad; no se crean variantes adicionales a partir de este rótulo.',false,true);

const selected = p.filter(x => x.include);
const assigned = selected.filter(x => x.code);
const validGtin = code => {
  if (!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(code)) return false;
  const s = [...code.slice(0,-1)].reverse().reduce((a,c,i)=>a+Number(c)*(i%2===0?3:1),0);
  return (10-s%10)%10 === Number(code.at(-1));
};
assert.equal(selected.length,29);
assert.equal(assigned.length,16);
assert.equal(new Set(selected.map(x=>x.name)).size,selected.length);
assert.equal(new Set(assigned.map(x=>x.code)).size,assigned.length);
assert(selected.every(x=>Number.isFinite(x.price)&&x.price>0));
for(const item of p) {
  if(item.code) assert(validGtin(item.code),`${item.name}: ${item.code}`);
  for(const code of item.candidate.split(' | ').filter(Boolean)) assert(validGtin(code),`${item.name}: candidato ${code}`);
}

const headers = ['categoria','nombre_articulo','tipo_venta','unidad_venta','nombre_variante','precio_venta','precio_coste','seguimiento_existencias','existencias','codigo_barras'];
const uploadValues = [headers,...selected.map(x=>[null,x.name,'unidad',null,null,x.price,null,'no',null,x.code||null])];
const reviewHeaders = ['nombre_articulo','incluido_en_carga','precio_carga_mxn','origen_precio_carga','presentacion_foto','codigo_barras_asignado','estado','precio_rotulo_mxn','precio_referencia_internet_mxn','presentacion_referencia_internet','codigo_candidato_no_asignado','fotografia','ubicacion','fuente_precio_internet','fuente_presentacion_y_codigo','fecha_consulta','observaciones'];
const onlineNames = new Set(['1-2-3 aceite vegetal 500 ml','1-2-3 aceite vegetal 1 L','Valentina salsa picante etiqueta amarilla 1 L']);
const reviewValues = [reviewHeaders,...p.map(x=>[x.name,x.include?'si':'no',x.include?x.price:null,onlineNames.has(x.name)?'Internet: precio de referencia':x.price!==null?'Rótulo en fotografía':null,x.confirmedSize||null,x.code||null,!x.include?'Pendiente: identificación incompleta':x.onlySign?'Solo identificado en rótulo; validar empaque':!x.code?'Importable sin EAN; revisar presentación/código':'EAN publicado; cotejar envase',onlineNames.has(x.name)?null:x.price,x.webPrice,x.refSize||null,x.candidate||null,x.photo,x.location,x.webPriceSource||null,x.sizeCodeSource||null,date,x.note])];
const wb = Workbook.create();
const upload = wb.worksheets.add('Carga masiva');
const review = wb.worksheets.add('Revisión y fuentes');
upload.getRange(`A1:J${uploadValues.length}`).values=uploadValues;
review.getRange(`A1:Q${reviewValues.length}`).values=reviewValues;
for(const sheet of [upload,review]) {
  sheet.showGridLines=false;
  const used=sheet.getUsedRange();
  used.format.font={name:'Arial',size:10,color:'#202B33'};
  used.format.rowHeight=25;
  used.format.verticalAlignment='center';
  used.format.columnWidth=23;
  used.getRow(0).format.fill='#314D63';
  used.getRow(0).format.font={name:'Arial',size:10,bold:true,color:'#FFFFFF'};
  used.getRow(0).format.rowHeight=44;
  used.getRow(0).format.wrapText=true;
  sheet.freezePanes.freezeRows(1);
}
upload.getRange(`B1:B${uploadValues.length}`).format.columnWidth=58;
upload.getRange(`F2:G${uploadValues.length}`).setNumberFormat('0.00');
review.getRange(`A1:A${reviewValues.length}`).format.columnWidth=58;
review.getRange(`D1:E${reviewValues.length}`).format.columnWidth=44;
review.getRange(`G1:G${reviewValues.length}`).format.columnWidth=55;
review.getRange(`J1:Q${reviewValues.length}`).format.columnWidth=85;
review.getRange(`C2:C${reviewValues.length}`).setNumberFormat('0.00');
review.getRange(`H2:I${reviewValues.length}`).setNumberFormat('0.00');
upload.getRange(`J2:J${uploadValues.length}`).setNumberFormat('@');
review.getRange(`F2:F${reviewValues.length}`).setNumberFormat('@');
review.getRange(`K2:K${reviewValues.length}`).setNumberFormat('@');
// Preserva todos los dígitos en el render; las celdas siguen siendo texto.
selected.forEach((x,i)=>{if(x.code)upload.getRange(`J${i+2}`).setNumberFormat('0'.repeat(x.code.length));});
p.forEach((x,i)=>{if(x.code)review.getRange(`F${i+2}`).setNumberFormat('0'.repeat(x.code.length));});
wb.recalculate();
const check=await wb.inspect({kind:'table',range:`Carga masiva!A1:J${uploadValues.length}`,include:'values',tableMaxRows:4,tableMaxCols:10,maxChars:2000});
await fs.writeFile(path.join(scratch,'inspeccion.ndjson'),check.ndjson);
for(const [sheet,range,file] of [[upload,`B1:F${uploadValues.length}`,'vista_carga.png'],[review,`A1:G${reviewValues.length}`,'vista_revision.png']]) {
  const blob=await wb.render({sheetName:sheet.name,range,scale:1,format:'png'});
  await fs.writeFile(path.join(scratch,file),new Uint8Array(await blob.arrayBuffer()));
}
const escaped = v => {
  const s=v===null||v===undefined?'':String(v);
  return /[",\r\n]/.test(s)?`"${s.replaceAll('"','""')}"`:s;
};
const csv=(matrix,money)=>'\uFEFF'+matrix.map((row,i)=>row.map((v,j)=>escaped(i&&typeof v==='number'&&money.includes(j)?v.toFixed(2):v)).join(',')).join('\r\n')+'\r\n';
assert.deepEqual(upload.getRange(`A1:J${uploadValues.length}`).values,uploadValues);
assert.deepEqual(review.getRange(`A1:Q${reviewValues.length}`).values,reviewValues);
await fs.writeFile(path.join(output,'productos_carga_masiva.csv'),csv(upload.getRange(`A1:J${uploadValues.length}`).values,[5,6]),'utf8');
await fs.writeFile(path.join(output,'revision_y_fuentes.csv'),csv(review.getRange(`A1:Q${reviewValues.length}`).values,[2,7,8]),'utf8');
await fs.writeFile(path.join(scratch,'seleccion.json'),JSON.stringify(p,null,2));
await fs.writeFile(path.join(output,'LEEME.md'),`# Productos de las dos fotografías\n\nConsulta: 19 de octubre de 2026. Moneda: MXN.\n\nLa carga incluye 29 productos: 25 visibles y 4 identificados únicamente en la lista manuscrita (Carisma 1 kg, Roma 1 kg, Salvo en polvo 500 g y Roma 500 g). Hay 16 códigos de barras publicados asignados, y 13 filas sin código. Otros 5 registros quedan fuera de la carga por identificación incompleta.\n\nSe conservan los precios del negocio cuando se leen en los rótulos: 26 filas. Para 1-2-3 500 ml ($25), 1-2-3 1 L ($40) y Valentina amarilla 1 L ($37) se usa un precio público de referencia por pieza; revisar esos tres precios antes de cargar. Los precios de internet se consultaron en páginas o resultados públicos, pueden depender de ubicación, y no son cotizaciones garantizadas.\n\nEl CSV de carga utiliza las 10 columnas de altas compatibles con el importador actual de Flutter, comas, BOM UTF-8, saltos CRLF y precios de venta con dos decimales. Categoría, coste e inventario quedan vacíos; seguimiento_existencias=no. No se deduce inventario contando botellas o bolsas. Una presentación en ml o g se vende por unidad, no a granel.\n\nLos códigos no fueron escaneados de las fotos. Se asignaron solo cuando existía una correspondencia suficiente entre marca, presentación y ficha comercial. El UPC de Valentina conserva su cero inicial; los EAN-8 de Cloralex y 1-2-3 conservan sus ocho dígitos. Todos los códigos asignados pasan el dígito de control GTIN; eso verifica su estructura, no su identidad física. Valentina 1 L y algunos tamaños de aceite se identificaron comparando el envase y/o rótulo con fichas públicas. Cotejar cada código con el envase real.\n\nLos Tang se cargan como sobres por sabor, sin afirmar gramaje ni asignar EAN: las fuentes consultadas describen 11, 13 y 14 g, y no se lee el contenido de los sobres fotografiados. Pinol, La Golondrina grande y La Botanera tampoco reciben una capacidad no legible. Sus presentaciones de referencia y códigos candidatos aparecen en revisión, nunca en el campo codigo_barras de la carga.\n\nEl Fabuloso verde se identifica como Fresco Amanecer mediante la comparación del diseño con piñas de pino. No se convierte el texto 50% más de Salvo en una capacidad mayor: su etiqueta declara 300 ml. Cloralex grande declara 1.17 L incluyendo el 23% gratis. Se aplica el rótulo Fabuloso G $30 a las cuatro botellas de 1 L.\n\nrevision_y_fuentes.csv conserva el origen de cada precio, presentación visible y de referencia, candidatos no asignados, URL, ubicación en foto y limitaciones. Las fuentes históricas se usan para identidad/código, no como precios vigentes. Caracol 2 muestra una referencia web de $9.95 calculada de una caja de $199 con 20 bolsas. El archivo de revisión no es un archivo de importación.\n\nLa validación del CSV usa el importador real del POS sobre un catálogo vacío, sin escritura en la base de datos. No comprueba duplicados contra tu inventario actual.\n`,'utf8');
console.log(JSON.stringify({productos:selected.length,codigos_asignados:assigned.length,sin_codigo:selected.length-assigned.length,solo_rotulo:selected.filter(x=>x.onlySign).length,precios_fotografia:selected.filter(x=>!onlineNames.has(x.name)).length,precios_internet:onlineNames.size,pendientes:p.length-selected.length}));
