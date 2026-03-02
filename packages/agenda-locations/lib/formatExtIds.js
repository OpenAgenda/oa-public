'use strict';

/**
 * formatExtIds - Handles two-phase transformation:
 * PHASE 1: DB Format Conversion (identifiers array <-> extIds array)
 * PHASE 2: Legacy Compatibility (single extId property for backward compatibility)
 */

/**
 * PHASE 1: Convert DB format to API format
 * DB: { extIds: { identifiers: ["key->value"] } }
 * API: { extIds: [{ key, value }] }
 */
function convertDbToApi(data) {
  if (!data) return data;

  const out = { ...data };

  if (data.extIds?.identifiers && !data.extIds?.identifiers.length) {
    out.extIds = null;
    return out;
  }

  if (data.extIds?.identifiers?.length) {
    out.extIds = out.extIds.identifiers.map((id) => {
      const [key, value] = id.split('->');
      // Convert string "null" back to actual null
      return { key, value: value === 'null' ? null : value };
    });
    return out;
  }

  return data;
}

/**
 * PHASE 2: Add legacy extId property for backward compatibility
 * Extracts the 'default' extId and adds it as a top-level property
 * Only adds extId if extIds field is present (respects includeFields filtering)
 * Input: { extIds: [{ key: 'default', value: '123' }] }
 * Output: { extIds: [...], extId: '123' }
 */
function addLegacyExtId(data) {
  if (!data) return data;

  // Only add extId if extIds is present in the data
  // This respects field filtering from includeFields option
  if (!('extIds' in data)) {
    return data;
  }

  const out = { ...data };
  out.extId = null;

  if (out.extIds && out.extIds.length) {
    const defaultExtId = out.extIds.find((extId) => extId.key === 'default');
    out.extId = defaultExtId ? defaultExtId.value : null;
  }

  return out;
}

/**
 * afterRead: Complete transformation from DB to API with legacy support
 * Step 1: Convert DB format to API format
 * Step 2: Add legacy extId property
 */
module.exports.afterRead = (data) => {
  let result = convertDbToApi(data);
  result = addLegacyExtId(result);
  return result;
};

module.exports.mergeExtIdsFn = (data, current) => {
  const currentExtIds = current.extIds;

  if (currentExtIds && data.extIds) {
    return data.extIds.reduce(
      (acc, extId) => {
        const { key } = extId;
        const index = acc.findIndex((accElm) => {
          const { key: k } = accElm;
          return k === key;
        });

        if (index !== -1) {
          const updatedArray = acc.map((item, idx) => {
            if (idx === index) return extId;
            return item;
          });
          return updatedArray;
        }
        acc.push(extId);
        return acc;
      },
      [...currentExtIds],
    ); // IMPORTANT: Create a copy to avoid mutation
  }
  return data.extIds;
};

/**
 * Handle legacy extId input (single property for backward compatibility)
 * Converts single extId to extIds array with 'default' key
 * Input: { extId: '123' } or { extId: null }
 * Output: { extIds: [{ key: 'default', value: '123' }] }
 */
function handleLegacyExtId(data) {
  if (!data) return data;

  if (data?.extId || data.extId === null) {
    const { extId } = data;
    const out = { ...data };
    delete out.extId;
    return {
      ...out,
      extIds: [{ key: 'default', value: extId }],
    };
  }

  return data;
}

/**
 * Convert API format to DB format
 * API: { extIds: [{ key, value }] }
 * DB: { extIds: { identifiers: ["key->value"] } }
 * Note: Keeps null values to support explicit null setting
 */
function convertApiToDb(data) {
  if (!data) return data;

  const out = { ...data };

  if (out.extIds) {
    out.extIds = out.extIds.reduce(
      (acc, { key, value }) => {
        acc.identifiers.push(`${key}->${value}`);
        return acc;
      },
      { identifiers: [] },
    );
  }

  return out;
}

/**
 * beforeInsert: Complete transformation from API to DB with legacy support
 * Step 1: Handle legacy extId input (if present)
 * Step 2: Convert API format to DB format
 */
module.exports.beforeInsert = (data) => {
  let result = handleLegacyExtId(data);
  result = convertApiToDb(result);
  return result;
};

/**
 * searchQuery: Handle locationExtId search queries
 * Ensures search query has proper structure with key and value
 */
module.exports.searchQuery = (query) => {
  if (!(query.locationExtId?.key && query.locationExtId?.value)) {
    return { key: 'default', value: query.locationExtId };
  }
  return query.locationExtId;
};
