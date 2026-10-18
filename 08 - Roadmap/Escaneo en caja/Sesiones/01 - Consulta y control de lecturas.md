# Sesión 1: consulta y control de lecturas

## Solicitud para una nueva sesión

```text
Implementa la fase 1 del plan de escaneo de códigos de barras en Caja.

Vault:
/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /
Flutter:
/Users/benjamin/Projects/POS/pos_flutter

Lee los AGENTS vigentes, docs/architecture/offline_feature_flow.md y
docs/templates/new_offline_feature_checklist.md en Flutter; en el vault lee:
- 08 - Roadmap/Escaneo en caja/Plan de implementacion.md
- 08 - Roadmap/Escaneo en caja/Estado y continuidad.md

Implementa consulta local exacta por barcode, normalización con CodigoBarras,
retorno de todos los candidatos de productos/variantes activos y sus datos
para seleccionar/agregar. Actualiza fakes afectados por la interfaz.
Usa ProductoRepository → implementación → ProductoDao. No busques cargando todo
el catálogo ni agregues unicidad de barcode, tablas o cambios de servidor.

Implementa y prueba la compuerta de lecturas en un lector mínimo utilizando la
cámara y el manejo de permisos/ciclo de vida de BarcodeScannerScreen del editor
de variantes como referencia. El usuario confirmó: mantener la etiqueta delante
no suma; retirar y volver a presentarla permite sumar otra unidad. noDuplicates
no basta y el plugin actual no emite capturas vacías de Android/Darwin a Dart.
Sigue la estrategia y límites de la sección técnica del plan; actualiza
presencia aun durante un guardado y no interpretes diálogos o segundo plano
como retirada. No cambies el lector de una lectura del editor de variantes.

Prueba consulta con SQLite temporal y compuerta con reloj controlado. Registra
los casos físicos para la verificación final: código inmóvil 20 segundos,
variaciones de enfoque, tres presentaciones con retirada y A → B → A. El usuario
eliminó la prueba física como requisito previo a sesión 2; no detengas el avance
por no disponer de dispositivo ni exijas una adaptación nativa especulativa.
No edites .pub-cache ni cambies la decisión de retirar y volver a presentar.

Ejecuta dart analyze y flutter test conforme a AGENTS; no modifiques bases
de uso. Registra archivos, comandos, resultados y pendientes en Estado y
continuidad. Si falta dispositivo, registra los casos físicos pendientes para
la sesión 3 y cierra el alcance implementado con su evidencia automatizada.
No avances automáticamente a fase 2 ni despliegues.
```

## Criterio de salida

Consulta exacta verificada para cero/uno/varios resultados, inactivos y ceros
iniciales. Compuerta sin doble incorporación en ráfagas y sin rearmado por
diálogo o segundo plano en las pruebas automatizadas; estrategia y umbrales
documentados. La retirada/reaparición física se verifica en sesión 3 y no
condiciona la ejecución de sesión 2.

Las pruebas no deben depender de callbacks vacíos que el plugin real no emite.
Si una verificación posterior demuestra que hace falta una adaptación nativa,
registrar versión, archivos y evidencia; no exigirla para iniciar la integración.
