FROM python:3.11-slim
WORKDIR /app
COPY pyproject.toml .
COPY src ./src
COPY api ./api
COPY pipelines ./pipelines
COPY configs ./configs
COPY dashboard ./dashboard
RUN pip install --no-cache-dir .
EXPOSE 8000
CMD ["uvicorn","api.main:app","--host","0.0.0.0","--port","8000"]
