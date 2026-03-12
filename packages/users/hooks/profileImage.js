import logs from '@openagenda/logs';
import { BadRequest } from '@openagenda/verror';

const log = logs('users/hooks/profileImage');

export default function profileImage() {
  return async (context) => {
    const { upload } = context.self;
    const { image } = context.data;
    const { before } = context.params;

    if (image && typeof image !== 'string') {
      try {
        log.info('start uploading the agenda profile image');

        const result = await upload(image, { uid: before.uid });

        context.data.image = `${
          result[0].uploadValue.key
        }?__ts=${new Date().getTime()}`;

        log.info('upload completed');
      } catch (e) {
        log.error('upload error:', e);

        context.data.image = before.image;

        throw new BadRequest({
          info: {
            errors: [
              {
                field: 'image',
                code: 'image.invalid',
                message: 'invalid image',
              },
            ],
          },
        });
      }
    } else if (image === null && before.image) {
      try {
        context.data.image = null;

        await upload.providers.s3.remove(before.image);
      } catch (e) {
        log.error('error deleting the profile image:', e);

        throw new BadRequest({
          info: {
            errors: [
              {
                field: 'image',
                code: 'image.remove',
                message: 'invalid image',
              },
            ],
          },
        });
      }
    } else {
      context.data.image = before.image;
    }
  };
}
