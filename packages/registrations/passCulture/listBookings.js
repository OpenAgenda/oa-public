async function getAll(key, endpoint, params) {
  const all = [];
  let firstIndex = 1;

  while (firstIndex !== -1) {
    const result = await endpoint({
      ...params,
      firstIndex,
    });

    const items = result[key];

    result[key].forEach((item) => all.push(item));

    firstIndex = items.length ? items[items.length - 1].id + 1 : -1;
  }

  return all;
}

export default async function listBookings(pc, passId, params) {
  const { detailed = false, ...listParams } = params;

  const allBookings = await getAll(
    'bookings',
    pc.offers.events(passId).bookings.list,
    listParams,
  );

  if (detailed) {
    const allDates = await getAll(
      'dates',
      pc.offers.events(passId).dates.list,
      listParams,
    );

    allBookings.forEach((booking) => {
      booking.date = allDates.find((d) => d.id === booking.stockId);
    });
  }

  return allBookings;
}
