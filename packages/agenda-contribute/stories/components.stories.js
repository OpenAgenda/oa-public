import '@openagenda/bs-templates/compiled/main.css';
import MemberFormComponent from '../src/components/MemberForm.js';
import InstructionsComponent from '../src/components/Instructions.js';
import StepperComponent from '../src/components/Stepper.js';
import EventNewFormComponent from '../src/components/EventNewForm.js';
import EventEditFormComponent from '../src/components/EventEditForm.js';
import ClosedMessageComponent from '../src/components/ClosedMessage.js';
import cleanupSchemaForForm from '../src/lib/cleanupSchemaForForm.js';
import ComponentsCanvasDecorator from './decorators/ComponentsCanvas.js';
import ProvidersDecorator from './decorators/Providers.js';

import immutableMdbDetailed from './fixtures/mdb.detailed.agenda.json' with { type: 'json' };

const mdbDetailed = JSON.parse(JSON.stringify(immutableMdbDetailed));

export default {
  title: 'Components',
  decorators: [ProvidersDecorator, ComponentsCanvasDecorator],
};

export const MemberForm = () => (
  <div className="padding-h-sm">
    <MemberFormComponent
      member={null}
      agenda={immutableMdbDetailed}
      res="http://localhost:3000/members/:userUid"
      onSuccess={(member) => {
        // eslint-disable-next-line no-console
        console.log(member);
      }}
    />
  </div>
);

export const Instructions = () => (
  <InstructionsComponent message="Some instructions in **Markdown**" />
);

export const Stepper = () => (
  <div className="wsq padding-all-md">
    <StepperComponent
      steps={[
        {
          display: true,
          activable: true,
          step: 'member',
        },
        {
          display: true,
          activable: true,
          active: true,
          step: 'event',
        },
        {
          display: true,
          activable: false,
          step: 'confirmation',
        },
      ]}
    />
  </div>
);

const eventFormConfig = {
  tiles: 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
  fileStore: {
    type: 's3',
    bucket: 'main',
  },
  locationRes: '/locations',
  lang: 'fr',
  maxFileSize: 20 * 1024 * 1024,
  authorizations: {
    canEditEvent: true,
  },
  schema: cleanupSchemaForForm(mdbDetailed.schema, { locale: 'fr' }),
};

export const EventNewForm = () => (
  <div className="padding-all-sm">
    <EventNewFormComponent
      memberRole="contributor"
      location={{ search: '' }}
      config={{
        withErrors: false,
        lang: 'fr',
        schema: cleanupSchemaForForm(mdbDetailed.schema, { locale: 'fr' }),
        locationRes: {},
        maxFileSize: 0,
        fileStore: {},
        tiles: 'til.es',
      }}
      onSuccess={(e) => {
        // eslint-disable-next-line no-console
        console.log(e);
      }}
    />
  </div>
);

export const EventEditForm = () => (
  <div className="padding-all-sm">
    <EventEditFormComponent
      config={eventFormConfig}
      event={{
        title: { fr: 'Un titre' },
        description: { fr: 'Une description courte' },
      }}
    />
  </div>
);

export const ClosedMessageForContributors = () => (
  <ClosedMessageComponent memberRole="contributor" />
);

export const ClosedMessageForAdministrators = () => (
  <ClosedMessageComponent memberRole="administrator" />
);
