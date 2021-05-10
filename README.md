# Potato-Messenger
 Chat Application built with Django.
 
 
## Getting Started
### Prerequisites

Make sure you have installed all of the following prerequisites on your development machine:
* Python(3.7+) - [Get Python](https://www.python.org/getit/)
* Poetry - [Get Poetry](https://python-poetry.org/docs/)
* MySQL - [Get MySQL](https://www.mysql.com/)
* Docker - [Get Docker](https://www.docker.com/)

### Running a Local Development Server

Potato Messenger uses Redis as a channel layer and for celery tasks.
Run a redis server.
```bash
$ docker run -p 6379:6379 -d redis:5
```
Run Django's Development Server
```bash
$ poetry run python manage.py runserver 0.0.0.0:8000
```
Run Celery Worker.
```bash
$ poetry run celery -A potato worker --loglevel=debug
```
Note: The currently used version of Celery is not supported on Windows. Run it using WSL. 
