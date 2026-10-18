# Evidencia de fase 4 · 2026-10-08

Código en `/Users/benjamin/Projects/POS/pos_flutter`. Logs y resultados:

- Base: analyze sin problemas; 1493 tests aprobados y 1 omitido.
- Final: analyze sin problemas; 1559 tests aprobados y 1 omitido.
- 66 nuevos tests: modelo 33, widgets 26, UI/SQLite temporal 7.
- La omisión requiere POS_PHASE3_SYNC_URL; no se ejecutó servidor remoto.
- Preservación por hashes contra copia al iniciar: 4 archivos existentes de
  presentación y contrato modificados; 739 restantes idénticos; 9 archivos nuevos.
- No cambios a core, Drift, versión/migración/generado o NestJS.

Las seis capturas corresponden al motor de Flutter test y fueron inspeccionadas.
`initial` muestra apertura; `keyboard` enfoca precio con insets simulados.
Se usan fuentes Roboto/MaterialIcons del SDK para hacer el texto legible.
No son capturas de teléfono/tablet físico ni del teclado real. La suite prueba
scroll y Guardar accesibles también con los insets y escala de texto indicada.

Verificación final:

```sh
dart analyze
flutter test --reporter expanded
git diff --check
```

Render opcional (ajustar rutas al SDK y a un directorio temporal propio):

```sh
POS_SUPPLIER_PREVIEW_DIR='/tmp/pos-supplier-previews' \
POS_SUPPLIER_PREVIEW_FONTS='/opt/homebrew/share/flutter/bin/cache/artifacts/material_fonts' \
flutter test test/presentation/pages/gestion_inventario/articulos/variant_suppliers_editor_test.dart \
  --plain-name 'teléfono/tablet' --reporter expanded
```

No se abrió ni restauró la base del usuario. Las pruebas UI escriben SQLite
bajo Directory.systemTemp y eliminan esos archivos. Las pruebas físicas,
respaldo/restauración y cierre local de fase 5 continúan pendientes.
