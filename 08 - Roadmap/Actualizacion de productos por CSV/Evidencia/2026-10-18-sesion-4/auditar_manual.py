"""Read-only audit of the isolated manual database; never opens pos_db.sqlite."""
from pathlib import Path
import json, sqlite3, sys
root = Path('/Users/benjamin/Library/Containers/com.example.posFlutter/Data/Library/Caches/csv-session4-isolated')
evidence = Path(__file__).resolve().parent
phase = sys.argv[1]
assert phase in {'antes', 'despues', 'repetido', 'reabierto'}
connection = sqlite3.connect(f'file:{root / "manual.sqlite"}?mode=ro', uri=True)
connection.row_factory = sqlite3.Row
tables = [r[0] for r in connection.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")]
state = {t: [dict(r) for r in connection.execute(f'SELECT * FROM "{t}" ORDER BY rowid')] for t in tables}
connection.close()
if phase != 'antes':
    before = json.loads((evidence/'manual-antes.json').read_text())
    if phase == 'despues':
        for table in before:
            if table not in {'products', 'product_variants', 'events', 'sqlite_sequence'}:
                assert state[table] == before[table], table
        assert [r for r in state['sqlite_sequence'] if r['name']!='events'] == [r for r in before['sqlite_sequence'] if r['name']!='events']
        assert len(state['events']) == len(before['events']) + 1
        assert state['event_refs'] == []
        assert state['product_update_undo'] == []
        assert all(e['delivery_status']=='not_required' for e in state['events'])
        target = next(p for p in state['products'] if p['name']=='CSV Manual Café Editado')
        old = next(p for p in before['products'] if p['id']==target['id'])
        assert target['created_event_id']==old['created_event_id']
        old_variants = {v['id']:v for v in before['product_variants']}
        for v in state['product_variants']:
            original=old_variants[v['id']]
            if v['product_id'] != target['id']:
                assert v==original
            else:
                for key in original:
                    if key not in {'sale_price_minor','barcode','version','last_event_id'}:
                        assert v[key]==original[key], key
                if v['name']=='Chica':
                    assert v['sale_price_minor']==2950 and v['barcode']=='0000099'
                else:
                    assert v['sale_price_minor']==original['sale_price_minor']
                    assert v['barcode']==original['barcode']
    else:
        assert state == json.loads((evidence/'manual-despues.json').read_text())
(evidence/f'manual-{phase}.json').write_text(json.dumps(state,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'phase':phase,'events':len(state['events']),'refs':len(state['event_refs']),'products':len(state['products']),'variants':len(state['product_variants']),'all_assertions_passed':True}))
