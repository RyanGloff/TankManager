docker compose down --rmi all -v --remove-orphans

docker compose --env-file prod.env run --no-deps -d apex-monitor
