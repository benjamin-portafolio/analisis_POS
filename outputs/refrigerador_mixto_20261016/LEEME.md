# Productos de la fotografía del refrigerador

12 presentaciones para revisar e importar. Moneda: MXN por pieza. Fecha de consulta: 16 de octubre de 2026.

## Archivos

- productos_carga_masiva.csv: usa exclusivamente las diez columnas aceptadas por el POS.
- productos_referencias.csv: documenta observaciones, precios, códigos y fuentes. No cargar este archivo como catálogo.

## Precios

Los precios son referencias públicas por pieza de Chedraui y Garis. Jarritos uva utiliza $26, el precio sugerido impreso que se alcanza a leer en la fotografía. Su precio de catálogo consultado es $25 y queda documentado por separado. No se conoce el precio de venta real del negocio. Ajustar precio_venta según corresponda. Para Corona Mega, confirmar si el proveedor cobra depósito por envase o requiere intercambio.

## Identificación

Nombre y contenido de Corona Mega 1.2 L y Red Cola 3 L se leen en la imagen. La lata morada Volt indica 473 ml. Los demás contenidos se seleccionaron según diseño y proporción del envase y requieren confirmación física, especialmente Modelo Especial 710 ml, Victoria 473 ml y Jarritos 2 L. Volt Blue y Jarritos uva requieren confirmar también el sabor.

Los códigos no se pudieron leer de la fotografía. Son referencias comerciales de las presentaciones seleccionadas: códigos completos de los nombres de imagen de Chedraui o SKU de Garis. No se completaron códigos truncados calculando números faltantes. Se verificó longitud, dígito de control y ausencia de duplicados; esto no prueba que el envase fotografiado tenga el mismo código. Cotejar las presentaciones con los envases antes de importar.

La lata plateada de espaldas, situada entre New Mix Vampiro y Amper, se omitió porque no es posible confirmar marca y presentación. Los envases repetidos se agruparon y los productos tapados no se trataron como presentaciones adicionales.

## Importación

UTF-8 con BOM, separador coma y precios con dos decimales. Los códigos se conservan como texto sin apóstrofos. Categoría, coste y existencias quedan vacíos; seguimiento de existencias desactivado. Cada lata o botella se vende como una unidad. La validación del formato se realiza sobre un catálogo vacío y no comprueba duplicados con los artículos ya existentes en tu negocio. No se escribió en ninguna base de datos.
