FROM node:14-alpine

WORKDIR /usr/src/notification_service

COPY package*.json ./

RUN npm install
RUN npm install -g pm2

COPY . ./

EXPOSE 8081
EXPOSE 9092

CMD npm run start