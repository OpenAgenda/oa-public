'use strict';

const RSS = require('rss');
const _ = require('lodash');
const formatEvent = require('./lib/rss/formatEvent');
const validateHead = require('./lib/rss/validateHead');

module.exports = head => {
  const feed = new RSS(_.mapKeys(validateHead(head), (v, k) => ({
    title: 'title',
    description: 'description',
    feedURL: 'feed_url',
    siteURL: 'site_url',
    generator: 'generator',
    imageURL: 'image_url',
    language: 'language',
    pubDate: 'pubDate',
    custom_namespaces: 'custom_namespaces',
  }[k])));

  const eventOptions = {
    lang: head.language,
  };

  if (head.genUrl) eventOptions.genUrl = head.genUrl;

  return {
    addEvent: event => feed.item(formatEvent(event, eventOptions)),
    xml: feed.xml.bind(feed),
  };
};
