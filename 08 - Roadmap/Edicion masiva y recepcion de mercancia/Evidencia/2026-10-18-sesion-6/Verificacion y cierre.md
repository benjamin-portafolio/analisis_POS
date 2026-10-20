# Sesión 6: verificación y cierre condicionado

Iniciada el 18 de octubre; cierre de automatización el **19 de octubre de 2026**,
zona America/Mexico_City. Se conserva la carpeta fechada por el inicio de sesión.

La automatización local y remota se verifica con datos sintéticos. **El cierre
completo sigue pendiente de M47 físico.** No se abrió la app con una base del
usuario, no se desplegó y no se cambió código funcional ni protocolo de NestJS.

## Alcance y conservación

Se continuó desde las sesiones 1–5, Flutter `09a1529` y NestJS `dcc2907`.
Se conservaron el CSV implementado, escaneo, Caja, Cotizaciones y demás cambios
previos. Los manifiestos `*-hashes-iniciales.json` y el delta final distinguen
lo recibido de lo cambiado en esta sesión. El generado de Drift, sus tablas,
DAOs y schemaVersion no cambian respecto del inicio; no corresponde build_runner.

## Fallos encontrados y correcciones

1. La nueva entrada estricta tomaba `lastServerSequence` heredado aunque su
   `base_event_id` fuera un movimiento local pendiente. La segunda recepción
   encadenada llegaba al servidor con la secuencia del antecesor y entraba en
   conflicto. Ahora usa secuencia null para esa base pendiente y mantiene la
   dependencia causal existente, sin modificar ni reenviar otro evento.
2. El push preexistente restauraba movimientos en conflicto, pero no los
   rechazados. En catálogo aceptado/entrada rechazada, la SQLite conservaba un
   saldo optimista que la otra terminal no tenía. Se incluye ese tipo en la
   restauración existente; los eventos y resultado histórico del diario se
   conservan con sus estados distintos.
3. La preparación remota preexistente no retiraba la cadena optimista del
   recurso antes de aplicar un movimiento oficial concurrente. El handler
   fallaba por base distinta antes de poder revalidar. Se restaura esa cadena
   en orden inverso usando el limpiador actual y se identifica el conflicto.
   Ecos propios ya aplicados siguen su ruta vigente. La protección por
   evento/versión evita borrar estado oficial posterior en restauraciones tardías.
4. A 320 px y texto 1.3, las tres columnas de existencias/cantidad/previsto
   comprimían etiquetas y el costo desconocido truncaba su etiqueta. Los labels
   permanecen flotantes y, si falta ancho según la escala del texto, cantidad
   ocupa una línea completa debajo de existencias y previsto. Los nombres se
   muestran completos para no ocultar la variante al final. No cambia el
   borrador ni la secuencia Siguiente de costo → venta → cantidad.

Las correcciones 2–3 cubren huecos preexistentes del cliente que esta recepción
necesita para cumplir M45–M46. Reutilizan las restauraciones y contratos vigentes;
no agregan dependencia catálogo → movimiento, fusión, otra política de arbitraje,
protocolo, endpoints ni recepción remota atómica. No apareció una necesidad de
cambiar semántica remota del servidor dentro de los casos ejecutados.

## Integración real M43–M46

`test/integration/recepcion_masiva_server_test.dart` ejecuta seis escenarios:

- El cliente recibe una respuesta real del servidor y la descarta después del
  commit. SQLite conserva los IDs pendientes; tras cerrar/reabrir A se reenvían
  exactamente esos IDs. El servidor devuelve dos `duplicate`; B reconstruye
  un movimiento y saldo 7 desde 5 + 2. PostgreSQL confirma una entrada, costo null.
- Proveedor nuevo pendiente y dos recepciones encadenadas. El catálogo espera
  su proveedor/base; la entrada independiente puede entregarse primero. La
  segunda entrada tiene base causal con secuencia null. Tras las vueltas de
  sync, A/B convergen en catálogo, proveedor y saldo 10, sin nueva recepción.
- Se elimina únicamente la capability de la respuesta health real dentro del
  cliente de pruebas. No se envía push, no se degrada el payload y la fotografía
  completa de SQLite permanece idéntica. Restaurado el anuncio, se entrega.
- Catálogo aceptado/entrada rechazada y catálogo rechazado/entrada aceptada:
  se inyecta `base_version=0` en el sobre del evento elegido **solo en el
  transporte de prueba**. NestJS real decide el rechazo, persiste/acepta las
  partes correspondientes y Flutter aplica su restauración. A/B convergen;
  PostgreSQL acredita respectivamente cero o una entrada. Resolver solo el
  precio de la segunda situación mantiene saldo 7 y una entrada.
- Dos terminales cambian catálogo y recurso sobre la misma base; una encadena
  otra recepción. Preflight restaura las perdedoras en orden inverso, conserva
  un producto independiente posterior y aplica el estado ganador. Resolver
  solo precio deja saldo 9 y una entrada ganadora. Repetir la restauración
  antigua después de la resolución no cambia ninguna tabla.

Son dos terminales **lógicas**, con archivos SQLite independientes en temporal,
device_id distintos y arranque remoto paginado. Las decisiones de aceptación,
rechazo y deduplicación proceden de HTTP/NestJS/PostgreSQL reales. Las fallas
inyectadas no simulan una respuesta de aceptación. El SQL de comprobación exige
loopback, prefijo `pos_nest_test_`, esquema del arnés e IDs UUID válidos.

