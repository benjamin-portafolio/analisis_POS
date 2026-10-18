import 'dart:convert';
import 'dart:io';
import 'package:pos_flutter/application/import/articulo_catalog_import_service.dart';
import 'package:pos_flutter/data/local/import/articulo_import_csv.dart';

void main(List<String> args) {
  final report = const ArticuloImportCsv().validar(
    File(args.single).readAsStringSync(),
    catalogo: const ArticuloImportCatalogo(),
  );
  if (!report.importable || report.errores.isNotEmpty) {
    stderr.writeln(report.errores.join('\n'));
    exitCode = 1;
    return;
  }
  final variants = report.productos.expand((p) => p.variantes).toList();
  final assigned = variants.where((v) => v.codigoBarras != null).toList();
  if (report.productos.length != 24 || report.filasValidas != 24 ||
      variants.length != 24 || assigned.length != 3 ||
      variants.any((v) => v.precioVentaMinor <= 0 || v.seguimientoExistencias || v.precioCosteMinor != null) ||
      assigned.map((v) => v.codigoBarras).toSet().length != 3 ||
      !assigned.any((v) => v.codigoBarras == '7501000112784' && v.precioVentaMinor == 2200) ||
      !assigned.any((v) => v.codigoBarras == '7501000112845' && v.precioVentaMinor == 800) ||
      !assigned.any((v) => v.codigoBarras == '7500810045596' && v.precioVentaMinor == 1800)) {
    throw StateError('El catálogo no conserva los datos esperados.');
  }
  print(jsonEncode({
    'importable': report.importable,
    'productos': report.productos.length,
    'filas_validas': report.filasValidas,
    'codigos_asignados': assigned.length,
    'sin_codigo': variants.length-assigned.length,
    'errores': report.errores.length,
    'solo_validacion_sin_escribir_base_de_datos': true,
  }));
}
