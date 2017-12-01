#!/bin/bash
set -ev

TAG=$1	
DOCKER_USERNAME=$2
DOCKER_PASSWORD=$3

# Create publish artifact
dotnet publish -c Release --output obj/Docker/publish/ebweb ./ExpressBase.Web/ExpressBase.Web.csproj
dotnet publish -c Release --output obj/Docker/publish/ebss ./ExpressBase.ServiceStack/ExpressBase.ServiceStack.csproj

# Build the Docker images
docker build -t asia.gcr.io/avian-silo-186815/ebweb:$TAG ./ExpressBase.Web/.
docker build -t asia.gcr.io/avian-silo-186815/ebss:$TAG ./ExpressBase.ServiceStack/.

docker tag asia.gcr.io/avian-silo-186815/ebweb:$TAG asia.gcr.io/avian-silo-186815/ebweb:latest
docker tag asia.gcr.io/avian-silo-186815/ebss:$TAG asia.gcr.io/avian-silo-186815/ebss:latest

# Login to Docker Hub and upload images
docker login -u oauth2accesstoken -p "$DOCKER_PASSWORD"

docker push asia.gcr.io/avian-silo-186815/ebweb:$TAG
docker push asia.gcr.io/avian-silo-186815/ebss:$TAG
docker push asia.gcr.io/avian-silo-186815/ebweb:latest
docker push asia.gcr.io/avian-silo-186815/ebss:latest
