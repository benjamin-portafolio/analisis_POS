# Evidencia de fase 7

Los archivos finales acreditan 1578 pruebas Flutter y 507 NestJS/PostgreSQL,
sin fallos ni omisiones en las corridas completas. Los archivos intermediate
son diagnóstico; no se presentan como aprobación.

- verification-commands.json: argumentos, cwd, variables sintéticas, exit codes
  y duración de analyze, Flutter completo, HTTP dirigido y diffs finales.
- flutter-suite-final.json: salida JSON original de Flutter completo.
- flutter-cases.json / results-summary.json: nombres/resultados y separación
  de los nueve casos remotos de proveedores y el de seguimiento.
- http-final.json: repetición de los nueve casos con comprobación explícita
  de respuesta duplicate/original_sync_status=synced.
- nest-unit-final.json/log: 314 aprobadas y 193 PostgreSQL omitidas por opt-in;
  no equivale a la integración PostgreSQL.
- nest-postgres-final.json/log: 507 aprobadas sin omisiones con PostgreSQL real.
- nest-build-final.log / nest-harness-typecheck-final.log: build y arnés tipado.
- *-initial.json / *-files-final.json / *-delta.json: hashes de lib/test/src/docs,
  archivos modificados/agregados y cero eliminados; Drift generado intacto.
- *status*.txt: cambios Git preexistentes y estado de cierre.
- postgres-http-start.sh: creación del cluster temporal y primer arnés.
- http*.log / tracking-http.log: NestJS y gateway real; endpoints/esquemas
  concretos en http.json y tracking-http.json.
- *postgres-summary.log: eventos/catálogo/precios sintéticos del esquema HTTP.
- cleanup.json / postgres-stop.log / schemas-after-http-stop.log: procesos
  creados detenidos, esquemas del arnés retirados y cluster temporal eliminado.

El segundo arnés reutiliza el mismo servidor de test y otra URL/esquema:

```sh
DATABASE_HOST=127.0.0.1 DATABASE_PORT=60937 \
DATABASE_USER=phase7 DATABASE_PASSWORD=isolated-test \
DATABASE_NAME=pos_nest_test_suppliers_phase7 \
POS_PHASE3_URL_FILE='<runtime>/tracking-http.json' \
npx ts-node test/support/variant-tracking-server.ts
```

El primero usa http.json y --transpile-only; el código final del arnés también
pasó typecheck con strictNullChecks. Ambos registran SyncService, handler de
proveedores y EventsGateway reales. No cargan .env ni abren bases del usuario.
Los comandos ordinarios y PostgreSQL de NestJS están en el informe de fase 7;
la contraseña documentada es sintética y el cluster tenía autenticación trust.

La prueba de evento futuro inserta y elimina únicamente una fila aceptada en
el esquema temporal comprobado por prefijo. No añade soporte a tipos futuros
en producción. Su finally limpia el fixture antes del reintento válido.
Las pruebas complementarias de servidor previo usan HttpServer sintético y las
de rollback aplican RemoteEventApplier sobre SQLite; se distinguen de NestJS real.

Terminales lógicas A/B/C: SQLite independientes y device_id distintos.
No se realizaron pruebas físicas ni despliegue. Los logs guardan tiempos UTC;
la fecha de sesión/plan usa America/Mexico_City: 2026-10-08.
