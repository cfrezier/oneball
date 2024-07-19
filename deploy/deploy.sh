#!/usr/bin/env bash

kubectl apply -f deployment.yaml
kubectl apply -f ingress.yaml
kubectl apply -f wss-ingress.yaml
kubectl apply -f pvc.yaml
kubectl apply -f svc.yaml
sops -d regcred.k8s_secret.yaml > secret.yaml
kubectl apply -f secret.yaml
kubectl apply -f certificate.yaml
