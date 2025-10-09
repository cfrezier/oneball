# Guide de contribution — oneball

Merci de votre intérêt pour contribuer à oneball ! Ce fichier décrit le processus recommandé pour proposer des améliorations, corriger des bugs ou ajouter des fonctionnalités.

## Avant de commencer

- Vérifiez les issues existantes pour éviter les doublons.
- Consultez le `README.md` pour comprendre la structure du projet et les scripts d'exécution.

## Flux de contribution recommandé

1. Forkez le dépôt.
2. Créez une branche descriptive depuis `main` (ou la branche par défaut) :

```bash
git checkout -b feat/ma-fonctionnalite
```

3. Développez votre changement :
   - Respectez le style TypeScript présent dans le projet.
   - Ajoutez/éditez les tests unitaires pour la logique critique lorsque possible.

### Lint & tests

Avant d'ouvrir une PR, assurez-vous que :

```bash
# installer dépendances (si nécessaire)
npm install
# exécuter tests (si disponibles)
npm test
# exécuter le linter (si configuré)
npm run lint
```

## Commits

- Faites des commits atomiques et descriptifs.
- Utilisez un format clair pour le message de commit, par exemple :

```
feat(queue): add matchmaking by skill
fix(score): correct off-by-one in scoring
chore(deps): bump typescript to 4.x
```

## Ouvrir une Pull Request

- Basez la PR sur une branche dédiée.
- Décrivez l'objectif, les changements et les raisons.
- Joignez des captures d'écran pour des modifications UI.
- Ajoutez des instructions pour tester localement.

## Revue et merge

- Les PRs seront revues par les mainteneurs.
- Les modifications critiques peuvent demander des tests supplémentaires ou des ajustements.
- NE PAS mergez votre propre PR si elle modifie des comportements importants sans approbation.

## Conseils techniques

- Préférez TypeScript pour les nouvelles fonctionnalités.
- Regroupez la logique réutilisable dans `src/`.
- Documentez les comportements non triviaux dans le code et/ou le README.

## Bonnes pratiques de sécurité

- N'incluez jamais de secrets (tokens, clés privées) dans les commits.
- Si vous devez partager un secret pour reproduire un bug, utilisez des variables d'environnement et documentez le processus.

## Template rapide pour PR

**Titre :**

```
[type(scope)]: courte description
```

**Description :**
- Problème résolu / fonctionnalité ajoutée
- Comment tester
- Notes (breaking changes, dépendances ajoutées)

Merci encore — votre contribution fait avancer le projet !
