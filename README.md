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

## Emplacements et carte

Chaque fiche de bâtiment liste tous ses emplacements achetables avec leur prix (167 au total, dont 32 logements avec salle de braquage, source : tableaux « Locations » de gta.wiki, novembre 2026) et les place sur un petit plan. « Mon emplacement » sous le tableau indique lequel tu possèdes : il est entouré sur les cartes.

L’onglet **Carte** montre tous les bâtiments, un type à la fois ou seulement les tiens. C’est un plan schématique dessiné pour l’appli, sans la carte officielle de Rockstar : les positions sont approximatives, au niveau du quartier. Les quartiers et le tracé sont dans `data.js` (`AREAS`, `MAP`).

## Mon plan (plan personnalisé)

L’onglet **Mon plan** calcule, dans ton navigateur et à partir de tes données (ce que tu as coché, ton solde, tes heures de jeu par semaine), l’ordre optimal de tous tes achats :

1. Ta semaine est simulée : tes heures en sessions de 3 h, avec les règles du plan de session (1ers runs, recharges, 3 casses max), plus ton revenu passif. Ça donne ton revenu moyen par heure de jeu.
2. Chaque achat possible est testé sur cette semaine : la différence de revenu est ce qu’il t’apporte vraiment. Un braquage qui ne fait que remplacer un autre aussi payant n’apporte presque rien.
3. L’étape suivante est celle qui se rembourse le plus vite (prix ÷ gain réel par heure). L’appli calcule le temps de jeu pour réunir l’argent, l’ajoute et recommence.

Chaque étape indique : quand tu pourras l’acheter, quoi faire pour réunir l’argent, l’emplacement conseillé, ce que ça débloque, ton revenu avant/après et le temps de remboursement. Les achats qui n’apporteraient rien à ton rythme sont rangés à part, avec la raison. Certaines combinaisons sont évaluées ensemble (Kosatka + Sparrow), parce qu’un achat seul peut être moyen et excellent avec son complément.

## Plan d’achat

L’onglet Achats juge chaque achat sur ce qu’il débloque, avec les mêmes gains par heure que l’onglet Méthodes :

- **Braquages et activités** : prix ÷ gain par heure de la meilleure activité débloquée = **heures de jeu pour le rembourser**. Exemple : Kosatka 2,2 M$ ÷ Cayo ≈ 565 k$/h ≈ 3 h 54. Le Sparrow, qui accélère Cayo, est jugé sur le gain par heure en plus.
- **Business passifs** : prix ÷ revenu passif en plus = heures connecté pour le rembourser.
- **Confort** : ce qui ne rapporte rien directement (sécurité, véhicules…).

Chaque liste va du plus vite remboursé au plus lent. Les prérequis sont inclus dans le prix (le club-house pour un business de MC). Une amélioration n’apparaît qu’une fois la propriété achetée. Le réglage « Je joue par semaine » sert seulement à traduire les heures en semaines.

Les gains et durées utilisés sont dans `data.js` (`pay`, `first`, `dur` pour les activités, `low` pour le passif) : les corriger change le classement.

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
