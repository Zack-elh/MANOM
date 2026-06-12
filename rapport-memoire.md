# Projet fin d'etude

## Presente en vue d'obtenir

### Le Grade de Bachelor en

**Genie Logiciel et Systemes d'Information**

---

**Par**

**NOM, Prenom :** [NOM Prenom]

**Valide par :** [Nom du directeur]

**Titre ou sujet du memoire :**

**Conception et Developpement d'une Plateforme Web de Gestion de Reservation pour un Etablissement de Coiffure : Cas d'Etude - MANOM BarberShop**

---

**Session de Juin 2026**

---

## Note

> Institut ORDICIEL n'entend donner aucune approbation ni improbation aux opinions emises dans ce dossier. Ces opinions doivent etre considerees comme propres a leur auteur.

---

## Remerciements

Avant tout developpement, je tiens a exprimer ma profonde gratitude envers toutes les personnes qui ont contribue a la realisation de ce projet. Je remercie tout particulierement mon directeur de memoire pour son accompagnement, ses conseils precieux et sa disponibilite tout au long de ce travail.

Je remercie egalement l'ensemble du corps enseignant de l'institut pour la qualite de la formation dispensee, ainsi que pour les competences transmises qui ont rendu ce projet possible. Mes remerciements s'adressent egalement a la direction de l'institut pour les conditions de travail offertes.

Enfin, je remercie ma famille et mes amis pour leur soutien indefectible et leurs encouragements constants.

---

## Dedicaces

Je dedie ce modeste travail a mes chers parents, pour leur amour, leur sacrifice et leur devouement. A mes freres et soeurs pour leur soutien moral. A tous ceux qui ont cru en moi et qui m'ont encourage tout au long de ce parcours.

---

## Sommaire

- **Introduction generale** --- 1
- **Partie 1 : Etude theorique** --- 3
  - Chapitre 1 : Problematique --- 4
  - Chapitre 2 : Solution --- 10
- **Partie 2 : Etude pratique** --- 16
  - Chapitre 1 : Analyse et Conception --- 17
  - Chapitre 2 : Realisation et Implementation --- 25
- **Conclusion generale** --- 35
- **Bibliographie** --- 37
- **Annexes** --- 38
- **Liste des graphiques** --- 39
- **Liste des tableaux** --- 40

---

## Liste des abreviations

| Abreviation | Signification |
|---|---|
| HTML | HyperText Markup Language |
| CSS | Cascading Style Sheets |
| JS | JavaScript |
| API | Application Programming Interface |
| DB | Database (Base de donnees) |
| CRUD | Create, Read, Update, Delete |
| SQL | Structured Query Language |
| PHP | PHP: Hypertext Preprocessor |
| JSON | JavaScript Object Notation |
| i18n | Internationalization |
| UI/UX | User Interface / User Experience |
| HTTP | HyperText Transfer Protocol |
| REST | Representational State Transfer |
| SPA | Single Page Application |

---

## Introduction generale

La digitalisation des services constitue aujourd'hui un enjeu majeur pour les entreprises et les commerces de proximite. Dans le secteur des services, les etablissements de coiffure font face a des defis croissants en matiere de gestion des rendez-vous, d'organisation des emplois du temps et de fidelisation de leur clientele. La gestion manuelle des reservations, encore largement repandue dans les petits commerces, presente de nombreuses limites : risques d'erreurs, pertes de temps, manque de traabilite et difficultes a optimiser l'occupation des creneaux horaires.

Dans ce contexte, le projet MANOM BarberShop s'inscrit dans une demarche de modernisation d'un etablissement de coiffure situe a Manom, en France. MANOM est un barbershop premium qui ambitionne d'offrir une experience client enrichie tout en rationalisant ses operations internes. Le projet vise a concevoir et developper une plateforme web complete permettant de gerer les reservations en ligne, le catalogue de services, l'equipe de barbiers, ainsi que l'administration de l'etablissement.

La plateforme developpee repose sur une architecture moderne combinant un framework frontend performant (Next.js) et un backend API (PHP), garantissant ainsi une experience utilisateur fluide et reactive. Le systeme integre une authentification securisee, un systeme de reservation en temps reel avec gestion de la disponibilite des barbiers, une interface d'administration complete, ainsi qu'une prise en charge multilingue (francais, anglais, arabe) et multi-devises.

Ce memoire s'articule en deux parties principales. La premiere partie presente le cadre theorique et technique du projet, en abordant la problematique de la gestion des reservations et les solutions existantes sur le marche. La deuxieme partie detaille la conception, l'architecture et l'implementation de la solution developpee, en presentant les choix technologiques, les diagrammes de conception et les fonctionnalites cles du systeme.

---

# Partie 1. Etude theorique

## Introduction de la partie

Cette partie vise a poser le cadre theorique et conceptuel du projet. Elle commence par une analyse de la problematique liee a la gestion des reservations dans les etablissements de coiffure, puis presente les solutions technologiques envisagees pour y repondre. L'objectif est de justifier les choix d'architecture et de technologies effectues pour le developpement de la plateforme MANOM BarberShop.

---

# Chapitre 1 : Problematique

## Introduction du chapitre

