# Stage 1: Dependencies
FROM --platform=linux/arm64 node:18-alpine AS deps
# Install build dependencies for native modules including lightningcss
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    gcc \
    musl-dev \
    linux-headers
WORKDIR /app

# Copy package files
COPY package*.json ./
# Install all dependencies including optional dependencies for native bindings
RUN npm ci --include=optional

# Stage 2: Builder
FROM --platform=linux/arm64 node:18-alpine AS builder
# Install build dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    gcc \
    musl-dev \
    linux-headers
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build application
RUN npm run build

# Stage 3: Runner (Production)
FROM --platform=linux/arm64 node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]
