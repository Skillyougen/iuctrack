import { useState, useEffect } from 'react';
import { Eye, CheckCircle, Clock, X, FileText, Bell, Download, Image, File, Paperclip } from 'lucide-react';
import api from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

const DISPLAY = "'Bricolage Grotesque', 'Instrument Sans', sans-serif";
const BASE_STORAGE = 'http://127.0.0.1:8000/storage/';

const STATUTS = {
  envoyee:  { label: 'Envoyée',  labelEn: 'Sent',        color: '#6B8FCB', bg: 'rgba(107,143,203,0.16)' },
  en_cours: { label: 'En cours', labelEn: 'In progress', color: '#E9A84C', bg: 'rgba(233,168,76,0.16)'  },
  terminee: { label: 'Terminée', labelEn: 'Completed',   color: '#22A06B', bg: 'rgba(34,160,107,0.16)'  },
};

const TEMPLATES = [
  { titre: 'Document illisible',     message: 'Un de vos documents joints est illisible. Merci de soumettre une version plus claire.' },
  { titre: 'Document manquant',      message: 'Votre dossier est incomplet. Merci de joindre tous les documents requis.' },
  { titre: 'Document expiré',        message: 'Un de vos documents est expiré. Merci de fournir une version à jour.' },
  { titre: 'Information incorrecte', message: 'Les informations figurant sur vos documents ne correspondent pas à votre dossier étudiant.' },
];

function decoderNomFichier(nom) {
  if (!nom) return 'Document';
  try { return decodeURIComponent(nom); } catch { return nom; }
}

function getFileType(chemin, nomOriginal) {
  const ext = (chemin || nomOriginal || '').split('.').pop().toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
  if (ext === 'pdf') return 'pdf';
  return 'other';
}

const sLabel = (k, fr) => fr ? STATUTS[k].label : STATUTS[k].labelEn;

