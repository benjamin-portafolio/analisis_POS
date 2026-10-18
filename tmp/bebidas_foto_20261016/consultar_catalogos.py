import concurrent.futures
import json
from pathlib import Path
import urllib.parse
import urllib.request

QUERIES = ['Manzanita', 'Sangria Casera', 'Jumex Fresh']

def fetch(query):
    url = 'https://www.chedraui.com.mx/api/catalog_system/pub/products/search/?ft=' + urllib.parse.quote(query) + '&_from=0&_to=49'
    try:
        with urllib.request.urlopen(url, timeout=30) as r:
            data = json.load(r)
        return {'query': query, 'api_url': url, 'products': [{
            'nombre': p.get('productName'), 'url': p.get('link'),
            'items': [{'ean': i.get('ean'), 'price': i.get('sellers', [{}])[0].get('commertialOffer', {}).get('Price'),
                       'image': i.get('images', [{}])[0].get('imageUrl')} for i in p.get('items', [])]
        } for p in data]}
    except Exception as e:
        return {'query': query, 'error': str(e)}

with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    results = list(pool.map(fetch, QUERIES))
path = Path('tmp/bebidas_foto_20261016/catalogos_chedraui.json')
previous = json.loads(path.read_text())
path.write_text(json.dumps(previous + results, ensure_ascii=False, indent=2))
for result in results:
    print(json.dumps(result, ensure_ascii=False))
