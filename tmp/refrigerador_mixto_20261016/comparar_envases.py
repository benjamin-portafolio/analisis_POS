import concurrent.futures
import io
import json
from pathlib import Path
import urllib.request
from PIL import Image, ImageDraw

ids = ['3610379', '3641746', '3698157', '3660515', '3708135', '3750583', '3302389']
products = [p for r in json.loads(Path('tmp/refrigerador_mixto_20261016/catalogos.json').read_text()) for p in r.get('products', [])]
selected = [next(p for p in products if p['url'].endswith('-' + i + '/p')) for i in ids]

def fetch(product):
    with urllib.request.urlopen(product['items'][0]['image'], timeout=20) as response:
        img = Image.open(io.BytesIO(response.read())).convert('RGB')
    img.thumbnail((230, 350))
    return img

with concurrent.futures.ThreadPoolExecutor(max_workers=7) as pool:
    images = list(pool.map(fetch, selected))
canvas = Image.new('RGB', (250 * len(images), 420), 'white')
draw = ImageDraw.Draw(canvas)
for i, (p, img) in enumerate(zip(selected, images)):
    canvas.paste(img, (250*i + (250-img.width)//2, 30))
    label = p['nombre'].replace('Bebida Energizante ', '').replace('Cerveza ', '')
    draw.text((250*i+6, 385), label[:34], fill='black')
canvas.save('tmp/refrigerador_mixto_20261016/comparacion_envases.jpg')
