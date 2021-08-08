# Potato-Messenger
 Chat Application built with Django.
 
 
## Getting Started
### Prerequisites

Make sure you have installed all of the following prerequisites on your development machine:
* Docker - [Get Docker](https://www.docker.com/)

### Running a Local Development Server
Potato Messenger requires a .env file with necessary settings.
Fill these settings.
Contents of .env :
```
SECRET_KEY=""
DATABASE_NAME=""
DATABASE_USER=""
DATABASE_PASSWORD=""
DATABASE_HOST="mysql"
DATABASE_PORT="3306"
REDIS_IP="redis"
REDIS_PORT="6379"
WEBPUSH_VAPID_PUBLIC_KEY=""
WEBPUSH_VAPID_PRIVATE_KEY=""
WEBPUSH_VAPID_ADMIN_EMAIL=""
CELERY_BROKER_URL=redis://${REDIS_IP}:${REDIS_PORT}
CELERY_RESULT_BACKEND=${CELERY_BROKER_URL}
EMAIL_HOST_USER=""
EMAIL_HOST_PASSWORD=""
```
```bash
$ git clone https://github.com/advin4603/Potato-Messenger
$ cd Potato-Messenger
$ docker-compose up
```

