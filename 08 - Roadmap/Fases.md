---
tipo: roadmap
estado: borrador
actualizado: 2026-10-02
---

# Fases

## Fase 1: Core local y modo standalone

- Configurar `POS_MODE`.
- Crear eventos localmente.
- Aplicar eventos a proyecciones.
- Operar sin servidor.
- Definir identidad local minima.
- Crear respaldo/restauracion basico.
- Evitar borrado accidental de SQLite.

## Fase 2: Prueba de sincronizacion `server_sync`

- Crear eventos localmente.
- Subir eventos al servidor.
- Asignar `server_sequence`.
- Descargar eventos desde otro dispositivo.
- Aplicar eventos sin duplicados.
- Prevalidar pendientes por referencias.

## Fase 3: POS basico

- Catalogo.
- Catalogo de unidades y conversion exacta segun ADR-0012.
- Costo estandar opcional por variante y snapshot de venta segun ADR-0013.
- Altas y cambios basicos de catalogo offline.
- Ventas.
- Venta medida/a granel con cantidad de referencia.
- Items.
- Pagos.
- Cancelaciones.
- Totales.

## Fase 4: Comandas

- Envio a cocina/barra.
- Estados por item.
- Modificaciones y cancelaciones.

## Fase 5: Inventario

- Movimientos.
- Stock proyectado.
- Ajustes manuales.
- Captura de cantidades de inventario persistidas en atomos.
- Politica de stock offline.
- Recuperación de recursos y descarte vacío standalone según
  [[08 - Roadmap/Seguimiento de existencias/Plan de implementacion|plan específico en cinco fases]].
  La implementación queda pendiente y se sigue desde
  [[08 - Roadmap/Seguimiento de existencias/Estado y continuidad|Estado y continuidad]].

## Fase 6: Operacion real

- Cortes de caja.
- Movimientos de caja offline y reconciliacion.
- Reportes.
- Permisos.
- Cambios de usuarios, roles y configuracion offline con validacion posterior.
- Respaldos.
- Monitoreo.
- Migracion/importacion de standalone a server_sync.
