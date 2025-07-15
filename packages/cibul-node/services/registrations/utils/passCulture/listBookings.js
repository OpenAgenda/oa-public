import { VError } from '@openagenda/verror';
import logs from '@openagenda/logs';

const log = logs('services/registrations/utils/passCulture/listBookings');

const buildSummary = (bookings) => {
  const summary = {
    totalQuantity: 0,
    statusQuantities: {
      CONFIRMED: 0,
      USED: 0,
      CANCELLED: 0,
      REIMBURSED: 0,
    },
  };

  bookings.forEach(({ quantity = 0, status }) => {
    summary.totalQuantity += quantity;
    summary.statusQuantities[status] += quantity;
  });
  return summary;
};

export default async function listBookings(
  { services },
  agenda,
  event,
  actingUserUid,
) {
  try {
    const { registrations, core } = services;
    log.debug('listBookings request', {
      agenda: agenda?.uid,
      event: event?.uid,
      actingUserUid,
    });

    // Validate required parameters
    if (!agenda || !event || !actingUserUid) {
      const missingParams = [];
      if (!agenda) missingParams.push('agenda');
      if (!event) missingParams.push('event');
      if (!actingUserUid) missingParams.push('actingUserUid');

      throw new VError({
        name: 'BadRequestError',
        statusCode: 400,
        message: 'Missing required parameters',
        info: {
          missingParams,
          agenda: agenda?.uid,
          event: event?.uid,
          actingUserUid,
        },
      });
    }

    // Check if agenda has registration settings
    if (!agenda.settings?.registration) {
      throw new VError({
        name: 'BadRequestError',
        statusCode: 400,
        message: 'No pass configuration for this agenda',
        info: { agenda: agenda.uid, event: event.uid, actingUserUid },
      });
    }

    // Check if event has passCulture registration data
    const passCultureRegistration = event.registration?.find(
      ({ service }) => service === 'passCulture',
    );

    const passData = passCultureRegistration?.data;
    const passId = passData?.[0]?.response?.passId;

    if (!passId) {
      throw new VError({
        name: 'BadRequestError',
        statusCode: 400,
        message: 'No pass data linked to this event',
        info: { agenda: agenda.uid, event: event.uid, actingUserUid },
      });
    }

    // Check user authorization
    let context;
    try {
      context = await core
        .users(actingUserUid)
        .agendas(agenda.uid)
        .events(event.uid)
        .getContext({
          userUid: actingUserUid,
        });
    } catch (error) {
      throw new VError({
        cause: error,
        name: 'InternalServerError',
        statusCode: 500,
        message: 'Failed to get user context',
        info: { agenda: agenda.uid, event: event.uid, actingUserUid },
      });
    }

    if (!context.me.authorizations.canEditEvent) {
      throw new VError({
        name: 'ForbiddenError',
        statusCode: 403,
        message: 'Not authorized to access this information',
        info: { agenda: agenda.uid, event: event.uid, actingUserUid },
      });
    }

    // Get passCulture service
    const passCultureService = registrations(
      agenda.settings.registration,
    ).passCulture;

    // Get bookings
    let bookings;
    try {
      bookings = await passCultureService.listBookings(passId);
    } catch (error) {
      throw new VError({
        cause: error,
        name: 'InternalServerError',
        statusCode: 500,
        message: 'Failed to fetch bookings from passCulture service',
        info: { agenda: agenda.uid, event: event.uid, actingUserUid, passId },
      });
    }

    if (!bookings || !Array.isArray(bookings)) {
      throw new VError({
        name: 'InternalServerError',
        statusCode: 500,
        message: 'Invalid response from passCulture service',
        info: { agenda: agenda.uid, event: event.uid, actingUserUid, passId },
      });
    }

    log.debug('Bookings retrieved successfully', {
      agenda: agenda.uid,
      event: event.uid,
      actingUserUid,
      passId,
      bookingsCount: bookings.length,
    });

    return {
      bookings,
      total: bookings.length,
      summary: buildSummary(bookings),
    };
  } catch (error) {
    log.error('Error in listBooking', error);
    throw error;
  }
}
