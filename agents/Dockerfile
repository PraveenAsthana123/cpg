FROM python:3.11-slim

WORKDIR /app

# Install deps first (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy agent code
COPY agent.py seeder.py ./

# Run as non-root for security
RUN useradd -m -u 1000 agent && chown -R agent:agent /app
USER agent

CMD ["python", "-u", "agent.py"]
