'use strict';

const fs = require('fs');
const sources = require('./test/fixtures/agendas.story.old.json');

function transform(data) {
  data.summary = {
    keywords: data.keywords,
    recentlyAddedEvents: {
      shared: 0,
      aggregation: 0,
      contribution: data.recentlyContributedEvents
    },
    publishedEvents: {
      passed: data.publishedEvents - data.upcomingPublishedEvents,
      current: 0,
      upcoming: data.upcomingPublishedEvents
    },
    eventCountsByState: data.eventCountsByState
  };

  if (!data.image) {
    data.image = '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png';
  } else {
    //data.image = `//cibul.s3.amazonaws.com/${data.image}`;
  }

  delete data.upcomingPublishedEvents;
  delete data.recentlyContributedEvents;
  delete data.eventCountsByState;
  delete data.publishedEvents;
  delete data.keywords;

  return data;
}

(async () => {
  fs.writeFileSync(
    __dirname + '/test/fixtures/agendas.story.json',
    JSON.stringify(sources.map(transform), null, 2),
    'utf-8'
  );  
})();
