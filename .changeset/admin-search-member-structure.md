---
'@openagenda/event-search': minor
---

Admin-only event search by organizing member structure. Events can now be found via their organizing member's structure (organization), name or position in `admin/events` free-text search. The member data is indexed into a dedicated `_admin_search_member` field that is only added to the `q.search` query for `moderator`+ access, keeping member personal data unreachable through the public search (GDPR). The field is `_`-prefixed so it is never returned in `_source`.
