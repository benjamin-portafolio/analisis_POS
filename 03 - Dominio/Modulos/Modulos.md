---
tipo: indice_modulos
estado: activo
actualizado: 2026-08-19
---

# Modulos

Este apartado concentra las especificaciones funcionales y tecnicas de cada
modulo conforme se implementa. Cada nota debe distinguir entre comportamiento
confirmado en codigo, decisiones de diseno y trabajo pendiente.

## Modulos documentados

| Modulo | Estado | Especificacion |
|---|---|---|
| Categorias | Implementado con pendientes identificados | [[03 - Dominio/Modulos/Categorias|Categorias]] |
| Eliminacion de categorias | Especificada; primera y segunda entrega pendientes | [[03 - Dominio/Modulos/Eliminacion de categorias|Eliminacion de categorias]] |
| Articulos | Alta sencilla parcial; listado y filtros listos para implementar | [[03 - Dominio/Modulos/Articulos|Articulos]] |
| Unidades y cantidades | Contrato confirmado; pendiente de implementar | [[03 - Dominio/Modulos/Unidades y cantidades|Unidades y cantidades]] |

## Criterio de actualizacion

Una especificacion modular debe revisarse cuando cambie alguno de estos
elementos:

- Reglas de negocio o casos de uso.
- Modelo local o esquema de servidor.
- Comandos, eventos o payloads.
- Referencias usadas por preflight y conflictos.
- Comportamiento de `standalone` o `server_sync`.
- API, aplicacion de eventos o resolucion de conflictos.
- Criterios de aceptacion y pruebas automatizadas.

Las decisiones transversales siguen viviendo en [[02 - Decisiones/Registro de decisiones|Registro de decisiones]] y no deben duplicarse aqui.
