# Use an official Node.js runtime as a parent image
FROM node:23-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose the port your app runs on
EXPOSE 8084

# Set environment variables (optional, replace with actual values or use a .env file in production)
ENV NODE_ENV=production

# Run the application
CMD ["npm", "run", "dev"]
