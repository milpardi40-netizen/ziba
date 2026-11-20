# Specimen Photography

The gallery uses ten authentic reference photographs instead of the original
generated specimen pictures. The approved fonts and gallery palette are unchanged.

## Presentation

- Collection: 168px image frames on desktop, 176px below 640px.
- Field notes: 184px image frames.
- Timeline: 144px image frames.
- Exhibition highlights: 240-340px image frames.
- Photographs use `object-fit: contain`, not cover cropping.
- Isolated specimens are centered with consistent breathing room and a subtle shadow.
- Detail views do not enlarge a photograph beyond its prepared native resolution.
- Hover movement respects `prefers-reduced-motion`.

`src/components/SpecimenImage.tsx` owns the shared presentation.
`src/data/photography.ts` maps the photographs to their subjects and licenses.
Card thumbnails and larger versions are separate, locally served WebP files.
No image hotlinking or runtime image API is required.

## Sources And Licenses

`src/assets/specimens/sources.json` records the original file, photographer,
source page, license, dimensions, and treatment for every photograph.
The site's footer contains the same photographer and license credits, with links
to the original source pages. The detail and article dialogs also include credits.
Adapted CC BY-SA photographs retain the corresponding source license.

The images are representative photographs of the mineral species, not evidence
of ownership of the fictional LITHOS catalog specimens. That distinction is
stated in the public photography credits.

Treatments: background isolation, removal of surrounding display furniture,
whitespace trimming, resizing, and WebP encoding. Original specimen colors are
not retouched. The UV console is explicitly labeled as a lighting visualization.

## Verification

```sh
npx tsc --noEmit
npm run build
node scripts/check-photography.mjs
node scripts/smoke.mjs
```

The photography checks cover image decoding, ten distinct specimen images,
contain-fit presentation, five viewport widths (320-1440px), compact media
heights, horizontal overflow, detail navigation, and all source/license credits.

`scripts/prepare-photography.py` is an offline asset-preparation utility.
It expects original source images and Wikimedia metadata in
`.cache/mineral-photos`, and requires Pillow, NumPy, SciPy, and rembg with an
ONNX runtime. None of these Python tools is a dependency of the website.