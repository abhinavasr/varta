FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8080

# Set environment variables
ENV FLASK_APP=run.py
ENV FLASK_DEBUG=False

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "run:app"]