La gestion des reservations dans les etablissements de coiffure constitue un enjeu operationnel majeur. Ce chapitre presente l'analyse du contexte metier, identifie les problemes rencontres et formule la problematique a laquelle le projet cherche a apporter une reponse.

## Section 1. Contexte et Environnement du Projet

### 1.1. Presentation de l'entreprise MANOM BarberShop

MANOM BarberShop est un etablissement de coiffure situe a Manom, commune limitrophe de Thionville dans le departement de la Moselle, France. Le barbershop se positionne sur le segment du grooming premium, offrant des services de coupe, de taille-barbe, de soins capillaires et de design capillaire. L'etablissement emploie une equipe de barbiers qualifies et souhaite moderniser son processus de gestion des rendez-vous afin d'ameliorer l'experience client et l'efficacite operationnelle.

Le choix de MANOM comme cas d'etude se justifie par plusieurs facteurs :
- Un etablissement de taille moyenne (3 a 5 barbiers) representatif des commerces de proximite
- Une clientele diversifiee necessitant une prise en charge multilingue
- Un besoin identifie de digitalisation du processus de reservation
- Un potentiel de croissance necessitant un outil de gestion evolutif

### 1.2. Problematique identifiee

La gestion manuelle des reservations dans les salons de coiffure presente de nombreuses insuffisances. Les principales problematiques observees incluent :

1. **Les conflits de reservation** : Sans systeme informatise, les risques de double reservation sur un meme creneau horaire sont eleves, entrainant une insatisfaction client et une perte de revenus.

2. **L'absence de visibilite en temps reel** : Les barbiers et le personnel administratif n'ont pas acces en temps reel a l'etat d'occupation des creneaux, rendant difficile l'optimisation de l'agenda.

3. **La gestion manuelle des clients** : L'absence de base de donnees centralisee empeche le suivi de l'historique des clients, la fidelisation et la communication personnalisee.

4. **Le manque de visibilite en ligne** : Dans un monde ou les clients recherchent principalement en ligne, l'absence de presence numerique impacte negativement l'acquisition de nouveaux clients.

5. **La difficile coordination de l'equipe** : La gestion des emplois du temps de plusieurs barbiers en parallele s'avere complexe sans outil dedie.

### 1.3. Objectifs du projet

Face a ces constats, le projet MANOM BarberShop vise a developper une plateforme web repondant aux objectifs suivants :

- **Objectif principal** : Concevoir et developper une application web permettant la gestion en ligne des reservations pour un barbershop.

- **Objectifs specifiques** :
  - Permettre aux clients de creer un compte et de reserver en ligne
  - Offrir une visibilite en temps reel de la disponibilite des barbiers
  - Fournir une interface d'administration complete pour la gestion des services, barbiers et reservations
  - Supporter le multilinguisme (francais, anglais, arabe)
  - Gerer les paiements en devises multiples (EUR, USD, MAD)

## Section 2. Etat de l'Art et Solutions Existantes

### 1.1. Les solutions de gestion de reservation existantes

Le marche des logiciels de gestion pour salons de coiffure propose plusieurs solutions, parmi lesquelles :

1. **Treatwell** : Plateforme de reservation en ligne pour les salons de beaute. Solution SaaS avec abonnement mensuel. Avantages : visibilite forte, facilite d'utilisation. Inconvenients : commission sur chaque reservation, manque de personnalisation.

2. **Fresha** : Logiciel de gestion de salon avec reservation en ligne. Solution gratuite avec options payantes. Avantages : sans frais de commission, interface intuitive. Inconvenients : fonctionnalites limitees dans la version gratuite, dependance a une plateforme tierce.

3. **Square Appointments** : Solution integree avec systeme de paiement. Avantages : integration native avec le paiement, point de vente integre. Inconvenients : limite aux pays supportes par Square, couts de transaction.

4. **Booksy** : Application de reservation pour les professionnels de la beaute. Avantages : forte presence mobile, fonctionnalites de fidelisation. Inconvenients : abonnement couteux pour les petits etablissements.

### 1.2. Limites des solutions existantes

Malgre leur efficacite, ces solutions presentent des limites notables pour un barbershop comme MANOM :

- **Cout** : Les abonnements mensuels et les commissions representent une charge financiere importante pour un petit etablissement.
- **Personnalisation** : Les solutions SaaS n'offrent generalement pas de personnalisation poussee de l'experience utilisateur.
- **Dependance** : L'utilisation d'une plateforme tierce cree une dependance vis-a-vis du fournisseur.
- **Donnees** : Les donnees clients et les informations metier restent sur les serveurs du prestataire.
- **Multilinguisme** : Peu de solutions offrent un vrai support multilingue adapte a une clientele internationale.

### 1.3. Justification du developpement sur mesure

Ces constats justifient le developpement d'une solution sur mesure adaptee aux besoins specifiques de MANOM BarberShop. Une application web personnalisee permet de :

- Reduire les couts operationnels a long terme
- Controler pleinement les donnees clients
- Adapter l'interface aux besoins metier specifiques
- Evoluer librement selon les besoins futurs
- Assurer la souverainete des donnees

## Conclusion du chapitre

