import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { Workbook } from '@oai/artifact-tool';

const root = process.cwd();
const scratch = path.join(root, 'tmp/abarrotes_fotos_20261019');
const output = path.join(root, 'outputs/abarrotes_fotos_20261019');
await fs.mkdir(output, { recursive: true });
const snapshots = JSON.parse(await fs.readFile(path.join(scratch, 'catalogos.json'), 'utf8'));
const catalog = snapshots.flatMap(s => s.products ?? []);
const date = '2026-10-19';
const nestle = 'https://promos.nestle.com.mx/nescafe/node/91';
const photo4 = 'Foto 4: WhatsApp Image 2026-10-19 at 18.03.00.jpeg';
const photo5 = 'Foto 5: WhatsApp Image 2026-10-19 at 18.03.07.jpeg';
const photo3 = 'Foto 3: WhatsApp Image 2026-10-19 at 18.02.57.jpeg';
const products = [];

function validGtin(code) {
  if (!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(code)) return false;
  const sum = [...code.slice(0, -1)].reverse().reduce((s, c, i) => s + Number(c) * (i % 2 === 0 ? 3 : 1), 0);
  return (10 - sum % 10) % 10 === Number(code.at(-1));
}

function addCatalog(id, name, presentation, price, priceSource, identification, note, options = {}) {
  const p = catalog.find(p => p.url.endsWith(`-${id}/p`));
  assert(p, `Falta producto de catálogo: ${id}`);
  const item = p.items[0];
  const imageUrl = item.images[0];
  let code = options.code ?? new URL(imageUrl).pathname.split('/').at(-1).split('_')[0].split('.')[0];
  let codeSource = options.codeSource ?? imageUrl;
  let codeMethod = options.codeMethod ?? 'GTIN completo en el nombre de imagen del catálogo del comercio';
  // Algunos nombres de imagen pierden el cero inicial de un UPC-A. Esta
  // normalización solo restaura ceros a la izquierda; no calcula dígitos.
  if (code.length === 11 && validGtin(code.padStart(12, '0'))) {
    code = code.padStart(12, '0');
    codeMethod += '; UPC-A normalizado con cero inicial';
  }
  products.push({ name, presentation, price: price ?? item.price, code, priceSource: priceSource ?? p.url,
    priceOrigin: priceSource?.startsWith('Foto 4') || priceSource?.startsWith('Foto 5') ? 'Lista manuscrita del negocio' : priceSource?.startsWith('Foto 3') ? 'Precio escrito en envase' : 'Referencia pública de internet',
    catalogPrice: item.price, catalogUrl: p.url, codeSource, codeMethod, identification, note, ...options });
}

function addCustom(p) { products.push({ catalogPrice: null, catalogUrl: '', codeMethod: 'Código publicado por el comercio', ...p }); }

