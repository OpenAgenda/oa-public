import { produce } from 'immer';

export default function includePathInLocationImage({ assetsPath }, event) {
  if (!event.location?.image) {
    return event;
  }

  return produce(event, (draft) => {
    draft.location.image = `${assetsPath}${draft.location.image}`;
  });
}
