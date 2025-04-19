FROM node:20 AS builder

WORKDIR /

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_API_HOST
ENV VITE_API_HOST=${VITE_API_HOST}

ARG VITE_API_PORT
ENV VITE_API_PORT=${VITE_API_PORT}

ARG VITE_API_BASE_PATH
ENV VITE_API_BASE_PATH=${VITE_API_BASE_PATH}

RUN npm run build

FROM node:20

WORKDIR /
RUN npm install -g serve

COPY --from=builder /dist .

EXPOSE 8081

CMD ["serve", "-s", ".", "-l", "8081"]
