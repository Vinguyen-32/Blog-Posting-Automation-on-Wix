# Use an official Node.js runtime with Node.js 18 and alpine
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Install Python 3 and other necessary tools

# Copy the rest of the application code to the container
COPY . .

# Build the Next.js app
RUN npm run build
RUN apt-get update
RUN apt-get install -y python3

# Expose the port that the app will run on
EXPOSE 80

# Define the command to run your application
CMD ["npm", "start"]
