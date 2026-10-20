# Productos de las cinco fotos del 19 de octubre de 2026

25 registros preparados para carga, de los cuales 23 tienen código de barras y 2 son sobres de té sin código individual verificado. Otros 23 registros quedan en productos_pendientes.csv. Se transcribieron los 35 renglones de las dos listas de precios. Los sabores de té y las dos etiquetas Valentina se separaron cuando correspondía. No se crearon artículos para envases repetidos ni para productos totalmente ocultos.

## Uso

Importar únicamente productos_carga_masiva.csv. Usa el contrato de diez columnas para altas del POS Flutter. Formato UTF-8 con BOM, coma como separador y decimales con punto. Los códigos son texto sin apóstrofos. Categoría, coste y existencias quedan vacíos y el seguimiento de existencias desactivado porque no se proporcionaron esos datos.

productos_fuentes_y_revision.csv documenta cada precio, la presentación investigada, los códigos y las inferencias. productos_pendientes.csv conserva los precios de los artículos que no se pudieron identificar sin elegir arbitrariamente una marca, tamaño o sabor. Estos dos archivos son de revisión y no usan el contrato de carga del POS.

## Precios

Moneda MXN por la unidad descrita. Prioridad: lista manuscrita del negocio, luego precio escrito en el envase y finalmente precio público de internet. Coffee Mate 160 g conserva 40, Dolca 46 g conserva 36 y flan Pronto 136 g conserva 19, escritos en los envases. Flan no se iguala a Gelatinas 15. Las referencias públicas utilizadas para completar faltantes son Coffee Mate sobre 34 g a 12, Cappuccino caja de 6 sobres a 69, mole verde en pasta a 56 y mole listo para servir a 22. El precio de Cappuccino corresponde a la caja, no a un sobre. Los precios públicos pueden variar según sucursal.

La lectura de Nutella Frasco parece 42, pero el último dígito no es claro y podría leerse 48. Se mantiene pendiente y no se importa. En la segunda lista, 500L se interpreta como 500 ml, de acuerdo con las presentaciones comerciales de los aceites.

## Presentaciones y códigos

No se pudieron escanear los códigos de las fotos. Los códigos son referencias comerciales para las presentaciones seleccionadas. Se verificó longitud, dígito de control y ausencia de duplicados. Esta validación no demuestra que el código corresponda al envase físico del negocio.

Las presentaciones inferidas se indican expresamente en productos_fuentes_y_revision.csv. Cotejar en especial Nescafé sobre 16 g frente a 14 g, Nescafé bolsa 28 g, frasco 42 g, mermeladas 450 g y 270 g, ambos moles y Cappuccino caja de 6 sobres. El código 7506475126908 es el sobre Nescafé de 16 g; el sobre de 14 g usa 7501000911783. Los códigos de exhibidor no se asignan a unidades sueltas. Para Cristal 500 ml, la presentación se encontró en un comercio actual pero el código solo se respaldó con una factura de 2018: escanearlo para confirmarlo.

Los tés se cargan por sobre a 3 y sin código, porque no se confirmó un código individual. No se usaron los códigos de las cajas para ellos. Para Valentina se restauró un cero inicial del UPC-A del catálogo comercial; no se calcularon dígitos faltantes. Algunos códigos EAN-8 son cortos y deben conservarse completos.

La comprobación del formato se realiza con el importador real en modo de validación y un catálogo vacío. No comprueba colisiones contra artículos existentes del negocio ni escribe productos o existencias en una base de datos.
