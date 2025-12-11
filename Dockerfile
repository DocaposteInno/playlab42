# Playlab42 - Container de développement
FROM node:20-alpine

# Outils de base
RUN apk add --no-cache \
    git \
    make \
    bash \
    curl

# Répertoire de travail
WORKDIR /workspace

# Commande par défaut
CMD ["tail", "-f", "/dev/null"]
