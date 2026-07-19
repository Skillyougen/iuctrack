import { createContext, useContext, useState } from 'react';

const SettingsContext = createContext();

// ─── Palette IUCTrack v2 — charbon / crème / rouge / vert ───
// Toutes les clés existantes (bg, surface, card, card2, text, muted, border,
// input, red, green) sont conservées : les pages non migrées continuent de marcher.
// Nouvelles clés : redInk, greenInk, gold, blue, panel*, side* (sidebar), shadow.

const PALETTES = {
  dark: {
    bg: '#1B2026', surface: '#20262E', card: '#232A33', card2: '#2A323C',
    text: '#EDF1F5', muted: '#8B97A5', border: 'rgba(255,255,255,0.07)',
    input: '#1A1F26',
    red: '#C43A2F', redInk: '#E8836F',
    green: '#22A06B', greenInk: '#4CC496',
    gold: '#E9A84C', blue: '#6B8FCB',
    panel: '#F4EEE0', panelInk: '#23282F', panelMuted: '#8A8474', panelBorder: 'rgba(35,40,47,0.10)',
    side: '#20262E', sideText: '#EDF1F5', sideMuted: '#8B97A5', sideBorder: 'rgba(255,255,255,0.07)',
    shadow: '0 18px 44px rgba(0,0,0,0.35)',
  },
  light: {
    bg: '#EFEDE5', surface: '#FFFFFF', card: '#FFFFFF', card2: '#F5F2EA',
    text: '#23282F', muted: '#79828E', border: 'rgba(35,40,47,0.10)',
    input: '#F1EFE7',
    red: '#C43A2F', redInk: '#B03427',
    green: '#1D8A5E', greenInk: '#1D8A5E',
    gold: '#D9942F', blue: '#5C80BF',
    panel: '#FAF7EE', panelInk: '#23282F', panelMuted: '#8A8474', panelBorder: 'rgba(35,40,47,0.09)',
    side: '#1C4534', sideText: '#F0EDE4', sideMuted: '#93B3A3', sideBorder: 'rgba(255,255,255,0.12)',
    shadow: '0 18px 44px rgba(35,40,47,0.10)',
  },
};

// Statuts de demande — méta partagée par toutes les pages
export const STATUTS_META = {
  envoyee:  { fr: 'Envoyée',  en: 'Sent',        color: '#6B8FCB', bg: 'rgba(107,143,203,0.16)' },
  en_cours: { fr: 'En cours', en: 'In progress', color: '#E9A84C', bg: 'rgba(233,168,76,0.16)'  },
  terminee: { fr: 'Terminée', en: 'Completed',   color: '#22A06B', bg: 'rgba(34,160,107,0.16)'  },
};

export function SettingsProvider({ children }) {
  const [theme, setTheme]   = useState(localStorage.getItem('theme') || 'dark');
  const [langue, setLangue] = useState(localStorage.getItem('langue') || 'fr');

  const toggleTheme  = (t) => { setTheme(t);  localStorage.setItem('theme', t); };
  const toggleLangue = (l) => { setLangue(l); localStorage.setItem('langue', l); };

  const colors = PALETTES[theme] || PALETTES.dark;

  const translations = {
    fr: {
      dashboard: 'Dashboard', demandes: 'Demandes', etudiants: 'Étudiants',
      typesdemande: 'Types de demande', documentsrequis: 'Documents requis',
      notifications: 'Notifications', admins: 'Admins', parametres: 'Paramètres',
      profil: 'Mon profil',
      bonjour: 'Bonjour', apercu: "Voici un aperçu de l'activité IUCTrack aujourd'hui.",
      totaldemandes: 'Total demandes', envoyees: 'Envoyées', encours: 'En cours',
      terminees: 'Terminées', dernieresdemandes: 'Dernières demandes', voirtout: 'Voir tout →',
      repartition: 'Répartition des statuts', raccourcis: 'Raccourcis',
      gerertypes: 'Gérer les types', voirdemandes: 'Voir les demandes',
      deconnexion: 'Déconnexion', voirprofil: 'Voir mon profil',
      theme: 'Thème', langue: 'Langue', sombre: 'Sombre', clair: 'Clair',
      francais: 'Français', anglais: 'Anglais',
      parametrestitre: 'Paramètres', parametressub: 'Personnalisez votre expérience IUCTrack',
      apparence: 'Apparence', preferences: 'Préférences',
      principal: 'PRINCIPAL', configuration: 'CONFIGURATION', systeme: 'SYSTÈME',
      // ── nouvelles clés v2 ──
      rechercher: 'Rechercher étudiants, demandes, pages…',
      aucunresultat: 'Aucun résultat pour',
      pages: 'Pages', chargement: 'Chargement…',
      activite: 'Activité des demandes', septjours: '7 derniers jours',
      recues: 'Reçues', traitees: 'Traitées', topfilieres: 'Top filières',
      suividemande: 'Suivi de la demande', changerstatut: 'Changer le statut',
      documentsjoints: 'Documents joints', notifieretudiant: "Notifier l'étudiant",
      passerencours: 'Passer en cours de traitement', marquerterminee: 'Marquer comme terminée',
      demandetraitee: 'Demande traitée et clôturée', modelesrapides: 'Modèles rapides',
      envoyer: 'Envoyer', annuler: 'Annuler', creer: 'Créer', enregistrer: 'Enregistrer',
      modifier: 'Modifier', toutes: 'Toutes', nonlues: 'Non lues', lues: 'Lues',
    },
    en: {
      dashboard: 'Dashboard', demandes: 'Requests', etudiants: 'Students',
      typesdemande: 'Request types', documentsrequis: 'Required documents',
      notifications: 'Notifications', admins: 'Admins', parametres: 'Settings',
      profil: 'My profile',
      bonjour: 'Hello', apercu: "Here is an overview of today's IUCTrack activity.",
      totaldemandes: 'Total requests', envoyees: 'Sent', encours: 'In progress',
      terminees: 'Completed', dernieresdemandes: 'Latest requests', voirtout: 'See all →',
      repartition: 'Status breakdown', raccourcis: 'Shortcuts',
      gerertypes: 'Manage types', voirdemandes: 'View requests',
      deconnexion: 'Logout', voirprofil: 'View my profile',
      theme: 'Theme', langue: 'Language', sombre: 'Dark', clair: 'Light',
      francais: 'French', anglais: 'English',
      parametrestitre: 'Settings', parametressub: 'Customize your IUCTrack experience',
      apparence: 'Appearance', preferences: 'Preferences',
      principal: 'MAIN', configuration: 'CONFIGURATION', systeme: 'SYSTEM',
      // ── new v2 keys ──
      rechercher: 'Search students, requests, pages…',
      aucunresultat: 'No results for',
      pages: 'Pages', chargement: 'Loading…',
      activite: 'Request activity', septjours: 'Last 7 days',
      recues: 'Received', traitees: 'Processed', topfilieres: 'Top programs',
      suividemande: 'Request tracking', changerstatut: 'Change status',
      documentsjoints: 'Attached documents', notifieretudiant: 'Notify the student',
      passerencours: 'Move to in progress', marquerterminee: 'Mark as completed',
      demandetraitee: 'Request processed and closed', modelesrapides: 'Quick templates',
      envoyer: 'Send', annuler: 'Cancel', creer: 'Create', enregistrer: 'Save',
      modifier: 'Edit', toutes: 'All', nonlues: 'Unread', lues: 'Read',
    },
  };

  return (
    <SettingsContext.Provider value={{ theme, langue, toggleTheme, toggleLangue, colors, t: translations[langue] }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
