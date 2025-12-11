#!/usr/bin/env bash

# "europe-west1-docker.pkg.dev/earnest-acre-474618-n9/toolshop"
GCP_REGION=europe-west1
REG="${GCP_REGION}-docker.pkg.dev/earnest-acre-474618-n9"
REPO="toolshop"
TAG="$(git rev-parse --short HEAD)"

# Build from repo root
docker build --no-cache -t $REG/$REPO/ui-k8s:$TAG      -f _docker/Dockerfile.ui      .
docker build --no-cache -t $REG/$REPO/api-k8s:$TAG     -f _docker/Dockerfile.api     .
docker build --no-cache -t $REG/$REPO/apiweb-k8s:$TAG  -f _docker/Dockerfile.apiweb  .
docker build --no-cache -t $REG/$REPO/web-k8s:$TAG     -f _docker/Dockerfile.web     .
docker build --no-cache -t $REG/$REPO/cron-k8s:$TAG    -f _docker/Dockerfile.cron    .

# Push (single repo, component-prefixed tags)
for IMG in ui api web apiweb cron; do
  echo pushing $REG/$REPO/$IMG-k8s:$TAG image...
  docker push $REG/$REPO/$IMG-k8s:$TAG
done