# Déploiement sur un cluster Kubernetes

## Contacts

- @cfrezier
- @jtama
- @sylvainmetayer

## Prérequis

- `kubectl`
- `sops` et avoir partagé sa clé publique pour accès au fichier de secret.
- Accès au cluster

## Déploiement

L'image est uniquement disponible avec le tag `latest`.  

```bash
./deploy.sh
```

S'il n'y a pas de changement de configuration, un restart du StatefulSet suffit.

```bash
kubectl rollout restart statefulset/app -n oneball
```
