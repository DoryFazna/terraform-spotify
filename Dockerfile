FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json if you have them
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy your server code
COPY spotify-auth-proxy.js .

# Expose the port your server listens on
EXPOSE 27228

# Start the server
CMD ["node", "spotify-auth-proxy.js"]
