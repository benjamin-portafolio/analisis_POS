from pathlib import Path
import sqlite3, json, sys, datetime
root=Path(__file__).resolve().parent
info=json.loads((root/'aislamiento-app.json').read_text())
db=Path(info['expected_database'])
assert 'physicalReaderPhase3' in str(db)
c=sqlite3.connect(db.as_uri()+'?mode=ro',uri=True)
c.row_factory=sqlite3.Row
data={'checkpoint':sys.argv[1],'captured_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'database':str(db),'tables':{}}
for table in ['sales','sale_items','events','event_refs','quotations','quotation_items']:
 data['tables'][table]=[dict(row) for row in c.execute(f'SELECT * FROM {table}')]
c.close()
(root/(sys.argv[1]+'.json')).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'checkpoint':sys.argv[1],'counts':{k:len(v) for k,v in data['tables'].items()},'items':[{k:v for k,v in row.items() if k in ['sale_id','variant_id','quantity','measured_quantity_atomic','line_total_minor']} for row in data['tables']['sale_items']]},ensure_ascii=False))
