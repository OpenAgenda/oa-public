import {
  flatten,
  formatText,
  processImage,
} from './utils.mjs';

const acc = ({ accessibility: a }) => ({
  audioDisabilityCompliant: a.hi ?? false,
  mentalDisabilityCompliant: (a.pi || a.ii) ?? false,
  motorDisabilityCompliant: a.mi ?? false,
  visualDisabilityCompliant: a.vi ?? false,
});

export default async function formatEvent(event, ...args) {
  const options = args.pop();
  const passData = args[0] ?? {};

  const {
    lang = 'fr',
  } = options;

  const {
    venueId,
    category,
  } = passData;

  const formatted = {
    name: flatten(event.title, lang),
    accessibility: acc(event),
    description: await formatText(event.longDescription),
  };

  if (event.image) {
    const {
      base,
      variants
    } = event.image;
    formatted.image = {
      file: await processImage(
        `${base}${variants.find(v => v.type === 'full').filename}`,
      ),
    };

    formatted.image.credit = event.imageCredits;
  }

  if (venueId) {
    formatted.location = {
      type: 'physical',
      venueId
    };
  }

  if (category) {
    formatted.categoryRelatedFields = {
      category,
    };
  }
  return formatted;
}
