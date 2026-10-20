# Recorrido manual de sesión 4

2026-10-18. MacBook Air Mac17,3, Apple M5, 16 GiB, macOS 27.0.1 (26A434),
arm64. Flutter 3.41.6 / Dart 3.11.4. Aplicación nativa **profile** de escritorio,
entry point de verificación `tool/benchmarks/articulo_import_manual.dart`.
No hay tablet conectada: `flutter devices` solo encontró macOS y Chrome.
**C44 permanece parcial**; estas acciones no acreditan tablet ni selector móvil.

## Aislamiento y construcción

El entry point usa los componentes públicos `InventoryArticlesTab` y
`BulkImportScreen`, exportador/preparador/comandos/proyector reales y un harness
existente para preparar SQLite. Nunca llama `setupDependencyInjection` ni
`startConfiguredRuntimeServices`, ni resuelve datos/configuración/credenciales de
la instalación. Standalone y sin servicios remotos. La base está exclusivamente en:

```text
/Users/benjamin/Library/Containers/com.example.posFlutter/Data/Library/Caches/csv-session4-isolated/manual.sqlite
```

El catálogo inicial contiene dos productos y tres variantes: Agua a 18.00,
Café Chica a 25.00 (costo 10.00, barcode 00123, stock 12 piezas) y Grande a
35.00 (costo 15.00, barcode 00456, sin seguimiento). Tres eventos originales.
No se siembran recetas/proveedores en este recorrido manual: su conservación
se acredita con los tests SQLite de comandos, interfaz y reapertura.

Comando inicial, registrado en `manual-app.log`:

```sh
flutter run -d macos --profile --target=tool/benchmarks/articulo_import_manual.dart
```

Falló al empaquetar el framework universal con las arquitecturas combinadas
`arm64 x86_64`. No se cambió el proyecto para resolverlo. La misma compilación
profile sí terminó con una opción de invocación local:

```sh
xcodebuild -workspace macos/Runner.xcworkspace -scheme Runner -configuration Profile -derivedDataPath build/macos -destination 'platform=macOS,arch=arm64' ARCHS=arm64 ONLY_ACTIVE_ARCH=YES
```

Log: `manual-build-arm64.log`, BUILD SUCCEEDED. La app ejecutada fue
`build/macos/Build/Products/Profile/pos_flutter.app`; se abrió y operó con CUA.
No se cambiaron entitlements, dependencias ni configuración de build del repo.

## Acciones observadas

1. El listado mostró Agua 18.00, Café Chica 25.00 con 12 piezas y selector Grande.
2. Pulsar CSV abrió el menú nativo de compartir: archivo
   `catalogo_2026-10-18.csv`, 540 bytes. Se eligió **Copy** local; apareció
   «Se exportó el catálogo: 2 artículos». No se envió a terceros.
3. Se guardó el archivo original como `manual-exportado.csv`, con BOM, doce
   columnas y ambos IDs reales. `manual-antes.json` registra todas las tablas.
4. Se abrió el CSV en TextEdit; su acceso AX agotó timeout al intentar editar.
   Se continuó en **VS Code** con el archivo temporal únicamente: se conservó
   Agua, se omitió la fila Grande y se modificó Chica a producto «CSV Manual
   Café Editado», precio 29.50, barcode 0000099 y existencias informativas 999.
   Se guardó mediante Cmd+S. Copia exacta: `manual-editado.csv`.
5. En Carga masiva, el selector nativo **falló antes de mostrar un diálogo**:
   «No se pudo leer el archivo. Inténtalo de nuevo». No se acreditó selección
   nativa exitosa. `file_picker` 11.0.3 exige entitlement read-only/read-write
   (`FilePickerPlugin.swift`, `checkEntitlement`); los entitlements actuales y
   los de HEAD carecen de ambos. El plugin y esa configuración ya existían.
   `manual-entitlements.log` confirma también la firma de la app sin esos permisos.
   La UI no expone el código PlatformException: el diagnóstico procede de esa
   firma y del código del plugin anterior a NSOpenPanel, no de un error nativo
   capturado con código. Es una limitación previa de plataforma, fuera del cambio CSV; se conserva
   explícitamente pendiente y no se amplían permisos para ocultarla.
6. Para completar manualmente el negocio, se reconstruyó **solo el entry point
   aislado** con `CSV_MANUAL_DIRECT_FILE=true`. El callback `pickFile` lee el
   CSV editado del directorio anterior; la pantalla/preparación/lotes reales
   se mantienen. Este punto de inyección ya existe en `BulkImportScreen`.
   No debe confundirse este paso con aprobar el selector nativo.

```sh
xcodebuild -workspace macos/Runner.xcworkspace -scheme Runner -configuration Profile -derivedDataPath build/macos -destination 'platform=macOS,arch=arm64' ARCHS=arm64 ONLY_ACTIVE_ARCH=YES DART_DEFINES=Q1NWX01BTlVBTF9ESVJFQ1RfRklMRT10cnVl
```

`manual-build-direct-file.log`: BUILD SUCCEEDED. La constante codificada es
`CSV_MANUAL_DIRECT_FILE=true`. Se cerró y volvió a abrir la app con la misma
base aislada; no hubo nuevas semillas.

7. La revisión mostró 0 nuevos, 1 cambiado/1 fila, 1 sin cambios/1 fila y 0
   errores. Se desplegaron nombre actual/propuesto, precio 25.00 → 29.50 y
   barcode 00123 → 0000099; las existencias no aparecieron como diferencia.
8. Se abrió el diálogo actualizado y se canceló. `manual-cancelado.json` es
   idéntico a `manual-antes.json` en **todas** las tablas: siguen tres eventos.
9. Se confirmó el mismo plan. Pantalla: «Carga finalizada», 1/1 lotes,
   1 actualizado, 1 omitido, 0 creados y 0 fallidos. Auditoría SQLite:
   cuatro eventos (uno nuevo), cero refs, cero undo, todos `not_required`;
   mismos IDs/eventos de creación, inventario/memoria/balances intactos y
   campos de Grande conservados. `manual-despues.json`.
10. Se volvió a elegir el mismo archivo. La revisión indicó 0 cambios,
    2 productos/2 filas sin cambios y «Todo está sin cambios. No hay productos
    que guardar». El botón de importar se observó gris/deshabilitado.
    `manual-repetido.json` es idéntico a `manual-despues.json`, incluida la
    secuencia autoincremental: ninguna escritura.
11. Se cerró y abrió la aplicación. El listado mostró «CSV Manual Café
    Editado Chica», 29.50 y **12 piezas**, no 999. Grande sigue a 35.00 y
    Agua a 18.00. `manual-reabierto.json` es idéntico a `manual-despues.json`.

El script reproducible `auditar_manual.py` abre **solo manual.sqlite en modo
read-only**, captura todas las tablas y aplica las aserciones del recorrido.
Durante la actualización solo se permite avanzar la secuencia de events;
tras repetición/reapertura se exige igualdad completa, sin excluir tablas.

## Pendientes y resultados no ejecutados

- **Tablet profile/release**, modelo/SO, selector/compartir móvil, experiencia
  completa con archivos y mediciones físicas: no ejecutados por falta de tablet.
- **Selector nativo macOS:** ejecución fallida, pendiente de resolver/verificar
  por separado. El callback fijo únicamente permite acreditar el resto del
  recorrido manual con el archivo editado realmente en un editor.
- No existe baseline histórico equivalente de tablet. No se inventan tiempos
  ni ratios. Los tiempos de JIT en `Rendimiento.md` son otra medición.
- No se ejecutaron llamadas HTTP de sincronización ni se contactó servidor.
