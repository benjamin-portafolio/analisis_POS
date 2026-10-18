---
tipo: evidencia_implementacion
estado: fase_7_completa
revision_plan: 1
actualizado: 2026-10-08
---

# Verificación remota: fase 7

Proveedores/precios están operativos offline en server_sync. El catálogo y los
productos convergen entre terminales lógicas, las bases pendientes se entregan
antes de sus dependientes y los conflictos restauran el agregado completo.
Standalone conserva not_required, cero event_refs y ausencia de transporte.
Se completa la fase 7 y el plan revisión 1.

## Entorno y alcance de la evidencia

Se utilizaron PostgreSQL 18.4 en un cluster nuevo y temporal, usuario phase7,
puerto 60937, escucha exclusiva en 127.0.0.1 y bases sintéticas
pos_nest_test_suppliers_phase7 / pos_cash_test_phase7. Las suites PostgreSQL
crean sus esquemas aislados. El arnés HTTP preexistente de seguimiento crea
esquemas seg_phase3_http_<pid>_<timestamp>, inicia NestJS con SyncController,
SyncService y EventsGateway reales y los elimina al detenerse. No carga .env.
Se usaron dos instancias del mismo arnés: una para proveedores y otra para la
regresión preexistente de seguimiento, con esquemas independientes para que
el fixture negativo de evento futuro no afecte otro caso en paralelo.

Flutter utiliza dos o tres archivos SQLite independientes por caso, en
Directory.systemTemp, con device_id distinto. La terminal A se cierra y reabre
sobre el mismo archivo para probar pendientes tras reinicio; C se inicializa
con pull desde cero. Son terminales lógicas ejecutadas en el mismo host,
**no dispositivos físicos**. No se abrió la app ni una base del usuario, no se
migraron datos del usuario y no se desplegó un servidor.

Se conservaron los cambios preexistentes en ambos repositorios, incluidos
Cotizaciones y fases 1–6. Los manifiestos iniciales/finales y deltas distinguen
este trabajo del estado Git anterior. No se eliminaron archivos preexistentes.
app_database.g.dart conserva exactamente su SHA256 inicial: no se regenera Drift,
no cambia schemaVersion=8, no se agregan tablas ni onUpgrade. El cambio en
ProductoDao pertenece a su implementación, sin modificar su accessor generado.

## Comandos y resultados

| Verificación | Resultado |
|---|---|
| dart analyze | Exit 0; No issues found |
| flutter test --reporter json, con ambos endpoints reales y fixture PostgreSQL | 1578 aprobadas, 0 fallidas, 0 omitidas |
| Integración de proveedores | 9 casos HTTP/PostgreSQL/WebSocket reales dentro de la suite completa |
| Regresión remota de seguimiento | 1 caso HTTP/PostgreSQL real; se activa POS_PHASE3_SYNC_URL, sin omitirlo |
| Protección adicional de transporte/aplicación | 4 casos: servidor previo sin capability, eco desconocido, rollback de página y no importar standalone |
| npm run build | Exit 0 |
| npm test -- --runInBand | 21 suites / 314 aprobadas; 193 PostgreSQL omitidas aquí por opt-in |
| RUN_POSTGRES_INTEGRATION=1 npm test -- --runInBand | 48 suites / 507 aprobadas, 0 fallidas, 0 omitidas |
| Typecheck del arnés HTTP | Exit 0 con strictNullChecks y decorators |
| git diff --check en Flutter, NestJS y análisis | Exit 0 |

La corrida ordinaria de NestJS con omisiones **no acredita PostgreSQL**; esa
verificación procede de nest-postgres-final.json. El servidor previo del test
complementario es un HttpServer sintético sin capability: acredita el bloqueo
de envío, no sustituye los nueve escenarios contra NestJS/PostgreSQL.

Comandos de Flutter (endpoints/esquemas concretos en verification-commands.json):

