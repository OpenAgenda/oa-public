import loaders from './build/localeLoaders.js';

export default async function fetchLocale(messagesPath, locale) {
  const bundles = loaders[locale];

  if (!bundles) {
    throw new Error(
      `No compiled locale for "${locale}". Available languages are listed in build/localeLoaders.js.`,
    );
  }

  const load = bundles[messagesPath];

  if (!load) {
    throw new Error(
      `No "${messagesPath}" bundle in the "${locale}" locale. Available bundles are listed in build/localeLoaders.js.`,
    );
  }

  return (await load()).default;
}
