import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import api from '../../services/api';
import logoIcon from '../../assets/logo-icon.png';
import {
  LayoutDashboard, FileText, Users, Tag,
  FileCheck, Bell, UserCog, Settings, LogOut
} from 'lucide-react';

const DISPLAY = "'Bricolage Grotesque', 'Instrument Sans', sans-serif";

// Responsive : sur ≤1120px la sidebar devient un tiroir (classe .app-sidebar / .open, voir index.css).
// `open` + `onClose` sont pilotés par Layout ; sur desktop ils sont sans effet.
export default function Sidebar({ open = false, onClose = () => {} }) {
  const { admin, logout } = useAuth();
  const { colors, t } = useSettings();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  // Badge = nombre RÉEL de demandes "envoyée" à traiter
  useEffect(() => {
    let mounted = true;
    api.get('/admin/demandes')
      .then(res => { if (mounted) setPendingCount(res.data.filter(d => d.statut === 'envoyee').length); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const isSuperAdmin = admin?.role === 'super_admin';
  const permissions = (() => {
    try { return admin?.permissions ? JSON.parse(admin.permissions) : []; }
    catch { return []; }
  })();

  const canSee = (item) => {
    if (isSuperAdmin) return true;
    if (item.superAdminOnly) return false;
    if (item.permission) return permissions.includes(item.permission);
    return true;
  };

  const navItems = [
    { section: t.principal },
    { to: '/',                icon: LayoutDashboard, label: t.dashboard,       superAdminOnly: true },
    { to: '/demandes',        icon: FileText,        label: t.demandes,        permission: 'demandes', badge: true },
    { to: '/etudiants',       icon: Users,           label: t.etudiants,       permission: 'etudiants' },
    { section: t.configuration },
    { to: '/types-demandes',  icon: Tag,             label: t.typesdemande,    permission: 'types_documents' },
    { to: '/documents-requis',icon: FileCheck,       label: t.documentsrequis, permission: 'types_documents' },
    { section: t.systeme },
    { to: '/notifications',   icon: Bell,            label: t.notifications },
    { to: '/admins',          icon: UserCog,         label: t.admins,          superAdminOnly: true },
    { to: '/parametres',      icon: Settings,        label: t.parametres },
  ];

  return (
    <div className={`app-sidebar${open ? ' open' : ''}`}
      style={{ width: 240, display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 50, backgroundColor: colors.side, borderRight: `1px solid ${colors.sideBorder}` }}>

      {/* LOGO */}
      <div style={{ padding: '20px 18px 16px', display: 'flex', alignItems: 'center', gap: 11, borderBottom: `1px solid ${colors.sideBorder}` }}>
        <img src={logoIcon} alt="IUCTrack" style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: '#FFFFFF', objectFit: 'contain' }} />
        <div>
          <div style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 800, color: colors.sideText, letterSpacing: -0.3 }}>IUCTrack</div>
          <div style={{ fontSize: 10, color: colors.sideMuted, letterSpacing: 0.6, textTransform: 'uppercase' }}>Administration</div>
        </div>
      </div>

      {/* NAV */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 4px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {navItems.map((item, i) => {
          if (item.section) {
            return (
              <div key={i} style={{ fontSize: 9.5, padding: '8px 12px 4px', letterSpacing: 1, textTransform: 'uppercase', color: colors.sideMuted, fontWeight: 700 }}>
                {item.section}
              </div>
            );
          }
          if (!canSee(item)) return null;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 13px', borderRadius: 12, fontSize: 13.5,
                textDecoration: 'none', transition: 'background 0.15s',
                color: isActive ? '#FFFFFF' : colors.sideMuted,
                backgroundColor: isActive ? colors.red : 'transparent',
                fontWeight: isActive ? 700 : 500,
                boxShadow: isActive ? '0 10px 22px rgba(196,58,47,0.38)' : 'none',
              })}
            >
              <Icon size={16} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && pendingCount > 0 && (
                <span style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: '#FFFFFF', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>
                  {pendingCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* CARTE ADMIN — données réelles du compte connecté */}
      <NavLink to="/profil" onClick={onClose} style={{ margin: '10px 12px 0', borderRadius: 14, backgroundColor: colors.card2, border: `1px solid ${colors.sideBorder}`, overflow: 'hidden', textDecoration: 'none' }}>
        <div style={{ height: 34, background: 'linear-gradient(120deg, #C43A2F 0%, #7E2A20 55%, #1C4534 100%)' }} />
        <div style={{ padding: '0 12px 12px' }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: colors.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#FFFFFF', marginTop: -19, border: `2px solid ${colors.side}` }}>
            {admin?.nom?.charAt(0)}{admin?.prenom?.charAt(0)}
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.sideText, marginTop: 7 }}>
            {admin?.prenom} {admin?.nom}
          </div>
          <div style={{ display: 'inline-block', fontSize: 9.5, backgroundColor: 'rgba(196,58,47,0.18)', color: colors.redInk, padding: '2px 8px', borderRadius: 6, marginTop: 4, fontWeight: 600 }}>
            {isSuperAdmin ? 'Super Admin' : 'Admin'}
          </div>
          <div style={{ fontSize: 11, color: colors.greenInk, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${colors.sideBorder}` }}>
            {t.voirprofil} →
          </div>
        </div>
      </NavLink>

      {/* DÉCONNEXION */}
      <div style={{ padding: 12 }}>
        <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: 'rgba(196,58,47,0.10)', border: '1px solid rgba(196,58,47,0.28)', borderRadius: 11, padding: 10, fontSize: 12.5, fontWeight: 600, color: colors.redInk, cursor: 'pointer' }}>
          <LogOut size={14} /> {t.deconnexion}
        </button>
      </div>
    </div>
  );
}
