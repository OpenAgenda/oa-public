import logs from '@openagenda/logs';

const log = logs('set');

async function profileImage(upload, { uid, data, current, clean, errors }) {
  const { image } = data;

  if (image && typeof image !== 'string') {
    try {
      log.info('start uploading the agenda profile image');

      const result = await upload(image, {
        uid: current?.uid ?? uid,
      });

      clean.image = `${result[0].uploadValue.key}?__ts=${new Date().getTime()}`;

      log.info('upload completed');
    } catch (e) {
      log.error('upload error:', e);

      if (current) {
        // If current image already has the full path, we need to extract just the filename part
        // to avoid issues when the path gets prepended again
        if (current.image && typeof current.image === 'string') {
          // Extract just the filename part (everything after the last slash)
          const parts = current.image.split('/');
          clean.image = parts[parts.length - 1];
        } else {
          clean.image = current.image;
        }
      }

      errors.push({
        field: 'image',
        code: 'image.invalid',
        message: 'invalid image',
      });
    }
  } else if (image === null) {
    log('removing image');
    try {
      clean.image = null;

      if (current && current.image) {
        await upload.providers.s3.remove(current.image);
      }
    } catch (e) {
      log.error('error deleting the profile image:', e);

      errors.push({
        field: 'image',
        code: 'image.remove',
        message: 'invalid image',
      });
    }
  } else if (current) {
    log('handling current image');
    // If current image already has the full path, we need to extract just the filename part
    // to avoid issues when the path gets prepended again
    if (current.image && typeof current.image === 'string') {
      // Extract just the filename part (everything after the last slash)
      const parts = current.image.split('/');
      clean.image = parts[parts.length - 1];
    } else if (current.image) {
      clean.image = current.image;
    }
  }

  return data;
}

export default profileImage;
