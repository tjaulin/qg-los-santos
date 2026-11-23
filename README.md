# QG Los Santos

Copilote perso pour gagner un maximum d’argent sur GTA Online. Le site te dit où tu en es et te prépare un plan de session selon ce que tu possèdes, améliorations comprises. Il donne aussi l’ordre d’achat conseillé, une fiche pour chaque braquage, bâtiment et véhicule, le gain par heure de chaque activité, les bonus de la semaine, des chronos de recharge et un journal de tes gains.

Outil non officiel, sans lien avec Rockstar Games. Les montants sont approximatifs : ils viennent de guides publics à jour du patch 1.73 (The Kortz Center Heist, juillet 2026).

## Installer sur ton téléphone

1. Ouvre l’adresse du site dans Safari (iPhone) ou Chrome (Android).
2. Ajoute-le à l’écran d’accueil :
   - Safari : bouton Partager, puis « Sur l’écran d’accueil ».
   - Chrome : menu ⋮, puis « Ajouter à l’écran d’accueil » (ou « Installer l’application »).

Le site s’ouvre alors en plein écran, comme une appli, et marche hors connexion.

Sur iPhone, installe-le vraiment sur l’écran d’accueil. Safari peut effacer les données d’un site que tu n’as pas ouvert depuis 7 jours, mais pas celles d’une appli installée.

## Tes données

Tout est enregistré dans le navigateur de l’appareil, rien n’est envoyé sur Internet. Chaque appareil a donc ses propres données.

Pour passer tes données d’un appareil à l’autre : **Mon empire → Sauvegarde et transfert**.

1. Sur le premier appareil, clique sur « Copier le code de transfert ».
2. Envoie-toi le code (message, notes…).
3. Sur le second appareil, colle-le dans « Importer » et valide.

Tu peux aussi télécharger un fichier de sauvegarde et le réimporter plus tard.

## Plan d’achat dynamique

L’onglet Achats classe tous les achats possibles selon le temps qu’il faut pour qu’ils soient rentabilisés :

1. L’appli simule ta semaine. Elle découpe ton temps de jeu (réglage « Je joue par semaine ») en sessions de 2 h et calcule tes gains comme le plan de session : 1ers runs, recharges, limites. Elle ajoute tes revenus passifs, moins le temps passé à vendre.
2. Pour chaque achat, elle refait la simulation comme si tu l’avais. La différence donne ce qu’il te rapporterait en plus par semaine.
3. Score = semaines pour réunir l’argent (depuis ton solde, à ton revenu actuel) + semaines pour le rembourser. Le plus petit score passe en premier.

Un achat comprend ses prérequis (le club-house pour un business de MC, par exemple). Une amélioration n’est proposée qu’une fois la propriété achetée. La boîte de nuit ne vaut que si tu as des business pour la remplir. Ce qui mettrait plus de 2 ans à se rembourser, ou ne rapporte rien (sécurité, véhicules), est rangé à part.

Les gains et les durées utilisés sont dans `data.js` (`pay`, `first`, `dur`, `cd` pour les activités, `low` pour le passif) : les corriger change le classement.

## Bonus de la semaine (bouton « Sync »)

Les bonus changent chaque jeudi vers 11 h (heure de Paris). Une tâche automatique GitHub ([.github/workflows/bonus.yml](.github/workflows/bonus.yml)) lance [scripts/update-bonus.mjs](scripts/update-bonus.mjs) le jeudi à 12 h 30, avec deux rattrapages (jeudi 17 h, vendredi 10 h). Le script lit la page publique des bonus hebdo de [GTA Boss](https://www.gtaboss.gg/gta-5-online/gta-online-weekly-updates), écrit `bonus.json`, puis republie le site.

Dans l’appli, le bouton **Sync** du tableau de bord relit `bonus.json`. Il est aussi relu tout seul à l’ouverture.

Tu y trouves : les bonus 2× à 4×, le défi hebdo, les cibles principales des braquages, les véhicules de la casse, les promos, la voiture du podium, le Prize Ride, le Gun Van et les avantages GTA+. Les textes restent en anglais, comme sur la source.

**Si les bonus ne sont pas encore à jour** : onglet **Actions** du dépôt → « Bonus de la semaine » → **Run workflow**. Ça marche aussi depuis l’appli GitHub sur téléphone. Une minute plus tard, appuie sur Sync.

**Si la tâche échoue** (par exemple parce que GTA Boss a changé sa page), GitHub t’envoie un e-mail et `bonus.json` n’est pas modifié. Le script est à adapter dans `scripts/update-bonus.mjs`.

## Tester en local

```sh
python3 -m http.server 8000
```

Puis ouvre http://localhost:8000.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | La page : mise en page et styles |
| `data.js` | Les données de jeu : propriétés, améliorations, braquages, fiches, ordre d’achat. C’est ici qu’on corrige un prix ou un texte. |
| `app.js` | Les calculs (plan de session, priorités, revenus passifs) et l’affichage |
| `bonus.json` | Les bonus de la semaine, mis à jour automatiquement |
| `scripts/update-bonus.mjs` | Le script qui récupère les bonus |
| `.github/workflows/bonus.yml` | La tâche automatique du jeudi |
| `manifest.webmanifest` | Nom, couleurs et icônes pour l’installation sur l’écran d’accueil |
| `sw.js` | Fonctionnement hors connexion |
| `icon.svg`, `icon-*.png` | Icônes |
