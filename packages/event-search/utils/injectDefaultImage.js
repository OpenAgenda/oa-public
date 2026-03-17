export default function injectDefaultImage({ defaultImage }, event) {
  if (event?.image?.filename) {
    return event;
  }

  return {
    ...event,
    image: defaultImage,
  };
}
