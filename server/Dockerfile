FROM node:18-alpine
WORKDIR /server/
COPY package.json /server/
COPY index.js /server/
RUN npm install
CMD [ "npm", "start" ]