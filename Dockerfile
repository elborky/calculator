# syntax=docker/dockerfile:1
#
# Calculator — Dokploy "Dockerfile" build type (self-hosted, Static/NGINX serve).
# Multi-stage: a Node stage builds the Vite static bundle, an NGINX stage serves it.
#
# Why a custom Dockerfile (not Dokploy's built-in "Static" build type):
#   the Static type serves the bundle with Dokploy's OWN fixed nginx config, which
#   cannot carry the security headers from storm/ship/01-security-audit.md (F-7).
#   A custom multi-stage image lets us own nginx.conf — headers, SPA fallback,
#   gzip, and cache-control for content-hashed assets — which is the craft-floor
#   requirement (C3). Output is identical in spirit: plain static files behind nginx
#   on port 80, fronted by Traefik + Let's Encrypt on the Dokploy instance.

# ---- Stage 1: build the static bundle ----
FROM node:22-alpine AS build
WORKDIR /app

# Install deps from the lockfile (reproducible, hash-locked) before copying source,
# so the dep layer caches across source-only changes.
COPY package.json package-lock.json ./
RUN npm ci

# Build: `npm run build` runs `tsc --noEmit && vite build` -> emits /app/dist
COPY . .
RUN npm run build

# ---- Stage 2: serve with NGINX ----
FROM nginx:1.27-alpine AS serve

# Replace the default server block with our hardened one (headers + SPA + caching),
# plus the security-headers snippet it `include`s into every location.
COPY nginx.conf            /etc/nginx/conf.d/default.conf
COPY security-headers.conf /etc/nginx/security-headers.conf

# Vite build output -> nginx web root.
COPY --from=build /app/dist /usr/share/nginx/html

# nginx:alpine's entrypoint already launches nginx in the foreground on port 80.
EXPOSE 80
