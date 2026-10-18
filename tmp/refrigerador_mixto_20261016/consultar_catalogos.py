import concurrent.futures
import json
from pathlib import Path
import urllib.parse
import urllib.request

queries = ['New Mix', 'Amper', 'Volt', 'Corona Mega', 'Modelo Especial', 'Victoria', 'Red Cola', 'Jarrito']

def fetch(query):
    url = 'https://www.chedraui.com.mx/api/catalog_system/pub/products/search/?ft=' + urllib.parse.quote(query) + '&_from=0&_to=49'
    try:
        with urllib.request.urlopen(url, timeout=30) as response:
            products = json.load(response)
        return {'query': query, 'api_url': url, 'products': [{
            'nombre': p.get('productName'), 'url': p.get('link'),
            'items': [{'ean': i.get('ean'), 'price': i.get('sellers', [{}])[0].get('commertialOffer', {}).get('Price'),
                       'image': i.get('images', [{}])[0].get('imageUrl')} for i in p.get('items', [])]
        } for p in products]}
    except Exception as error:
        return {'query': query, 'error': str(error)}

with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    results = list(pool.map(fetch, queries))
Path('tmp/refrigerador_mixto_20261016/catalogos.json').write_text(json.dumps(results, ensure_ascii=False, indent=2))
for result in results:
    print(json.dumps(result, ensure_ascii=False))