addCatalog('3042965', 'La Costeña Puré de tomate condimentado 210 g', 'Caja 210 g', 10, photo4, 'Marca y tamaño visibles', 'Corresponde a puré tomate chico. Precio 10 también escrito en el envase.');
addCatalog('3042975', 'La Costeña Puré de tomate condimentado 350 g', 'Caja 350 g', 12, photo4, 'Marca y tamaño visibles', 'Corresponde a puré tomate grande. Precio 12 también escrito en el envase.', { code: '076397007106', codeMethod: 'UPC-A del nombre de imagen comercial, normalizado con cero inicial' });
addCatalog('3042845', 'Valentina Salsa picante etiqueta amarilla 370 ml', 'Botella de vidrio 370 ml', 18, photo4, 'Presentación probable', 'La marca y la variante se apoyan en la foto 2 y la etiqueta del estante Amarilla. El volumen se infiere del envase y del catálogo; cotejar.');
addCatalog('3042854', 'Valentina Salsa muy picante etiqueta negra 370 ml', 'Botella de vidrio 370 ml', 18, photo4, 'Presentación probable', 'Etiqueta negra visible en foto 2. Volumen inferido del envase y del catálogo; cotejar.');
addCustom({ name: 'Nescafé Clásico Café soluble sobre 16 g', presentation: 'Sobre individual 16 g', price: 16, code: '7506475126908', priceSource: photo4, priceOrigin: 'Lista manuscrita del negocio', codeSource: nestle, codeMethod: 'Fabricante: STICK de 16 g, distinto del código del ESTUCHE', identification: 'Gramaje probable; confirmar', note: 'La leyenda del exhibidor en foto 3 parece indicar sobres de 16 g. Existen sobres de 14 g con código 7501000911783; si el físico dice 14 g, sustituir nombre y código antes de cargar. No usar el código del exhibidor.' });
addCatalog('3361141', 'Nescafé Clásico Café soluble bolsa 28 g', 'Bolsa resellable 28 g', 30, photo4, 'Presentación probable', 'Bolsa con 30 escrito en foto 3. Gramaje seleccionado del catálogo, no legible con certeza en la fotografía; cotejar.', { codeSource: nestle, codeMethod: 'Fabricante: Doypack 28 g' });
addCatalog('3820416', 'Nescafé Clásico Café soluble frasco 42 g', 'Frasco 42 g', 46, photo4, 'Presentación probable', 'Frasco pequeño de foto 3. Se selecciona 42 g por el formato; verificar contenido en el envase.', { codeSource: nestle, codeMethod: 'Fabricante: frasco 42 g' });
addCatalog('3397486', 'Coffee Mate Original Cremador en polvo 160 g', 'Bote 160 g', 40, photo3, 'Marca y presentación identificadas', 'Precio 40 escrito sobre el bote rojo en foto 3. No se aplica el precio de Nutella a este producto.');
addCustom({ name: 'Coffee Mate Original Cremador en polvo sobre 34 g', presentation: 'Sobre individual 34 g', price: 12, code: '7501000913282', priceSource: 'https://www.farmaciasguadalajara.com/alimentos/cremas-para-cafe/sustituto-de-crema-coffe-mate-para-cafe-en-polvo-sabor-original--34-gr.-1337505.html', priceOrigin: 'Referencia pública de internet', codeSource: 'https://tiendasupersol.com/products/7501000913282', identification: 'Contenido visible en exhibidor', note: 'La foto 2 y la foto 3 indican 10 sobres de 34 g. Se carga un sobre individual a precio de referencia, no la caja de 10. Super Sol también publica 12 por sobre.' });
addCatalog('3487669', 'Nescafé Cappuccino Original Caja con 6 sobres de 20 g', 'Caja 120 g (6 sobres de 20 g)', null, null, 'Presentación probable', 'Caja visible en foto 1. Se interpreta como caja cerrada de 6 sobres. Si el negocio vende sobres sueltos, usar código individual 7501058629128 y definir su precio; no vender cada sobre a 69.');
addCatalog('3397837', 'Nescafé Dolca Café soluble frasco 46 g', 'Frasco 46 g', 36, 'Foto 1: precio 36 escrito en el frasco de tapa amarilla', 'Presentación probable', 'Dolca identificado por etiqueta amarilla. Tamaño 46 g inferido por envase y catálogo; cotejar.', { priceOrigin: 'Precio escrito en envase', codeSource: nestle, codeMethod: 'Fabricante: Dolca 46 g' });
addCatalog('3244734', 'Pronto Flan vainilla con caramelo 136 g', 'Caja 136 g; rinde 1 litro', 19, photo3, 'Marca y tamaño visibles', 'Se conserva 19 escrito en la caja. No se aplica Gelatinas 15 de la lista a este flan.');
addCatalog('3409883', 'McCormick Mermelada de fresa 450 g', 'Frasco 450 g', 50, photo4, 'Presentación probable', 'Marca y sabor visibles en el frasco grande de foto 1. Gramaje seleccionado según formato del catálogo; verificar que no sea 980 g.');
addCatalog('3042424', 'McCormick Mermelada de fresa 270 g', 'Frasco 270 g', 29, photo4, 'Marca y tamaño por confirmar', 'Frasco chico de espaldas con fresas en foto 1. Identificación McCormick 270 g probable por la etiqueta y el catálogo; cotejar marca y gramaje antes de importar.');
addCatalog('3536291', 'Clásicos Cerillos Cajilla con 50', 'Cajilla individual con 50 cerillos', 3, photo4, 'Marca visible; cantidad probable', 'Se carga una cajilla, no el paquete de 5 o 10 cajillas. Verificar que el reverso físico tenga el EAN-8 citado.');
addCustom({ name: 'Kola Loka Pegamento tradicional 2 g', presentation: 'Tubo individual 2 g', price: 27, code: '7501102610003', priceSource: photo4, priceOrigin: 'Lista manuscrita del negocio', codeSource: 'https://www.officemax.com.mx/pegamento-kola-loka-2gr-7501102610003/p', identification: 'Presentación probable', note: 'Exhibidor Kola Loka y tubos con tapa verde visibles en fotos 1 y 2. Se selecciona tubo tradicional de 2 g; no Goterito de 3.5 g ni Brocha de 5 g.' });
addCustom({ name: 'McCormick Té de limón sobre individual', presentation: 'Un sobre de infusión; gramaje por confirmar', price: 3, code: '', priceSource: photo4, priceOrigin: 'Lista manuscrita del negocio', codeSource: '', codeMethod: 'Sin código individual verificable; se deja vacío', catalogUrl: 'https://www.mccormick.mx/producto/te-de-limon', identification: 'Sabor visible; venta por sobre inferida', note: 'La caja de la foto 1 dice Té de Limón 30 g. El precio 3 se interpreta por un sobre, no por la caja. No se reutiliza el código de barras de la caja.' });
addCustom({ name: 'McCormick Té de manzanilla sobre individual', presentation: 'Un sobre de infusión; gramaje por confirmar', price: 3, code: '', priceSource: photo4, priceOrigin: 'Lista manuscrita del negocio', codeSource: '', codeMethod: 'Sin código individual verificable; se deja vacío', catalogUrl: 'https://www.mccormick.mx/producto/te-de-manzanilla', identification: 'Ingrediente visible; venta por sobre inferida', note: 'La caja amarilla muestra MANZANILLA en ingredientes. El precio 3 se interpreta por un sobre, no por la caja. No se reutiliza el código de barras de la caja.' });
addCatalog('3043240', 'Doña María Mole verde en pasta 230 g', 'Frasco 230 g', null, null, 'Presentación probable', 'Frasco de etiqueta verde y tapa amarilla en foto 1 y foto 5. Marca visible, variedad y contenido inferidos por etiqueta y catálogo; cotejar antes de importar.');
addCatalog('3621827', 'Doña María Mole rojo listo para servir 360 g', 'Caja 360 g', null, null, 'Presentación probable', 'Caja alta color beige junto al mole en foto 1. Presentación seleccionada del catálogo; cotejar variedad y contenido. No confundir con el frasco en pasta.');
addCustom({ name: 'Cristal Aceite vegetal 1.5 L', presentation: 'Botella 1.5 L', price: 70, code: '7501048100248', priceSource: photo5, priceOrigin: 'Lista manuscrita del negocio', codeSource: 'https://lamimigb.com/products/aceite-cristal-1-5-lt', identification: 'Marca y volumen escritos en lista', note: 'La lista dice Cristal 1,5 L. Se selecciona aceite vegetal, no aceite de maíz. Envase no visible para cotejar la formulación.' });
addCatalog('3009897', 'Cristal Aceite vegetal mixto 1 L', 'Botella 1 L', 42, photo5, 'Marca y volumen escritos en lista', 'Envase no visible. Se selecciona aceite vegetal mixto del catálogo; cotejar formulación con el físico.');
addCustom({ name: 'Cristal Aceite vegetal 500 ml', presentation: 'Botella 500 ml', price: 25, code: '7501048100200', priceSource: photo5, priceOrigin: 'Lista manuscrita del negocio', codeSource: 'https://www.zapopan.gob.mx/wp-content/uploads/2018/09/JUNIO-2018.pdf', codeMethod: 'Código publicado en factura de 2018; referencia histórica a cotejar físicamente', catalogUrl: 'https://surtace.mayoreoenlinea.mx/products/aceite-cristal-500', identification: 'Marca y volumen escritos en lista', note: 'Se interpreta 500L como 500 ml. Presentación vigente encontrada en Surtace. El código solo se pudo respaldar con una factura histórica, por lo que requiere escaneo físico.' });
addCatalog('3009948', '1-2-3 Aceite vegetal 1 L', 'Botella 1 L', 42, photo5, 'Marca y volumen escritos en lista', 'Código EAN-8 del envase de 1 litro. Envase no visible en la foto; cotejar.');
addCustom({ name: '1-2-3 Aceite vegetal 500 ml', presentation: 'Botella 500 ml', price: 25, code: '75005443', priceSource: photo5, priceOrigin: 'Lista manuscrita del negocio', codeSource: 'https://www.lagranbodega.com.mx/aceite-vegetal-comestible-1-2-3-500-ml/p', identification: 'Marca y volumen escritos en lista', note: 'Se interpreta 500L como 500 ml. EAN-8 publicado en la imagen comercial de la botella individual, respaldado también por Garis.' });

