---
'@openagenda/mcp': minor
---

search_docs renders a Components section: every named type a rich card references is defined once in the same response — enum components with their decode table (`EventStatus`: 1 = Scheduled, …), object components with typed, described property lines (e.g. `FormSchemaField.schemaId` marking additional fields). Type names are now uniform across the whole payload: params, response fields and validators all use the component name (`status (EventStatus[])` filters, `status (EventStatus)` on events, `schemas.zEventStatus`), params keep their passable values inline, and object-kind responses render their root field by field with descriptions — so an LLM can write the call AND decode what `execute` returns without a second lookup. The section is render-only (not indexed) so shared components leak no relevance credit between operations.
