FROM node:20

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and config
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript
RUN npm run build

# Run the compiled code
CMD ["node", "dist/index.js"]

