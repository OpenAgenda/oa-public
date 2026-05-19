import RSS from 'rss';
import _ from 'lodash';
import formatEvent from './lib/rss/formatEvent.js';
import validateHead from './lib/rss/validateHead.js';

export default (head) => {
  const feed = new RSS(
    _.mapKeys(
      validateHead(head),
      (v, k) =>
        ({
          title: 'title',
          description: 'description',
          feedURL: 'feed_url',
          siteURL: 'site_url',
          generator: 'generator',
          imageURL: 'image_url',
          language: 'language',
          pubDate: 'pubDate',
          custom_namespaces: 'custom_namespaces',
        })[k],
    ),
  );

  const eventOptions = {
    lang: head.language,
  };

  if (head.genUrl) eventOptions.genUrl = head.genUrl;
  if (head.dateField) eventOptions.dateField = head.dateField;
  if (head.categoryFields) eventOptions.categoryFields = head.categoryFields;
  if (head.formSchema) eventOptions.formSchema = head.formSchema;

  return {
    addEvent: (event) => feed.item(formatEvent(event, eventOptions)),
    xml: feed.xml.bind(feed),
  };
};
