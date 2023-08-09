# Specify the work environment
FROM node:18-alpine AS development
ENV NODE_ENV=production
# Specify the working directory
WORKDIR /networking_2023_mark1/

# Copy the required files to the working directory
COPY public/ /networking_2023_mark1/public
COPY src/ /networking_2023_mark1/src
COPY package*.json /networking_2023_mark1/

# Run command to install the node dependencies
RUN npm ci --production

# Specify the start command {can be only one, latest instance will be considered in case of multiple instance}
RUN npm run build

FROM node:18-alpine AS production
ENV NODE_ENV=production
WORKDIR /networking_2023_mark1/
COPY --from=development /networking_2023_mark1/build/ /networking_2023_mark1/build/
RUN npm install -g serve
CMD [ "serve","-s","build" ]