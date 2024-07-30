FROM node:lts AS builder

RUN apt-get update \
  && apt-get install redis-server -y

LABEL maintainer="georgeomiebi@gmail.com"

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 9000

CMD ["node", "server.js"]