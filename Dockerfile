# Use Node base image
FROM node:18-al

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy rest of code
COPY . .

RUN npm run build

# Expose port
EXPOSE 3000

ENV NODE_ENV=production


# Start app
CMD ["npm", "start"]
