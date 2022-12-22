'use strict';

const fs = require('fs');
const _ = require('lodash');

const config = require('../testconfig');
const Service = require('..');

describe('02 - event search - functional: Applied search', () => {
  describe('Bordeaux Métropole', () => {
    let service;
    const formSchema = JSON.parse(fs.readFileSync(`${__dirname}/fixtures/applied/bordeaux-metropole.schema.json`));

    beforeAll(() => {
      service = Service(config);
    });

    beforeAll(async () => {
      try {
        await service.getConfig().client.indices.delete({
          index: 'test',
        });
      } catch (e) {
        // console.log(e);
      }
    });

    beforeAll(async () => {
      await service('bdx').rebuild({
        eventsList: async (lastId, limit) =>
          JSON.parse(fs.readFileSync(`${__dirname}/fixtures/applied/bordeaux-metropole.${lastId}.${limit}.json`)),
        formSchema,
      });
    });

    describe('Data structure', () => {
      const uid = 11438560;

      describe('basic', () => {
        let event;

        beforeAll(async () => {
          event = await service('bdx')
            .search({ uid }, {})
            .then(r => r.events[0]);
        });

        it('an event can be retrieved by uid', () => {
          expect(event.uid).toBe(uid);
        });

        it('origin agenda is available', () => {
          expect(event.originAgenda).toEqual({
            uid: 1108324,
            image: 'agenda1108324.jpg',
            title: 'Un air de Bordeaux',
          });
        });
      });

      describe('detailed', () => {
        let event;

        beforeAll(async () => {
          event = await service('bdx')
            .search({ uid }, {}, { detailed: true })
            .then(({ events }) => events[0]);
        });

        it('timings are provided in detailed', () => {
          expect(event.timings instanceof Array).toBe(true);
        });

        it('source agendas are available', () => {
          expect(event.sourceAgendas instanceof Array).toBe(true);
        });

        it('registration is a list [{ type, value }]', async () => {
          expect(event.registration).toEqual([{
            type: 'link',
            value: 'http://william-theviot.fr',
          }]);
        });
      });

      describe('with formSchema', () => {
        let event;

        beforeAll(async () => {
          event = await service('bdx')
            .search({ uid }, {}, { formSchema })
            .then(({ events }) => events[0]);
        });

        it('event with requested uid is retrieved', () => {
          expect(event.uid).toBe(uid);
        });

        it('additional fields are included in result', () => {
          expect(event['thematiques-bordeaux-metropole']).toEqual([9]);
        });
      });
    });

    describe('Search', () => {
      it('events can be filtered by member', async () => {
        const { total } = await service('bdx')
          .search({ memberUid: 75052324 }, {});
        expect(total).toBe(204);
      });

      it('events can be filtered by multiple members', async () => {
        const { total } = await service('bdx')
          .search({ memberUid: [75052324, 65133249] }, {});
        expect(total).toBe(228);
      });

      it('events can be filtered by origin agenda', async () => {
        const { total } = await service('bdx').search({
          originAgendaUid: 19486837,
        }, {});

        expect(total).toBe(1);
      });

      it('events can by filtered by creation date', async () => {
        const { total } = await service('bdx').search({
          createdAt: {
            lte: new Date('2019-01-01'),
          },
        }, {});

        expect(total).toBe(2);
      });

      it('events can be filtered buy update date', async () => {
        const { total } = await service('bdx').search({
          createdAt: {
            gte: new Date('2019-06-01'),
            lte: new Date('2020-01-01'),
          },
        }, {});

        expect(total).toBe(425);
      });

      it('events can be filtered by source agenda', async () => {
        const { total } = await service('bdx').search({
          sourceAgendaUid: 1108324,
        }, {}, { detailed: true });

        expect(total).toBe(38);
      });

      it('filter by city', async () => {
        const { total } = await service('bdx').search({
          city: 'Bordeaux',
        }, {});

        expect(total).toBe(129);
      });

      it('filter by district', async () => {
        const { total } = await service('bdx').search({
          district: 'Bordeaux Maritime',
        }, {});

        expect(total).toBe(26);
      });

      it('filter by department', async () => {
        const { total } = await service('bdx').search({
          department: 'Gironde',
        }, {});

        expect(total).toBe(507);
      });

      it('get events matching one state', async () => {
        const { total } = await service('bdx').search({
          state: 2,
        }, {});

        expect(total).toBe(518);
      });

      it('search for multiple states', async () => {
        const { total } = await service('bdx').search({
          state: [1, 0],
        }, {});

        expect(total).toBe(3);
      });

      it('state can be passed as string or array of string', async () => {
        const { total } = await service('bdx').search({
          state: ['1', '0'],
        });

        expect(total).toBe(3);
      });
    });

    describe('Sort and navigation', () => {
      it('scroll through results', async () => {
        const {
          total,
          events,
          scrollId,
        } = await service('bdx').search({}, {
          scroll: '1m',
        }, {
          detailed: true,
          formSchema,
        });

        let hasMore = true;

        do {
          const {
            events: moreEvents,
          } = await service('bdx').search.scroll(scrollId, '1m');

          if (moreEvents.length) {
            moreEvents.forEach(e => events.push(e));
          } else {
            hasMore = false;
          }
        } while (hasMore);

        expect(events.length).toBe(total);
      });

      it('navigation with search after and default sort', async () => {
        const {
          events: chunkOfEvents,
        } = await service('bdx').search({}, { size: 10 });

        const {
          sort: searchAfter,
        } = await service('bdx').search({}, { size: 2 });

        const {
          events: secondSmallerChunkOfEvents,
        } = await service('bdx').search({}, { size: 2, searchAfter });

        expect(
          chunkOfEvents[2].uid,
        ).toBe(
          secondSmallerChunkOfEvents[0].uid,
        );
      });

      it('if useAfterKey option is used, after key is provided', async () => {
        const {
          events: chunkOfEvents,
        } = await service('bdx').search({}, { size: 10 });

        const {
          after,
        } = await service('bdx').search({}, { size: 2 }, { useAfterKey: true });

        const {
          events: secondSmallerChunkOfEvents,
        } = await service('bdx').search({}, { size: 2, after }, { useAfterKey: true });

        expect(
          chunkOfEvents[2].uid,
        ).toBe(
          secondSmallerChunkOfEvents[0].uid,
        );
      });

      it(
        'if useAfterKey option is used, given sort key gives effective sort',
        async () => {
          const {
            sort,
          } = await service('bdx').search({}, { size: 2 }, { useAfterKey: true });

          expect(sort).toBe('timingsWithFeatured.asc');
        },
      );

      it(
        'fix: after key is provided event when search filter is used',
        async () => {
          const result = await service('bdx').search({
            search: 'Spectacle',
          }, { size: 1 }, { useAfterKey: true });

          expect(result.after).toBeTruthy();
        },
      );
    });

    describe('Additional fields search', () => {
      it('search by additional optioned field', async () => {
        const {
          total,
          events,
        } = await service('bdx').search({
          'thematiques-bordeaux-metropole': 9,
        }, {}, { formSchema });

        expect(total).toBe(118);

        for (const event of events) {
          expect(
            event['thematiques-bordeaux-metropole']
              .filter(id => id === 9)
              .length,
          ).toBe(1);
        }
      });

      it(
        'search by additional optioned field with multiple values (matches either)',
        async () => {
          const {
            total,
            events,
          } = await service('bdx').search({
            'thematiques-bordeaux-metropole': [9, 13, 23],
          }, {}, { formSchema });

          events.forEach(e => {
            expect(
              e['thematiques-bordeaux-metropole'].filter(id => [9, 13, 23].includes(id)).length,
            ).toBeGreaterThan(0);
          });

          expect(total).toBe(127);
        },
      );
    });

    describe('CRUD operations', () => {
      const data = JSON.parse(fs.readFileSync(`${__dirname}/fixtures/applied/bordeaux-metropole.event.json`));
      let addResult;

      beforeAll(async () => {
        addResult = await service('bdx').add(data, {
          formSchema,
          refresh: true, // index must be refreshed directly for test
        });
      });

      afterAll(async () => {
        try {
          await service('bdx').remove({ uid: data.uid });
        } catch (e) {
          // console.log(e);
        }
      });

      it('adding a document went well', async () => {
        expect(addResult.success).toBe(true);
      });

      it('added document can be retrieved through its uid', async () => {
        const {
          events,
        } = await service('bdx').search({
          uid: data.uid,
        }, { formSchema });

        expect(events[0].uid).toBe(data.uid);
      });

      it('updating a document standard field', async () => {
        const result = await service('bdx').update({ uid: data.uid }, {
          ...data, // this is not a patch, all data must be provided
          state: 1,
        }, {
          refresh: true,
          formSchema,
        });

        expect(result.success).toBe(true);

        const { events } = await service('bdx').search({
          uid: data.uid,
          state: null,
        }, {}, { detailed: true });

        expect(events.length).toBe(1);
        expect(events[0].state).toBe(1);
      });

      it('updating a document additional field', async () => {
        await service('bdx').update({ uid: data.uid }, {
          ...data, // this is not a patch, all data must be provided
          'thematiques-bordeaux-metropole': [3, 7, 8],
        }, {
          refresh: true,
          formSchema,
        });

        const event = await service('bdx').search({
          uid: data.uid,
          state: null,
        }, {}, {
          detailed: true,
          first: true,
          formSchema,
        });

        expect(event['thematiques-bordeaux-metropole']).toEqual([3, 7, 8]);
      });

      it('removing a document', async () => {
        const result = await service('bdx').remove({
          uid: data.uid,
        }, {
          refresh: true,
        });

        expect(result.success).toBe(true);

        const { events } = await service('bdx').search({
          uid: data.uid,
          state: null,
        });

        expect(events.length).toBe(0);
      });
    });

    describe('Aggregations', () => {
      describe('keywords', () => {
        let agg; let
          agg2;

        beforeAll(async () => {
          agg = await service('bdx').search({}, { size: 0 }, {
            detailed: true,
            aggregations: 'keywords',
          }).then(r => r.aggregations.keywords);

          agg2 = await service('bdx').search({}, { size: 0 }, {
            aggregations: {
              type: 'keywords',
              size: 20,
            },
          }).then(r => r.aggregations.keywords);
        });

        it('default number of keywords retured is 10', () => {
          expect(agg.length).toBe(10);
        });

        it('size option allows to get more than 10 items', () => {
          expect(agg2.length).toBe(20);
        });

        it('one item has a key and an event count', () => {
          expect(agg[0]).toEqual({
            key: 'cenon',
            eventCount: 174,
          });
        });
      });

      describe('createdAt / updatedAt / createdOrUpdatedAt', () => {
        let updatedAtAgg;
        let createdAtAgg;
        let createdOrUpdatedAtAgg;

        beforeAll(async () => {
          const aggs = await service('bdx').search({
            date: { gte: '2020-03-01' },
          }, { size: 0 }, {
            detailed: true,
            aggregations: ['createdAt', 'updatedAt', 'createdOrUpdatedAt'],
          }).then(({ aggregations }) => aggregations)
            .catch(_err => {});

          createdAtAgg = aggs.createdAt;
          updatedAtAgg = aggs.updatedAt;
          createdOrUpdatedAtAgg = aggs.createdOrUpdatedAt;
        });

        it('createdAt agg is a list of { eventCount, key }', () => {
          expect(Object.keys(createdAtAgg[0])).toEqual(['key', 'eventCount']);
        });

        it('updatedAt agg is a list of { eventCount, key }', () => {
          expect(Object.keys(updatedAtAgg[0])).toEqual(['key', 'eventCount']);
        });

        it('createdOrUpdatedAt agg is a list of { eventCount, key }', () => {
          expect(Object.keys(createdOrUpdatedAtAgg[0])).toEqual(['key', 'eventCount']);
        });
      });

      describe('fixedInterval option', () => {
        let createdAtAgg;

        beforeAll(async () => {
          const aggs = await service('bdx').search({
            createdAt: { gte: '2020-01-02' },
          }, { size: 0 }, {
            detailed: true,
            aggregations: [{
              type: 'createdAt',
              fixedInterval: '7d',
            }],
          }).then(({ aggregations }) => aggregations)
            .catch(_err => {
              // console.log(err.body.error)
            });

          createdAtAgg = aggs.createdAt;
        });

        it('createdAt agg starts in the middle of the week', () => {
          expect(createdAtAgg[0]).toEqual({ key: '2020-01-02', eventCount: 7 });
        });
      });

      describe('timings', () => {
        describe('by day', () => {
          let agg;

          beforeAll(async () => {
            const result = await service('bdx').search({}, { size: 0 }, {
              detailed: true,
              aggregations: 'timings',
            });

            agg = result.aggregations.timings;
          });

          it(
            'there are as many items in timings aggregation as there are dates in lifespan of result',
            () => {
              expect(agg.length).toBe(748);
            },
          );

          it(
            'each item is a { key, timingCount } pair, the key being a date (YYYY-MM-DD)',
            () => {
              expect(_.first(agg)).toEqual({
                key: '2018-12-15',
                timingCount: 1,
              });
              expect(_.last(agg)).toEqual({
                key: '2020-12-31',
                timingCount: 1,
              });
            },
          );
        });

        describe('by month', () => {
          let agg;

          beforeAll(async () => {
            const result = await service('bdx').search({}, { size: 0 }, {
              detailed: true,
              aggregations: [{
                type: 'timings',
                interval: 'month',
                format: 'YYYY-MM',
              }],
            });

            agg = result.aggregations.timings;
          });

          it('key follows specified format', () => {
            expect(agg[0].key).toBe('2018-12');
          });

          it('count is timings count', () => {
            expect(agg[0].timingCount).toBe(1);
          });
        });

        describe('both - using key option', () => {
          let agg;

          beforeAll(async () => {
            const result = await service('bdx').search({
              date: {
                gte: '2020-04-01',
                lte: '2020-04-02',
              },
            }, { size: 0 }, {
              detailed: true,
              aggregations: [{
                key: 'timingsByMonth',
                type: 'timings',
                interval: 'month',
                format: 'YYYY-MM',
              }, {
                key: 'timingsByDay',
                type: 'timings',
                interval: 'day',
              }],
            });

            agg = result.aggregations;
          });

          it('both are provided in their respective keys', () => {
            expect(Object.keys(agg)).toEqual(['timingsByMonth', 'timingsByDay']);
          });

          it('day keys matching date filter are the only ones to be provided', () => {
            expect(agg.timingsByDay).toEqual([
              { key: '2020-04-01', timingCount: 7 },
              { key: '2020-04-02', timingCount: 6 },
            ]);
          });

          it(
            'month keys matching date filter are the only ones to be provided',
            () => {
              expect(agg.timingsByMonth).toEqual([{
                key: '2020-04',
                timingCount: 133,
              }]);
            },
          );
        });
      });

      describe('location (regions, departments, cities)', () => {
        let agg;
        let aggMoreItems;

        beforeAll(async () => {
          const result = await service('bdx').search({}, { size: 0 }, {
            detailed: true,
            aggregations: ['regions', 'departments', 'cities'],
          });
          agg = result.aggregations;
        });

        beforeAll(async () => {
          const result = await service('bdx').search({}, { size: 0 }, {
            detailed: true,
            aggregations: {
              type: 'cities',
              size: 20,
            },
          });
          aggMoreItems = result.aggregations;
        });

        it('regions aggregation', () => {
          expect(agg.regions).toEqual([
            { key: 'Nouvelle-Aquitaine', eventCount: 512 },
            { key: 'Île-de-France', eventCount: 1 },
          ]);
        });

        it('departments aggregation', () => {
          expect(agg.departments[0]).toEqual({
            key: 'Gironde',
            eventCount: 507,
          });
        });

        it('cities aggregation', () => {
          expect(agg.cities[0]).toEqual({
            key: 'Cenon',
            eventCount: 183,
          });
        });

        it('by default, max number of returned items is 10', () => {
          expect(agg.cities.length).toBe(10);
        });

        it('if size option is specified, more items can be retrieved', () => {
          expect(aggMoreItems.cities.length).toBe(20);
        });
      });

      describe('members', () => {
        let agg;

        beforeAll(async () => {
          const result = await service('bdx').search({}, { size: 0 }, {
            detailed: true,
            aggregations: ['members'],
          });
          agg = result.aggregations.members;
        });

        it('each aggregation key is the user uid of the member', () => {
          expect(agg[0].key).toBe(75052324);
        });

        it('each aggregation provides name and uid of member', () => {
          expect(agg[0]).toEqual({
            key: 75052324,
            member: { uid: 75052324, name: 'Kaoré - OpenAgenda' },
            eventCount: 204,
          });
        });
      });

      describe('locations', () => {
        let agg;

        beforeAll(async () => {
          const result = await service('bdx').search({}, { size: 0 }, {
            detailed: true,
            aggregations: ['locations'],
          });
          agg = result.aggregations.locations;
        });

        it('each aggregation key is the uid of the location', () => {
          expect(agg[0].key).toBe(18191842);
        });

        it('each aggregation provides name and uid of location', () => {
          expect(agg[0]).toEqual({
            key: 18191842,
            location: { uid: 18191842, name: 'Rocher de Palmer' },
            eventCount: 174,
          });
        });
      });

      describe('source agendas', () => {
        let agg;

        beforeAll(async () => {
          const result = await service('bdx').search({}, { size: 0 }, {
            detailed: true,
            aggregations: ['sourceAgendas'],
          });
          agg = result.aggregations.sourceAgendas;
        });

        it('source agendas are listed with corresponding event counts', () => {
          expect(agg.filter(a => a.key === 38598267)[0]).toEqual({
            key: 38598267,
            agenda: {
              uid: 38598267,
              title: 'Ville de CENON',
              image: 'agenda38598267.jpg',
            },
            eventCount: 167,
          });
        });
      });

      describe('origin agendas', () => {
        let originAgendaAggregation;

        beforeAll(async () => {
          const result = await service('bdx').search({}, { size: 0 }, {
            detailed: true,
            aggregations: ['originAgendas'],
          });
          originAgendaAggregation = result.aggregations.originAgendas;
        });

        it('each aggregation key is the uid of the agenda', () => {
          expect(originAgendaAggregation[0].key).toBe(94573624);
        });

        it('each aggregation provides basic info on agenda', () => {
          expect(originAgendaAggregation[0]).toEqual({
            key: 94573624,
            eventCount: 174,
            agenda: {
              uid: 94573624,
              title: 'Rocher de Palmer',
              image: 'agenda94573624.jpg',
              slug: 'rocher-de-palmer',
              url: 'https://lerocherdepalmer.fr/',
            },
          });
        });

        it(
          'size option can be used to return specific number of items',
          async () => {
            const count = await service('bdx').search({}, { size: 0 }, {
              detailed: true,
              aggregations: [{
                type: 'originAgendas',
                size: 3,
              }],
            }).then(({ aggregations }) => aggregations.originAgendas.length);

            expect(count).toBe(3);
          },
        );
      });

      describe('timespan', () => {
        let timespanAggregation;

        beforeAll(async () => {
          const result = await service('bdx').search({}, { size: 0 }, {
            detailed: true,
            aggregations: 'timespan',
          });

          timespanAggregation = result.aggregations.timespan;
        });

        it('provides first and last Date bracket matching search', () => {
          expect(timespanAggregation.first).toEqual(
            new Date('2018-12-15T16:00:00.000Z'),
          );

          expect(timespanAggregation.last).toEqual(
            new Date('2020-12-31T09:30:00.000Z'),
          );
        });
      });

      describe('states', () => {
        let statesAggregation;

        beforeAll(async () => {
          const result = await service('bdx').search({ state: null }, { size: 0 }, {
            detailed: true,
            aggregations: 'states',
          });

          statesAggregation = result.aggregations.states;
        });

        it('provides count for each state', () => {
          expect(statesAggregation).toEqual([{
            key: 2,
            eventCount: 518,
          }, {
            key: 1,
            eventCount: 1,
          }, {
            key: 0,
            eventCount: 2,
          }]);
        });
      });

      describe('eventsByDateRanges', () => {
        let TRHAggregation;

        beforeAll(async () => {
          const result = await service('bdx').search({
            date: {
              gte: new Date('2019-11-01'),
              lte: new Date('2019-11-30'),
            },
          }, { size: 0 }, {
            detailed: true,
            aggregations: 'eventsByDateRanges',
          });

          TRHAggregation = result.aggregations.eventsByDateRanges;
        });

        it('item of aggregation contains keys {key, count, sampleEvents}', () => {
          expect(Object.keys(TRHAggregation[0])).toEqual(['key', 'eventCount', 'sampleEvents']);
        });

        it('item.key is of format YYYY-MM-DD', () => {
          expect(TRHAggregation[0].key).toBe('2019-11-01');
        });

        it(
          'item.sampleEvents contains 3 events corresponding to provided key',
          () => {
            expect(TRHAggregation[0].sampleEvents.map(e => e.uid).sort()).toEqual([16560750, 75721304]);
          },
        );
      });

      describe('additionalFields', () => {
        let agg;

        beforeAll(async () => {
          agg = await service('bdx').search({
            date: {
              gte: new Date('2019-11-01'),
              lte: new Date('2019-11-30'),
            },
          }, { size: 0 }, {
            detailed: true,
            formSchema,
            aggregations: 'additionalFields',
          }).then(r => r.aggregations.additionalFields);
        });

        it('an object is provided with schema fields as keys', () => {
          expect(Object.keys(agg)).toEqual([
            'thematiques-bordeaux-metropole',
            'intermunicipal_interest',
            'categories-agenda-metropolitain',
          ]);
        });

        it('each field lists event count corresponding to field option', () => {
          expect(agg['thematiques-bordeaux-metropole'].values[0]).toEqual({
            id: 9,
            key: 9,
            value: 'culture',
            label: { fr: 'Culture' },
            eventCount: 37,
          });
        });

        it('label is provided for each field', () => {
          expect(agg['thematiques-bordeaux-metropole'].label.fr).toEqual('Thématiques Bordeaux Métropole');
        });
      });

      describe('additionalFields for specific field', () => {
        let agg;

        beforeAll(async () => {
          agg = await service('bdx').search({}, { size: 0 }, {
            detailed: true,
            formSchema,
            aggregations: [{
              key: 'et_bim',
              type: 'additionalFields',
              field: 'thematiques-bordeaux-metropole',
            }],
          }).then(r => r.aggregations.et_bim);
        });

        it('only values of field are collected', () => {
          expect(agg[0]).toEqual({
            id: 9,
            key: 9,
            value: 'culture',
            label: { fr: 'Culture' },
            eventCount: 118,
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
                field: 'this-field-does-not-exist',
              }],
            });
          } catch (e) {
            error = e;
          }
          expect(error.code).toBe(400);
          expect(error.name).toBe('BadRequest');
        });

        it(
          'if field is not known or no values correspond, empty array is returned',
          async () => {
            const result = await service('bdx').search({
              date: {
                gte: new Date('2010-11-01'),
                lte: new Date('2010-11-01'),
              },
            }, { size: 0 }, {
              detailed: true,
              formSchema,
              aggregations: [{
                key: 'et_paf',
                type: 'additionalFields',
                field: 'categories-agenda-metropolitain',
              }],
            }).then(r => r.aggregations.et_paf);

            expect(result).toEqual([]);
          },
        );
      });
    });

    describe('More like this', () => {
      it('on title alone', async () => {
        const { events } = await service('bdx').moreLikeThis({
          title: { fr: 'Sieste musicale' },
        }, { size: 2 });

        expect(events.map(e => e.slug)).toEqual([
          'sieste-musicale-basta',
          'sieste-musicale-marathon-musical-du-combat-du-siecle',
        ]);
      });

      it('on keywords alone', async () => {
        const { events } = await service('bdx').moreLikeThis({
          keywords: { fr: ['jazz'] },
        }, { size: 3 });

        expect(events.map(e => e.slug)).toEqual([
          'concert-au-quartier-libre',
          'tremplin-martignas-sur-jazz',
          'jazz-club-obradovic-tixier',
        ]);
      });

      it('on title and keywords', async () => {
        const { events } = await service('bdx').moreLikeThis({
          title: { fr: 'Sieste musicale' },
          keywords: { fr: ['jazz'] },
        }, { size: 2 });

        expect(events.map(e => e.slug)).toEqual([
          'sieste-musicale-basta',
          'sieste-musicale-marathon-musical-du-combat-du-siecle',
        ]);
      });

      it('on title and keywords with boosted keywords', async () => {
        const { events } = await service('bdx').moreLikeThis({
          title: { fr: 'Sieste musicale' },
          keywords: { fr: ['jazz'] },
        }, { size: 3, boost: { keywords: 30, title: 10 } });

        expect(events.map(e => e.slug)).toEqual([
          'concert-au-quartier-libre',
          'tremplin-martignas-sur-jazz',
          'jazz-club-obradovic-tixier',
        ]);
      });

      it('on additional field of radio type', async () => {
        const { events } = await service('bdx').moreLikeThis({
          'thematiques-bordeaux-metropole': '3933.9',
        }, { size: 3, formSchema, detailed: true });

        for (const event of events) {
          expect(event['thematiques-bordeaux-metropole'].includes(9)).toBe(true);
        }
      });

      it(
        'on additional field of radio type without scheamId prefixed',
        async () => {
          const { events } = await service('bdx').moreLikeThis({
            'thematiques-bordeaux-metropole': '9',
          }, { size: 3, formSchema, detailed: true });

          for (const event of events) {
            expect(event['thematiques-bordeaux-metropole'].includes(9)).toBe(true);
          }
        },
      );

      it('on location', async () => {
        const { events } = await service('bdx').moreLikeThis({
          location: {
            city: 'Bassens',
          },
        }, { size: 3, detailed: true });

        for (const event of events) {
          expect(event.location.city).toBe('Bassens');
        }
      });
    });

    describe('Options', () => {
      it('includeImageTimestamps', async () => {
        const { events } = await service('bdx')
          .search({}, { size: 1 }, { detailed: true, includeLabels: true, formSchema });

        expect(events[0].image.filename.indexOf('?')).toBe(-1);
      });

      it('useDefaultImage', async () => {
        const { events } = await service('bdx')
          .search({ uid: 27240673 }, { size: 1 }, { useDefaultImage: true });

        expect(events[0].image).toEqual(config.defaultImage);
      });
    });
  });
});