Ce chapitre a permis d'identifier les problematiques liees a la gestion des reservations dans les etablissements de coiffure et de justifier la necessite d'une solution web sur mesure. La prochaine partie presentera la solution technique envisagee pour repondre a ces besoins.

---

# Chapitre 2 : Solution

## Introduction du chapitre

Apres avoir identifie la problematique, ce chapitre presente la solution technique retenue pour le developpement de la plateforme MANOM BarberShop. Les choix d'architecture, de technologies et de methodologie sont justifies en detail.

## Section 1. Architecture Technique

### 1.1. Choix de l'architecture

La plateforme MANOM BarberShop repose sur une architecture client-serveur moderne, separant clairement le frontend (interface utilisateur) du backend (logique metier et donnees).

**Architecture en couches :**

`
+---------------------------------+
|     Frontend (Next.js)          |  <-- Interface utilisateur
+---------------------------------+
|     API REST (PHP)              |  <-- Logique metier
+---------------------------------+
|     Base de donnees (MySQL)     |  <-- Persistance des donnees
+---------------------------------+
`

Cette separation presente plusieurs avantages :
- **Evolutivite** : Le frontend et le backend peuvent evoluer independamment
- **Maintenabilite** : Chaque couche a une responsabilite bien definie
- **Reutilisabilite** : L'API peut servir d'autres clients (application mobile, partenaires)
- **Securite** : La couche d'acces aux donnees est protegee par l'API

### 1.2. Technologies utilisees

#### Frontend : Next.js 16 avec React 19

**Next.js** est un framework React offrant des fonctionnalites avancees pour le developpement d'applications web modernes. Le choix de Next.js se justifie par :

- **Server-Side Rendering (SSR)** : Ameliore les performances et le reference naturel (SEO)
- **App Router** : Organisation modulaire des routes et des composants
- **Optimisation integree** : Chargement automatique des images, code splitting, optimisation des bundles
- **Tailwind CSS** : Framework CSS utility-first pour un developpement rapide et maintenable

**React 19** apporte des ameliorations significatives en termes de performance et de developer experience, notamment avec les Server Components et les hooks ameliores.

#### Backend : PHP avec Architecture API REST

Le backend est developpe en **PHP**, un langage eprouve et largement utilise pour le developpement web. L'architecture RESTful expose des endpoints JSON consommes par le frontend.

Structure de l'API :
`
backend/
  api/
    auth/           # Authentification (login, signup, logout)
    admin/          # Endpoints d'administration
    bookings/       # Gestion des reservations
    dashboard/      # Donnees du tableau de bord
    public/         # Endpoints publics (services, barbiers)
  config/           # Configuration de la base de donnees
  middleware/        # Authentification et autorisation
  utils/            # Fonctions utilitaires
`

#### Base de donnees : MySQL

Le systeme de gestion de base de donnees **MySQL** est utilise pour la persistance des donnees. La base comprend les tables principales suivantes :

- users : Comptes utilisateurs (clients et administrateurs)
- arbers : Informations sur les barbiers
- services : Catalogue de services proposes
- ookings : Reservations clients
- ooking_services : Services associes a une reservation
- vailability : Disponibilites des barbiers

#### Outils de developpement

- **TypeScript** : Typage statique pour une meilleure maintenabilite
- **GSAP** : Bibliotheque d'animations pour les transitions fluides
- **Lenis** : Smooth scrolling pour une navigation agreable
- **ESLint** : Analyse statique du code

## Section 2. Fonctionnalites de la Solution

### 1.1. Fonctionnalites cote client

La plateforme offre aux clients les fonctionnalites suivantes :

1. **Inscription et authentification**
   - Creation de compte avec email unique
   - Connexion securisee
   - Gestion du profil personnel

2. **Reservation en ligne**
   - Consultation du catalogue de services avec descriptions et tarifs
   - Selection du barbier et du service souhaite
   - Choix de la date et de l'horaire disponible
   - Confirmation de la reservation en temps reel

3. **Suivi des reservations**
   - Visualisation de l'historique des reservations
   - Modification ou annulation des reservations a venir
   - Notifications de statut

4. **Interface multilingue**
   - Choix de la langue (francais, anglais, arabe)
   - Traduction complete de l'interface

5. **Gestion multi-devises**
   - Selection de la devise (EUR, USD, MAD)
   - Affichage dynamique des prix

### 1.2. Fonctionnalites d'administration

L'interface d'administration permet de gerer l'ensemble des operations de l'etablissement :

1. **Gestion des services**
   - Ajout, modification et suppression des services
   - Attribution des durees et tarifs
   - Gestion des images illustratives

2. **Gestion des barbiers**
   - Creation de profils barbiers
   - Gestion des disponibilites
   - Affectation aux services

3. **Gestion des reservations**
   - Visualisation de toutes les reservations
   - Creation manuelle de reservations
   - Modification du statut (confirmee, en cours, terminee, annulee)

4. **Gestion des clients**
   - Consultation de la base clients
   - Recherche et filtrage
   - Suivi de l'historique

5. **Parametrage**
   - Configuration des horaires d'ouverture
   - Gestion des jours fermes
   - Parametres generaux

### 1.3. Fonctionnalites transversales

