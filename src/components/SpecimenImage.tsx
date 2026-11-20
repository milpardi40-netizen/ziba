import { useState, type CSSProperties } from 'react';
import { ImageOff } from 'lucide-react';
import type { SpecimenPhoto } from '../data/photography';
import { cn } from '../utils/cn';

type ImageVariant = 'card' | 'editorial' | 'compact' | 'feature' | 'hero' | 'detail' | 'stage';

export default function SpecimenImage({
  photo,
  variant = 'card',
  accent = '#b48cf2',
  className,
  priority = false,
}: {
  photo: SpecimenPhoto;
  variant?: ImageVariant;
  accent?: string;
  className?: string;
  priority?: boolean;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const large = variant === 'detail' || variant === 'hero' || variant === 'feature' || variant === 'stage';

  return (
    <div
      className={cn('specimen-image', `specimen-image--${variant}`, className)}
      style={{
        '--specimen-accent': accent,
        '--specimen-width': `${photo.width || 1200}px`,
        '--specimen-height': `${photo.height || 1200}px`,
      } as CSSProperties}
      data-photo={photo.id}
      data-image-variant={variant}
    >
      <span className="specimen-image__shadow" aria-hidden />
      <div className="specimen-image__subject">
        {failedSource === photo.src ? (
          <span role="img" aria-label={photo.alt} className="flex flex-col items-center gap-2 text-xs text-dusk">
            <ImageOff className="h-5 w-5" aria-hidden />
            {photo.subject}
          </span>
        ) : (
          <img
            key={photo.id}
            src={large ? photo.src : photo.thumbnail}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
            className="specimen-image__photo"
            onError={() => setFailedSource(photo.src)}
          />
        )}
      </div>
    </div>
  );
}

export function PhotoCredit({ photo, className }: { photo: SpecimenPhoto; className?: string }) {
  const hasExternalSource = photo.sourceUrl?.startsWith('http');
  const hasLicenseUrl = photo.licenseUrl?.startsWith('http');
  return (
    <span className={cn('block text-[10px] leading-relaxed text-dusk', className)}>
      Photo: {photo.author || 'Gallery Archive'}
      {hasExternalSource && (
        <>
          {' / '}
          <a href={photo.sourceUrl} target="_blank" rel="noreferrer" className="underline decoration-current/40 underline-offset-2 hover:text-goldbright">
            Source
          </a>
        </>
      )}
      {photo.license && (
        <>
          {' / '}
          {hasLicenseUrl ? (
            <a href={photo.licenseUrl} target="_blank" rel="noreferrer" className="underline decoration-current/40 underline-offset-2 hover:text-goldbright">
              {photo.license}
            </a>
          ) : (
            <span>{photo.license}</span>
          )}
        </>
      )}
    </span>
  );
}