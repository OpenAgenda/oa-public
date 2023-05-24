'use strict';

const log = require('@openagenda/logs')('updateTagSetAndTags');
const VError = require('@openagenda/verror');

const slug = require('slugify');
const generateTagSet = require('./utils/generateTagSet');

async function createTag(knex, id, tag) {
  return knex('review_tag').insert({
    review_id: id,
    tag: tag.label,
    slug: slug(tag.label.substr(0, 254), {
      lower: true,
      strict: true,
    }),
    created_at: new Date(),
    updated_at: new Date(),
  });
}

async function updateTag(knex, id, tag) {
  return knex('review_tag').update({
    review_id: id,
    tag: tag.label,
    updated_at: new Date(),
  }).where('id', tag.id);
}

async function removeTag(knex, id, tag) {
  return knex('review_tag').remove().where({
    review_id: id,
    id: tag.id,
  });
}

async function setTags(knex, id, tagSet) {
  const tags = await knex('review_tag')
    .select()
    .where('review_id', id);

  for (const { tags: groupTags } of tagSet?.groups ?? []) {
    for (const groupTag of groupTags) {
      const matchingTag = tags.filter(t => (groupTag.slug === t.slug) || (groupTag.id === t.id)).pop();

      if (!matchingTag) {
        const tagIds = await createTag(knex, id, groupTag);
        groupTag.id = tagIds.pop();
      } else if (matchingTag.label !== groupTag.label) {
        groupTag.id = matchingTag.id;
        await updateTag(knex, id, groupTag);
      }
    }
  }

  const flattenedSetTags = (tagSet?.groups ?? []).reduce((flat, group) => flat.concat(group.tags), []);

  for (const tag of tags) {
    if (flattenedSetTags.filter(st => st.id === tag.id)) {
      continue;
    }
    await removeTag(knex, id, tag);
  }

  return tagSet;
}

module.exports = async function updateTagSetAndTags({ knex }, id, schema, currentTagSet = null, options = {}) {
  const {
    set: updatedSet,
    messages,
    fields,
  } = await generateTagSet(schema, currentTagSet, options);

  if (updatedSet === null) {
    log.error(new VError({
      info: { id, schema },
    }, 'fake-deleting tagSet to know why it was deleted'));
    /* if (await knex('tag_set').first('id').where('id', id)) {
      log('info', 'deleting tagSet %s', id);
      await knex('tag_set').delete('id', id);
      await setTags(knex, id, { groups: [] });
    } */

    return {
      set: null,
      messages,
      fields,
    };
  }

  const updatedSetWithIds = await setTags(knex, id, updatedSet);

  if (await knex('tag_set').first('id').where('id', id)) {
    await knex('tag_set').update({ store: JSON.stringify(updatedSetWithIds) }).where('id', id);
  } else {
    await knex('tag_set').insert({
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