1. **Systeme de cache** : Reduit les appels API et ameliore les performances
2. **Protection CSRF** : Securite des formulaires
3. **Validation cote serveur** : Integrite des donnees
4. **Gestion des erreurs** : Messages utilisateur informatifs
5. **Responsive Design** : Adaptation a tous les appareils

## Conclusion du chapitre

Ce chapitre a presente la solution technique retenue pour le developpement de la plateforme MANOM BarberShop. L'architecture client-serveur avec separation frontend/backend, combinee a des technologies modernes et eprouvees, permet de repondre efficacement aux besoins identifies tout en assurant l'evolutivite et la maintenabilite du systeme.

---

## Conclusion de la partie

La partie theorique a permis de poser les bases du projet en identifiant la problematique de la gestion des reservations dans les etablissements de coiffure, en analysant les solutions existantes et en justifiant le choix d'une solution web sur mesure. L'architecture technique retenue, combinant Next.js, PHP et MySQL, constitue un socle solide pour le developpement d'une plateforme performante et evolutive. La prochaine partie detaillera la phase pratique du projet, de la conception a l'implementation.

---

# Partie 2. Etude pratique

## Introduction de la partie

Cette partie presente la concretisation pratique du projet. Elle detaille les etapes de conception, de developpement et de test de la plateforme MANOM BarberShop. Les choix d'implementation sont justifies et les resultats obtenus sont presentes.

---

# Chapitre 1. Analyse et Conception

## Introduction du chapitre

Ce chapitre presente la phase d'analyse et de conception du projet. Il decrit les specifications fonctionnelles et non fonctionnelles, ainsi que les diagrammes de conception qui ont guide le developpement de la plateforme.

## Section 1. Specifications Fonctionnelles

### 1.1. Identification des acteurs

Le systeme identifie trois types d'acteurs :

1. **Visiteur** : Utilisateur non authentifie qui peut consulter les informations publiques (services, barbiers, galerie, contact).

2. **Client** : Utilisateur authentifie qui peut gerer son profil, effectuer des reservations et consulter son historique.

3. **Administrateur** : Utilisateur disposant de privileges etendus pour gerer l'ensemble des donnees (services, barbiers, reservations, clients).

### 1.2. Cas d'utilisation principaux

#### Cas d'utilisation 1 : Inscription d'un client

| Element | Description |
|---|---|
| **Acteur** | Visiteur |
| **Precondition** | Le visiteur n'a pas de compte |
| **Scenario nominal** | Le visiteur saisit son nom, email et mot de passe, puis soumet le formulaire. Un compte est cree et l'utilisateur est redirige vers son tableau de bord. |
| **Scenario alternatif** | Si l'email existe deja, un message d'erreur est affiche. |
| **Postcondition** | Le compte est cree et l'utilisateur peut s'authentifier. |

#### Cas d'utilisation 2 : Reservation d'un service

| Element | Description |
|---|---|
| **Acteur** | Client |
| **Precondition** | Le client est authentifie |
| **Scenario nominal** | Le client selectionne un ou plusieurs services, choisit un barbier, selectionne une date et un creneau horaire disponible, puis confirme la reservation. |
| **Scenario alternatif** | Si le creneau n'est plus disponible, le client est invite a en choisir un autre. |
| **Postcondition** | La reservation est enregistree dans le systeme. |

#### Cas d'utilisation 3 : Gestion des services (Admin)

| Element | Description |
|---|---|
| **Acteur** | Administrateur |
| **Precondition** | L'administrateur est authentifie |
| **Scenario nominal** | L'administrateur accede a la page de gestion des services, peut ajouter un nouveau service (titre, description, duree, prix, image), modifier ou supprimer un service existant. |
| **Postcondition** | Le catalogue de services est mis a jour. |

#### Cas d'utilisation 4 : Gestion des reservations (Admin)

| Element | Description |
|---|---|
| **Acteur** | Administrateur |
| **Precondition** | L'administrateur est authentifie |
| **Scenario nominal** | L'administrateur consulte la liste des reservations, peut en creer une nouvelle manuellement, modifier le statut d'une reservation existante ou l'annuler. |
| **Postcondition** | Les reservations sont mises a jour. |

### 1.3. Specifications non fonctionnelles

| Categorie | Exigence |
|---|---|
| **Performance** | Temps de chargement des pages inferieur a 3 secondes |
| **Securite** | Authentification securisee, protection CSRF, validation des entrees |
| **Disponibilite** | Accessible 24h/24, 7j/7 |
| **Ergonomie** | Interface intuitive et responsive |
| **Maintenabilite** | Code modulaire et documente |
| **Evolutivite** | Architecture permettant l'ajout de nouvelles fonctionnalites |
| **Accessibilite** | Conformite aux normes WCAG 2.1 |

## Section 2. Modele Conceptuel de Donnees

### 2.1. Diagramme Entite-Association

Le modele de donnees du systeme comprend les entites principales suivantes :

