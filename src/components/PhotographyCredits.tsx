import { ChevronDown, ExternalLink } from 'lucide-react';
import { useCms } from '../data/store';

export default function PhotographyCredits() {
  const { config } = useCms();
  const photos = Object.values(config.media);

  return (
    <details id="photography-credits" className="group mt-10 border-t border-edge/50">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-sm font-semibold text-mist transition-colors hover:text-goldbright [&::-webkit-details-marker]:hidden">
        Photography & sources
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="pb-5">
        <p className="max-w-3xl text-xs leading-relaxed text-dusk">
          Authentic reference photography, selected for each mineral species.
          Backgrounds have been isolated and images resized for a consistent presentation.
          Original specimen colors are preserved. Adapted photographs remain available under
          their respective licenses.
        </p>
        <ul className="mt-6 grid gap-x-10 sm:grid-cols-2">
          {photos.map((photo) => {
            const hasSource = photo.sourceUrl?.startsWith('http');
            const hasLic = photo.licenseUrl?.startsWith('http');
            return (
              <li key={photo.id} className="border-b border-edge/35 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {hasSource ? (
                    <a href={photo.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-semibold text-ivory hover:text-goldbright">
                      {photo.subject}
                      <ExternalLink className="h-3 w-3 text-dusk" aria-hidden />
                    </a>
                  ) : (
                    <span className="text-xs font-semibold text-ivory">{photo.subject}</span>
                  )}
                  {hasLic ? (
                    <a href={photo.licenseUrl} target="_blank" rel="noreferrer" className="text-[10px] text-orchid underline decoration-orchid/40 underline-offset-2 hover:text-goldbright">
                      {photo.license}
                    </a>
                  ) : (
                    <span className="text-[10px] text-orchid">{photo.license || 'Gallery Archive'}</span>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-dusk">{photo.author}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </details>
  );
}