```sh
dart analyze
POS_SUPPLIER_SYNC_URL='<http.json:url>' \
POS_PHASE3_SYNC_URL='<tracking-http.json:url>' \
POS_SUPPLIER_PG_SCHEMA='<http.json:schema>' \
DATABASE_HOST=127.0.0.1 DATABASE_PORT=60937 \
DATABASE_USER=phase7 DATABASE_NAME=pos_nest_test_suppliers_phase7 \
flutter test --reporter json
git diff --check
```

Comandos de NestJS:

```sh
npm run build
npm test -- --runInBand --json --outputFile=/tmp/phase7-nest-unit.json
RUN_POSTGRES_INTEGRATION=1 \
DATABASE_HOST=127.0.0.1 DATABASE_PORT=60937 \
DATABASE_USER=phase7 DATABASE_PASSWORD=isolated-test \
DATABASE_NAME=pos_cash_test_phase7 \
npm test -- --runInBand --json --outputFile=/tmp/phase7-nest-postgres.json
```

La carpeta [Evidencia/2026-10-08-fase7](Evidencia/2026-10-08-fase7) conserva los
resultados por prueba, salida completa, comandos, manifiestos, logs de servidor,
arranque y limpieza. results-summary.json identifica los nueve casos nuevos y
la regresión real preexistente. flutter-cases.json incluye todos los casos
visibles; flutter-suite-final.json conserva el protocolo JSON original.

## Cobertura entre runtimes

| Caso real | Resultado comprobado |
|---|---|
| Alta offline → edición → producto → edición de precio | El primer push entrega solo el alta; edición y producto esperan bases/alta original. Reinicio conserva eventos y refs. |
| Dependencia de proveedor | depends_on_event_id sigue siendo el alta original aunque cambie nombre/notas. Después de confirmación, no se inventa dependencia de una edición de catálogo. |
| Confirmación propia/replay/reintento | HTTP devuelve duplicate con original_sync_status=synced; ecos repetidos conservan la edición optimista posterior, versiones y precios sin duplicados. |
| Nombre/notas y precios independientes | Cambiar el catálogo conserva precio/fecha; las terminales reciben el nombre oficial y los conjuntos correctos. |
| Retirada del último proveedor | [] converge entre A/B/C; el catálogo permanece; versión/secuencia oficiales coinciden. |
| Producto concurrente y cadena posterior | Ganador completo y dos perdedores explícitos; restauración antes del evento oficial y reporte de conflictos por HTTP. |
| Proveedor concurrente | Dos ediciones locales perdedoras se retiran en orden inverso; nombre/notas, versión y precios oficiales permanecen. |
| Alta rechazada y dependientes | Backend rechaza alta inválida; edición y producto no se envían, quedan conflict y se retiran antes de la FK RESTRICT. |
| Alta oficial que colisiona con alta pendiente | Preflight deshace producto/edición/alta en orden inverso y proyecta el catálogo oficial; no quedan pendientes huérfanos. |
| Base de producto rechazada | Edición dependiente bloqueada/restaurada; precios, versión y secuencia vuelven al estado oficial. |
| Cliente legado | Una edición que elimina suppliers/dependencias contra un conjunto conocido es rechazada sin pérdida. Replay legado mantiene ausencia y promoción a [] converge. |
| Receta/directo, venta y costos | Dos variantes comparten proveedor, con receta/directo, precios independientes, cero y máximo seguro. Conflicto de receta/precios restaura ambos conjuntos; venta confirmada, costos, saldo y movimientos permanecen. |
| Desconexión/reconexión | Guardado offline y push fallido conservan pendientes; reinicio recupera el flujo. WebSocket real entrega sync:events_available y connectionEstablished; pull actualiza tras reconectar. |
| Terminal nueva | Pull paginado desde cero reconstruye catálogo, producto, relaciones, precios, fechas, versión y secuencia; sin bootstrap alternativo. |
| Evento futuro por pull | Fila sintética aceptada solo en el esquema temporal: UnsupportedError, cursor intacto, ninguna escritura de la página; finally elimina el fixture y el reintento aplica lo válido. |