`
+-------------------+       +-------------------+
|      USERS        |       |     BARBERS       |
+-------------------+       +-------------------+
| id (PK)           |       | id (PK)           |
| name              |       | name              |
| email (UNIQUE)    |       | image             |
| password_hash     |       | bio               |
| phone             |       | created_at        |
| role (client/admin)|      +-------------------+
| created_at        |              |
+-------------------+              |
        |                          |
        | 1                        | 1
        |                          |
        | N                        | N
+-------------------+       +-------------------+
|     BOOKINGS      |       |    SERVICES       |
+-------------------+       +-------------------+
| id (PK)           |       | id (PK)           |
| user_id (FK)      |       | title             |
| barber_id (FK)    |       | description       |
| booking_date      |       | duration          |
| booking_time      |       | price             |
| status            |       | image             |
| total_price       |       | created_at        |
| notes             |       +-------------------+
| created_at        |              |
+-------------------+              |
        |                          |
        | N                        | N
        |                          |
+-------------------+       +-------------------+
| BOOKING_SERVICES  |       |   AVAILABILITY    |
+-------------------+       +-------------------+
| booking_id (FK)   |       | id (PK)           |
| service_id (FK)   |       | barber_id (FK)    |
+-------------------+       | day_of_week       |
                            | start_time        |
                            | end_time          |
                            | is_available      |
                            +-------------------+
`

### 2.2. Description des tables

**Table USERS**
- Stocke les informations des utilisateurs (clients et administrateurs)
- L'email est unique et sert d'identifiant de connexion
- Le champ ole distingue les clients des administrateurs

**Table BARBERS**
- Contient les profils des barbiers
- Inclut les informations de presentation (nom, bio, image)

**Table SERVICES**
- Catalogue des services proposes par l'etablissement
- Chaque service a une duree et un prix

**Table BOOKINGS**
- Enregistre les reservations clients
- Contient les references vers l'utilisateur, le barbier et le statut
- Le champ status suit le cycle : pending -> confirmed -> in_progress -> completed / cancelled

**Table BOOKING_SERVICES**
- Table de jointure entre les reservations et les services
- Permet une reservation avec plusieurs services

**Table AVAILABILITY**
- Definit les disponibilites de chaque barbier par jour de la semaine
- Permet de generer automatiquement les creneaux horaires

## Section 3. Diagrammes de Sequence

### 3.1. Diagramme de sequence : Authentification

`
Utilisateur          Frontend           API PHP            Base de donnees
     |                  |                  |                     |
     |  Saisir email/mdp|                  |                     |
     |----------------->|                  |                     |
     |                  | POST /auth/login |                     |
     |                  |----------------->|                     |
     |                  |                  | SELECT * FROM users |
     |                  |                  | WHERE email = ?     |
     |                  |                  |-------------------->|
     |                  |                  |                     |
     |                  |                  |     Donnees user    |
     |                  |                  |<--------------------|
     |                  |                  |                     |
     |                  |  JWT Token       |                     |
     |                  |<-----------------|                     |
     |                  |                  |                     |
     |  Redirection     |                  |                     |
     |<-----------------|                  |                     |
`

### 3.2. Diagramme de sequence : Reservation

`
Client        Frontend         API PHP          BD
  |              |                |               |
  | Choisir      |                |               |
  | service+     |                |               |
  | barbier      |                |               |
  |------------->|                |               |
  |              | GET /slots     |               |
  |              |---------------->               |
  |              |                | SELECT slots  |
  |              |                | where barber  |
  |              |                | and date      |
  |              |                |-------------->|
  |              |                |               |
  |              |  Slots list    |<--------------|
  |              |<---------------|               |
  |              |                |               |
  | Creneaux     |                |               |
  | affiches     |                |               |
  |<-------------|                |               |
  |              |                |               |
  | Confirmer    |                |               |
  | reservation  |                |               |
  |------------->|                |               |
  |              | POST /bookings |               |
  |              |---------------->               |
  |              |                | INSERT booking|
  |              |                |-------------->|
  |              |                |               |
  |              |  Confirmation  |<--------------|
  |              |<---------------|               |
  |              |                |               |
  | Reservation  |                |               |
  | confirmee    |                |               |
  |<-------------|                |               |
`

### 3.3. Diagramme de sequence : Gestion des services (Admin)

`
Admin         Frontend         API PHP           BD
  |              |                |                |
  | Ajouter      |                |                |
  | service      |                |                |
  |------------->|                |                |
  |              | POST           |                |
  |              | /admin/        |                |
  |              | services.php   |                |
  |              |---------------->                |
  |              |                | INSERT INTO    |
  |              |                | services       |
  |              |                |--------------->|
  |              |                |                |
  |              |  Succes        |<---------------|
  |              |<----------------|                |
  |              |                |                |
  | Service      |                |                |
  | ajoute       |                |                |
  |<-------------|                |                |
`

## Conclusion du chapitre

Ce chapitre a permis de definir les specifications fonctionnelles du systeme, de modeliser les donnees et de documenter les principaux flux d'interaction grace aux diagrammes de sequence. La phase suivante detaille l'implementation concrete de ces specifications.

---

# Chapitre 2. Realisation et Implementation

## Introduction du chapitre

Ce chapitre presente les choix techniques d'implementation et les details de developpement de la plateforme MANOM BarberShop. Les solutions technique adoptees, les epreuves rencontrees et les resultats obtenus sont decrits en detail.

## Section 1. Environnement de Developpement

