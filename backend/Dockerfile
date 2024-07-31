FROM node:current-alpine3.16 as build
WORKDIR /backend
COPY package*.json ./
RUN npm install
COPY . .

FROM node:current-alpine3.16 as prod
WORKDIR /app
COPY --from=build /backend ./
EXPOSE 3000
CMD node server.js