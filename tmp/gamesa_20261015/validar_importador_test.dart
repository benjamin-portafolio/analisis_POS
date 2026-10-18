import 'dart:convert';
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:pos_flutter/application/import/articulo_catalog_import_service.dart';
import 'package:pos_flutter/data/local/import/articulo_import_csv.dart';

void main() {
  test('Gamesa: 56 artículos, precios y barcodes válidos en el importador real', () {
    const root = '/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis ';
    final csv = File('$root/outputs/gamesa_20261015/gamesa_carga_masiva.csv').readAsStringSync();
    final validation = jsonDecode(File('$root/tmp/gamesa_20261015/validacion.json').readAsStringSync()) as Map<String,dynamic>;
    final expected = validation['mapped'] as List<dynamic>;
    final report = const ArticuloImportCsv().validar(csv, catalogo: const ArticuloImportCatalogo());
    expect(File('$root/outputs/gamesa_20261015/gamesa_carga_masiva.csv').readAsBytesSync().take(3).toList(), [0xEF,0xBB,0xBF]);
    expect(report.errores, isEmpty, reason: report.errores.join('\n'));
    expect(report.importable, isTrue);
    expect(report.productos.length, 56);
    expect(report.filasValidas, 56);
    final actual = report.productos.expand((p) => p.variantes.map((v) => (producto:p,variante:v))).toList();
    expect(actual.length, expected.length);
    for (var i = 0; i < expected.length; i++) {
      final row = expected[i]['row'] as List<dynamic>;
      expect(actual[i].producto.nombre, row[1]);
      expect(actual[i].producto.categoriaId, isNull);
      expect(actual[i].producto.unidadVentaId, isNull);
      expect(actual[i].variante.nombre, isNull);
      expect(actual[i].variante.precioVentaMinor, ((row[5] as num)*100).round());
      expect(actual[i].variante.precioCosteMinor, ((row[6] as num)*100).round());
      expect(actual[i].variante.seguimientoExistencias, isFalse);
      expect(actual[i].variante.existenciasAtomic, 0);
      expect(actual[i].variante.codigoBarras, row[9] == '' ? isNull : row[9]);
    }
    print('56 artículos y 56 filas válidas; ${validation['conCodigo']} códigos EAN. Sin escrituras en base de datos.');
  });
}
