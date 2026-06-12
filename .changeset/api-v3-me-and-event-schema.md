---
'@openagenda/api-spec': minor
'@openagenda/api-client': minor
---

Add `me.agendas.list` (`GET /me/agendas` — the caller's agenda memberships with role and private flag, gated by the new `me:read` OAuth scope; publishable keys carry no identity and are denied) and `agendas.events.schema` (`GET /agendas/{agendaUid}/events/schema` — the agenda's merged event form schema served raw and complete in the form-schema vocabulary; per-field `read` access levels gate event values, not the field descriptors served here).

New schemas: `MeAgendaList`, `MeAgendaItem`, `MemberRole`, `EventFormSchema`, `FormSchemaField`.
