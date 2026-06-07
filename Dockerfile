FROM python:3.14-slim

WORKDIR /usr/src/app

ARG NODE_VERSION=24.16.0

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl dos2unix xz-utils \
    && curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" \
      | tar -xJ -C /usr/local --strip-components=1 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt package.json package-lock.json ./

RUN python -m pip install --no-cache-dir -r requirements.txt
RUN npm ci --silent

COPY . .

RUN find . -type f -exec dos2unix {} \;
RUN npm run build

# If you are building your code for production
# RUN npm install --only=production

EXPOSE 8888
CMD ["python", "backend.py"]
