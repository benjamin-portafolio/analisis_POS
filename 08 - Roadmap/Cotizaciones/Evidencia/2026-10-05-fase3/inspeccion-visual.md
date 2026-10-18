# Inspección visual de fase 3 — 2026-10-05

Los cinco PNG completos se abrieron e inspeccionaron con `view_image`. El fixture de exportación carga Arial como familia Roboto en el motor de pruebas; evita el tipo Ahem del entorno de widgets. No cambia las fuentes de la aplicación.

| PNG | Dimensiones | Resultado observado |
|---|---|---|
| [cotizacion-muchas-lineas.png](png/cotizacion-muchas-lineas.png) | 880 × 4046 | 18 líneas completas; seis grupos de piezas/kg/L, total $1470.00, leyenda y margen inferior completos; filas se adaptan a nombres largos, sin solapamiento ni truncamiento. |
| [cotizacion-quotation-1.png](png/cotizacion-quotation-1.png) | 880 × 1246 | Tres líneas: 2 piezas, 0.750 kg y 0.250 L. Nombre largo y variante completos, total $245.00 MXN, COTIZACIÓN, ID/fecha y leyenda. Sin método, recibido, cambio, deuda ni costo. |
| [recibo-cash.png](png/recibo-cash.png) | 880 × 4466 | 18 líneas, 12 pzas · 4.500 kg · 1.500 L; total $1470.00, recibido $1570.00, cambio $100.00. |
| [recibo-credit.png](png/recibo-credit.png) | 880 × 4436 | 18 líneas, nombre de cliente largo completo y cargo a la cuenta $1470.00, sin efectivo/cambio. |
| [recibo-transfer.png](png/recibo-transfer.png) | 880 × 4436 | 18 líneas y cantidades separadas; referencia SPEI-2026, transferencia recibida $1470.00, sin efectivo/cambio. |

Los números guardados en cada fila se conservan; no se suman piezas con kg/L. Los textos de nombre y unidad pueden ocupar varias líneas y la altura de cada fila toma la mayor altura de sus celdas. Compartir recibe el PNG completo, no una captura de la vista desplazable.

SHA-256 de los originales:

```text
6ab938e7dd071c24520954a55a00b306f7c6e216d5743803e77cf6b8b3db0700  cotizacion-muchas-lineas.png
0da01b5dc10e4198ac2748d0f94e7b063860a6c60a7fe49e40d9898a36db7b64  cotizacion-quotation-1.png
7cbe5b1437af03b222b26368be273907c868c3f0e40b122d2a8e36a98bfc663a  recibo-cash.png
3cdff4f8e548d22712562814edaf50c06a4d2f48e989580a4195f1b411d9e006  recibo-credit.png
50c6589f591935cd008f2b866fa0d8007304af6392cb4afc5216a83a481e4bb1  recibo-transfer.png
```

Pendiente: selector nativo y WhatsApp en una tablet/dispositivo disponible. La inspección PNG y los fakes del selector no prueban entrega a un destinatario. Impresión física queda fuera de alcance.
