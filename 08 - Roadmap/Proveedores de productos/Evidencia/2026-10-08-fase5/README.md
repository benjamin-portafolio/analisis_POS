# Evidencia de fase 5 · 2026-10-08

Fase 5 y alcance local completos. Código: `/Users/benjamin/Projects/POS/pos_flutter`.
Matriz e informe en la carpeta de Proveedores de productos:

- [Matriz de aceptación](../../Matriz%20de%20aceptacion%20local.md).
- [Resultados, corrección, comandos y límites](../../Verificacion%20local%20-%20fase%205.md).
- `casos-ejecutados.json`: nombre/archivo/resultado de cada test de la suite final.
- `matriz-aceptacion.json`: correspondencia exacta de 32 comprobaciones locales
  aprobadas; 3 casos remotos y pruebas físicas no ejecutados.
- `resultados-suite.json`: 1567 aprobadas, 0 fallidas, 1 omitida remota;
  conteos por archivo y omisión exacta.
- `comprobaciones-finales.json`: dart analyze, flutter test y diff check,
  logs/tiempos/códigos de salida; todos exit 0.
- `restore-populated.json` / `restore-empty.json`: datos sintéticos,
  metadatos/SHA del snapshot, reapertura/restore/repositorios/UI.
- `rejected-*.json`: cinco rechazos previos al reemplazo y datos conservados.
- `regression-commercial-prices.json`: comparación de ventas/Caja,
  Cotizaciones y existencias no vacías antes/después de capturar precios.
- `preservacion.json`, hashes y `*-fase5.diff`: delta contra copia inicial;
  versión/migración/generado y trabajo preexistente conservados.

Los logs intermedios conservan los fallos reproducidos y corridas interrumpidas;
no cuentan como aprobación. La corrección y la suite final pasan. No se
regeneró Drift, no se inició NestJS/server_sync ni se usaron datos del usuario.
Sin cambios de presentación: se reutilizan seis renders de fase 4 y se
ejecutan de nuevo sus pruebas de layout/teclado simulado. Pruebas físicas y
remotas no realizadas.
