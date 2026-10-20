import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { Workbook } from '@oai/artifact-tool';

const root = '/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis ';
const scratch = path.join(root, 'tmp/verduras_foto_20261019');
const output = path.join(root, 'outputs/verduras_foto_20261019');
const products = [
  ['Tomate',25],
  ['Jitomate',32],
  ['Lechuga',18],
  ['Aguacate',60],
  ['Zanahoria',18],
  ['Chayote',22],
  ['Calabaza',26],
  ['Ejote',30],
  ['Pepino',22],
  ['Jícama',32],
  ['Plátano',20],
  ['Chile serrano',40],
  ['Chile poblano',40],
  ['Chile cuaresmeño',40],
  ['Papa',22],
  ['Manzana',45],
  ['Guayaba',45],
  ['Naranja',20],
  ['Limón',28],
  ['Plátano macho',30],
  ['Mango',36],
  ['Papaya',30],
  ['Melón',30],
  ['Cebolla',34],
  ['Cebolla cambray',60],
  ['Piña',50],
  ['Ajo',120],
  ['Uva',100],
  ['Chile morrón',40],
  ['Manzana R.',55],
  ['Plátano dominico',26],
  ['Mandarina',36],
  ['Pera',55],
  ['Chile',50],
  ['Durazno',65],
];
const pending = [];
const headers = ['product_id','variant_id','categoria','nombre_articulo','tipo_venta','unidad_venta','nombre_variante','precio_venta','precio_coste','seguimiento_existencias','existencias','codigo_barras'];
const rows = products.map(([name,price])=>[null,null,'Verduras',name,'fraccion','kg',null,price,null,'no',null,null]);
const workbook = Workbook.create();
const sheet = workbook.worksheets.add('Productos');
sheet.getRange(`A1:L${rows.length+1}`).values = [headers,...rows];
sheet.getRange(`A1:L${rows.length+1}`).format.font = {name:'Arial',size:10,color:'#20352B'};
sheet.getRange(`A1:L${rows.length+1}`).format.rowHeight = 23;
sheet.getRange('A1:L1').format.fill = '#285240';
sheet.getRange('A1:L1').format.font = {name:'Arial',size:10,bold:true,color:'#FFFFFF'};
sheet.getRange('A1:L1').format.horizontalAlignment = 'center';
const widths = [16,16,15,25,16,18,20,18,18,29,17,20];
widths.forEach((width,i)=>sheet.getRangeByIndexes(0,i,rows.length+1,1).format.columnWidth=width);
sheet.getRange(`H2:H${rows.length+1}`).setNumberFormat('0.00');
sheet.showGridLines = false;
sheet.freezePanes.freezeRows(1);
workbook.recalculate();
const values = sheet.getRange(`A2:L${rows.length+1}`).values;
assert.equal(new Set(values.map(row=>row[3].toLocaleLowerCase('es'))).size,products.length);
for (const [i,row] of values.entries()) {
  assert.equal(row[2],'Verduras');
  assert.equal(row[4],'fraccion');
  assert.equal(row[5],'kg');
  assert.equal(row[7],products[i][1]);
  assert.equal(row[9],'no');
  assert(row[7]>0);
}
const inspection = await workbook.inspect({kind:'table',range:`Productos!C1:J${rows.length+1}`,include:'values,formulas',tableMaxRows:6,tableMaxCols:8,maxChars:2000});
await fs.writeFile(path.join(scratch,'inspeccion.ndjson'),inspection.ndjson);
const preview = await workbook.render({sheetName:'Productos',range:`C1:H${rows.length+1}`,scale:1,format:'png'});
await fs.writeFile(path.join(scratch,'revision_csv.png'),new Uint8Array(await preview.arrayBuffer()));
const field = value => {
  const text = value==null?'':String(value);
  return /[,"\r\n]/.test(text)?'"'+text.replaceAll('"','""')+'"':text;
};
const lines = values.map(row=>row.map((value,i)=>i===7?Number(value).toFixed(2):field(value)).join(','));
const csv = '\uFEFF'+[headers.join(','),...lines].join('\r\n')+'\r\n';
await fs.mkdir(output,{recursive:true});
const filename = path.join(output,'productos_verduras_por_kg.csv');
await fs.writeFile(filename,csv,'utf8');
await fs.writeFile(path.join(scratch,'transcripcion.json'),JSON.stringify({fuente:'WhatsApp Image 2026-10-19 at 20.11.12.jpeg',productos:products,pendientes:pending,excluidos:[{producto:'Huevo',precio:40,motivo:'Fuera de frutas y verduras.'},{producto:'Bomba',precio:3,motivo:'No se identifica como fruta o verdura por kilogramo.'},{producto:'Calabaza d.',precio:null,motivo:'El usuario indicó conservar únicamente la calabaza con precio.'}],notas:['El usuario confirmó plátano macho a 30 y cebolla a 34 por kg.','Calabaza b. se normaliza a Calabaza a 26 por kg, según la indicación del usuario.','Manzana R. conserva la abreviatura de la foto.','Chile conserva el nombre genérico de la foto.','Unidad kg y categoría Verduras indicadas por el usuario.','No se proporcionaron costes, códigos ni existencias.']},null,2));
console.log(JSON.stringify({archivo:filename,productos:products.length,pendientes:pending,unidad:'kg',categoria:'Verduras'}));
