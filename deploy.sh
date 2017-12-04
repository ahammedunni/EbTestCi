#!/bin/bash
set -ev

TAG=$1

# Create publish artifact
dotnet publish -c Release --output obj/Docker/publish/ebweb ./ExpressBase.Web/ExpressBase.Web.csproj
dotnet publish -c Release --output obj/Docker/publish/ebss ./ExpressBase.ServiceStack/ExpressBase.ServiceStack.csproj

# Build the Docker images
docker build -t asia.gcr.io/avian-silo-186815/ebweb:$TAG ./ExpressBase.Web/.
docker build -t asia.gcr.io/avian-silo-186815/ebss:$TAG ./ExpressBase.ServiceStack/.

docker tag asia.gcr.io/avian-silo-186815/ebweb:$TAG asia.gcr.io/avian-silo-186815/ebweb:latest
docker tag asia.gcr.io/avian-silo-186815/ebss:$TAG asia.gcr.io/avian-silo-186815/ebss:latest

# Login to Docker Hub and upload images

gcloud docker -- push asia.gcr.io/avian-silo-186815/ebweb:$TAG  > /dev/null
gcloud docker -- push asia.gcr.io/avian-silo-186815/ebss:$TAG  > /dev/null
gcloud docker -- push asia.gcr.io/avian-silo-186815/ebweb:latest  > /dev/null
gcloud docker -- push asia.gcr.io/avian-silo-186815/ebss:latest  > /dev/null
