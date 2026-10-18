import 'dart:convert';
import 'dart:io';
import 'package:pos_flutter/application/import/articulo_catalog_import_service.dart';
import 'package:pos_flutter/data/local/import/articulo_import_csv.dart';

void main(List<String> args) {
  final file = File(args.single);
  final report = const ArticuloImportCsv().validar(
    file.readAsStringSync(),
    catalogo: const ArticuloImportCatalogo(),
  );
  if (!report.importable || report.errores.isNotEmpty) {
    stderr.writeln(report.errores.join('\n'));
    exitCode = 1;
    return;
  }
  final variants = report.productos.expand((p) => p.variantes).toList();
  if (report.productos.length != 27 || report.filasValidas != 27 ||
      variants.length != 27 ||
      variants.any((v) => v.codigoBarras == null || v.precioVentaMinor <= 0 || v.seguimientoExistencias || v.precioCosteMinor != null) ||
      variants.map((v) => v.codigoBarras).toSet().length != 27 ||
      !variants.any((v) => v.codigoBarras == '036731136916')) {
    throw StateError('El catálogo no conserva todos los datos esperados.');
  }
  print(jsonEncode({
    'importable': report.importable,
    'productos': report.productos.length,
    'filas_validas': report.filasValidas,
    'codigos_unicos': variants.map((v) => v.codigoBarras).toSet().length,
    'errores': report.errores.length,
    'solo_validacion_sin_escribir_base_de_datos': true,
  }));
}
