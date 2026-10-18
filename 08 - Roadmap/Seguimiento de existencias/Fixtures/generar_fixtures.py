#!/usr/bin/env python3
"""Emite los fixtures compartidos del contrato de seguimiento de existencias.

Los archivos se escriben con `json.dump` para garantizar JSON sintacticamente
valido y una forma canonica estable (indent 2, sin ASCII escapado, salto final).
Los identificadores son los declarados en `index.md`; ninguna prueba debe
inventar identidades distintas a las de esta tabla.
"""

import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent

DEVICE = "dispositivo-1"
USER = "usuario-1"
CREATED_AT_LOCAL = "2026-10-01T12:00:00.000Z"

# --- Identidades estables (ver index.md) -----------------------------------
PRODUCTO_MOLIDO = "a1000000-0000-4000-8000-000000000001"
PRODUCTO_GRANO = "a1000000-0000-4000-8000-000000000002"

VARIANTE_250G = "a2000000-0000-4000-8000-000000000001"
VARIANTE_1KG = "a2000000-0000-4000-8000-000000000002"
VARIANTE_GRANO_1KG = "a2000000-0000-4000-8000-000000000003"
VARIANTE_RETIRADA = "a2000000-0000-4000-8000-000000000004"

RECURSO_AUTOGENERADO = "a3000000-0000-4000-8000-000000000001"
RECURSO_INDEPENDIENTE = "a3000000-0000-4000-8000-000000000002"
RECURSO_LEGADO = "a3000000-0000-4000-8000-000000000003"
RECURSO_RECETA = "a4000000-0000-4000-8000-000000000001"

UNIDAD_PIEZA = "a5000000-0000-4000-8000-000000000001"
UNIDAD_GRAMO = "a5000000-0000-4000-8000-000000000002"
UNIDAD_KILOGRAMO = "a5000000-0000-4000-8000-000000000003"

EV_ALTA_AUTOGENERADO = "b1000000-0000-4000-8000-000000000001"
EV_ALTA_INDEPENDIENTE = "b1000000-0000-4000-8000-000000000002"
EV_ALTA_LEGADO = "b1000000-0000-4000-8000-000000000003"
EV_ALTA_RECETA = "b1000000-0000-4000-8000-000000000004"
EV_ALTA_LEGADO_INICIAL = "b1000000-0000-4000-8000-000000000005"

EV_MOV_INICIAL_250G = "b2000000-0000-4000-8000-000000000001"
EV_MOV_INICIAL_LEGADO = "b2000000-0000-4000-8000-000000000002"

EV_PRODUCTO_CREADO_MOLIDO = "b3000000-0000-4000-8000-000000000001"
EV_PRODUCTO_CREADO_GRANO = "b3000000-0000-4000-8000-000000000002"
EV_PRODUCTO_DIRECTO_A_NINGUNO = "b3000000-0000-4000-8000-000000000003"
EV_PRODUCTO_DIRECTO_A_RECETA = "b3000000-0000-4000-8000-000000000004"
EV_PRODUCTO_RECUPERACION = "b3000000-0000-4000-8000-000000000005"
EV_DISCARTE = "b3000000-0000-4000-8000-000000000006"

EV_VENTA_TARDIA = "b4000000-0000-4000-8000-000000000001"
EV_MOV_CONSUMO_TARDIO = "b5000000-0000-4000-8000-000000000001"
VENTA_TARDIA = "b6000000-0000-4000-8000-000000000001"
LINEA_TARDIA = "b7000000-0000-4000-8000-000000000001"
PAGO_TARDIO = "b8000000-0000-4000-8000-000000000001"


def sobre(event_id, aggregate_type, aggregate_id, event_type, payload,
          base_version=None, base_server_sequence=None, local_sequence=1):
    """Sobre canonico de push/apply.

    El sobre no transporta `base_event_id`: el evento base viaja dentro del
    payload de cada contrato. `delivery_status` tampoco forma parte del sobre
    de red; en standalone la fila local lo guarda como `not_required`.
    """
    return {
        "event_id": event_id,
        "aggregate_type": aggregate_type,
        "aggregate_id": aggregate_id,
        "event_type": event_type,
        "device_id": DEVICE,
        "user_id": USER,
        "local_sequence": local_sequence,
        "base_server_sequence": base_server_sequence,
        "base_version": base_version,
        "created_at_local": CREATED_AT_LOCAL,
        "payload": payload,
    }


