FROM node:16.14.2

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --force

COPY . .
COPY .env .env

EXPOSE 3000

CMD ["npm", "run", "server"]
