# Recorrido manual de la app completa — 2026-10-19

Ejecutado mediante interacción nativa CUA sobre Flutter macOS 800×600, con las
pantallas reales de Informes, editor compartido, Caja, transferencia y movimientos.
No es un widget test ni una prueba física de teléfono/tablet. Modo standalone;
server_sync y restore en ambos modos se verifican automatizadamente en R/H.
Las capturas/árboles AX se observaron en la conversación; las lecturas SQLite por
etapa se guardan aquí y son consultables/reproducibles sin esas capturas.

## Aislamiento y comando

`session5_manual_entry.dart` es una copia archivada del entrypoint temporal.
Solo sustituye path_provider por un directorio de prueba, deshabilita backup
Google Drive y siembra dos productos con comandos reales, sin mínimo y saldo seis.
Luego ejecuta `production.main()` con DI/pantallas normales; no sustituye ventas,
guardado, balance, editor ni navegación por callbacks de prueba. No ejecuta sync.
No hubo cobro bancario externo: se registra una venta ficticia en la SQLite aislada.

```sh
# Se copió temporalmente el entrypoint a test/support/ del proyecto Flutter.
flutter run -d macos -t test/support/session5_manual_entry.dart
# q termina el proceso; se ejecutó el mismo comando dos veces más para reabrir.
```

Logs: `manual-app.log`, `manual-app-reopen.log`, `manual-app-null-reopen.log`.
Directorio impreso por el proceso, exclusivo de esta prueba:
`/Users/benjamin/Library/Containers/com.example.posFlutter/Data/tmp/pos_s5_manual_isolated`.
Nunca se usa el directorio Documents/Support de la instalación operativa. El
capturador `capture_manual.py` usa exclusivamente ese SQLite con `mode=ro`.
`manual-final.sqlite` archiva el estado final real (integrity_check=ok).

## Pasos y resultados observados

| Paso | Interacción real y texto observado | Datos persistidos |
|---|---|---|
| 1 | Informes → Existencias restantes → pieza → scroll → Existencia mínima 5 → Guardar; repetir en kg. Ambas filas a seis sin distintivo, «Existencias bajas: 0» | [01](manual-01-minimos-cinco.json): 5 pza/5000 átomos kg; saldos 6/6000 |
| 2 | Caja → buscar piezas y añadir una; medido → Cantidad (kg) 1 → agregar → Cobrar → Transferencia → confirmar. Recibo local por $20, dos productos | [02](manual-02-venta-hasta-cinco.json): venta confirmada, dos líneas/un pago; saldos 5/5000 |
| 3 | Informes → tarjeta «Existencias bajas: 2» → ambas filas «Existencia baja», saldo igual a mínimo cinco | Mismos datos 02; los avisos son derivados, no eventos nuevos |
| 4 | Abrir pieza → Registrar movimiento → Agregar existencia 1 → registrar; cerrar editor. Saldo 6, contador baja a 1 y pieza sin aviso. Repetir con entrada 1 kg; contador 0 | [03](manual-03-repuestos-seis.json): 6/6000, mínimos 5/5000 conservados; seis movimientos totales |
| 5 | Existencias bajas muestra «No hay variantes con existencias bajas.»; Todas recupera las dos filas | Filtro sin escrituras |
| 6 | Desde informe cambiar pieza a 6; medido a «6,001» kg. Informe muestra «Mínimo: 6 pza», «Mínimo: 6.001 kg», dos distintivos y contador 2 | [04](manual-04-minimos-editados.json): 6/6001 exactos; saldos siguen 6/6000 |
| 7 | `q`, nuevo `flutter run`, Informes → existencias. Se ven ambos mínimos 6/6.001 y contador 2 después del nuevo proceso | Reapertura positiva real; log manual-app-reopen |
| 8 | Abrir pieza desde informe, scroll hasta campo, borrar 6 con BackSpace y guardar: Sin mínimo, contador 1 | [05](manual-05-piezas-retirado.json): pieza null conocido; medido 6001 |
| 9 | Abrir medido, precarga 6.001, borrar y guardar: ambas filas Sin mínimo, contador 0 | [06](manual-06-ambos-retirados.json): ambos mínimos null explícitos |
| 10 | `q`, nuevo `flutter run`, Informes → existencias. «6 kg / Sin mínimo», «6 pza / Sin mínimo», «Existencias bajas: 0» | [07](manual-07-reapertura-null.json), idéntico a 06 en eventos/tablas/variantes |

Las variantes se ejercitan en la misma venta para compartir el recorrido de cobro;
ambas pasan individualmente por configuración, igualdad, aviso, reposición,
edición, retirada y reapertura. La captura medida adicional acredita coma y tres
decimales en escritorio, con 6001 átomos exactos frente a saldo 6000.

[Comparación real](manual-invariants.json): etapas 04–07 conservan literalmente
todas las filas de inventory_balances, inventory_movements, sales, sale_items y
sale_payments frente a 03. Incluye los snapshots/claves de consumo persistidos
en las líneas. Cero event_refs y todos los eventos not_required; no existe evento
de alerta. Las ventas/movimientos solo cambian al vender/reponer solicitadamente.

## Incidencias de manejo y limpieza

La primera interacción con el textfield vía AX no lo enfocó; se desplazó el editor
y se usó el campo visible por coordenadas. Un atajo de selección no sustituyó el
5 y se guardó 56; se verificó y corrigió por BackSpace a 6. El evento intermedio
se conserva en los JSON, sin ocultarlo ni atribuirlo a un fallo de la función.
No hubo excepción, rechazo ni pérdida de datos de la app en este recorrido.

Se terminó el proceso, archivó la SQLite, retiró únicamente el directorio aislado
y eliminó el entrypoint temporal de Flutter; su copia permanece como evidencia.
`manual-cleanup.json` acredita la limpieza. Se reconstruyó el main normal mediante
`flutter build macos --debug` sin ejecutarlo ni abrir la instalación operativa.

## Paso físico pendiente (A42)

`devices.json` solo lista iPhone 17 con emulator=true, macOS y Chrome. No hay
hardware móvil conectado. Pendiente: en teléfono/tablet físico y base aislada,
verificar teclado decimal real, coma/precisión, legibilidad con texto grande,
scroll hasta mínimo/proveedores y navegación Artículos/editor/informe/Caja;
registrar modelo/SO y repetir venta/reposición/vacío/reapertura. El resultado
manual de macOS y los widgets 320/1024 no acreditan ese paso. No hay cierre total.
