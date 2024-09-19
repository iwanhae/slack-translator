# Use the official Deno image as a parent image
FROM denoland/deno:1.46.3

# Set the working directory in the container
WORKDIR /app

# Copy the application files to the container
COPY . .

# Cache the dependencies
RUN deno cache main.ts

# Run the application in production mode
CMD ["deno", "task", "prod"]