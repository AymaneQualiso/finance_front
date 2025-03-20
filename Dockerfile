FROM node:20.11.0 as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install -g pnpm@latest-8
RUN pnpm install
COPY ./ .

RUN pnpm run build:icons
RUN pnpm run build

FROM nginx as production-stage
RUN mkdir /app
COPY --from=build-stage /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf
#COPY doc.crt /etc/nginx/doc.crt
#COPY doc.key /etc/nginx/doc.key
