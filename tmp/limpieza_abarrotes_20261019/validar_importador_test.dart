import 'dart:convert';
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:pos_flutter/application/import/articulo_catalog_import_service.dart';
import 'package:pos_flutter/data/local/import/articulo_import_csv.dart';

void main() {
  test('El importador real acepta el catálogo de las dos fotografías sin persistir datos', () {
    const file = '/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /outputs/limpieza_abarrotes_20261019/productos_carga_masiva.csv';
    final report = const ArticuloImportCsv().validar(
      File(file).readAsStringSync(),
      catalogo: const ArticuloImportCatalogo(),
    );
    expect(report.errores, isEmpty);
    expect(report.importable, isTrue);
    expect(report.filasValidas, 29);
    expect(report.productos.length, 29);
    final variants = report.productos.expand((p) => p.variantes).toList();
    expect(variants.length, 29);
    final codes = variants.map((v) => v.codigoBarras).whereType<String>().toList();
    expect(codes.length, 16);
    expect(codes.toSet().length, 16);
    expect(codes, containsAll(['097339000030', '75000608', '75002343', '75005443']));
    expect(variants.every((v) => v.precioVentaMinor > 0), isTrue);
    expect(variants.every((v) => !v.seguimientoExistencias && v.precioCosteMinor == null), isTrue);
    expect(variants.where((v) => v.codigoBarras == '7506195196984').single.precioVentaMinor, 2600);
    expect(variants.where((v) => v.codigoBarras == '7501025405311').single.precioVentaMinor, 1900);
    print(jsonEncode({
      'importable': report.importable,
      'productos': report.productos.length,
      'filas_validas': report.filasValidas,
      'codigos_asignados': codes.length,
      'sin_codigo': variants.length - codes.length,
      'errores': report.errores.length,
      'solo_validacion_sin_escribir_base_de_datos': true,
    }));
  });
}
