Pour installer grafana sur public cloud il faut:

- créer une paire de clé SSH
- créer un volume Ubuntu 24.04
- créer une instance avec 8 vCPU et 32Go de RAM; groupe de sécurité avec SSH + HTTP + HTTPS

Sur l'instance il faut :

- installer Docker
- cloner le repo OpenAgenda/observability
- copier le .env.example en .env et le compléter
- démarrer docker compose

## Agents

Pour installer des agents Alloy:

https://grafana.com/docs/alloy/latest/set-up/install/linux/

Modifier le `/etc/alloyconfig.alloy`.

Ajouter les certificats dans `/etc/alloy/certs` (`ca.crt`, `agent.key` et `agent.crt`).

Corriger les droits des certificats :

```bash
# dossier
sudo chown -R root:alloy /etc/alloy/certs
sudo chmod 0750 /etc/alloy/certs

# CA et cert
sudo chmod 0644 /etc/alloy/certs/ca.crt /etc/alloy/certs/agent.crt

# clé privée
sudo chmod 0640 /etc/alloy/certs/agent.key
```

Relancer Alloy : `sudo systemctl reload alloy`

### Agent MySQL

Il faut d'abord créer un utilisateur mysql:

```
CREATE USER 'alloy_monitor'@'127.0.0.1' IDENTIFIED BY '<PASSWORD>';

GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO 'alloy_monitor'@'127.0.0.1';
GRANT SELECT ON performance_schema.* TO 'alloy_monitor'@'127.0.0.1';
GRANT SHOW DATABASES ON *.* TO 'alloy_monitor'@'127.0.0.1';

FLUSH PRIVILEGES;
```

Et la config Alloy de l'instance MySQL doit ressembler à ça :

```
logging {
  level = "warn"
}

otelcol.receiver.otlp "in" {
  grpc { endpoint = "0.0.0.0:4317" }
  http { endpoint = "0.0.0.0:4318" }

  output {
    logs    = [otelcol.processor.batch.main.input]
    traces  = [otelcol.processor.batch.main.input]
    metrics = [otelcol.processor.batch.main.input]
  }
}

otelcol.processor.batch "main" {
  output {
    logs    = [otelcol.exporter.otlp.to_central.input]
    traces  = [otelcol.exporter.otlp.to_central.input]
    metrics = [otelcol.exporter.otlp.to_central.input]
  }
}

otelcol.exporter.otlp "to_central" {
  client {
    endpoint = "telemetry.oagenda.com:443"
    tls {
      // ca_file   = "/etc/alloy/certs/ca.crt"
      cert_file = "/etc/alloy/certs/agent.crt"
      key_file  = "/etc/alloy/certs/agent.key"
      server_name = "telemetry.oagenda.com"
    }
  }
}

// -----------------------------
// Bridge Prometheus -> OTLP -> central
// -----------------------------

otelcol.receiver.prometheus "mysql_bridge" {
  output {
    metrics = [otelcol.processor.batch.main.input]
  }
}

// -----------------------------
// MySQL -> Prometheus -> OTLP -> to_central
// -----------------------------

prometheus.exporter.mysql "integrations_mysqld_exporter" {
  data_source_name = "alloy_monitor:MOT_DE_PASSE@tcp(127.0.0.1:3306)/?tls=skip-verify"
}

discovery.relabel "integrations_mysqld_exporter" {
  targets = prometheus.exporter.mysql.integrations_mysqld_exporter.targets

  rule {
    target_label = "job"
    replacement  = "integrations/mysql"
  }

  rule {
    target_label = "instance"
    replacement  = constants.hostname
  }
}

prometheus.scrape "integrations_mysqld_exporter" {
  targets    = discovery.relabel.integrations_mysqld_exporter.output
  forward_to = [otelcol.receiver.prometheus.mysql_bridge.receiver]
  job_name   = "integrations/mysql"
}

// -----------------------------
// Unix -> Prometheus -> OTLP -> to_central
// -----------------------------
prometheus.exporter.unix "node" {
  include_exporter_metrics = true
  disable_collectors       = ["mdadm"]
}

discovery.relabel "node" {
  targets = prometheus.exporter.unix.node.targets

  rule {
    target_label = "job"
    replacement  = "integrations/node_exporter"
  }

  rule {
    target_label = "instance"
    replacement  = constants.hostname
  }
}

prometheus.scrape "node" {
  clustering {
    enabled = false
  }

  targets = array.concat(
    discovery.relabel.node.output,
    [{
      job         = "alloy",
      instance    = constants.hostname,
      __address__ = "127.0.0.1:12345",
    }],
  )
  forward_to = [otelcol.receiver.prometheus.mysql_bridge.receiver]
}
```
