import { produce } from 'immer';

export default function filterImageTimestamps(event) {
  if (!event?.image?.filename) {
    return event;
  }

  return produce(event, (draft) => {
    if (draft.image.filename.includes('?')) {
      draft.image.filename = draft.image.filename.split('?').shift();
    }

    if (!draft.image.variants) {
      return draft;
    }

    for (const variant of draft.image.variants) {
      if (variant.filename.includes('?')) {
        variant.filename = variant.filename.split('?').shift();
      }
    }

    return draft;
  });
}
