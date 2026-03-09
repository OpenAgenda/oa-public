import { Forbidden, BadRequest, NotFound } from '@openagenda/verror';
import getAgenda from '../utils/getAgenda.js';

export default (core, agendaOrUid) =>
  async (identifiers, targetAgendaUid, options = {}) => {
    const { agendaLocations, members } = core.services;

    const { context = {}, access = null } = options;

    // Extract userUid from context (API) or top-level options (tests)
    const actingUserUid = context.userUid || options.userUid;

    // Verify access is provided
    if (!actingUserUid && access !== 'internal') {
      throw new BadRequest('userUid option is required');
    }

    const agenda = await getAgenda(core.services, agendaOrUid);

    // Get target agenda and verify actingMember has adminmod role
    let targetAgenda;
    try {
      targetAgenda = await getAgenda(core.services, targetAgendaUid);
    } catch (error) {
      if (error.name === 'NotFound') {
        throw new NotFound(
          {
            info: { uid: targetAgendaUid },
          },
          'target agenda not found',
        );
      }
      throw error;
    }

    if (access !== 'internal') {
      const actingMember = await members.get({
        agendaUid: targetAgenda.uid,
        userUid: actingUserUid,
      });

      const {
        utils: { getRoleSlug },
      } = members;

      const actingRoleSlug = actingMember
        ? getRoleSlug(actingMember.role)
        : null;

      if (!['administrator', 'moderator'].includes(actingRoleSlug)) {
        throw new Forbidden(
          'Not authorized to transfer locations to target agenda',
        );
      }
    }

    // Always use agenda endpoint for transfer (no set handling)
    const endpoints = agendaLocations(agenda.uid);

    return endpoints.transfer(identifiers, targetAgendaUid, {
      ...options,
      agendaUid: agenda.uid,
      context: {
        ...context,
        agendaUid: agenda.uid,
      },
    });
  };
