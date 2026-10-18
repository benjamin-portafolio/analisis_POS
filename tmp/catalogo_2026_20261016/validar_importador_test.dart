import 'dart:convert';
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:pos_flutter/application/import/articulo_catalog_import_service.dart';
import 'package:pos_flutter/data/local/import/articulo_import_csv.dart';

void main() {
  test('Los CSV del catálogo 2026 respetan el contrato real del POS', () {
    const root='/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis ';
    final rows=jsonDecode(File('$root/tmp/catalogo_2026_20261016/datos_reconciliados.json').readAsStringSync()) as List<dynamic>;
    final expected=rows.where((r)=>r['price']!=null).toList();
    final file=File('$root/outputs/catalogo_2026_20261018/catalogo_2026_carga_masiva.csv');
    final report=const ArticuloImportCsv().validar(file.readAsStringSync(),catalogo:const ArticuloImportCatalogo());
    expect(report.errores,isEmpty,reason:report.errores.join('\n'));
    expect(report.importable,isTrue);
    expect(report.productos.length,70);
    expect(report.filasValidas,70);
    for(var i=0;i<expected.length;i++) {
      final product=report.productos[i];
      final variant=product.variantes.single;
      final row=expected[i];
      expect(product.nombre,row['name']);
      expect(product.categoriaId,isNull);
      expect(product.unidadVentaId,isNull);
      expect(variant.nombre,isNull);
      expect(variant.precioVentaMinor,((row['price'] as num)*100).round());
      expect(variant.precioCosteMinor,isNull);
      expect(variant.codigoBarras,row['barcode']==''?isNull:row['barcode']);
      expect(variant.seguimientoExistencias,isFalse);
      expect(variant.existenciasAtomic,0);
    }
    final pending=File('$root/outputs/catalogo_2026_20261018/catalogo_2026_pendientes.csv').readAsStringSync();
    final pendingReport=const ArticuloImportCsv().validar(pending,catalogo:const ArticuloImportCatalogo());
    expect(pendingReport.errores.length,15);
    expect(pendingReport.errores.every((e)=>e.columna=='precio_venta'),isTrue);
    expect(pendingReport.filasValidas,0);
    print('70 productos validados, 59 códigos conservados; 15 pendientes únicamente por precio_venta. Sin escritura en la base.');
  });
}
