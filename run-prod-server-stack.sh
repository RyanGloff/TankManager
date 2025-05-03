NGINX_NETWORK=nginx-net

if ! docker network ls --format '{{.Name}}' | grep -wq "$NGINX_NETWORK"; then
  docker network create "$NGINX_NETWORK"
fi

docker compose --env-file prod-stack.env up ui api grafana --build -d

docker network connect nginx-net api
docker network connect nginx-net ui
docker network connect nginx-net grafana
