FROM node:14-alpine

WORKDIR /usr/src/es_api

COPY package*.json ./

RUN npm install --only=production
RUN npm install -g pm2

COPY . ./

EXPOSE 3000
EXPOSE 9200

CMD npm run start