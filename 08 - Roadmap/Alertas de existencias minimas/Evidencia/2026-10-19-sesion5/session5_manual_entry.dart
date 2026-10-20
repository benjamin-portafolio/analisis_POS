// Entry point temporal de verificación. No forma parte del producto.
// ignore_for_file: depend_on_referenced_packages
import 'dart:io';
import 'package:flutter/widgets.dart';
import 'package:path_provider_platform_interface/path_provider_platform_interface.dart';
import 'package:pos_flutter/application/commands/articulos/crear_articulo_command.dart';
import 'package:pos_flutter/application/commands/articulos/crear_articulo_variante_command.dart';
import 'package:pos_flutter/application/config/app_config.dart';
import 'package:pos_flutter/data/local/config/app_config_file_store.dart';
import 'package:pos_flutter/data/local/drift/app_database.dart';
import 'package:pos_flutter/domain/articulos/sale_configuration.dart';
import 'package:pos_flutter/domain/inventario/inventory_unit_ids.dart';
import 'package:pos_flutter/main.dart' as production;
import 'product_supplier_harness.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final isolated = Directory(
    '${Directory.systemTemp.path}/pos_s5_manual_isolated',
  );
  await isolated.create(recursive: true);
  PathProviderPlatform.instance = _IsolatedPaths(isolated.path);
  // ignore: avoid_print
  print('SESSION5_ISOLATED_DIRECTORY=${isolated.path}');
  await AppConfigFileStore().saveConfig(
    AppConfig.initial.copyWith(
      setupCompleted: true,
      businessName: 'Sesión 5 — base descartable',
      backupProvider: BackupProvider.none,
    ),
  );
  final h = ProductSupplierHarness(database: AppDatabase());
  if ((await h.db.select(h.db.products).get()).isEmpty) {
    for (final measured in [false, true]) {
      await h.commands.crearArticulo(
        CrearArticuloCommand.conVariantes(
          nombre: measured ? 'Sesión 5 medido' : 'Sesión 5 piezas',
          saleConfiguration: measured
              ? MeasuredSaleConfiguration(
                  saleUnitId: InventoryUnitIds.kilogram,
                  priceReferenceQuantityAtomic: 1000,
                )
              : const UnitSaleConfiguration(),
          variantes: [
            CrearArticuloVarianteCommand(
              nombre: null,
              precioVenta: '10',
              costoEstandar: '5',
              inventoryUnitId: measured
                  ? InventoryUnitIds.kilogram
                  : InventoryUnitIds.piece,
              initialStockQuantity: '6',
            ),
          ],
        ),
      );
    }
  }
  await h.dispose();
  await production.main();
}

class _IsolatedPaths extends PathProviderPlatform {
  _IsolatedPaths(this.directory);
  final String directory;
  @override
  Future<String?> getApplicationDocumentsPath() async => directory;
  @override
  Future<String?> getApplicationSupportPath() async => directory;
  @override
  Future<String?> getTemporaryPath() async => directory;
}
