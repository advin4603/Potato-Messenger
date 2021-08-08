#!/bin/sh
# Wait for database to get available

M_LOOPS="100"

#wait for mysql
i=0
# http://stackoverflow.com/a/19956266/4848859
while ! curl $DATABASE_HOST:$DATABASE_PORT >/dev/null 2>&1 < /dev/null; do
  i=`expr $i + 1`

  if [ $i -ge $M_LOOPS ]; then
    echo "$(date) - ${DATABASE_HOST}:${DATABASE_PORT} still not reachable, giving up"
    exit 1
  fi

  echo "$(date) - waiting for ${DATABASE_HOST}:${DATABASE_PORT}..."
  sleep 5
done

echo "$(date) - ${DATABASE_HOST}:${DATABASE_PORT} Reachable ! - Starting Daemon"
#start the daemon
python manage.py collectstatic --noinput
python manage.py makemigrations
python manage.py migrate
python manage.py runserver 0.0.0.0:8000