### 1.1. Outil et technologies de developpement

L'environnement de developpement a ete configure avec les outils suivants :

| Outil | Version | Role |
|---|---|---|
| Node.js | 22.x | Runtime JavaScript |
| Next.js | 16.2.7 | Framework frontend |
| React | 19.x | Bibliotheque UI |
| TypeScript | 5.x | Typage statique |
| Tailwind CSS | 4.x | Framework CSS |
| PHP | 8.x | Backend |
| MySQL | 8.x | Base de donnees |
| XAMPP | 3.3+ | Serveur local (Apache + MySQL) |
| VS Code | Derniere version | Editeur de code |
| Git | Derniere version | Controle de version |

### 1.2. Structure du projet

`
the-barber-house/
  backend/
    api/
      auth/         login.php, signup.php, logout.php
      admin/        barbers.php, services.php, bookings.php, clients.php, availability.php
      bookings/     slots.php, create.php, my-bookings.php
      dashboard/    stats.php
      public/       services.php, barbers.php
    config/         database.php
    middleware/      auth.php
    utils/          helpers.php
  src/
    app/
      page.tsx              # Page d'accueil
      auth/page.tsx         # Page d'authentification
      booking/page.tsx      # Flux de reservation
      dashboard/            # Tableau de bord client
      admin/                # Interface d'administration
    components/
      hero/                 # Section Hero
      navigation/           # Navigation
      services/             # Section Services
      team/                 # Section Equipe
      gallery/              # Galerie photos
      contact/              # Section Contact
      booking/              # CTA Reservation
      ui/                   # Composants UI reutilisables
    i18n/                   # Traductions (EN, FR, AR)
    context/                # Contextes React
  public/
    images/                 # Images statiques
    fonts/                  # Polices web
`

## Section 2. Implementation du Backend

### 2.1. Configuration de la base de donnees

La base de donnees MySQL a ete creee avec le script SQL suivant (version simplifiee) :

`sql
-- Table des utilisateurs
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    role ENUM('client', 'admin') DEFAULT 'client',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des barbiers
CREATE TABLE barbers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image VARCHAR(255) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des services
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    duration INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des reservations
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    barber_id INT NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    total_price DECIMAL(10,2) DEFAULT 0,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (barber_id) REFERENCES barbers(id) ON DELETE CASCADE
);

-- Table de jointure reservation-services
CREATE TABLE booking_services (
    booking_id INT NOT NULL,
    service_id INT NOT NULL,
    PRIMARY KEY (booking_id, service_id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- Table des disponibilites
CREATE TABLE availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    barber_id INT NOT NULL,
    day_of_week TINYINT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available TINYINT(1) DEFAULT 1,
    FOREIGN KEY (barber_id) REFERENCES barbers(id) ON DELETE CASCADE
);
`

### 2.2. API REST - Exemple d'endpoint

Voici un extrait du code de l'endpoint de creation de compte (signup.php) :

`php
<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/database.php';

 = json_decode(file_get_contents('php://input'), true);
 = trim(['name'] ?? '');
 = trim(['email'] ?? '');
 = ['password'] ?? '';

// Validation
if (empty() || empty() || empty()) {
    http_response_code(400);
    echo json_encode(['error' => 'All fields are required']);
    exit;
}

if (!filter_var(, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email format']);
    exit;
}

// Verifier l'unicite de l'email
 = ->prepare('SELECT id FROM users WHERE email = ?');
->execute([]);
if (->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'Email already exists']);
    exit;
}

// Creer le compte
 = password_hash(, PASSWORD_BCRYPT);
 = ->prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
->execute([, , ]);

echo json_encode(['success' => true, 'message' => 'Account created successfully']);
?>
`

### 2.3. Gestion de l'authentification

L'authentification utilise un systeme de token stocke dans le localStorage du navigateur. Le middleware PHP verifie la presence et la validite du token a chaque requete API :

`php
// middleware/auth.php
function authenticate() {
     = getallheaders();
     = ['Authorization'] ?? '';
    
    if (empty()) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        exit;
    }
    
    // Valider le token et extraire l'ID utilisateur
     = validate_token();
    if (!) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }
    
    return ;
}
`

## Section 3. Implementation du Frontend

### 3.1. Structure des composants

Le frontend est organise en composants React modulaires, chacun responsable d'une section de l'interface :

- **Navigation** : Barre de navigation fixe avec changement d'apparence au scroll, lang-switcher et currency-switcher
- **Hero** : Section d'accueil avec animation GSAP
- **Services** : Carrousel horizontal de services avec animation au scroll (Framer Motion)
- **Team** : Presentation de l'equipe de barbiers
- **Gallery** : Galerie photos avec lightbox
- **Contact** : Formulaire de contact et carte Google Maps
- **BookingCTA** : Appel a l'action pour la reservation
- **Footer** : Pied de page avec informations

### 3.2. Systeme de reservation (pas a pas)

Le flux de reservation suit un systeme en 4 etapes :

`
Etape 1 : Selection des services
    |
    v
Etape 2 : Choix du barbier
    |
    v
Etape 3 : Selection date et creneau
    |
    v
Etape 4 : Confirmation
`

