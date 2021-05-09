FROM node:14-alpine

WORKDIR /usr/src/alert_matcher

COPY package*.json ./

RUN npm install --only=production
RUN npm install -g pm2

COPY . ./

EXPOSE 8080
# EXPOSE 9092

CMD npm run start