#!/bin/sh
# Script d'initialisation des volumes Docker
# Exécuté en root pour fixer les permissions des volumes nommés

set -e

# Récupérer l'UID/GID cible
TARGET_UID=${LOCAL_UID:-1000}
TARGET_GID=${LOCAL_GID:-1000}

echo "Initialisation des volumes pour UID:GID = $TARGET_UID:$TARGET_GID"

# Fixer les permissions de node_modules si nécessaire
if [ -d /workspace/node_modules ]; then
    current_owner=$(stat -c '%u' /workspace/node_modules 2>/dev/null || echo "0")
    if [ "$current_owner" != "$TARGET_UID" ]; then
        echo "Correction des droits sur node_modules..."
        chown -R "$TARGET_UID:$TARGET_GID" /workspace/node_modules
    else
        echo "node_modules déjà avec les bons droits"
    fi
else
    echo "Création de node_modules avec les bons droits..."
    mkdir -p /workspace/node_modules
    chown "$TARGET_UID:$TARGET_GID" /workspace/node_modules
fi

echo "Initialisation terminée"
