---
tipo: sesion_implementacion
estado: verificacion_automatizada_completa_verificacion_fisica_pendiente
fase: 4
actualizado: 2026-10-09
---

# Fase 4: verificación y cierre

Leer el [[08 - Roadmap/Impresion de tickets/Plan de implementacion|plan vigente]]
y el [[08 - Roadmap/Impresion de tickets/Estado y continuidad|estado]].
Auditar lo implementado, sin agregar transporte/negocio fuera de alcance.

## Verificación automatizada y compilación

1. Recorrer I01–I25 e identificar tipo de evidencia y resultado de cada caso.
   Completar pruebas necesarias para riesgos no cubiertos, sin duplicar suites
   ya aprobadas salvo cambios/fallos nuevos.
2. Verificar selección A58/B80/A58, cierre del socket anterior y ausencia de
   escritura simultánea, incluidos timeouts cuyo trabajo nativo sigue activo.
3. Revisar paquete/versiones, manifest combinado, plataformas no habilitadas,
   DI/restauración, documento reubicado y limpieza de dependencias descartadas.
4. Ejecutar `dart analyze`, `flutter test` y `flutter build apk --debug`.
   Comprobar compilación de desarrollo macOS si quedó afectada por el plugin;
   reportar separadamente fallos preexistentes y limitaciones de herramientas.

## Prueba física inicial de 58 mm

Con Android y la impresora del usuario disponibles:

1. Registrar modelo real, versión Android, nombre/dirección, transporte, papel,
   ancho imprimible, método ESC/POS y dependencia/versiones elegidas.
2. Vincular desde ajustes Android; configurar el equipo en el POS. Comprobar
   permisos concedidos/denegados y Bluetooth apagado sin bloqueo de la app.
3. Imprimir prueba, recibos de los métodos de pago existentes y cotizaciones,
   incluidos texto largo, caracteres españoles, unidades medidas y valores
   no disponibles. Revisar márgenes, tamaño, totales y pie completo.
4. Enviar varios tickets consecutivos y un documento de 100 líneas variadas.
   Anotar duración y memoria/estabilidad observada; calibrar ancho/bandas si falla.
5. Interrumpir un envío y revisar aviso/reimpresión manual. Probar segundo
   plano, cierre y reinicio: nunca reenviar automáticamente.
6. Probar sin internet con Bluetooth activo, en ambos modos. Abrir, reimprimir
   y volver a Caja sin modificar venta/cotización ni arrancar sync standalone.
7. Si se dispone de otra impresora, comprobar A → B → A con perfiles distintos.
   Si no, registrar la compatibilidad física de B/80 mm como pendiente.

El autotest debe seguir el manual del equipo; no suponer una secuencia de
encendido universal. No afirmar detección de falta de papel si solo se dispone
del resultado de escritura Bluetooth.

## Criterio de salida y evidencia

Registrar por separado cierre funcional/automatizado y validación física.
Conservar resultados, renders/fotos disponibles y documentos de prueba en
`08 - Roadmap/Impresion de tickets/Evidencia/`, creando esa carpeta al producirlos.
No crear evidencia vacía ni marcar casos físicos aprobados con fakes.

Sin Android/impresora conectados, cerrar únicamente lo efectivamente comprobado
y dejar lista exacta de pendientes físicos. Con prueba real satisfactoria,
registrar compatible el modelo de 58 mm y sus parámetros; no extender esa
afirmación a todas las impresoras ESC/POS o a 80 mm sin evidencia.

Actualizar continuidad con archivos finales, comandos/resultados, matriz,
modelos comprobados, decisiones de ajuste y pendientes restantes.

## Resultado de ejecución del 2026-10-09

**Verificación automatizada completa; verificación física pendiente.**
1681 pruebas Flutter, 13 JVM, analyze sin problemas y APK/macOS debug actuales
compilados; diez integraciones de servidor preexistentes omitidas por entorno.
Dos defectos corregidos: prueba ASCII fuera del renderer/perfil y deadline
nativo de permisos que terminaba el future mientras seguía pendiente el diálogo.

Ver [[08 - Roadmap/Impresion de tickets/Estado y continuidad|Continuidad actual]],
[[08 - Roadmap/Impresion de tickets/Evidencia/sesion-4-2026-10-09/matriz-I01-I25|Matriz I01–I25]]
y [[08 - Roadmap/Impresion de tickets/Evidencia/sesion-4-2026-10-09/README|Evidencia de esta sesión]].
No hubo Android conectado ni impresión en papel; ningún modelo se certifica.
