"""QA del paquete documental; no abre bases ni ejecuta contratos Flutter."""
import hashlib
import json
from datetime import datetime
from pathlib import Path
import uuid

ROOT = Path(__file__).resolve().parent
MAX_INTEGER = 9007199254740991


def read(name):
    return json.loads((ROOT / name).read_text())


def stable_v4(parts):
    seed = json.dumps(parts, separators=(",", ":"), ensure_ascii=False).encode()
    raw = bytearray(hashlib.sha256(seed).digest()[:16])
    raw[6] = (raw[6] & 15) | 64
    raw[8] = (raw[8] & 63) | 128
    return str(uuid.UUID(bytes=bytes(raw)))


def keys(value, expected):
    assert set(value) == set(expected.split()), (set(value), expected)


def nonmonetary(value):
    forbidden = {
        "currency", "total_minor", "unit_price_minor",
        "standard_cost_minor_snapshot", "price_reference_quantity_atomic_snapshot",
        "consumption_configuration_key", "catalog_unit_price_minor", "snapshot",
    }
    if isinstance(value, dict):
        assert not forbidden.intersection(value), forbidden.intersection(value)
        for child in value.values():
            nonmonetary(child)
    elif isinstance(value, list):
        for child in value:
            nonmonetary(child)


def positive(value):
    assert type(value) is int and 0 < value <= MAX_INTEGER


def total(snapshot):
    numerator = snapshot["unit_price_minor"] * (
        snapshot["quantity"] or snapshot["measured_quantity_atomic"]
    )
    denominator = snapshot["price_reference_quantity_atomic_snapshot"] or 1
    result = (2 * numerator + denominator) // (2 * denominator)
    assert 0 <= result <= MAX_INTEGER
    return result


