'use strict';

const log = require('@openagenda/logs')('updateCategorySetAndCategories');

const slug = require('slugify');
const generateCategorySet = require('./utils/generateCategorySet');

async function createCategory(knex, id, category) {
  return knex('review_category').insert({
    review_id: id,
    category: category.label,
    slug: slug(category.label.substr(0, 254), {
      lower: true,
      strict: true,
    }),
    created_at: new Date(),
    updated_at: new Date(),
  });
}

async function updateCategory(knex, id, category) {
  return knex('review_category').update({
    review_id: id,
    category: category.label,
    updated_at: new Date(),
  }).where('id', category.id);
}

async function removeCategory(knex, id, category) {
  return knex('review_category').remove().where({
    review_id: id,
    id: category.id,
  });
}

async function setCategories(knex, id, categorySet) {
  const categories = await knex('review_category')
    .select()
    .where('review_id', id);

  for (const category of categorySet.categories) {
    const matchingCategory = categories.filter(c => (category.slug === c.slug) || (category.id === c.id)).pop();

    if (!matchingCategory) {
      const categoryIds = await createCategory(knex, id, category);
      category.id = categoryIds.pop();
    } else if (matchingCategory.label !== category.label) {
      category.id = matchingCategory.id;
      await updateCategory(knex, id, category);
    }
  }

  for (const category of categories) {
    if (categorySet.categories.filter(sc => sc.id === category.id)) {
      continue;
    }
    await removeCategory(knex, id, category);
  }

  return categorySet;
}

module.exports = async function updateCategorySetAndCategories({ knex }, id, schema, currentCategorySet = null, options = {}) {
  const {
    set: updatedSet,
    messages,
    fields,
  } = await generateCategorySet(schema, currentCategorySet, options);

  if (updatedSet === null) {
    if (await knex('category_set').first('id').where('id', id)) {
      log('info', 'deleting categorySet %s', id);
      // await knex('category_set').delete('id', id); // category sets have a tendency to be deleted even when they shouldn't be.
      await setCategories(knex, id, { categories: [] });
    }

    return {
      set: null,
      messages,
      fields,
    };
  }

  const updatedSetWithIds = await setCategories(knex, id, updatedSet);

  if (await knex('category_set').first('id').where('id', id)) {
    await knex('category_set').update({
      store: JSON.stringify(updatedSetWithIds),
    }).where('id', id);
  } else {
    await knex('category_set').insert({
      id,
      store: JSON.stringify(updatedSetWithIds),
    });
  }

  return {
    set: updatedSet,
    messages,
    fields,
  };
};
