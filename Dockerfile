# 🐵 大圣 CLI - Docker 镜像

FROM node:18-alpine

# 安装必要依赖（canvas 需要）
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev

# 设置工作目录
WORKDIR /app

# 复制 package.json
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install 

# 复制源代码
COPY . .

# 构建
RUN pnpm build

# 设置入口
ENTRYPOINT ["node", "dist/cli/index.js"]
