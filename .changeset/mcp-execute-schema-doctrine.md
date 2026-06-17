---
'@openagenda/mcp': patch
---

The `execute` tool description now carries the agenda schema-first doctrine: when working with an agenda, fetch its event form schema first (`oa.agendas.events.schema`) — it defines the agenda's topology, whose own fields drive stats (the `additionalFields` facet) and complete event payloads. The tool description is the closest universally-supported text to where the LLM composes its code, which is why the guidance lives there rather than in per-operation docs.
