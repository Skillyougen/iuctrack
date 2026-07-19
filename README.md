# Handoff — Refonte IUCTrack v2 (Web + Mobile)

## Vue d'ensemble
Refonte visuelle complète d'IUCTrack : palette **charbon / crème / rouge #C43A2F / vert #22A06B**, typographie display **Bricolage Grotesque** + texte **Instrument Sans** (web), rayons généreux (12–22px), pastilles de statut, timeline de suivi « colis ».

**Toutes les données affichées restent RÉELLES** : chaque fichier conserve les appels API existants (`/admin/*`, `/etudiant/*`, axios `services/api.js`), les contextes (`AuthContext`, `SettingsContext`), les permissions et la logique métier (chiffrement messagerie, polling, upload photo, Import IA…). Aucune donnée fictive — les graphiques et stats sont **calculés depuis les vraies demandes** (`created_at`, `updated_at`, `etudiant.filiere`).

Les prototypes de référence (rendu cible) sont à la racine du projet : `IUCTrack Web.dc.html` et `IUCTrack Mobile.dc.html`.

## Fidélité
**Haute-fidélité.** Les fichiers `.jsx` / `.js` de ce package sont des **remplacements drop-in** : mêmes chemins, mêmes exports, mêmes endpoints. Copiez-les par-dessus votre repo puis vérifiez la compilation.

## Installation

### Web (dashboard/)
Copiez chaque fichier vers le même chemin dans votre repo :

| Fichier | Rôle |
|---|---|
| `src/index.css` | Fonts Google (Bricolage Grotesque + Instrument Sans), scrollbars, keyframes `fadeUp`/`pulseDot` |
| `src/context/SettingsContext.jsx` | **Nouvelle palette** (clés existantes conservées + `redInk, greenInk, gold, blue, panel*, side*, shadow`) + traductions étendues + export `STATUTS_META` |
| `src/components/ui/Sidebar.jsx` | Sidebar 240px vert sombre (thème clair) / charbon (sombre), pill actif rouge, **badge = vrai nombre de demandes « envoyée »** |
| `src/components/ui/Layout.jsx` | Topbar (recherche ⌘K, FR/EN, thème, notifs, profil) + **recherche globale sur données réelles** |
| `src/pages/auth/LoginPage.jsx` | Split 2 panneaux (crème + formulaire), même `login()` |
| `src/pages/dashboard/DashboardPage.jsx` | KPI, **graphique activité 7 jours**, **donut SVG**, **top filières** — tous calculés depuis `/admin/demandes` |
| `src/pages/dashboard/DemandesPage.jsx` | Liste + détail sticky, **timeline suivi**, DocViewer, NotifierForm (mêmes endpoints) |
| `src/pages/dashboard/EtudiantsPage.jsx` | Recherche, création, **Import IA XLSX** (logique identique) |
| `src/pages/dashboard/TypesDemandesPage.jsx` | CRUD types + documents (mêmes endpoints) |
| `src/pages/dashboard/DocumentsRequisPage.jsx` | Vue maître-détail par type |
| `src/pages/dashboard/NotificationsAdminPage.jsx` | Stats + filtres + liste |
| `src/pages/dashboard/AdminsPage.jsx` | Cartes rôle cliquables, chips permissions |
| `src/pages/dashboard/ParametresPage.jsx` | Cartes thème/langue v2 |
| `src/pages/dashboard/ProfilAdminPage.jsx` | Carte héros crème + édition infos/MDP |

Aucune dépendance nouvelle (lucide-react, xlsx, axios, react-router-dom déjà présents).
`BASE_STORAGE` dans DemandesPage.jsx reste `http://127.0.0.1:8000/storage/` — adaptez comme dans `services/api.js`.

### Mobile (mobile/) — portage COMPLET (13 écrans + navigation + thème)
Copiez chaque fichier vers le même chemin dans votre repo :

