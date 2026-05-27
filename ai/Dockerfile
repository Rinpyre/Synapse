FROM node:20-slim

# Set the working directory in the container
WORKDIR /app

# Tell the Node.js application it is running in production
ENV NODE_ENV=production

# Copy package files and install dependencies without dev dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy the rest of the application source code
COPY . .

# Mark the ports used for doc purposes
EXPOSE 4000

# Run the application
CMD [ "node", "index.js" ]