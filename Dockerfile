# Step 1: Use the official Node.js image to build the app
FROM node:16 AS build

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json to install dependencies
COPY package.json package-lock.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application code
COPY . .

# Step 6: Build the React app for production
RUN npm run build

# Step 7: Use nginx to serve the static files
FROM nginx:alpine

# Step 8: Copy the build output from the build container to nginx's public directory
COPY --from=build /app/build /usr/share/nginx/html

# Step 9: Expose port 80 for serving the React app
EXPOSE 80

# Step 10: Run nginx to serve the app
CMD ["nginx", "-g", "daemon off;"]
LABEL authors="rufelleemmanuelpactol"

