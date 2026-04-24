FROM node:20-alpine

# Cài đặt các thư viện cần thiết cho Prisma chạy trên Alpine
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package.json ./
# Copy yarn.lock nếu có để đảm bảo tính nhất quán (vẫn chạy tốt nếu không có vì dùng *)
COPY yarn.lock* ./ 

# Tăng timeout lên 10 phút (600000ms) để tránh lỗi mạng
RUN yarn config set network-timeout 600000 && yarn install

COPY . .

# Quan trọng: Tạo Prisma Client trước khi build TS
RUN yarn prisma:generate

RUN yarn build

EXPOSE 4000

CMD ["yarn", "start"]
