import { useState, useEffect } from 'react';
import { Bell, CheckCircle, User, Calendar } from 'lucide-react';
import api from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

const DISPLAY = "'Bricolage Grotesque', 'Instrument Sans', sans-serif";

export default function NotificationsAdminPage() {
  const { colors, t, langue } = useSettings();
  const fr = langue === 'fr';
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [filtre, setFiltre]               = useState('toutes');

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/admin/notifications');
      setNotifications(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filtered = notifications.filter(n => {
    if (filtre === 'non_lues') return !n.lue;
    if (filtre === 'lues')     return n.lue;
    return true;
  });

  const nonLues = notifications.filter(n => !n.lue).length;

  return (
    <div style={{ animation: 'fadeUp 0.35s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 800, letterSpacing: -0.6, color: colors.text }}>{t.notifications}</h1>
          <p style={{ fontSize: 13.5, color: colors.muted, marginTop: 4 }}>
            {fr ? 'Historique des notifications envoyées aux étudiants' : 'History of notifications sent to students'}
          </p>
        </div>
        {nonLues > 0 && (
          <span style={{ fontSize: 12, padding: '7px 14px', borderRadius: 999, backgroundColor: 'rgba(196,58,47,0.12)', color: colors.redInk, fontWeight: 700 }}>
            {nonLues} {fr ? `non lue${nonLues > 1 ? 's' : ''}` : 'unread'}
          </span>
        )}
      </div>

      {/* STATS — données réelles */}
      <div className="g-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 18 }}>
        {[
          { label: 'Total', val: notifications.length, color: colors.panelInk, hero: true },
          { label: t.nonlues, val: nonLues, color: colors.gold },
          { label: t.lues, val: notifications.length - nonLues, color: colors.greenInk },
        ].map((s, i) => (
          <div key={i} style={{ backgroundColor: s.hero ? colors.panel : colors.card, color: s.hero ? colors.panelInk : colors.text, borderRadius: 16, padding: '15px 18px', border: `1px solid ${s.hero ? colors.panelBorder : colors.border}` }}>
            <div style={{ fontSize: 11, color: s.hero ? colors.panelMuted : colors.muted, fontWeight: 700, marginBottom: 5 }}>{s.label}</div>
            <div style={{ fontFamily: DISPLAY, fontSize: 27, fontWeight: 800, color: s.hero ? colors.panelInk : s.color }}>{loading ? '—' : s.val}</div>
          </div>
        ))}
      </div>

      {/* FILTRES */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { key: 'toutes', label: t.toutes },
          { key: 'non_lues', label: t.nonlues },
          { key: 'lues', label: t.lues },
        ].map(f => (
          <button key={f.key} onClick={() => setFiltre(f.key)}
            style={{ backgroundColor: filtre === f.key ? colors.red : colors.card, border: `1px solid ${filtre === f.key ? colors.red : colors.border}`, borderRadius: 999, padding: '8px 16px', color: filtre === f.key ? '#FFFFFF' : colors.muted, fontSize: 12.5, fontWeight: filtre === f.key ? 700 : 600, cursor: 'pointer' }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* LISTE — données réelles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {loading ? (
          <div style={{ color: colors.muted, fontSize: 13, padding: 24, textAlign: 'center' }}>{t.chargement}</div>
        ) : filtered.length === 0 ? (
          <div style={{ color: colors.muted, fontSize: 13, padding: 40, textAlign: 'center' }}>
            {fr ? 'Aucune notification.' : 'No notifications.'}
          </div>
        ) : filtered.map(n => (
          <div key={n.id} style={{ backgroundColor: !n.lue ? 'rgba(196,58,47,0.05)' : colors.card, borderRadius: 16, padding: '16px 18px', border: `1px solid ${!n.lue ? 'rgba(196,58,47,0.26)' : colors.border}`, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: !n.lue ? 'rgba(196,58,47,0.15)' : colors.card2, color: !n.lue ? colors.redInk : colors.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bell size={16} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: colors.text, flex: 1 }}>{n.titre}</span>
                {n.lue ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, color: colors.greenInk, fontWeight: 700 }}>
                    <CheckCircle size={11} /> {fr ? 'Lue' : 'Read'}
                  </span>
                ) : (
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: colors.red, flexShrink: 0 }} />
                )}
              </div>
              <div style={{ fontSize: 12.5, color: colors.muted, lineHeight: 1.55, marginTop: 4 }}>{n.message}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: colors.muted, marginTop: 8 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
                  <Calendar size={11} />
                  {new Date(n.created_at).toLocaleDateString(fr ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
                {n.etudiant && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <User size={11} /> {n.etudiant?.prenom} {n.etudiant?.nom}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
