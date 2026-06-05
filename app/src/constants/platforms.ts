export type Platform =
  | 'x'
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'youtube'
  | 'linkedin'
  | 'threads';

export type ContentType = 'visual' | 'text' | 'both';

/** Platforms that accept video/image payloads (no standalone text posts) */
export const VISUAL_PLATFORMS: Platform[] = ['tiktok', 'instagram', 'youtube'];

/** Platforms that accept text (and optionally media) */
export const TEXT_PLATFORMS: Platform[] = ['x', 'linkedin', 'facebook', 'threads'];

export const PLATFORM_META: Record<
  Platform,
  { labelAr: string; color: string; contentType: ContentType }
> = {
  x:         { labelAr: 'إكس (تويتر)',    color: '#000000', contentType: 'both'   },
  instagram: { labelAr: 'إنستغرام',       color: '#E1306C', contentType: 'visual' },
  facebook:  { labelAr: 'فيسبوك',         color: '#1877F2', contentType: 'both'   },
  tiktok:    { labelAr: 'تيك توك',        color: '#010101', contentType: 'visual' },
  youtube:   { labelAr: 'يوتيوب شورتس',   color: '#FF0000', contentType: 'visual' },
  linkedin:  { labelAr: 'لينكد إن',        color: '#0A66C2', contentType: 'text'   },
  threads:   { labelAr: 'ثريدز',          color: '#101010', contentType: 'both'   },
};
