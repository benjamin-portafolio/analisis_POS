# Sesión 2: edición comercial acotada

Continúa desde la sesión 1. Lee AGENTS y guías offline de Flutter, más el
[[08 - Roadmap/Edicion masiva y recepcion de mercancia/Plan de implementacion|Plan]],
[[08 - Roadmap/Edicion masiva y recepcion de mercancia/Estado y continuidad|Estado]] y
[[08 - Roadmap/Edicion masiva y recepcion de mercancia/Matriz de aceptacion|Matriz]].
Relee Git y la evolución del CSV; no rehagas ni sobrescribas ese trabajo.

Agrega una intención comercial por producto procesada por
`ProductoCommandService`: producto, base confirmada y cambios explícitos de
variantes. Relee snapshot completo bajo transacción, valida actividad,
pertenencia y base, y superpone únicamente venta, costo y la pareja de
proveedor solicitada. Conserva todos los datos ajenos al cambio.

Un costo con proveedor actualiza estándar y pareja juntos; sin proveedor
solo estándar. Venta permanece independiente. Elegir proveedor para una fila
requiere costo informado y conserva los otros proveedores. Preserva fecha
si el precio de la pareja es idéntico; cambios/nuevas parejas usan la fecha
capturada. Prueba conocimiento legado y transiciones canónicas del contrato.

Reutiliza payloads, dependencias, referencias y aplicación actuales. Varias
variantes generan un único `producto_actualizado`; estado completo idéntico
no genera evento/ref/versión/respaldo. No construir comandos de alta ni crear
recursos o movimientos. Comparte helpers con CSV solo donde ya exista una
necesidad real, conservando los alcances distintos de ambos casos de uso.
Devuelve un resultado tipado con evento emitido u omisión para que la sesión 3
registre sus IDs dentro de la transacción, sin buscarlos después por «último».

Verifica con SQLite real M04–M05, M07–M09, M12–M16, M19–M20, M23–M25 y la
parte comercial de M41–M42. Comprueba refs declaradas/validadas en ambos
modos, persistidas solo en server_sync; standalone no inicia transporte.

Ejecuta `dart analyze`, `flutter test` y `git diff --check`, revisa limpieza y
registra evidencia/continuidad. No activar menú ni implementar protocolo o
servidor nuevos. La sesión 3 coordina entradas, diario y transacción conjunta.
