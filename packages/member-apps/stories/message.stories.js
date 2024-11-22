import '@openagenda/bs-templates/compiled/main.css';

import SendMessageForm from '../src/components/SendMessageForm/index.js';
import InviteMembersForm from '../src/components/InviteMembersForm/index.js';

import ComponentCanvas from './decorators/ComponentCanvas.js';
import Providers from './decorators/Providers.js';

export default {
  title: 'Message forms',
  decorators: [Providers, ComponentCanvas],
};

export const sendMessageForm = () => (
  <div className="padding-v-sm">
    <SendMessageForm
      onSubmit={
        /* data */ () => {
    // console.log(data);
  }
      }
    />
  </div>
);

export const inviteMessageFormFullyFeatured = () => (
  <div className="padding-v-sm">
    <p>On private calendar, with message and moderators</p>
    <InviteMembersForm
      agenda={{
        private: true,
        credentials: {
          moderators: true,
          invitationMessage: true,
        },
        settings: {
          contribution: {},
        },
      }}
      userCredential={2}
      onSubmit={
        /* data */ () => {
    // console.log(data);
  }
      }
    />
  </div>
);

export const inviteMessageFormPublicWithoutModeratorsNorMessage = () => (
  <div className="padding-v-sm">
    <p>On public calendar, without message nor moderators</p>
    <InviteMembersForm
      agenda={{
        private: false,
        credentials: {
          moderators: false,
          invitationMessage: false,
        },
        settings: {
          contribution: {},
        },
      }}
      userCredential={2}
      onSubmit={
        /* data */ () => {
    // console.log(data);
  }
      }
    />
  </div>
);
