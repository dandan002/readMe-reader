FROM python:3.13-slim

WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY client.py .
COPY .env .

# Expose the port the app runs on
EXPOSE 5001

# Command to run the application
CMD ["python", "client.py"]