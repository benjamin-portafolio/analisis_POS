---
tipo: riesgos
estado: activo
actualizado: 2026-08-19
---

# Riesgos

| ID | Riesgo | Impacto | Probabilidad | Mitigacion |
|---|---|---:|---:|---|
| R-001 | Duplicar pagos al reconectar | Alto | Media | Idempotencia por `event_id` y `payment_id` |
| R-002 | Vender mas stock del disponible offline | Alto | Alta | Definir politica de stock offline |
| R-003 | Rechazos dificiles de explicar al usuario | Medio | Media | Mensajes claros y cola de conflictos |
| R-004 | Catalogo desactualizado en dispositivos offline | Medio | Media | Pull frecuente y versiones de catalogo |
| R-005 | Perdida de datos locales | Alto | Baja | SQLite con transacciones y respaldos |
| R-006 | Servidor local apagado | Alto | Media | Operacion offline y monitoreo simple |
| R-007 | Secuencias corruptas por bugs | Alto | Baja | Restricciones unicas y pruebas de sync |
| R-008 | SKU duplicado por altas offline | Medio | Media | Validar unicidad en servidor y resolver conflicto |
| R-009 | Permisos revocados mientras un dispositivo opera offline | Alto | Media | Validacion conservadora en servidor |
| R-010 | Cambios concurrentes de configuracion/impuestos | Alto | Baja | Versionado y revision manual |
| R-011 | Movimientos sobre caja cerrada desde otro dispositivo | Alto | Media | Estados de caja y conflictos bloqueantes |
| R-012 | Confundir respaldo de Drive con sincronizacion multi-dispositivo | Alto | Media | Documentar que Drive es backup/restore, no sync transaccional |
| R-013 | Perder datos en standalone por reset o restauracion destructiva | Alto | Media | Migraciones, confirmaciones, copias consistentes y pruebas de restauracion |
| R-014 | Condicionales de modo dispersos en la app | Medio | Media | Usar interfaces, DI y adaptadores por modo |
| R-015 | Migrar standalone a servidor con duplicados o identidad ambigua | Alto | Media | Flujo explicito de importacion, mapeo de usuarios y deduplicacion por eventos |
| R-016 | Reinterpretar cantidades historicas al cambiar factor o dimension de una unidad | Alto | Baja | Hacer inmutables codigo, dimension, factor y precision despues del primer uso; cualquier cambio de escala requiere migracion explicita |
| R-017 | Divergencia entre Flutter y NestJS al convertir o redondear cantidades | Alto | Media | Parser decimal exacto, vectores compartidos, aritmetica entera ampliada y `half-up` una sola vez por linea/recurso |
| R-018 | Permitir una unidad incompatible o una escala demasiado gruesa para una cantidad medida | Medio | Media | Filtrar por dimension, validar en servidor y advertir/rechazar cantidades que redondeen a cero |