def main():
    json_files = sorted(ROOT.glob("*.json"))
    for path in json_files:
        json.loads(path.read_text())
    selection = read("seleccion-sin-precios.json")
    saved = read("guardado-evento-v2.json")
    identity = read("identidades-estables.json")
    link = read("recuperacion-vinculo-v2.json")
    drafts = read("recuperacion-eventos-borrador.json")
    expected = read("recuperacion-esperada.json")
    initial = read("catalogo-inicial.json")
    catalog = read("catalogo-actualizado.json")
    schema = read("esquema-compatibilidad.json")
    ids = identity["ids"]

    for value in (selection, saved, link, expected["quotation"]):
        nonmonetary(value)
    keys(selection, "format_version source_sale_id source_draft_event_id issued_at_ms lines")
    assert selection["format_version"] == 2
    assert saved["event"]["payload"] == selection
    assert saved["event"]["base_version"] == 0
    positive(selection["issued_at_ms"])
    assert selection["issued_at_ms"] % 1000 == 0
    assert ids["source_draft_event_ids"][-1] == ids["source_draft_event_id"]
    assert selection["source_draft_event_id"] == ids["source_draft_event_id"]
    assert selection["source_sale_id"] == ids["source_sale_id"]
    assert len(selection["lines"]) == len(drafts) == 2
    assert [len(entry["refs"]) for entry in drafts] == [4, 5]
    assert len(saved["refs"]) == len(link["refs"]) == 4

    for i, line in enumerate(selection["lines"]):
        keys(line, "id source_sale_item_id sort_order selection")
        snap = line["selection"]
        keys(snap, "variant_id product_name_snapshot variant_name_snapshot sale_mode_snapshot quantity measured_quantity_atomic sale_unit_code_snapshot sale_unit_symbol_snapshot sale_unit_atomic_factor_snapshot")
        assert line["sort_order"] == i
        assert line["source_sale_item_id"] == ids["source_sale_item_ids"][i]
        derived = str(uuid.uuid5(uuid.NAMESPACE_URL, f"quotation:{ids['quotation_id']}:item:{line['source_sale_item_id']}"))
        assert line["id"] == derived == ids["quotation_item_ids"][i]
        assert snap["variant_id"] == ids["variant_ids"][i]
        if snap["sale_mode_snapshot"] == "unit":
            positive(snap["quantity"])
            assert snap["quantity"] == 2
            assert all(snap[k] is None for k in ("measured_quantity_atomic", "sale_unit_code_snapshot", "sale_unit_symbol_snapshot", "sale_unit_atomic_factor_snapshot"))
        else:
            assert snap["sale_mode_snapshot"] == "measured"
            assert snap["quantity"] is None
            positive(snap["measured_quantity_atomic"])
            assert snap["measured_quantity_atomic"] == 500
            assert snap["sale_unit_code_snapshot"] == snap["sale_unit_symbol_snapshot"] == "g"
            assert snap["sale_unit_atomic_factor_snapshot"] == 1

    all_derived = []
    for intention in identity["intentions"]:
        cmd = intention["command"]
        for field in ("sale_id", "event_id"):
            assert uuid.UUID(cmd[field]).version == 4
        mapping = intention["lines"]
        assert intention["draft_version"] == len(mapping)
        assert intention["draft_created_event_id"] == mapping[0]["draft_event_id"]
        assert intention["draft_last_event_id"] == mapping[-1]["draft_event_id"]
        derived = [cmd["sale_id"], cmd["event_id"]]
        for i, row in enumerate(mapping):
            keys(row, "quotation_item_id sale_item_id draft_event_id sort_order")
            assert row["quotation_item_id"] == ids["quotation_item_ids"][i]
            assert row["sort_order"] == i
            assert row["sale_item_id"] == stable_v4(["quotation-recovery", cmd["sale_id"], row["quotation_item_id"]])
            assert row["draft_event_id"] == stable_v4(["quotation-recovery-event", cmd["event_id"], cmd["sale_id"], row["quotation_item_id"]])
            for field in ("sale_item_id", "draft_event_id"):
                assert uuid.UUID(row[field]).version == 4
                derived.append(row[field])
        assert len(derived) == len(set(derived))
        all_derived.extend(derived)
    assert len(all_derived) == len(set(all_derived))
    first, second = identity["intentions"]
    assert second["previous_sale_id"] == first["command"]["sale_id"]
    assert second["command"]["expected_quotation_event_id"] == first["command"]["event_id"]
    assert second["quotation_base_version"] == first["quotation_base_version"] + 1
    lp = link["event"]["payload"]
    keys(lp, "format_version base_quotation_event_id previous_sale_id sale_id recovered_at_ms draft_version draft_created_event_id draft_last_event_id lines")
    assert lp["format_version"] == 2
    assert lp["lines"] == first["lines"]
    for field in ("previous_sale_id", "draft_version", "draft_created_event_id", "draft_last_event_id"):
        assert lp[field] == first[field]
    assert lp["base_quotation_event_id"] == first["command"]["expected_quotation_event_id"]
    assert lp["sale_id"] == first["command"]["sale_id"]
    assert lp["recovered_at_ms"] == first["command"]["recovered_at_ms"]
    assert link["event"]["event_id"] == first["command"]["event_id"]
    assert link["event"]["base_version"] == first["quotation_base_version"]
    assert link["refs"] == [
        {"ref_type": "quotation", "ref_id": ids["quotation_id"], "relationship": "affects"},
        {"ref_type": "sale", "ref_id": lp["sale_id"], "relationship": "uses"},
        *[{"ref_type": "event", "ref_id": r["draft_event_id"], "relationship": "uses"} for r in lp["lines"]],
    ]
    for entry in [saved, *drafts, link]:
        event = entry["event"]
        assert event["application_status"] == "applied"
        assert event["delivery_status"] == "not_required"
        assert event["server_sequence"] is None and event["base_server_sequence"] is None
        assert event["user_id"] == ids["user_id"] and event["device_id"] == ids["device_id"]
        refs = entry["refs"]
        assert len(refs) == len({(r["ref_type"], r["ref_id"], r["relationship"]) for r in refs})
        for r in refs:
            keys(r, "ref_type ref_id relationship")
            assert r["ref_type"] and r["ref_id"] and r["relationship"] in {"affects", "uses"}
    for i, entry in enumerate(drafts):
        event, payload = entry["event"], entry["event"]["payload"]
        row = expected["sale_items"][i]
        mapping = lp["lines"][i]
        assert event["aggregate_type"] == "sale_draft" and event["event_type"] == "producto_agregado_borrador"
        assert event["aggregate_id"] == lp["sale_id"] and event["base_version"] == i
        assert event["event_id"] == mapping["draft_event_id"]
        assert payload["sale_item_id"] == row["id"] == mapping["sale_item_id"]
        assert row["version"] == 1 and row["created_event_id"] == row["last_event_id"] == event["event_id"]
        assert payload["sort_order"] == row["sort_order"] == i
        for key, value in payload.items():
            if key != "sale_item_id":
                assert row[key] == value
        assert payload["quantity"] == selection["lines"][i]["selection"]["quantity"]
        assert payload["measured_quantity_atomic"] == selection["lines"][i]["selection"]["measured_quantity_atomic"]
        assert payload["unit_price_minor"] == catalog["product_variants"][i]["sale_price_minor"]
        assert payload["standard_cost_minor_snapshot"] == catalog["product_variants"][i]["standard_cost_minor"]
        assert payload["product_name_snapshot"] == catalog["products"][i]["name"]
        assert payload["variant_name_snapshot"] == catalog["product_variants"][i]["name"]
        assert payload["price_reference_quantity_atomic_snapshot"] == catalog["products"][i]["price_reference_quantity_atomic"]
        assert json.loads(payload["consumption_configuration_key"])[0] == catalog["product_variants"][i]["inventory_item_id"]
        assert total(payload) == row["total_minor"]
        actual_ms = int(datetime.fromisoformat(event["created_at_local"].replace("Z", "+00:00")).timestamp() * 1000)
        assert actual_ms == lp["recovered_at_ms"]
    assert [r["total_minor"] for r in expected["sale_items"]] == [24000, 15000]
    sale = expected["sale"]
    assert sale["total_minor"] == sum(r["total_minor"] for r in expected["sale_items"]) == 39000
    assert sale["id"] == lp["sale_id"] and sale["version"] == lp["draft_version"]
    assert sale["created_event_id"] == lp["draft_created_event_id"] and sale["last_event_id"] == lp["draft_last_event_id"]
    assert expected["quotation"]["last_event_id"] == link["event"]["event_id"]
    assert expected["quotation"]["current_sale_id"] == sale["id"]
    assert expected["quotation"]["version"] == link["event"]["base_version"] + 1
    assert expected["new_event_count"] == len(drafts) + 1
    assert expected["event_refs_count"] == {"standalone": 0, "server_sync": sum(len(e["refs"]) for e in drafts) + len(link["refs"])}
    assert initial["units"] == catalog["units"]
    assert initial["products"][1]["price_reference_quantity_atomic"] == 1
    assert catalog["products"][1]["price_reference_quantity_atomic"] == 100
    assert schema["schema_version"] == 8
    assert sum(len(v) for v in schema["forbidden_columns"].values()) == 7
    for table, required in schema["required_columns"].items():
        assert not set(required).intersection(schema["forbidden_columns"][table])
    for name in ("guardado-antiguo-incompatible.json", "recuperacion-antigua-incompatible.json"):
        legacy = read(name)
        assert "format_version" not in legacy and "total_minor" in legacy
        assert "snapshot" in legacy["lines"][0]
        assert sum(total(line["snapshot"]) for line in legacy["lines"]) == legacy["total_minor"] == 30000
    print(f"OK: {len(json_files)} JSON; quotation sin importes; 2 intenciones estables; N=2 + vínculo; 13 refs server_sync; total venta 39000.")
    print("QA documental completado. No sustituye las pruebas Flutter ni acredita por sí solo P01–P28.")


if __name__ == "__main__":
    main()
