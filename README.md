# QG Los Santos

Copilote perso pour gagner un maximum d’argent sur GTA Online. Le site te dit où tu en es et te prépare un plan de session selon ce que tu possèdes. Il donne aussi l’ordre d’achat conseillé, le gain par heure de chaque activité, des chronos de recharge et un journal de tes gains.

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

## Mettre à jour les bonus de la semaine

Les bonus changent chaque jeudi. Ils sont décrits dans le bloc `EVENT` en haut du script, dans `index.html` :

```js
const EVENT = {
  start: Date.UTC(2026,10,19,10), end: Date.UTC(2026,10,26,10),
  label: 'Du jeudi 19 au jeudi 26 novembre 2026',
  items: [ '…', '…' ],
  challenge: '3 missions Gerald’s Last Play'
};
```

Attention, les mois commencent à 0 dans `Date.UTC` : novembre s’écrit 10.

Tu peux modifier ce bloc directement sur GitHub : ouvre `index.html`, clique sur le crayon, modifie, puis « Commit changes ». GitHub Pages republie le site en une minute environ. Quand les bonus ont expiré, le site affiche simplement un lien vers le Newswire de Rockstar.

## Tester en local

```sh
python3 -m http.server 8000
```

Puis ouvre http://localhost:8000.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Tout le site : données de jeu, calculs et affichage |
| `manifest.webmanifest` | Nom, couleurs et icônes pour l’installation sur l’écran d’accueil |
| `sw.js` | Fonctionnement hors connexion |
| `icon.svg`, `icon-*.png` | Icônes |
