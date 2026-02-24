# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Layer cache: install deps before copying source
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
# nginx:alpine is the standard base for static serving.
# For production environments that forbid running as root, consider replacing
# this with nginxinc/nginx-unprivileged and adjusting the listen port to 8080.
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/RIU-Frontend-Matias-Gonzalez/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
