import json,os,pathlib,subprocess,time,datetime
runtime=pathlib.Path(pathlib.Path('/tmp/pos-phase7-runtime-path').read_text())
server=json.loads((runtime/'http.json').read_text());tracking=json.loads((runtime/'tracking-http.json').read_text())
evidence=pathlib.Path('/Users/benjamin/Library/CloudStorage/GoogleDrive-benjamin94833@gmail.com/My Drive/Projects/POS/analisis /08 - Roadmap/Proveedores de productos/Evidencia/2026-10-08-fase7')
root='/Users/benjamin/Projects/POS/pos_flutter'
extra={'POS_SUPPLIER_SYNC_URL':server['url'],'POS_PHASE3_SYNC_URL':tracking['url'],'POS_SUPPLIER_PG_SCHEMA':server['schema'],'DATABASE_HOST':'127.0.0.1','DATABASE_PORT':'60937','DATABASE_USER':'phase7','DATABASE_NAME':'pos_nest_test_suppliers_phase7'}
records=[]
for key,cmd,env in [('analyze-final',['dart','analyze'],{}),('flutter-final',['flutter','test','--reporter','json'],extra),('flutter-diffcheck',['git','diff','--check'],{})]:
 t=time.time()
 with (evidence/(('flutter-suite-final.json' if key=='flutter-final' else key+'.log'))).open('w') as output,(evidence/(key+'.stderr.log')).open('w') as err:
  completed=subprocess.run(cmd,cwd=root,env=os.environ|env,stdout=output,stderr=err)
 records.append({'name':key,'cwd':root,'argv':cmd,'environment':env,'exit_code':completed.returncode,'duration_seconds':round(time.time()-t,3),'started_utc':datetime.datetime.fromtimestamp(t,datetime.timezone.utc).isoformat()})
 (evidence/'verification-commands.json').write_text(json.dumps(records,indent=2)+'\n')
 print(key,completed.returncode,flush=True)
 if completed.returncode:break
