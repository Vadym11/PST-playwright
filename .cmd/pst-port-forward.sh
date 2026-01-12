#!/bin/bash

kubectl port-forward svc/pst-web 8080:80 &
kubectl port-forward svc/pst-db 3307:3306

sleep 3

# function forward_select_ports() {
#   kubectl port-forward svc/pst-web 8080:80 &
#   kubectl port-forward svc/pst-db 3307:3306

#   sleep 3
# }