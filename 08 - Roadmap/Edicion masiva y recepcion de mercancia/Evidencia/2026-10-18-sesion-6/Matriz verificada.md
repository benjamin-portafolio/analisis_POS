# Matriz verificada M01–M48

M01–M46: aprobados en el alcance automatizado local/remoto. M48: medición de escritorio completa. M47: automatización aprobada; validación física pendiente. No se declara cierre global.

La pasada completa y los comandos/resultados se registran en `Resumen de resultados.md` y `checks.json`. Las condiciones y los límites físicos/remotos están en `Verificacion y cierre.md`; las cinco corridas por escenario, en `Rendimiento.md`.

| Caso | Resultado | Pruebas de referencia |
|---|---|---|
| M01 | Aprobado automatizado | A, B |
| M02 | Aprobado automatizado | A |
| M03 | Aprobado automatizado | A, C, D |
| M04 | Aprobado automatizado | E |
| M05 | Aprobado automatizado | A, E, F |
| M06 | Aprobado automatizado | A, G |
| M07 | Aprobado automatizado | F |
| M08 | Aprobado automatizado | F |
| M09 | Aprobado automatizado | F, C, D |
| M10 | Aprobado automatizado | G |
| M11 | Aprobado automatizado | A, B, C, D |
| M12 | Aprobado automatizado | F, C, D |
| M13 | Aprobado automatizado | F |
| M14 | Aprobado automatizado | F |
| M15 | Aprobado automatizado | F |
| M16 | Aprobado automatizado | A, F, C, D |
| M17 | Aprobado automatizado | G |
| M18 | Aprobado automatizado | A, B, C, D |
| M19 | Aprobado automatizado | F, G |
| M20 | Aprobado automatizado | F, G |
| M21 | Aprobado automatizado | G |
| M22 | Aprobado automatizado | G, B, C, D |
| M23 | Aprobado automatizado | F |
| M24 | Aprobado automatizado | F, G |
| M25 | Aprobado automatizado | A, F, G |
| M26 | Aprobado automatizado | G |
| M27 | Aprobado automatizado | G |
| M28 | Aprobado automatizado | G, H |
| M29 | Aprobado automatizado | G, H |
| M30 | Aprobado automatizado | H |
| M31 | Aprobado automatizado | G, H, D, I |
| M32 | Aprobado automatizado | G, H |
| M33 | Aprobado automatizado | H |
| M34 | Aprobado automatizado | G, H, D |
| M35 | Aprobado automatizado | B, C, D |
| M36 | Aprobado automatizado | C, D |
| M37 | Aprobado automatizado | B, C, D |
| M38 | Aprobado automatizado | B, C, D |
| M39 | Aprobado automatizado | D, J, K |
| M40 | Aprobado automatizado | B, D |
| M41 | Aprobado automatizado | F, G, K |
| M42 | Aprobado automatizado | F, G, K, I |
| M43 | Aprobado automatizado | I |
| M44 | Aprobado automatizado | I |
| M45 | Aprobado automatizado | I |
| M46 | Aprobado automatizado | I |
| M47 | Automático aprobado; **físico pendiente** | B, C, L |
| M48 | Mediciones host completas; sin garantía tablet | L, M |

## Archivos de referencia

- **A**: `test/presentation/pages/gestion_inventario/edicion_masiva/borrador_edicion_masiva_test.dart`.
- **B**: `test/presentation/pages/gestion_inventario/edicion_masiva/edicion_masiva_task_screen_test.dart`.
- **C**: `test/presentation/pages/gestion_inventario/edicion_masiva/recepcion_compacta_screen_test.dart`.
- **D**: `test/presentation/pages/gestion_inventario/edicion_masiva/recepcion_recorrido_test.dart`.
- **E**: `test/domain/articulos/importe_comercial_codec_test.dart`.
- **F**: `test/application/commands/articulos/editar_articulo_comercial_test.dart`.
- **G**: `test/application/commands/edicion_masiva/edicion_masiva_command_service_test.dart`.
- **H**: `test/application/commands/edicion_masiva/recepcion_reapertura_test.dart`.
- **I**: `test/integration/recepcion_masiva_server_test.dart`.
- **J**: `test/presentation/pages/gestion_inventario/inventory_management_screen_test.dart`.
- **K**: `test/core/di/edicion_masiva_dependencies_test.dart`.
- **L**: `test/presentation/pages/gestion_inventario/edicion_masiva/recepcion_verificacion_test.dart`.
- **M**: `tool/benchmarks/recepcion_masiva_verification.dart`.

Las suites de SQLite verifican fotografías de todas las tablas, triggers y archivos temporales reales. Las condiciones de UI con reloj/foco simulado no acreditan comportamiento físico. M43–M46 incluyen HTTP/PostgreSQL reales; los detalles de inyección de fallos no se presentan como fallos naturales del servidor.
