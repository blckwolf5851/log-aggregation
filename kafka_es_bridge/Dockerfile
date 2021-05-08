FROM node:14-alpine

WORKDIR /usr/src/kafka_es_bridge

COPY package*.json ./

RUN npm install
RUN npm install -g pm2

COPY . ./

EXPOSE 9092

CMD npm run start