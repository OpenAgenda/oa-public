import { formatInTimeZone } from 'date-fns-tz';

function extractDates(timings, timezone = 'Europe/Paris') {
  return timings.reduce((dates, timing) => {
    const date = formatInTimeZone(timing.begin, timezone, 'yyyy-MM-dd');
    return dates.includes(date) ? dates : dates.concat(date);
  }, []);
}

function getFlatLabel(label) {
  return typeof label === 'object' ? label[Object.keys(label)[0]] : label;
}

function generateTagsAndGroups(fields) {
  return fields.reduce(
    ({ tg, t }, field) => {
      const tgIndex = tg.length;
      tg.push(getFlatLabel(field.label));

      field.options.forEach((o) => {
        t.push({
          s: o.value,
          t: getFlatLabel(o.label),
          g: tgIndex,
        });
      });

      return { tg, t };
    },
    { tg: [], t: [] },
  );
}

async function generateMemberData(core, agendaUID) {
  let after;
  const ctl = { e: [], adm: [], mod: [] };
  const mMap = { administrator: 'adm', moderator: 'mod', contributor: 'e' };

  while (after !== null) {
    const { after: nextAfter, items } = await core
      .agendas(agendaUID)
      .members.list({}, { after }, { access: 'internal' });
    for (const member of items) {
      if (!member.userUid) continue;
      ctl[mMap[member.role]].push(member.userUid);
    }
    after = nextAfter;
  }

  return ctl;
}

function refreshLastTiming(lo, timings) {
  if (!timings) {
    return lo;
  }

  const { begin, end } = timings.at(-1);

  if (!lo) {
    return { start: begin, end };
  }

  if (lo.start > begin) {
    return lo;
  }

  return { start: begin, end };
}

function generateEmbedDefaults() {
  return {
    md: false,
    sh: { fb: true, tw: true, gp: true, li: true, tu: true, pi: true },
    synchref: true,
    use_event_slug: false,
    dcss: {
      list: true,
      map: true,
      search: true,
      categories: true,
      tags: true,
      calendar: true,
      form: true,
    },
    sc: true,
    mp: 'all',
    mc: [],
    ma: false,
    mt: false,
    classes: {},
  };
}

async function generateControlData(core, agendaUID) {
  const ctl = {
    ev: [],
    l: [],
    lo: null,
    prv: false,
    sh: true,
    c: 1,
    ct: [],
  };

  const schema = await core.agendas(agendaUID).settings.schema.getMerged();

  const additionalOptionedFields = schema.fields.filter(
    (f) => !!f.options && f.origin !== 'custom',
  );

  const includeFields = [
    'uid',
    'location.uid',
    'slug',
    'timings',
    'timezone',
    'location.latitude',
    'location.longitude',
  ];

  additionalOptionedFields.forEach((f) => includeFields.push(f.field));

  for await (const event of await core
    .agendas(agendaUID)
    .events.search({}, null, {
      stream: true,
      includeFields,
    })) {
    const t = additionalOptionedFields.reduce((tags, field) => {
      []
        .concat(event[field.field])
        .map((id) => field.options.find((o) => o.id === id)?.value)
        .filter((v) => !!v)
        .forEach((tag) => {
          if (!tags.includes(tag)) tags.push(tag);
        });
      return tags;
    }, []);

    if (event.location && !ctl.l.find(({ u }) => u === event.location?.uid)) {
      ctl.l.push({
        u: event.location.uid,
        lt: event.location.latitude,
        lg: event.location.longitude,
      });
    }

    ctl.ev.push({
      u: event.uid,
      l: event.location?.uid,
      s: event.slug,
      tz: event.timezone,
      d: extractDates(event.timings, event.timezone),
      t,
    });

    ctl.lo = refreshLastTiming(ctl.lo, event.timings);
  }

  return Object.assign(
    ctl,
    await generateMemberData(core, agendaUID),
    generateTagsAndGroups(additionalOptionedFields),
    generateEmbedDefaults(),
  );
}

export default async function controlDataMw(req, res, next) {
  const { simpleCache, core } = req.app.services;

  if (!req.agenda) {
    return next();
  }

  const cachedData = await simpleCache
    .hash('agendas', req.agenda.uid)
    .get('controlData', { json: true });

  if (cachedData) {
    res.json({
      success: true,
      code: 200,
      data: cachedData,
    });
    return;
  }

  const data = await generateControlData(core, req.agenda.uid);

  await simpleCache.hash('agendas', req.agenda.uid).set('controlData', data);

  res.json({
    success: true,
    code: 200,
    data,
  });
}
