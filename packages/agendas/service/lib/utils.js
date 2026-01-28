/**
 * do not proceed if clean identifiers amount to nothing
 */
function checkIdentifiers(v) {
  if (!Object.keys(v.identifiers).length) {
    throw new Error(
      `No known identifiers specified for get: ${JSON.stringify(v.identifiers)}`,
    );
  }

  return v;
}

/**
 * allow only certain fields for get ( id, uid and slug )
 */
function cleanIdentifiers(identifiers) {
  const clean = {};

  if (typeof identifiers !== 'object') {
    return {
      id: identifiers,
    };
  }

  ['id', 'uid', 'slug'].forEach((field) => {
    if (typeof identifiers[field] === 'undefined') return;

    clean[field] = identifiers[field];
  });

  return clean;
}

export const identifiers = {
  check: checkIdentifiers,
  clean: cleanIdentifiers,
};
