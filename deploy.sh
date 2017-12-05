#!/bin/bash
set -ev

TAG=$1

# Create publish artifact
dotnet publish -c Release --output obj/Docker/publish/ebweb ./ExpressBase.Web/ExpressBase.Web.csproj
dotnet publish -c Release --output obj/Docker/publish/ebss ./ExpressBase.ServiceStack/ExpressBase.ServiceStack.csproj

# # Build the Docker images
docker build -t $GCP_CONTAINER/ebweb:$TAG ./ExpressBase.Web/.
docker build -t $GCP_CONTAINER/ebss:$TAG ./ExpressBase.ServiceStack/.

docker tag $GCP_CONTAINER/ebweb:$TAG $GCP_CONTAINER/ebweb:latest
docker tag $GCP_CONTAINER/ebss:$TAG $GCP_CONTAINER/ebss:latest
docker tag $GCP_CONTAINER/ebweb:$TAG $DOCKER_SERVER/ebweb:$TAG
docker tag $GCP_CONTAINER/ebss:$TAG $DOCKER_SERVER/ebss:$TAG
docker tag $DOCKER_SERVER/ebweb:$TAG $DOCKER_SERVER/ebweb:latest
docker tag $DOCKER_SERVER/ebss:$TAG $DOCKER_SERVER/ebss:latest

# Login to Azure Container Registry and upload images
docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD $DOCKER_SERVER

docker push $DOCKER_SERVER/ebss:latest
docker push $DOCKER_SERVER/ebss:$TAG
docker push $DOCKER_SERVER/ebweb:$TAG
docker push $DOCKER_SERVER/ebweb:latest

curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl
chmod +x ./kubectl
sudo mv ./kubectl /usr/local/bin/kubectl

# Login to GCP Container Registry and upload images
echo $GCLOUD_KEY | base64 --decode > keyfile.json
gcloud auth activate-service-account $GCLOUD_EMAIL --key-file keyfile.json
#Next Step
ssh-keygen -f ~/.ssh/google_compute_engine -N ""

gcloud container clusters get-credentials $GCP_PROJECT_NAME

gcloud docker -- push $GCP_CONTAINER/ebweb:$TAG  > /dev/null
gcloud docker -- push $GCP_CONTAINER/ebss:$TAG  > /dev/null
gcloud docker -- push $GCP_CONTAINER/ebweb:latest  > /dev/null
gcloud docker -- push $GCP_CONTAINER/ebss:latest  > /dev/null

kubectl set image deployment/eb-ss ebss=$GCP_CONTAINER/ebss:$TAG
kubectl set image deployment/eb-web ebweb=$GCP_CONTAINER/ebweb:$TAG