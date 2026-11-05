FROM node:24-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN chown node:node /app
USER node

COPY --chown=node:node package.json package-lock.json ./
# Keep the pinned Prisma CLI for the db:inspect command in this learning starter.
RUN npm ci --include=dev

COPY --chown=node:node . .
# Generate for Linux inside the image, not from a host's node_modules directory.
RUN npm run db:generate

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "src/server.js"]
