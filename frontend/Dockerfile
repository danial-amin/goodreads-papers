FROM node:20

WORKDIR /app

# Visible in Railway build logs: cache can retain old VITE_API_URL until cache is cleared
RUN echo "==> Railway: Changing VITE_API_URL alone may not invalidate build cache. To force new value: Redeploy → Clear build cache."

# Build-time API URL (must be passed as build arg; baked into frontend at build time).
# Railway: set VITE_API_URL in Variables and ensure it's available at build (not just runtime).
# If you change VITE_API_URL, trigger a fresh deploy or clear build cache so the new value is baked in.
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Copy package files
COPY package*.json ./

# Install dependencies (clean install for CI)
RUN npm ci

# Copy application code
COPY . .

# Log the value we're baking in (visible in Railway/build logs)
RUN echo "==> VITE_API_URL (build-time, will be baked into frontend): '${VITE_API_URL:-<not set, Vite will use default}>'" && \
    echo "==> If this is wrong or empty, set VITE_API_URL as a build variable and redeploy. Railway: clear build cache if the value still doesn't update."

# Build the app (Vite inlines import.meta.env.VITE_API_URL at this step)
RUN npm run build

# Confirm what was baked in (value is in built assets; this reminds from logs)
RUN echo "==> Build complete. Frontend was built with VITE_API_URL='${VITE_API_URL:-<not set>}' (retained in built JS)."

# Expose port used by `vite preview`
EXPOSE 4173

# Run a simple static server instead of Vite preview to avoid host checking issues
CMD ["sh", "-c", "npm run serve"]
