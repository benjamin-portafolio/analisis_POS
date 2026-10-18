# Prompt de implementación: sesión 1, conversión y comandos

Implementa únicamente la sesión 1 del plan Venta a granel por importe,
revisión 1. Trabaja en `/Users/benjamin/Projects/POS/pos_flutter`.

Lee primero:

- `/Users/benjamin/Projects/POS/pos_flutter/AGENTS.md`.
- `/Users/benjamin/Projects/POS/pos_flutter/docs/architecture/offline_feature_flow.md`.
- `/Users/benjamin/Projects/POS/pos_flutter/docs/templates/new_offline_feature_checklist.md`.
- `/Users/benjamin/Projects/POS/pos_flutter/docs/architecture/cash_sale_confirmation.md`.
- `/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /AGENTS.md`.
- `/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /08 - Roadmap/Venta a granel por importe/Plan de implementacion.md`.

El directorio `analisis ` tiene un espacio final. Inspecciona rama, HEAD y
cambios pendientes; conserva todo cambio ajeno, incluidos lockfile y archivos
de impresión si siguen presentes. No crees otra tarea ni delegues.

La decisión funcional ya está definida: el importe escrito es un objetivo,
se redondea el peso hacia arriba al siguiente átomo representable y se cobra
el peso resultante. A $60/kg, $20 deben generar 334 g y $20.04. A $80/kg,
$20 generan 250 g y $20.00; una división exacta no agrega otro gramo.

Implementa:

1. Una calculadora pura compartida en `domain/ventas`, sin dependencias de
   Drift ni Flutter. Usa `Q = ceil(A*R/P)` y `C = halfUp(P*Q/R)` con BigInt
   en operaciones intermedias, A/P en centavos y R/Q en átomos. Valida
   positividad y límites seguros de entradas/resultados, incluyendo el
   excedente final por redondeo. Sin double ni fracciones de átomo.
2. Reutiliza el cálculo proporcional de esa calculadora en la rama medida
   de `SaleItemSnapshot.totalMinor`, manteniendo exactamente su contrato y
   resultado anteriores, incluido el total cero de ciertos pesos manuales.
   Conserva piezas, snapshots, formato JSON y half-up del total acumulado.
3. Extiende `AgregarProductoBorradorCommand` con importe objetivo opcional
   en centavos (`targetAmountMinor`) y condiciones esperadas de precio y
   referencia. Para medidos exige exactamente una fuente: texto de cantidad
   o importe. Por importe requiere unidad/precio/referencia esperados.
   Las condiciones nuevas de precio son opcionales para llamadores actuales
   por peso, pero deben estar completas si se proporciona alguna. Conserva
   el comportamiento de los llamadores existentes por piezas.
4. En `VentaBorradorCommandService.agregar`, relee y valida unidad, precio y
   referencia en la operación atómica existente. Rechaza condiciones
   obsoletas sin escrituras ni recálculo silencioso con un precio distinto.
   Convierte el importe a átomos y usa el evento y snapshot existentes; no
   persistas el importe objetivo ni añadas campos al payload.
5. Conserva agrupación `sameConditions`, acumulación de cantidades y un solo
   redondeo sobre el total de la línea. No sumes importes objetivo o totales
   parciales. Conserva handlers idempotentes, refs declaradas/validadas en
   ambos modos, persistidas solo en server_sync, y borradores not_required
   en ambos modos. Standalone sigue sin actividad remota.
6. Agrega pruebas de dominio y comandos reales con SQLite temporal para
   los ejemplos y casos de sesión 1 del plan: referencias distintas a 1 kg,
   volumen, ceil exacto/fraccionario, half-up, rangos, entradas incompatibles,
   precio/referencia/unidad obsoletos, cero escrituras ante rechazo,
   acumulación, replay idempotente y ambos modos. Conserva la regresión de
   cantidades manuales y de actualizar/eliminar.

Esta sesión no modifica UI, `SaleQuantityDialog`, coordinadores/callbacks de
lectores ni edición de líneas. Tampoco tablas, schemaVersion, payloads,
servidor, cotizaciones, impresión, dependencias o sincronización. Los campos
del comando y la API para futura UI son la base solicitada para sesión 2;
no agregues más estructura sin un uso definido en el plan.

Ejecuta `dart analyze` y `flutter test`. Revisa imports y código sin uso;
no ejecutes la app ni reinicies una base de uso. No hace falta build_runner
porque no se planifican cambios Drift. Si aparece un fallo ajeno, regístralo
con evidencia sin mezclar una corrección fuera de alcance ni afirmar que
pasó la suite completa.

Actualiza el plan con el resultado de sesión 1, archivos propios, comandos
realmente ejecutados y resultados, limitaciones y relevo concreto a sesión 2.
Explica que la captura por importe todavía no está habilitada en pantalla.
No implementes sesión 2, no hagas commit ni despliegues. Presenta cualquier
duda necesaria como lista numerada.
