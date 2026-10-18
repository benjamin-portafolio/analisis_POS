import json
import pathlib
import re
from decimal import Decimal, ROUND_HALF_UP

ROOT=pathlib.Path(__file__).parent
source=json.loads((ROOT/'transcripcion.json').read_text())
assert len(source)==85

def gtin_ok(code):
    if not re.fullmatch(r'\d{12,13}',code):
        return False
    return sum(int(n)*(3 if i%2==0 else 1) for i,n in enumerate(code[-2::-1]))%10 == (-int(code[-1]))%10

gb=[]
ch=[]
for file in ROOT.glob('granbodega*.json'):
    gb.extend(json.loads(file.read_text()))
for file in ROOT.glob('chedraui*.json'):
    ch.extend(json.loads(file.read_text()))

def details(p, store):
    item=p['items'][0]
    codes=[]
    if store=='Chedraui':
        codes=[c for field in p.get('MultiEan',[]) for c in field.split('-')]
    else:
        codes=[item['ean']]
    valid=list(dict.fromkeys(c for c in codes if gtin_ok(c)))
    valid.sort(key=lambda c:(not c.startswith('750'), len(c)!=12))
    return {'source_product':p['productName'],'barcode':valid[0] if valid else '',
        'price':item['sellers'][0]['commertialOffer']['Price'],
        'price_url':p['link'],'barcode_url':p['link'] if valid else '',
        'store':store,'consulted':'2026-10-16','notes':'','price_basis':'Precio publicado por pieza'}

ch_by_id={p['productId']:p for p in ch}
selection={
 '3:SP5132':'3363316', '3:SP5133':'3363318',
 '4:SP4345':'3417319', '5:100':'3140581',
 '7:SP472':'3042975', '8:SP451:Ensalada':'3043617', '8:SP417':'3140656',
 '10:SP596':'3090550', '10:SP507':'3090551', '10:2117':'3043029',
 '10:SP592':'3181703', '11:SP8374:Jarabe':'3360555', '11:SP8170':'3173931',
 '12:SP339':'3043832', '16:200314':'3833433', '16:200319':'3833431',
 '17:300211':'3442200', '18:400249':'3701893', '18:400257':'3803316', '19:501208':'3405345',
}

records=[]
for idx,(page,code,name,pack,ean) in enumerate(source,1):
    r={'id':idx,'page':page,'internal_code':code,'name':name,'pack':pack,'barcode':'','price':None,
       'price_url':'','barcode_url':'','store':'','consulted':'','notes':'','source_product':'','price_basis':''}
    for p in gb:
        if ean and p['items'][0]['ean']==ean:
            r.update(details(p,'La Gran Bodega'))
            assert r['barcode']==ean
            break
    k=f'{page}:{code}'
    for k2,pid in selection.items():
        if k2==k or (k2.startswith(k+':') and k2.split(':')[-1] in name):
            r.update(details(ch_by_id[pid],'Chedraui'))
    if page==4 and code=='SP4346':
        p=next(p for p in gb if p['items'][0]['ean']=='7501017004003')
        r.update(details(p,'La Gran Bodega'))
        r['notes']='El PDF dice SP4346, pero su foto indica 380 g; SP4346 aparece en comercios como 340 g. Se usa el EAN de la presentación de 380 g, según la foto.'
    if page==8 and code=='SP567':
        r['notes']='El PDF muestra SP567; se identifica por nombre y peso de la foto: ensalada de verduras de 220 g.'
    if page==8 and code=='SP451':
        r['notes']='SP451 está repetido en el PDF para elote y ensalada. Se distinguen por nombre y código EAN.'
    if page==11 and code=='SP8374':
        r['notes']='SP8374 está repetido en el PDF para jarabe maple y Choco Kiwi. Se identifican por nombre y presentación.'
    records.append(r)

