FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=app
ENV FLASK_DEBUG=False
ENV BACKEND_URL=http://backend:8080/api

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