def dependencia_inventario(ref_id, depends_on_event_id=None):
    dependency = {"ref_type": "inventory_item", "ref_id": ref_id}
    if depends_on_event_id is not None:
        dependency["depends_on_event_id"] = depends_on_event_id
    return dependency


def venta_estado(nombre, categoria_id=None, variantes=(), dependencias=()):
    return {
        "product": {
            "name": nombre,
            "category_id": categoria_id,
            "sale_configuration": {"mode": "unit"},
        },
        "variants": list(variantes),
        "dependencies": list(dependencias),
    }


def variante(variant_id, nombre, precio, inventory_item_id=None, componentes=None,
             sort_order=0, barcode=None, costo=None):
    payload = {
        "variant_id": variant_id,
        "name": nombre,
        "sku": None,
        "barcode": barcode,
        "sale_price_minor": precio,
        "standard_cost_minor": costo,
    }
    if inventory_item_id is not None:
        payload["inventory_item_id"] = inventory_item_id
    if componentes:
        payload["inventory_configuration"] = {
            "enabled": True,
            "components": list(componentes),
        }
    payload["sort_order"] = sort_order
    return payload


ARCHIVOS = {}


# --- alta/ -----------------------------------------------------------------
ARCHIVOS["alta/alta-autogenerada-origen-valido.json"] = sobre(
    EV_ALTA_AUTOGENERADO,
    "inventory_item",
    RECURSO_AUTOGENERADO,
    "recurso_inventario_creado",
    {
        "inventory_item": {
            "inventory_item_id": RECURSO_AUTOGENERADO,
            "name": "Café molido 250 g",
            "default_unit_id": UNIDAD_GRAMO,
            "origin_variant_id": VARIANTE_250G,
        },
        "initial_movement": None,
    },
    base_version=1,
    local_sequence=1,
)

ARCHIVOS["alta/alta-autogenerada-inicial-positiva.json"] = sobre(
    EV_ALTA_AUTOGENERADO,
    "inventory_item",
    RECURSO_AUTOGENERADO,
    "recurso_inventario_creado",
    {
        "inventory_item": {
            "inventory_item_id": RECURSO_AUTOGENERADO,
            "name": "Café molido 250 g",
            "default_unit_id": UNIDAD_GRAMO,
            "origin_variant_id": VARIANTE_250G,
        },
        "initial_movement": {
            "movement_id": EV_MOV_INICIAL_250G,
            "movement_type": "initial_balance",
            "quantity_delta_atomic": 250,
            "reason": None,
            "reversal_of_movement_id": None,
            "total_cost_minor": None,
        },
    },
    base_version=1,
    local_sequence=1,
)

ARCHIVOS["alta/alta-autogenerada-origen-no-uuid.json"] = sobre(
    EV_ALTA_AUTOGENERADO,
    "inventory_item",
    RECURSO_AUTOGENERADO,
    "recurso_inventario_creado",
    {
        "inventory_item": {
            "inventory_item_id": RECURSO_AUTOGENERADO,
            "name": "Café molido 250 g",
            "default_unit_id": UNIDAD_GRAMO,
            "origin_variant_id": "variante-250g",
        },
        "initial_movement": None,
    },
    base_version=1,
    local_sequence=1,
)

ARCHIVOS["alta/alta-autogenerada-origen-no-string.json"] = sobre(
    EV_ALTA_AUTOGENERADO,
    "inventory_item",
    RECURSO_AUTOGENERADO,
    "recurso_inventario_creado",
    {
        "inventory_item": {
            "inventory_item_id": RECURSO_AUTOGENERADO,
            "name": "Café molido 250 g",
            "default_unit_id": UNIDAD_GRAMO,
            "origin_variant_id": 42,
        },
        "initial_movement": None,
    },
    base_version=1,
    local_sequence=1,
)

ARCHIVOS["alta/alta-independiente.json"] = sobre(
    EV_ALTA_INDEPENDIENTE,
    "inventory_item",
    RECURSO_INDEPENDIENTE,
    "recurso_inventario_creado",
    {
        "inventory_item": {
            "inventory_item_id": RECURSO_INDEPENDIENTE,
            "name": "Vela aromática",
            "default_unit_id": UNIDAD_PIEZA,
        },
        "initial_movement": None,
    },
    base_version=1,
    local_sequence=1,
)