const pending = [
  ['Choco Milk', 7, photo4, 'Falta gramaje y presentación', 'Podría ser sobre de polvo. No asignar automáticamente la bolsa de 65 g ni el bote de 160 g.', 'https://www.chedraui.com.mx/chocolate-chocomilk-65g-3884308/p'],
  ['Palomitas', 16, photo4, 'Faltan marca, sabor y gramaje', 'No se distingue si son palomitas para microondas o una bolsa de botana.', ''],
  ['Vasos', 35, photo4, 'Faltan marca, capacidad, material y piezas', 'Hay bolsas de desechables en foto 1, pero no se lee la presentación.', ''],
  ['Nutella frasco', 42, photo4, 'Falta tamaño; verificar lectura del precio', 'La escritura parece Nutella Frasco 42; el último dígito es poco claro y podría leerse 48. No confundir con Coffee Mate 40. Existe frasco de 200 g en catálogo, sin evidencia de que sea el del negocio.', 'https://www.chedraui.com.mx/crema-de-avellanas-nutella-200g-3444754/p'],
  ['Café Legal', 10, photo4, 'Faltan tipo de café y gramaje', 'Hay opciones soluble de 10 g, molido de 28 g y porciones de 2 g. El rótulo por sí solo no permite seleccionar un código.', 'https://www.lagranbodega.com.mx/despensa/cafe-te-y-sustitutos/cafe-soluble/legal'],
  ['Harina de arroz', 18, photo4, 'Faltan marca y peso', 'No se distingue la cara del paquete para seleccionar una presentación.', ''],
  ['Gelatinas', 15, photo4, 'Faltan marca, sabor y peso', 'No confundir con el flan Pronto 136 g que tiene precio escrito de 19.', ''],
  ['Servilletas', 18, photo4, 'Faltan marca, tamaño y cantidad', 'Las bolsas parcialmente visibles no permiten confirmar un SKU.', ''],
  ['Papel aluminio M.', 55, photo4, 'Faltan marca, metros y ancho', 'M. podría indicar mediano, una marca u otra abreviatura.', ''],
  ['Maizena', 15, photo4, 'Faltan tipo, sabor y gramaje', 'Puede ser fécula natural o mezcla para atole de varios sabores, con códigos diferentes.', ''],
  ['Pañal', 8, photo5, 'Faltan marca, talla y modalidad de venta', 'Podría venderse por pieza suelta. No asignar el código de una bolsa completa a una pieza.', ''],
  ['Maruchan', 18, photo5, 'Faltan sabor, gramaje y envase', 'No crear un sabor de camarón, pollo o res sin evidencia.', ''],
  ['Nutrioli', 40, photo5, 'Falta volumen y variedad de aceite', 'Hay varias capacidades. El precio no permite distinguirlas.', ''],
  ['La Botanera chica', 18, photo5, 'Faltan volumen y variante', 'Se encontraron clásica 354 ml y 500 ml, y muy picante 370 g. Conservar 18 sin asignar un código hasta identificar el envase.', 'https://www.chedraui.com.mx/salsa-la-botanera-clasica-500ml-3596913/p'],
  ['Nutri', 22, photo5, 'Faltan volumen y variedad', 'No asumir un producto lácteo de 1 litro ni una fórmula específica.', ''],
  ['Alpura', 28, photo5, 'Faltan volumen y tipo de leche', 'Entera, deslactosada y otras variedades usan códigos distintos.', ''],
  ['Santa Clara', 32, photo5, 'Faltan volumen y tipo de leche', 'No asumir entera de 1 litro solo por el precio.', ''],
  ['Alpura sabores', 36, photo5, 'Faltan volumen y sabor', 'Se requiere identificar chocolate, fresa, vainilla u otra variedad.', ''],
  ['La Botanera grande', 35, photo5, 'Faltan volumen y variante', 'El catálogo ofrece clásica de 1 kg y otras variantes de 1 L. No asumir que G significa una de ellas.', 'https://www.chedraui.com.mx/salsa-la-botanera-clasica-1kg-3480788/p'],
  ['Palmolive Optims 4 Extra Intensivo 2 en 1', null, 'Foto 2: cajas de shampoo', 'Falta precio y confirmar unidad de venta', 'La caja visible indica 48 sobres de 10 ml y promoción 2x1. Confirmar si se venden 10 ml o el par de sobres; no usar el código de la caja para cada sobre.', 'https://www.superya.com.mx/productos/%3D%3DAUVZ0cWtGZXJFbZpXTWJVU/'],
  ['McCormick Té en caja verde', 3, 'Fotos 1 y 3; precio de té en foto 4', 'Falta confirmar sabor', 'Probablemente hierbabuena. El color por sí solo no basta. El precio 3 se interpreta por sobre.', 'https://www.chedraui.com.mx/te-mccormick-hierbabuena-con-25-sobres-3089917/p'],
  ['McCormick Té en caja azul', 3, 'Fotos 1 y 3; precio de té en foto 4', 'Falta confirmar sabor', 'Podría ser tila. Nombre frontal oculto. El precio 3 se interpreta por sobre.', ''],
  ['McCormick Té en caja café', 3, 'Fotos 1 y 3; precio de té en foto 4', 'Falta confirmar sabor', 'Podría ser canela a la manzana u otra infusión. El precio 3 se interpreta por sobre.', 'https://www.chedraui.com.mx/te-mccormick-de-canela-a-la-manzana-25-sobres-3044883/p'],
];

