import 'package:flutter_test/flutter_test.dart';
import 'validar_csv.dart' as validation;

void main() {
  test('El importador del POS acepta las 27 presentaciones del archivo generado', () {
    validation.main([
      '/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /outputs/bebidas_foto_20261016/bebidas_carga_masiva.csv',
    ]);
  });
}
