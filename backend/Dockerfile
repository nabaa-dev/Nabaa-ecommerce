# ============================================================
#  Dockerfile — Nabaa Store Backend
#  Node.js 20 Alpine (lightweight production image)
# ============================================================

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm install --omit=dev

# Copy source code
COPY server.js .

# Expose API port
EXPOSE 5000

# Health check (Docker will monitor the container health)
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

# Start the server
CMD ["node", "server.js"]
