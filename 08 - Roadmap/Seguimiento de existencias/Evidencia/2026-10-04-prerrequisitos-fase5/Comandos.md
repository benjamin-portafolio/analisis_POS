# Invocaciones y reproducción — auditoría de entrada a fase 5

Comandos realmente ejecutados desde Flutter:

```sh
dart analyze
flutter test --reporter json
flutter test <directorio-temporal>/core_prerequisites_test.dart --reporter expanded
```

La sonda temporal se copió sin cambios desde
`Evidencia/2026-10-04-auditoria-core/core_prerequisites_test.dart.txt`. La misma
fuente se conserva aquí. No se instaló como test permanente.

Desde NestJS:

```sh
npm run build
RUN_POSTGRES_INTEGRATION=1 DATABASE_HOST=127.0.0.1 DATABASE_PORT=55839 \
  DATABASE_USER=seg_audit DATABASE_PASSWORD=isolated DATABASE_NAME=seg_fase5_audit \
  npm test -- --runInBand --json --outputFile=<directorio-temporal>/nest-test.json
RUN_POSTGRES_INTEGRATION=1 DATABASE_HOST=127.0.0.1 DATABASE_PORT=55839 \
  DATABASE_USER=seg_audit DATABASE_PASSWORD=isolated DATABASE_NAME=pos_cash_test_seg_fase5 \
  npm test -- --runInBand --json --outputFile=<directorio-temporal>/nest-test-cash-name.json
```

`<directorio-temporal>` fue
`/var/folders/04/yg6cpm0s6ndgdwzkk756x3nm0000gn/T/pos-seg-prerrequisitos-fase5-20261004-iacflla8`.
Esas rutas son históricas; el clúster fue detenido. Usar nuevo directorio/puerto
para repetir, sin reapuntar comandos a la base dev. El nombre de base con
prefijo `pos_cash_test_` permite ejecutar las dos suites que lo exigen.

Comparación de código base: `git archive HEAD` de cada proyecto se extrajo en
`flutter-head`/`nest-head` dentro del directorio temporal. En Flutter se ejecutó
`flutter pub get --offline`, seguido de:

```sh
flutter test test/application/commands/articulos/producto_command_service_test.dart \
  test/application/import/articulo_import_batch_service_test.dart \
  test/data/local/drift/product_inventory_tracking_local_event_store_test.dart \
  test/presentation/pages/gestion_inventario/inventory_management_screen_test.dart \
  test/presentation/pages/gestion_inventario/articulos/variant_inventory_movement_test.dart \
  --reporter json
```

En la copia NestJS se enlazó `node_modules` del proyecto original para usar las
mismas dependencias instaladas, sin alterar sus fuentes. Se ejecutó el mismo
comando con RUN_POSTGRES_INTEGRATION=1 y la conexión aislada, primero
`--runTestsByPath src/sync/financial-events.postgres.spec.ts` sobre
`seg_fase5_audit`, y luego la suite completa sobre `pos_cash_test_seg_head`.
Reportes: `nest-head-financial.json` y `nest-head-test.json`.

Para preparar otro entorno PostgreSQL aislado, el procedimiento siguiente es
una receta de reproducción, no una ejecución adicional aprobada:

```sh
# Elegir un puerto libre y exclusivo para este clúster temporal.
seg_port=55839
seg_run=$(mktemp -d /tmp/pos-seg-repeticion.XXXXXX)
mkdir "$seg_run/socket"
initdb -D "$seg_run/pgdata" -U seg_audit -A trust --no-locale
pg_ctl -D "$seg_run/pgdata" -l "$seg_run/postgresql.log" \
  -o "-p $seg_port -k $seg_run/socket -h 127.0.0.1" -w start
createdb -h 127.0.0.1 -p "$seg_port" -U seg_audit pos_cash_test_seg_repeticion
# Exportar SOLO conexión de prueba; ejecutar suites desde los proyectos.
export RUN_POSTGRES_INTEGRATION=1 DATABASE_HOST=127.0.0.1 DATABASE_PORT="$seg_port"
export DATABASE_USER=seg_audit DATABASE_PASSWORD=isolated
export DATABASE_NAME=pos_cash_test_seg_repeticion
# Al terminar las pruebas:
pg_ctl -D "$seg_run/pgdata" -m fast -w stop
```

No arrancar AppModule contra datos de uso para esta comprobación. Las specs de
seguimiento crean/desechan esquemas propios y ejecutan las migraciones con
QueryRunner en ellos. Las suites generales de caja trabajan en la base temporal.
Los eventos/identidades de pruebas nunca se entregaron a terminales de uso.

No se ejecutaron build_runner (sin cambios Drift), app UI, prueba física/tablet,
renderer, A/B de dos clientes, instancia HTTP, importación de modos, despliegue o
migraciones sobre `pos_nest`. Resultados y alcance se describen en `Resultados.md`;
estas omisiones no se cuentan como verificaciones realizadas.
