import concurrent.futures
import json
from pathlib import Path
import urllib.parse
import urllib.request

queries = ['Nescafe Clasico', 'Coffee Mate', 'Cappuccino Original', 'McCormick Mermelada', 'McCormick Te', 'Valentina', 'Pure Costena', 'Pronto Flan', 'Dolca', 'Dona Maria Mole', 'Kola Loka', 'Cerillos Clasicos', 'Cristal Aceite', 'Aceite 123', 'Botanera', 'Choco Milk', 'Cafe Legal', 'Nutella']

def fetch(query):
    url = 'https://www.chedraui.com.mx/api/catalog_system/pub/products/search/?ft=' + urllib.parse.quote(query) + '&_from=0&_to=49'
    try:
        with urllib.request.urlopen(url, timeout=35) as response:
            products = json.load(response)
        return {'query': query, 'api_url': url, 'products': [{
            'nombre': p.get('productName'), 'url': p.get('link'),
            'items': [{'ean': i.get('ean'), 'price': i.get('sellers', [{}])[0].get('commertialOffer', {}).get('Price'),
                       'images': [im.get('imageUrl') for im in i.get('images', [])]} for i in p.get('items', [])]
        } for p in products]}
    except Exception as error:
        return {'query': query, 'error': str(error)}

with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    results = list(pool.map(fetch, queries))
Path('tmp/abarrotes_fotos_20261019/catalogos.json').write_text(json.dumps(results, ensure_ascii=False, indent=2))
for result in results:
    print(json.dumps({'query':result['query'],'error':result.get('error'),'products':result.get('products',[])},ensure_ascii=False))
