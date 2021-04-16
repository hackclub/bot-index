FROM node:14-alpine

WORKDIR /usr/src/aoo

COPY . .

RUN yarn install && yarn build

CMD ["yarn", "start"]