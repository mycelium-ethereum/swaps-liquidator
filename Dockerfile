FROM node:16

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . .

ENV PORT=8080

EXPOSE 8080

CMD ["yarn", "start"]