import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:pos_flutter/application/import/articulo_catalog_import_service.dart';
import 'package:pos_flutter/data/local/import/articulo_import_csv.dart';

void main() {
  test('El CSV conserva precios, códigos con cero inicial y venta sin existencias', () {
    const directory = '/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /outputs/abarrotes_fotos_20261019';
    final content = File('$directory/productos_carga_masiva.csv').readAsStringSync();
    final report = const ArticuloImportCsv().validar(
      content,
      catalogo: const ArticuloImportCatalogo(),
    );
    expect(report.errores, isEmpty);
    expect(report.importable, isTrue);
    expect(report.productos, hasLength(25));
    expect(report.filasValidas, 25);
    expect(report.productosConCambios, isEmpty);
    final variants = report.productos.expand((p) => p.variantes).toList();
    expect(variants.where((v) => v.codigoBarras != null), hasLength(23));
    expect(variants.where((v) => v.codigoBarras == null), hasLength(2));
    expect(variants.where((v) => v.codigoBarras != null).map((v) => v.codigoBarras).toSet(), hasLength(23));
    for(final v in variants) {
      expect(v.seguimientoExistencias, isFalse);
      expect(v.precioCosteMinor, isNull);
      expect(v.existenciasAtomic, 0);
    }
    final byName = {for(final p in report.productos) p.nombre:p.variantes.single};
    expect(byName['La Costeña Puré de tomate condimentado 350 g']!.codigoBarras, '076397007106');
    expect(byName['Valentina Salsa muy picante etiqueta negra 370 ml']!.codigoBarras, '097339000061');
    expect(byName['1-2-3 Aceite vegetal 500 ml']!.codigoBarras, '75005443');
    expect(byName['La Costeña Puré de tomate condimentado 210 g']!.precioVentaMinor, 1000);
    expect(byName['La Costeña Puré de tomate condimentado 350 g']!.precioVentaMinor, 1200);
    expect(byName['Nescafé Clásico Café soluble frasco 42 g']!.precioVentaMinor, 4600);
    expect(byName['Nescafé Clásico Café soluble bolsa 28 g']!.precioVentaMinor, 3000);
    expect(byName['Pronto Flan vainilla con caramelo 136 g']!.precioVentaMinor, 1900);
    expect(byName['McCormick Té de limón sobre individual']!.codigoBarras, isNull);
    expect(byName['McCormick Té de limón sobre individual']!.precioVentaMinor, 300);
    print(jsonEncode({'importable':report.importable,'productos':report.productos.length,'codigos':23,'sin_codigo':2,'errores':report.errores.length,'sin_escritura_en_base_de_datos':true}));
  });
}
