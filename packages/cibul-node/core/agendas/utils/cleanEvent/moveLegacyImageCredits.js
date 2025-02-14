export default function moveLegacyImageCredits(data) {
  return !data?.image?.credits || data?.imageCredits
    ? data
    : {
      ...data,
      imageCredits: data.image.credits,
    };
}
