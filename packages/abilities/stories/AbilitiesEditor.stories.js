import React from 'react';
import { storiesOf } from '@storybook/react';
import AbilitiesEditor from '../src/client/AbilitiesEditor';

import '@openagenda/bs-templates/compiled/main.css';

function withJestSleep(ms = 1) {
  return element => (process.env.STORYBOOK_MODE === 'test'
    ? {
      element,
      jestWaitTime: ms,
    }
    : element);
}

const getHostname = () => (typeof window !== 'undefined' ? window.location.hostname : 'localhost');

storiesOf('AbilitiesEditor', module)
  .add('for a user', () => withJestSleep(1500)(
    <AbilitiesEditor
      locale="fr"
      entityName="user"
      identifier={99999999}
      res={{
        // get + patch
        formIndex: `http://${getHostname()}:${
          process.env.STORYBOOK_API_PORT
        }/abilities/form-index`,
      }}
    />
  ))
  .add('with HeaderComponent', () => withJestSleep(1500)(
    <AbilitiesEditor
      locale="fr"
      entityName="user"
      identifier={99999999}
      res={{
        // get + patch
        formIndex: `http://${getHostname()}:${
          process.env.STORYBOOK_API_PORT
        }/abilities/form-index`,
      }}
      HeaderComponent={() => <div>Un header bidon</div>}
    />
  ))
  .add('with filter input', () => withJestSleep(1500)(
    <AbilitiesEditor
      locale="fr"
      entityName="user"
      identifier={99999999}
      res={{
        // get + patch
        formIndex: `http://${getHostname()}:${
          process.env.STORYBOOK_API_PORT
        }/abilities/form-index`,
      }}
      searchChildKey="entity.agendaTitle"
      HeaderComponent={() => (
        <div>
          Bon là on ne voit pas le champ de recherche parce qu&apos;il faut au
          minimum 8 agendas...
        </div>
      )}
    />
  ));
