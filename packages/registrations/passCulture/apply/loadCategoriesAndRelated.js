export async function loadCategoriesAndRelated(pc, options = {}) {
  const {
    categories: categoriesFromOptions,
    related: relatedFromOptions,
  } = options;

  return !categoriesFromOptions || !relatedFromOptions ? pc.offers.events.categories.list() : { categories: categoriesFromOptions, related: relatedFromOptions };
}
