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
  contributionButton?: boolean;
  itemMinWidth?: `${number}px`;
  pageSize?: number;
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

function parseAndValidateItemMinWidth(value: string): `${number}px` | null {
  if (typeof value !== 'string') return null;

  const s = value.trim();

  // Must be <number>px, without space between the number and 'px'
  const m = /^([+-]?(?:\d+\.?\d*|\.\d+))px$/i.exec(s);
  if (!m) return null;

  let n = Number(m[1]);
  if (!Number.isFinite(n)) return null;

  // cannot be negative
  if (n < 0) return null;

  // Normalize -0 -> 0
  if (Object.is(n, -0)) n = 0;

  // Normalize textual representation without exponential or unnecessary zeros
  let numStr = m[1].replace(/^\+/, '');
  if (n === 0) {
    numStr = '0';
  } else {
    if (numStr.startsWith('.')) numStr = '0' + numStr; // ".5" -> "0.5"
    numStr = numStr.replace(/^0+(?=\d)/, ''); // "00012.340" -> "12.340"
    numStr = numStr.replace(/(\.\d*?[1-9])0+$/, '$1'); // "12.3400" -> "12.34"
    numStr = numStr.replace(/\.$/, ''); // "12." -> "12"
  }

  return `${numStr}px` as `${number}px`;
}

export function validateSort(value: string): SortParam | null {
  if (sortValues.includes(value as SortParam)) {
    return value as SortParam;
  }
  return null;
}

function parseAndValidateBoolean(value: string): boolean | null {
  if (value === '0' || value === 'false') {
    return false;
  }
  if (value === '1' || value === 'true') {
    return true;
  }
  return null;
}

function parseAndValidateInteger(value: string): number | null {
  if (!Number.isNaN(Number(value)) && Number.isInteger(parseFloat(value))) {
    return parseInt(value, 10);
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
  displayTotal: parseAndValidateBoolean,
  exportModal: parseAndValidateBoolean,
  contributionButton: parseAndValidateBoolean,
  itemMinWidth: parseAndValidateItemMinWidth,
  pageSize: parseAndValidateInteger,
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
