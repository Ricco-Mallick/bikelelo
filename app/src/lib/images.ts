import imagesJson from '@/data/images.json'

export interface ImageCredit {
  url: string
  source_page: string
  author: string
  license: string
  title: string
  /**
   * Set when the available free photo shows a different model year or
   * generation than the catalogue entry, so the UI can say so rather than
   * implying it is the current bike.
   */
  note?: string
}

interface ImagesFile {
  images: Record<string, ImageCredit>
  generated_at: string
}

/**
 * Real photographs of specific models, sourced from Wikimedia Commons and
 * filtered to freely-licensed files only (CC0 / public domain / CC BY / CC BY-SA;
 * no NC or ND). Models without a suitable free photo keep the drawn BikeArt
 * fallback rather than showing a wrong or unlicensed picture.
 */
export const MODEL_IMAGES: Record<string, ImageCredit> = (imagesJson as ImagesFile).images

export function imageCredit(modelSlug: string): ImageCredit | undefined {
  return MODEL_IMAGES[modelSlug]
}

/** True when every credit carries the attribution a Creative Commons licence requires. */
export function creditIsComplete(credit: ImageCredit): boolean {
  return Boolean(credit.author && credit.license && credit.source_page)
}
