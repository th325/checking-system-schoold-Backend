 # Dockerfile  
    FROM node:10
    WORKDIR /app  
    COPY package.json /app  
    ENV  GOOGLE_APPLICATION_CREDENTIALS "/app/resource/detect-faces.json"
    ENV  ENV_NODE "product"
    RUN npm install  
    COPY . /app  
    EXPOSE 3000  
    CMD  npm start
