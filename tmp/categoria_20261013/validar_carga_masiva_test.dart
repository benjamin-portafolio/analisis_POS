import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:pos_flutter/application/import/articulo_catalog_import_service.dart';
import 'package:pos_flutter/data/local/import/articulo_import_csv.dart';
import 'package:pos_flutter/domain/inventario/dimension_unidad.dart';
import 'package:pos_flutter/domain/inventario/unidad_inventario.dart';

void main() {
  const root = '/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis ';
  test('El CSV final cumple el importador real y conserva todos los precios', () {
    final contenido = File('$root/outputs/categoria_20261013/productos_categoria_carga_masiva.csv').readAsStringSync();
    final transcripcion = jsonDecode(File('$root/tmp/categoria_20261013/transcripcion.json').readAsStringSync()) as Map<String, dynamic>;
    final esperado = transcripcion['mapped'] as List<dynamic>;
    final catalogo = ArticuloImportCatalogo(
      categorias: const [],
      nombresArticulos: const {},
      unidades: const [
        UnidadInventario(id: 'u-piece', code: 'piece', nombre: 'Pieza', simbolo: 'pza', dimension: DimensionUnidad.count, factorAtomico: 1, maximosDecimales: 0, activa: true),
      ],
    );
    final reporte = const ArticuloImportCsv().validar(contenido, catalogo: catalogo);
    expect(reporte.errores, isEmpty, reason: reporte.errores.join('\n'));
    expect(reporte.importable, isTrue);
    expect(reporte.productos.length, 89);
    expect(reporte.filasValidas, 117);
    final variantes = reporte.productos.expand((producto) => producto.variantes.map((variante) => (producto: producto, variante: variante))).toList();
    expect(variantes.length, esperado.length);
    for (var index = 0; index < esperado.length; index++) {
      final row = esperado[index]['row'] as List<dynamic>;
      final actual = variantes[index];
      expect(actual.producto.nombre, row[1]);
      expect(actual.producto.categoriaId, isNull);
      expect(actual.producto.unidadVentaId, isNull);
      expect(actual.variante.nombre, row[4] == '' ? isNull : row[4]);
      expect(actual.variante.precioVentaMinor, ((row[5] as num) * 100).round());
      expect(actual.variante.precioCosteMinor, ((row[6] as num) * 100).round());
      expect(actual.variante.codigoBarras, isNull);
      expect(actual.variante.seguimientoExistencias, isFalse);
    }
    final panera = reporte.productos.singleWhere((p) => p.nombre == 'Tía Rosa Panera Polvoroncitos Caseros 20 p 300 g').variantes.single;
    expect(panera.precioVentaMinor, 200);
    expect(panera.precioCosteMinor, 168);
    print('VALIDACIÓN: 87 líneas del PDF, 89 productos, 117 variantes, 0 errores. Sin escritura en la base.');
  });
}
