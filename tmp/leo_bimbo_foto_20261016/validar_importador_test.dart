import 'package:flutter_test/flutter_test.dart';
import 'validar_csv.dart' as validation;

void main() {
  test('El importador del POS acepta los 24 artículos del archivo generado', () {
    validation.main([
      '/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /outputs/leo_bimbo_foto_20261016/leo_bimbo_productos_carga_masiva.csv',
    ]);
  });
}