Se reutilizó `test/support/variant-tracking-server.ts` sin modificarlo. PostgreSQL
18.4 se inició en un cluster temporal nuevo, puerto 63518, usuario sintético
`recepcion_s6`, base `pos_nest_test_recepcion_s6`. Tres instancias del arnés usan
esquemas distintos para recepción, proveedores y seguimiento. Así el fixture de
evento futuro de la regresión de proveedores no contamina otras suites. Puertos,
esquemas y comandos exactos: `runtime.json` y `checks.json`. No se cargó `.env`.

## Integridad, recuperación y modos

La suite incluye las pruebas reales de recepción/transacción y las 17 de
reapertura: triggers de fallo tras catálogo/primer movimiento/antes del resultado,
rollback completo por producto, conjunto parcial, mismo ID con igual/distinta
intención, SIGKILL antes/después del commit, diario al reabrir la misma SQLite,
esquema vigente/anterior y respaldo/restauración. No se sustituyeron por mocks.

Se conserva `LocalEventRef` declarada y validada en ambos modos. Standalone
conserva `not_required`, cero filas event_refs y cero conexiones al iniciar su
runtime y usar el acceso público. Server_sync mantiene refs, bases, dependencias
y capability. El cambio de modo bloquea reservas incompatibles y el historial
standalone no se promueve. Abrir recuperación no ejecuta reservas.

La revisión y resultado distinguen commit local histórico y entrega actual por
cada ID. Catálogo y cada entrada pueden tener estados remotos distintos; el
diario aplicado no se interpreta como aceptación remota ni se vuelve a ejecutar
para resolver un precio.

## Interfaz y evidencia visual

Los tests existentes conservan ambas vistas, revisión de filas ocultas,
proveedor/fecha/unidades, retorno y cancelación, teclado simulado con inset 280,
selección, foco, Siguiente y respuesta tardía. El acceso del menú público y la
DI real se ejercitan en ambos modos. La regresión completa conserva CSV y escaneo.

`recepcion_verificacion_test.dart` comprueba a 320/360/390/800 px, altura 900,
texto 1.3 y nombres largos: etiquetas semánticas, targets Android ≥48 px,
ausencia de overflow y composición adaptable. Sus cuatro casos se ejecutan con
fuente de pruebas y además con Roboto real; el quinto acredita SQLite de 10000
variantes, página 100, cero lecturas de detalle al abrir/buscar y menos de 20
TextField construidos. No hidrata snapshots de todo el catálogo.

Los ocho PNG `*-tarea.png`/`*-compacta.png` son **renders de widgets sintéticos**
con Roboto del SDK; se inspeccionaron las cuatro anchuras y ambas vistas. No son
capturas de una tablet ni acreditan teclado nativo, VoiceOver/TalkBack o hardware.

## Validación física pendiente

`flutter devices --machine` solo encontró macOS y Chrome. No hay teléfono/tablet
físico conectado en este entorno. **M47 físico no está aprobado.**

| Dato/recorrido | Estado |
|---|---|
| Modelo, SO y build móvil | Pendientes; no se atribuyen los del Mac a un móvil |
| Captura y commit con red deshabilitada | Pendiente en teléfono/tablet |
| Teclado real, foco/selección/Siguiente, entrada visible y retorno/orientación | Pendiente |
| Accesibilidad con lector de pantalla real y texto ampliado del sistema | Pendiente |
| Cierre/reapertura antes/después del commit conservando la misma base/diario | Pendiente en hardware; SIGKILL/SQLite de escritorio sí probado |
| Rendimiento y presupuesto de tiempo para tablet | Pendiente de equipo representativo; estas cifras no son garantía |

No recuperar un borrador sin confirmar, sobrevivir a reset de desarrollo o
recuperar operaciones posteriores a un snapshot antiguo sigue fuera de garantía.
El historial del diario se lee completo; su crecimiento y render sin paginación
son límites explícitos en `Rendimiento.md`, no una promesa de historial ilimitado.

## Comandos, resultados e incidencias

Los resultados finales y recuentos están en `checks.json`, los logs finales,
`Resumen de resultados.md`, `Matriz verificada.md` y `Rendimiento.md`. El script
`ejecutar_checks.py` reproduce los checks mientras el cluster/arneses de
`runtime.json` estén encendidos; sus rutas temporales no son servicios persistentes.

Se conservan los primeros intentos fallidos: tres fallos reales de integración
arriba descritos, un getter equivocado en el test nuevo y advertencias del
analizador corregidas. Las iteraciones de render corrigieron una selección
incorrecta del nodo semántico, salida asíncrona de imágenes desde el reloj de
widgets y liberación de SemanticsHandle; fueron errores del arnés de pruebas.
El benchmark corrigió el nombre `returned_rows` para no sobreescribir el tamaño
del fixture del diario al incorporar consultas de nombres; la pasada final usa
las dos métricas separadas. Los JSON exploratorios se conservan aparte.
Al mostrar nombres completos, dos tests asumían que el encabezado desplazado
seguía construido por el listado perezoso. Ahora vuelven al encabezado mediante
scroll antes de cambiar tarea/vista; sus aserciones de foco y captura se conservan.
La primera ejecución PostgreSQL adicional falló 14 casos porque se pasó
DATABASE_PASSWORD vacía a suites que exigen un valor; se repitieron con una
contraseña sintética no vacía y pasaron sus 104 casos. No se cambió backend.

Las advertencias Drift sobre múltiples instancias en suites preexistentes son
advertencias de debug; cada terminal nueva usa executor/archivo distinto. Los
logs completos no ocultan esas advertencias ni los intentos fallidos.
