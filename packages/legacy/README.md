# Overview

Provide refactored implementations of legacy functions, with tests

## Control data

JS objects used to display data on agenda widgets.

An agenda control data stores an agendas events uids, slugs, associated tags and categories. These should be in hand when a control data update or insert is made.



So legacyId is review_id.event_id
not just the article id.

 oa:agendaEvents/interfaces/onCreate control data set failed { VError: no entry was found for review_article id 17438.461778
    at module.exports (/home/kaore/Dev/lib/oa/packages/legacy/controlData/lib/utils/loadReviewArticleData.js:21:11)
    at <anonymous>
    at process._tickDomainCallback (internal/process/next_tick.js:229:7)
