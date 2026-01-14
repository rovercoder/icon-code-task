# Build stage
FROM node:25-alpine AS build
WORKDIR /app
COPY app/package*.json ./
RUN npm install
COPY app/. .
RUN npm run build

# Serve stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
