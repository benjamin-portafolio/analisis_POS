import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:pos_flutter/application/import/articulo_catalog_import_service.dart';
import 'package:pos_flutter/data/local/import/articulo_import_csv.dart';

void main() {
  test('CSV de la fotografía se acepta sin escribir en base de datos', () {
    const root='/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis ';
    final file=File('$root/outputs/sabritas_foto_20261016/sabritas_productos_carga_masiva.csv');
    final report=const ArticuloImportCsv().validar(file.readAsStringSync(),catalogo:const ArticuloImportCatalogo());
    expect(file.readAsBytesSync().take(3).toList(),[0xEF,0xBB,0xBF]);
    expect(report.errores,isEmpty,reason:report.errores.join('\n'));
    expect(report.importable,isTrue);
    expect(report.productos.length,32);
    expect(report.filasValidas,32);
    final variants=report.productos.expand((p)=>p.variantes).toList();
    expect(variants.length,32);
    expect(variants.every((v)=>v.codigoBarras!=null),isTrue);
    expect(variants.map((v)=>v.codigoBarras).toSet().length,32);
    expect(variants.every((v)=>v.precioCosteMinor==null),isTrue);
    expect(variants.every((v)=>!v.seguimientoExistencias),isTrue);
    int price(String name)=>report.productos.singleWhere((p)=>p.nombre==name).variantes.single.precioVentaMinor;
    expect(price('Paketaxo Quexo 81 g'),2000);
    expect(price('Crujitos Queso y Chile 42 g'),1800);
    expect(price('Barcel Hot Nuts Fuego 125 g'),2200);
    expect(price('Barcel Big Mix Jalapeño 75 g'),2500);
    expect(variants.where((v)=>v.codigoBarras!.length==12).length,2);
    print('32 productos y 32 códigos aceptados. Validación sin escrituras en base de datos.');
  });
}
