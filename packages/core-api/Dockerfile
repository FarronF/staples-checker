FROM node:20-alpine AS build
WORKDIR /app

# Copy package files from the core-api directory
COPY packages/core-api/package*.json ./
RUN npm ci

# Copy tsconfig files
COPY packages/core-api/tsconfig.json ./
COPY tsconfig.base.json ./

# Copy source code
COPY packages/core-api/src ./src

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Copy package files for production install
COPY packages/core-api/package*.json ./
RUN npm ci --only=production

# Copy built application
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["npm", "start"]