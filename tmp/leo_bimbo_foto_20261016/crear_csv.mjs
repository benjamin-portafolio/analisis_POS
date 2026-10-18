import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { Workbook } from '@oai/artifact-tool';

const root = process.cwd();
const scratch = path.join(root, 'tmp/leo_bimbo_foto_20261016');
const output = path.join(root, 'outputs/leo_bimbo_foto_20261016');
await fs.mkdir(output, { recursive: true });
const photo = 'WhatsApp Image 2026-10-16 at 11.01.41.jpeg';
const alay = 'https://alaycorporation.com/wp-content/uploads/2026/01/Catalogo-Farmacia-Alay-2026-VF.pdf';
const conteos = 'https://www.scribd.com/document/818384791/Conteos-Leo';
const inventario = 'https://es.scribd.com/document/824483397/INVENTARIO-02-NOVIEMBRE';
const precios = 'https://www.scribd.com/document/788348110/Copia-de-Catalogo-Tienda';
const dtodo = handle => `https://dtododelivery.shop/products/${handle}`;
const data = [];
function add(name, price, shelf, code, candidate, presentation, source, location, note, include = price !== null) {
  data.push({name, price, shelf, code, candidate, presentation, source, location, note, include});
}
// Los códigos candidatos quedan exclusivamente en revisión: el contenido neto
// de esas bolsas no se puede leer en la fotografía.
add('Leo Kat Nut cacahuate sal y limón',15,null,'','604722014392','60 g de referencia',alay,'Fila superior, bolsa azul','Precio impreso $15. Confirmar gramaje antes de asignar el código candidato.');
add('Leo Kat Nut cacahuate japonés',15,null,'','604722014521','60 g de referencia',`${alay} | ${conteos}`,'Fila superior, bolsa morada','Precio impreso $15. Confirmar gramaje y sabor antes de asignar el código candidato.');
add('Leo Kat Nut cacahuate enchilado',15,null,'','604722014415','60 g de referencia',`${alay} | ${conteos}`,'Fila superior, bolsa roja','Precio impreso $15. Confirmar gramaje antes de asignar el código candidato.');
add('Leo Semillas de girasol',15,null,'','604722008032','70 g en tienda; otras fuentes describen 85 g',`${dtodo('semillas-de-girasol-leo-70-g')} | https://pt.scribd.com/document/397148832/ListaPrecios-1`,'Fila superior, bolsa verde turquesa','Precio impreso $15. El contenido no es legible y las referencias discrepan; código sin asignar.');
add('Leo Ke Chidos queso y chile',15,10,'','604722012329','48 g de referencia',conteos,'Segunda fila, bolsa roja central','Bolsa $15 y anaquel $10. Se usó el precio impreso en la bolsa. Confirmar contenido.');
add('Leo Ke Chidos pizza',15,10,'','604722012435','48 g de referencia',`${alay} | https://despensa.bodegaaurrera.com.mx/ip/botana-leo-ke-chidos-sabor-pizza-48-g/00060472201243`,'Segunda fila, bolsa roja a la derecha','Bolsa $15 y anaquel $10. Se usó el precio impreso en la bolsa. Confirmar contenido.');
add('Leo Rugileo sal',15,15,'','604722013081','32 g o 36 g según catálogo',`${conteos} | https://es.scribd.com/document/728739849/Inventarios-21052023`,'Tercera fila, bolsa amarilla','Precio $15 en bolsa y anaquel. El código candidato aparece con gramajes distintos.');
add('Leo Rugileo queso',15,15,'','604722013104','32 g o 36 g según catálogo',`${alay} | ${dtodo('papas-rugileo-queso-32-g')}`,'Tercera fila, bolsas verdes','Precio $15 en bolsa y anaquel. Confirmar contenido antes de asignar código.');
add('Leo Toto\'s queso y chile jalapeño',15,15,'','604722006083','46 g de referencia; también existen tamaños mayores',`${conteos} | ${inventario}`,'Cuarta fila, bolsa roja','Precio $15 en bolsa y anaquel. El gramaje no es legible.');
add('Leo Triachos chile y especias',15,10,'','604722012015','46 g o 60 g según referencia',`${inventario} | ${dtodo('triachos-chiles-y-especias-60-g')}`,'Cuarta fila y fila inferior, bolsas café','Bolsa $15. El anaquel de la cuarta fila marca $15 y el inferior $10. Se agrupó el mismo producto sin inventar tamaños distintos.');
add('Leo Papirringas Aros',15,15,'','604722007998','40 g de referencia',conteos,'Cuarta fila derecha y parte inferior derecha','Precio impreso $15. Se agruparon los empaques repetidos. Confirmar contenido.');
add('Leo Papirringas a la francesa',15,10,'','604722005833','46 g o 50 g según referencia',`${conteos} | ${precios}`,'Quinta fila, bolsas rojas de la izquierda','Bolsa $15 y anaquel $10. Se usó el precio impreso en bolsa. El contenido no es legible.');
add('Leo Papirringas queso intenso',15,10,'','604722013906','35 g o 38 g según referencia',`${conteos} | ${dtodo('papirringas-queso-intenso-35-g')}`,'Quinta fila, bolsas amarillas y rojas del centro','Bolsa $15 y anaquel $10. Se usó el precio impreso en bolsa. Confirmar contenido.');
add('Leo Ke Chidos Puff',15,10,'','604722006007','40 g de referencia',`${conteos} | ${dtodo('ke-chidos-puff-40-g')}`,'Fila inferior, bolsa azul y roja izquierda','Bolsa $15 y anaquel $10. Se usó el precio impreso en bolsa. Confirmar contenido.');
add('Leo Tostaditas',15,10,'','604722008964','Contenido no confirmado',precios,'Fila inferior, bolsa verde','Bolsa $15 y anaquel $10. Sabor y gramaje no se alcanzan a leer. Código candidato sin asignar.');
add('Bimbo Rebanadas 55 g',8,null,'7501000112845','','55 g, presentación individual',alay,'Exhibidor izquierdo, bolsa beige en segunda fila','Precio $8 impreso en empaque. EAN publicado como Rebanada Vainilla Pan Bimbo.');
add('Bimbo Little Bites Sorpresa',18,null,'7500810045596','','58 g en catálogo actual; otra tienda declara 69 g','https://supertodo-online.kyte.site/es/p/bimbo-little-bites-sorpresa-58-gr-7500810045596/17687483226255-oa55 | https://superdtodo.com/product/little-bites-sorpresa-bimbo-69-gr','Tira colgante al centro izquierdo, bolsas blancas','Precio $18 en tira de exhibición y en tienda pública. Ambas tiendas publican el mismo EAN aunque discrepan en gramaje.');
add('Bimbo Nito 62 g',22,null,'7501000112784','','62 g, unidad individual','https://www.klyns.mx/nito-bimbo-62-g/p','Exhibidor izquierdo, bolsas verdes','Precio de referencia web $22 consultado el 16/10/2026. La foto muestra promoción 2 por $28; esa promoción no equivale a un precio unitario habitual de $14.');
add('Bimbo Roles familiares',42,42,'','7501000309726','6 piezas 365 g solo si son de canela','https://michedraui.com.mx/tyc/2023/2024/2023/tablas/02-febrero/productos/productos-participantes-pan-empacado-febrero-2023.html','Rótulo del exhibidor Bimbo, primer nivel','Precio leído del rótulo Roles Familiares. Sabor y empaque exacto no visibles; no se asignó EAN.');
add('Bimbo Roles 3 piezas',25,25,'','7503030199995 | 7503030374002','180 g canela o 205 g glaseados',alay,'Rótulo del exhibidor Bimbo, segundo nivel','Precio y 3 piezas legibles en rótulo. Hay dos EAN posibles según sabor, por eso ambos quedan solo en revisión.');
add('Bimbo Conchas vainilla 2 piezas',20,20,'','7501000132706','120 g de referencia','https://michedraui.com.mx/tyc/2023/2024/2023/tablas/02-febrero/productos/productos-participantes-pan-empacado-febrero-2023.html','Rótulo del exhibidor Bimbo, tercer nivel','Precio, vainilla y 2 piezas leídos del rótulo. No se confirma empaque ni contenido; EAN solo candidato.');
add('Milpa Real tostada plana',26,26,'','7501000106936','175 g de referencia','https://www.scribd.com/document/965347285/INBIMB15ABR','Parte superior izquierda, empaque blanco y rótulo $26','Precio leído en rótulo. Confirmar contenido antes de asignar código.');
add('Milpa Real totopos de maíz',32,32,'','','Contenido no legible','', 'Parte superior izquierda, bolsa con base morada y rótulo $32','Nombre del empaque y precio visibles. No se asignó gramaje ni EAN.');
add('Milpa Real tostada ondulada',37,37,'','7501000157075','360 g de referencia','https://www.scribd.com/document/965347285/INBIMB15ABR','Rótulo superior izquierdo $37','Identificación desde rótulo. Confirmar contenido y existencia del producto antes de asignar código.');

