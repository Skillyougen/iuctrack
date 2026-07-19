import { useSettings } from '../../context/SettingsContext';
import { Moon, Sun, Globe } from 'lucide-react';

const DISPLAY = "'Bricolage Grotesque', 'Instrument Sans', sans-serif";

export default function ParametresPage() {
  const { theme, langue, toggleTheme, toggleLangue, colors, t } = useSettings();

  const card = { backgroundColor: colors.card, borderRadius: 20, border: `1px solid ${colors.border}`, overflow: 'hidden' };
  const header = { padding: '15px 20px', borderBottom: `1px solid ${colors.border}`, fontFamily: DISPLAY, fontSize: 15, fontWeight: 800, color: colors.text, display: 'flex', alignItems: 'center', gap: 8 };
  const label = { fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: colors.muted, fontWeight: 700, marginBottom: 10 };
  const check = { position: 'absolute', top: 10, right: 10, width: 9, height: 9, borderRadius: '50%', backgroundColor: colors.red };

  return (
    <div style={{ animation: 'fadeUp 0.35s ease both', maxWidth: 760 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 800, letterSpacing: -0.6, color: colors.text }}>{t.parametrestitre}</h1>
        <p style={{ fontSize: 13.5, color: colors.muted, marginTop: 4 }}>{t.parametressub}</p>
      </div>

      {/* APPARENCE — thème sombre / clair */}
      <div style={{ ...card, marginBottom: 16 }}>
        <div style={header}>{t.apparence}</div>
        <div style={{ padding: '18px 20px' }}>
          <div style={label}>{t.theme}</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={() => toggleTheme('dark')}
              style={{ flex: 1, minWidth: 230, position: 'relative', backgroundColor: '#1B2026', border: `2px solid ${theme === 'dark' ? colors.red : colors.border}`, borderRadius: 16, padding: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#232A33', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EDF1F5' }}>
                <Moon size={17} />
              </span>
              <span>
                <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: '#EDF1F5' }}>{t.sombre}</span>
                <span style={{ display: 'block', fontSize: 11, color: '#8B97A5', marginTop: 1 }}>Charbon & crème</span>
              </span>
              {theme === 'dark' && <span style={check} />}
            </button>
            <button onClick={() => toggleTheme('light')}
              style={{ flex: 1, minWidth: 230, position: 'relative', backgroundColor: '#F0EDE4', border: `2px solid ${theme === 'light' ? colors.red : colors.border}`, borderRadius: 16, padding: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#23282F', border: '1px solid rgba(35,40,47,0.1)' }}>
                <Sun size={17} />
              </span>
              <span>
                <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: '#23282F' }}>{t.clair}</span>
                <span style={{ display: 'block', fontSize: 11, color: '#79828E', marginTop: 1 }}>Ivoire & vert</span>
              </span>
              {theme === 'light' && <span style={check} />}
            </button>
          </div>
        </div>
      </div>

      {/* PRÉFÉRENCES — langue */}
      <div style={{ ...card, marginBottom: 16 }}>
        <div style={header}><Globe size={15} color={colors.muted} /> {t.preferences}</div>
        <div style={{ padding: '18px 20px' }}>
          <div style={label}>{t.langue}</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { key: 'fr', flag: '🇫🇷', label: t.francais },
              { key: 'en', flag: '🇬🇧', label: t.anglais },
            ].map(l => (
              <button key={l.key} onClick={() => toggleLangue(l.key)}
                style={{ flex: 1, minWidth: 230, position: 'relative', backgroundColor: colors.card2, border: `2px solid ${langue === l.key ? colors.red : colors.border}`, borderRadius: 16, padding: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                <span style={{ fontSize: 24 }}>{l.flag}</span>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: colors.text }}>{l.label}</span>
                {langue === l.key && <span style={check} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SYSTÈME */}
      <div style={card}>
        <div style={header}>{langue === 'fr' ? 'Système' : 'System'}</div>
        <div style={{ padding: '8px 20px 14px' }}>
          {[
            { label: 'Application', val: 'IUCTrack v2.0' },
            { label: 'Backend', val: 'Laravel 12 + Sanctum' },
            { label: 'Frontend', val: 'React + Vite' },
            { label: 'Mobile', val: 'React Native + Expo' },
            { label: langue === 'fr' ? 'Base de données' : 'Database', val: 'MySQL' },
          ].map((item, i, arr) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < arr.length - 1 ? `1px solid ${colors.border}` : 'none', fontSize: 12.5 }}>
              <span style={{ color: colors.muted }}>{item.label}</span>
              <span style={{ fontWeight: 700, color: colors.text }}>{item.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
