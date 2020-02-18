"use strict";

const _ = require('lodash');
const fs = require('fs');
const should = require('should');

const config = require('../testconfig');
const textLog = require('../utils/textLog');

const Service = require('../');

describe('02 - event search - functional: Applied search', function() {

  describe('Bordeaux Métropole', function() {
    let service;
    const formSchema = JSON.parse(fs.readFileSync(`${__dirname}/fixtures/applied/bordeaux-metropole.schema.json`));
    this.timeout(60000);

    before(() => {
      service = Service(config);
    });


    before(async () => {
      try {
        await service.getConfig().client.indices.delete({
          index: 'test'
        });
      } catch (e) {}
    });

    before(async () => {
      await service('bdx').rebuild({
        eventsList: async (lastId, limit) => {
          return JSON.parse(fs.readFileSync(`${__dirname}/fixtures/applied/bordeaux-metropole.${lastId}.${limit}.json`))
        },
        formSchema
      });
    });


    describe('Data structure', () => {
      const uid = 11438560;

      describe('basic', () => {
        let event;

        before(async () => {
          event = await service('bdx')
            .search({ uid }, {})
            .then(({ total, events }) => events[0]);
        });

        it('an event can be retrieved by uid', () => {
          event.uid.should.equal(uid);
        });

        it('origin agenda is available', () => {
          event.originAgenda.should.eql({
            uid: 1108324,
            image: 'agenda1108324.jpg',
            title: 'Un air de Bordeaux'
          });
        });
      });

      describe('detailed', () => {
        let event;

        before(async () => {
          event = await service('bdx')
            .search({ uid }, {}, { detailed: true })
            .then(({ total, events }) => events[0]);
        });

        it('timings are provided in detailed', () => {
          (event.timings instanceof Array).should.equal(true);
        });

      });

      describe('with formSchema', () => {
        let event;

        before(async () => {
          event = await service('bdx')
            .search({ uid }, {}, { formSchema })
            .then(({ total, events }) => events[0])
        });

        it('event with requested uid is retrieved', () => {
          event.uid.should.equal(uid);
        });

        it('additional fields are included in result', () => {
          event['thematiques-bordeaux-metropole'].should.eql([9]);
        });
      });

    });

    describe('Search', () => {

      it('events can be filtered by member', async () => {
        const { events, total } = await service('bdx')
          .search({ memberUid: 75052324 }, {});
        total.should.equal(208);
      });

      it('events can be filtered by multiple members', async () => {
        const { events, total } = await service('bdx')
          .search({ memberUid: [75052324, 65133249] }, {});
        total.should.equal(219);
      });

      it('events can be filtered by origin agenda', async () => {
        const { events, total } = await service('bdx').search({
          originAgendaUid: 19486837
        }, {});

        total.should.equal(1);
      });

      it('filter by city', async () => {
        const { total } = await service('bdx').search({
          city: 'Bordeaux'
        }, {});

        total.should.equal(94);
      });

      it('filter by department', async () => {
        const { total } = await service('bdx').search({
          department: 'Gironde'
        }, {});

        total.should.equal(334);
      });

      it('scroll through results', async () => {
        const {
          total,
          events,
          scrollId
        } = await service('bdx').search({}, {
          scroll: '1m'
        }, {
          detailed: true,
          formSchema
        });

        let hasMore = true;

        do {
          const {
            events: moreEvents
          } = await service('bdx').search.scroll(scrollId, '1m');

          if (moreEvents.length) {
            moreEvents.forEach(e => events.push(e));
          } else {
            hasMore = false;
          }
        } while (hasMore);

        events.length.should.equal(total);

        events.forEach(e => {
          //console.log(e.location);
        });
      });

    });

    describe('Additional fields search', () => {

      it('search by additional optioned field', async () => {
        const {
          total,
          events
        } = await service('bdx').search({
          'thematiques-bordeaux-metropole' : 9
        }, {}, { formSchema });

        total.should.equal(112);

        for (const event of events) {
          event['thematiques-bordeaux-metropole']
            .filter(id => id === 9)
            .length.should.equal(1);
        }
      });

    });

    describe('CRUD operations', () => {

      const data = JSON.parse(fs.readFileSync(`${__dirname}/fixtures/applied/bordeaux-metropole.event.json`))
      let addResult;

      before(async () => {
        addResult = await service('bdx').add(data, {
          formSchema,
          refresh: true // index must be refreshed directly for test
        });
      });

      it('adding a document went well', async () => {
        addResult.success.should.equal(true);
      });

      it('added document can be retrieved through its uid', async () => {
        const {
          events
        } = await service('bdx').search({
          uid: data.uid
        }, { formSchema });

        events[0].uid.should.equal(data.uid);
      });

      it('updating a document standard field', async () => {
        const result = await service('bdx').update({ uid: data.uid }, {
          ...data, // this is not a patch, all data must be provided
          state: 1
        }, {
          refresh: true,
          formSchema
        });

        result.success.should.equal(true);

        const { events } = await service('bdx').search({
          uid: data.uid,
          state: null
        }, {}, { detailed: true });

        events.length.should.equal(1);
        events[0].state.should.equal(1);
      });

      it('updating a document additional field', async () => {
        const result = await service('bdx').update({ uid: data.uid }, {
          ...data, // this is not a patch, all data must be provided
          'thematiques-bordeaux-metropole': [3, 7, 8]
        }, {
          refresh: true,
          formSchema
        });

        const event = await service('bdx').search({
          uid: data.uid,
          state: null
        }, {}, {
          detailed: true,
          first: true,
          formSchema
        });

        event['thematiques-bordeaux-metropole'].should.eql([3, 7, 8]);
      });

      it('removing a document', async () => {
        const result = await service('bdx').remove({ uid: data.uid }, {
          refresh: true
        });

        result.success.should.equal(true);

        const { events } = await service('bdx').search({
          uid: data.uid,
          state: null
        });

        events.length.should.equal(0);
      });

    });

    describe('Aggregations', () => {

      describe('keywords', () => {
        let agg, agg2;

        before(async () => {
          agg = await service('bdx').search({}, { size: 0 }, {
            detailed: true,
            aggregations: 'keywords'
          }).then(r => r.aggregations.keywords);

          agg2 = await service('bdx').search({}, { size: 0 }, {
            aggregations: {
              type: 'keywords',
              size: 20
            }
          }).then(r => r.aggregations.keywords);
        });

        it('default number of keywords retured is 10', () => {
          agg.length.should.equal(10);
        });

        it('size option allows to get more than 10 items', () => {
          agg2.length.should.equal(20);
        });

        it('one item has a key and an event count', () => {
          agg[0].should.eql({
            key: 'concert',
            eventCount: 88
          });
        });

      });

      describe('timings', () => {

        describe('by day', () => {
          let agg;

          before(async () => {
            const result = await service('bdx').search({}, { size: 0 }, {
              detailed: true,
              aggregations: 'timings'
            });

            agg = result.aggregations.timings;
          });

          it('there are as many items in timings aggregation as there are dates in lifespan of result', () => {
            agg.length.should.equal(757);
          });

          it('each item is a { key, timingCount } pair, the key being a date (YYYY-MM-DD)', () => {
            _.first(agg).should.eql({
              key: '2018-12-15',
              timingCount: 1
            });
            _.last(agg).should.eql({
              key: '2021-01-09',
              timingCount: 2
            });
          });

        });

        describe('by month', () => {
          let agg;

          before(async () => {
            const result = await service('bdx').search({}, { size: 0 }, {
              detailed: true,
              aggregations: [{
                type: 'timings',
                interval: 'month',
                format: 'YYYY-MM'
              }]
            });

            agg = result.aggregations.timings;
          });

          it('key follows specified format', () => {
            agg[0].key.should.equal('2018-12');
          });

          it('count is timings count', () => {
            agg[0].timingCount.should.equal(2);
          });
        });

      });

      describe('location (regions, departments, cities)', () => {
        let agg;

        before(async () => {
          const result = await service('bdx').search({}, { size: 0 }, {
            detailed: true,
            aggregations: ['regions', 'departments', 'cities']
          });
          agg = result.aggregations
        });

        it('regions aggregation', () => {
          agg.regions.should.eql([
            { key: 'Nouvelle-Aquitaine', eventCount: 339 },
            { key: 'Île-de-France', eventCount: 1 }
          ]);
        });

        it('departments aggregation', () => {
          agg.departments[0].should.eql({ key: 'Gironde', eventCount: 334 });
        });

        it('cities aggregation', () => {
          agg.cities[0].should.eql({ key: 'Bordeaux', eventCount: 94 });
        });

      });

      describe('members', () => {
        let agg;

        before(async () => {
          const result = await service('bdx').search({}, { size: 0 }, {
            detailed: true,
            aggregations: ['members']
          });
          agg = result.aggregations.members;
          //textLog('members.json', agg);
        });

        it('each aggregation key is the user uid of the member', () => {
          agg[0].key.should.equal('75052324');
        });

        it('each aggregation provides name and uid of member', () => {
          agg[0].should.eql({
            key: '75052324',
            member: { uid: 75052324, name: 'Kaoré - OpenAgenda' },
            eventCount: 208
          });
        });

      });

      describe('origin agendas', () => {
        let originAgendaAggregation;

        before(async () => {
          const result = await service('bdx').search({}, { size: 0 }, {
            detailed: true,
            aggregations: ['originAgendas']
          });
          originAgendaAggregation = result.aggregations.originAgendas;
        });

        it('each aggregation key is the uid of the agenda', () => {
          originAgendaAggregation[0].key.should.equal('94573624');
        });

        it('each aggregation provides basic info on agenda', () => {
          originAgendaAggregation[0].should.eql({
            key: '94573624',
            eventCount: 80,
            agenda: {
              uid: 94573624,
              title: 'Rocher de Palmer',
              image: 'agenda94573624.jpg'
            }
          });
        });

      });

      describe('timespan', () => {
        let timespanAggregation;

        before(async () => {
          const result = await service('bdx').search({}, { size: 0 }, {
            detailed: true,
            aggregations: 'timespan'
          });

          timespanAggregation = result.aggregations.timespan;
        });

        it('provides first and last Date bracket matching search', () => {
          timespanAggregation.first.should.eql(
            new Date('2018-12-15T16:00:00.000Z')
          );

          timespanAggregation.last.should.eql(
            new Date('2021-01-09T13:00:00.000Z')
          );
        });
      });

      describe('eventsByDateRanges', () => {
        let TRHAggregation;

        before(async () => {
          const result = await service('bdx').search({
            date: {
              gte: new Date('2019-11-01'),
              lte: new Date('2019-11-30')
            },
          }, { size: 0 }, {
            detailed: true,
            aggregations: 'eventsByDateRanges'
          });

          TRHAggregation = result.aggregations.eventsByDateRanges;
        });

        it('item of aggregation contains keys {key, count, sampleEvents}', () => {
          Object.keys(TRHAggregation[0]).should.eql(['key', 'eventCount', 'sampleEvents']);
        });

        it('item.key is of format YYYY-MM-DD', () => {
          TRHAggregation[0].key.should.equal('2019-11-01');
        });

        it('item.sampleEvents contains 3 events corresponding to provided key', () => {
          TRHAggregation[0].sampleEvents.map(e => e.uid).sort().should.eql([16560750, 75721304]);
        });

      });

      describe('additionalFields', () => {
        let agg;

        before(async () => {
          agg = await service('bdx').search({
            date: {
              gte: new Date('2019-11-01'),
              lte: new Date('2019-11-30')
            },
          }, { size: 0 }, {
            detailed: true,
            formSchema,
            aggregations: 'additionalFields'
          }).then(r => r.aggregations.additionalFields);
        });

        it('an object is provided with schema fields as keys', () => {
          Object.keys(agg).should.eql([
            'thematiques-bordeaux-metropole',
            'intermunicipal_interest',
            'categories-agenda-metropolitain'
          ]);
        });

        it('each field lists event count corresponding to field option', () => {
          agg['thematiques-bordeaux-metropole'][0].should.eql({
            id: 9,
            value: 'culture',
            label: { fr: 'Culture' },
            legacyId: null,
            eventCount: 45
          });
        });

      });

    });

    describe('More like this', () => {

      it('on title alone', async () => {
        const { events } = await service('bdx').moreLikeThis({
          title: { fr: 'Sieste musicale' }
        }, { size: 3 });

        events.map(e => e.slug).should.eql([
          'sieste-musicale-mosaique-londonienne',
          'sieste-musicale-rutilants-trombones',
          'sieste-musicale-inspirant-amour'
        ]);
      });

      it('on keywords alone', async () => {
        const { events } = await service('bdx').moreLikeThis({
          keywords: { fr: ['jazz'] }
        }, { size: 3 });

        events.map(e => e.slug).should.eql([
          'concert-au-quartier-libre',
          'tremplin-martignas-sur-jazz',
          'jazz-club-obradovic-tixier'
        ]);
      });

      it('on title and keywords', async () => {
        const { events } = await service('bdx').moreLikeThis({
          title: { fr: 'Sieste musicale' },
          keywords: { fr: ['jazz'] }
        }, { size: 3 });

        events.map(e => e.slug).should.eql([
          'sieste-musicale-mosaique-londonienne',
          'sieste-musicale-rutilants-trombones',
          'sieste-musicale-inspirant-amour'
        ]);
      });

      it('on title and keywords with boosted keywords', async () => {
        const { events, total } = await service('bdx').moreLikeThis({
          title: { fr: 'Sieste musicale' },
          keywords: { fr: ['jazz'] }
        }, { size: 3, boost: { keywords: 30, title: 10 } });

        events.map(e => e.slug).should.eql([
          'concert-au-quartier-libre',
          'tremplin-martignas-sur-jazz',
          'jazz-club-obradovic-tixier'
        ]);
      });

      it('on additional field of radio type', async () => {
        const { events, total } = await service('bdx').moreLikeThis({
          'thematiques-bordeaux-metropole': '3933.9'
        }, { size: 3, formSchema, detailed: true });

        for (const event of events ) {
          event['thematiques-bordeaux-metropole'].includes(9).should.equal(true);
        }
      });

      it('on additional field of radio type without scheamId prefixed', async () => {
        const { events, total } = await service('bdx').moreLikeThis({
          'thematiques-bordeaux-metropole': '9'
        }, { size: 3, formSchema, detailed: true });

        for (const event of events ) {
          event['thematiques-bordeaux-metropole'].includes(9).should.equal(true);
        }
      });

      it('on location', async () => {
        const { events, total } = await service('bdx').moreLikeThis({
          location: {
            city: 'Bassens'
          }
        }, { size: 3, detailed: true });

        for (const event of events) {
          event.location.city.should.equal('Bassens');
        }

      });

    });

  });

} );
