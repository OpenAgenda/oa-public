export function reset({ res, page, perPageLimit, filter, search }) {
  const currentRes = Array.isArray(res) ? res[0] : res;

  return {
    page: page ?? 1,
    res,
    search: search ?? '',
    currentRes,
    perPageLimit,
    filter,
  };
}

export function defineParams(nav) {
  const params = {
    search: nav.search,
  };

  if (nav.filter) {
    Object.assign(params, nav.filter);
  }

  if (nav.page > 1) {
    params.page = nav.page;
  }

  return params;
}

export function hasMore(nav) {
  const { currentRes, res, perPageLimit, total, page } = nav;

  if (Array.isArray(res) && res.indexOf(currentRes) < res.length - 1) {
    // last res has not been solicited yet
    return true;
  }

  if (perPageLimit * page >= total) {
    return false;
  }

  return true;
}

export function loadNext(nav) {
  const { currentRes, res, perPageLimit, page, total } = nav;

  const totalReached = !!(perPageLimit * page >= total);

  if (!totalReached) {
    return {
      ...nav,
      page: page + 1,
    };
  }

  if (!Array.isArray(res)) {
    return false;
  }

  const currentResIndex = res.indexOf(currentRes);

  if (currentResIndex >= res.length - 1) {
    return false;
  }

  return {
    ...nav,
    currentRes: res[currentResIndex + 1],
    page: 1,
    total: null,
  };
}

export function isStart(nav) {
  if (!Array.isArray(nav.res)) {
    return nav.page === 1;
  }

  const currentResIndex = nav.res.indexOf(nav.currentRes);

  if (currentResIndex === 0 && nav.page === 1) {
    return true;
  }

  return false;
}
