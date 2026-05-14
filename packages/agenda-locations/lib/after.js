export function make(result, nav) {
  if (!result.rows?.length) {
    return null;
  }

  const lastRow = result.rows[result.rows.length - 1];
  const orderParts = nav.order.split('.');

  if (orderParts[0] === 'name') {
    return [lastRow.placename, lastRow.id];
  }

  return lastRow.id;
}

export function include(nav) {
  if (!nav.useAfter) {
    return [];
  }

  if (nav.order.split('.')[0] === 'name') {
    return ['id', 'placename'];
  }

  return ['id'];
}
