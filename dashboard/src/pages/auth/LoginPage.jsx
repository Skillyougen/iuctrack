import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { Eye, EyeOff } from 'lucide-react';
import logoHorizontal from '../../assets/logo-horizontal.png';
import logoIcon from '../../assets/logo-icon.png';

const DISPLAY = "'Bricolage Grotesque', 'Instrument Sans', sans-serif";

export default function LoginPage() {
  const { login } = useAuth();
  const { colors, langue } = useSettings();
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const fr = langue === 'fr';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await login(email, password); navigate('/'); }
    catch (err) { setError(err?.response?.data?.message || (fr ? 'Identifiants incorrects.' : 'Invalid credentials.')); }
    finally { setLoading(false); }
  };

  return (
    <div className="login-root" style={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.bg, fontFamily: "'Instrument Sans', sans-serif" }}>

      {/* GAUCHE — panneau crème branding */}
      <div className="login-left" style={{ flex: 1.2, backgroundColor: colors.panel, color: colors.panelInk, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px 84px', position: 'relative', overflow: 'hidden' }}>
        <img src={logoHorizontal} alt="IUCTrack" style={{ width: 230, objectFit: 'contain', marginBottom: 52, alignSelf: 'flex-start' }} />

        <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 56, lineHeight: 1.04, letterSpacing: -1.5, maxWidth: 560 }}>
          {fr ? <>Gérez les demandes <span style={{ color: colors.red }}>étudiantes</span> en temps réel.</>
              : <>Manage <span style={{ color: colors.red }}>student requests</span> in real time.</>}
        </h1>

        <p style={{ fontSize: 16.5, color: colors.panelMuted, lineHeight: 1.65, maxWidth: 460, marginTop: 22 }}>
          {fr ? "Plateforme d'administration centralisée de l'Institut Universitaire de la Côte. Soumission, suivi et traitement des demandes administratives en un seul endroit."
              : 'The centralized administration platform of Institut Universitaire de la Côte. Submit, track and process administrative requests in one place.'}
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 44 }}>
          {[
            { b: '100%', s: fr ? 'Numérique' : 'Digital' },
            { b: fr ? 'Temps réel' : 'Real-time', s: fr ? 'Suivi des statuts' : 'Status tracking' },
            { b: fr ? 'Sécurisé' : 'Secure', s: 'Sanctum Auth' },
          ].map((c, i) => (
            <div key={i} style={{ border: `1.5px solid ${colors.panelInk}`, borderRadius: 999, padding: '12px 22px' }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{c.b} </span>
              <span style={{ fontSize: 14, color: colors.panelMuted }}>{c.s}</span>
            </div>
          ))}
        </div>

        {/* Motif graphique — barres rouge/gris/vert + courbe */}
        <svg viewBox="0 0 320 90" style={{ width: 300, marginTop: 56 }} aria-hidden="true">
          <rect x="0" y="50" width="16" height="40" rx="6" fill="#C43A2F" />
          <rect x="24" y="30" width="16" height="60" rx="6" fill="#8B8E93" />
          <rect x="48" y="10" width="16" height="80" rx="6" fill="#22A06B" />
          <path d="M4 60 C 40 40, 60 34, 100 26 S 200 10, 240 14" stroke="#23282F" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="240" cy="14" r="5" fill="#C43A2F" />
        </svg>

        <div className="login-copy" style={{ position: 'absolute', bottom: 28, left: 84, fontSize: 13, color: colors.panelMuted }}>
          © 2026 IUCTrack — Institut Universitaire de la Côte
        </div>
      </div>

      {/* DROITE — formulaire */}
      <div className="login-right" style={{ width: 520, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 38 }}>
            <img src={logoIcon} alt="IUCTrack" style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: '#FFFFFF', objectFit: 'contain' }} />
            <div>
              <div style={{ fontFamily: DISPLAY, fontSize: 21, fontWeight: 800, color: colors.text }}>
                {fr ? 'Espace Administration' : 'Admin Area'}
              </div>
              <div style={{ fontSize: 13.5, color: colors.muted, marginTop: 2 }}>
                {fr ? 'Connectez-vous pour accéder au dashboard' : 'Sign in to access the dashboard'}
              </div>
            </div>
          </div>

          {error && (
            <div style={{ backgroundColor: 'rgba(196,58,47,0.10)', border: '1px solid rgba(196,58,47,0.30)', borderRadius: 12, padding: '13px 16px', color: colors.redInk, fontSize: 13.5, marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <label style={{ fontSize: 13, color: colors.muted, fontWeight: 600 }}>
                {fr ? 'Adresse email' : 'Email address'}
              </label>
              <input
                type="email" required placeholder="admin@iuctrack.cm"
                value={email} onChange={e => setEmail(e.target.value)}
                style={{ backgroundColor: colors.input, border: `1px solid ${colors.border}`, borderRadius: 14, padding: '15px 16px', fontSize: 15, color: colors.text, outline: 'none' }}
                onFocus={e => e.target.style.borderColor = colors.red}
                onBlur={e => e.target.style.borderColor = 'transparent'}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <label style={{ fontSize: 13, color: colors.muted, fontWeight: 600 }}>
                {fr ? 'Mot de passe' : 'Password'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'} required placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', backgroundColor: colors.input, border: `1px solid ${colors.border}`, borderRadius: 14, padding: '15px 48px 15px 16px', fontSize: 15, color: colors.text, outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = colors.red}
                  onBlur={e => e.target.style.borderColor = 'transparent'}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: colors.muted, display: 'flex' }}>
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ backgroundColor: colors.red, border: 'none', borderRadius: 14, padding: 16, color: '#FFFFFF', fontSize: 15.5, fontWeight: 700, cursor: 'pointer', marginTop: 8, opacity: loading ? 0.7 : 1, boxShadow: '0 14px 30px rgba(196,58,47,0.35)' }}>
              {loading ? (fr ? 'Connexion en cours…' : 'Signing in…') : (fr ? 'Se connecter →' : 'Sign in →')}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12.5, color: colors.muted, marginTop: 30 }}>
            IUCTrack — Smart Administration & Tracking System
          </p>
        </div>
      </div>
    </div>
  );
}
