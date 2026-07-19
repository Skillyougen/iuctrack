import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import api from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import useBreakpoint from '../../hooks/useBreakpoint';
import { Search, Bell, Sun, Moon, FileText, Menu } from 'lucide-react';

// Layout v3 : responsive — sidebar fixe 240px sur desktop, tiroir + bouton menu ≤1120px,
// topbar compactée sur mobile. Recherche globale ⌘K inchangée (données réelles).

export default function Layout() {
  const { colors, t, theme, langue, toggleTheme, toggleLangue } = useSettings();
  const { admin } = useAuth();
  const navigate = useNavigate();
  const { isMobile, isNarrow } = useBreakpoint();
  const [searchOpen, setSearchOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => { document.body.style.backgroundColor = colors.bg; }, [colors]);
  useEffect(() => { if (!isNarrow) setNavOpen(false); }, [isNarrow]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true); }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const iconBtn = { width: 38, height: 38, flexShrink: 0, borderRadius: 12, backgroundColor: colors.card, border: `1px solid ${colors.border}`, color: colors.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };

  return (
    <div style={{ display: 'flex', backgroundColor: colors.bg, minHeight: '100vh', fontFamily: "'Instrument Sans', sans-serif" }}>
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

      {/* Voile derrière le tiroir (tablette / mobile) */}
      {isNarrow && navOpen && (
        <div onClick={() => setNavOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(10,13,17,0.55)', backdropFilter: 'blur(2px)', zIndex: 49 }} />
      )}

      <div className="layout-main-col" style={{ marginLeft: 240, flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        {/* TOPBAR */}
        <div style={{ height: 66, display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 14, padding: isMobile ? '0 14px' : '0 28px', borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.bg, position: 'sticky', top: 0, zIndex: 40 }}>

          {/* Menu (tiroir) — visible uniquement ≤1120px */}
          {isNarrow && (
            <button onClick={() => setNavOpen(true)} style={iconBtn} title="Menu">
              <Menu size={17} />
            </button>
          )}

          <button onClick={() => setSearchOpen(true)}
            style={{ flex: 1, maxWidth: 430, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10, backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: '10px 14px', color: colors.muted, cursor: 'pointer', textAlign: 'left' }}>
            <Search size={15} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.rechercher}</span>
            {!isMobile && (
              <span style={{ fontSize: 10.5, border: `1px solid ${colors.border}`, borderRadius: 6, padding: '2px 7px', fontWeight: 600 }}>⌘K</span>
            )}
          </button>
          <div style={{ flex: 1 }} />

          {/* Langue */}
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 999, padding: 3 }}>
            {['fr', 'en'].map(l => (
              <button key={l} onClick={() => toggleLangue(l)}
                style={{ fontSize: 11.5, fontWeight: langue === l ? 700 : 600, color: langue === l ? '#FFFFFF' : colors.muted, backgroundColor: langue === l ? colors.red : 'transparent', border: 'none', padding: isMobile ? '5px 9px' : '5px 12px', borderRadius: 999, cursor: 'pointer' }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Thème — masqué sur mobile (disponible dans Paramètres) */}
          {!isMobile && (
            <button onClick={() => toggleTheme(theme === 'dark' ? 'light' : 'dark')} title={t.theme} style={iconBtn}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}

          {/* Notifications */}
          <button onClick={() => navigate('/notifications')} style={{ ...iconBtn, position: 'relative' }}>
            <Bell size={16} />
            <span style={{ position: 'absolute', top: 8, right: 9, width: 7, height: 7, borderRadius: '50%', backgroundColor: colors.red, border: `1.5px solid ${colors.card}` }} />
          </button>

          {/* Profil — infos réelles du compte connecté */}
          <button onClick={() => navigate('/profil')}
            style={{ display: 'flex', alignItems: 'center', flexShrink: 0, gap: 9, cursor: 'pointer', padding: '4px 6px 4px 4px', borderRadius: 12, background: 'none', border: 'none' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#FFFFFF' }}>
              {admin?.nom?.charAt(0)}{admin?.prenom?.charAt(0)}
            </div>
            {!isMobile && (
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.1, color: colors.text }}>{admin?.prenom}</div>
                <div style={{ fontSize: 10, color: colors.muted }}>{admin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}</div>
              </div>
            )}
          </button>
        </div>

        <main style={{ flex: 1, padding: isMobile ? '20px 16px 44px' : '28px 32px 48px', maxWidth: 1240, width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>

      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
    </div>
  );
}

// ─── Recherche globale — données réelles ───
function GlobalSearch({ onClose }) {
  const { colors, t, langue } = useSettings();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [demandes, setDemandes] = useState([]);
  const [etudiants, setEtudiants] = useState([]);

  useEffect(() => {
    api.get('/admin/demandes').then(r => setDemandes(r.data)).catch(() => {});
    api.get('/admin/etudiants').then(r => setEtudiants(r.data)).catch(() => {});
  }, []);

  const go = useCallback((path) => { onClose(); navigate(path); }, [onClose, navigate]);

  const fr = langue === 'fr';
  const PAGES = [
    { path: '/',                label: t.dashboard, g: 'D' },
    { path: '/demandes',        label: t.demandes, g: 'De' },
    { path: '/etudiants',       label: t.etudiants, g: 'É' },
    { path: '/types-demandes',  label: t.typesdemande, g: 'T' },
    { path: '/documents-requis',label: t.documentsrequis, g: 'Do' },
    { path: '/notifications',   label: t.notifications, g: 'N' },
    { path: '/admins',          label: t.admins, g: 'A' },
    { path: '/parametres',      label: t.parametres, g: 'P' },
  ];

  const ql = q.trim().toLowerCase();
  const rPages = ql ? PAGES.filter(p => p.label.toLowerCase().includes(ql)) : [];
  const rEtu = ql ? etudiants.filter(e => `${e.nom} ${e.prenom} ${e.matricule}`.toLowerCase().includes(ql)).slice(0, 5) : [];
  const rDem = ql ? demandes.filter(d => `${d.etudiant?.nom} ${d.etudiant?.prenom} ${d.type_demande?.libelle}`.toLowerCase().includes(ql)).slice(0, 5) : [];
  const empty = ql && !rPages.length && !rEtu.length && !rDem.length;

  const sectionTitle = { fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: colors.muted, fontWeight: 700, padding: '8px 14px 4px' };
  const row = { display: 'flex', alignItems: 'center', gap: 11, padding: '10px 14px', borderRadius: 12, cursor: 'pointer', width: '100%', background: 'none', border: 'none', textAlign: 'left' };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(10,13,17,0.62)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '12vh 14px 0' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 620, maxWidth: '100%', backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 20, boxShadow: colors.shadow, overflow: 'hidden', animation: 'fadeUp 0.22s ease both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
          <Search size={17} color={colors.red} />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder={t.rechercher}
            style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', outline: 'none', color: colors.text, fontSize: 15.5 }} />
          <button onClick={onClose} style={{ fontSize: 10.5, border: `1px solid ${colors.border}`, borderRadius: 6, padding: '3px 8px', color: colors.muted, cursor: 'pointer', fontWeight: 600, background: 'none' }}>ESC</button>
        </div>
        <div style={{ maxHeight: '52vh', overflowY: 'auto', padding: '10px 8px 14px' }}>
          {rPages.length > 0 && <>
            <div style={sectionTitle}>{t.pages}</div>
            {rPages.map(p => (
              <button key={p.path} onClick={() => go(p.path)} style={row}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = colors.card2}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <span style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: 'rgba(196,58,47,0.14)', color: colors.redInk, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 }}>{p.g}</span>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: colors.text }}>{p.label}</span>
              </button>
            ))}
          </>}
          {rEtu.length > 0 && <>
            <div style={sectionTitle}>{t.etudiants}</div>
            {rEtu.map(e2 => (
              <button key={e2.id} onClick={() => go('/etudiants')} style={row}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = colors.card2}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <span style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: colors.green, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 800 }}>{e2.nom?.charAt(0)}{e2.prenom?.charAt(0)}</span>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: colors.text, flex: 1 }}>{e2.prenom} {e2.nom}</span>
                <span style={{ fontSize: 11.5, color: colors.muted }}>{e2.matricule}</span>
              </button>
            ))}
          </>}
          {rDem.length > 0 && <>
            <div style={sectionTitle}>{t.demandes}</div>
            {rDem.map(d => (
              <button key={d.id} onClick={() => go('/demandes')} style={row}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = colors.card2}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <span style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: 'rgba(107,143,203,0.16)', color: colors.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={14} /></span>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: colors.text, flex: 1 }}>{d.type_demande?.libelle} — {d.etudiant?.prenom} {d.etudiant?.nom}</span>
              </button>
            ))}
          </>}
          {empty && (
            <div style={{ textAlign: 'center', color: colors.muted, fontSize: 13, padding: '28px 0 18px' }}>
              {t.aucunresultat} « {q} »
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