Se repiten también las pruebas locales de aceptación, respaldo/restauración,
recetas, seguimiento, ventas, Caja, Cotizaciones, costos, importación, UI y modos.
Las pruebas de layout automatizado no se presentan como pruebas físicas.

## Cambios y decisiones

Flutter retira las restricciones temporales de comandos, handler y UI. Añade
ProveedorPendingEventValidator y ProveedorConflictProjectionRestorer, utilizados
por los coordinadores existentes; extiende producto, push, preparador de eventos
remotos y reconocedor de ecos. El puerto/adaptador de proveedor incorpora
eliminación de altas rechazadas y avance monotónico de secuencia. Las ediciones
basadas en pendientes declaran secuencia causal null y reutilizan el resolvedor
actual. Solo after/base exigen entrega; before conserva refs de retirados.

La restauración mantiene product_update_undo y la protección por lastEventId.
Cadenas rechazadas/conflictivas se procesan en orden inverso; una secuencia de
conflict/rejected no acredita base oficial. No se introduce otra recuperación,
fusión por proveedor, arbitraje por quoted_at_ms, compras o cambios automáticos
de costos. Los eventos desconocidos, incluso ecos, fallan antes de avanzar
checkpoint; pull/preflight no filtran entradas inválidas silenciosamente.

El único ajuste funcional de NestJS de esta fase añade
capabilities:["product_suppliers_v1"] a health, más DTO/prueba. El arnés existente
registra el handler de proveedor y el gateway real; no añade transporte de
producción ni modifica migraciones/handlers de fase 6.

**Compatibilidad concreta:** antes de un push con catálogo nuevo o suppliers
explícito, Flutter consulta health del endpoint. Sin capability o servidor
válido, deja el lote pendiente. Guardar sigue siendo offline. No se presupone
que un servidor anterior preserve campos desconocidos y no se cachea soporte
entre endpoints. Los avisos existentes muestran el motivo de entrega fallida.

**Actualización coordinada obligatoria:** actualizar el servidor y todas las
terminales antes de usar la función, dejando fuera del servicio a clientes
antiguos durante la actualización. Pull distribuye todos los tipos y no filtra
por versión. La capability certifica el servidor, no el conjunto de clientes.
Se documenta este requisito en ambos contratos; no se afirma un despliegue o
una actualización física efectuada aquí.

Standalone mantiene not_required y refs declaradas/validadas pero no persistidas.
El runtime existente no inicia transporte en ese modo. Cambiar el modo no
promueve historial: el uso de un alta standalone o la edición remota de una
base standalone exige importación explícita y se rechaza en este alcance.

## Correcciones y límites reales

Las corridas intermedias fallidas se conservan y no se contabilizan como éxito.
Se actualizaron las pruebas que aún exigían el bloqueo temporal en server_sync.
Se corrigieron el registro inicial del gateway del arnés y una posición incorrecta
de inyección opcional; identidades reutilizadas entre casos y comprobaciones que
asumían un catálogo/sales global vacío después de pull. Se repusieron fixtures
completos de proveedores en una edición oficial de una regresión preexistente.

La regresión HTTP de seguimiento encontró un fallo real: undo tomaba la secuencia
de una base conflictiva como oficial. Se filtra por delivery_status=delivered,
y se verifican explícitamente versión/secuencia junto con precios. Se corrigió
además un registro de evidencia que reutilizaba el nombre del resultado JSON
para el manifiesto de archivos; se separaron nombres y se repitió la salida
completa, conservando resultados por caso y comandos.

PostgreSQL emite la advertencia preexistente pg sobre consultas en un cliente
ocupado; no provoca fallos. Drift advierte de varias instancias de AppDatabase:
aquí tienen ejecutores y archivos independientes deliberadamente. No se trata
de una base compartida entre terminales. No se hicieron pruebas físicas ni de
actualización coordinada real; permanecen límites de operación, sin atribuirles
validación automatizada. La limpieza detiene exclusivamente procesos/cluster
creados en esta fase y conserva los logs.
