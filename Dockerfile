FROM python:3.12-slim

WORKDIR /app

# 只复制后端代码，不包含前端文件
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

# Hugging Face Spaces 默认端口是 7860
ENV PORT=7860

CMD uvicorn main:app --host 0.0.0.0 --port $PORT
