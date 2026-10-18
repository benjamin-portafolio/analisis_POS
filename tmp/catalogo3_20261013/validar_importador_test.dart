import 'dart:convert';
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:pos_flutter/application/import/articulo_catalog_import_service.dart';
import 'package:pos_flutter/data/local/import/articulo_import_csv.dart';

void main() {
  test('catalogo3 CSV válido para el importador real, con precios por pieza', () {
    const root = '/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis ';
    final file = File('$root/outputs/catalogo3_20261013/catalogo3_carga_masiva.csv');
    final expected = jsonDecode(File('$root/tmp/catalogo3_20261013/mapeo_validado.json').readAsStringSync()) as Map<String, dynamic>;
    final report = const ArticuloImportCsv().validar(file.readAsStringSync(), catalogo: const ArticuloImportCatalogo());
    expect(report.errores, isEmpty, reason: report.errores.join('\n'));
    expect(report.importable, isTrue);
    expect(report.productos.length, 172);
    expect(report.filasValidas, 191);
    final actual = report.productos.expand((p) => p.variantes.map((v) => (product: p, variant: v))).toList();
    final mapped = expected['mapped'] as List<dynamic>;
    expect(actual.length, mapped.length);
    for (var i = 0; i < mapped.length; i++) {
      final row = mapped[i]['row'] as List<dynamic>;
      expect(actual[i].product.nombre, row[1]);
      expect(actual[i].product.categoriaId, isNull);
      expect(actual[i].product.unidadVentaId, isNull);
      expect(actual[i].variant.nombre, row[4] == '' ? isNull : row[4]);
      expect(actual[i].variant.precioVentaMinor, mapped[i]['saleMinor']);
      expect(actual[i].variant.precioCosteMinor, mapped[i]['unitMinor']);
      expect(actual[i].variant.seguimientoExistencias, isFalse);
      expect(actual[i].variant.codigoBarras, row[9] == '' ? isNull : row[9]);
      expect(actual[i].variant.existenciasAtomic, 0);
    }
    final cola = report.productos.singleWhere((p) => p.nombre == 'Coca-Cola 600 ml').variantes.single;
    expect(cola.precioCosteMinor, 1933); // 464 / 24
    expect(cola.precioVentaMinor, 2200);
    final maxi = report.productos.singleWhere((p) => p.nombre == 'Danonino Maxi - pieza de cuadro 336 g').variantes.single;
    expect(maxi.precioCosteMinor, 883); // 35.30 / 4, half-up
    final fruta = report.productos.singleWhere((p) => p.nombre == 'Danone Fruta - pieza de par 240 g').variantes.single;
    expect(fruta.precioCosteMinor, 360); // 7.20 / 2, anotado para revisión
    print('179 renglones del PDF, 172 artículos y 191 variantes. 0 errores del importador. Sin escritura en la base.');
  });
}