ARCHIVOS["alta/alta-legada-sin-origen.json"] = sobre(
    EV_ALTA_LEGADO,
    "inventory_item",
    RECURSO_LEGADO,
    "recurso_inventario_creado",
    {
        "inventory_item": {
            "inventory_item_id": RECURSO_LEGADO,
            "name": "Café molido (2019)",
            "default_unit_id": UNIDAD_GRAMO,
        },
        "initial_movement": {
            "movement_id": EV_MOV_INICIAL_LEGADO,
            "movement_type": "manual_adjustment",
            "quantity_delta_atomic": 500,
            "reason": "Existencia inicial",
        },
    },
    base_version=1,
    local_sequence=1,
)

ARCHIVOS["alta/alta-legada-uuid-incorrecto.json"] = sobre(
    EV_ALTA_LEGADO,
    "inventory_item",
    RECURSO_LEGADO,
    "recurso_inventario_creado",
    {
        "inventory_item": {
            # UUID v1: la version 1 no es aceptada por el contrato.
            "inventory_item_id": "a3000000-0000-1000-8000-000000000009",
            "name": "Café molido (2019)",
            "default_unit_id": UNIDAD_GRAMO,
        },
        "initial_movement": None,
    },
    base_version=1,
    local_sequence=1,
)

ARCHIVOS["alta/sobre-alta-valido.json"] = ARCHIVOS[
    "alta/alta-autogenerada-origen-valido.json"
]


# --- producto/ -------------------------------------------------------------
MOLIDO_DIRECTO = venta_estado(
    "Café molido",
    variantes=[
        variante(VARIANTE_250G, "250 g", 4500, RECURSO_AUTOGENERADO, sort_order=0,
                 costo=1800),
        variante(VARIANTE_1KG, "1 kg", 15000, sort_order=1, costo=6000),
    ],
    dependencias=[
        dependencia_inventario(RECURSO_AUTOGENERADO, EV_ALTA_AUTOGENERADO),
    ],
)
MOLIDO_SIN_SEGUIMIENTO = venta_estado(
    "Café molido",
    variantes=[
        variante(VARIANTE_250G, "250 g", 4500, sort_order=0, costo=1800),
        variante(VARIANTE_1KG, "1 kg", 15000, sort_order=1, costo=6000),
    ],
)
MOLIDO_RECETA = venta_estado(
    "Café molido",
    variantes=[
        variante(VARIANTE_250G, "250 g", 4500, sort_order=0, costo=1800,
                 componentes=[
                     {"inventory_item_id": RECURSO_RECETA, "quantity_atomic": 1000}
                 ]),
        variante(VARIANTE_1KG, "1 kg", 15000, sort_order=1, costo=6000),
    ],
    dependencias=[
        dependencia_inventario(RECURSO_RECETA, EV_ALTA_RECETA),
    ],
)

ARCHIVOS["producto/producto-directo-a-ninguno.json"] = sobre(
    EV_PRODUCTO_DIRECTO_A_NINGUNO,
    "product",
    PRODUCTO_MOLIDO,
    "producto_actualizado",
    {
        "base_event_id": EV_PRODUCTO_CREADO_MOLIDO,
        "before": MOLIDO_DIRECTO,
        "after": MOLIDO_SIN_SEGUIMIENTO,
    },
    base_version=1,
    base_server_sequence=41,
    local_sequence=3,
)

ARCHIVOS["producto/producto-directo-a-receta.json"] = sobre(
    EV_PRODUCTO_DIRECTO_A_RECETA,
    "product",
    PRODUCTO_MOLIDO,
    "producto_actualizado",
    {
        "base_event_id": EV_PRODUCTO_DIRECTO_A_NINGUNO,
        "before": MOLIDO_SIN_SEGUIMIENTO,
        "after": MOLIDO_RECETA,
    },
    base_version=2,
    base_server_sequence=42,
    local_sequence=4,
)

ARCHIVOS["producto/producto-recuperacion-mismo-id.json"] = sobre(
    EV_PRODUCTO_RECUPERACION,
    "product",
    PRODUCTO_MOLIDO,
    "producto_actualizado",
    {
        "base_event_id": EV_PRODUCTO_DIRECTO_A_RECETA,
        "before": MOLIDO_RECETA,
        "after": MOLIDO_DIRECTO,
    },
    base_version=3,
    base_server_sequence=43,
    local_sequence=5,
)

