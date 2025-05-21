import logs from '@openagenda/logs';

const log = logs('passCulture/listBooking');

export default async function listBooking(pc, passId, listParams) {
  let allBookings = [];
  let firstIndex = 1;
  let currBookings = null;
  while (
    currBookings === null
    || currBookings.length === (listParams?.size || 50)
  ) {
    try {
      const { bookings } = await pc.offers
        .events(passId)
        .bookings.list({ ...listParams, firstIndex });
      currBookings = bookings;
      allBookings = allBookings.concat(bookings);
      firstIndex += bookings.length;
    } catch (error) {
      log.error('service, listBooking error', error);
      throw error;
    }
  }
  return allBookings;
}
