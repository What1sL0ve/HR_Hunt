################
# BASE BUILDER #
################
FROM python:3.11-slim as builder

# Установим зависимости для сборки
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt

###############
# RUNTIME APP #
###############
FROM python:3.11-slim

ENV APP_HOME=/home/app/web
WORKDIR $APP_HOME

# Установка рантайм-зависимостей
RUN apt-get update && apt-get install -y libpq-dev && rm -rf /var/lib/apt/lists/*

# Копирование и установка Python-зависимостей
COPY --from=builder /wheels /wheels
COPY --from=builder /usr/src/app/requirements.txt .
RUN pip install --no-cache-dir /wheels/*

# Копирование приложения
COPY . $APP_HOME

# Создание пользователя и назначение прав
RUN adduser --disabled-password --gecos "" app && \
    mkdir -p $APP_HOME/static && \
    mkdir -p $APP_HOME/media && \
    chown -R app:app $APP_HOME

USER app

# Подготовка entrypoint
RUN chmod +x $APP_HOME/entrypoint.prod.sh
ENTRYPOINT ["./entrypoint.prod.sh"]