const transcription = [
  ['Choco Milk',7],['Palomitas',16],['Vasos',35],['Valentina',18],['Pure tomate ch',10],['Pure tomate G',12],['Nescafe ch',16],['Nescafe Bolsa',30],['Nescafe Frasco',46],['Nutella Frasco',42],['Cafe Legal',10],['Té',3],['Mermelada fresa G',50],['Mermelada chica',29],['Cerillos',3],['Kola loka',27],['Arina de Arroz',18],['Gelatinas',15],['Servilletas',18],['Aluminio M.',55],['Maizenas',15],
  ['Pañal',8],['Maruchas',18],['Cristal 1,5L',70],['Cristal 1L',42],['Cristal 500L',25],['Nutrioli',40],['123 1L',42],['123 500L',25],['Botanera',18],['Nutri',22],['alpura',28],['Santa Clara',32],['Alpura sabores',36],['Botanera G',35],
];

assert.equal(products.length,25);
assert.equal(pending.length,23);
assert.equal(transcription.length,35);
assert(products.every(p=>p.price>0 && p.priceSource));
assert(products.every(p=>!p.code || validGtin(p.code)), JSON.stringify(products.filter(p=>p.code && !validGtin(p.code))));
const codes = products.filter(p=>p.code).map(p=>p.code);
assert.equal(new Set(codes).size,codes.length);

