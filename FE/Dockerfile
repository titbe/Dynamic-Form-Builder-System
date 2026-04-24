FROM node:20-alpine

WORKDIR /app

COPY package.json ./
# Copy yarn.lock nếu có
COPY yarn.lock* ./

# Tăng timeout lên 10 phút (600000ms) để tránh lỗi mạng
RUN yarn config set network-timeout 600000 && yarn install

COPY . .

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]
