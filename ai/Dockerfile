# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install any needed packages
RUN npm install

# Bundle app's source
COPY . .

# Make port 4000 available to the world outside this container
EXPOSE 4000

# Define the command to run your app
CMD [ "node", "index.js" ]