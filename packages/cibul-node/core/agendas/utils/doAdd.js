import VError from '@openagenda/verror';
import logs from '@openagenda/logs';
import { getAccessFromMember } from '../../utils/authorizations.js';
import refreshAgenda from './refreshAgenda.js';
import convertLocationAdditionalFields from './convertLocationAdditionalFields.js';
import formatError from './formatError.js';

const log = logs('core/agendas/utils/doAdd');

export default async (core, payload, clean, options = {}) => {
  const agenda = payload.getAgenda();
  const event = payload.getEvent();

  const { services } = core;

  const { aggregators, agendaEvents, eventSearch, custom, tracker } = services;

  log('info', 'processing agenda %s, event %s', agenda.uid, event.uid);
  tracker('core.agendas.doAdd');

  const {
    batched,
    aggregated,
    sourceAgenda,
    draft,
    userUid: actingUserUid,
    access,
    duplicateOrigin,
  } = {
    batched: false,
    aggregated: null,
    sourceAgenda: null,
    draft: false,
    access: 'public',
    ...options,
  };

  let actingMember;

  if (!actingUserUid) {
    log('warn', 'user is not identified');
  }

  if (!draft) {
    try {
      const { created, before } = await agendaEvents(agenda.uid).create(
        event.uid,
        clean.agendaEvent,
        {
          aggregated,
          context: {
            event,
            agenda,
            batched,
            aggregated,
            sourceAgenda,
            userUid: actingUserUid,
            duplicateOrigin,
          },
          decorate: ['sourceAgendas', 'user'],
        },
      );

      actingMember = actingUserUid
        ? await core.agendas(agenda).members.get(actingUserUid, {
          access: 'internal',
          roleAsSlug: false,
        })
        : undefined;

      if (actingUserUid) {
        created.member = actingMember;
      }

      payload.setItem('agendaEvent', before, created);
    } catch (e) {
      throw new VError(
        e,
        'could not create agenda-event reference for agenda uid %s and event uid %s',
        agenda.uid,
        event.uid,
      );
    }
  }

  // create custom data
  if (agenda.formSchemaId && clean.custom) {
    const result = await custom(agenda.formSchemaId).set(
      event.uid,
      clean.custom,
      { validate: false, partial: true }, // validation is already done
    );
    payload.setItem('custom.agenda', result.before, result.custom);
  } else if (agenda.formSchemaId) {
    const agendaData = await custom(agenda.formSchemaId).get(event.uid);
    payload.setItem('custom.agenda', agendaData, agendaData);
  }

  if (agenda.network?.formSchemaId && clean.networkCustom) {
    const result = await custom(agenda.network.formSchemaId).set(
      event.uid,
      clean.networkCustom,
      { validate: false, partial: true }, // validation is already done
    );
    payload.setItem('custom.network', result.before, result.custom);
  } else if (agenda.network?.formSchemaId) {
    const networkData = await custom(agenda.network?.formSchemaId).get(
      event.uid,
    );
    payload.setItem('custom.network', networkData, networkData);
  }

  if (draft) {
    return payload.getResponse('event', access);
  }

  if (
    actingUserUid
    && await core.agendas(agenda).settings.isOpen()
    && !await core
      .agendas(agenda)
      .members.is(actingUserUid, { access: 'internal' })
  ) {
    log(
      'user %s is not a member on open contribution agenda that does not require member info.',
      actingUserUid,
    );
    actingMember = await core.agendas(agenda).members.create(
      actingUserUid,
      'contributor',
      {},
      {
        access: 'internal',
        useAccountEmail: true,
      },
    );
  }

  const response = await payload.getResponse(
    'event',
    getAccessFromMember(core.services, actingMember, access),
  );
  const compiledEvent = await payload.getCompiledEvent('after', null, null, {
    valid: true,
  }); // full access for internal use
  const formSchema = await payload.getFormSchema({ access: 'internal' }); // full access for internal use

  try {
    await eventSearch.add({
      ...response,
      formSchema,
      event: event.location
        ? convertLocationAdditionalFields(formSchema, compiledEvent)
        : compiledEvent,
    });
  } catch (e) {
    log(
      'error',
      'could not add event %s.%s to search indices',
      agenda.uid,
      event.uid,
      formatError(e),
    );
  }

  await aggregators.notify('addEvent', {
    event: compiledEvent,
    agenda,
    formSchema,
    batched,
  });

  await refreshAgenda(agenda.uid);

  return response;
};
