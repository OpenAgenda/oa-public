export default function includePathInLocationImage({ assetsPath }, event) {
  if (!event.location?.image) {
    return event;
  }

  return {
    ...event,
    location: {
      ...event.location,
      image: `${assetsPath}${event.location.image}`,
    },
  };
}
