FROM python:3.13-slim

WORKDIR /backend

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy application code
COPY . .

# Expose the Flask port
EXPOSE 5000

# Command to run the application
CMD ["python", "client.py"]