import React from 'react';
import '@openagenda/bs-templates/compiled/main.css';
import MemberFormComponent from '../src/components/MemberForm';
import InstructionsComponent from '../src/components/Instructions';
import StepperComponent from '../src/components/Stepper';
import EventNewFormComponent from '../src/components/EventNewForm';
import EventEditFormComponent from '../src/components/EventEditForm';
import ClosedMessageComponent from '../src/components/ClosedMessage';
import cleanupSchemaForForm from '../src/lib/cleanupSchemaForForm';
import ComponentsCanvasDecorator from './decorators/ComponentsCanvas';
import ProvidersDecorator from './decorators/Providers';

import mdbDetailed from './fixtures/mdb.detailed.agenda.json';

export default {
  title: 'Components',
  decorators: [ProvidersDecorator, ComponentsCanvasDecorator]
};

export const MemberForm = () => (
  <div className="padding-h-sm">
    <MemberFormComponent
      member={null}
      res="http://localhost:3000/members/:userUid"
      onSuccess={member => {
        // eslint-disable-next-line no-console
        console.log(member);
      }}
    />
  </div>
);

export const Instructions = () => (
  <InstructionsComponent
    message="Some instructions in **Markdown**"
  />
);

export const Stepper = () => (
  <div className="wsq padding-all-md">
    <StepperComponent
      steps={[{
        display: true,
        activable: true,
        step: 'member'
      }, {
        display: true,
        activable: true,
        active: true,
        step: 'event'
      }, {
        display: true,
        activable: false,
        step: 'confirmation'
      }]}
    />
  </div>
);

const eventFormConfig = {
  tiles: 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
  schemaExtensions: [],
  fileStore: {
    type: 's3',
    bucket: 'oadev'
  },
  locationRes: '/locations',
  referencesRes: '/references',
  suggestionsRes: '/suggestions',
  lang: 'fr',
  maxFileSize: 200000000,
  authorizations: {
    canEditEvent: true
  }
};

export const EventNewForm = () => (
  <div className="padding-all-sm">
    <EventNewFormComponent
      memberRole="contributor"
      config={{
        withErrors: false,
        lang: 'fr',
        schema: cleanupSchemaForForm(mdbDetailed.schema, { locale: 'fr' }),
        locationRes: {},
        referencesRes: {},
        suggestionsRes: {},
        maxFileSize: 0,
        fileStore: {},
        tiles: 'til.es'
      }}
      onSuccess={e => {
        // eslint-disable-next-line no-console
        console.log(e);
      }}
    />
  </div>
);

export const EventEditForm = () => (
  <EventEditFormComponent
    config={eventFormConfig}
    event={{
      title: { fr: 'Un titre' },
      description: { fr: 'Une description courte' }
    }}
  />
);

export const ClosedMessageForContributors = () => (
  <ClosedMessageComponent
    memberRole="contributor"
  />
);

export const ClosedMessageForAdministrators = () => (
  <ClosedMessageComponent
    memberRole="administrator"
  />
);
