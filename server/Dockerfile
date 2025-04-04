# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the app
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the TypeScript project
RUN npm run build

# Set environment variables (these will be overridden by .env or docker-compose)
ENV NODE_ENV=production

# Expose port (change if your app uses a different port)
EXPOSE 8080

# Start the app
CMD ["node" , "dist/index.js"]