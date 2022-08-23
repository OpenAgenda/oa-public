import React from 'react';
import '@openagenda/bs-templates/compiled/main.css';

import MemberItem from '../src/components/MemberItem';
import ComponentCanvas from './decorators/ComponentCanvas';
import Providers from './decorators/Providers';

export default {
  title: 'Member list item',
  decorators: [Providers, ComponentCanvas],
};

export const viewedByAdministrator = () => (
  <MemberItem.Component
    user={{
      fullName: 'Sabine Chauchois',
    }}
    member={{
      userUid: 456,
      role: 'administrator',
      custom: {
        contactName: 'Clémentine Bouvier',
        email: 'email@openagenda.com',
        organization: 'OA',
        contactPosition: 'suppert',
        contactNumber: '0651781026',
      },
    }}
    agenda={{
      slug: 'la-gargouille',
      credentials: {
        moderators: true,
      },
    }}
    userRole={2}
    i18n={{
      getLabel: code => ({
        noName: 'Sans nom',
        moreInfoModerator: 'Un détail sur le modérateur',
        moreInfoAdministrator: "Un détail sur l'administrateur",
        noContrib: 'Pas de contributions',
        invited: 'Invité',
        deleted: 'Supprimé',
        moderator: 'Modérateur',
        administrator: 'Administrateur',
        contributor: 'Contributeur',
        changeRole: 'Modifier le rôle',
        removeMember: 'Retirer le membre',
        event: 'x événements',
        editProfile: 'Modifier le profil',
        sendAMessage: 'Contacter',
      }[code] ?? code),
    }}
    LinkComponent={({ children }) => (
      <a href="#bim" className="btn btn-link padding-left-z">
        {children}
      </a>
    )}
  />
);
