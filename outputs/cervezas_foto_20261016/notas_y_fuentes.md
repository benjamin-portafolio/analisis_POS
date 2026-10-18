# Productos de la fotografía del refrigerador

Fecha de preparación: 16 de octubre de 2026. El CSV contiene 13 presentaciones agrupadas en 7 artículos, con las 10 columnas que exige el importador actual del POS Flutter. Importar solamente el archivo CSV.

## Alcance de los datos

- Todos los precios están en MXN por pieza y proceden de etiquetas de la fotografía. Las asociaciones dudosas se detallan abajo. No se sustituyeron por precios de tiendas en línea.
- Todas las capacidades son estimaciones autorizadas, basadas en el tamaño relativo y presentaciones comerciales. Al ser bebidas se expresan en ml. Confirmar especialmente Dos Equis lata de 355 ml y Carta Blanca lata de 355 ml.
- Los códigos se consultaron para las presentaciones elegidas. No se pudieron leer directamente del envase en la foto. Tienen longitud y dígito de control válidos, pero una capacidad o envase diferente puede llevar otro código.
- Las latas Tecate rojas de ambos entrepaños se consideraron una sola presentación de 710 ml por su apariencia. No se creó una segunda presentación sin evidencia suficiente.
- Categoría y precio de coste quedan vacíos porque no se conoce la categoría existente del dispositivo ni el coste de compra. El importador no crea categorías automáticamente.
- No se dedujeron existencias de las unidades visibles. seguimiento_existencias es no y existencias queda vacío. Los saldos se pueden registrar después de un conteo.
- La venta es por unidad. Las capacidades se guardan como parte de nombre_variante; unidad_venta queda vacía, como exige el contrato del POS para venta por pieza.

## Presentaciones y observaciones

| Artículo | Presentación estimada | Precio MXN | Código consultado | Lectura y observación | Fuente del código |
|---|---|---:|---|---|---|
| Sol Mezclas Mangoyada | Lata 473 ml | 27.00 | 7503032272375 | Etiqueta de $27 bajo las latas sabor mango. | [Consultar](https://www.basicos.mx/cerveza-sol-mangoyada-lata-473-mll) |
| Sol Mezclas Clamato | Lata 473 ml | 25.00 | 7501049967062 | Etiqueta de $25 bajo las latas de Clamato. | [Consultar](https://www.7pass.mx/uploads/711_tyc_empieza2025.pdf) |
| Dos Equis Lager | Lata 473 ml | 27.00 | 7501049912284 | Lata del entrepaño superior; etiqueta de $27. | [Consultar](https://www.lagranbodega.com.mx/cerveza-xx-lager-473-ml/p) |
| Dos Equis Lager | Lata 355 ml | 26.00 | 75003821 | Lata del segundo entrepaño; etiqueta de $26. Capacidad especialmente pendiente de confirmar. | [Consultar](https://canmuseum.com/Detail.aspx?CanID=149172) |
| Dos Equis Lager | Botella retornable 190 ml | 9.00 | 75005283 | Se tomó $9 de la etiqueta que dice XX 1/4. Hay otra etiqueta genérica de $8 cerca; confirmar el precio. | [Consultar](https://www.7pass.mx/uploads/711_tyc_empieza2025.pdf) |
| Dos Equis Lager | Botella retornable 1200 ml | 48.00 | 7501049912215 | Precio $48 asignado por las etiquetas con silueta dorada en el borde sobre el entrepaño inferior; confirmar correspondencia. | [Consultar](https://chedrauimx.vteximg.com.br/arquivos/productos-participantes-bonificacion-michedraui-cupon-vinos-licores-marzo-2023.pdf) |
| Tecate Original | Lata 710 ml | 36.00 | 7501061671244 | Etiqueta de $36 del entrepaño superior. Las latas rojas del segundo entrepaño se consideraron repetidas de esta presentación. | [Consultar](https://www.7pass.mx/uploads/711-tyc-tecate_eagle.pdf) |
| Tecate Original | Botella retornable 1200 ml | 44.00 | 7501061668930 | Etiqueta de $44 debajo de las botellas Tecate. Hay etiquetas cercanas de $48; confirmar que $44 corresponde a Tecate. | [Consultar](https://www.7pass.mx/uploads/TyCBuyWin_TecatePalcosVIP2026.pdf) |
| Indio | Botella retornable 190 ml | 8.00 | 75015541 | Etiqueta digital de $8 bajo las botellas pequeñas de Indio. | [Consultar](https://www.7pass.mx/uploads/711_tyc_empieza2025.pdf) |
| Indio | Botella retornable 1200 ml | 44.00 | 75019303 | Precio $44 asignado por la etiqueta con silueta verde sobre las botellas grandes Indio; confirmar correspondencia. | [Consultar](https://www.7pass.mx/uploads/TyCBuyWin_TecatePalcosVIP2026.pdf) |
| Heineken 0.0 | Lata 355 ml | 21.00 | 7503024416510 | Etiqueta digital de $21 a la derecha del segundo entrepaño. | [Consultar](https://chedrauimx.vteximg.com.br/arquivos/productos-participantes-bonificacion-michedraui-cupon-vinos-licores-marzo-2023.pdf) |
| Carta Blanca | Lata 473 ml | 22.00 | 7503028412587 | Etiqueta digital de $22 bajo las latas blancas altas. | [Consultar](https://chedrauimx.vteximg.com.br/arquivos/productos-participantes-bonificacion-michedraui-cupon-vinos-licores-marzo-2023.pdf) |
| Carta Blanca | Lata 355 ml | 24.00 | 7501061651543 | Etiqueta de $24 bajo la lata más baja con franja dorada. Capacidad especialmente pendiente de confirmar. | [Consultar](https://www.7pass.mx/uploads/711_tyc_empieza2025.pdf) |

## Comprobaciones

Se comprobó encabezado, delimitador coma, BOM UTF-8, 13 filas de datos, precios positivos, códigos sin duplicados y dígitos de control. La validación del archivo se realiza sin cargar productos ni modificar la base de datos. La importación real también depende de que esos nombres de artículos no existan ya en el catálogo del dispositivo.
