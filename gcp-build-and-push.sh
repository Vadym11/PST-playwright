#!/usr/bin/env bash

# "europe-west1-docker.pkg.dev/earnest-acre-474618-n9/toolshop"
GCP_REGION=europe-west1
REG="${GCP_REGION}-docker.pkg.dev/earnest-acre-474618-n9"
REPO="toolshop"
TAG="$(git rev-parse --short HEAD)"

# aws ecr get-login-password --region "$GCP_REGION" \
#  | docker login --username AWS --password-stdin "$REG"

# Build from repo root
docker build -t $REG/$REPO/ui-k8s:$TAG   -f _docker/Dockerfile.ui   .
docker build -t $REG/$REPO/api-k8s:$TAG  -f _docker/Dockerfile.api  .
docker build -t $REG/$REPO/web-k8s:$TAG  -f _docker/Dockerfile.web  .
docker build -t $REG/$REPO/cron-k8s:$TAG -f _docker/Dockerfile.cron .

# gcloud auth configure-docker europe-west1-docker.pkg.dev

# Push (single repo, component-prefixed tags)
for IMG in ui api web cron; do
  echo pushing $REG/$REPO/$IMG-k8s:$TAG image...
  docker push $REG/$REPO/$IMG-k8s:$TAG
done