const wb=Workbook.create();
const header=['categoria','nombre_articulo','tipo_venta','unidad_venta','nombre_variante','precio_venta','precio_coste','seguimiento_existencias','existencias','codigo_barras'];
const referenceHeader=['nombre_articulo','presentacion','precio_venta_mxn','codigo_barras','origen_precio','fuente_precio','identificacion_en_foto','observaciones','fuente_codigo_barras','metodo_codigo_barras','pagina_catalogo','precio_catalogo_mxn','fecha_consulta'];
const pendingHeader=['producto','precio_lista_mxn','origen','dato_pendiente','observaciones','referencia_para_revisar','fecha_consulta'];
const upload=wb.worksheets.add('Carga');
const references=wb.worksheets.add('Fuentes');
const review=wb.worksheets.add('Pendientes');
upload.getRange('A1:J26').values=[header,...products.map(p=>[null,p.name,'unidad',null,null,p.price,null,'no',null,p.code||null])];
references.getRange('A1:M26').values=[referenceHeader,...products.map(p=>[p.name,p.presentation,p.price,p.code||null,p.priceOrigin,p.priceSource,p.identification,p.note,p.codeSource,p.codeMethod,p.catalogUrl,p.catalogPrice,date])];
review.getRange('A1:G24').values=[pendingHeader,...pending.map(p=>[...p,date])];
for(const s of [upload,references,review]) {
  s.showGridLines=false;
  const used=s.getUsedRange();
  used.format.font={name:'Arial',size:10,color:'#172B3A'};
  used.format.rowHeight=28;
  used.format.columnWidth=22;
  const h=s.getRange(s===upload?'A1:J1':s===references?'A1:M1':'A1:G1');
  h.format.fill='#334155';
  h.format.font={name:'Arial',size:10,bold:true,color:'#FFFFFF'};
  h.format.rowHeight=43;
  h.format.wrapText=true;
  s.freezePanes.freezeRows(1);
}
upload.getRange('B1:B26').format.columnWidth=66;
upload.getRange('F2:G26').setNumberFormat('0.00');
upload.getRange('J2:J26').setNumberFormat('@');
references.getRange('A1:A26').format.columnWidth=66;
references.getRange('B1:B26').format.columnWidth=44;
references.getRange('C2:C26').setNumberFormat('0.00');
references.getRange('D2:D26').setNumberFormat('@');
references.getRange('E1:E26').format.columnWidth=38;
references.getRange('F1:M26').format.columnWidth=90;
review.getRange('A1:A24').format.columnWidth=47;
review.getRange('B2:B24').setNumberFormat('0.00');
review.getRange('C1:C24').format.columnWidth=44;
review.getRange('D1:D24').format.columnWidth=56;
review.getRange('E1:F24').format.columnWidth=145;
review.getRange('G1:G24').format.columnWidth=18;
// La vista del motor aplica formato numérico a códigos largos aun cuando el
// valor es texto. La máscara conserva todos los dígitos en la revisión visual.
for(let i=0;i<products.length;i++) {
  if(!products[i].code) continue;
  const mask='0'.repeat(products[i].code.length);
  upload.getRange(`J${i+2}`).setNumberFormat(mask);
  references.getRange(`D${i+2}`).setNumberFormat(mask);
}
wb.recalculate();
for(const [s,range,file] of [[upload,'B1:F26','carga_preview.png'],[references,'A1:E26','fuentes_preview.png'],[review,'A1:D24','pendientes_preview.png']]) {
  const blob=await wb.render({sheetName:s.name,range,scale:1,format:'png'});
  await fs.writeFile(path.join(scratch,file),new Uint8Array(await blob.arrayBuffer()));
}
const inspected=await wb.inspect({kind:'table',range:'Carga!A1:J26',include:'values',tableMaxRows:26,tableMaxCols:10,maxChars:2500});
await fs.writeFile(path.join(scratch,'inspeccion.ndjson'),inspected.ndjson);
const errors=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:30},summary:'Revisión de errores'});
await fs.writeFile(path.join(scratch,'errores.ndjson'),errors.ndjson);
const quote=v=>{ const s=v===null||v===undefined?'':String(v);return /[",\r\n]/.test(s)?`"${s.replaceAll('"','""')}"`:s;};
const csv=(rows,prices)=>'\uFEFF'+rows.map((r,i)=>r.map((v,j)=>quote(i>0&&typeof v==='number'&&prices.includes(j)?v.toFixed(2):v)).join(',')).join('\r\n')+'\r\n';
const uploadValues=upload.getRange('A1:J26').values;
assert.deepEqual(uploadValues[0],header);
assert.deepEqual(uploadValues.slice(1).map(r=>r[9]??''),products.map(p=>p.code));
await fs.writeFile(path.join(output,'productos_carga_masiva.csv'),csv(uploadValues,[5,6]));
await fs.writeFile(path.join(output,'productos_fuentes_y_revision.csv'),csv(references.getRange('A1:M26').values,[2,11]));
await fs.writeFile(path.join(output,'productos_pendientes.csv'),csv(review.getRange('A1:G24').values,[1]));
await fs.writeFile(path.join(scratch,'seleccion.json'),JSON.stringify({date,products,pending,transcription},null,2));
await fs.writeFile(path.join(output,'LEEME.md'),`# Productos de las cinco fotos del 19 de octubre de 2026

25 registros preparados para carga, de los cuales 23 tienen código de barras y 2 son sobres de té sin código individual verificado. Otros 23 registros quedan en productos_pendientes.csv. Se transcribieron los 35 renglones de las dos listas de precios. Los sabores de té y las dos etiquetas Valentina se separaron cuando correspondía. No se crearon artículos para envases repetidos ni para productos totalmente ocultos.

## Uso

Importar únicamente productos_carga_masiva.csv. Usa el contrato de diez columnas para altas del POS Flutter. Formato UTF-8 con BOM, coma como separador y decimales con punto. Los códigos son texto sin apóstrofos. Categoría, coste y existencias quedan vacíos y el seguimiento de existencias desactivado porque no se proporcionaron esos datos.

productos_fuentes_y_revision.csv documenta cada precio, la presentación investigada, los códigos y las inferencias. productos_pendientes.csv conserva los precios de los artículos que no se pudieron identificar sin elegir arbitrariamente una marca, tamaño o sabor. Estos dos archivos son de revisión y no usan el contrato de carga del POS.

## Precios

Moneda MXN por la unidad descrita. Prioridad: lista manuscrita del negocio, luego precio escrito en el envase y finalmente precio público de internet. Coffee Mate 160 g conserva 40, Dolca 46 g conserva 36 y flan Pronto 136 g conserva 19, escritos en los envases. Flan no se iguala a Gelatinas 15. Las referencias públicas utilizadas para completar faltantes son Coffee Mate sobre 34 g a 12, Cappuccino caja de 6 sobres a 69, mole verde en pasta a 56 y mole listo para servir a 22. El precio de Cappuccino corresponde a la caja, no a un sobre. Los precios públicos pueden variar según sucursal.

La lectura de Nutella Frasco parece 42, pero el último dígito no es claro y podría leerse 48. Se mantiene pendiente y no se importa. En la segunda lista, 500L se interpreta como 500 ml, de acuerdo con las presentaciones comerciales de los aceites.

## Presentaciones y códigos

No se pudieron escanear los códigos de las fotos. Los códigos son referencias comerciales para las presentaciones seleccionadas. Se verificó longitud, dígito de control y ausencia de duplicados. Esta validación no demuestra que el código corresponda al envase físico del negocio.

Las presentaciones inferidas se indican expresamente en productos_fuentes_y_revision.csv. Cotejar en especial Nescafé sobre 16 g frente a 14 g, Nescafé bolsa 28 g, frasco 42 g, mermeladas 450 g y 270 g, ambos moles y Cappuccino caja de 6 sobres. El código 7506475126908 es el sobre Nescafé de 16 g; el sobre de 14 g usa 7501000911783. Los códigos de exhibidor no se asignan a unidades sueltas. Para Cristal 500 ml, la presentación se encontró en un comercio actual pero el código solo se respaldó con una factura de 2018: escanearlo para confirmarlo.

Los tés se cargan por sobre a 3 y sin código, porque no se confirmó un código individual. No se usaron los códigos de las cajas para ellos. Para Valentina se restauró un cero inicial del UPC-A del catálogo comercial; no se calcularon dígitos faltantes. Algunos códigos EAN-8 son cortos y deben conservarse completos.

La comprobación del formato se realiza con el importador real en modo de validación y un catálogo vacío. No comprueba colisiones contra artículos existentes del negocio ni escribe productos o existencias en una base de datos.
`);
console.log(JSON.stringify({products:products.length,barcodes:codes.length,withoutBarcode:products.length-codes.length,pending:pending.length,pricesFromPhotos:products.filter(p=>p.priceOrigin!=='Referencia pública de internet').length,internetPrices:products.filter(p=>p.priceOrigin==='Referencia pública de internet').length,files:['productos_carga_masiva.csv','productos_fuentes_y_revision.csv','productos_pendientes.csv'].map(f=>path.join(output,f))},null,2));
