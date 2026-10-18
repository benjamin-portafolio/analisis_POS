# Prompt para implementar lectura automática en Caja

Copia el siguiente texto en la sesión que realizará la implementación.

```text
Implementa este cambio en Caja: dejar el lector físico preparado automáticamente en Windows y Android, sin exigir activar un selector antes de escanear.

Proyecto:
/Users/benjamin/Projects/POS/pos_flutter

Plan y antecedentes:
/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /08 - Roadmap/Lector fisico en caja/Plan de implementacion.md

Decisión actual del usuario

El usuario quiere entrar en Caja y escanear directamente. Sin lector conectado o sin una lectura completa, la app debe seguir funcionando y no agregar productos. En Android también debe poder usar la pantalla táctil y escribir manualmente sin desconectar el lector.

Esta decisión reemplaza, para Windows y Android, la activación manual y la exclusión de Android del plan anterior. Las pausas, la cola y las protecciones del borrador siguen vigentes. Conserva el soporte actual de macOS.

Antes de modificar código:
1. Lee los AGENTS.md vigentes y el plan completo, incluyendo los resultados de las tres fases.
2. Lee:
   /Users/benjamin/Projects/POS/pos_flutter/docs/architecture/offline_feature_flow.md
   /Users/benjamin/Projects/POS/pos_flutter/docs/templates/new_offline_feature_checklist.md
3. Revisa git status y conserva los cambios previos.
4. Inspecciona PhysicalBarcodeReader, PhysicalBarcodeReaderController, SaleBarcodeReadCoordinator, CajaScreen, HomeScreen, MenuLateral y sus pruebas.

Base actual que debes revalidar

- Caja muestra el lector solo en macOS y Windows.
- PhysicalBarcodeReader comienza sin sesión; un Switch llama enableReader.
- La captura usa un TextField y onSubmitted como única frontera de lectura.
- HomeScreen protege el regreso con PopScope solo en las plataformas de escritorio existentes.
- Las pruebas actuales esperan activación manual y que Android no muestre el lector.

Trabajo requerido

1. Activación automática y disponibilidad en Android.

   - Preparar la sesión y el campo de lectura al entrar en Caja en Windows y Android, sin pulsar un selector.
   - Quitar la necesidad de habilitación manual en esas plataformas. Mantener un estado visible y la posibilidad de reanudar cuando esté pausado.
   - Al salir de un módulo y regresar a Caja, preparar una sesión nueva automáticamente.
   - Crear otra instancia del controlador después de finalizar una sesión; no reutilizar un controlador terminado.
   - Evitar activar o enfocar el lector cuando Caja esté cubierta por otra ruta, la app esté inactiva o se esté finalizando la navegación.
   - Sin lector conectado, no iniciar cámara, búsqueda de dispositivos, sondeos, conexiones ni permisos. El campo solo espera entrada.

2. Teclado en pantalla y escritura manual en Android.

   - Enfocar el campo de escaneo sin abrir automáticamente el teclado en pantalla.
   - Limitar esa supresión al campo del lector: búsqueda, cantidad medida, edición y efectivo deben conservar su teclado normal.
   - Mantener la posibilidad de introducir o pegar un código manualmente. Si se necesita mostrar el teclado para ese campo, ofrecer una acción explícita y simple.
   - No intentar cambiar ajustes globales de Android ni añadir permisos para un lector que el sistema ya reconoce como teclado HID.
   - Verificar la solución con la implementación y documentación de Flutter usada por el proyecto. No convertir el campo en readOnly de forma que también impida la lectura física.

3. Captura y foco.

   - Conservar código completo + Enter como una sola intención.
   - Copiar y limpiar inmediatamente la entrada; evitar dobles envíos por varios listeners o Enter repetido.
   - Reutilizar CodigoBarras y la cola FIFO existente: conservar ceros, rechazar íntegramente entradas inválidas y aceptar lecturas repetidas.
   - Durante consulta/guardado sin diálogo, seguir admitiendo lecturas completas.
   - No deducir la presencia del lector por la velocidad de escritura ni capturar teclas globalmente en otros formularios.
   - Respetar el foco de botones y la interacción táctil; no recuperarlo continuamente.
   - Conservar las pausas por pérdida de ventana/segundo plano, limpiar fragmentos y mantener la reanudación explícita tras esas interrupciones.

4. Navegación y protección de la venta.

   - Conservar las barreras existentes antes de búsqueda, cámara, edición, cobro, cotización, limpieza, menú y cambio de módulo.
   - Extender a Android la protección del botón/gesto Atrás y de cualquier salida que actualmente esté condicionada a escritorio.
   - Resolver o descartar explícitamente lecturas pendientes antes de cambiar borrador o calcular el cobro.
   - Al regresar de rutas propias, restaurar la lectura cuando corresponda, conservando las interrupciones que exijan reanudación.
   - Evitar sesiones huérfanas, comandos tardíos, esperas sin salida y agregados sobre otra venta.
   - Seguir observando el mismo borrador persistido; no mantener otro carrito ni sumar cantidades optimistamente.

5. Pruebas y verificación.

   Actualiza las expectativas anteriores de activación manual/exclusión de Android y conserva la cobertura funcional existente.

   Agrega pruebas significativas para:
   - Windows y Android listos automáticamente, sin interacción con un selector y sin lector conectado.
   - Ausencia de escrituras sin código completo.
   - Escaneos seguidos/repetidos por Enter y cantidades persistidas correctas.
   - Campo de escaneo sin solicitud automática del teclado virtual en Android, con lectura física todavía operativa.
   - Escritura manual en búsqueda y cantidad/efectivo con teclado normal.
   - Cambio de módulo y regreso con una sesión nueva lista.
   - Menú, botón/gesto Atrás de Android, cola pendiente, pausas y reanudación.
   - Conservación de las reglas en standalone y server_sync y regresión de macOS/cámara/Artículos.

   Usa SQLite temporal o en memoria. Ejecuta dart analyze, flutter test y flutter build apk --debug. Corrige fallos causados por este cambio; identifica los ajenos sin ampliar el alcance.

   Si no hay Android ni lector real disponibles, registra esos casos como pendientes. Los tests simulados y la compilación no acreditan comportamiento físico del teclado/lector.

Restricciones

- Implementa solo este ajuste del lector de Caja.
- Mantén una clase principal por archivo y elimina código/imports que queden sin uso.
- Reutiliza tablas, eventos, payloads tipados, handlers y command services existentes.
- Conserva not_required del borrador en ambos modos y event_refs persistidas solo en server_sync.
- No agregues servidor, sincronización remota, preferencias persistidas, esquema, dependencias ni SDK de hardware.
- Android recibe el lector HID como teclado: ambas entradas van al campo enfocado. No prometas que la pausa bloquea físicamente las teclas en cualquier formulario.
- Presenta dudas o solicitudes de información como lista numerada.

Entrega

Actualiza el plan con esta decisión, el comportamiento final, la evidencia y los pendientes, conservando la historia de fases anteriores. Resume archivos modificados, pruebas realizadas y limitaciones verificadas.

Criterio de aceptación: entrar en Caja en Windows o Android permite escanear sin habilitar un selector; no recibir lecturas no produce cambios; el teclado en pantalla no aparece por la preparación del lector y la escritura manual sigue disponible. Las pausas y barreras impiden aplicar lecturas pendientes a otra venta.
```