ARCHIVOS["producto/producto-origen-en-antes.json"] = {
    "estado_previo": {
        "product_variants": [
            {
                "variant_id": VARIANTE_250G,
                "inventory_item_id": RECURSO_AUTOGENERADO,
                "active": False,
            }
        ],
        "variant_inventory_memory": [],
    },
    "evento": sobre(
        EV_PRODUCTO_DIRECTO_A_NINGUNO,
        "product",
        PRODUCTO_MOLIDO,
        "producto_actualizado",
        {
            "base_event_id": EV_PRODUCTO_CREADO_MOLIDO,
            "before": MOLIDO_DIRECTO,
            "after": MOLIDO_SIN_SEGUIMIENTO,
        },
        base_version=1,
        base_server_sequence=41,
        local_sequence=3,
    ),
    "estado_esperado": {
        "product_variants": [
            {
                "variant_id": VARIANTE_250G,
                "inventory_item_id": None,
                "active": False,
            }
        ],
        "variant_inventory_memory": [
            {
                "variant_id": VARIANTE_250G,
                "inventory_item_id": RECURSO_AUTOGENERADO,
                "source_event_id": EV_PRODUCTO_DIRECTO_A_NINGUNO,
                "source_server_sequence": 41,
            }
        ],
    },
}


# --- descarte/ -------------------------------------------------------------
def descarte_payload(trigger_product_id=PRODUCTO_MOLIDO,
                     trigger_product_event_id=EV_PRODUCTO_DIRECTO_A_NINGUNO,
                     origin_variant_id=VARIANTE_250G, policy_version=1,
                     base_event_id=EV_ALTA_AUTOGENERADO, extra=None):
    payload = {
        "base_event_id": base_event_id,
        "trigger_product_id": trigger_product_id,
        "trigger_product_event_id": trigger_product_event_id,
        "origin_variant_id": origin_variant_id,
        "policy_version": policy_version,
    }
    if extra:
        payload.update(extra)
    return payload


ARCHIVOS["descarte/descarte-valido.json"] = sobre(
    EV_DISCARTE,
    "inventory_item",
    RECURSO_AUTOGENERADO,
    "recurso_inventario_descartado",
    descarte_payload(),
    base_version=1,
    local_sequence=4,
)

ARCHIVOS["descarte/descarte-policy-version-invalida.json"] = sobre(
    EV_DISCARTE,
    "inventory_item",
    RECURSO_AUTOGENERADO,
    "recurso_inventario_descartado",
    descarte_payload(policy_version=2),
    base_version=1,
    local_sequence=4,
)

ARCHIVOS["descarte/descarte-policy-version-cero.json"] = sobre(
    EV_DISCARTE,
    "inventory_item",
    RECURSO_AUTOGENERADO,
    "recurso_inventario_descartado",
    descarte_payload(policy_version=0),
    base_version=1,
    local_sequence=4,
)

ARCHIVOS["descarte/descarte-trigger-igual-base.json"] = sobre(
    EV_DISCARTE,
    "inventory_item",
    RECURSO_AUTOGENERADO,
    "recurso_inventario_descartado",
    descarte_payload(
        trigger_product_event_id=EV_ALTA_AUTOGENERADO,
        base_event_id=EV_ALTA_AUTOGENERADO,
    ),
    base_version=1,
    local_sequence=4,
)

ARCHIVOS["descarte/descarte-origen-no-uuid.json"] = sobre(
    EV_DISCARTE,
    "inventory_item",
    RECURSO_AUTOGENERADO,
    "recurso_inventario_descartado",
    descarte_payload(origin_variant_id="a2000000-0000-1000-8000-000000000001"),
    base_version=1,
    local_sequence=4,
)

ARCHIVOS["descarte/descarte-campo-desconocido.json"] = sobre(
    EV_DISCARTE,
    "inventory_item",
    RECURSO_AUTOGENERADO,
    "recurso_inventario_descartado",
    descarte_payload(extra={"force": True}),
    base_version=1,
    local_sequence=4,
)

ARCHIVOS["descarte/sobre-descarte-valido.json"] = ARCHIVOS[
    "descarte/descarte-valido.json"
]


# --- memoria/ --------------------------------------------------------------
def memoria_fila(inventory_item_id, source_event_id, source_server_sequence):
    return {
        "variant_id": VARIANTE_250G,
        "inventory_item_id": inventory_item_id,
        "source_event_id": source_event_id,
        "source_server_sequence": source_server_sequence,
    }


