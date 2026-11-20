"""Prepare the licensed source images cached in .cache/mineral-photos.

Offline preparation only; the website serves the resulting local WebP files.
Requires Pillow, rembg[cpu], and the source metadata recorded with the assets.
"""

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path('.cache/python')))

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from rembg import new_session, remove
from scipy import ndimage


SOURCES = {
    'amethyst': 'amethyst-b',
    'rhodochrosite': 'rhodo-a',
    'meteorite': 'meteorite-a',
    'gold': 'gold-a',
    'aquamarine': 'aquamarine-c',
    'malachite': 'malachite-a',
    'fluorite': 'fluorite-b',
    'bismuth': 'bismuth',
    'azurite': 'azurite-d',
    'willemite': 'willemite-b',
}


def plain(value):
    return re.sub(r'<[^>]+>', '', value).strip()


def main():
    cache = Path('.cache/mineral-photos')
    output = Path('src/assets/specimens')
    output.mkdir(parents=True, exist_ok=True)
    metadata = json.loads((cache / 'metadata.json').read_text())
    session = new_session('u2netp')
    credits = {}
    sheet = Image.new('RGB', (1400, 560), '#241d41')
    draw = ImageDraw.Draw(sheet)

    for index, (name, alias) in enumerate(SOURCES.items()):
        image = Image.open(cache / f'{alias}.jpg').convert('RGB')
        # Exclude the display furniture, never the specimen itself.
        if name == 'meteorite':
            image = image.crop((90, 118, 400, 685))
        image.thumbnail((1100, 1400), Image.Resampling.LANCZOS)
        cutout = remove(image, session=session)
        alpha = np.array(cutout.getchannel('A'))
        components, count = ndimage.label(alpha > 64)
        if count:
            sizes = np.bincount(components.ravel())
            sizes[0] = 0
            specimen = components == sizes.argmax()
            if name == 'aquamarine':
                specimen = ndimage.binary_fill_holes(specimen)
            # Segmentation confidence is not optical transparency: keep the stone opaque.
            alpha = specimen.astype('uint8') * 255
        matte = Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(0.6))
        cutout = image.convert('RGBA')
        cutout.putalpha(matte)
        bounds = cutout.getbbox()
        if not bounds:
            raise ValueError(f'No specimen found in {name}')
        cutout = cutout.crop(bounds)
        cutout.save(output / f'{name}.webp', 'WEBP', quality=90, method=6)
        preview = cutout.copy()
        preview.thumbnail((440, 440), Image.Resampling.LANCZOS)
        preview.save(output / f'{name}-card.webp', 'WEBP', quality=87, method=6)

        info = metadata[alias]
        extra = info['extmetadata']
        credits[name] = {
            'title': info['title'],
            'author': plain(extra.get('Artist', {}).get('value', 'See source')),
            'credit': plain(extra.get('Attribution', {}).get('value', '')),
            'license': extra.get('LicenseShortName', {}).get('value', ''),
            'licenseUrl': extra.get('LicenseUrl', {}).get('value', ''),
            'sourceUrl': info['descriptionurl'],
            'description': plain(extra.get('ImageDescription', {}).get('value', '')),
            'changes': 'Background isolated, whitespace trimmed, resized and WebP encoded. Specimen colors unchanged.',
            'width': cutout.width,
            'height': cutout.height,
        }
        thumb = cutout.copy()
        thumb.thumbnail((220, 190), Image.Resampling.LANCZOS)
        x, y = (index % 5) * 280, (index // 5) * 280
        sheet.paste(thumb, (x + (280 - thumb.width) // 2, y + 30 + (190 - thumb.height) // 2), thumb)
        draw.text((x + 24, y + 242), name, fill='#f7c96b')
        print(name, f'{cutout.width}x{cutout.height}', (output / f'{name}-card.webp').stat().st_size, 'bytes/card')

    (output / 'sources.json').write_text(json.dumps(credits, indent=2, ensure_ascii=True))
    sheet.save('shots/photography-final-contact.jpg', quality=92)


if __name__ == '__main__':
    main()