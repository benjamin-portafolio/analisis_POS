import datetime,json,os,pathlib,signal,socket,subprocess,tempfile,time,shutil
out=pathlib.Path(__file__).resolve().parent
flutter=pathlib.Path('/Users/benjamin/Projects/POS/pos_flutter')
nest=pathlib.Path('/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/pos-nest')
pg=pathlib.Path('/Applications/Postgres.app/Contents/Versions/18/bin')
temp=pathlib.Path(tempfile.mkdtemp(prefix='pos_s5_pg_'))
with socket.socket() as sock:
 sock.bind(('127.0.0.1',0)); port=sock.getsockname()[1]
env=os.environ.copy()
env.update(DATABASE_HOST='127.0.0.1',DATABASE_PORT=str(port),DATABASE_USER='minimum_stock_test',DATABASE_PASSWORD='isolated-test',DATABASE_NAME='pos_nest_test_minimum_stock_session5',PATH=str(pg)+os.pathsep+env['PATH'])
servers=[]; logs=[]; started=False
result={'started_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'commands':[]}
def run(args,log,cwd=None):
 with (out/log).open('w') as f:
  p=subprocess.run([str(x) for x in args],cwd=cwd,env=env,stdout=f,stderr=subprocess.STDOUT)
 result['commands'].append({'argv':[str(x) for x in args],'cwd':str(cwd) if cwd else None,'log':log,'exit':p.returncode})
 print(log,p.returncode,flush=True)
 if p.returncode: raise RuntimeError(log+' failed')
try:
 run([pg/'initdb','-D',temp/'data','-U',env['DATABASE_USER'],'--auth=trust','--no-locale'],'initdb.log')
 run([pg/'pg_ctl','-D',temp/'data','-l',temp/'postgres.log','-o',f'-h 127.0.0.1 -p {port} -k {temp}','-w','start'],'postgres-start.log');started=True
 run([pg/'createdb','-h','127.0.0.1','-p',port,'-U',env['DATABASE_USER'],env['DATABASE_NAME']],'createdb.log')
 public={k:env[k] for k in ['DATABASE_HOST','DATABASE_PORT','DATABASE_NAME']}
 for name,var,schema_var in [('minimum','POS_MINIMUM_SYNC_URL','POS_MINIMUM_PG_SCHEMA'),('tracking','POS_PHASE3_SYNC_URL',None),('suppliers','POS_SUPPLIER_SYNC_URL','POS_SUPPLIER_PG_SCHEMA'),('bulk','POS_BULK_SYNC_URL','POS_BULK_PG_SCHEMA')]:
  f=(out/f'server-{name}.log').open('w');logs.append(f)
  settings=temp/f'{name}.json'
  server_env=env.copy();server_env['POS_PHASE3_URL_FILE']=str(settings)
  command=['node','node_modules/ts-node/dist/bin.js','test/support/variant-tracking-server.ts']
  p=subprocess.Popen(command,cwd=nest,env=server_env,stdout=f,stderr=subprocess.STDOUT,start_new_session=True)
  servers.append((name,p,settings,var,schema_var))
 deadline=time.monotonic()+120
 for name,p,settings,var,schema_var in servers:
  while not settings.exists():
   if p.poll() is not None: raise RuntimeError(name+' exited before ready')
   if time.monotonic()>deadline: raise TimeoutError(name)
   time.sleep(.1)
  j=json.loads(settings.read_text());env[var]=j['url'];public[var]=j['url'];public[name+'_schema']=j['schema']
  if schema_var:env[schema_var]=j['schema'];public[schema_var]=j['schema']
 (out/'environment-public.json').write_text(json.dumps(public,indent=2)+'\n')
 print('Four isolated HTTP targets ready',flush=True)
 run(['flutter','test','--reporter','expanded'],'flutter-completo-final.log',flutter)
except BaseException as e:
 result['error']=repr(e)
 raise
finally:
 for name,p,settings,var,schema_var in servers:
  if p.poll() is None: os.killpg(p.pid,signal.SIGINT)
 for name,p,*_ in servers:
  try:p.wait(timeout=30)
  except subprocess.TimeoutExpired:os.killpg(p.pid,signal.SIGKILL);p.wait()
 result['http_server_exits']={name:p.returncode for name,p,*_ in servers}
 for f in logs:f.close()
 if started:
  q=subprocess.run([str(pg/'psql'),'-h','127.0.0.1','-p',str(port),'-U',env['DATABASE_USER'],'-d',env['DATABASE_NAME'],'-Atc',"SELECT count(*) FROM information_schema.schemata WHERE schema_name LIKE 'seg_phase3_http_%'"],env=env,capture_output=True,text=True)
  result['remaining_http_schemas']=q.stdout.strip()
  with (out/'postgres-stop.log').open('w') as f:
   stopped=subprocess.run([str(pg/'pg_ctl'),'-D',str(temp/'data'),'-m','fast','-w','stop'],stdout=f,stderr=subprocess.STDOUT)
   result['postgres_stop_exit']=stopped.returncode
 result['ended_utc']=datetime.datetime.now(datetime.timezone.utc).isoformat()
 (out/'http-run-result.json').write_text(json.dumps(result,indent=2)+'\n')
 if not started or result.get('postgres_stop_exit')==0:shutil.rmtree(temp)
 print(json.dumps(result),flush=True)