// ─── Timeline « suivi colis » — dates réelles created_at / updated_at ───
function SuiviTimeline({ demande, colors, fr }) {
  const cur = demande.statut === 'envoyee' ? 0 : demande.statut === 'en_cours' ? 1 : 2;
  const fmt = (d) => d ? new Date(d).toLocaleDateString(fr ? 'fr-FR' : 'en-US', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';
  const steps = [
    { key: 'envoyee',  done: true,      date: fmt(demande.created_at),
      desc: fr ? "Demande soumise par l'étudiant" : 'Request submitted by the student' },
    { key: 'en_cours', done: cur >= 1,  date: cur >= 1 ? fmt(demande.updated_at) : '—',
      desc: fr ? "Dossier pris en charge par l'administration" : 'File being handled by administration' },
    { key: 'terminee', done: cur >= 2,  date: cur >= 2 ? fmt(demande.updated_at) : '—',
      desc: fr ? 'Document prêt — étudiant notifié' : 'Document ready — student notified' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {steps.map((st, i) => {
        const meta = STATUTS[st.key];
        const isCurrent = i === cur && demande.statut !== 'terminee';
        return (
          <div key={st.key} style={{ display: 'flex', gap: 13 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 26, flexShrink: 0 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                backgroundColor: st.done ? meta.color : colors.card2,
                border: `2px solid ${st.done ? meta.color : colors.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: isCurrent ? 'pulseDot 1.8s ease-out infinite' : 'none',
              }}>
                {st.done && <CheckCircle size={12} color="#FFFFFF" strokeWidth={3} />}
              </div>
              {i < 2 && <div style={{ width: 2, flex: 1, minHeight: 26, backgroundColor: i < cur ? '#22A06B' : colors.border, margin: '3px 0', borderRadius: 1 }} />}
            </div>
            <div style={{ paddingBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: st.done ? colors.text : colors.muted }}>{sLabel(st.key, fr)}</div>
              <div style={{ fontSize: 11, color: colors.muted, marginTop: 2, lineHeight: 1.5 }}>{st.desc}</div>
              <div style={{ fontSize: 10.5, color: colors.muted, fontWeight: 600, marginTop: 3 }}>{st.date}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function NotifierForm({ demandeId, colors, fr }) {
  const [show, setShow]       = useState(false);
  const [titre, setTitre]     = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSend = async () => {
    if (!titre || !message) return;
    setSending(true);
    try {
      await api.post(`/admin/demandes/${demandeId}/notifier`, { titre, message });
      setSuccess(fr ? 'Notification envoyée avec succès.' : 'Notification sent successfully.');
      setTitre(''); setMessage(''); setShow(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  const inputStyle = { backgroundColor: colors.input, border: `1px solid ${colors.border}`, borderRadius: 10, padding: '10px 12px', color: colors.text, fontSize: 12.5, outline: 'none' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {success && (
        <div style={{ backgroundColor: 'rgba(34,160,107,0.12)', border: '1px solid rgba(34,160,107,0.32)', borderRadius: 10, padding: '9px 12px', color: colors.greenInk, fontSize: 12, fontWeight: 600 }}>
          ✓ {success}
        </div>
      )}
      <button onClick={() => setShow(!show)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.card2, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 11, color: colors.text, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
        <Bell size={14} /> {fr ? "Notifier l'étudiant" : 'Notify the student'}
      </button>
      {show && (
        <div style={{ backgroundColor: colors.card2, border: `1px solid ${colors.border}`, borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 9.5, letterSpacing: 1, textTransform: 'uppercase', color: colors.muted, fontWeight: 700 }}>
            {fr ? 'Modèles rapides' : 'Quick templates'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {TEMPLATES.map((tpl, i) => (
              <button key={i} onClick={() => { setTitre(tpl.titre); setMessage(tpl.message); }}
                style={{ fontSize: 10.5, padding: '5px 10px', borderRadius: 999, backgroundColor: colors.card, border: `1px solid ${colors.border}`, color: colors.muted, cursor: 'pointer', fontWeight: 600 }}>
                {tpl.titre}
              </button>
            ))}
          </div>
          <input style={inputStyle} placeholder={fr ? 'Titre *' : 'Title *'} value={titre} onChange={e => setTitre(e.target.value)} />
          <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="Message *" value={message} onChange={e => setMessage(e.target.value)} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => { setShow(false); setTitre(''); setMessage(''); }}
              style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 10, padding: '8px 14px', color: colors.muted, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
              {fr ? 'Annuler' : 'Cancel'}
            </button>
            <button onClick={handleSend} disabled={sending || !titre || !message}
              style={{ backgroundColor: colors.gold, border: 'none', borderRadius: 10, padding: '8px 16px', color: '#23282F', fontSize: 12, fontWeight: 800, cursor: 'pointer', opacity: (!titre || !message) ? 0.5 : 1 }}>
              {sending ? (fr ? 'Envoi…' : 'Sending…') : (fr ? 'Envoyer' : 'Send')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DocViewer({ doc, colors, onClose }) {
  const url = BASE_STORAGE + doc.chemin_fichier;
  const type = getFileType(doc.chemin_fichier, doc.nom_original);
  const nom = decoderNomFichier(doc.nom_original);

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(10,13,17,0.88)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', backgroundColor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {type === 'image' ? <Image size={16} color={colors.muted} /> : <FileText size={16} color={colors.muted} />}
          <span style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{nom}</span>
          <span style={{ fontSize: 11, color: colors.muted, backgroundColor: colors.card, padding: '3px 9px', borderRadius: 999 }}>
            {doc.document_requis?.libelle}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href={url} download={nom} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 5, backgroundColor: 'rgba(107,143,203,0.15)', border: '1px solid rgba(107,143,203,0.3)', borderRadius: 10, padding: '7px 13px', color: '#6B8FCB', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
            <Download size={13} /> Télécharger
          </a>
          <button onClick={onClose}
            style={{ display: 'flex', alignItems: 'center', gap: 5, backgroundColor: 'rgba(196,58,47,0.12)', border: '1px solid rgba(196,58,47,0.28)', borderRadius: 10, padding: '7px 13px', color: colors.redInk, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <X size={13} /> Fermer
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        {type === 'image' ? (
          <img src={url} alt={nom} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 12 }} />
        ) : type === 'pdf' ? (
          <iframe src={url} title={nom} style={{ width: '100%', height: '100%', border: 'none', borderRadius: 12, backgroundColor: '#fff' }} />
        ) : (
          <div style={{ textAlign: 'center', color: '#fff' }}>
            <File size={48} color="rgba(255,255,255,0.4)" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: 14, marginBottom: 12 }}>Aperçu non disponible pour ce format</p>
            <a href={url} download={nom} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#6B8FCB', borderRadius: 10, padding: '10px 20px', color: '#fff', fontSize: 13, textDecoration: 'none' }}>
              <Download size={14} /> Télécharger le fichier
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DemandesPage() {
  const { colors, t, langue } = useSettings();
  const fr = langue === 'fr';
  const [demandes, setDemandes] = useState([]);
  const [filtre, setFiltre]     = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [changing, setChanging] = useState(false);
  const [viewDoc, setViewDoc]   = useState(null);

  useEffect(() => { fetchDemandes(); }, [filtre]);

  const fetchDemandes = async () => {
    setLoading(true);
    try {
      const params = filtre ? `?statut=${filtre}` : '';
      const res = await api.get(`/admin/demandes${params}`);
      setDemandes(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const changerStatut = async (id, statut) => {
    setChanging(true);
    try {
      await api.put(`/admin/demandes/${id}/statut`, { statut });
      const now = new Date().toISOString();
      setDemandes(prev => prev.map(d => d.id === id ? { ...d, statut, updated_at: now } : d));
      if (selected?.id === id) setSelected(s => ({ ...s, statut, updated_at: now }));
    } catch (e) { console.error(e); }
    finally { setChanging(false); }
  };

  const stats = {
    total:    demandes.length,
    envoyee:  demandes.filter(d => d.statut === 'envoyee').length,
    en_cours: demandes.filter(d => d.statut === 'en_cours').length,
    terminee: demandes.filter(d => d.statut === 'terminee').length,
  };

  const secTitle = { fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: colors.muted, fontWeight: 700, marginBottom: 8 };

  return (
    <div style={{ animation: 'fadeUp 0.35s ease both' }}>
      {viewDoc && <DocViewer doc={viewDoc} colors={colors} onClose={() => setViewDoc(null)} />}

      {/* EN-TÊTE + FILTRES */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 800, letterSpacing: -0.6, color: colors.text }}>{t.demandes}</h1>
          <p style={{ fontSize: 13.5, color: colors.muted, marginTop: 4 }}>
            {fr ? 'Gérez et traitez les demandes des étudiants' : 'Manage and process student requests'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['', 'envoyee', 'en_cours', 'terminee'].map((f) => (
            <button key={f} onClick={() => setFiltre(f)}
              style={{ backgroundColor: filtre === f ? colors.red : colors.card, border: `1px solid ${filtre === f ? colors.red : colors.border}`, borderRadius: 999, padding: '8px 16px', color: filtre === f ? '#FFFFFF' : colors.muted, fontSize: 12.5, fontWeight: filtre === f ? 700 : 600, cursor: 'pointer' }}>
              {f === '' ? t.toutes : sLabel(f, fr)}
            </button>
          ))}
        </div>
      </div>

      {/* STATS — données réelles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total', val: stats.total, color: colors.panelInk, hero: true },
          { label: t.envoyees, val: stats.envoyee, color: colors.blue },
          { label: t.encours, val: stats.en_cours, color: colors.gold },
          { label: t.terminees, val: stats.terminee, color: colors.greenInk },
        ].map((s, i) => (
          <div key={i} style={{ backgroundColor: s.hero ? colors.panel : colors.card, color: s.hero ? colors.panelInk : colors.text, borderRadius: 16, padding: '15px 18px', border: `1px solid ${s.hero ? colors.panelBorder : colors.border}` }}>
            <div style={{ fontSize: 11, color: s.hero ? colors.panelMuted : colors.muted, fontWeight: 700, marginBottom: 5 }}>{s.label}</div>
            <div style={{ fontFamily: DISPLAY, fontSize: 27, fontWeight: 800, color: s.hero ? colors.panelInk : s.color }}>{loading ? '—' : s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 420px' : '1fr', gap: 16, alignItems: 'start' }}>
        {/* LISTE — données réelles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {loading ? (
            <div style={{ color: colors.muted, fontSize: 13, padding: 24, textAlign: 'center' }}>{t.chargement}</div>
          ) : demandes.length === 0 ? (
            <div style={{ color: colors.muted, fontSize: 13, padding: 24, textAlign: 'center' }}>
              {fr ? 'Aucune demande trouvée.' : 'No requests found.'}
            </div>
          ) : demandes.map((d) => {
            const s = STATUTS[d.statut] || STATUTS.envoyee;
            const isSelected = selected?.id === d.id;
            return (
              <div key={d.id} onClick={() => setSelected(d)}
                style={{ backgroundColor: isSelected ? 'rgba(196,58,47,0.06)' : colors.card, borderRadius: 16, padding: '15px 16px', border: `1px solid ${isSelected ? colors.red : colors.border}`, cursor: 'pointer', transition: 'border-color 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: d.statut === 'terminee' ? colors.green : colors.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#FFFFFF', flexShrink: 0 }}>
                    {d.etudiant?.nom?.charAt(0)}{d.etudiant?.prenom?.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: colors.text }}>{d.etudiant?.prenom} {d.etudiant?.nom}</div>
                    <div style={{ fontSize: 12, color: colors.muted, marginTop: 1 }}>{d.type_demande?.libelle}</div>
                  </div>
                  <span style={{ fontSize: 10.5, padding: '4px 11px', borderRadius: 999, fontWeight: 700, backgroundColor: s.bg, color: s.color, flexShrink: 0 }}>{sLabel(d.statut, fr)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10.5, color: colors.muted, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${colors.border}` }}>
                  <span style={{ fontWeight: 600 }}>{d.etudiant?.matricule}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Paperclip size={11} /> {d.documents_joints?.length || 0} docs · {new Date(d.created_at).toLocaleDateString(fr ? 'fr-FR' : 'en-US')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* DÉTAIL — sticky, avec timeline */}
        {selected && (
          <div style={{ backgroundColor: colors.card, borderRadius: 20, border: `1px solid ${colors.border}`, padding: 20, position: 'sticky', top: 86, maxHeight: 'calc(100vh - 110px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: DISPLAY, fontSize: 15.5, fontWeight: 800, color: colors.text }}>
                {fr ? 'Détail de la demande' : 'Request detail'}
              </span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.muted, display: 'flex', padding: 4 }} onClick={() => setSelected(null)}>
                <X size={16} />
              </button>
            </div>

            {/* Étudiant — données réelles */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, backgroundColor: colors.card2, borderRadius: 14, padding: '13px 14px' }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: selected.statut === 'terminee' ? colors.green : colors.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#FFFFFF' }}>
                {selected.etudiant?.nom?.charAt(0)}{selected.etudiant?.prenom?.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>{selected.etudiant?.prenom} {selected.etudiant?.nom}</div>
                <div style={{ fontSize: 11.5, color: colors.muted, marginTop: 1 }}>{selected.etudiant?.matricule}</div>
                <div style={{ fontSize: 11.5, color: colors.greenInk, fontWeight: 600, marginTop: 1 }}>{selected.etudiant?.filiere}</div>
              </div>
            </div>

            {/* Type + statut */}
            <div>
              <div style={secTitle}>{fr ? 'Type de demande' : 'Request type'}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>{selected.type_demande?.libelle}</span>
                <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 999, fontWeight: 700, backgroundColor: STATUTS[selected.statut]?.bg, color: STATUTS[selected.statut]?.color }}>
                  {sLabel(selected.statut, fr)}
                </span>
              </div>
            </div>

            {/* TIMELINE — nouveauté v2 */}
            <div>
              <div style={secTitle}>{t.suividemande}</div>
              <SuiviTimeline demande={selected} colors={colors} fr={fr} />
            </div>

            {/* Documents joints — données réelles */}
            <div>
              <div style={secTitle}>{t.documentsjoints} ({selected.documents_joints?.length || 0})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {selected.documents_joints?.length === 0 && (
                  <div style={{ fontSize: 12, color: colors.muted, fontStyle: 'italic' }}>{fr ? 'Aucun document joint.' : 'No attached documents.'}</div>
                )}
                {selected.documents_joints?.map((doc) => {
                  const type = getFileType(doc.chemin_fichier, doc.nom_original);
                  const nom = decoderNomFichier(doc.nom_original);
                  return (
                    <div key={doc.id} style={{ backgroundColor: colors.card2, border: `1px solid ${colors.border}`, borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}>
                        <span style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: type === 'image' ? 'rgba(107,143,203,0.16)' : 'rgba(196,58,47,0.14)', color: type === 'image' ? colors.blue : colors.redInk, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {type === 'image' ? <Image size={14} /> : <FileText size={14} />}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nom}</div>
                          <div style={{ fontSize: 10.5, color: colors.muted, marginTop: 1 }}>{doc.document_requis?.libelle}</div>
                        </div>
                        <button onClick={() => setViewDoc(doc)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: colors.blue, backgroundColor: 'rgba(107,143,203,0.12)', border: '1px solid rgba(107,143,203,0.28)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', flexShrink: 0 }}>
                          <Eye size={11} /> {fr ? 'Voir' : 'View'}
                        </button>
                      </div>
                      {type === 'image' && (
                        <div onClick={() => setViewDoc(doc)} style={{ cursor: 'pointer', borderTop: `1px solid ${colors.border}` }}>
                          <img src={BASE_STORAGE + doc.chemin_fichier} alt={nom}
                            style={{ width: '100%', maxHeight: 140, objectFit: 'cover', display: 'block' }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Changer statut — endpoints réels */}
            <div>
              <div style={secTitle}>{t.changerstatut}</div>
              {selected.statut === 'envoyee' && (
                <button onClick={() => changerStatut(selected.id, 'en_cours')} disabled={changing}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(233,168,76,0.14)', border: '1px solid rgba(233,168,76,0.35)', borderRadius: 12, padding: 12, color: colors.gold, fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: changing ? 0.6 : 1 }}>
                  <Clock size={15} /> {t.passerencours}
                </button>
              )}
              {selected.statut === 'en_cours' && (
                <button onClick={() => changerStatut(selected.id, 'terminee')} disabled={changing}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(34,160,107,0.14)', border: '1px solid rgba(34,160,107,0.35)', borderRadius: 12, padding: 12, color: colors.greenInk, fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: changing ? 0.6 : 1 }}>
                  <CheckCircle size={15} /> {t.marquerterminee}
                </button>
              )}
              {selected.statut === 'terminee' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: colors.greenInk, backgroundColor: 'rgba(34,160,107,0.10)', borderRadius: 12, padding: '12px 14px' }}>
                  <CheckCircle size={15} /> {t.demandetraitee}
                </div>
              )}
            </div>

            {/* Notifier — endpoint réel */}
            <div>
              <div style={secTitle}>{fr ? "Contacter l'étudiant" : 'Contact the student'}</div>
              <NotifierForm demandeId={selected.id} colors={colors} fr={fr} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