| Fichier | Rôle |
|---|---|
| `src/context/SettingsContext.js` | **Palette v2** (clés existantes conservées + `redInk, greenInk, gold, blue, panel*, tabbar, tabMuted, tabActiveBg/Ink`) + traductions étendues + `STATUTS_META` |
| `src/navigation/AppNavigator.js` | **Tab bar flottante en pilule** (vert sombre, actif = pastille crème, badge messages réel via polling `/etudiant/messagerie/non-lus`) — mêmes routes/écrans |
| `src/screens/auth/LoginScreen.js` | Logo blanc arrondi, pills Étudiant/Visiteur, carte 26px avec note verte — logique `check-matricule` → MDP conditionnel conservée |
| `src/screens/etudiant/HomeScreen.js` | Header logo+avatar, grand titre 2 lignes, **bannière IUCBot rouge**, grille 2×2 (4e carte panneau vert), **Suivi en cours** = vraies demandes non terminées + barres 3 segments |
| `src/screens/etudiant/MesDemandesScreen.js` | Titre + FAB rouge, pills de filtre, cartes avec réf `DEM-YYYY-XXXX`, pastille statut, barre 3 segments |
| `src/screens/etudiant/DetailDemandeScreen.js` | Suivi « colis » : timeline enrichie (**dates réelles** created_at/updated_at), carte type sur panneau, documents joints |
| `src/screens/etudiant/ChoixTypeDemandeScreen.js` | Étape 1/2 : barre segmentée, cartes type + chip or « N documents requis » — `GET /type-demandes` |
| `src/screens/etudiant/NouvelleDemandeScreen.js` | Étape 2/2 : carte type sur panneau vert, Joindre→Joint, submit désactivé + note or — DocumentPicker + FormData conservés |
| `src/screens/etudiant/NotificationsScreen.js` | « N non lues » + bouton « Tout marquer lu » vert, icônes teintées par type, non lue = bordure rouge + point — mêmes endpoints |
| `src/screens/etudiant/ProfilScreen.js` | Carte héros verte (avatar cerclé or + caméra), **3 stats réelles**, infos en lignes, MDP repliable (or), déconnexion rouge — photo/crop/upload conservés |
| `src/screens/etudiant/ParametresScreen.js` | Cartes thème (aperçus réels sombre/clair), cartes langue drapeaux, À propos |
| `src/screens/etudiant/MessagerieListScreen.js` | Carte IUCBot (bordure or), conversations en cartes, crayon rouge, modal « Nouveau message » — déchiffrement + non-lus conservés |
| `src/screens/etudiant/ChatScreen.js` | IUCBot : avatar rouge cpu, statut or, bulles user rouges, suggestions pills or — `POST /ia/chat` + historique conservés |
| `src/screens/etudiant/ConversationScreen.js` | Bulles 16/5 rouges/carte, coches lu/livré, stickers, envoi image (aperçu + fallback base64), polling 3s — chiffrement conservé |
| `src/screens/visiteur/DecouvrirIUCScreen.js` | Héros panneau vert (logo sur pastille blanche, pills cycles), bannière IUCBot, chiffres/histoire/timeline/campus/écoles/partenariats/CTA conservés |

Points d'attention :
- **Aucune dépendance nouvelle** (Feather, DocumentPicker, ImagePicker, ImageManipulator, AsyncStorage déjà présents).
- Les `require('../../../assets/images/logo-icon.png')` et `logo-horizontal.png` supposent les mêmes assets qu'actuellement — vérifiez les chemins si votre dossier diffère.
- `BASE_URL` (storage photos) reste `http://192.168.137.1:8000/storage/` comme dans votre code — centralisez-le si besoin.
- La tab bar flottante remplace celle par défaut : rien d'autre à brancher, elle est passée via `tabBar={...}` dans le même `TabNavigator`.

## Design tokens
**Sombre** : bg `#1B2026` · card `#232A33` · card2 `#2A323C` · text `#EDF1F5` · muted `#8B97A5` · border `rgba(255,255,255,0.07-0.09)` · panel crème `#F4EEE0` (ink `#23282F`)
**Clair** : bg `#EFEDE5`/`#F0EDE4` · card `#FFFFFF` · card2 `#F5F2EA` · sidebar/tabbar vert `#1C4534` · panel `#FAF7EE` (web) / `#1C4534` (mobile hero)
**Accents** : rouge `#C43A2F` (ink sombre `#E8836F`, clair `#B03427`) · vert `#22A06B`/`#1D8A5E` · gold `#E9A84C`/`#D9942F` · bleu `#6B8FCB`/`#5C80BF`
**Statuts** : envoyée `#6B8FCB` · en cours `#E9A84C` · terminée `#22A06B` — bg = même couleur à 16%
**Typo** : Bricolage Grotesque 800 (titres web, letterspacing négatif) / Instrument Sans 400-700 · mobile : fontWeight '800' + letterSpacing -0.4 à -1.2
**Ombres** : boutons/FAB rouges `shadowColor #C43A2F, opacity 0.35, radius 14-18`

## Comportements clés
- Thème & langue : persistés (`localStorage` web / `AsyncStorage` mobile), clés inchangées (`theme`, `langue`)
- Recherche globale web : ⌘K / Ctrl+K, fetch `/admin/demandes` + `/admin/etudiants`, filtre client, navigation
- Timeline : étape courante avec halo pulsant (web `pulseDot`), lignes vertes une fois franchies
- Badges réels : sidebar web = demandes « envoyée » ; tab bar mobile = messages non lus (polling 5s + AppState)
- Barres 3 segments mobiles : `envoyee`=1, `en_cours`=2, `terminee`=3 segments colorés

## Fichiers de référence
- `IUCTrack Web.dc.html` — prototype interactif web (10 pages, thème + langue fonctionnels)
- `IUCTrack Mobile.dc.html` — prototype interactif mobile (13 écrans dans un cadre iPhone)
