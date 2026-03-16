#!/bin/bash

CONFIG_FILE="/etc/alloy/config.alloy"

if [ -f "$CONFIG_FILE" ]; then
  echo "Alloy config found, starting Alloy..."

  if [ -d "/etc/alloy/certs" ]; then
    chown -R root:alloy /etc/alloy/certs
    chmod 0750 /etc/alloy/certs
    chmod 0644 /etc/alloy/certs/ca.crt /etc/alloy/certs/agent.crt 2>/dev/null
    chmod 0640 /etc/alloy/certs/agent.key 2>/dev/null
  fi

  alloy run "$CONFIG_FILE" --storage.path=/var/lib/alloy/data &
else
  echo "No Alloy config found at $CONFIG_FILE, skipping Alloy."
fi

exec "$@"