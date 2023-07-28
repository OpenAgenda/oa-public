#!/bin/bash

# Chemin du fichier maintenance.conf
MAINTENANCE_FILE="/etc/nginx/conf.d/maintenance.conf"

# Vérifier si un argument est fourni
if [ $# -ne 1 ]; then
  echo "Utilisation: $0 <on|off>"
  exit 1
fi

# Vérifier si le fichier $MAINTENANCE_FILE existe
if [ ! -f "$MAINTENANCE_FILE" ]; then
  echo "Le fichier '$MAINTENANCE_FILE' n'existe pas."
  exit 1
fi

# Vérifier si l'argument est "on" ou "off"
if [ "$1" = "off" ]; then
  # Ajouter le préfixe "# " au début de chaque ligne
  sed -i 's/^/# /' "$MAINTENANCE_FILE"
  echo "Le mode maintenance est désactivé."
elif [ "$1" = "on" ]; then
  # Retirer le préfixe "# " du début de chaque ligne
  sed -i 's/^# //' "$MAINTENANCE_FILE"
  echo "Le mode maintenance est activé."
else
  echo "Argument invalide. Utilisation: $0 <on|off>"
  exit 1
fi

sudo service nginx reload