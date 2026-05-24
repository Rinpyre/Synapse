FROM node:20-slim AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Create the production build
RUN npm run build



FROM nginx:stable-alpine

# Copy the built files from the 'build' stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80, which is the defauldt Nginx port
EXPOSE 80