#!/bin/bash

# kubectl port-forward svc/pst-web 8080:80 --request-timeout=15m --keepalive=10s &
# kubectl port-forward svc/pst-db 3307:3306 --request-timeout=15m --keepalive=10s

kubectl port-forward --address 127.0.0.1 svc/pst-web 8080:80 --request-timeout=15m --keepalive=10s &
kubectl port-forward --address 127.0.0.1 svc/pst-db 3307:3306 --request-timeout=15m --keepalive=10s

sleep 3

# function forward_select_ports() {
#   kubectl port-forward svc/pst-web 8080:80 &
#   kubectl port-forward svc/pst-db 3307:3306

#   sleep 3
# }