**Etape 1 - Selection des services :**
L'utilisateur choisit un ou plusieurs services parmi le catalogue. Les services selectionnes sont stockes dans l'etat React.

**Etape 2 - Choix du barbier :**
L'utilisateur selectionne un barbier. La liste des barbiers est chargee depuis l'API.

**Etape 3 - Selection date et creneau :**
L'utilisateur choisit une date dans un calendrier. Les creneaux disponibles sont charges depuis l'API (/api/bookings/slots.php) en fonction du barbier, de la date et du service selectionne. Les creneaux occupes sont affiches en noir avec texte blanc et curseur interdit.

**Etape 4 - Confirmation :**
L'utilisateur recapitule sa reservation et confirme. La reservation est enregistree via l'API.

### 3.3. Systeme internationalisation (i18n)

Le systeme de traduction supporte trois langues : francais, anglais et arabe. Les traductions sont stockees dans un fichier JSON et chargees dynamiquement :

`	ypescript
// Exemple de structure de traduction
{
  "en": {
    "hero.cta": "Book Now",
    "services.title": "Our Services",
    "booking.title": "Book Your Appointment"
  },
  "fr": {
    "hero.cta": "Reservez",
    "services.title": "Nos Services",
    "booking.title": "Reservez Votre Rendez-vous"
  },
  "ar": {
    "hero.cta": "احجز الآن",
    "services.title": "خدماتنا",
    "booking.title": "احجز موعدك"
  }
}
`

Le contexte React LanguageProvider gere l'etat de la langue et fournit la fonction de traduction 	() a tous les composants.

### 3.4. Systeme multi-devises

Le systeme de devises supporte l'euro (EUR), le dollar (USD) et le dirham marocain (MAD). Les prix sont affiches dynamiquement en fonction de la devise selectionnee par l'utilisateur.

`	ypescript
const currencies = {
  EUR: { symbol: '\u20ac', rate: 1 },
  USD: { symbol: '$', rate: 1.08 },
  MAD: { symbol: 'MAD', rate: 10.7 }
};
`

## Section 4. Interface d'Administration

### 4.1. Gestion des barbiers

L'interface d'administration permet de gerer les profils des barbiers : ajout avec nom et bio, modification, suppression. Les images sont gerees via un systeme d'upload cote PHP.

### 4.2. Gestion des services

L'administrateur peut ajouter, modifier et supprimer des services. Chaque service est defini par un titre, une description, une duree (en minutes), un prix et optionnellement une image.

### 4.3. Gestion des reservations

L'interface affiche toutes les reservations avec les filtres par date, statut et barbier. L'administrateur peut :
- Consulter les details d'une reservation
- Creer une reservation manuellement pour un client
- Modifier le statut (confirmee, en cours, terminee, annulee)
- Annuler une reservation

### 4.4. Gestion des disponibilites

L'administrateur definit les disponibilites de chaque barbier par jour de la semaine (heure de debut et de fin). Ces disponibilites sont utilisees pour generer automatiquement les creneaux horaires disponibles lors de la reservation.

## Section 5. Epreuves et Difficultes

### 5.1. Difficultes rencontrees

1. **Gestion des creneaux horaires** : La generation des creneaux disponibles en fonction des services multiplies (plusieurs services = duree cumulee) a necessite une logique complexe cote PHP.

2. **Animations au scroll** : L'integration de GSAP avec les composants React a demande une attention particuliere pour la gestion du nettoyage des animations.

3. **Multilinguisme** : La gestion de l'arabe (langue de droite a gauche) a necessite des ajustements CSS pour l'alignement du texte.

4. **Port du serveur** : Des conflits de port ont ete resolus en tuant les processus existants avant le redemarrage du serveur de developpement.

### 5.2. Solutions apportees

- Utilisation de Framer Motion pour les animations de carrousel horizontal
- Implementation d'un systeme de cache cote API pour reduire les appels reseau
- Configuration des routes API avec gestion des erreurs centralisee
- Documentation interne du code et conventions de nommage

## Conclusion du chapitre

Ce chapitre a presente les details d'implementation de la plateforme MANOM BarberShop. Le backend PHP fournit une API REST securisee et fonctionnelle, tandis que le frontend Next.js offre une interface utilisateur moderne et reactive. Les fonctionnalites de reservation, d'administration, d'internationalisation et de multi-devises ont ete implementees avec succes malgre les defis techniques rencontres.

---

# Conclusion generale

Ce memoire a presente la conception et le developpement d'une plateforme web de gestion de reservation pour le barbershop MANOM, situe a Manom en France. Le projet a ete realise dans le cadre de l'obtention du grade de Bachelor en Genie Logiciel et Systemes d'Information.

## Synthese du travail effectue

La premiere partie de ce memoire a permis d'identifier et d'analyser la problematique de la gestion des reservations dans les etablissements de coiffure. L'etude de l'etat de l'art a revele les limites des solutions existantes (Treatwell, Fresha, Square Appointments, Booksy) en termes de cout, de personnalisation et de souverainete des donnees. Cette analyse a justifie le developpement d'une solution sur mesure adaptee aux besoins specifiques de MANOM BarberShop.

