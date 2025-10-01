import memberSchema from '@openagenda/members/iso/schema.js';
import { createIntlByLocale } from '@openagenda/intl';
import * as locales from '@openagenda/agenda-schemas-app/dist/locales-compiled/index.js';
import logs from '@openagenda/logs';
import _ from 'lodash';
import getAgenda from './getAgenda.js';

const log = logs('core/agendas/utils/getMemberSchema');

const intlByLocale = createIntlByLocale(locales);

const getActingMember = async (services, agenda, options) => {
  if (options.member) return options.member;
  if (options.actingMember) return options.actingMember;
  if (options.userUid) {
    return services.members.get({
      agendaUid: agenda.uid,
      userUid: options.userUid,
    });
  }
  return null;
};

const getAccess = async (services, actingMember, options) => {
  const { members } = services;
  if (actingMember) {
    return members.utils.getRoleSlug(actingMember.role);
  }
  return options.access ?? 'public';
};

const getAmindMod = (access) =>
  ['internal', 'administrator', 'moderator'].includes(access);

const isOptionalFields = (agenda, adminMod, memberSchemaId) => {
  if (adminMod) return true;
  if (memberSchemaId) return true;
  if (!agenda.settings.contribution.useFields) return true;
  return false;
};

export default async (services, agendaOrUid, options = {}) => {
  const { formSchemas } = services;
  const agenda = _.isObject(agendaOrUid)
    ? agendaOrUid
    : await getAgenda(services, agendaOrUid);
  const actingMember = await getActingMember(services, agenda, options);
  const access = await getAccess(services, actingMember, options);
  const adminMod = getAmindMod(access);
  const { memberSchemaId } = agenda;
  const optionalFields = isOptionalFields(agenda, adminMod, memberSchemaId);

  log('info', 'fetching for agenda %s isAdmin %s', agenda.uid, adminMod);

  if (!memberSchemaId) {
    return {
      merged: memberSchema({ optionalFields }),
      schema: memberSchema({ optionalFields }),
      agendaSchema: null,
    };
  }

  const aditionalFields = await formSchemas.get(memberSchemaId);

  // If schema doesn't exist or failed to load, return default schema
  if (!aditionalFields) {
    log(
      'warn',
      'memberSchemaId %s not found for agenda %s, using default schema',
      memberSchemaId,
      agenda.uid,
    );
    return {
      merged: memberSchema({ optionalFields }),
      schema: memberSchema({ optionalFields }),
      agendaSchema: null,
    };
  }

  if (adminMod) {
    aditionalFields.fields = aditionalFields.fields.map((f) => ({
      ...f,
      optional: true,
    }));
  }

  return {
    merged: formSchemas.utils.merge(
      memberSchema({ optionalFields }),
      aditionalFields,
      { access: { read: access } },
    ),
    schema: formSchemas.utils.merge(
      memberSchema({ optionalFields }),
      {},
      { access: { read: access } },
    ),
    agendaSchema: {
      id: aditionalFields.id,
      ...formSchemas.utils.merge(
        aditionalFields,
        {},
        { access: { read: access } },
      ),
    },
  };
};

export const andParents = async function getMemberSchemaAndParents(
  services,
  agendaOrUid,
  options,
) {
  // affichage pour la config, only admins
  const { formSchemas } = services;
  const { lang = 'fr' } = options;
  const intl = intlByLocale[lang] || intlByLocale.fr;
  const agenda = _.isObject(agendaOrUid)
    ? agendaOrUid
    : await getAgenda(services, agendaOrUid);
  const { memberSchemaId } = agenda;

  const parents = [
    {
      schema: { ...memberSchema({ optionalFields: !!memberSchemaId }), id: -1 },
      info: {
        label: intl.formatMessage({ id: 'AgendaSchema.member' }),
        detail: intl.formatMessage({ id: 'AgendaSchema.memberDetail' }),
      },
    },
  ];

  if (!memberSchemaId) {
    return {
      schema: null,
      parents,
    };
  }
  const aditionalFields = await formSchemas.get(memberSchemaId);

  // If schema doesn't exist, return null schema
  if (!aditionalFields) {
    log(
      'warn',
      'memberSchemaId %s not found for agenda %s in andParents',
      memberSchemaId,
      agendaOrUid?.uid || agendaOrUid,
    );
    return {
      schema: null,
      parents,
    };
  }

  return {
    schema: {
      id: memberSchemaId,
      ...aditionalFields,
    },
    parents,
  };
};
