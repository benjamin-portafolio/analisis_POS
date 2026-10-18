import json
import re
from pathlib import Path

scratch = Path(__file__).resolve().parent
baseline = json.loads((scratch / 'validacion.json').read_text())
refs = {r['referencia']: r for r in baseline['referencias']}
verified = {}


def valid_gtin(code):
    if not re.fullmatch(r'(?:\d{8}|\d{12}|\d{13}|\d{14})', code):
        return False
    body_sum = sum(int(n) * (3 if i % 2 == 0 else 1)
                   for i, n in enumerate(code[-2::-1]))
    return (10 - body_sum % 10) % 10 == int(code[-1])


def add(ref, code, url, description, evidence_file, note=''):
    assert ref in refs, ref
    assert valid_gtin(code), (ref, code)
    assert code in (scratch / evidence_file).read_text(), (ref, code, evidence_file)
    assert ref not in verified, ref
    verified[ref] = {
        **refs[ref], 'codigo_barras': code, 'fuente': url,
        'producto_en_fuente': description, 'evidencia': evidence_file,
        'nota': note,
    }


def from_candidates(filename, approved):
    candidates = json.loads((scratch / filename).read_text())
    for ref in approved.split():
        matches = [p for p in candidates if ref in p['refs']]
        assert len(matches) >= 1, ref
        source = matches[0]
        # El código se toma literalmente del catálogo del vendedor; el número
        # de referencia solo ayuda a localizarlo, no genera ningún GTIN.
        codes = [c for c in source['codigos']
                 if len(c) == 13 and c.startswith('750104')
                 and str(int(c[7:-1])) == ref and valid_gtin(c)]
        assert len(set(codes)) == 1, (ref, codes)
        add(ref, codes[0], source['link'], source['nombre'],
            source['archivo'])


from_candidates('candidatos_chedraui.json', '''
9757 9008 9012 9002 9702 9009 9285 9442 9256 9286 9278 7019
992 307 763 3411 8371 4453 341 116 360 889 4458 474 890 4525
7229 4773 8147 8004 8313 8225 9553 9608 9728 9727 9867 9866
9594 9016 9259 9257 9258 9085
''')
from_candidates('candidatos_bodega.json', '''
8388 8380 8381 4515 9076 9607 9140 9122 9187 9592 9288 9123
''')

maggs = 'https://sierraserver.no-ip.org/SOPORTEMXL/MAGGS%20DAGAL/Catalogo_Productos%20upc%20sku%20maggs.pdf'
for ref, code, description in [
    ('21', '7501040023545', 'Jamón Fud pavo y cerdo americano 170 g'),
    ('805', '7501040005428', 'Tocino Fud 250 g'),
    ('9087', '7501040090875', 'Yoplait fresas naturales 145 g'),
    ('9095', '7501040090950', 'Yoplait fresas naturales 442 g'),
    ('8628', '7622210265999', 'Queso Philadelphia 90 g'),
]:
    add(ref, code, maggs, description, 'fuente_maggs.txt')

batidos = 'https://www.michedraui.com.mx/tyc/2023/2024/2023/tablas/02-febrero/productos/productos-participantes-yoghurts-batidos-febrero-2023.html'
for ref, code, description in [
    ('9284', '7501040092848', 'Yoghurt Yoplait batido griego moras 145 g'),
    ('9545', '7501040095450', 'Yoghurt Yoplait batido Placer ChOreo 125 g'),
    ('9069', '7501040090691', 'Yoghurt Yoplait batido frutas cereales 442 g'),
    ('9096', '7501040090967', 'Yoghurt Yoplait batido natural 442 g'),
    ('9239', '7501040092398', 'Yoghurt Yoplait batido durazno 442 g'),
]:
    add(ref, code, batidos, description, 'fuente_chedraui_batidos.txt')

add('9383', '7501040093838',
    'https://www.basicos.mx/yoghurt-yoplait-con-granola-330-grs',
    'Yoghurt Yoplait con granola 330 g', 'web_basicos9383.html')
add('430528', '7501024529421',
    'https://www.basicos.mx/chocolate-hersheys-mini-surtido-850-grs',
    "Hershey's mini surtido 850 g, 125 piezas de 6.8 g", 'web_basicos850.html')

coffee = json.loads((scratch / 'vtex_chedraui_cafe_ole_0.json').read_text())
for ref, code in [('7001', '7503001453187'),
                  ('7002', '7503001453200'),
                  ('7003', '7503001453194')]:
    p = next(p for p in coffee if code in p.get('MultiEan', []))
    add(ref, code, p['link'], p['productName'],
        'vtex_chedraui_cafe_ole_0.json')

# Esta referencia no tiene un gramaje en la ficha original. El fabricante
# identifica el mismo sabor caramelo mediante la referencia 7026, 281 ml.
verified['7026'] = {
    **refs['7026'], 'codigo_barras': '7501040070266',
    'fuente': 'https://infocode.io/01/07501040070266',
    'producto_en_fuente': 'Bebida de café Café Olé cappuccino caramelo 281 ml',
    'evidencia': 'Fuente GS1 Infocode consultada mediante navegador web',
    'nota': 'GTIN publicado en el identificador de la ficha GS1 del producto.',
}
assert valid_gtin(verified['7026']['codigo_barras'])

pelon = json.loads((scratch / 'vtex_lagranbodega_pelon_0.json').read_text())
p = next(p for p in pelon if 'peloneta' in p['productName'].lower())
add('430509', p['items'][0]['ean'], p['link'], p['productName'],
    'vtex_lagranbodega_pelon_0.json')

# La ficha agrupa nuez y granola. La referencia 9319 aparece documentada
# como licuado de fresa y granola del mismo tamaño, pero el nombre actual
# de la fila incluye nuez. Se deja pendiente para no asociar otro sabor.
# Lo mismo ocurre con Kids 9732 (Cookies & Cream frente a "fresa").

codes = [v['codigo_barras'] for v in verified.values()]
assert len(set(codes)) == len(codes)
pending = [{**r, 'motivo': 'No se confirmó un GTIN de la presentación exacta.'}
           for ref, r in refs.items() if ref not in verified]
summary = {
    'fecha_verificacion': '2026-10-15',
    'filas': len(refs), 'con_codigo': len(verified),
    'sin_codigo': len(pending),
    'criterio': 'Marca, producto y presentación exacta. Sin generar GTIN ni usar códigos de báscula o de cajas con otra cantidad.',
    'verificados': list(verified.values()), 'pendientes': pending,
}
(scratch / 'codigos_verificados.json').write_text(
    json.dumps(summary, ensure_ascii=False, indent=2))
print(json.dumps({k: v for k, v in summary.items()
                  if k not in ('verificados', 'pendientes')}, ensure_ascii=False))
