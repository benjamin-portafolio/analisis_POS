---
tipo: guia
estado: activo
actualizado: 2026-06-09
---

# Como usar este analisis

Este vault esta pensado como fuente de verdad viva. No busca tener todo perfecto desde el primer dia: busca dejar claro que se decidio, que falta resolver y que cambio con el tiempo.

## Reglas de uso

- Cada decision relevante debe quedar en [[02 - Decisiones/Registro de decisiones|Registro de decisiones]].
- Si una decision cambia, no borres la decision anterior sin dejar rastro; actualiza su estado y crea una nueva nota si el cambio es importante.
- Cada pendiente debe tener responsable, impacto y siguiente accion.
- Los diagramas deben vivir cerca del tema que explican.
- Las reglas de negocio deben escribirse en lenguaje claro antes de llevarlas a codigo.

## Estados sugeridos

| Estado | Uso |
|---|---|
| propuesto | Idea aun no aceptada |
| decidido | Acordado para desarrollo |
| pendiente | Falta informacion o validacion |
| en_revision | Requiere ajuste antes de implementar |
| descartado | Se decidio no hacerlo |
| implementado | Ya existe en codigo |

## Flujo para nuevas ideas

1. Registrar la idea en [[01 - Contexto/Preguntas abiertas|Preguntas abiertas]] o [[07 - Riesgos y pendientes/Pendientes|Pendientes]].
2. Convertirla en decision si afecta arquitectura, datos o reglas de negocio.
3. Crear una ADR usando [[Plantillas/Plantilla ADR|Plantilla ADR]].
4. Enlazar la ADR desde el tema relacionado.

