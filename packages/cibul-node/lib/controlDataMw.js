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

async function generateControlData(req) {
  const { core } = req.app.services;

  const ctl = {
    ev: [],
    l: [],
    lo: null,
    prv: false,
    sh: true,
    c: 1,
    ct: [],
  };

  const schema = await core.agendas(req.agenda.uid).settings.schema.getMerged();

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
    .agendas(req.agenda.uid)
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
    await generateMemberData(core, req.agenda.uid),
    generateTagsAndGroups(additionalOptionedFields),
  );
}

export default function controlDataMw(req, res, _next) {
  generateControlData(req).then((data) =>
    res.json({ success: true, code: 200, data }));
}
