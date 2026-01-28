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

# Run the production preview server, binding to Railway's PORT if set
CMD ["sh", "-c", "npm run preview -- --host 0.0.0.0 --port ${PORT:-4173}"]
