import _ from 'lodash';
import ODSJSONParser from '../ODSJSONParser.js';
import rdvj from './fixtures/rdvj-2019-nouvelle-aquitaine.json' with { type: 'json' };
import jep from './fixtures/jep-2018-grand-est.json' with { type: 'json' };

const fixtures = {
  rdvj,
  jep,
};

describe('01 - exports - ODS json export parser', () => {
  const parsedEvents = ODSJSONParser(
    fixtures.rdvj.tagSet,
    fixtures.rdvj.events,
  );
  const tagSetGroupNames = fixtures.rdvj.tagSet.groups.map((g) => g.name);
  const firstEventKeys = _.keys(parsedEvents[0]);

  test('tagSet group names are keys of event object', () => {
    tagSetGroupNames.forEach((groupName) => {
      expect(firstEventKeys.includes(groupName)).toEqual(true);
    });
  });

  test('tags and tagGroup keys are removed', () => {
    ['tags', 'tagGroups'].forEach((previousKey) => {
      expect(firstEventKeys.includes(previousKey)).toEqual(false);
    });
  });
});
