FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --force

COPY . .
COPY .env .env

EXPOSE 3000

CMD ["npm", "run", "server"]
