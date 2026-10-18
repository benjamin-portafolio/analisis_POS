// Entry point de verificación: sólo SQLite temporal, sin DI/runtime de la app.
import 'dart:convert';
import 'dart:io';
import 'package:drift/drift.dart' hide Column;
import 'package:drift/native.dart';
import 'package:flutter/material.dart';
import 'package:pos_flutter/data/local/drift/app_database.dart';
import 'package:pos_flutter/presentation/pages/cotizaciones/quotation_ticket_screen.dart';
import 'package:share_plus/share_plus.dart';
import 'file:///Users/benjamin/Projects/POS/pos_flutter/test/support/quotation_harness.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final temp = await Directory.systemTemp.createTemp('pos_quotation_native_');
  final h = QuotationHarness(
    database: AppDatabase.forTesting(
      NativeDatabase(File('${temp.path}/probe.sqlite')),
    ),
  );
  await h.seed();
  await h.db
      .update(h.db.products)
      .write(
        const ProductsCompanion(
          name: Value(
            'Artículo con nombre largo para verificar cotización nativa y regreso',
          ),
        ),
      );
  await h.add();
  await h.add(QuotationHarness.recipeId);
  await h.add(QuotationHarness.measuredId);
  final save = await h.intent();
  await h.service().guardar(save);
  final before = jsonEncode(await h.contents());
  await File('${temp.path}/before.json').writeAsString(before);
  print('NATIVE_PROBE temp=${temp.path} quotation=${save.quotationId}');
  var attempt = 0;
  runApp(
    MaterialApp(
      home: Builder(
        builder: (context) => Scaffold(
          appBar: AppBar(
            title: const Text('Verificación nativa · SQLite temporal'),
          ),
          body: Center(
            child: FilledButton(
              child: const Text('Abrir cotización guardada'),
              onPressed: () async {
                await Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => QuotationTicketScreen(
                      quotationId: save.quotationId,
                      repository: h.repository,
                      shareTicket: (params) async {
                        attempt++;
                        print(
                          'NATIVE_PROBE share_start attempt=$attempt name=${params.fileNameOverrides}',
                        );
                        final result = await SharePlus.instance.share(params);
                        final unchanged =
                            before == jsonEncode(await h.contents());
                        print(
                          'NATIVE_PROBE share_return attempt=$attempt status=${result.status.name} sqlite_unchanged=$unchanged',
                        );
                        await File(
                          '${temp.path}/share-$attempt.json',
                        ).writeAsString(
                          jsonEncode({
                            'status': result.status.name,
                            'sqlite_unchanged': unchanged,
                            'filename': params.fileNameOverrides,
                          }),
                        );
                        return result;
                      },
                    ),
                  ),
                );
                print(
                  'NATIVE_PROBE route_return sqlite_unchanged=${before == jsonEncode(await h.contents())}',
                );
              },
            ),
          ),
        ),
      ),
    ),
  );
}