// Productos reconocibles que requieren precio o una identificación más precisa.
add('Snaky papas adobadas',null,null,'','','Contenido no legible','','Tira colgante izquierda, bolsa roja oscura','No hay un precio inequívoco asociado. Pendiente de precio; fuera de la carga.',false);
add('Snaky papas tomate y vinagre',null,null,'','','Contenido no legible','','Tira colgante central, bolsa roja','Sabor legible. Precio y contenido no legibles; fuera de la carga.',false);
add('Snaky papa con sal',null,null,'','','Contenido no legible','','Tira colgante izquierda, bolsa amarilla','Precio y contenido no legibles; fuera de la carga.',false);
add('Leo Papas Caseras natural',null,null,'','','Contenido no legible','','Tira colgante derecha, bolsas amarillas','Natural legible. No se puede asociar inequívocamente un precio; fuera de la carga.',false);
add('Enkantón botanero',null,null,'','604722011452','Contenido no confirmado',precios,'Fila superior, bolsa amarilla','El nombre botanero se alcanza a distinguir parcialmente. Falta confirmar presentación y precio.',false);
add('Enkantón Mix',null,null,'','','40 g clásico solo como referencia',dtodo('enkanton-mix-clasico-40-g'),'Tira colgante derecha, bolsas amarillas y naranjas','Nombre Mix legible. No es posible confirmar variedad, contenido ni precio del empaque real.',false);
add('Bimbo Panqué Hershey\'s',null,null,'','','Contenido no legible','','Parte superior izquierda del exhibidor Bimbo','Hershey\'s visible en empaque. El rótulo $42 dice Roles Familiares y no confirma el precio de este panqué.',false);
add('Bimbo Donas azucaradas',null,null,'','7501030474227','6 piezas 158 g solo como referencia','https://abrazodegolbimbo.com.mx/home','Exhibidor izquierdo, bolsa roja y blanca inferior','El empaque es legible, pero cantidad, gramaje y precio no. Código candidato procedente del catálogo Bimbo previamente verificado.',false);
add('Bimbo Bimbollos',null,null,'','7501000111602','8 piezas 450 g solo como referencia','https://michedraui.com.mx/tyc/2023/2024/2023/tablas/02-febrero/productos/productos-participantes-pan-empacado-febrero-2023.html','Exhibidor izquierdo, bolsa roja y blanca con 40% más','El empaque promocional impide confirmar presentación. Precio no confirmado.',false);
add('Bimbo Pan Integral',null,52,'','7500810022061','620 g solo como referencia','https://abrazodegolbimbo.com.mx/home','Exhibidor izquierdo inferior, bolsa naranja y blanca','Hay un rótulo $52 cercano, pero la asociación y el gramaje no son inequívocos. Fuera de la carga.',false);
add('Tía Rosa Tortillinas',null,null,'','','Cantidad y gramaje no legibles','','Parte inferior izquierda','No se asignó el precio $52 del anaquel superior. Falta identificar presentación y precio.',false);
add('Botana crema y especias, bolsa blanca',null,15,'','','Marca no identificada','','Penúltima fila del exhibidor Leo, extremo derecho','Crema y especias y $15 visibles. El nombre comercial no se pudo confirmar; fuera de la carga.',false);
add('Botana Leo, bolsa naranja',null,15,'','','Nombre exacto por confirmar','','Penúltima fila del exhibidor Leo, centro','El empaque muestra $15, pero no se confirma la línea exacta; fuera de la carga.',false);
add('Papirringas, bolsa morada',null,10,'','','Sabor por confirmar','','Quinta fila del exhibidor Leo, extremo derecho','Marca visible. El sabor y el precio impreso no se leen con suficiente certeza; fuera de la carga.',false);
add('Snaky, bolsa verde',null,null,'','','Producto y sabor por confirmar','','Tira colgante izquierda, bolsa verde','Solo la marca se lee con claridad; fuera de la carga.',false);

