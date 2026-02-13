FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY angular.json tsconfig.json tsconfig.base.json ./
COPY packages ./packages
COPY apps ./apps

RUN npm ci

CMD ["tail", "-f", "/dev/null"]
