import datetime,json,pathlib,sqlite3,sys
root=pathlib.Path(__file__).parent
source=pathlib.Path('/Users/benjamin/Library/Containers/com.example.posFlutter/Data/tmp/pos_s5_manual_isolated/pos_db.sqlite')
assert source.parent.name=='pos_s5_manual_isolated'
c=sqlite3.connect(f'file:{source}?mode=ro',uri=True)
c.row_factory=sqlite3.Row
out={'timestamp_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source':str(source),'stage':sys.argv[1]}
out['variants']=[dict(r) for r in c.execute('SELECT p.name,v.id,v.minimum_stock_atomic,i.default_unit_id,b.quantity_on_hand_atomic FROM products p JOIN product_variants v ON v.product_id=p.id LEFT JOIN inventory_items i ON i.id=v.inventory_item_id LEFT JOIN inventory_balances b ON b.inventory_item_id=i.id ORDER BY p.name')]
out['events']=[dict(r) for r in c.execute('SELECT event_id,event_type,delivery_status,payload FROM events ORDER BY local_sequence')]
out['tables']={t:[dict(r) for r in c.execute(f'SELECT * FROM "{t}" ORDER BY rowid')] for t in ['inventory_balances','inventory_movements','sales','sale_items','sale_payments','event_refs']}
(root/f'manual-{sys.argv[1]}.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(out['stage'],out['variants'],{k:len(v) for k,v in out['tables'].items()})
