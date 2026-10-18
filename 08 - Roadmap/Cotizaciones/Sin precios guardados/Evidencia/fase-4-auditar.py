"""Auditoría sobre evidencia temporal exportada; no abre bases de uso."""
import hashlib
import json
import pathlib
import sqlite3

HERE = pathlib.Path(__file__).resolve().parent
SCHEMA = json.loads((HERE.parent / 'Fixtures/esquema-compatibilidad.json').read_text())
SELECTION = set(json.loads((HERE.parent / 'Fixtures/seleccion-sin-precios.json').read_text())['lines'][0]['selection'])
SAVED = {'format_version', 'source_sale_id', 'source_draft_event_id', 'issued_at_ms', 'lines'}
SAVED_LINE = {'id', 'source_sale_item_id', 'sort_order', 'selection'}
RECOVERED = {'format_version', 'base_quotation_event_id', 'previous_sale_id', 'sale_id', 'recovered_at_ms', 'draft_version', 'draft_created_event_id', 'draft_last_event_id', 'lines'}
IDENTITY = {'quotation_item_id', 'sale_item_id', 'draft_event_id', 'sort_order'}

def closed(obj, keys, label, nested=()):
    assert isinstance(obj, dict) and set(obj) == keys, (label, obj)
    for key, value in obj.items():
        if key not in nested:
            assert value is None or type(value) in (str, int, bool), (label, key, value)

def payload(value, event_type):
    if isinstance(value, str):
        value = json.loads(value)
    if event_type == 'cotizacion_guardada':
        closed(value, SAVED, event_type, ('lines',))
        assert isinstance(value['lines'], list) and value['lines']
        for line in value['lines']:
            closed(line, SAVED_LINE, 'saved line', ('selection',))
            closed(line['selection'], SELECTION, 'selection')
    else:
        assert event_type == 'cotizacion_recuperada', event_type
        closed(value, RECOVERED, event_type, ('lines',))
        assert isinstance(value['lines'], list) and value['lines']
        for line in value['lines']:
            closed(line, IDENTITY, 'recovery identity')
    assert value['format_version'] == 2
    return value

def content(data):
    rows = data.get('events', [])
    audited = []
    for row in rows:
        if row['aggregate_type'] == 'quotation':
            payload(row['payload'], row['event_type'])
            audited.append(row['event_id'])
    for table, keys in SCHEMA['required_columns'].items():
        for row in data.get(table, []):
            assert set(row) == set(keys), (table, row.keys())
    return audited

files = []
for path in sorted((HERE / 'fase-4-sqlite').glob('*.sqlite')):
    # Evidencia del legado rechazado se conserva y se registra aparte.
    if path.name.startswith('legacy-all-columns-protected-true'):
        continue
    with sqlite3.connect(path.as_uri() + '?mode=ro', uri=True) as db:
        db.row_factory = sqlite3.Row
        assert db.execute('PRAGMA user_version').fetchone()[0] == 8
        assert db.execute('PRAGMA integrity_check').fetchone()[0] == 'ok'
        assert not db.execute('PRAGMA foreign_key_check').fetchall()
        schema = {}
        for table, required in SCHEMA['required_columns'].items():
            schema[table] = [dict(r) for r in db.execute('PRAGMA table_info(' + table + ')')]
            assert {r['name'] for r in schema[table]} == set(required)
            ddl = db.execute('SELECT sql FROM sqlite_master WHERE name=?', (table,)).fetchone()[0]
            for forbidden in SCHEMA['forbidden_columns'][table]:
                assert forbidden not in ddl
        indexes = {r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type='index'")}
        assert set(SCHEMA['required_indexes']) <= indexes
        data = {t: [dict(r) for r in db.execute('SELECT * FROM ' + t)] for t in ('quotations', 'quotation_items', 'events')}
        audited = content(data)
        monetary_sources = {}
        for t, required in {'product_variants': {'sale_price_minor', 'standard_cost_minor'}, 'sales': {'total_minor'}, 'sale_items': {'unit_price_minor', 'standard_cost_minor_snapshot', 'total_minor', 'price_reference_quantity_atomic_snapshot'}}.items():
            columns = {r['name'] for r in db.execute('PRAGMA table_info(' + t + ')')}
            assert required <= columns
            monetary_sources[t] = sorted(required)
        files.append({'file': path.name, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'quotation_events': audited, 'schema': schema, 'monetary_sale_catalog_columns': monetary_sources, 'integrity_check': 'ok', 'foreign_key_check': []})

memory = []
for path in sorted((HERE / 'fase-4-sqlite').glob('saldos-*.json')):
    data = json.loads(path.read_text())
    ids = content(data['after_charge'])
    assert data['baseline_business'] == data['after_recovery_business']
    assert data['captured_total_minor'] == 29401
    assert data['current_estimate_minor'] == 30401
    after = data['after_charge']
    sale_id = after['quotations'][0]['current_sale_id']
    method = path.stem.rsplit('-', 1)[1]
    payments = [p for p in after['sale_payments'] if p['sale_id'] == sale_id]
    debts = [p for p in after['credit_sales'] if p['sale_id'] == sale_id]
    assert len(payments) == (0 if method == 'credit' else 1)
    assert len(debts) == (1 if method == 'credit' else 0)
    assert all(p['amount_minor'] == 29401 for p in payments + debts)
    if payments:
        assert payments[0]['method'] == method
        assert payments[0]['reference'] == ('SPEI-123' if method == 'transfer' else None)
    movements = [m for m in after['cash_movements'] if payments and m['sale_payment_id'] == payments[0]['id']]
    assert len(movements) == (1 if method == 'cash' else 0)
    for e in data['after_charge']['events']:
        if e['event_type'] == 'venta_confirmada' and e['aggregate_id'] == data['after_charge']['quotations'][0]['current_sale_id']:
            p = json.loads(e['payload'])
            assert p['total_minor'] == 29401
            assert set(ids).isdisjoint(p['dependency_event_ids'])
    memory.append({'file': path.name, 'quotation_events': ids, 'balances': data['after_charge_balances'], 'captured_total_minor': 29401, 'estimate_minor': 30401, 'receipt': data['receipt']})

core = []
for path in sorted((HERE / 'fase-4-core').glob('*.json')):
    data = json.loads(path.read_text())
    for event in data['quotation_events']:
        value = event['payload']
        payload(value, 'cotizacion_guardada' if 'source_sale_id' in value else 'cotizacion_recuperada')
    assert data['sale_total_minor'] == 39000
    core.append({'file': str(path.relative_to(HERE)), 'mode': data['mode'], 'sale_total_minor': data['sale_total_minor'], 'new_ref_count': data['new_ref_count']})

legacy = json.loads((HERE / 'fase-4-sqlite/legacy-all-columns-protected-true.json').read_text())
assert legacy['before_sha256'] == legacy['after_sha256']
assert legacy['restore_service_executed'] and legacy['protected']
assert len(files) == 11 and len(memory) == 6 and len(core) == 2
result = {'file_databases': files, 'payment_scenarios': memory, 'core_fixtures': core, 'legacy_protected': legacy, 'closed_payload_keys': {'saved': sorted(SAVED), 'line': sorted(SAVED_LINE), 'selection': sorted(SELECTION), 'recovered': sorted(RECOVERED), 'recovery_identity': sorted(IDENTITY)}, 'result': 'pass'}
(HERE / 'fase-4-auditoria-sqlite.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print('PASS: 11 bases actuales, 6 cobros, 2 fixtures core; esquema exacto y JSON quotation cerrado sin copias anidadas; precios de venta/catalogo conservados; legado protegido hash intacto.')
