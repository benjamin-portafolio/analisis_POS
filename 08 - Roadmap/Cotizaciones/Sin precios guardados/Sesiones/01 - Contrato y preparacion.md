---
tipo: sesion_implementacion
estado: completada
revision_plan: 3
actualizado: 2026-10-06
---

# Sesión 1: contrato y preparación

## Entrada

Leer AGENTS del análisis y Flutter, las dos guías offline de Flutter, y Plan,
Mapeo y limpieza, Casos de aceptación y Estado y continuidad de esta revisión.
Usar el árbol de trabajo actual de Flutter, conservando cambios previos.

## Trabajo

1. Registrar HEAD/status y revalidar todas las columnas, contratos y usos del
   mapeo. Aplicar la decisión ya confirmada: mostrar precios y total vigentes,
   calculados al consultar o compartir, sin guardarlos en quotation.
2. Crear `Contrato y fixtures.md` en esta carpeta de plan con listas finales de
   campos y JSON canónico de guardado/recuperación formato 2. Especificar refs con
   tipos soportados por el store y metadatos de versión/IDs de la venta.
3. Crear fixtures en `Fixtures/`: selección de dos piezas y 500 g; catálogo
   inicial, catálogo con precio/costo/referencia modificados; expected de
   recuperación; payload viejo incompatible; mapas de IDs de N eventos de
   borrador y un vínculo. No copiar precios dentro del fixture de selección.
4. Confirmar la transacción externa compartida de `appendAndApply`, quotation y
   sale_draft. Diseñar reintento, rechazo de otro borrador y rollback final con
   handlers existentes. Ningún paso depende de un precio histórico de quotation.
5. Preparar la matriz de pruebas existentes a modificar (contratos, core, DI,
   backup, pantallas y navegación). Si se ejecutan pruebas de baseline, usar
   harnesses/bases temporales y registrar fallos previos; no darles tratamiento
   de regresión propia. No ejecutar pruebas destructivas contra una base de uso.
6. Documentar compatibilidad: schemaVersion 8, columnas retiradas prohibidas,
   reset completo de base antigua y rechazo del respaldo protegido incompatible.
   No implementar aún un migrador ni nuevos campos monetarios temporales.

## Criterio de salida

Contrato/fixtures listos para consumo, inventario revisado y P01–P28 asociados
a pruebas. No cambia el esquema en esta sesión. Continuidad indica exactamente
qué necesita la sesión 2 y la preferencia de presentación aplicada.

## Resultado — 2026-10-06

Criterios de salida cumplidos: inventario revalidado contra el árbol de Flutter;
[[08 - Roadmap/Cotizaciones/Sin precios guardados/Contrato y fixtures|Contrato final]]
y 11 fixtures JSON preparados/verificados; transacción, IDs, retry, replay,
rollback y política de esquema/respaldo fijados. P01–P28 asociados en
[[08 - Roadmap/Cotizaciones/Sin precios guardados/Matriz de pruebas|Matriz de pruebas]].
Baseline seleccionado: 121 pruebas anteriores aprobadas en memoria/archivos
temporales. Esquema versión 8 y archivos Flutter intactos. No se ejecutó fase 2
ni se reinició una base de uso. Relevo y evidencia en
[[08 - Roadmap/Cotizaciones/Sin precios guardados/Estado y continuidad|Continuidad]].

## Prompt de ejecución

```text
Ejecuta la sesión 1 de Cotizaciones/Sin precios guardados, revisión 3.
Lee sus documentos y AGENTS; revalida el árbol de trabajo real de Flutter y
conserva la implementación previa. Crea Contrato y fixtures.md y los fixtures
de selección sin importes, recuperación con precios actuales, IDs y formato
legado incompatible. Fija la transacción y el relevo a sesión 2. Registra
baseline y preferencia de presentación en Estado y continuidad. No cambies
todavía el esquema ni arranques contra bases de uso.
```
