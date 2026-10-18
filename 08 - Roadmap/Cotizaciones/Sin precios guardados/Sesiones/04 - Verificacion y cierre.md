---
tipo: sesion_implementacion
estado: completada_alcance_local_con_limites_nativos
revision_plan: 3
actualizado: 2026-10-07
---

# Sesión 4: verificación y cierre

## Entrada

Sesiones 2 y 3 completadas. Consumir Plan, Mapeo, P01–P28, Continuidad y AGENTS.
Leer evidencia ya obtenida para concentrarse en lo pendiente y en regresiones.

## Trabajo

1. Completar P01–P28 en standalone y server_sync donde corresponda. Verificar
   filas/eventos/refs y ausencia de movimientos al guardar, consultar o
   recuperar. Comparar resultados antes/después con evidencia SQLite.
2. Probar N líneas y fallo de cada etapa crítica en la transacción de eventos
   de borrador/vínculo; reintento tras respuesta perdida, borrador editado,
   limpieza, reaplicación antigua y rechazo de recuperación de Vendida.
3. Probar bases nuevas en archivo, reinicio sin reset y respaldo/restauración
   en los tres estados. Verificar base antigua superconjunto y respaldo
   protegido incompatible, ambos con versión 8, en copias temporales.
4. Confirmar recuperaciones en efectivo/transferencia/crédito y revisar
   saldos, deuda, inventario y recibos. Verificar que precio/costo están en la
   venta, mientras quotation no tiene columnas ni JSON monetarios. Confirmar
   selección normal de pendientes de sync sin dependencia remota quotation.
5. Auditar código muerto con las búsquedas de Mapeo y revisar esquema generado,
   registrations y dependencias. Retirar únicamente usos exclusivos retirados,
   sin quitar snapshots/importes del catálogo o ventas.
6. Verificar la presentación y las dos generaciones de ticket. Probar selector
   nativo en plataforma disponible; registrar las pruebas móviles no realizadas
   por falta de dispositivo. No reutilizar PNGs del contrato anterior como QA.
7. Ejecutar checks finales apropiados: analyze, suite Flutter y build de la
   plataforma disponible. Repetir generación Drift solo si cambió esquema.
   No ejecutar suite NestJS si su código/contratos no cambiaron; documentar
   esa conservación y cualquier diferencia encontrada al revalidar.
8. Cerrar continuidad con casos, comandos, resultados, evidencia, consecuencia
   de reset y límites. Actualizar índice/estado vigente del plan; preservar las
   evidencias históricas de revisión 2.

## Criterio de salida

Campos y código retirados auditados; ninguna escritura monetaria de quotation;
precio actual capturado correctamente en la venta. P01–P28 con resultado y
evidencia o límite concreto, sin presentar pruebas no ejecutadas como aprobadas.
Reinicio/respaldo/modos/cobro verificados y documentación coherente con código.

## Prompt de ejecución

```text
Ejecuta la sesión 4 de Cotizaciones/Sin precios guardados, revisión 3.
Completa la matriz P01–P28 y la auditoría de campos/JSON/código retirados.
Usa bases temporales para probar rollback, reinicio, esquema antiguo y respaldo
protegido con schemaVersion 8. Verifica modos, cobro cash/transfer/credit y
ausencia de movimientos al cotizar/recuperar. Conserva los importes de ventas
y contratos NestJS. Ejecuta checks finales sin repetir pruebas ya válidas salvo
que haya cambios/fallos. Registra evidencias nuevas y límites nativos reales,
y actualiza continuidad e índice; preserva evidencia anterior y bases de uso.
```

## Resultado ejecutado — 2026-10-07

**Completada en alcance local:** P01–P28 con resultados/evidencia o límite
concreto, esquema/JSON/código muerto auditados, recuperación atómica y
cobro/modos/reinicio/restore verificados en el producto final. Solo tres tests
modificados y uno nuevo; producción/schemaVersion 8/Drift generado intactos.

Dart analyze pasa; flutter test 1306 aprobadas y 1 omitida por servidor aislado;
git diff --check pasa. Build macOS debug/release arm64 pasa. Ocho PNG nuevos
y PNG nativo completos inspeccionados; compartir/WhatsApp abren selector macOS
y cancelan, con posterior reapertura comprobada. Todos los resets usan copias
temporales no protegidas; rechazo antiguo protegido conserva hash/filas/marcador.

Pendientes abiertos: envío/recepción real a WhatsApp, móvil físico Android/iOS
y selector iOS; release universal macOS por fallo de verificación conjunta lipo.
No se marcan aprobados. No hay pendiente funcional de cotización ni cambio NestJS.
Detalles en
[[08 - Roadmap/Cotizaciones/Sin precios guardados/Evidencia/fase-4-verificacion-y-cierre|Evidencia fase 4]]
y [[08 - Roadmap/Cotizaciones/Sin precios guardados/Casos de aceptacion|Matriz resuelta P01–P28]].
