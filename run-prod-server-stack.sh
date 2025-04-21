docker compose up ui grafana --build -d

docker network connect nginx-net api
docker network connect nginx-net ui
docker network connect nginx-net grafana
