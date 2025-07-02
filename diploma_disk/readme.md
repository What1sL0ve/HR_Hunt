# 0. Перейти в папку бэкенда и там открыть терминал

# 1. Собрать и запустить
docker compose up -d --build

# 2. Применить миграции
docker compose exec web python manage.py migrate

# 3. Собрать статику
docker compose exec web python manage.py collectstatic

# 4. (опц.) создать суперпользователя
docker compose exec web python manage.py createsuperuser


# 5. Перейти в папку фронтенда и войти в терминал

# 6. Сбилдить фронтенд
docker build -t resume-frontend .

# 7. Запустить фронтенд
docker run -d --name resume-frontend -p 80:80 resume-frontend
