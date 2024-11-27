import { parseToHsla } from 'color2k';

export type ImageListParam = {
  objectFit?: 'contain' | 'cover';
  maxHeight?: string;
  height?: string;
  aspectRatio?: string;
};

export type EmbedParams = {
  filters?: any;
  baseUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  imageList?: ImageListParam;
};

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

const noopParser = (v: unknown): unknown => v;

const parsers = {
  filters: noopParser,
  baseUrl: noopParser,
  primaryColor: parseAndValidateColor,
  secondaryColor: parseAndValidateColor,
  imageList: parseImageList,
};

export const extractParams = (
  source: Record<string, string>,
): Partial<EmbedParams> => {
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

export function omitParams(query: Record<string, any>) {
  const result = { ...query };

  delete result.initPath;

  for (const key in parsers) {
    delete result[key];
  }

  return result;
}
