# Use the official Python image from the Docker Hub with Python 3.13.1
FROM python:3.13.1-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . .

# Command to run the application
CMD ["python", "app.py"]  # Replace 'your_script.py' with your main script