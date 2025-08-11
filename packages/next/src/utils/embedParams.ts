import { parseToHsla } from 'color2k';

export type ImageListParam = {
  objectFit?: 'contain' | 'cover';
  maxHeight?: string;
  height?: string;
  aspectRatio?: string;
};

export type MapSizeParam = {
  maxHeight?: string;
  height?: string;
  aspectRatio?: string;
};

const sortValues = [
  'timings.asc',
  'timingsWithFeatured.asc',
  'lastTiming.asc',
  'lastTimingWithFeatured.asc',
  'updatedAt.desc',
  'updatedAt.asc',
  'location.name.asc',
  'location.city.asc',
  'location.region.asc',
  'location.countryCode.asc',
  'location.department.asc',
  'location.adminLevel1.asc',
  'location.adminLevel2.asc',
  'location.adminLevel3.asc',
  'location.adminLevel4.asc',
  'location.adminLevel5.asc',
  'location.adminLevel6.asc',
  'location.district.asc',
  'location.name.desc',
  'location.city.desc',
  'location.region.desc',
  'location.countryCode.desc',
  'location.department.desc',
  'location.adminLevel1.desc',
  'location.adminLevel2.desc',
  'location.adminLevel3.desc',
  'location.adminLevel4.desc',
  'location.adminLevel5.desc',
  'location.adminLevel6.desc',
  'location.district.desc',
] as const;

type SortParam = (typeof sortValues)[number];

const baseUrlTargetValues = ['_blank', '_parent', '_top'] as const;

type BaseUrlTarget = (typeof baseUrlTargetValues)[number];

type LogoParam = 'display' | 'hide';

export type EmbedParams = {
  filters?: any;
  baseUrl?: string;
  baseUrlTarget?: BaseUrlTarget;
  primaryColor?: string;
  secondaryColor?: string;
  imageList?: ImageListParam;
  mapSize?: MapSizeParam;
  sort?: SortParam;
  displayTotal?: boolean;
  exportModal?: boolean;
  logo?: LogoParam;
};

function validateBaseUrlTarget(value: string): BaseUrlTarget | null {
  if (baseUrlTargetValues.includes(value as BaseUrlTarget)) {
    return value as BaseUrlTarget;
  }
  return null;
}

function parseAndValidateColor(value: string): string | null {
  try {
    parseToHsla(value);
    return value;
  } catch {
    return null;
  }
}

function parseImageList(value: string): ImageListParam | null {
  if (typeof value !== 'string') return null;

  try {
    const result: Record<string, string> = {};

    const entries = value.split(';');

    for (const entry of entries) {
      const [key, val] = entry.split(':');
      if (val === undefined) {
        if (key === 'contain' || key === 'cover') {
          result.objectFit = key;
        }
        continue;
      }

      if (key === 'ratio') {
        result.aspectRatio = val;
      } else if (key === 'height') {
        result.height = val;
      } else if (key === 'maxHeight') {
        result.maxHeight = val;
      }
    }
    return Object.keys(result).length > 0 ? result : null;
  } catch {
    return null;
  }
}

function parseMapSize(value: string): MapSizeParam | null {
  if (typeof value !== 'string') return null;

  try {
    const result: Record<string, string> = {};

    const entries = value.split(';');

    for (const entry of entries) {
      const [key, val] = entry.split(':');
      if (key === 'ratio') {
        result.aspectRatio = val;
      } else if (key === 'height') {
        result.height = val;
      } else if (key === 'maxHeight') {
        result.maxHeight = val;
      }
    }
    return Object.keys(result).length > 0 ? result : null;
  } catch {
    return null;
  }
}

export function validateSort(value: string): SortParam | null {
  if (sortValues.includes(value as SortParam)) {
    return value as SortParam;
  }
  return null;
}

function parseAndValidateDisplayTotal(value: string): boolean | null {
  if (value === '0' || value === 'false') {
    return false;
  }
  if (value === '1' || value === 'true') {
    return true;
  }
  return null;
}

function parseAndValidateExportModal(value: string): boolean | null {
  if (value === '0' || value === 'false') {
    return false;
  }
  if (value === '1' || value === 'true') {
    return true;
  }
  return null;
}

function parseAndValidateLogo(value: string): LogoParam {
  return value === 'hide' ? 'hide' : 'display';
}

const noopParser = (v: unknown): unknown => v;

const parsers = {
  filters: noopParser,
  baseUrl: noopParser,
  baseUrlTarget: validateBaseUrlTarget,
  primaryColor: parseAndValidateColor,
  secondaryColor: parseAndValidateColor,
  imageList: parseImageList,
  mapSize: parseMapSize,
  sort: validateSort,
  displayTotal: parseAndValidateDisplayTotal,
  exportModal: parseAndValidateExportModal,
  logo: parseAndValidateLogo,
};

export const extractParams = (source: Record<string, string>): EmbedParams => {
  const result = {};

  for (const key in source) {
    const parser = parsers[key];

    if (!parser) {
      continue;
    }

    const parsedValue = parser(source[key]);
    if (parsedValue !== null) {
      // invalid
      result[key] = parsedValue;
    }
  }
  return result;
};

export function omitParams(query: Record<string, any>): Record<string, any> {
  const result = { ...query };

  delete result.initPath;

  for (const key in parsers) {
    delete result[key];
  }

  return result;
}