ARCHIVOS["memoria/memoria-legada-recuperable.json"] = {
    "descripcion": (
        "Vinculo directo desvinculado antes de existir la tabla de memoria. La "
        "evidencia es el propio evento que produjo la desvinculacion: su "
        "before.variants declara el vinculo y su secuencia oficial es 41."
    ),
    "estado_previo": {
        "product_variants": [
            {
                "variant_id": VARIANTE_250G,
                "inventory_item_id": None,
                "active": True,
            }
        ],
        "inventory_items": [
            {
                "inventory_item_id": RECURSO_AUTOGENERADO,
                "origin_variant_id": None,
                "active": True,
            }
        ],
        "variant_inventory_memory": [],
    },
    "evidencia": {
        "event_id": EV_PRODUCTO_DIRECTO_A_NINGUNO,
        "server_sequence": 41,
        "before_variants": [
            {
                "variant_id": VARIANTE_250G,
                "inventory_item_id": RECURSO_AUTOGENERADO,
            }
        ],
    },
    "estado_esperado": {
        "variant_inventory_memory": [
            memoria_fila(RECURSO_AUTOGENERADO,
                         EV_PRODUCTO_DIRECTO_A_NINGUNO, 41)
        ],
    },
    "limite": (
        "El recurso no tiene origin_variant_id: la procedencia sigue "
        "desconocida y el recall no habilita descarte automatico."
    ),
}

ARCHIVOS["memoria/memoria-antes-conflicto.json"] = {
    "descripcion": "Pestado de memoria antes de una edicion local en conflicto.",
    "variant_inventory_memory": [
        memoria_fila(RECURSO_AUTOGENERADO, EV_PRODUCTO_CREADO_MOLIDO, 41)
    ],
    "product_variants": [
        {"variant_id": VARIANTE_250G, "inventory_item_id": RECURSO_AUTOGENERADO}
    ],
}

ARCHIVOS["memoria/memoria-despues-conflicto.json"] = {
    "descripcion": (
        "Tras el conflicto gana la edicion oficial que desvinculo la variante. "
        "Se conservan vinculo nulo y la memoria acreditada por su evento."
    ),
    "variant_inventory_memory": [
        memoria_fila(RECURSO_AUTOGENERADO,
                     EV_PRODUCTO_DIRECTO_A_NINGUNO, 41)
    ],
    "product_variants": [
        {"variant_id": VARIANTE_250G, "inventory_item_id": None}
    ],
}


# --- venta_tardia/ ---------------------------------------------------------
SNAPSHOT_TARDIO = {
    "variant_id": VARIANTE_250G,
    "consumption_configuration_key": None,
    "product_name_snapshot": "Café molido",
    "variant_name_snapshot": "250 g",
    "sale_mode_snapshot": "unit",
    "quantity": 2,
    "measured_quantity_atomic": None,
    "unit_price_minor": 4500,
    "standard_cost_minor_snapshot": 1800,
    "price_reference_quantity_atomic_snapshot": None,
    "sale_unit_code_snapshot": None,
    "sale_unit_symbol_snapshot": None,
    "sale_unit_atomic_factor_snapshot": None,
}

ARCHIVOS["venta_tardia/venta-tardia-configuracion-historica.json"] = {
    "descripcion": (
        "Configuracion_directa que B capturo antes de que A desvinculara. Es "
        "la unica fuente admisible del consumo historico."
    ),
    "product_id": PRODUCTO_MOLIDO,
    "configuration_event_id": EV_PRODUCTO_CREADO_MOLIDO,
    "server_sequence": 41,
    "variants": [
        {
            "variant_id": VARIANTE_250G,
            "inventory_item_id": RECURSO_AUTOGENERADO,
            "consumption_mode": "direct",
        }
    ],
}

ARCHIVOS["venta_tardia/venta-tardia-consumo-original.json"] = sobre(
    EV_VENTA_TARDIA,
    "sale",
    VENTA_TARDIA,
    "venta_confirmada",
    {
        "payment_id": PAGO_TARDIO,
        "payment_method": "transfer",
        "total_minor": 9000,
        "received_minor": 9000,
        "change_minor": 0,
        "currency": "MXN",
        "lines": [
            {
                "sale_item_id": LINEA_TARDIA,
                "product_id": PRODUCTO_MOLIDO,
                "configuration_event_id": EV_PRODUCTO_CREADO_MOLIDO,
                "snapshot": SNAPSHOT_TARDIO,
                "consumption_mode": "direct",
                "sale_unit_id": None,
                "consumptions": [
                    {
                        "inventory_item_id": RECURSO_AUTOGENERADO,
                        "component_atomic": 1,
                        "quantity_delta_atomic": -2,
                        "movement_id": EV_MOV_CONSUMO_TARDIO,
                        "movement_type": "sale_consumption",
                        "total_cost_minor": None,
                    }
                ],
            }
        ],
        "dependency_event_ids": [
            EV_PRODUCTO_CREADO_MOLIDO,
            EV_ALTA_AUTOGENERADO,
        ],
    },
    local_sequence=6,
)

