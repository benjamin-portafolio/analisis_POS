import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:pos_flutter/application/import/articulo_catalog_import_service.dart';
import 'package:pos_flutter/data/local/import/articulo_import_csv.dart';

void main() {
  test('El importador acepta las doce presentaciones del refrigerador', () {
    final file = File('/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /outputs/refrigerador_mixto_20261016/productos_carga_masiva.csv');
    final report = const ArticuloImportCsv().validar(file.readAsStringSync(), catalogo: const ArticuloImportCatalogo());
    expect(report.errores, isEmpty);
    expect(report.importable, isTrue);
    expect(report.productos, hasLength(12));
    expect(report.filasValidas, 12);
    final variants = report.productos.expand((p)=>p.variantes).toList();
    expect(variants, hasLength(12));
    expect(variants.map((v)=>v.codigoBarras).toSet(), hasLength(12));
    expect(variants.every((v)=>v.codigoBarras != null && v.precioVentaMinor > 0 && !v.seguimientoExistencias && v.precioCosteMinor == null), isTrue);
    expect(variants.singleWhere((v)=>v.codigoBarras=='7503006897597').precioVentaMinor,2600);
    expect(variants.singleWhere((v)=>v.codigoBarras=='7501064101205').precioVentaMinor,4900);
  });
}
