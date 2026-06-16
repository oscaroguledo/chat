FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_URL=""
ARG VITE_WS_URL=""
ARG VITE_APP_NAME="ChatApp"

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL
ENV VITE_APP_NAME=$VITE_APP_NAME

COPY package*.json ./
RUN npm ci --silent

COPY . .
RUN npm run build

FROM nginx:1.25-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