# Retail pages and Shopify prices checked separately from VTEX catalog data.
manual={
 '5:1004':{'price':111.0,'barcode':'7501017020041','store':'Básicos','price_url':'https://www.basicos.mx/chiles-jalape%C3%B1o-la-coste%C3%B1a-365-kgs','barcode_url':'https://www.basicos.mx/chiles-jalape%C3%B1o-la-coste%C3%B1a-365-kgs','notes':'Precio del tramo de una pieza; no se usa el descuento de tres piezas.'},
 '5:1024':{'price':169.0,'barcode':'7501017020249','store':'Básicos','price_url':'https://www.basicos.mx/chiles-la-coste%C3%B1a-en-rajas-38-kgs','barcode_url':'https://www.basicos.mx/chiles-la-coste%C3%B1a-en-rajas-38-kgs','notes':'Precio del tramo de una pieza; no se usa el descuento de tres piezas.'},
 '6:SP4557':{'price':13.0,'store':'Walmart','price_url':'https://www.walmart.com.mx/ip/Frijoles-negros-La-Costena-refritos-430-g/00750101704293','notes':'Sin EAN confirmado para bolsa de 430 g. No se reutiliza el de 400 g o 440 g.'},
 '6:SP4558':{'price':13.0,'store':'Walmart','price_url':'https://www.walmart.com.mx/ip/frijoles-bayos-la-costena-refritos-430-g/00750101704292','notes':'Sin EAN confirmado para bolsa de 430 g. No se reutiliza el de 400 g o 440 g.'},
 '7:SP4809':{'price':133.5,'store':'La Valenciana','price_url':'https://valenciana.com.mx/products/salsa-de-tomate-para-aderezar-la-costena-4-kg'},
 '7:286':{'price':96.5,'store':'La Valenciana','price_url':'https://valenciana.com.mx/products/pure-de-tomate-en-bolsa-la-costena-3-kg'},
 '7:188':{'price':128.5,'store':'La Valenciana','price_url':'https://valenciana.com.mx/products/salsa-para-pizza-en-bolsa-la-costena-3-kg'},
 '9:133':{'price':306.0,'store':'La Valenciana','price_url':'https://valenciana.com.mx/products/mayonesa-con-jugo-de-limon-la-costena-3-6-kg'},
 '10:SP306':{'price':16.0,'store':'H-E-B','price_url':'https://www.heb.com.mx/la-costena-vinagre-blanco-alcohol-de-cana-botella-1-05-l-4040/p','notes':'Precio de la presentación de 1.05 l. No se incorpora el EAN de un registro de 1 l.'},
 '11:SP8169':{'price':16.0,'store':'Walmart','price_url':'https://www.walmart.com.mx/ip/harina-para-hot-cakes-pronto-tradicionales-350-g/00750120048312','notes':'Precio publicado en promoción; precio previo anunciado: 26.00 MXN.'},
 '11:SP8374:Choco':{'price':34.9,'barcode':'7501200485022','store':'Básicos','price_url':'https://www.basicos.mx/chocolate-en-polvo-choco-kiwi-350-grs','barcode_url':'https://www.basicos.mx/chocolate-en-polvo-choco-kiwi-350-grs'},
 '13:8753':{'price':9.2,'store':'Ofix','price_url':'https://www.ofix.mx/nutret-barra-rellena-de-fresa-40grs---marian-613103/p','notes':'La ficha describe una barra de 40 g; no se copia el EAN de la caja de 200 g.'},
 '15:200538':{'price':11.5,'store':'Farmacias Guadalajara','price_url':'https://www.farmaciasguadalajara.com/alimentos/papas-y-frituras/botana-totis-donitas-limon-y-sal--28-gr.-1394134.html'},
 '15:200540':{'price':11.5,'store':'Farmacias Guadalajara','price_url':'https://www.farmaciasguadalajara.com/alimentos/papas-y-frituras/botana-totis-donitas-chile-y-limon--28-gr.-1394142.html'},
}
for r in records:
    k=f"{r['page']}:{r['internal_code']}"
    for key,value in manual.items():
        if key==k or (key.startswith(k+':') and key.split(':')[-1] in r['name']):
            previous_notes=r['notes']
            r.update(value)
            r['notes']=' '.join(dict.fromkeys(n for n in [previous_notes,value.get('notes','')] if n))
            r['consulted']='2026-10-18' if key in ['5:1004','5:1024','10:SP306','15:200538','15:200540'] else '2026-10-16'
            r['price_basis']='Precio publicado por pieza'
    r['reference_pack_price']=None
    r['reference_pack_units']=None
    r['reference_unit_price']=None
    r['reference_pack_url']=''
    r['pending_reason']=''
    if r['id']==41:
        r['barcode']='7501017005123'
        r['barcode_url']='https://www.elcorteingles.es/supermercado/B001018010000364-la-costena-salsa-mexicana-verde-lata-220-g/'
        r['consulted']='2026-10-18'
        r['pending_reason']='Se confirmó EAN de lata de 220 g; no se encontró precio verificable en MXN.'
    if r['id'] in [72,73,74]:
        product=json.loads((ROOT/'top-tops.json').read_text())
        variant=product['variants'][r['id']-72]
        r['reference_pack_price']=float(variant['price'])
        r['reference_pack_units']=40
        r['reference_unit_price']=float((Decimal(variant['price'])/40).quantize(Decimal('0.01'),rounding=ROUND_HALF_UP))
        r['reference_pack_url']='https://chefmart.com.mx/products/top-tops?variant='+str(variant['id'])
        r['consulted']='2026-10-16'
        r['pending_reason']='Sólo se encontró precio por caja de 40 bolsas; fijar precio de venta por bolsa. El importe unitario de referencia no incluye margen.'
    if r['id']==58:
        r['reference_pack_price']=36.0
        r['reference_pack_units']=5
        r['reference_unit_price']=7.2
        r['reference_pack_url']='https://www.walmart.com.mx/ip/barras-nutret-marian-rellenas-de-pina-40g-c-u/00002089908022'
        r['pending_reason']='Referencia de caja de cinco barras, no de barra individual. Definir venta por barra y confirmar su EAN; no copiar el EAN de la caja.'
    if r['id']==59:
        r['pending_reason']='Gramaje no legible en el PDF; existen paquetes de 52 g, 105 g y 210 g. Confirmar presentación antes de asignar precio y EAN.'
    if r['id']==60:
        r['pending_reason']='Confirmar gramaje y cantidad de sticks del bote; el PDF no los permite leer.'
    if r['id'] in [64,65]:
        r['pending_reason']='Confirmar material, color y venta por paquete de 50 vasos o por caja de 1000 vasos. Sin precio y EAN de la presentación exacta.'
    if r['id']==66:
        r['reference_pack_price']=15.5
        r['reference_pack_units']=1
        r['reference_unit_price']=15.5
        r['reference_pack_url']='https://www.walmart.com.mx/ip/botana-quetotis-twisters-queso-y-chile-100-g/00750036600455'
        r['consulted']='2026-10-18'
        r['pending_reason']='La ficha encontrada titula 100 g, pero su especificación indica 80 g; confirmar la bolsa antes de incorporar este precio.'
    if r['price'] is None and not r['pending_reason']:
        r['pending_reason']='No se encontró precio verificable de la presentación exacta; completar precio de venta.'
    if r['price'] is not None:
        assert r['price']>0 and r['price_url']
    if r['barcode']:
        assert gtin_ok(r['barcode']) and r['barcode_url']
    r['status']='Listo para importar' if r['price'] else 'Pendiente de precio o presentación'
    if r['price'] and not r['barcode']:
        r['notes']=' '.join(n for n in [r['notes'],'Código de barras sin verificar; se deja vacío.'] if n)

(ROOT/'datos_reconciliados.json').write_text(json.dumps(records,ensure_ascii=False,indent=2))
print('Total:',len(records),'con precio:',sum(bool(r['price']) for r in records),'con código:',sum(bool(r['barcode']) for r in records))
print('Pendientes:')
for r in records:
    if not r['price']:
        print(r['id'],r['page'],r['internal_code'],r['name'])