ARCHIVOS["venta_tardia/venta-tardia-deshincular.json"] = ARCHIVOS[
    "producto/producto-directo-a-ninguno.json"
]

ARCHIVOS["venta_tardia/venta-tardia-esperado.json"] = {
    "orden": [
        EV_ALTA_AUTOGENERADO,
        EV_PRODUCTO_CREADO_MOLIDO,
        EV_PRODUCTO_DIRECTO_A_NINGUNO,
        EV_VENTA_TARDIA,
    ],
    "nota": (
        "La venta llega despues de la desvinculacion y aun así se acepta una "
        "sola vez contra el recurso capturado en su configuracion."
    ),
    "saldo_final_del_recurso": {
        "inventory_item_id": RECURSO_AUTOGENERADO,
        "quantity_on_hand_atomic": 248,
        "quantity_available_atomic": 248,
    },
    "recurso_conservado": True,
    "descarte_generado": False,
    "variant_inventory_memory": [
        memoria_fila(RECURSO_AUTOGENERADO,
                     EV_PRODUCTO_DIRECTO_A_NINGUNO, 41)
    ],
}


# --- escenarios/ ----------------------------------------------------------
ARCHIVOS["escenarios/actualizacion-intenta-mutar-origen.json"] = sobre(
    "b9000000-0000-4000-8000-000000000001",
    "inventory_item",
    RECURSO_INDEPENDIENTE,
    "recurso_inventario_actualizado",
    {
        "base_event_id": EV_ALTA_INDEPENDIENTE,
        "changed_fields": ["origin_variant_id"],
        "changes": {
            "origin_variant_id": {"from": None, "to": VARIANTE_250G}
        },
    },
    base_version=1,
    local_sequence=2,
)

ARCHIVOS["escenarios/descarte-trigger-delete-product.json"] = {
    "descripcion": (
        "El evento que quito el vinculo tambien elimino el producto. No es un "
        "disparador admisible aunque el payload tenga forma valida."
    ),
    "estado_previo": {
        "events": [
            {
                "event_id": EV_PRODUCTO_DIRECTO_A_NINGUNO,
                "event_type": "producto_actualizado",
                "server_sequence": 41,
                "payload_delete_product": True,
            }
        ],
        "product_variants": [
            {"variant_id": VARIANTE_250G, "inventory_item_id": RECURSO_AUTOGENERADO}
        ],
    },
    "evento": sobre(
        EV_DISCARTE,
        "inventory_item",
        RECURSO_AUTOGENERADO,
        "recurso_inventario_descartado",
        descarte_payload(trigger_product_event_id=EV_PRODUCTO_DIRECTO_A_NINGUNO),
        base_version=1,
        local_sequence=4,
    ),
    "resultado_esperado": "rechazado por regla de disparador; no se borra nada",
    "fase": 3,
}

ARCHIVOS["escenarios/descarte-trigger-variante-retirada.json"] = {
    "descripcion": (
        "La variante simplemente se retiro del producto y su vinculo quedo sin "
        "transicion de desvinculacion que lo acredite como disparador."
    ),
    "estado_previo": {
        "events": [
            {
                "event_id": EV_PRODUCTO_DIRECTO_A_NINGUNO,
                "event_type": "producto_actualizado",
                "server_sequence": 41,
                "before_variants": [
                    {"variant_id": VARIANTE_RETIRADA,
                     "inventory_item_id": RECURSO_AUTOGENERADO}
                ],
                "after_variants": [],
            }
        ],
        "product_variants": [
            {"variant_id": VARIANTE_250G, "inventory_item_id": RECURSO_AUTOGENERADO}
        ],
    },
    "evento": sobre(
        EV_DISCARTE,
        "inventory_item",
        RECURSO_AUTOGENERADO,
        "recurso_inventario_descartado",
        descarte_payload(
            trigger_product_event_id=EV_PRODUCTO_DIRECTO_A_NINGUNO,
            origin_variant_id=VARIANTE_250G,
        ),
        base_version=1,
        local_sequence=4,
    ),
    "resultado_esperado": "rechazado; el recurso de la variante 250 g no se descarta",
    "fase": 3,
}

