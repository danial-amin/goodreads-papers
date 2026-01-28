FROM node:20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (clean install for CI)
RUN npm ci

# Copy application code
COPY . .

# Build the app
RUN npm run build

# Expose port used by `vite preview`
EXPOSE 4173

# Run a simple static server instead of Vite preview to avoid host checking issues
CMD ["sh", "-c", "npm run serve"]
