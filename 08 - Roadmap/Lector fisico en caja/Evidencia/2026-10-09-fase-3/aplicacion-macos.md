# Registro de aplicación nativa macOS

Sesión iniciada el 2026-10-09 y continuada el 2026-10-10. Entrada enviada mediante
Computer Use (`typeText`, teclas Return/Tab/Cmd-H y controles de la app). Estas
acciones son **entrada simulada en aplicación nativa**, no lecturas de un escáner
real. Las observaciones proceden del árbol de accesibilidad y capturas de la
ventana en la conversación; este registro resume esos resultados. Los JSON de
SQLite son capturas completas, tomadas con conexión de solo lectura.

## Instalación y aislamiento

Copia de `flutter build macos --debug` con `lib/main.dart`, sin entrada de
prototipo ni cambios de Dart. Identidad `com.example.posFlutter.physicalReaderPhase3`,
firma ad hoc conservando el sandbox y los entitlements originales. Solo cambiaron
identidad/nombre y firma de la copia; el SHA-256 de `kernel_blob.bin` coincide con
el compilado original (ver `aislamiento-app.json`). Configuración y device ID de
fixtures exclusivos del contenedor. El `last_backup_at` de prueba se fijó al día
del ensayo para evitar un respaldo programado, sin autenticar una cuenta ni
iniciar servicios de servidor. La base real de la app habitual se conserva por
huella en `conservacion.json`.

Catálogo desechable: A=`001`/$1, B=`002`/$2, C y D=`003`/$3 y $4,
M=`004`/$200 por kg. La preparación del catálogo escribe fixtures de prueba;
las incorporaciones posteriores usan los comandos/eventos/handlers normales de
la aplicación principal. No se modificó el esquema ni el código del proyecto.

## Observaciones ejecutadas

| Paso | Acción y resultado observado | Captura SQLite |
| --- | --- | --- |
| 1 | Caja vacía, control off y sin campo. Activado: campo visible; después de traer foco/reanudar, «Listo para escanear». `001` + Return: A×1, $1; campo limpio y foco conservado. | `n01-una-lectura.json`: 1 evento |
| 2 | Otras dos lecturas `001` + Return sin clic entre lecturas: A×3, $3. | `n02-tres-iguales.json`: 3 eventos |
| 3 | `001` → `002` → `001`, sin esperas entre envíos: A×5/B×1, $7. Secuencias locales 4–6: A, B, A. No se retuvo artificialmente el primer comando nativo. | `n03-rapidas-aba.json`: 6 eventos |
| 4 | Return vacío dos veces, `001A` y 33 dígitos: aviso «El código debe tener hasta 32 dígitos», sin modificación. | `n04-vacio-invalidos.json`: siguen 6 eventos |
| 5 | `999`: «No se encontró un artículo con este código». `003`: selector C/D; Cancelar: «Selección cancelada», vuelve listo, sin escritura. | `n05-desconocido-selector-cancelado.json`: siguen 6 eventos |
| 6 | Se interrumpió Computer Use por bloqueo del Mac. El borrador permaneció en A×5/B×1; se cerró y reabrió solo la copia de prueba. El modo arrancó off y el total persistido siguió en $7. | Borrador previo conservado, luego `n06-selector-cantidad.json` |
| 7 | `003`, elegir C: solo C×1 y $10. `004`, cancelar: «Cantidad cancelada» y mismo total. Repetir `004`, confirmar `0.5`: M=0.500 kg, $100; total $110. | `n06-selector-cantidad.json`: 8 eventos; M=500 átomos |
| 8 | Con fragmento `00`, Tab borra y muestra pausa; el foco visual puede alcanzar el botón de editar, sin volver continuamente al campo. Para segundo plano se usa Cmd-H: fragmento limpio y pausa; Window → POS Fase 3 muestra otra vez la ventana, conserva pausa hasta «Reanudar lector». Después, `002` agrega exactamente una B (B×2). | `n07-tab-segundo-plano-busqueda.json`: 9 eventos |
| 9 | Buscar manualmente `Prueba B`, Return no crea lectura; «Ir a caja» retorna al lector y al mismo borrador. Se comprueba captura textual/navegación, sin atribuir precisión del filtro a este ensayo. | `n07-tab-segundo-plano-busqueda.json` |
| 10 | `001` y abrir edición de A: formulario muestra cantidad 6. Cerrar sin actualizar: lector listo, total $113. | `n08-navegacion-cobro.json`: 10 eventos |
| 11 | Cámara de Caja abre la pantalla con A×6/B×2/C×1/M=0.5, total $113. Se observa preview negro y no se presenta ninguna etiqueta. Cerrar muestra brevemente «Esperando la operación…» y vuelve a Caja. Tras recuperar foco de ventana se reanuda el lector. No se acredita decodificación física, formatos ni permisos interactivos. | `camara-native-diagnostico.log`: captura/inicialización y parada; `n08-navegacion-cobro.json` |
| 12 | Menú abre después de finalizar sesión, cerrar sin navegar restaura modo/listo. Artículos no muestra modo físico; volver a Caja muestra off y conserva $113. | `n08-navegacion-cobro.json` |
| 13 | Cobrar → Efectivo muestra gran total $113, recibido 113.00 y cambio $0. Cancelar ambas rutas: mismo borrador, ninguna venta confirmada. | `n08-navegacion-cobro.json` |
| 14 | Activar, `002` y Cotizar: ticket A×6/B×3/C×1/M=0.5, total estimado $115. No se comparte ni imprime. | `n09-cotizacion.json`: 12 eventos; una cotización de 4 líneas |
| 15 | «Nueva captura» desde ticket: Caja vacía, lector listo, cotización conservada. | `n10-nueva-captura.json`: 13 eventos; sales/items vacíos |
| 16 | `002`: nueva venta B×1/$2; desactivar conserva esa unidad y oculta campo. | `n11-desactivar-nueva-venta.json`: 14 eventos; venta distinta |
| 17 | Reactivar, `001` y Limpiar venta: queda vacía, modo restaurado. | `n12-limpiar.json`: 16 eventos; sales/items vacíos |
| 18 | `001` en captura posterior: tercera venta, A×1/$1, ninguna línea antigua. | `n13-venta-posterior.json`: 17 eventos; tercera identidad |
| 19 | Ensayos de `paste` Unicode/ASCII: árbol muestra texto y Return lo limpia, sin evento adicional confirmado; `typeText` ASCII sí añade después. Se solicita comparación manual para distinguir herramienta, foco y envío real. Estos ensayos no cuentan como éxito de pegado/NFKC nativo. | `n14-nfkc-pegado.json`, `n15-pegado-ascii.json` (17 eventos); `n16-contraste-escritura-ascii.json` (18 eventos/A×2 tras escritura); pendiente de contraste manual |

Las capturas n01–n13 contienen solo eventos `not_required`, cero filas en
`event_refs` y tres identidades distintas de borrador a través de limpieza/nueva
captura. El orden se comprueba con `events.local_sequence`, sin usar el orden
implícito de las filas. Se conservaron todas las operaciones ya guardadas al
desactivar y navegar.

## Límites del ensayo nativo

Los tests de widgets/controlador retienen consultas y comandos de forma
controlada, prueban cola durante guardado, error antes/después de commit,
drenaje, reanudación y descarte. La app nativa se ejercitó con latencias normales;
no se comprobó nativamente el drenaje/descarte con una consulta o comando retenido,
ni la acumulación durante esa retención. No se equiparan ambos tipos de prueba.
No hubo lector real ni equipo Windows, según confirmación del usuario.
