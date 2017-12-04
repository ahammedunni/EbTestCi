#!/bin/bash
set -ev

TAG=$1

# Create publish artifact
dotnet publish -c Release --output obj/Docker/publish/ebweb ./ExpressBase.Web/ExpressBase.Web.csproj
dotnet publish -c Release --output obj/Docker/publish/ebss ./ExpressBase.ServiceStack/ExpressBase.ServiceStack.csproj

# Build the Docker images
docker build -t gcr.io/avian-silo-186815/ebweb:$TAG ./ExpressBase.Web/.
docker build -t gcr.io/avian-silo-186815/ebss:$TAG ./ExpressBase.ServiceStack/.

docker tag gcr.io/avian-silo-186815/ebweb:$TAG gcr.io/avian-silo-186815/ebweb:latest
docker tag gcr.io/avian-silo-186815/ebss:$TAG gcr.io/avian-silo-186815/ebss:latest

# Login to Docker Hub and upload images
# docker login -u oauth2accesstoken -p "$DOCKER_PASSWORD"

gloud docker push gcr.io/avian-silo-186815/ebweb:$TAG
gloud docker push gcr.io/avian-silo-186815/ebss:$TAG
gloud docker push gcr.io/avian-silo-186815/ebweb:latest
gloud docker push gcr.io/avian-silo-186815/ebss:latest
