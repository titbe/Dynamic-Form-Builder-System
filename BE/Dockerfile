FROM node:20-alpine

WORKDIR /app

COPY package.json ./
# Copy yarn.lock nếu có để đảm bảo tính nhất quán (vẫn chạy tốt nếu không có vì dùng *)
COPY yarn.lock* ./ 

RUN yarn install

COPY . .

# Quan trọng: Tạo Prisma Client trước khi build TS
RUN yarn prisma:generate

RUN yarn build

EXPOSE 4000

CMD ["yarn", "start"]
