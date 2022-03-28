'use strict';

const _ = require('lodash');
const assert = require('assert');
const fs = require('fs');
const should = require('should');

const config = require('../testconfig');
const textLog = require('../utils/textLog');

const Service = require('../');

describe('02 - event search - functional: Applied search', function() {

  describe('Bordeaux Métropole', function() {
    let service;
    const formSchema = JSON.parse(fs.readFileSync(`${__dirname}/fixtures/applied/bordeaux-metropole.schema.json`));
    this.timeout(100000);

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
            .then(r => r.events[0]);
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

        it('source agendas are available', () => {
          (event.sourceAgendas instanceof Array).should.equal(true);
        });


        it('registration is a list [{ type, value }]', async () => {
          event.registration.should.eql([{
            type: 'link',
            value: 'http://william-theviot.fr'
          }]);
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
        total.should.equal(204);
      });

      it('events can be filtered by multiple members', async () => {
        const { events, total } = await service('bdx')
          .search({ memberUid: [75052324, 65133249] }, {});
        total.should.equal(228);
      });

      it('events can be filtered by origin agenda', async () => {
        const { events, total } = await service('bdx').search({
          originAgendaUid: 19486837
        }, {});

        total.should.equal(1);
      });

      it('events can by filtered by creation date', async () => {
        const { total } = await service('bdx').search({
          createdAt: {
            lte: new Date('2019-01-01')
          }
        }, {});

        total.should.equal(2);
      });

      it('events can be filtered buy update date', async () => {
        const { total } = await service('bdx').search({
          createdAt: {
            gte: new Date('2019-06-01'),
            lte: new Date('2020-01-01')
          }
        }, {});

        total.should.equal(425);
      });

      it('events can be filtered by source agenda', async () => {
        const { events, total } = await service('bdx').search({
          sourceAgendaUid: 1108324
        }, {}, { detailed: true });

        total.should.equal(38);
      });

      it('filter by city', async () => {
        const { total } = await service('bdx').search({
          city: 'Bordeaux'
        }, {});

        total.should.equal(129);
      });

      it('filter by district', async () => {
        const { total } = await service('bdx').search({
          district: 'Bordeaux Maritime'
        }, {});

        total.should.equal(26);
      });

      it('filter by department', async () => {
        const { total } = await service('bdx').search({
          department: 'Gironde'
        }, {});

        total.should.equal(507);
      });

      it('get events matching one state', async () => {
        const { total, events } = await service('bdx').search({
          state: 2
        }, {});

        total.should.equal(518);
      });

      it('search for multiple states', async () => {
        const { total, events } = await service('bdx').search({
          state: [1, 0]
        }, {});

        total.should.equal(3);
      });

      it('state can be passed as string or array of string', async () => {
        const { total, events } = await service('bdx').search({
          state: ['1', '0']
        });

        total.should.equal(3);
      })

    });

    describe('Sort and navigation', () => {

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

        const now = new Date();

        events.forEach(e => {
          const begin = e.timings[0].begin;
          const end = e.timings[e.timings.length - 1].end;
          const upcomingTimings = e.timings.filter(t => new Date(t.end) > now);
          const pastTimings = e.timings.filter(t => new Date(t.end) < now);
          //console.log(e.slug, _ft(begin), _ft((upcomingTimings.length ? upcomingTimings.shift() : pastTimings.pop()).end), _ft(end));
        });
      });

      function _ft(t) {
        return t.split(':00.000').shift();
      }

      it('navigation with search after and default sort', async () => {
        const {
          events: chunkOfEvents,
        } = await service('bdx').search({}, { size: 10 });

        const {
          events: firstSmallerChunkOfEvents,
          sort: searchAfter
        } = await service('bdx').search({}, { size: 2 });

        const {
          events: secondSmallerChunkOfEvents,
        } = await service('bdx').search({}, { size: 2, searchAfter });

        assert.equal(
          chunkOfEvents[2].uid,
          secondSmallerChunkOfEvents[0].uid
        );
      });

      it('if useAfterKey option is used, after key is provided', async () => {
        const {
          events: chunkOfEvents,
        } = await service('bdx').search({}, { size: 10 });

        const {
          events: firstSmallerChunkOfEvents,
          after
        } = await service('bdx').search({}, { size: 2 }, { useAfterKey: true });

        const {
          events: secondSmallerChunkOfEvents,
        } = await service('bdx').search({}, { size: 2, after }, { useAfterKey: true });

        assert.equal(
          chunkOfEvents[2].uid,
          secondSmallerChunkOfEvents[0].uid
        );
      });

      it('if useAfterKey option is used, given sort key gives effective sort', async () => {
        const {
          sort
        } = await service('bdx').search({}, { size: 2 }, { useAfterKey: true });

        assert.equal(sort, 'timingsWithFeatured.asc');
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

        total.should.equal(118);

        for (const event of events) {
          event['thematiques-bordeaux-metropole']
            .filter(id => id === 9)
            .length.should.equal(1);
        }
      });

      it('search by additional optioned field with multiple values (matches either)', async () => {
        const {
          total,
          events
        } = await service('bdx').search({
          'thematiques-bordeaux-metropole' : [9, 13, 23]
        }, {}, { formSchema });

        events.forEach(e => {
          e['thematiques-bordeaux-metropole'].filter(id => [9, 13, 23].includes(id)).length.should.greaterThan(0);
        });

        total.should.equal(127);

      })

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

      after(async () => {
        try {
          await service('bdx').remove({ uid: data.uid });
        } catch (e) {}
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
        const result = await service('bdx').remove({
          uid: data.uid
        }, {
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
            key: 'cenon',
            eventCount: 174
          });
        });

      });

      describe('createdAt / updatedAt / createdOrUpdatedAt', () => {
        let updatedAtAgg;
        let createdAtAgg;
        let createdOrUpdatedAtAgg;

        before(async () => {
          const aggregations = await service('bdx').search({
            date: { gte: '2020-03-01' }
          }, { size: 0 }, {
            detailed: true,
            aggregations: ['createdAt', 'updatedAt', 'createdOrUpdatedAt']
          }).then(({ aggregations }) => aggregations)
            .catch(err => console.log(err.body.error));

          createdAtAgg = aggregations.createdAt;
          updatedAtAgg = aggregations.updatedAt;
          createdOrUpdatedAtAgg = aggregations.createdOrUpdatedAt;
        });

        it('createdAt agg is a list of { eventCount, key }', () => {
          Object.keys(createdAtAgg[0]).should.eql(['key', 'eventCount']);
        });

        it('updatedAt agg is a list of { eventCount, key }', () => {
          Object.keys(updatedAtAgg[0]).should.eql(['key', 'eventCount']);
        });

        it('createdOrUpdatedAt agg is a list of { eventCount, key }', () => {
          Object.keys(createdOrUpdatedAtAgg[0]).should.eql(['key', 'eventCount']);
        });

      });

      describe('fixedInterval option', () => {
        let createdAtAgg;

        before(async () => {
          const aggregations = await service('bdx').search({
            createdAt: { gte: '2020-01-02' }
          }, { size: 0 }, {
            detailed: true,
            aggregations: [{
              type: 'createdAt',
              fixedInterval: '7d'
            }]
          }).then(({ aggregations }) => aggregations)
            .catch(err => console.log(err.body.error));

          createdAtAgg = aggregations.createdAt;
        });

        it('createdAt agg starts in the middle of the week', () => {
          createdAtAgg[0].should.eql({ key: '2020-01-02', eventCount: 7 });
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
            agg.length.should.equal(748);
          });

          it('each item is a { key, timingCount } pair, the key being a date (YYYY-MM-DD)', () => {
            _.first(agg).should.eql({
              key: '2018-12-15',
              timingCount: 1
            });
            _.last(agg).should.eql({
              key: '2020-12-31',
              timingCount: 1
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
            agg[0].timingCount.should.equal(1);
          });
        });

        describe('both - using key option', () => {
          let agg;

          before(async () => {
            const result = await service('bdx').search({
              date: {
                gte: '2020-04-01',
                lte: '2020-04-02'
              }
            }, { size: 0 }, {
              detailed: true,
              aggregations: [{
                key: 'timingsByMonth',
                type: 'timings',
                interval: 'month',
                format: 'YYYY-MM'
              }, {
                key: 'timingsByDay',
                type: 'timings',
                interval: 'day'
              }]
            });

            agg = result.aggregations;
          });

          it('both are provided in their respective keys', () => {
            Object.keys(agg).should.eql(['timingsByMonth', 'timingsByDay']);
          });

          it('day keys matching date filter are the only ones to be provided', () => {
            agg.timingsByDay.should.eql([
              { key: '2020-04-01', timingCount: 7 },
              { key: '2020-04-02', timingCount: 6 }
            ]);
          });

          it('month keys matching date filter are the only ones to be provided', () => {
            agg.timingsByMonth.should.eql([{
              key: '2020-04',
              timingCount: 133
            }]);
          });
        });

      });


      describe('location (regions, departments, cities)', () => {
        let agg, aggMoreItems

        before(async () => {
          const result = await service('bdx').search({}, { size: 0 }, {
            detailed: true,
            aggregations: ['regions', 'departments', 'cities']
          });
          agg = result.aggregations;
        });

        before(async () => {
          const result = await service('bdx').search({}, { size: 0 }, {
            detailed: true,
            aggregations: {
              type: 'cities',
              size: 20
            }
          });
          aggMoreItems = result.aggregations;
        });

        it('regions aggregation', () => {
          agg.regions.should.eql([
            { key: 'Nouvelle-Aquitaine', eventCount: 512 },
            { key: 'Île-de-France', eventCount: 1 }
          ]);
        });

        it('departments aggregation', () => {
          agg.departments[0].should.eql({
            key: 'Gironde',
            eventCount: 507
          });
        });

        it('cities aggregation', () => {
          agg.cities[0].should.eql({
            key: 'Cenon',
            eventCount: 183
          });
        });

        it('by default, max number of returned items is 10', () => {
          agg.cities.length.should.equal(10);
        });

        it('if size option is specified, more items can be retrieved', () => {
          aggMoreItems.cities.length.should.equal(20);
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
          agg[0].key.should.equal(75052324);
        });

        it('each aggregation provides name and uid of member', () => {
          agg[0].should.eql({
            key: 75052324,
            member: { uid: 75052324, name: 'Kaoré - OpenAgenda' },
            eventCount: 204
          });
        });

      });

      describe('locations', () => {
        let agg;

        before(async () => {
          const result = await service('bdx').search({}, { size: 0 }, {
            detailed: true,
            aggregations: ['locations']
          });
          agg = result.aggregations.locations;
          //textLog('locations.json', agg);
        });

        it('each aggregation key is the uid of the location', () => {
          agg[0].key.should.equal(18191842);
        });

        it('each aggregation provides name and uid of location', () => {
          agg[0].should.eql({
            key: 18191842,
            location: { uid: 18191842, name: 'Rocher de Palmer' },
            eventCount: 174
          });
        });

      });

      describe('source agendas', () => {
        let agg;

        before(async () => {
          const result = await service('bdx').search({}, { size: 0 }, {
            detailed: true,
            aggregations: ['sourceAgendas']
          });
          agg = result.aggregations.sourceAgendas;
        });

        it('source agendas are listed with corresponding event counts', () => {
          agg.filter(a => a.key === 38598267)[0].should.eql({
            key: 38598267,
            agenda: {
              uid: 38598267,
              title: 'Ville de CENON',
              image: 'agenda38598267.jpg'
            },
            eventCount: 167
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
          originAgendaAggregation[0].key.should.equal(94573624);
        });

        it('each aggregation provides basic info on agenda', () => {
          originAgendaAggregation[0].should.eql({
            key: 94573624,
            eventCount: 174,
            agenda: {
              uid: 94573624,
              title: 'Rocher de Palmer',
              image: 'agenda94573624.jpg',
              slug: "rocher-de-palmer",
              url: 'https://lerocherdepalmer.fr/'
            }
          });
        });

        it('size option can be used to return specific number of items', async () => {
          const count = (await service('bdx').search({}, { size: 0 }, {
            detailed: true,
            aggregations: [{
              type: 'originAgendas',
              size: 3
            }]
          }).then(({ aggregations }) => aggregations.originAgendas.length));

          count.should.equal(3);
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
            new Date('2020-12-31T09:30:00.000Z')
          );
        });
      });

      describe('states', () => {
        let statesAggregation;

        before(async () => {
          const result = await service('bdx').search({ state: null }, { size: 0 }, {
            detailed: true,
            aggregations: 'states'
          });

          statesAggregation = result.aggregations.states;
        });

        it('provides count for each state', () => {
          statesAggregation.should.eql([{
            key: 2,
            eventCount: 518
          }, {
            key: 1,
            eventCount: 1
          }, {
            key: 0,
            eventCount: 2
          }]);
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
          agg['thematiques-bordeaux-metropole'].values[0].should.eql({
            id: 9,
            key: 9,
            value: 'culture',
            label: { fr: 'Culture' },
            eventCount: 37
          });
        });

        it('label is provided for each field', () => {
          agg['thematiques-bordeaux-metropole'].label.fr.should.eql('Thématiques Bordeaux Métropole');
        });

      });

      describe('additionalFields for specific field', () => {
        let agg;

        before(async () => {
          agg = await service('bdx').search({}, { size: 0 }, {
            detailed: true,
            formSchema,
            aggregations: [{
              key: 'et_bim',
              type: 'additionalFields',
              field: 'thematiques-bordeaux-metropole'
            }]
          }).then(r => r.aggregations['et_bim']);
        });

        it('only values of field are collected', () => {
          agg[0].should.eql({
            id: 9,
            key: 9,
            value: 'culture',
            label: { fr: 'Culture' },
            eventCount: 118
          });
        });

        it('if field is not known, BadRequest error is thrown', async () => {
          let error;
          try {
            await service('bdx').search({
            }, { size: 0 }, {
              detailed: true,
              formSchema,
              aggregations: [{
                key: 'et_paf',
                type: 'additionalFields',
                field: 'this-field-does-not-exist'
              }]
            })
          } catch (e) {
            error = e;
          }
          error.code.should.equal(400);
          error.name.should.equal('BadRequest');
        });

        it('if field is not known or no values correspond, empty array is returned', async () => {
          const result = await service('bdx').search({
            date: {
              gte: new Date('2010-11-01'),
              lte: new Date('2010-11-01')
            }
          }, { size: 0 }, {
            detailed: true,
            formSchema,
            aggregations: [{
              key: 'et_paf',
              type: 'additionalFields',
              field: 'categories-agenda-metropolitain'
            }]
          }).then(r => r.aggregations['et_paf']);

          result.should.eql([]);
        });
      });

    });

    describe('More like this', () => {

      it('on title alone', async () => {
        const { events } = await service('bdx').moreLikeThis({
          title: { fr: 'Sieste musicale' }
        }, { size: 2 });

        events.map(e => e.slug).should.eql([
          'sieste-musicale-basta',
          'sieste-musicale-marathon-musical-du-combat-du-siecle'
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
        }, { size: 2 });

        events.map(e => e.slug).should.eql([
          'sieste-musicale-basta',
          'sieste-musicale-marathon-musical-du-combat-du-siecle'
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

    describe('Options', () => {
      it('includeLabels includes additional field labels in results', async () => {
        const { events } = await service('bdx')
          .search({}, { size: 1 }, { detailed: true, includeLabels: true, formSchema });
      });
    })

  });

} );