ARCHIVOS["escenarios/descarte-base-no-creacion.json"] = {
    "descripcion": (
        "base_event_id no es el evento de alta del recurso. La version y la "
        "secuencia base tampoco coinciden con la fila persistida."
    ),
    "estado_previo": {
        "inventory_items": [
            {
                "inventory_item_id": RECURSO_AUTOGENERADO,
                "created_event_id": EV_ALTA_AUTOGENERADO,
                "version": 1,
                "last_server_sequence": 41,
            }
        ],
    },
    "evento": {
        "aggregate_type": "inventory_item",
        "aggregate_id": RECURSO_AUTOGENERADO,
        "base_version": 3,
        "base_server_sequence": 99,
        "payload": descarte_payload(base_event_id=EV_PRODUCTO_CREADO_MOLIDO),
    },
    "resultado_esperado": "rechazado; no se borra recurso ni balance",
    "fase": 3,
}

ARCHIVOS["escenarios/descarte-recurso-con-movimientos.json"] = {
    "descripcion": "El recurso tiene movimientos aunque su suma sea cero.",
    "estado_previo": {
        "inventory_items": [
            {
                "inventory_item_id": RECURSO_AUTOGENERADO,
                "origin_variant_id": VARIANTE_250G,
                "active": True,
            }
        ],
        "inventory_balances": [
            {
                "inventory_item_id": RECURSO_AUTOGENERADO,
                "quantity_on_hand_atomic": 0,
                "quantity_available_atomic": 0,
            }
        ],
        "inventory_movements": [
            {
                "movement_id": EV_MOV_CONSUMO_TARDIO,
                "inventory_item_id": RECURSO_AUTOGENERADO,
                "movement_type": "sale_consumption",
                "quantity_delta_atomic": -2,
            },
            {
                "movement_id": "b5000000-0000-4000-8000-000000000002",
                "inventory_item_id": RECURSO_AUTOGENERADO,
                "movement_type": "manual_adjustment",
                "quantity_delta_atomic": 2,
            },
        ],
    },
    "evento": ARCHIVOS["descarte/descarte-valido.json"],
    "resultado_esperado": "conservar recurso, balance y memoria; no es candidato",
    "fase": 3,
}

ARCHIVOS["escenarios/descarte-saldos-no-cero.json"] = {
    "descripcion": "Saldos distintos de cero; el balance existe y no es cero.",
    "estado_previo": {
        "inventory_balances": [
            {
                "inventory_item_id": RECURSO_AUTOGENERADO,
                "quantity_on_hand_atomic": 4,
                "quantity_available_atomic": 4,
            }
        ],
    },
    "evento": ARCHIVOS["descarte/descarte-valido.json"],
    "resultado_esperado": "conservar recurso, balance y memoria",
    "fase": 3,
}

ARCHIVOS["escenarios/descarte-memoria-de-otra-variante.json"] = {
    "descripcion": (
        "Otra variante recuerda el mismo recurso. La memoria de la propia "
        "variante se elimina con el recurso y no es un bloqueo circular."
    ),
    "estado_previo": {
        "variant_inventory_memory": [
            {
                "variant_id": VARIANTE_250G,
                "inventory_item_id": RECURSO_AUTOGENERADO,
                "source_event_id": EV_PRODUCTO_CREADO_MOLIDO,
                "source_server_sequence": 41,
            },
            {
                "variant_id": VARIANTE_1KG,
                "inventory_item_id": RECURSO_AUTOGENERADO,
                "source_event_id": EV_PRODUCTO_CREADO_MOLIDO,
                "source_server_sequence": 41,
            },
        ],
    },
    "evento": ARCHIVOS["descarte/descarte-valido.json"],
    "resultado_esperado": "conservar recurso por la memoria de la variante 1 kg",
    "fase": 3,
}


def main():
    for relative_path, content in sorted(ARCHIVOS.items()):
        target = ROOT / relative_path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(
            json.dumps(content, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
    print(f"{len(ARCHIVOS)} archivos escritos")


if __name__ == "__main__":
    main()