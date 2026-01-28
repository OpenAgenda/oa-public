import logs from '@openagenda/logs';

const log = logs('set');

const duplicateSlugError = (slug) => ({
  field: 'slug',
  code: 'duplicate',
  message: 'duplicate value found',
  origin: slug,
});

async function verifyIfDifferent(slugUnicity, data) {
  if (data.data.slug === undefined) {
    return data;
  }

  if (data.data.slug === data.current.slug) {
    return data;
  }

  if (data.data.slug && !await slugUnicity.holdIfAvailable(data.data.slug)) {
    log('provided slug is not unique', { slug: data.data.slug });
    data.errors.push(duplicateSlugError(data.data.slug));
    return data;
  }

  return data;
}

export default verifyIfDifferent;
