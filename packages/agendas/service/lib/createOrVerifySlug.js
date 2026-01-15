import logs from '@openagenda/logs';

const log = logs('set');

const duplicateSlugError = (slug) => ({
  field: 'slug',
  code: 'duplicate',
  message: 'duplicate value found',
  origin: slug,
});

async function createOrVerifySlug(slugUnicity, data) {
  if (data.data.slug && !await slugUnicity.holdIfAvailable(data.data.slug)) {
    log('provided slug is not unique', { slug: data.data.slug });
    data.errors.push(duplicateSlugError(data.data.slug));
    return data;
  }

  if (!data.data.slug) {
    log('did not provide slug, generating from title', {
      title: data.data.title,
    });
    data.data.slug = await slugUnicity.generateAndHold(data.data.title);
  } else {
    log('going with provided slug');
  }

  return data;
}

export default createOrVerifySlug;
