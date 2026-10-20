import 'dart:convert';
import 'dart:io';
import 'package:pos_flutter/application/import/articulo_catalog_import_service.dart';
import 'package:pos_flutter/data/local/import/articulo_import_csv.dart';
import 'package:pos_flutter/domain/articulos/sale_mode.dart';
import 'package:pos_flutter/domain/inventario/dimension_unidad.dart';
import 'package:pos_flutter/domain/inventario/unidad_inventario.dart';

void main() {
  const root = '/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis ';
  final csv = File('$root/outputs/verduras_foto_20261019/productos_verduras_por_kg.csv').readAsStringSync();
  final source = jsonDecode(File('$root/tmp/verduras_foto_20261019/transcripcion.json').readAsStringSync()) as Map<String,dynamic>;
  const catalog = ArticuloImportCatalogo(
    categorias:[ArticuloImportCategoria(id:'categoria-verduras',nombre:'Verduras')],
    unidades:[UnidadInventario(id:'unidad-kg',code:'kg',nombre:'Kilogramo',simbolo:'kg',dimension:DimensionUnidad.mass,factorAtomico:1000,maximosDecimales:3,activa:true)],
  );
  final report = const ArticuloImportCsv().validar(csv,catalogo:catalog);
  if (report.errores.isNotEmpty) throw StateError(report.errores.join('\n'));
  final expected = {for(final row in source['productos'] as List) row[0] as String:(row[1] as num)*100};
  if (!report.importable || report.productos.length != expected.length || report.filasValidas != expected.length) throw StateError('Cantidad de productos incorrecta.');
  for(final p in report.productos) {
    final v=p.variantes.single;
    if(p.categoriaId!='categoria-verduras' || p.modoVenta!=SaleMode.measured || p.unidadVentaId!='unidad-kg' || p.cantidadReferenciaPrecioAtomic!=1000 || v.precioVentaMinor!=expected[p.nombre] || v.precioCosteMinor!=null || v.seguimientoExistencias || v.existenciasAtomic!=0 || v.codigoBarras!=null) throw StateError('Producto incorrecto: ${p.nombre}');
  }
  print(jsonEncode({'importable':true,'productos':report.productos.length,'errores':report.errores.length,'categoria':'Verduras','tipo_venta':'fraccion','unidad':'kg','referencia_precio_gramos':1000,'sin_escritura_en_base_de_datos':true}));
}
