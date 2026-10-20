# Sesión 3: recepción, transacción y reintentos

Continúa las sesiones 1–2. Lee AGENTS y guías offline de Flutter, más el
[[08 - Roadmap/Edicion masiva y recepcion de mercancia/Plan de implementacion|Plan]],
[[08 - Roadmap/Edicion masiva y recepcion de mercancia/Estado y continuidad|Estado]] y
[[08 - Roadmap/Edicion masiva y recepcion de mercancia/Matriz de aceptacion|Matriz]].
Revisa Git y preserva el trabajo ajeno. Esta fase es un hito de integridad.

Implementa el coordinador de edición masiva y un puerto de diario local con
adaptador Drift. Reserva las operaciones confirmadas con identidad estable
por captura/producto e intención normalizada. Diario y eventos deben vivir
en la misma SQLite: el resultado aplicado se guarda dentro de la misma
transacción exterior que catálogo y movimientos de ese producto.

Comprueba primero si la operación ya terminó: devolver IDs originales con
intención idéntica; rechazar el mismo ID con datos distintos. Después validar
producto/recurso/base/saldo/vínculo/unidad confirmados, aplicar el comando
comercial y entradas `stock_receipt` positivas mediante contratos vigentes.
Adapta el comando de inventario para validar la base esperada, sin cambiar
silenciosamente la semántica de sus otros consumidores. No usar un fallback
sin transacción ni generar UUID nuevos al reintentar una operación aplicada.

El rollback afecta al producto completo; otros productos pueden continuar
secuencialmente. Reabrir ofrece continuar confirmados incompletos después de
revalidar, sin ejecución automática. Un resultado local remite a los eventos
originales: su entrega/conflicto remoto se consulta por separado.

La tabla de diario es metadato local, no proyección sincronizable; documenta
excepción a CommonFields y finalidad de campos. Sigue AGENTS: schemaVersion
fijo, sin onUpgrade y `dart run build_runner build`. No cambiar tablas
comerciales ni payloads NestJS. Bloquea reutilización automática entre modos.
Registra tabla/DAO y actualiza la comprobación de esquema de arranque; exige
la tabla nueva y conserva la base vigente entre arranques. Verifica también
respaldo/restauración con el mecanismo existente, sin agregar otro sistema.
Obtén los IDs de los resultados tipados de comandos dentro de la transacción.

Cubre M06, M10, M17, M19–M22, M24–M34 y M41–M42 con SQLite real. Inyecta
fallos después de catálogo/movimiento y antes del resultado; prueba doble
ejecución y cierre antes/después del commit. Reabre la misma base aislada sin
reset; documenta la diferencia respecto al reset de desarrollo.

Ejecuta `dart analyze`, `flutter test`, `git diff --check`, limpieza y registro
de evidencia/continuidad. No habilitar la UI como terminada. La siguiente
sesión construye la vista por tarea sobre este core ya verificado.
