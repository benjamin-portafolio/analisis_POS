import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:pos_flutter/application/import/articulo_catalog_import_service.dart';
import 'package:pos_flutter/data/local/import/articulo_import_csv.dart';

void main() {
  for (final fileName in ['barcel_productos_carga_masiva.csv','barcel_productos_precios_consultados.csv']) {
  test('$fileName se acepta en el importador real del POS', () {
    const root = '/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis ';
    final file = File('$root/outputs/barcel_foto_20261016/$fileName');
    final report = const ArticuloImportCsv().validar(
      file.readAsStringSync(),
      catalogo: const ArticuloImportCatalogo(),
    );
    expect(file.readAsBytesSync().take(3).toList(), [0xEF, 0xBB, 0xBF]);
    expect(report.errores, isEmpty, reason: report.errores.join('\n'));
    expect(report.importable, isTrue);
    expect(report.productos.length, 23);
    expect(report.filasValidas, 23);
    final variants = report.productos.expand((p) => p.variantes).toList();
    expect(variants.length, 23);
    expect(variants.every((v) => v.codigoBarras != null), isTrue);
    expect(variants.map((v) => v.codigoBarras).toSet().length, 23);
    expect(variants.every((v) => v.precioCosteMinor == null), isTrue);
    expect(variants.every((v) => !v.seguimientoExistencias), isTrue);
    final kiyakis = report.productos.singleWhere((p) => p.nombre == 'Barcel Kiyakis clásicos 60 g');
    expect(kiyakis.variantes.single.precioVentaMinor, 1710);
    if (fileName.contains('precios_consultados')) {
      int price(String name) => report.productos.singleWhere((p) => p.nombre == name).variantes.single.precioVentaMinor;
      expect(price('Barcel Chips crema y especias 62 g'), 2300);
      expect(price('Barcel Pop Karameladas 45 g'), 1200);
      expect(price('Barcel Pop queso cheddar 45 g'), 2000);
      expect(price('Barcel Big Mix Jalapeño 75 g'), 1600);
      expect(price('Takis Huakamoles 70 g'), 2000);
      expect(price('Karate cacahuates japoneses 75 g'), 1000);
    }
    print('23 artículos, 23 códigos y cero errores. Validación sin escribir en base de datos.');
  });
  }
}
