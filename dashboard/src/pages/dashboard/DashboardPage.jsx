import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle, Send, Tag, Users, Bell } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

const DISPLAY = "'Bricolage Grotesque', 'Instrument Sans', sans-serif";

export default function DashboardPage() {
  const { colors, t, langue } = useSettings();
  const { admin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, envoyee: 0, en_cours: 0, terminee: 0 });
  const [demandes, setDemandes] = useState([]);   // les 5 dernières
  const [allDemandes, setAllDemandes] = useState([]); // toutes (graphiques)
  const [loading, setLoading] = useState(true);

  const fr = langue === 'fr';

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/admin/demandes');
      const data = res.data;
      setAllDemandes(data);
      setDemandes(data.slice(0, 5));
      setStats({
        total:    data.length,
        envoyee:  data.filter(d => d.statut === 'envoyee').length,
        en_cours: data.filter(d => d.statut === 'en_cours').length,
        terminee: data.filter(d => d.statut === 'terminee').length,
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const STATUTS = {
    envoyee:  { label: t.envoyees,  color: '#6B8FCB', bg: 'rgba(107,143,203,0.16)' },
    en_cours: { label: t.encours,   color: '#E9A84C', bg: 'rgba(233,168,76,0.16)'  },
    terminee: { label: t.terminees, color: '#22A06B', bg: 'rgba(34,160,107,0.16)'  },
  };

  // ── Activité 7 derniers jours — calculée depuis created_at / updated_at (données réelles) ──
  const days = [...Array(7)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0, 0, 0, 0);
    return d;
  });
  const sameDay = (a, b) => a && new Date(a).toDateString() === b.toDateString();
  const activity = days.map(day => ({
    label: day.toLocaleDateString(fr ? 'fr-FR' : 'en-US', { weekday: 'short' }),
    recues:   allDemandes.filter(d => sameDay(d.created_at, day)).length,
    traitees: allDemandes.filter(d => d.statut === 'terminee' && sameDay(d.updated_at, day)).length,
  }));
  const maxAct = Math.max(1, ...activity.map(a => Math.max(a.recues, a.traitees)));

  // ── Top filières — calculées depuis les étudiants des demandes (données réelles) ──
  const filiereCount = {};
  allDemandes.forEach(d => {
    const f = d.etudiant?.filiere;
    if (f) filiereCount[f] = (filiereCount[f] || 0) + 1;
  });
  const topFilieres = Object.entries(filiereCount).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const maxFil = Math.max(1, ...topFilieres.map(([, n]) => n));
  const FIL_COLORS = [colors.red, colors.green, colors.gold, colors.blue];

  // ── Donut — proportions réelles ──
  const C = 2 * Math.PI * 50; // circonférence r=50
  const arc = (n) => stats.total > 0 ? (n / stats.total) * C : 0;

  const card = { backgroundColor: colors.card, borderRadius: 22, border: `1px solid ${colors.border}` };
  const kpi = (label, val, color, iconBg, icon, hero) => (
    <div style={{ backgroundColor: hero ? colors.panel : colors.card, color: hero ? colors.panelInk : colors.text, borderRadius: 20, padding: 20, border: `1px solid ${hero ? colors.panelBorder : colors.border}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: iconBg, color: hero ? '#FFFFFF' : color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <div style={{ fontFamily: DISPLAY, fontSize: 38, fontWeight: 800, lineHeight: 1, color: hero ? colors.panelInk : color }}>{loading ? '—' : val}</div>
      <div style={{ fontSize: 12, color: hero ? colors.panelMuted : colors.muted, fontWeight: 600 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ animation: 'fadeUp 0.35s ease both' }}>
      {/* EN-TÊTE */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 26, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: 34, fontWeight: 800, letterSpacing: -0.8, color: colors.text }}>
            {t.bonjour}, {admin?.prenom} 👋
          </h1>
          <p style={{ fontSize: 14, color: colors.muted, marginTop: 5 }}>
            {t.apercu} — {new Date().toLocaleDateString(fr ? 'fr-FR' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => navigate('/types-demandes')}
            style={{ display: 'flex', alignItems: 'center', gap: 7, backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: '11px 16px', fontSize: 13, fontWeight: 600, color: colors.text, cursor: 'pointer' }}>
            <Tag size={14} /> {t.gerertypes}
          </button>
          <button onClick={() => navigate('/demandes')}
            style={{ display: 'flex', alignItems: 'center', gap: 7, backgroundColor: colors.red, border: 'none', borderRadius: 12, padding: '11px 18px', fontSize: 13, fontWeight: 700, color: '#FFFFFF', cursor: 'pointer', boxShadow: '0 12px 26px rgba(196,58,47,0.35)' }}>
            {t.voirdemandes} →
          </button>
        </div>
      </div>

      {/* KPI — données réelles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 16 }}>
        {kpi(t.totaldemandes, stats.total, colors.text, colors.red, <FileText size={17} />, true)}
        {kpi(t.envoyees, stats.envoyee, colors.blue, 'rgba(107,143,203,0.15)', <Send size={16} />)}
        {kpi(t.encours, stats.en_cours, colors.gold, 'rgba(233,168,76,0.15)', <Clock size={16} />)}
        {kpi(t.terminees, stats.terminee, colors.greenInk, 'rgba(34,160,107,0.15)', <CheckCircle size={16} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.65fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* ACTIVITÉ 7 JOURS — panneau crème */}
        <div style={{ backgroundColor: colors.panel, color: colors.panelInk, borderRadius: 22, padding: '22px 24px', border: `1px solid ${colors.panelBorder}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 800 }}>{t.activite}</div>
              <div style={{ fontSize: 11.5, color: colors.panelMuted, marginTop: 2 }}>{t.septjours}</div>
            </div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              {[[t.recues, '#C43A2F'], [t.traitees, '#22A06B']].map(([lb, c]) => (
                <span key={lb} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: colors.panelMuted, fontWeight: 600 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, backgroundColor: c }} /> {lb}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 170, paddingTop: 10 }}>
            {activity.map((a, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 4, width: '100%', justifyContent: 'center' }}>
                  <div title={`${t.recues}: ${a.recues}`} style={{ width: 18, borderRadius: 7, backgroundColor: '#C43A2F', height: `${(a.recues / maxAct) * 100}%`, minHeight: a.recues ? 8 : 3, opacity: a.recues ? 1 : 0.15, transition: 'height 0.3s ease' }} />
                  <div title={`${t.traitees}: ${a.traitees}`} style={{ width: 18, borderRadius: 7, backgroundColor: '#22A06B', height: `${(a.traitees / maxAct) * 100}%`, minHeight: a.traitees ? 8 : 3, opacity: a.traitees ? 1 : 0.15, transition: 'height 0.3s ease' }} />
                </div>
                <span style={{ fontSize: 11, color: colors.panelMuted }}>{a.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* DONUT — répartition réelle */}
        <div style={{ ...card, padding: '22px 24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 800, color: colors.text }}>{t.repartition}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px 0 6px' }}>
            <div style={{ position: 'relative', width: 158, height: 158 }}>
              <svg viewBox="0 0 120 120" style={{ width: 158, height: 158, transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="50" fill="none" stroke={colors.border} strokeWidth="13" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="#22A06B" strokeWidth="13" strokeLinecap="round"
                  strokeDasharray={`${arc(stats.terminee)} ${C}`} strokeDashoffset="0" style={{ transition: 'stroke-dasharray 0.4s ease' }} />
                <circle cx="60" cy="60" r="50" fill="none" stroke="#E9A84C" strokeWidth="13" strokeLinecap="round"
                  strokeDasharray={`${arc(stats.en_cours)} ${C}`} strokeDashoffset={-arc(stats.terminee) - 3} style={{ transition: 'stroke-dasharray 0.4s ease' }} />
                <circle cx="60" cy="60" r="50" fill="none" stroke="#6B8FCB" strokeWidth="13" strokeLinecap="round"
                  strokeDasharray={`${arc(stats.envoyee)} ${C}`} strokeDashoffset={-arc(stats.terminee) - arc(stats.en_cours) - 6} style={{ transition: 'stroke-dasharray 0.4s ease' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 32, fontWeight: 800, lineHeight: 1, color: colors.text }}>{loading ? '—' : stats.total}</div>
                <div style={{ fontSize: 10.5, color: colors.muted, fontWeight: 600 }}>{t.demandes.toLowerCase()}</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 6 }}>
            {[['envoyee', stats.envoyee], ['en_cours', stats.en_cours], ['terminee', stats.terminee]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: STATUTS[k].color }} />
                <span style={{ color: colors.muted, flex: 1 }}>{STATUTS[k].label}</span>
                <span style={{ fontWeight: 700, color: STATUTS[k].color }}>{v}</span>
                <span style={{ color: colors.muted, fontSize: 11, width: 34, textAlign: 'right' }}>
                  {stats.total > 0 ? Math.round((v / stats.total) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.65fr 1fr', gap: 16 }}>
        {/* DERNIÈRES DEMANDES — données réelles */}
        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
            <span style={{ fontFamily: DISPLAY, fontSize: 15.5, fontWeight: 800, color: colors.text }}>{t.dernieresdemandes}</span>
            <button onClick={() => navigate('/demandes')} style={{ fontSize: 12, color: colors.redInk, fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none' }}>{t.voirtout}</button>
          </div>
          {loading ? (
            <div style={{ color: colors.muted, fontSize: 13, padding: 24, textAlign: 'center' }}>{t.chargement}</div>
          ) : demandes.length === 0 ? (
            <div style={{ color: colors.muted, fontSize: 13, padding: 24, textAlign: 'center' }}>{fr ? 'Aucune demande reçue.' : 'No requests received.'}</div>
          ) : demandes.map((d) => {
            const s = STATUTS[d.statut] || STATUTS.envoyee;
            return (
              <div key={d.id} onClick={() => navigate('/demandes')}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', borderBottom: `1px solid ${colors.border}`, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = colors.card2}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <div style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: d.statut === 'terminee' ? colors.green : colors.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 800, color: '#FFFFFF', flexShrink: 0 }}>
                  {d.etudiant?.nom?.charAt(0)}{d.etudiant?.prenom?.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>{d.etudiant?.prenom} {d.etudiant?.nom}</div>
                  <div style={{ fontSize: 11.5, color: colors.muted, marginTop: 1 }}>{d.type_demande?.libelle}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span style={{ fontSize: 10.5, padding: '3px 10px', borderRadius: 999, fontWeight: 700, backgroundColor: s.bg, color: s.color }}>{s.label}</span>
                  <span style={{ fontSize: 10.5, color: colors.muted }}>{new Date(d.created_at).toLocaleDateString(fr ? 'fr-FR' : 'en-US')}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* TOP FILIÈRES — calculées depuis les demandes réelles */}
          <div style={{ ...card, padding: '18px 20px' }}>
            <div style={{ fontFamily: DISPLAY, fontSize: 15.5, fontWeight: 800, color: colors.text, marginBottom: 12 }}>{t.topfilieres}</div>
            {topFilieres.length === 0 ? (
              <div style={{ fontSize: 12, color: colors.muted }}>{fr ? 'Données disponibles dès les premières demandes.' : 'Data available once requests come in.'}</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {topFilieres.map(([f, n], i) => (
                  <div key={f} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: colors.muted }}>{f}</span>
                      <span style={{ fontWeight: 700, color: colors.text }}>{n}</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, backgroundColor: colors.border }}>
                      <div style={{ width: `${(n / maxFil) * 100}%`, height: '100%', borderRadius: 3, backgroundColor: FIL_COLORS[i % 4], transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RACCOURCIS */}
          <div style={{ ...card, padding: '18px 20px' }}>
            <div style={{ fontFamily: DISPLAY, fontSize: 15.5, fontWeight: 800, color: colors.text, marginBottom: 12 }}>{t.raccourcis}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {[
                { label: t.etudiants, icon: <Users size={15} />, to: '/etudiants' },
                { label: t.gerertypes, icon: <Tag size={15} />, to: '/types-demandes' },
                { label: t.notifications, icon: <Bell size={15} />, to: '/notifications' },
              ].map((s, i) => (
                <button key={i} onClick={() => navigate(s.to)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, backgroundColor: colors.card2, border: `1px solid ${colors.border}`, borderRadius: 12, padding: '12px 14px', fontSize: 12.5, fontWeight: 600, color: colors.text, cursor: 'pointer', textAlign: 'left' }}>
                  {s.icon} <span style={{ flex: 1 }}>{s.label}</span> <span style={{ color: colors.muted }}>→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
