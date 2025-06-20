const utils = {
  isArray: Array.isArray,
  extend: (target, ...sources) => Object.assign({}, target, ...sources),
  fZ: (num) => String(num).padStart(2, '0'), // Format with leading zero
};

/**
 * Helper functions
 */
function _link(url, data) {
  const parts = [];

  for (const k in data) {
    if (data[k] !== null) {
      parts.push(`${k}=${data[k]}`);
    }
  }

  const separator = parts.length && !url.includes('?') ? '?' : '&';
  return url + separator + parts.join('&');
}

function _linkifyTime(time) {
  if (time === null) return null;

  let timeString = time;
  if (typeof time !== 'string') {
    timeString = JSON.stringify(time);
  }

  return timeString.replace(/00\.0|:|-|"/g, '');
}

function _timeDiff(end, start) {
  const endDate = typeof end === 'string' ? new Date(end) : end;
  const startDate = typeof start === 'string' ? new Date(start) : start;

  const diff = Math.abs(endDate - startDate) / (1000 * 60);
  const minutes = diff % 60;
  const hours = (diff - minutes) / 60;

  return utils.fZ(hours) + utils.fZ(minutes);
}

function _description(data, encodeUrl = true) {
  let description = null;
  let url = null;

  if (data.description) {
    description = encodeURIComponent(data.description);
  }

  if (data.url) {
    url = encodeUrl ? encodeURIComponent(data.url) : data.url;
  }

  if (description === null && url === null) {
    return null;
  }

  if (url === null) {
    return description;
  }

  if (description === null) {
    return url;
  }

  return `${description} - ${url}`;
}

function _location(data) {
  return data.location && data.address
    ? encodeURIComponent(`${data.location} - ${data.address}`)
    : null;
}

/**
 * Service implementations
 */
function _googleCalendar(data) {
  return _link('http://www.google.com/calendar/event?action=TEMPLATE', {
    text: encodeURIComponent(data.title),
    dates:
      data.start && data.end
        ? `${_linkifyTime(data.start)}/${_linkifyTime(data.end)}`
        : null,
    sprop: data.url ? `website:${data.url}` : null,
    details: _description(data, false),
  });
}

function _yahoo(data) {
  return _link('http://calendar.yahoo.com/?v=60', {
    TITLE: encodeURIComponent(data.title),
    ST: _linkifyTime(data.start),
    DUR: data.start && data.end ? _timeDiff(data.end, data.start) : null,
    in_loc: _location(data),
    DESC: _description(data),
    URL: data.url,
  });
}

function _live(data) {
  return _link('http://calendar.live.com/calendar/calendar.aspx?rru=addevent', {
    summary: encodeURIComponent(data.title),
    location: _location(data),
    dtstart: _linkifyTime(data.start),
    dtend: _linkifyTime(data.end),
    description: _description(data),
  });
}

function _facebook(data) {
  return `https://www.facebook.com/sharer.php?u=${encodeURIComponent(data.url)}`;
}

function _twitter(data) {
  return `https://twitter.com/share?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(data.title)}`;
}

function _linkedIn(data) {
  return _link('http://www.linkedin.com/shareArticle', {
    url: encodeURIComponent(data.url),
    title: encodeURIComponent(data.title),
    source:
      data.siteUrl || data.url
        ? encodeURIComponent(data.siteUrl || data.url)
        : null,
  });
}

function _googlePlus(data) {
  return `https://plus.google.com/share?url=${encodeURIComponent(data.url)}`;
}

function _pinterest(data) {
  return _link('http://pinterest.com/pin/create/button/', {
    url: encodeURIComponent(data.url),
    description: _description(data),
    imageUrl: data.image ? encodeURIComponent(data.image) : null,
  });
}

function _tumblr(data) {
  return `http://tumblr.com/share?s=&v=3&u=${encodeURIComponent(data.url)}&title=${encodeURIComponent(data.title)}`;
}

const services = {
  googleCalendar: _googleCalendar,
  yahoo: _yahoo,
  live: _live,
  facebook: _facebook,
  twitter: _twitter,
  linkedIn: _linkedIn,
  googlePlus: _googlePlus,
  pinterest: _pinterest,
  tumblr: _tumblr,
};

/**
 * Main export function
 */
function load(usedServices) {
  // eslint-disable-next-line no-param-reassign
  usedServices = utils.isArray(usedServices) ? usedServices : [usedServices];

  const unknown = usedServices.filter(
    (s) => !Object.keys(services).includes(s),
  );

  if (unknown.length) {
    throw new Error(`Unknown services: ${unknown.join(', ')}`);
  }

  function has(service) {
    return usedServices.includes(service);
  }

  function getLink(service, data) {
    if (!has(service)) throw new Error('Not a service');

    return services[service](
      utils.extend(
        {
          title: null,
          description: null,
          url: null,
          start: null,
          end: null,
          siteUrl: null,
          image: null,
        },
        data,
      ),
    );
  }

  function getLinks(data) {
    const links = {};

    usedServices.forEach((s) => {
      links[s] = services[s](data);
    });

    return links;
  }

  return {
    has,
    getLink,
    getLinks,
  };
}

function share(req, res, next) {
  const { core } = req.app.services;
  const config = core.getConfig();

  const shares = load(config.shares.agenda);

  if (!shares.has(req.params.service)) {
    return next({
      code: 404,
      message: 'This share type does not exist',
    });
  }

  if (!req.agenda) {
    return next({
      code: 404,
      message: 'Agenda not found',
    });
  }

  req.log.info({
    message: 'sharing agenda',
    uid: req.agenda.uid,
    slug: req.agenda.slug,
    service: req.params.service,
  });

  res.redirect(
    shares.getLink(req.params.service, {
      title: req.agenda.title,
      description: req.agenda.description,
      url: req.genUrl(
        'agendaShow',
        { slug: req.agenda.slug },
        { abs: true, protocol: 'https://' },
      ),
      siteUrl: config.root,
    }),
  );
}

export default (app) => {
  const { agendas: agendasSvc } = app.services;
  app.get(
    '/:slug/share/:service',
    agendasSvc.middleware.load({
      internal: true,
      namespaces: {
        identifiers: {
          slug: 'params.slug',
        },
      },
    }),
    share,
  );
};
