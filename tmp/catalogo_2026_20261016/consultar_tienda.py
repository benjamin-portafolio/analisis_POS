import concurrent.futures
import json
import pathlib
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).parent
queries = [('costeña',0,49),('costeña',50,99),('costeña',100,149),('pronto',0,49),('macma',0,49),('marian',0,49),('primo',0,49)]

def get(args):
    term, start, end = args
    url = 'https://www.chedraui.com.mx/api/catalog_system/pub/products/search?' + urllib.parse.urlencode({'ft':term,'_from':start,'_to':end})
    try:
        with urllib.request.urlopen(url,timeout=30) as response:
            products=json.load(response)
        (ROOT / f'chedraui_{term}_{start}.json').write_text(json.dumps(products,ensure_ascii=False,indent=2))
        rows=[]
        for product in products:
            for item in product['items']:
                offer=item['sellers'][0]['commertialOffer']
                if term != 'primo' or 'Vaso' in product['productName']:
                    rows.append({'id':product['productId'],'name':product['productName'],'url':product['link'],'ean':item['ean'],'multiEan':product.get('MultiEan'),'price':offer['Price']})
        return {'term':term,'start':start,'count':len(products),'rows':rows}
    except Exception as e:
        return {'term':term,'start':start,'error':str(e)}

results=list(concurrent.futures.ThreadPoolExecutor(5).map(get,queries))
(ROOT/'consultas_chedraui.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
for result in results:
    print(json.dumps(result,ensure_ascii=False))
