/* QG Los Santos — données de jeu.
   Valeurs approximatives compilées en novembre 2026 depuis des guides publics,
   à jour du patch 1.73 (The Kortz Center Heist, juillet 2026).
   « approx: true » signale un prix incertain ; « from: true » un prix de départ (selon l'emplacement). */
window.QG_DATA = (function(){

const CATS = [
  {id:'braquage', name:'Braquages & contrats', desc:'Les propriétés qui débloquent les activités qui paient le plus.'},
  {id:'passif', name:'Business passifs', desc:'Ils produisent pendant que tu fais autre chose, tant que tu es connecté.'},
  {id:'facade', name:'Façades (Money Fronts)', desc:'Blanchiment d’argent et bonus sur tes autres business.'},
  {id:'pdg', name:'PDG & contrebande', desc:'Anciens business, utiles surtout en complément.'},
  {id:'vehicule', name:'Véhicules utiles', desc:'Pour aller plus vite, pas pour frimer.'}
];

/* Améliorations-types des business de MC (prix ≈, identiques quel que soit l’emplacement) */
function mcUps(id, label, equip, staff, sec){
  return [
    {id:id+'_equip', cat:'passif', parent:id, kind:'up', name:'Équipement ('+label+')', price:equip,
     what:'Production plus rapide et marchandise plus chère. La plus rentable des trois.'},
    {id:id+'_staff', cat:'passif', parent:id, kind:'up', name:'Personnel ('+label+')', price:staff,
     what:'Production encore plus rapide et marchandise plus chère, en complément de l’équipement.'},
    {id:id+'_sec', cat:'passif', parent:id, kind:'up', name:'Sécurité ('+label+')', price:sec,
     what:'Réduit le risque de raid. Ne rapporte rien : à prendre en dernier, si tu as de l’argent qui dort.'}
  ];
}

const PROPS = [
  /* ------------------------------------------------------------------ BRAQUAGES */
  {id:'kosatka', cat:'braquage', name:'Kosatka', price:2200000,
   what:'Sous-marin qui débloque le braquage de Cayo Perico, faisable en solo.',
   fiche:{
     quoi:'Un sous-marin privé de classe Kosatka, géré par Pavel. C’est ton QG mobile pour le braquage de Cayo Perico.',
     sert:'Il débloque le braquage de Cayo Perico, le braquage solo de référence. Tu peux aussi t’en servir comme point d’apparition et le déplacer sur la carte.',
     obtenir:'Sur le site Warstock Cache & Carry, depuis le navigateur du téléphone ou d’un ordinateur du jeu. Après l’achat, une première mission de repérage te fait découvrir l’île.',
     conseils:['Prends le Sparrow dès que possible : il divise le temps de préparation.',
       'Après une finale en solo, Cayo se recharge pendant 144 min : enchaîne avec le contrat Dr. Dre ou le Titan Job.',
       'Toutes les préparations ne sont pas obligatoires : fais seulement celles qui servent ton approche.'],
     avis:'Achat prioritaire pour un joueur solo, juste après le labo d’acide et l’agence.'}},
  {id:'sparrow', cat:'braquage', parent:'kosatka', kind:'up', name:'Sparrow (hélico du Kosatka)', price:1815000, approx:true,
   what:'Hélico livré près de toi partout sur la carte, même à Cayo. Préparations beaucoup plus rapides.'},

  {id:'agency', cat:'braquage', name:'Agence', price:2010000, from:true,
   what:'Contrat Dr. Dre, contrats de sécurité, Payphone Hits et un coffre passif.',
   fiche:{
     quoi:'L’agence de « consultants en célébrités » de Franklin Clinton. Elle reçoit des contrats de la part de clients riches et de Dr. Dre.',
     sert:'Elle débloque le contrat VIP Dr. Dre (≈ 1,1 M$ au 1er run de la semaine), les contrats de sécurité (missions courtes), les Payphone Hits (assassinats express) et un coffre qui se remplit tout seul.',
     obtenir:'Sur le site Dynasty 8 Executive. Quatre emplacements possibles : le moins cher suffit, l’emplacement ne change pas les gains.',
     conseils:['Fais au moins un contrat de sécurité : c’est obligatoire pour lancer le contrat Dr. Dre.',
       'Le coffre de l’agence rapporte plus à mesure que tu as terminé des contrats de sécurité.',
       'L’armurerie, l’atelier et les quartiers personnels ne rapportent rien. L’atelier sert à modifier certains véhicules (anti-missiles).'],
     avis:'Excellent rapport prix/gains en solo. Achète-le tôt.'}},

  {id:'mckenzie', cat:'braquage', name:'Hangar de McKenzie Field', price:1475000,
   what:'The Titan Job (Oscar Guzman Flies Again), jouable en solo.',
   fiche:{
     quoi:'Un hangar sur l’aérodrome de McKenzie Field, base d’Oscar Guzman (mise à jour Oscar Guzman Flies Again, 2025).',
     sert:'Il débloque The Titan Job, jouable entièrement en solo : 750 k$ en normal ou 1,125 M$ en difficile au 1er run de la semaine, puis 500 à 750 k$.',
     obtenir:'Après l’achat, les missions de préparation et la finale se lancent depuis le hangar.',
     conseils:['C’est le braquage le moins cher à débloquer : il est remboursé en moins de deux semaines.',
       'La finale est un combat aérien : entraîne-toi en normal, puis passe en difficile (+50 %).'],
     avis:'Très bon achat après l’agence et le Kosatka.'}},

  {id:'autoshop', cat:'braquage', name:'Garage auto (Auto Shop)', price:1670000, from:true,
   what:'Contrats de braquage, livraisons de voitures clientes et Exotic Exports.',
   fiche:{
     quoi:'Un garage de tuning lié au LS Car Meet (mise à jour Tuners).',
     sert:'Il débloque 8 contrats de braquage (≈ 170–185 k$, Union Depository ≈ 300 k$), les livraisons de voitures clientes et la liste Exotic Exports (10 voitures à livrer chaque jour).',
     obtenir:'Sur le site Maze Bank Foreclosures. Il faut être membre du LS Car Meet.',
     conseils:['Trois contrats sont proposés au tableau : prends le plus payant.',
       'Les contrats sont courts : parfaits pour remplir la recharge de Cayo.'],
     avis:'Bon complément solo une fois les gros braquages débloqués.'}},

  {id:'salvage', cat:'braquage', name:'Casse (Salvage Yard)', price:1620000, from:true,
   what:'3 braquages de véhicules par semaine, remorquage et un coffre.',
   fiche:{
     quoi:'Une casse automobile (mise à jour The Chop Shop, 2023).',
     sert:'Chaque semaine, trois véhicules cibles sont à voler. Une fois volé, tu peux démonter le véhicule à la casse pour toucher une grosse partie de sa valeur. Elle propose aussi des missions de remorquage et un coffre passif.',
     obtenir:'Sur le site Maze Bank Foreclosures.',
     conseils:['Les cibles changent chaque jeudi : la synchro des bonus les affiche.',
       'Démonte plutôt que de garder : tu touches ≈ 80 % de la valeur maximale du véhicule.'],
     avis:'Solide revenu hebdo régulier, à prendre après le garage auto.'}},

  {id:'garment', cat:'braquage', name:'Usine de vêtements', price:2350000,
   what:'Dossiers du FIB.',
   fiche:{
     quoi:'L’usine de vêtements de la mise à jour Agents of Sabotage (2024).',
     sert:'Elle débloque les Dossiers du FIB : des missions de préparation et une finale, avec un dossier prioritaire mieux payé.',
     conseils:['Correct en complément, mais d’autres achats rapportent plus pour le même prix.'],
     avis:'Pas prioritaire.'}},

  {id:'bailoffice', cat:'braquage', name:'Bureau de caution', price:1650000, from:true,
   what:'Primes sur des fugitifs, 100 % solo.',
   fiche:{
     quoi:'Un bureau de prêteur sur caution (mise à jour Bottom Dollar Bounties, 2024).',
     sert:'Il propose des primes : retrouver un fugitif et le ramener, de préférence vivant pour toucher la prime complète.',
     conseils:['Les primes sont courtes et faciles en solo.', 'Surveille les semaines où elles passent en 2×.'],
     avis:'Complément sympa, pas un pilier.'}},

  {id:'arcade', cat:'braquage', name:'Salle d’arcade', price:1235000, from:true,
   what:'Casse du Diamond Casino (2 joueurs minimum) et un coffre.',
   fiche:{
     quoi:'Une salle d’arcade qui sert de couverture à Lester pour préparer le casse du Diamond Casino.',
     sert:'Elle débloque le casse du Diamond Casino, un des braquages les plus payants à plusieurs, et un coffre passif.',
     obtenir:'Sur le site Maze Bank Foreclosures.',
     conseils:['La finale demande au moins 2 joueurs : inutile si tu joues toujours seul.',
       'Achète le bureau de planification, indispensable pour lancer le casse.'],
     avis:'À prendre seulement si tu joues régulièrement en groupe.'}},

  {id:'facility', cat:'braquage', name:'Installation (Facility)', price:1250000, from:true,
   what:'Braquage de la fin du monde (Doomsday), en groupe.',
   fiche:{
     quoi:'Une base militaire souterraine (mise à jour The Doomsday Heist).',
     sert:'Elle débloque les trois actes du braquage de la fin du monde, à jouer de 2 à 4 joueurs.',
     obtenir:'Sur le site Maze Bank Foreclosures.',
     conseils:['L’acte III est le plus long et le plus payant.', 'Chaque acte a un bonus de 1re réalisation hebdomadaire depuis juillet 2026.'],
     avis:'Seulement pour jouer en groupe.'}},

  {id:'apartment', cat:'braquage', name:'Appartement haut de gamme', price:200000, from:true,
   what:'Braquages originaux (Fleeca, Pacific Standard…), en groupe.',
   fiche:{
     quoi:'Un appartement avec salle de planification (il faut le rang 12).',
     sert:'Il débloque les cinq braquages originaux : Fleeca, Prison Break, Humane Labs, Series A Funding et Pacific Standard. 35 logements ont une salle de planification, le moins cher est Del Perro Heights, apt 7.',
     obtenir:'Sur le site Dynasty 8 Real Estate. Prends un appartement haut de gamme : seuls ceux-là ont la salle de planification.',
     conseils:['Le Fleeca se fait à 2, les autres à 4.', 'Depuis juillet 2026, les préparations paient plus et chaque finale a un bonus de 1re réalisation hebdo.'],
     avis:'Peu cher et utile si tu as des amis pour jouer.'}},

  {id:'mansion', cat:'braquage', name:'Manoir (dont la Villa de Richman)', price:11500000, from:true,
   alias:'villa richman tongva vinewood résidence propriété mansion',
   what:'Une des 3 propriétés de luxe : Propriété de Tongva, Résidence de Vinewood ou Villa de Richman. Nécessaire pour l’atelier d’art.',
   fiche:{
     quoi:'Les manoirs de la mise à jour Une planque au sommet (A Safehouse in the Hills, décembre 2025) : trois propriétés de luxe sur les hauteurs de Los Santos. Dans le jeu en français, elles s’appellent Propriété de Tongva, Résidence de Vinewood et Villa de Richman.',
     sert:'C’est surtout la clé du Kortz Center Heist, via l’atelier d’art. Seul, le manoir ne rapporte presque rien.',
     obtenir:'Sur le site Prix Luxury Real Estate (internet du téléphone). Prix de base : Propriété de Tongva 11,5 M$, Résidence de Vinewood 12,2 M$, Villa de Richman 12,8 M$ (la propriété la plus chère du jeu).',
     conseils:['Pour le Kortz Center Heist, les trois se valent : prends la Propriété de Tongva, la moins chère, sauf si tu tiens à un emplacement.',
       'Ne l’achète pas sans prévoir aussi l’atelier d’art (≈ 4,7 M$ de plus).',
       'Surveille les promos du jeudi : les manoirs passent parfois en réduction.'],
     avis:'Objectif de fin de partie : ≈ 16,2 M$ au total avec l’atelier et le manoir le moins cher.'}},
  {id:'artstudio', cat:'braquage', parent:'mansion', kind:'up', name:'Atelier d’art (Art Studio)', price:4700000,
   what:'Amélioration de ton manoir, achetée sur Prix Luxury Real Estate. Débloque le Kortz Center Heist (été 2026, solo possible).'},

  /* ------------------------------------------------------------------ PASSIFS */
  {id:'firstdose', cat:'passif', name:'Missions First Dose terminées', price:0,
   what:'6 missions gratuites : elles débloquent le labo d’acide et offrent le Brickade 6x6.',
   fiche:{
     quoi:'Une série de six missions gratuites avec Dax et les Fooligans, lancées depuis la Freakshop (mise à jour Los Santos Drug Wars).',
     sert:'À la fin, tu reçois le Brickade 6x6, le camion qui accueille le labo d’acide.',
     conseils:['Fais-les dès le début : elles ne coûtent rien.'],
     avis:'Indispensable, c’est gratuit.'}},
  {id:'acidlab', cat:'passif', parent:'firstdose', name:'Labo d’acide', price:750000,
   what:'Le meilleur business passif pas cher, jouable en session privée.',
   fiche:{
     quoi:'Un laboratoire de fabrication d’acide installé dans le Brickade 6x6.',
     sert:'Il produit tout seul à partir de fournitures. Tu vends le stock en livrant le produit, ou par petites doses aux dealers de rue chaque jour.',
     obtenir:'À installer après les missions First Dose, pour ≈ 750 k$.',
     conseils:['Fais 10 Fooligan Jobs pour débloquer l’amélioration d’équipement.',
       'Achète les fournitures plutôt que de les voler si tu manques de temps.',
       'Les ventes se font très bien en session privée.'],
     avis:'Premier achat recommandé : peu cher et rentable.'}},
  {id:'acidupg', cat:'passif', parent:'acidlab', kind:'up', name:'Équipement (labo d’acide)', price:250000,
   what:'Production plus rapide, stock plein ≈ 335 k$ au lieu de ≈ 238 k$. Débloqué après 10 Fooligan Jobs.'},

  {id:'nightclub', cat:'passif', name:'Boîte de nuit', price:1080000, from:true,
   what:'Entrepôt alimenté par tes autres business, plus un coffre de popularité.',
   fiche:{
     quoi:'Une boîte de nuit avec un grand entrepôt au sous-sol (mise à jour After Hours).',
     sert:'Grâce aux techniciens, l’entrepôt accumule gratuitement une partie de la production de tes autres business, sans fournitures : bunker, business de MC (cocaïne, meth, faux billets, cannabis, faux papiers) et entrepôt de marchandises PDG. Le labo d’acide ne l’alimente pas. Le coffre se remplit selon la popularité de la boîte.',
     obtenir:'Sur le site Maze Bank Foreclosures.',
     conseils:['Chaque technicien s’occupe d’une seule marchandise : affecte-les à celles des business que tu possèdes.',
       'La popularité baisse avec le temps : remonte-la avec les missions de promotion depuis l’ordinateur de la boîte.',
       'Un entrepôt plein vaut ≈ 1,8 M$, mais il faut plusieurs jours de jeu pour le remplir.'],
     avis:'Excellent, mais seulement quand tu as déjà plusieurs business pour l’alimenter.'}},
  {id:'nc_techs', cat:'passif', parent:'nightclub', kind:'up', name:'Techniciens d’entrepôt en plus', max:4,
   unitPrices:[141000,184500,240500,312000], approx:true,
   what:'1 technicien est fourni, jusqu’à 4 de plus. Un technicien par marchandise, et seulement pour les business que tu possèdes (bunker, MC, entrepôt PDG).'},
  {id:'nc_equip', cat:'passif', parent:'nightclub', kind:'up', name:'Équipement (boîte de nuit)', price:1425000, approx:true,
   what:'Accélère la production de l’entrepôt. La seule des trois améliorations qui augmente les gains de l’entrepôt.'},
  {id:'nc_staff', cat:'passif', parent:'nightclub', kind:'up', name:'Personnel (boîte de nuit)', price:475000, approx:true,
   what:'Confort pour la gestion de la boîte. N’accélère pas l’entrepôt.'},
  {id:'nc_sec', cat:'passif', parent:'nightclub', kind:'up', name:'Sécurité (boîte de nuit)', price:695000, approx:true,
   what:'Confort et protection. N’accélère pas l’entrepôt.'},

  {id:'bunker', cat:'passif', name:'Bunker', price:1165000, from:true,
   what:'Armes en production passive. Chumash (≈ 1,65 M$) rend les ventes plus courtes.',
   fiche:{
     quoi:'Un bunker souterrain de fabrication d’armes (mise à jour Gunrunning).',
     sert:'Il fabrique des armes tout seul à partir de fournitures. Tu revends le stock en livraison. Il alimente aussi la boîte de nuit.',
     obtenir:'Sur le site Maze Bank Foreclosures. Chumash est l’emplacement conseillé, proche de la ville.',
     conseils:['Mets tout le personnel sur la production, pas sur la recherche.',
       'Vends vers Los Santos : la vente y paie plus que dans le comté de Blaine.',
       'En solo, vends par petites quantités pour n’avoir qu’un véhicule à livrer.',
       'L’équipement et le personnel se complètent : il faut les deux pour la production maximale.'],
     avis:'Pilier passif fiable, à condition d’avoir l’équipement et le personnel.'}},
  {id:'bunker_equip', cat:'passif', parent:'bunker', kind:'up', name:'Équipement (bunker)', price:1155000,
   what:'La plus importante : production plus rapide et armes plus chères.'},
  {id:'bunker_staff', cat:'passif', parent:'bunker', kind:'up', name:'Personnel (bunker)', price:598500,
   what:'Production plus rapide et armes plus chères, en complément de l’équipement.'},
  {id:'bunker_sec', cat:'passif', parent:'bunker', kind:'up', name:'Sécurité (bunker)', price:351000, approx:true,
   what:'Réduit le risque de raid sur le bunker. Ne rapporte rien : à prendre en dernier.'},

  {id:'clubhouse', cat:'passif', name:'Club-house de MC', price:200000, from:true,
   what:'Donne accès aux business de motards.',
   fiche:{
     quoi:'Le QG de ton club de motards (mise à jour Bikers).',
     sert:'Il permet de devenir président de MC et d’acheter les business de motards (cocaïne, meth, faux billets, cannabis, faux papiers).',
     obtenir:'Sur le site Maze Bank Foreclosures. Le moins cher (Great Chaparral) suffit.',
     conseils:['Les business de MC s’achètent ensuite depuis l’ordinateur du club-house ou Maze Bank Foreclosures.'],
     avis:'Utile surtout pour le labo de cocaïne.'}},
  {id:'coke', cat:'passif', parent:'clubhouse', name:'Labo de cocaïne', price:975000, from:true,
   what:'Le meilleur business MC (≈ 525 k$ par stock plein, amélioré).',
   fiche:{
     quoi:'Un labo de cocaïne pour ton club de motards.',
     sert:'Il produit de la cocaïne à partir de fournitures. Tu vends le stock en livraison, ou en petites quantités aux dealers de rue.',
     conseils:['Achète l’équipement et le personnel : sans eux le labo rapporte peu.', 'En solo, vends des petits lots (3 unités ou moins) pour un seul véhicule.'],
     avis:'Le seul business de MC vraiment intéressant aujourd’hui.'}},
  ...mcUps('coke', 'cocaïne', 935000, 390000, 570000),
  {id:'meth', cat:'passif', parent:'clubhouse', name:'Labo de meth', price:910000, from:true,
   what:'Correct, mais moins intéressant que le labo d’acide.',
   fiche:{quoi:'Un labo de méthamphétamine pour ton club de motards.', sert:'Production passive vendue en livraison.',
     conseils:['Utile surtout pour alimenter la boîte de nuit.'], avis:'Pas prioritaire.'}},
  ...mcUps('meth', 'meth', 1100000, 331500, 513000),
  {id:'cash', cat:'passif', parent:'clubhouse', name:'Fabrique de faux billets', price:845000, from:true,
   what:'+35 % avec le Hands On Car Wash.',
   fiche:{quoi:'Une imprimerie de faux billets pour ton club de motards.', sert:'Production passive vendue en livraison. Le Hands On Car Wash augmente ses gains de 35 %.',
     conseils:['Intéressant seulement si tu as aussi le Car Wash.'], avis:'Pas prioritaire.'}},
  ...mcUps('cash', 'faux billets', 880000, 273000, 456000),
  {id:'weed', cat:'passif', parent:'clubhouse', name:'Ferme de cannabis', price:715000, from:true,
   what:'+35 % avec Smoke on the Water.',
   fiche:{quoi:'Une ferme de cannabis pour ton club de motards.', sert:'Production passive vendue en livraison. Smoke on the Water augmente ses gains de 35 %.',
     conseils:['Intéressant surtout combiné à Smoke on the Water.'], avis:'Pas prioritaire.'}},
  ...mcUps('weed', 'cannabis', 990000, 273000, 313500),
  {id:'docs', cat:'passif', parent:'clubhouse', name:'Faussaire (faux papiers)', price:650000, from:true,
   what:'Le moins rentable. Utile seulement pour alimenter la boîte de nuit.',
   fiche:{quoi:'Un atelier de faux papiers pour ton club de motards.', sert:'Production passive vendue en livraison.',
     conseils:['À éviter, sauf pour compléter les marchandises de la boîte de nuit.'], avis:'Le business le moins rentable du jeu.'}},
  ...mcUps('docs', 'faux papiers', 550000, 195000, 285000),

  /* ------------------------------------------------------------------ FAÇADES */
  {id:'carwash', cat:'facade', name:'Hands On Car Wash', price:1000000,
   what:'Blanchiment, missions de Mr. Faber payées tout de suite, +35 % sur les faux billets.',
   fiche:{
     quoi:'Une station de lavage qui sert de façade de blanchiment (mise à jour Money Fronts, juin 2025).',
     sert:'Elle blanchit l’argent de tes autres business et rapporte un revenu passif. L’ordinateur donne accès aux missions de Mr. Faber, payées immédiatement. Elle augmente aussi les gains de la fabrique de faux billets de 35 %. C’est la condition pour acheter les deux autres façades.',
     conseils:['Les activités louches font monter une jauge de soupçon. Si elle est pleine, le blanchiment s’arrête en partie.',
       'Le travail légal (laver des voitures, livraisons de Smoke on the Water) fait baisser cette jauge.'],
     avis:'Rentable surtout quand tu possèdes déjà beaucoup de business.'}},
  {id:'weedshop', cat:'facade', parent:'carwash', name:'Smoke on the Water', price:850000,
   what:'Dispensaire de cannabis : livraisons légales et +35 % sur la ferme de cannabis.',
   fiche:{quoi:'Un dispensaire de cannabis légal.', sert:'Livraisons légales qui font baisser la jauge de soupçon, et +35 % sur la ferme de cannabis.',
     conseils:['Utile seulement si tu as la ferme de cannabis.'], avis:'Optionnel.'}},
  {id:'helitours', cat:'facade', parent:'carwash', name:'Higgins Helitours', price:900000,
   what:'Compagnie d’hélicoptères : +10 % sur le fret aérien du hangar.',
   fiche:{quoi:'Une compagnie de vols touristiques en hélicoptère.', sert:'Augmente de 10 % la valeur du fret aérien du hangar.',
     conseils:['Utile seulement si tu fais de la contrebande aérienne.'], avis:'Optionnel.'}},

  /* ------------------------------------------------------------------ PDG */
  {id:'ceo', cat:'pdg', name:'Bureau de PDG', price:1000000, from:true,
   what:'Nécessaire pour les entrepôts de marchandises et de véhicules.',
   fiche:{quoi:'Un bureau dans une tour d’affaires (Maze Bank West est le moins cher).',
     sert:'Il permet de s’enregistrer comme PDG en permanence et d’acheter des entrepôts de marchandises spéciales et de véhicules.',
     obtenir:'Sur le site Dynasty 8 Executive.',
     conseils:['La déco et les options du bureau ne rapportent rien.'], avis:'Seulement si tu veux faire de l’Import/Export.'}},
  {id:'cargo', cat:'pdg', parent:'ceo', name:'Entrepôt de marchandises (grand)', price:1900000, from:true,
   what:'111 caisses ≈ 2,2 M$, mais très long à remplir en solo.',
   fiche:{quoi:'Un entrepôt pour stocker des caisses de marchandises spéciales.', sert:'Tu achètes des caisses (1 à 3 par mission) et revends l’entrepôt entier ou en partie.',
     obtenir:'Depuis l’ordinateur du bureau de PDG (SecuroServ).',
     conseils:['Remplir 111 caisses en solo prend des heures.', 'La vente complète demande plusieurs véhicules.'], avis:'À éviter en premier achat.'}},
  {id:'vehiclewh', cat:'pdg', parent:'ceo', name:'Entrepôt de véhicules', price:1500000, from:true,
   what:'Import/Export : ≈ 80 k$ net par voiture haut de gamme.',
   fiche:{quoi:'Un entrepôt pour voitures volées (Import/Export).', sert:'Tu voles des voitures de luxe, puis tu les exportes.',
     obtenir:'Depuis l’ordinateur du bureau de PDG.',
     conseils:['Garde un stock de voitures haut de gamme pour exporter quand il y a un 2×.'], avis:'Complément correct, pas prioritaire.'}},
  {id:'hangar', cat:'pdg', name:'Hangar (contrebande aérienne)', price:1200000, from:true,
   what:'Fret aérien. Long à approvisionner.',
   fiche:{quoi:'Un hangar d’aéroport pour la contrebande aérienne (mise à jour Smuggler’s Run).', sert:'Tu récupères du fret par missions et tu le revends par avion.',
     obtenir:'Sur le site Maze Bank Foreclosures.',
     conseils:['Higgins Helitours augmente sa valeur de 10 %.'], avis:'Peu rentable en solo.'}},

  /* ------------------------------------------------------------------ VÉHICULES */
  {id:'terrorbyte', cat:'vehicule', name:'Terrorbyte', price:1375000, approx:true,
   what:'Missions clients pour la boîte de nuit et atelier de l’Oppressor Mk II.',
   fiche:{quoi:'Un camion de commandement high-tech (mise à jour After Hours).',
     sert:'Il donne accès aux missions clients liées à la boîte de nuit et contient l’atelier qui permet d’améliorer l’Oppressor Mk II.',
     obtenir:'Sur le site Warstock Cache & Carry, avec la boîte de nuit.',
     conseils:['Achète-le surtout pour l’Oppressor Mk II.'], avis:'Confort, pas rentable seul.'}},
  {id:'oppressor', cat:'vehicule', name:'Oppressor Mk II', price:8000000, approx:true,
   what:'La moto volante : gros gain de temps sur les ventes et les trajets.',
   fiche:{quoi:'Une moto volante armée de missiles.',
     sert:'C’est le moyen le plus rapide de traverser la carte : préparations, repérages et ventes en solo vont beaucoup plus vite.',
     obtenir:'Sur le site Warstock Cache & Carry. L’atelier du Terrorbyte permet de l’améliorer.',
     conseils:['Elle ne rapporte rien directement : achète-la quand ta routine tourne.'], avis:'Le meilleur achat de confort.'}},
  {id:'kuruma', cat:'vehicule', name:'Kuruma blindée', price:525000, approx:true,
   what:'Pour les missions de contact (≈ 698 k$ avant d’avoir fait le Fleeca Job).',
   fiche:{quoi:'Une berline blindée qui protège de presque toutes les balles.',
     sert:'Idéale pour les missions de contact et les débuts, quand tu te fais tirer dessus.',
     obtenir:'Sur le site Southern San Andreas Super Autos. Prix réduit après le Fleeca Job.',
     conseils:['Ne protège pas des explosions.'], avis:'Bon achat de début de partie.'}},
  {id:'buzzard', cat:'vehicule', name:'Buzzard', price:1750000,
   what:'Hélico armé. En VIP ou PDG, tu peux aussi l’appeler pour 25 k$.',
   fiche:{quoi:'Un hélicoptère d’attaque léger.',
     sert:'Déplacements rapides et appui aérien.',
     obtenir:'Sur le site Elitás Travel. En VIP ou PDG, tu peux le faire livrer pour 25 k$ sans l’acheter.',
     conseils:['L’appel à 25 k$ suffit dans la plupart des cas.'], avis:'Pas nécessaire.'}}
];

const ACTS = [
  {id:'kortz', name:'Kortz Center Heist', req:['artstudio'], solo:true, dur:95, pay:400000, first:1700000, once:true,
   payTxt:'≈ 300–480 k$ · 1er run de la semaine ≈ 1,2–1,9 M$', cd:0, cdTxt:'1 fois par session', weekly:'w_kortz',
   tip:'Le 1er run de la semaine vend la cible principale ×4 : ne le rate jamais.',
   fiche:{quoi:'Le braquage de l’été 2026, débloqué par l’atelier d’art d’un manoir (n’importe lequel des trois) : avec Raf De Angelis et Mr. Faber, tu prépares le matériel puis tu entres dans le musée du Kortz Center pour voler des tableaux dans sa chambre forte.',
     etapes:['Lance les préparations depuis le tableau de planification de l’atelier d’art, ou en appelant Raf De Angelis.','Fais les missions de préparation.','Joue la finale, seul ou jusqu’à 4.'],
     conseils:['Au 1er run de la semaine, la vente de la cible principale est multipliée par 4.','La synchro des bonus affiche les cibles principales de la semaine.']}},
  {id:'dre', name:'Contrat Dr. Dre', req:['agency'], solo:true, dur:80, pay:900000, first:1099800,
   payTxt:'900 k$ · 1er run de la semaine 1,1 M$', cd:48, cdTxt:'≈ 48–60 min', weekly:'w_dre',
   tip:'Il faut avoir terminé un contrat de sécurité avant. Tout se lance depuis l’ordinateur de l’agence.',
   fiche:{quoi:'Le contrat VIP de l’agence : retrouver les morceaux inédits volés à Dr. Dre. Une suite de missions d’enquête et de préparation, puis une finale.',
     etapes:['Termine au moins un contrat de sécurité.','Lance le contrat VIP depuis l’ordinateur de l’agence.','Enchaîne les missions d’enquête et de préparation.','Joue la finale avec Dr. Dre.'],
     conseils:['Le paiement tombe à la finale : ne quitte pas en cours de route.','Alterne-le avec Cayo pendant ses 144 min de recharge.']}},
  {id:'cayo', name:'Braquage de Cayo Perico', req:['kosatka'], solo:true, dur:85, durFast:60, fastReq:'sparrow', pay:800000,
   payTxt:'≈ 0,55–1,1 M$ selon la cible', cd:144, cdTxt:'144 min en solo',
   tip:'Entre par le tunnel de drainage et prends la cible secondaire la plus chère. Les cibles principales changent chaque semaine.',
   fiche:{quoi:'Le braquage du domaine d’El Rubio, un baron de la drogue, sur l’île de Cayo Perico. Tu repères l’île, prépares ton approche, puis voles la cible principale et des cibles secondaires.',
     etapes:['Repérage de l’île depuis le Kosatka (la 1re fois, une mission te fait tout découvrir).','Préparations obligatoires : véhicule d’approche et équipement.','Préparations facultatives, si utiles à ton approche.','Finale : vol, puis fuite vers le point d’extraction.'],
     conseils:['L’approche discrète par le tunnel de drainage est la plus rapide en solo.','En solo, remplis ton sac avec la cible secondaire la plus chère disponible.','Mode difficile : +10 % sur la cible principale.','Depuis juillet 2026, les valeurs des cibles ont baissé et leur fréquence se renouvelle chaque semaine.']}},
  {id:'titan', name:'The Titan Job', req:['mckenzie'], solo:true, dur:60, pay:500000, first:750000,
   payTxt:'500 k$ normal · 750 k$ difficile · 1er run de la semaine 750 k$ / 1,125 M$', cd:60, cdTxt:'≈ 1 h', weekly:'w_titan',
   tip:'Passe en difficile dès que tu peux : +50 %.',
   fiche:{quoi:'La finale de la série de missions Oscar Guzman Flies Again (mars 2025), lancée depuis le hangar de McKenzie Field. Jouable seul ou jusqu’à 4 : toutes les missions de la série se font en solo.',
     etapes:['Lance la série de missions depuis le hangar de McKenzie Field.','Fais les missions de préparation.','Finale : aux commandes du Titan 250 D, détruis les cibles Eberhard, puis ramène l’avion au hangar de McKenzie Field.'],
     conseils:['La finale est un combat aérien, plus difficile seul qu’en groupe : des avions ennemis te prennent en chasse, et les cibles sont dures à viser à cause de la vitesse.',
       'Fais quelques runs en normal pour apprendre la finale, puis passe en difficile : 750 k$ au lieu de 500 k$ pour l’hôte.',
       'Bonus de 1re réalisation hebdo : 750 k$ en normal, 1,125 M$ en difficile.']}},
  {id:'cluckin', name:'Cluckin’ Bell Farm Raid', req:[], solo:true, dur:70, pay:400000, first:600000,
   payTxt:'400 k$ · 1er run de la semaine 600 k$', cd:60, cdTxt:'≈ 1 h', weekly:'w_cluckin',
   tip:'Gratuit : il se lance via un appel de Vincent Effenburger.',
   fiche:{quoi:'Le raid sur l’usine de la ferme Cluckin’ Bell (2024), avec Vincent Effenburger. Une suite de missions qui finit par une grosse finale. Aucune propriété nécessaire.',
     etapes:['Lance-le via Vincent Effenburger (appel téléphonique).','Enchaîne les missions de préparation.','Joue la finale, Scene of the Crime.'],
     conseils:['C’est l’argent le plus facile pour un nouveau joueur.','600 k$ au 1er run de chaque semaine.']}},
  {id:'knoway', name:'KnoWay Out (A Clean Break)', req:[], solo:true, dur:40, pay:245000, first:455700, once:true,
   payTxt:'245 k$ normal / 368 k$ difficile · 1er run de la semaine 456 k$ / 684 k$', cd:0, cdTxt:'—', weekly:'w_knoway',
   tip:'Gratuit : téléphone public de Little Seoul. Tente le difficile pour +50 %.',
   fiche:{quoi:'Un braquage gratuit dont la finale s’appelle A Clean Break. Il se lance depuis un téléphone public de Little Seoul.',
     etapes:['Va au téléphone public de Little Seoul.','Fais les étapes de préparation.','Joue la finale, A Clean Break.'],
     conseils:['La finale se fait en une dizaine de minutes quand on la connaît.','En difficile : 684 k$ au 1er run de la semaine.']}},
  {id:'salvage', name:'Braquage de la casse', req:['salvage'], solo:true, dur:40, pay:250000, cap:3,
   payTxt:'≈ 200–400 k$ (valeur du véhicule)', cd:0, cdTxt:'3 par semaine',
   tip:'Démonte le véhicule plutôt que de le garder : tu touches ≈ 80 % de sa valeur max.',
   fiche:{quoi:'Le vol d’un des trois véhicules cibles de la semaine, pour la casse.',
     etapes:['Choisis une cible au tableau de la casse.','Fais le repérage et la préparation.','Vole le véhicule et ramène-le à la casse.','Démonte-le pour être payé.'],
     conseils:['Les trois cibles changent le jeudi : la synchro des bonus les affiche.','Les véhicules en promo de la semaine valent un peu moins.']}},
  {id:'autoshop', name:'Contrat du garage auto', req:['autoshop'], solo:true, dur:40, pay:175000,
   payTxt:'≈ 170–185 k$ · Union Depository ≈ 300 k$', cd:0, cdTxt:'3 contrats au tableau',
   tip:'Le contrat Union Depository est le plus payant.',
   fiche:{quoi:'Un des 8 contrats de braquage du garage auto : préparations courtes puis finale.',
     etapes:['Choisis un des trois contrats proposés au tableau.','Fais les préparations.','Joue la finale.'],
     conseils:['Prends l’Union Depository quand il est proposé.']}},
  {id:'fib', name:'Dossier du FIB', req:['garment'], solo:true, dur:45, pay:170000,
   payTxt:'≈ 150–300 k$ (dossier prioritaire)', cd:0, cdTxt:'—',
   fiche:{quoi:'Les missions de l’usine de vêtements : préparations puis finale, avec un dossier prioritaire mieux payé.',
     etapes:['Lance un dossier depuis l’usine.','Fais les préparations.','Joue la finale.'], conseils:['Vise le dossier prioritaire.']}},
  {id:'payphone', name:'Payphone Hit', req:['agency'], solo:true, dur:12, pay:55000,
   payTxt:'≈ 45–85 k$ avec le bonus d’assassinat', cd:10, cdTxt:'≈ 10 min',
   tip:'Respecte la méthode imposée pour toucher le bonus.',
   fiche:{quoi:'Un assassinat express commandé par Franklin via un téléphone public.',
     etapes:['Attends l’appel de Franklin, ou rends-toi au téléphone public indiqué.','Élimine la cible avec la méthode demandée.'],
     conseils:['Le bonus d’assassinat représente une grosse partie du paiement.','Parfait pour remplir les temps de recharge.']}},
  {id:'bail', name:'Prime du bureau de caution', req:['bailoffice'], solo:true, dur:18, pay:55000,
   payTxt:'≈ 35–75 k$', cd:0, cdTxt:'—',
   fiche:{quoi:'Traquer un fugitif et le ramener au bureau.', etapes:['Choisis une prime au bureau.','Retrouve le fugitif.','Ramène-le, vivant de préférence.'],
     conseils:['Vivant, la prime est complète.']}},
  {id:'vehcargo', name:'Export de véhicule', req:['ceo','vehiclewh'], solo:true, dur:20, pay:80000,
   payTxt:'≈ 80 k$ net (haut de gamme)', cd:20, cdTxt:'≈ 20–50 min',
   fiche:{quoi:'Voler une voiture de luxe pour ton entrepôt, puis l’exporter.', etapes:['Lance une mission de vol depuis le bureau.','Ramène la voiture à l’entrepôt.','Exporte-la.'],
     conseils:['Exporte surtout pendant les semaines 2× (souvent avec GTA+).']}},
  {id:'security', name:'Contrat de sécurité', req:['agency'], solo:true, dur:12, pay:45000,
   payTxt:'≈ 30–70 k$', cd:0, cdTxt:'—',
   fiche:{quoi:'Une mission courte de l’agence : récupérer un objet, protéger quelqu’un, etc.',
     etapes:['Choisis un contrat sur l’ordinateur de l’agence.','Termine la mission.'],
     conseils:['Chaque contrat fait aussi monter le revenu du coffre de l’agence.']}},
  {id:'vip', name:'Travail VIP (Headhunter, Sightseer)', req:[], solo:true, dur:10, pay:25000,
   payTxt:'≈ 20–30 k$', cd:5, cdTxt:'5–10 min', tip:'Il faut 50 k$ en banque pour devenir VIP.',
   fiche:{quoi:'Les missions de VIP disponibles dès 50 k$ en banque : Headhunter (éliminer des cibles) et Sightseer (récupérer des colis).',
     etapes:['Menu d’interaction → SecuroServ → devenir VIP.','Lance Headhunter ou Sightseer.'],
     conseils:['Idéal en tout début de partie.']}},
  {id:'casino', name:'Casse du Diamond Casino', req:['arcade'], solo:false, dur:150, pay:700000,
   payTxt:'Ta part ≈ 0,5–1 M$ selon le groupe · bonus de 1re finale hebdo', cd:0, cdTxt:'—', weekly:'w_casino',
   fiche:{quoi:'Le casse du Diamond Casino avec Lester : longue préparation, choix de l’approche, puis finale de 2 à 4 joueurs.',
     etapes:['Repérage du casino.','Préparations selon l’approche choisie.','Finale en groupe.'],
     conseils:['Bonus de 1re finale hebdo depuis juillet 2026.']}},
  {id:'doomsday', name:'Fin du monde, acte III', req:['facility'], solo:false, dur:120, pay:550000,
   payTxt:'Ta part ≈ 0,4–0,8 M$ · bonus de 1er run hebdo', cd:0, cdTxt:'—', weekly:'w_doomsday',
   fiche:{quoi:'Le dernier acte du braquage de la fin du monde, avec Lester et l’agent 14, à jouer en groupe.',
     etapes:['Préparations de l’acte depuis l’installation.','Finale en groupe.'], conseils:['Chaque acte a son bonus de 1er run hebdo.']}},
  {id:'original', name:'Braquages originaux', req:['apartment'], solo:false, dur:90, pay:300000,
   payTxt:'Ta part ≈ 0,2–0,5 M$ · bonus de 1er run hebdo pour chacun', cd:0, cdTxt:'—', weekly:'w_original',
   fiche:{quoi:'Les cinq braquages historiques de GTA Online, à jouer en groupe depuis un appartement haut de gamme.',
     etapes:['Lance un braquage depuis la salle de planification.','Fais les préparations avec ton groupe.','Joue la finale.'],
     conseils:['Les préparations paient plus depuis juillet 2026.']}}
];

/* Revenus passifs : « low » = estimation basse avec toutes les améliorations utiles (ups). */
const PASSIVE = [
  {req:'acidlab', ups:['acidupg'], name:'Labo d’acide', full:'≈ 335 k$ (amélioré)', low:36000, high:95000, note:'Vente rapide en Brickade, ou à petites doses aux dealers de rue.'},
  {req:'nightclub', techs:true, ups:['nc_equip'], name:'Boîte de nuit, entrepôt', full:'≈ 1,8 M$', low:27500, high:50000, note:'≈ 67 h pour tout remplir avec 5 techniciens. Une seule vente.'},
  {req:'nightclub', name:'Boîte de nuit, coffre', full:'250 k$ max', low:20000, high:62500, note:'Jusqu’à 50 k$ par jour de jeu (48 min) avec la popularité au max.'},
  {req:'bunker', ups:['bunker_equip','bunker_staff'], name:'Bunker', full:'≈ 1,05 M$', low:57700, high:60000, note:'En solo, vends par petites quantités (≈ 175 k$ par véhicule).'},
  {req:'coke', ups:['coke_equip','coke_staff'], name:'Labo de cocaïne', full:'≈ 525 k$', low:67500, high:74000, note:'Ventes de 3 unités ou moins en solo.'},
  {req:'meth', ups:['meth_equip','meth_staff'], name:'Labo de meth', full:'≈ 446 k$', low:43000, high:51000, note:''},
  {req:'cash', ups:['cash_equip','cash_staff'], name:'Faux billets', full:'≈ 368 k$', low:40800, high:48000, note:'+35 % avec le Car Wash.'},
  {req:'weed', ups:['weed_equip','weed_staff'], name:'Cannabis', full:'≈ 315 k$', low:36500, high:36500, note:'+35 % avec Smoke on the Water.'},
  {req:'docs', ups:['docs_equip','docs_staff'], name:'Faux papiers', full:'≈ 158 k$', low:22500, high:22500, note:'Le moins rentable.'},
  {req:'agency', name:'Coffre de l’agence', full:'250 k$ max', low:0, high:0, note:'Rapporte plus à mesure que tu termines des contrats de sécurité.'},
  {req:'carwash', scale:true, name:'Car Wash, blanchiment', full:'—', low:15000, high:37500, note:'≈ 30 k$ par jour de jeu si tu as beaucoup de business. Surveille la jauge de soupçon.'}
];

const ROADMAP = [
  {id:'free', title:'Les gratuits d’abord', props:['firstdose'],
   why:'Avant de dépenser quoi que ce soit : Cluckin’ Bell Farm Raid et KnoWay Out ne demandent aucune propriété et paient 600 k$ et 456 k$ au 1er run de chaque semaine. Fais aussi les 6 missions First Dose : elles débloquent le labo d’acide et t’offrent le Brickade 6x6.',
   unlocks:'≈ 1 M$ par semaine sans rien acheter'},
  {id:'acid', title:'Labo d’acide + équipement', props:['acidlab','acidupg'],
   why:'Le business le moins cher, rentable en solo et en session privée. Fais 10 Fooligan Jobs pour débloquer l’équipement, qui augmente nettement la valeur du stock.',
   unlocks:'≈ 335 k$ par stock plein'},
  {id:'agency', title:'Agence', props:['agency'],
   why:'Le contrat Dr. Dre paie ≈ 1,1 M$ au 1er run de la semaine puis 900 k$. Les Payphone Hits remplissent les temps morts et le coffre se remplit tout seul.',
   unlocks:'Contrat Dr. Dre, Payphone Hits'},
  {id:'kosatka', title:'Kosatka', props:['kosatka'],
   why:'Cayo Perico reste le braquage solo de référence malgré la baisse de juillet 2026. Alterne-le avec Dr. Dre pendant ses 144 min de recharge.',
   unlocks:'≈ 0,55–1,1 M$ par braquage'},
  {id:'mckenzie', title:'Hangar de McKenzie Field', props:['mckenzie'],
   why:'Le moins cher des braquages : 750 k$ en normal ou 1,125 M$ en difficile au 1er run de la semaine. Remboursé en moins de deux semaines.',
   unlocks:'The Titan Job'},
  {id:'sparrow', title:'Sparrow pour le Kosatka', props:['sparrow'],
   why:'Tu gagnes 20 à 30 minutes sur chaque Cayo. Sur un mois, c’est l’achat de confort le plus rentable.',
   unlocks:'Cayo en ≈ 1 h au lieu de ≈ 1 h 30'},
  {id:'autoshop', title:'Garage auto', props:['autoshop'],
   why:'Des contrats courts et solo entre deux recharges, plus les Exotic Exports chaque jour.',
   unlocks:'≈ 170–300 k$ par contrat'},
  {id:'salvage', title:'Casse (Salvage Yard)', props:['salvage'],
   why:'3 braquages de véhicules par semaine, un coffre et le remorquage.',
   unlocks:'≈ 600 k$ – 1 M$ par semaine'},
  {id:'bunker', title:'Bunker (Chumash) + équipement + personnel', props:['bunker','bunker_equip','bunker_staff'],
   why:'Une production passive fiable pendant tes braquages, qui alimente aussi la boîte de nuit. Sans l’équipement et le personnel, il rapporte beaucoup moins. La sécurité n’est pas utile.',
   unlocks:'≈ 1 M$ par stock plein'},
  {id:'nightclub', title:'Boîte de nuit + 4 techniciens', props:['nightclub','nc_techs'],
   why:'Elle revend ce que produisent ton bunker, tes business de MC et ton entrepôt PDG, sans réapprovisionnement. Sans eux, elle ne rapporte presque rien. Les techniciens comptent plus que les améliorations de la boîte.',
   unlocks:'≈ 1,8 M$ par entrepôt plein'},
  {id:'coke', title:'Club-house + cocaïne + améliorations', props:['clubhouse','coke','coke_equip','coke_staff'],
   why:'Un fournisseur de plus pour la boîte de nuit, et des ventes rapides via les dealers de rue.',
   unlocks:'≈ 525 k$ par stock plein'},
  {id:'carwash', title:'Hands On Car Wash', props:['carwash'],
   why:'Blanchiment, missions payées tout de suite et revenu passif. Rentable surtout quand tu possèdes déjà beaucoup de business.',
   unlocks:'≈ 30 k$ par jour de jeu'},
  {id:'oppressor', title:'Terrorbyte + Oppressor Mk II', props:['terrorbyte','oppressor'],
   why:'Pas rentable en soi, mais tu gagnes du temps sur tout. À prendre quand ta routine tourne déjà.',
   unlocks:'Trajets et ventes plus rapides'},
  {id:'mansion', title:'Manoir (ou villa) + atelier d’art', props:['mansion','artstudio'],
   why:'Un des 3 manoirs (Propriété de Tongva, Résidence de Vinewood ou Villa de Richman) plus son atelier d’art, qui débloque le Kortz Center Heist : ≈ 1,2–1,9 M$ au 1er run de la semaine. Très cher (≈ 16,2 M$ avec le moins cher), garde-le pour quand tout le reste tourne.',
   unlocks:'Kortz Center Heist'}
];
const ROAD_GROUP = {id:'arcade', title:'Salle d’arcade (tu joues en groupe)', props:['arcade'],
  why:'Le casse du Diamond Casino demande au moins 2 joueurs, mais reste un des plus rentables à plusieurs.',
  unlocks:'Casse du Diamond Casino'};

const AVOID = [
  ['Un entrepôt de marchandises PDG en premier achat', 'Lent et pénible en solo. C’est l’erreur de débutant classique.'],
  ['La boîte de nuit trop tôt', 'Sans business pour l’alimenter, elle ne rapporte presque rien.'],
  ['Le faussaire (faux papiers)', 'Le business le moins rentable du jeu.'],
  ['Les améliorations de sécurité', 'Elles protègent des raids mais ne rapportent rien. Équipement et personnel d’abord.'],
  ['Le bunker de Paleto', 'Moins cher à l’achat, mais chaque vente est plus longue.'],
  ['Décoration, chambres, garages en plus', 'Aucun rendement. Ça peut attendre.'],
  ['Les supercars avant d’avoir 3 sources de revenus', 'Elles ne rapportent rien et retardent tout le reste.'],
  ['Vendre en session publique sans protection', 'Un autre joueur peut détruire ta marchandise. Passe en session privée.']
];

const RULES = [
  'Joue en session privée (sur invitation) pour vendre tranquille.',
  'Fais d’abord les bonus de 1re réalisation de la semaine : c’est l’argent le plus rapide du jeu.',
  'Synchronise les bonus le jeudi : un 2× sur un business change tes priorités de la semaine.',
  'Achète en promo si ce n’est pas urgent : les propriétés passent souvent à −30 à −50 %.',
  'Reste connecté : tes business ne produisent que quand tu es en ligne.',
  'Remplis les temps de recharge avec des activités courtes (Payphone Hits, contrats, travail VIP).'
];

const PRESETS = [
  {act:'cayo', label:'Recharge Cayo Perico (solo)', min:144, req:['kosatka']},
  {act:'dre', label:'Recharge contrat Dr. Dre', min:48, req:['agency']},
  {act:'titan', label:'Recharge Titan Job', min:60, req:['mckenzie']},
  {act:'cluckin', label:'Recharge Cluckin’ Bell', min:60, req:[]},
  {act:'payphone', label:'Prochain Payphone Hit', min:10, req:['agency']},
  {act:'vehcargo', label:'Recharge export de véhicule', min:20, req:['vehiclewh']},
  {act:null, label:'Coffre de la boîte de nuit (1 jour de jeu)', min:48, req:['nightclub']},
  {act:null, label:'Un jour de jeu (48 min)', min:48, req:[]}
];

/* ------------------------------------------------------------------ EMPLACEMENTS
   Source : gta.wiki (tableaux « Locations »), novembre 2026. Prix de base, hors options.
   a = quartier ; xy = position approximative quand plusieurs emplacements partagent un quartier. */
const LOCS = {
  bunker: [
    {n:'Paleto Forest', a:'Paleto Forest', p:1165000, tip:'Le moins cher, mais loin de tout : ventes longues.'},
    {n:'Raton Canyon', a:'Raton Canyon', p:1450000},
    {n:'Lago Zancudo', a:'Lago Zancudo', p:1550000},
    {n:'Chumash', a:'Chumash', p:1650000, best:true, tip:'Conseillé : le plus proche de Los Santos pour les ventes.'},
    {n:'Grapeseed', a:'Grapeseed', p:1750000},
    {n:'Route 68', a:'Grand Senora Desert', p:1950000, xy:[850,2850]},
    {n:'Grand Senora Oilfields', a:'Grand Senora Desert', p:2035000, xy:[600,3050]},
    {n:'Grand Senora Desert', a:'Grand Senora Desert', p:2120000, xy:[1300,3150], tip:'À l’ouest de l’aérodrome de Sandy Shores.'},
    {n:'Smoke Tree Road', a:'Grand Senora Desert', p:2205000, xy:[2150,3350]},
    {n:'Thomson Scrapyard', a:'Grand Senora Desert', p:2290000, xy:[2450,3050]},
    {n:'Farmhouse', a:'Grand Senora Desert', p:2375000, xy:[1800,2300], tip:'Au sud de la prison de Bolingbroke.'}
  ],
  nightclub: [
    {n:'Elysian Island', a:'Elysian Island', p:1080000},
    {n:'LSIA', a:'LSIA', p:1135000},
    {n:'Vespucci Canals', a:'Vespucci Canals', p:1320000},
    {n:'Cypress Flats', a:'Cypress Flats', p:1370000},
    {n:'Mission Row', a:'Mission Row', p:1440000},
    {n:'La Mesa', a:'La Mesa', p:1500000},
    {n:'Strawberry', a:'Strawberry', p:1525000},
    {n:'Del Perro', a:'Del Perro', p:1645000},
    {n:'Downtown Vinewood', a:'Downtown Vinewood', p:1670000},
    {n:'West Vinewood', a:'West Vinewood', p:1700000}
  ],
  hangar: [
    {n:'LSIA Hangar A17', a:'LSIA', p:1200000},
    {n:'LSIA Hangar 1', a:'LSIA', p:1525000},
    {n:'Fort Zancudo Hangar 3497', a:'Fort Zancudo', p:2085000, tip:'Donne accès à Fort Zancudo.'},
    {n:'Fort Zancudo Hangar 3499', a:'Fort Zancudo', p:2650000, tip:'Donne accès à Fort Zancudo.'},
    {n:'Fort Zancudo Hangar A2', a:'Fort Zancudo', p:3250000, tip:'Donne accès à Fort Zancudo.'}
  ],
  facility: [
    {n:'Paleto Bay', a:'Paleto Bay', p:1250000},
    {n:'Mount Gordo', a:'Mount Gordo', p:1465000},
    {n:'Lago Zancudo', a:'Lago Zancudo', p:1670000},
    {n:'RON Alternates Wind Farm', a:'RON Alternates Wind Farm', p:1855000},
    {n:'Zancudo River', a:'Zancudo River', p:2100000},
    {n:'Route 68', a:'Route 68', p:2312500},
    {n:'Grand Senora Desert', a:'Grand Senora Desert', p:2525000},
    {n:'Sandy Shores', a:'Sandy Shores', p:2740000},
    {n:'Land Act Reservoir', a:'Land Act Reservoir', p:2950000}
  ],
  clubhouse: [
    {n:'Great Chaparral (101 Route 68)', a:'Great Chaparral', p:200000},
    {n:'Sandy Shores (47 Algonquin Blvd)', a:'Sandy Shores', p:210000},
    {n:'Grapeseed (2111 East Joshua Road)', a:'Grapeseed', p:225000},
    {n:'Paleto Bay (1 Paleto Blvd)', a:'Paleto Bay', p:242000},
    {n:'Paleto Bay (68 Paleto Blvd)', a:'Paleto Bay', p:250000},
    {n:'Del Perro Beach (7 Del Perro Beach)', a:'Del Perro Beach', p:365000},
    {n:'Vespucci Beach (4 Goma Street)', a:'Vespucci Beach', p:395000},
    {n:'Rancho (1334 Roy Lowenstein Blvd)', a:'Rancho', p:420000},
    {n:'La Mesa (137 Capital Blvd)', a:'La Mesa', p:449000},
    {n:'Pillbox Hill (75 Elgin Avenue)', a:'Pillbox Hill', p:455000},
    {n:'Downtown Vinewood (2214 Clinton Avenue)', a:'Downtown Vinewood', p:472000},
    {n:'Hawick (1778 Hawick Avenue)', a:'Hawick', p:495000}
  ],
  coke: [
    {n:'Alamo Sea', a:'Alamo Sea', p:975000},
    {n:'Paleto Bay', a:'Paleto Bay', p:1098000},
    {n:'Elysian Island', a:'Elysian Island', p:1462500},
    {n:'Morningwood', a:'Morningwood', p:1852500}
  ],
  meth: [
    {n:'Grand Senora Desert', a:'Grand Senora Desert', p:910000},
    {n:'Paleto Bay', a:'Paleto Bay', p:1024800},
    {n:'Terminal', a:'Terminal', p:1365000},
    {n:'El Burro Heights', a:'El Burro Heights', p:1729000}
  ],
  cash: [
    {n:'Grand Senora Desert', a:'Grand Senora Desert', p:845000},
    {n:'Paleto Bay', a:'Paleto Bay', p:951600},
    {n:'Cypress Flats', a:'Cypress Flats', p:1267500},
    {n:'Vespucci Canals', a:'Vespucci Canals', p:1605000}
  ],
  weed: [
    {n:'San Chianski Mountain Range', a:'San Chianski Mountain Range', p:715000},
    {n:'Mount Chiliad', a:'Mount Chiliad', p:805200},
    {n:'Elysian Island', a:'Elysian Island', p:1072500},
    {n:'Downtown Vinewood', a:'Downtown Vinewood', p:1358500}
  ],
  docs: [
    {n:'Grapeseed', a:'Grapeseed', p:650000},
    {n:'Paleto Bay', a:'Paleto Bay', p:732000},
    {n:'Elysian Island', a:'Elysian Island', p:975000},
    {n:'Textile City', a:'Textile City', p:1235000}
  ],
  agency: [
    {n:'Little Seoul Tower', a:'Little Seoul', p:2010000},
    {n:'Celltowa Building', a:'Vespucci Canals', p:2145000},
    {n:'Rockford Hills', a:'Rockford Hills', p:2415000},
    {n:'Galileo House', a:'Hawick', p:2830000}
  ],
  autoshop: [
    {n:'Mission Row', a:'Mission Row', p:1670000},
    {n:'Flints Autos', a:'Strawberry', p:1705000},
    {n:'Auto Body Shop', a:'Rancho', p:1750000},
    {n:'Auto Garage', a:'Burton', p:1830000},
    {n:'Auto Shop', a:'La Mesa', p:1920000}
  ],
  salvage: [
    {n:'Paleto Bay', a:'Paleto Bay', p:1620000, tip:'Le moins cher, mais loin de la ville.'},
    {n:'Sandy Shores', a:'Sandy Shores', p:2030000},
    {n:'Murrieta Heights', a:'Murrieta Heights', p:2420000},
    {n:'Strawberry', a:'Strawberry', p:2570000},
    {n:'La Puerta', a:'La Puerta', p:2690000}
  ],
  arcade: [
    {n:'Pixel Pete’s', a:'Paleto Bay', p:1235000},
    {n:'Wonderama', a:'Grapeseed', p:1565000},
    {n:'Videogeddon', a:'La Mesa', p:1875000},
    {n:'Warehouse', a:'Davis', p:2135000},
    {n:'Insert Coin', a:'Rockford Hills', p:2345000},
    {n:'Eight-Bit', a:'Downtown Vinewood', p:2530000}
  ],
  bailoffice: [
    {n:'Paleto Boulevard', a:'Paleto Bay', p:1650000},
    {n:'Carson Avenue', a:'Davis', p:2000000},
    {n:'Red Desert Avenue', a:'Del Perro', p:2350000},
    {n:'Atlee Street', a:'Mission Row', p:2390000},
    {n:'Alta Street', a:'Downtown Vinewood', p:2620000}
  ],
  ceo: [
    {n:'Maze Bank West', a:'Del Perro', p:1000000},
    {n:'Arcadius Business Center', a:'Pillbox Hill', p:2250000},
    {n:'Lombank West', a:'Del Perro', p:3100000},
    {n:'Maze Bank Tower', a:'Pillbox Hill', p:4000000}
  ],
  cargo: [
    {n:'Petit · Convenience Store Lockup', a:'Rancho', p:250000},
    {n:'Petit · Celltowa Unit', a:'La Mesa', p:318000},
    {n:'Petit · White Widow Garage', a:'La Puerta', p:360000},
    {n:'Petit · Pacific Bait Storage', a:'Elysian Island', p:376000},
    {n:'Petit · Pier 400 Utility Building', a:'Elysian Island', p:392000},
    {n:'Petit · Foreclosed Garage', a:'West Vinewood', p:400000},
    {n:'Moyen · GEE Warehouse', a:'El Burro Heights', p:880000},
    {n:'Moyen · Derriere Lingerie Backlot', a:'Del Perro', p:902000},
    {n:'Moyen · Fridgit Annexe', a:'La Puerta', p:925000},
    {n:'Moyen · Discount Retail Unit', a:'Downtown Vinewood', p:948000},
    {n:'Moyen · Disused Factory Outlet', a:'Strawberry', p:971000},
    {n:'Moyen · LS Marine Building 3', a:'Elysian Island', p:994000},
    {n:'Moyen · Old Power Station', a:'Rancho', p:1000000},
    {n:'Moyen · Railyard Warehouse', a:'La Mesa', p:1017000},
    {n:'Grand · Wholesale Furniture', a:'Cypress Flats', p:1900000},
    {n:'Grand · West Vinewood Backlot', a:'West Vinewood', p:2135000},
    {n:'Grand · Xero Gas Factory', a:'LSIA', p:2365000},
    {n:'Grand · Logistics Depot', a:'La Mesa', p:2600000},
    {n:'Grand · Bilgeco Warehouse', a:'LSIA', p:2825000},
    {n:'Grand · Walker & Sons Warehouse', a:'Banning', p:3040000},
    {n:'Grand · Cypress Warehouses', a:'Cypress Flats', p:3265000},
    {n:'Grand · Darnell Bros Warehouse', a:'La Mesa', p:3500000}
  ],
  vehiclewh: [
    {n:'La Mesa', a:'La Mesa', p:1500000},
    {n:'El Burro Heights', a:'El Burro Heights', p:1635000},
    {n:'Elysian Island', a:'Elysian Island', p:1950000},
    {n:'LSIA (1)', a:'LSIA', p:2170000},
    {n:'LSIA (2)', a:'LSIA', p:2300000},
    {n:'Davis', a:'Davis', p:2495000},
    {n:'Cypress Flats', a:'Cypress Flats', p:2675000},
    {n:'La Puerta', a:'La Puerta', p:2735000},
    {n:'Murrieta Heights', a:'Murrieta Heights', p:2850000}
  ],
  apartment: [
    {n:'Del Perro Heights', count:3, a:'Del Perro', p:200000, tip:'Apt 7 : le moins cher avec salle de braquage.'},
    {n:'3 Alta Street Tower', count:2, a:'Los Santos', p:217000},
    {n:'4 Integrity Way', count:3, a:'Los Santos', p:235000},
    {n:'Richards Majestic', count:3, a:'Los Santos', p:241000},
    {n:'Tinsel Towers', count:3, a:'Los Santos', p:270000},
    {n:'Weazel Plaza', count:3, a:'Los Santos', p:304000},
    {n:'Eclipse Towers', count:5, a:'Los Santos', p:373000, tip:'Plus 3 penthouses (905 k$ à 1,1 M$), salle de braquage non confirmée.'},
    {n:'Maisons sur pilotis', count:10, a:'Vinewood Hills', p:449000}
  ],
  mansion: [
    {n:'Propriété de Tongva (Tongva Estate)', a:'Tongva Hills', p:11500000, tip:'Buen Vino Road.'},
    {n:'Résidence de Vinewood (Vinewood Residence)', a:'Vinewood Hills', p:12200000, xy:[150,1150], tip:'Marlowe Drive.'},
    {n:'Villa de Richman (Richman Villa)', a:'Vinewood Hills', p:12800000, xy:[-600,1000], tip:'Ace Jones Drive, la propriété la plus chère du jeu.'}
  ],
  mckenzie: [{n:'McKenzie Field', a:'Grapeseed', p:1475000, xy:[2120,4790], tip:'Sur l’aérodrome de McKenzie Field.'}],
  garment: [{n:'Darnell Bros Garment Factory', a:'La Mesa', p:2350000, tip:'Popular Street.'}],
  carwash: [{n:'Hands On Car Wash', a:'Strawberry', p:1000000}],
  weedshop: [{n:'Smoke on the Water', a:'Vespucci Beach', p:850000}],
  helitours: [{n:'Higgins Helitours', a:'La Puerta', p:900000}]
};
const LOC_NOTES = {
  kosatka: 'Pas d’emplacement fixe : c’est un sous-marin, tu le fais venir où tu veux sur la côte.',
  acidlab: 'Pas d’emplacement fixe : le labo est installé dans le Brickade 6x6, qui se déplace avec toi.',
  firstdose: 'Les missions se lancent à la Freakshop.'
};

/* Plan schématique de San Andreas, en coordonnées du jeu (x vers l’est, y vers le nord).
   Les positions sont approximatives, au niveau du quartier. */
const AREAS = {
  'LSIA':[-1150,-2850], 'Elysian Island':[150,-2650], 'Terminal':[950,-3000], 'Cypress Flats':[850,-2150], 'Banning':[-150,-2300],
  'La Puerta':[-800,-1250], 'Vespucci Canals':[-1050,-1000], 'Vespucci Beach':[-1350,-1150], 'Del Perro':[-1450,-550], 'Del Perro Beach':[-1650,-950],
  'Morningwood':[-1350,-250], 'Rockford Hills':[-800,-150], 'Burton':[-400,-150], 'Little Seoul':[-700,-900], 'Pillbox Hill':[100,-800],
  'Mission Row':[420,-1000], 'Textile City':[380,-680], 'Strawberry':[150,-1350], 'Davis':[100,-1700], 'Rancho':[450,-1800],
  'La Mesa':[850,-1200], 'El Burro Heights':[1400,-1950], 'Murrieta Heights':[1100,-1550], 'Hawick':[300,-50],
  'Downtown Vinewood':[300,250], 'West Vinewood':[-300,250], 'Vinewood Hills':[300,1050], 'Tongva Hills':[-1800,2100],
  'Great Chaparral':[-250,2300], 'Chumash':[-3150,1050], 'Lago Zancudo':[-2450,2700], 'Fort Zancudo':[-2250,3150], 'Zancudo River':[-900,3100],
  'Raton Canyon':[-650,4350], 'Paleto Forest':[-600,5600], 'Paleto Bay':[-200,6350], 'Mount Chiliad':[450,5550],
  'Grapeseed':[1900,4850], 'Alamo Sea':[900,3720], 'Sandy Shores':[1800,3700], 'Grand Senora Desert':[1300,3000], 'Route 68':[850,2750],
  'RON Alternates Wind Farm':[2250,1900], 'Land Act Reservoir':[1900,400], 'Mount Gordo':[2900,5600], 'San Chianski Mountain Range':[2900,4400]
};
const MAP = {
  bounds: {minX:-3800, maxX:4100, minY:-3800, maxY:7500},
  coast: [[-1900,-3450],[-1150,-3600],[-350,-3450],[500,-3550],[1300,-3450],[1650,-2900],[2000,-2300],[2500,-1700],[2800,-900],[2900,0],
    [2950,900],[2950,1700],[3300,2400],[3700,3200],[3800,4000],[3700,4800],[3500,5300],[3100,5800],[2500,6300],[1800,6600],[1100,6900],
    [400,7200],[-300,7000],[-700,6500],[-1200,6000],[-1700,5400],[-2200,4700],[-2600,4000],[-2950,3300],[-3150,2600],[-3350,1900],
    [-3450,1200],[-3300,500],[-2800,0],[-2300,-300],[-1950,-700],[-1750,-1150],[-1650,-1600],[-2050,-2500],[-2100,-3100]],
  lake: {x:1250, y:4250, rx:950, ry:430},
  labels: [['Los Santos',2000,-900],['LSIA',-1250,-3150],['Vinewood',300,650],['Chumash',-2950,1450],['Fort Zancudo',-2150,3550],
    ['Alamo Sea',1250,4250],['Sandy Shores',1900,3400],['Grapeseed',2200,5200],['Paleto Bay',-150,6750],['Mont Chiliad',550,5950],
    ['Désert de Grand Senora',1400,2500],['Mont Gordo',2950,6000]]
};

return {CATS, PROPS, ACTS, PASSIVE, ROADMAP, ROAD_GROUP, AVOID, RULES, PRESETS, LOCS, LOC_NOTES, AREAS, MAP};
})();
