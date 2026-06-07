# Dashboards Grafana — MCP

Deux dashboards **à importer manuellement** (pas de provisioning as-code : elles
coexistent avec tes dashboards existantes et restent éditables dans l'UI).

| Fichier                            | uid            | Contenu                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`mcp-usage.json`](mcp-usage.json) | `oa-mcp-usage` | Usage applicatif : `execute` calls/s par `outcome`, ratio d'erreur, latence p50/p95/p99, in-flight, hit-ratio + spares du warm-pool, `search_docs` calls/s, **RAM + CPU pic par µVM** : _host_peak_ / _cpu_ (empreinte hôte réelle = `VmHWM` + `utime+stime` du VMM libkrun) + _workload_peak_ / _workload_cpu_ (au-dessus du baseline boot ≈ ce que le run a touché), **rejets de concurrence** par `reason` (queue_full / timeout / shutting_down) et **churn du warm-pool** (created / failed / expired). Source = les métriques OTel `oa_mcp_*` (voir `packages/mcp/src/metrics.js`). |
| [`mcp-host.json`](mcp-host.json)   | `oa-mcp-host`  | Ressources hôte (VPS `mcp-ovh`) : CPU/RAM/disque/réseau/load, depuis node_exporter (`job=integrations/node_exporter`).                                                                                                                                                                                                                                                                                                                              |

## Importer

1. Grafana → **Dashboards → New → Import**.
2. Coller le contenu du `.json` (ou _Upload_).
3. À l'invite **datasource**, choisir la source **Mimir/Prometheus**.

Les `uid` sont neufs (`oa-mcp-*`) : l'import **crée** de nouvelles dashboards et
n'écrase aucune des tiennes (l'écrasement n'arrive qu'en réimportant le même uid
en cochant _Overwrite_). Édite-les librement ensuite ; pour les versionner,
ré-exporte le JSON ici.

## Pré-requis

- **`mcp-host`** marche dès maintenant (node_exporter scrapé par l'Alloy hôte —
  Étape 11 du runbook).
- **`mcp-usage`** nécessite que le MCP émette ses métriques OTel, c.-à-d.
  `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT` posé dans `~/oa-mcp.env` (voir le runbook
  `mcp-deploiement-vps.md`).

> **Noms de séries.** Les métriques partent en OTLP et sont converties en
> Prometheus côté ingestion (Mimir). Les panneaux supposent la convention
> standard OTLP→Prometheus : `oa.mcp.execute` (counter) → `oa_mcp_execute_total`,
> histogramme `oa.mcp.execute.duration` (unité `ms`) →
> `oa_mcp_execute_duration_milliseconds_bucket`, gauges `oa_mcp_warm_pool_idle` /
> `oa_mcp_concurrency_inflight`, histogrammes µVM `oa.mcp.uvm.host_peak` /
> `oa.mcp.uvm.workload_peak` (unité `By`) → `oa_mcp_uvm_host_peak_bytes_bucket` /
> `oa_mcp_uvm_workload_peak_bytes_bucket`, et `oa.mcp.uvm.cpu` /
> `oa.mcp.uvm.workload_cpu` (unité `s`) → `oa_mcp_uvm_cpu_seconds_bucket` /
> `oa_mcp_uvm_workload_cpu_seconds_bucket`, le counter `oa.mcp.concurrency.rejected`
> (label `reason`) → `oa_mcp_concurrency_rejected_total`, et les counters de churn
> du warm-pool `oa.mcp.warm_pool.created` / `.failed` / `.expired` →
> `oa_mcp_warm_pool_created_total` / `oa_mcp_warm_pool_failed_total` /
> `oa_mcp_warm_pool_expired_total`, etc. Si ta chaîne d'ingestion nomme autrement
> (suffixe d'unité, `_total`), ajuste les requêtes après le premier déploiement —
> `label_values(oa_mcp_execute_total, instance)` dans Explore confirme les noms réels.

> **Label `instance` (variable `$instance`).** Le MCP ne pose pas un label
> `instance` : il émet l'attribut de ressource OTLP `service.instance.id`
> (`OTEL_SERVICE_INSTANCE_ID`/`HOSTNAME`). Côté ingestion Prometheus/Mimir, les
> resource-attributes ne sont **pas** promus en labels (`instance`/`job`) par
> défaut — ils atterrissent dans `target_info`. Tant que la promotion n'est pas
> activée (`promote_resource_attributes: [service.instance.id]` côté OTLP receiver
> Mimir, ou la translation `service.name`→`job` / `service.instance.id`→`instance`),
> le sélecteur `$instance` reste vide et le filtrage par instance ne marche pas
> (en `All` = `.*` les panneaux s'affichent quand même). Vérifie après le premier
> scrape ; sinon active la promotion, ou retire le filtre `instance` des requêtes.
