# IUCTrack — Handoff « Polices unifiées + Responsive web »

Copiez chaque fichier au même chemin dans votre repo (`iuctrack/`), en remplaçant l'existant.

## 1 · Mobile — même police que le web

Le web utilise **Instrument Sans** (corps) + **Bricolage Grotesque** (titres).
L'app mobile utilisait la police système → corrigé globalement, **aucun écran modifié**.

### Installer les polices (dans `mobile/`)

```bash
npx expo install expo-font @expo-google-fonts/instrument-sans @expo-google-fonts/bricolage-grotesque
```

### Fichiers

- `mobile/src/theme/fonts.js` — **nouveau**. Charge les 6 graisses et patche `<Text>` / `<TextInput>` :
  chaque `fontWeight` est mappé vers le bon fichier de police (400→Regular … 700→Bold),
  et les gros titres (`fontWeight 800`, `fontSize ≥ 16`) passent en **Bricolage Grotesque**, exactement comme le web.
- `mobile/App.js` — remplacé. Charge les polices avant le rendu (écran neutre sombre pendant ~200 ms, aucun flash de police système).

## 2 · Web — responsive tablette (≤1120px) & mobile (≤760px)

- `dashboard/src/index.css` — media queries responsive (grilles `g-*`, tiroir sidebar, login empilé).
- `dashboard/src/hooks/useBreakpoint.js` — **nouveau** hook (desktop / tablet / mobile).
- `dashboard/src/components/ui/Layout.jsx` — topbar responsive : bouton **menu** ≤1120px qui ouvre la sidebar en tiroir avec voile, ⌘K / thème / nom du profil masqués sur mobile, paddings compactés.
- `dashboard/src/components/ui/Sidebar.jsx` — devient un tiroir coulissant ≤1120px (se ferme à la navigation). Identique sur desktop.
- `dashboard/src/pages/**` — toutes les pages : les grilles reçoivent des classes responsive (`g-kpi4`, `g-2col`, `g-3col`, `g-form2`, `g-side`, `g-split`) + `flexWrap` sur les rangées d'actions.
  - KPI : 4 col → 2 col (tablette & mobile)
  - Blocs 2 colonnes (dashboard, docs requis) : → 1 colonne
  - Cartes admins / stats : 3 → 2 → 1
  - Formulaires 2 colonnes : → 1 colonne sur mobile
  - Demandes / Étudiants : le panneau détail passe **au-dessus** de la liste (plus de sticky) dès ≤1120px
  - Login : les 2 panneaux s'empilent ≤900px

## 3 · Vérification rapide

1. `npm run dev` dans `dashboard/`, réduire la fenêtre : à 1120px le menu burger apparaît ; à 760px KPI en 2×2, formulaires en 1 colonne.
2. `npx expo start` dans `mobile/` : tous les textes en Instrument Sans, gros titres (« Bonjour », compteurs…) en Bricolage Grotesque.
