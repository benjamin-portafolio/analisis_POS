"""Checks de esta ejecución. Requiere runtime.json del cluster aislado encendido."""
from pathlib import Path
import os, subprocess, json, time, sys
out = Path(__file__).resolve().parent
m = json.loads((out / 'runtime.json').read_text())
runtime = Path(m['runtime'])
bulk = json.loads((runtime / 'http.json').read_text())
supplier = json.loads((runtime / 'supplier.json').read_text())
tracking = json.loads((runtime / 'tracking.json').read_text())
env = os.environ.copy()
synthetic = dict(DATABASE_HOST='127.0.0.1', DATABASE_PORT=str(m['pg_port']), DATABASE_USER=m['user'], DATABASE_PASSWORD='isolated-test', DATABASE_NAME=m['database'], POS_BULK_SYNC_URL=bulk['url'], POS_BULK_PG_SCHEMA=bulk['schema'], POS_SUPPLIER_SYNC_URL=supplier['url'], POS_SUPPLIER_PG_SCHEMA=supplier['schema'], POS_PHASE3_SYNC_URL=tracking['url'])
env.update(synthetic)
flutter = Path('/Users/benjamin/Projects/POS/pos_flutter')
nest = Path('/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/pos-nest')
checks = [
 ('dart-analyze-final', flutter, ['dart', 'analyze']),
 ('flutter-test-final', flutter, ['flutter', 'test', '--concurrency=2', '--reporter', 'expanded']),
 ('nest-build', nest, ['npm', 'run', 'build']),
 ('nest-postgres', nest, ['npm', 'test', '--', '--runInBand', 'inventory-event.handler', 'producto-event.handler', 'product-suppliers.postgres', 'sync.service.spec', '--json', f'--outputFile={out / "nest-postgres.json"}']),
 ('harness-typecheck', nest, ['npx', 'tsc', '--noEmit', '--skipLibCheck', '--experimentalDecorators', '--emitDecoratorMetadata', '--strictNullChecks', '--target', 'ES2023', '--module', 'commonjs', '--esModuleInterop', 'test/support/variant-tracking-server.ts']),
]
records=json.loads((out / 'checks.json').read_text()) if (out / 'checks.json').exists() else []
selected=set(sys.argv[1:])
for name,cwd,args in checks:
 if selected and name not in selected: continue
 current=env.copy()
 if name=='nest-postgres': current['RUN_POSTGRES_INTEGRATION']='1'
 start=time.monotonic()
 with (out/f'{name}.log').open('w') as log:
  p=subprocess.run(args,cwd=cwd,env=current,stdout=log,stderr=subprocess.STDOUT)
 record={'name':name,'cwd':str(cwd),'args':args,'synthetic_environment':synthetic,'exit_code':p.returncode,'seconds':round(time.monotonic()-start,3)}
 records.append(record);(out/'checks.json').write_text(json.dumps(records,indent=2));print(name,p.returncode,flush=True)
