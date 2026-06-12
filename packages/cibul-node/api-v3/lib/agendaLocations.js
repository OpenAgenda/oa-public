// Shared plumbing for the v3 location routes.
//
// The locations of an agenda live either in its own pool or — when the agenda
// is bound to a shared location set — in that set (locations contributed by
// every agenda of the set). Reads dispatch on `agenda.locationSetUid` exactly
// like `core/agendas/locations/*` does.
//
// The routes call the `agendaLocations` service endpoints directly instead of
// going through `core.agendas(uid).locations.*`: the core wrapper re-fetches
// the agenda we already loaded and rewrites an all-digits `search` into a uid
// filter (`preCleanSearchQuery`), a legacy quirk the v3 contract deliberately
// drops (v3 has a dedicated `uid` filter).

import getAgenda from '../../core/agendas/utils/getAgenda.js';
import { schemasWithEvent } from '../../core/agendas/utils/merge.js';

export function locationEndpoints(core, agenda) {
  const { agendaLocations } = core.services;

  return agenda.locationSetUid
    ? agendaLocations.sets(agenda.locationSetUid).locations
    : agendaLocations(agenda.uid);
}

// The merged (network + agenda) form schema, public access — the service
// filters a location's legacy tags against it (only tags declared in the
// schema's location tagSet survive). Needed whenever the full `Location`
// shape (which carries `additionalFields`) is returned.
export async function loadLocationFormSchema(core, agenda) {
  const detailedAgenda = await getAgenda(core.services, agenda.uid, {
    detailed: true,
  });

  return schemasWithEvent(
    detailedAgenda?.network?.formSchema ?? null,
    detailedAgenda.formSchema,
    { access: 'public' },
  );
}
