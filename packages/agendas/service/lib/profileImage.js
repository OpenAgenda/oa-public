import logs from '@openagenda/logs';

const log = logs('set');

async function profileImage(upload, data) {
  const { image } = data.data;

  if (image && typeof image !== 'string') {
    try {
      log.info('start uploading the agenda profile image');

      const uid = data.current ? data.current.uid : data.data.uid;
      const result = await upload(image, { uid });

      data.clean.image = `${result[0].uploadValue.key}?__ts=${new Date().getTime()}`;

      log.info('upload completed');
    } catch (e) {
      log.error('upload error:', e);

      if (data.current) {
        // If current image already has the full path, we need to extract just the filename part
        // to avoid issues when the path gets prepended again
        if (data.current.image && typeof data.current.image === 'string') {
          // Extract just the filename part (everything after the last slash)
          const parts = data.current.image.split('/');
          data.clean.image = parts[parts.length - 1];
        } else {
          data.clean.image = data.current.image;
        }
      }

      data.errors.push({
        field: 'image',
        code: 'image.invalid',
        message: 'invalid image',
      });
    }
  } else if (image === null) {
    try {
      data.clean.image = null;

      if (data.current && data.current.image) {
        await upload.providers.s3.remove(data.current.image);
      }
    } catch (e) {
      log.error('error deleting the profile image:', e);

      data.errors.push({
        field: 'image',
        code: 'image.remove',
        message: 'invalid image',
      });
    }
  } else if (data.current) {
    // If current image already has the full path, we need to extract just the filename part
    // to avoid issues when the path gets prepended again
    if (data.current.image && typeof data.current.image === 'string') {
      // Extract just the filename part (everything after the last slash)
      const parts = data.current.image.split('/');
      data.clean.image = parts[parts.length - 1];
    } else {
      data.clean.image = data.current.image;
    }
  }

  return data;
}

export default profileImage;
