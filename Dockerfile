FROM node:16

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . .

ENV PORT=3000

EXPOSE 3000

CMD ["yarn", "start"]