function validGtin(code) {
  if (!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(code)) return false;
  const sum = [...code.slice(0,-1)].reverse().reduce((s,c,i)=>s + Number(c)*(i%2===0?3:1),0);
  return (10-sum%10)%10 === Number(code.at(-1));
}
const selected = data.filter(p=>p.include);
assert.equal(new Set(selected.map(p=>p.name)).size, selected.length);
assert(selected.every(p=>typeof p.price==='number' && p.price>0));
const assigned = selected.filter(p=>p.code);
assert(assigned.every(p=>validGtin(p.code)));
assert.equal(new Set(assigned.map(p=>p.code)).size, assigned.length);
for (const p of data) for (const code of p.candidate.split(' | ').filter(Boolean)) assert(validGtin(code), `${p.name}: ${code}`);

const wb = Workbook.create();
const upload = wb.worksheets.add('Carga masiva');
const review = wb.worksheets.add('Revisión');
const headers = ['categoria','nombre_articulo','tipo_venta','unidad_venta','nombre_variante','precio_venta','precio_coste','seguimiento_existencias','existencias','codigo_barras'];
upload.getRange(`A1:J${selected.length+1}`).values = [headers,...selected.map(p=>[null,p.name,'unidad',null,null,p.price,null,'no',null,p.code || null])];
const refs = ['nombre_articulo','incluido_en_carga','precio_venta_mxn','precio_anaquel_mxn','codigo_barras_asignado','codigo_candidato_no_asignado','presentacion_de_referencia','ubicacion_en_foto','observaciones','fuente_codigo_o_referencia','fuente_precio','fecha_consulta'];
review.getRange(`A1:L${data.length+1}`).values = [refs,...data.map(p=>[p.name,p.include?'si':'no',p.price,p.shelf,p.code || null,p.candidate || null,p.presentation,p.location,p.note,p.source || null,p.name==='Bimbo Nito 62 g'?'https://www.klyns.mx/nito-bimbo-62-g/p':photo,'2026-10-16'])];
for (const sheet of [upload, review]) {
  sheet.showGridLines=false;
  const used=sheet.getUsedRange();
  used.format.font={name:'Arial',size:10,color:'#202B33'};
  used.format.rowHeight=24;
  used.format.verticalAlignment='center';
  sheet.freezePanes.freezeRows(1);
  used.getRow(0).format.fill='#344A36';
  used.getRow(0).format.font={name:'Arial',size:10,bold:true,color:'#FFFFFF'};
  used.getRow(0).format.wrapText=true;
  used.getRow(0).format.rowHeight=44;
}
upload.getRange(`A1:J${selected.length+1}`).format.columnWidth=20;
upload.getRange(`B1:B${selected.length+1}`).format.columnWidth=48;
upload.getRange(`F2:G${selected.length+1}`).setNumberFormat('0.00');
upload.getRange(`J2:J${selected.length+1}`).setNumberFormat('@');
review.getRange(`A1:A${data.length+1}`).format.columnWidth=48;
review.getRange(`B1:F${data.length+1}`).format.columnWidth=22;
review.getRange(`F1:F${data.length+1}`).format.columnWidth=38;
review.getRange(`G1:L${data.length+1}`).format.columnWidth=70;
review.getRange(`C2:D${data.length+1}`).setNumberFormat('0.00');
review.getRange(`E2:F${data.length+1}`).setNumberFormat('@');
// Las máscaras evitan notación científica en la vista previa. Los valores
// siguen siendo cadenas y el CSV conserva todos los dígitos originales.
for (let i=0;i<data.length;i++) {
  if (data[i].code) review.getRange(`E${i+2}`).setNumberFormat('0'.repeat(data[i].code.length));
  if (/^\d+$/.test(data[i].candidate)) review.getRange(`F${i+2}`).setNumberFormat('0'.repeat(data[i].candidate.length));
}
for (let i=0;i<selected.length;i++) {
  if (selected[i].code) upload.getRange(`J${i+2}`).setNumberFormat('0'.repeat(selected[i].code.length));
}
wb.recalculate();
const inspected=await wb.inspect({kind:'table',range:`Carga masiva!A1:J${selected.length+1}`,include:'values',tableMaxRows:5,tableMaxCols:10,maxChars:1800});
await fs.writeFile(path.join(scratch,'inspeccion.ndjson'),inspected.ndjson);
for (const [sheet,range,name] of [[upload,`B1:F${selected.length+1}`,'vista_carga.png'],[review,`A1:F${data.length+1}`,'vista_revision.png']]) {
  const blob=await wb.render({sheetName:sheet.name,range,scale:1,format:'png'});
  await fs.writeFile(path.join(scratch,name),new Uint8Array(await blob.arrayBuffer()));
}
const escape = value => {
  const text=value===null || value===undefined ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"','""')}"` : text;
};
function csv(matrix, money) {
  return '\uFEFF'+matrix.map((r,i)=>r.map((v,j)=>escape(i>0 && typeof v==='number' && money.includes(j)?v.toFixed(2):v)).join(',')).join('\r\n')+'\r\n';
}
const saved = upload.getRange(`A1:J${selected.length+1}`).values;
assert.deepEqual(saved[0],headers);
assert.equal(saved.filter((r,i)=>i>0 && r[9]).length,assigned.length);
await fs.writeFile(path.join(output,'leo_bimbo_productos_carga_masiva.csv'),csv(saved,[5,6]),'utf8');
await fs.writeFile(path.join(output,'leo_bimbo_revision_y_fuentes.csv'),csv(review.getRange(`A1:L${data.length+1}`).values,[2,3]),'utf8');
await fs.writeFile(path.join(scratch,'seleccion.json'),JSON.stringify(data,null,2));
await fs.writeFile(path.join(output,'LEEME.md'),`# Productos de la fotografía\n\n${selected.length} artículos en la carga, ${assigned.length} códigos asignados y ${data.length-selected.length} registros pendientes en revisión. Moneda: MXN. Consulta: 16 de octubre de 2026.\n\nEl archivo de carga utiliza las diez columnas exactas del POS, comas, BOM UTF-8 y precios de venta con dos decimales. Categoría, coste y existencias están vacíos. El seguimiento está desactivado. No se dedujeron cantidades de inventario de las bolsas visibles.\n\nLos precios se leyeron en los empaques o rótulos. Nito es la excepción: $22 es una referencia pública de Farmacias Klyns; la foto anuncia 2 por $28, que es una promoción. Para las botanas con bolsa de $15 y anaquel de $10 se usó $15. Ambas cifras y la decisión están en el archivo de revisión.\n\nLos códigos de barras no son legibles en la foto. Los tres asignados proceden de fichas públicas del producto. Los otros códigos encontrados están solo como candidatos en revisión, porque no se confirma el contenido neto o la variedad. Un dígito de control válido no prueba una coincidencia de presentación. No se asignaron códigos inventados ni códigos internos de tienda.\n\nLos Roles, Conchas y algunas Milpa Real se identificaron desde los rótulos. No se afirma que haya existencias de esos artículos. Productos repetidos se agruparon. No se crearon tamaños diferentes a partir de bolsas que parecen mayores por perspectiva.\n\nEl archivo de revisión contiene fuentes, ubicación, alternativas de código, precios en conflicto y productos sin precio o sin identificación suficiente. No se debe subir como catálogo al POS. Los artículos sin precio confirmado se excluyeron del archivo de carga porque el importador exige un precio mayor que cero.\n\nSe revisó el CSV con el importador real usando un catálogo vacío, sin escribir en ninguna base de datos. Esa comprobación valida el formato y los datos, pero no comprueba duplicados contra el inventario actual de tu negocio.\n`,'utf8');
console.log(JSON.stringify({productos_carga:selected.length,codigos_asignados:assigned.length,pendientes:data.length-selected.length,referencias_con_codigo_candidato:data.filter(p=>p.candidate).length,archivos:[path.join(output,'leo_bimbo_productos_carga_masiva.csv'),path.join(output,'leo_bimbo_revision_y_fuentes.csv')]}));
