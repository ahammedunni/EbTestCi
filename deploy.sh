#!/bin/bash
set -ev

TAG=$1

# Create publish artifact
dotnet publish -c Release --output obj/Docker/publish/ebweb ./ExpressBase.Web/ExpressBase.Web.csproj
dotnet publish -c Release --output obj/Docker/publish/ebss ./ExpressBase.ServiceStack/ExpressBase.ServiceStack.csproj

# # Build the Docker images
# docker build -t asia.gcr.io/avian-silo-186815/ebweb:$TAG ./ExpressBase.Web/.
# docker build -t asia.gcr.io/avian-silo-186815/ebss:$TAG ./ExpressBase.ServiceStack/.

# docker tag asia.gcr.io/avian-silo-186815/ebweb:$TAG asia.gcr.io/avian-silo-186815/ebweb:latest
# docker tag asia.gcr.io/avian-silo-186815/ebss:$TAG asia.gcr.io/avian-silo-186815/ebss:latest

# # Login to Docker Hub and upload images

# gcloud docker -- push asia.gcr.io/avian-silo-186815/ebweb:$TAG  > /dev/null
# gcloud docker -- push asia.gcr.io/avian-silo-186815/ebss:$TAG  > /dev/null
# gcloud docker -- push asia.gcr.io/avian-silo-186815/ebweb:latest  > /dev/null
# gcloud docker -- push asia.gcr.io/avian-silo-186815/ebss:latest  > /dev/null


docker login -u ebraviscitest -p s2Bue=CSuqsjYkmBDaewkEc9k1I3b6wD ebraviscitest.azurecr.io

docker build -t ebraviscitest.azurecr.io/ebweb:$TAG ./ExpressBase.Web/.
docker build -t ebraviscitest.azurecr.io/ebss:$TAG ./ExpressBase.ServiceStack/.

docker tag ebraviscitest.azurecr.io/ebweb:$TAG ebraviscitest.azurecr.io/ebweb:latest
docker tag ebraviscitest.azurecr.io/ebss:$TAG ebraviscitest.azurecr.io/ebss:latest

docker push ebraviscitest.azurecr.io/ebss:latest
docker push ebraviscitest.azurecr.io/ebss:$TAG
docker push ebraviscitest.azurecr.io/ebweb:$TAG
docker push ebraviscitest.azurecr.io/ebweb:latest