La seconde partie a detaille la conception technique du systeme. L'architecture client-serveur, avec un frontend Next.js et un backend PHP API, a ete justifiee par les besoins d'evolutivite, de maintenabilite et de performance. Le modele de donnees relationnel a ete concu pour gerer les utilisateurs, les barbiers, les services, les reservations et les disponibilites.

L'implementation concrete a donne naissance a une plateforme fonctionnelle offrant :

**Cote client :**
- Un systeme d'authentification securise avec inscription et connexion
- Un flux de reservation en 4 etapes (services, barbier, date/creneau, confirmation)
- Un affichage en temps reel de la disponibilite des creneaux
- Un suivi des reservations avec historique
- Une interface multilingue (francais, anglais, arabe)
- Un systeme multi-devises (EUR, USD, MAD)
- Une page d'accueil moderne avec animations GSAP

**Cote administration :**
- Une gestion complete des barbiers (CRUD)
- Une gestion du catalogue de services (CRUD)
- Un tableau de bord des reservations avec filtrage
- Une gestion des clients
- Un parametrage des disponibilites par barbier et jour de la semaine
- Un systeme de cache pour optimiser les performances

## Apport du projet

Ce projet a permis de mettre en pratique les connaissances acquises tout au long de la formation, notamment en matiere de :

- Developpement d'applications web full-stack
- Conception et gestion de bases de donnees relationnelles
- Developpement d'interfaces utilisateur modernes avec React et Next.js
- Creation d'API REST securisees
- Integration de systemes d'internationalisation
- Gestion de projets informatiques

## Perspectives d'amelioration

Plusieurs pistes d'amelioration peuvent etre envisagees pour les versions futures :

1. **Paiement en ligne** : Integration d'une passerelle de paiement (Stripe, PayPal) pour permettre le reglement lors de la reservation.

2. **Notifications push** : Envoi de notifications en temps reel aux clients pour les rappels de rendez-vous et les changements de statut.

3. **Application mobile** : Developpement d'applications iOS et Android pour une experience mobile optimisee.

4. **Programme de fidelite** : Mise en place d'un systeme de points et de recompenses pour fideliser la clientele.

5. **Statistiques avancees** : Tableau de bord analytique avec graphiques de performance (taux d'occupation, chiffre d'affaires, clients recurrents).

6. **Integration calendrier** : Synchronisation avec Google Calendar et Apple Calendar.

7. **Chat en direct** : Systeme de messagerie en temps reel entre clients et barbiers.

---

# Bibliographie

1. **Next.js Documentation** - https://nextjs.org/docs - Documentation officielle du framework Next.js

2. **React Documentation** - https://react.dev - Documentation officielle de la bibliotheque React

3. **PHP Documentation** - https://www.php.net/docs.php - Documentation officielle de PHP

4. **MySQL Reference Manual** - https://dev.mysql.com/doc/refman/8.0/en/ - Reference MySQL 8.0

5. **Tailwind CSS Documentation** - https://tailwindcss.com/docs - Documentation de Tailwind CSS

6. **GSAP Documentation** - https://greensock.com/docs/ - Documentation de la bibliotheque GSAP

7. **Framer Motion Documentation** - https://www.framer.com/motion/ - Documentation de Framer Motion

8. **RESTful Web Services** - Leonard Richardson, Mike Amundsen - O'Reilly Media

9. **Node.js Design Patterns** - Mario Casciaro - Packt Publishing

10. **Ergonomie et conception d'interfaces web** - Steve Krug - Editions Eyrolles

---

# Annexes

## Annexe A : Captures d'ecran de l'application

- A.1 : Page d'accueil avec section Hero
- A.2 : Section Services avec carrousel
- A.3 : Page d'authentification
- A.4 : Flux de reservation (4 etapes)
- A.5 : Interface d'administration - Gestion des services
- A.6 : Interface d'administration - Gestion des reservations
- A.7 : Tableau de bord client

## Annexe B : Extraits de code source

- B.1 : Script SQL de creation de la base de donnees
- B.2 : Configuration de la connexion MySQL
- B.3 : Middleware d'authentification PHP
- B.4 : Composant React de reservation

## Annexe C : Diagramme complet du systeme

- C.1 : Diagramme de cas d'utilisation UML
- C.2 : Diagramme de classes
- C.3 : Diagramme de sequence complet

---

# Liste des graphiques

| Numero | Titre | Page |
|---|---|---|
| Graphique 1 | Architecture technique du systeme | 11 |
| Graphique 2 | Diagramme Entite-Association | 18 |
| Graphique 3 | Flux de reservation | 20 |
| Graphique 4 | Cycle de vie d'une reservation | 22 |

---

# Liste des tableaux

| Numero | Titre | Page |
|---|---|---|
| Tableau 1 | Liste des abreviations | 7 |
| Tableau 2 | Technologies utilisees | 12 |
| Tableau 3 | Fonctionnalites cote client | 14 |
| Tableau 4 | Fonctionnalites d'administration | 15 |
| Tableau 5 | Specifications non fonctionnelles | 19 |
| Tableau 6 | Outils de developpement | 26 |
| Tableau 7 | Structure des dossiers du projet | 27 |
| Tableau 8 | Difficultes rencontrees et solutions | 33 |
