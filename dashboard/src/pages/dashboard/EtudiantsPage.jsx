import { useState, useEffect, useRef } from 'react';
import { Search, FileText, Plus, X, Check, Eye, EyeOff, Upload, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

const DISPLAY = "'Bricolage Grotesque', 'Instrument Sans', sans-serif";

const STATUTS = {
  envoyee:  { label: 'Envoyée',  labelEn: 'Sent',        color: '#6B8FCB', bg: 'rgba(107,143,203,0.16)' },
  en_cours: { label: 'En cours', labelEn: 'In progress', color: '#E9A84C', bg: 'rgba(233,168,76,0.16)'  },
  terminee: { label: 'Terminée', labelEn: 'Completed',   color: '#22A06B', bg: 'rgba(34,160,107,0.16)'  },
};

export default function EtudiantsPage() {
  const { colors, t, langue } = useSettings();
  const fr = langue === 'fr';
  const [etudiants, setEtudiants]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState(null);
  const [demandes, setDemandes]     = useState([]);
  const [showForm, setShowForm]     = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showPwd, setShowPwd]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [form, setForm]             = useState({ matricule: '', nom: '', prenom: '', filiere: '', password: '', has_password: false });

  // Import IA — logique identique (XLSX → CSV → /admin/ia/import-etudiants)
  const fileRef                           = useRef(null);
  const [importing, setImporting]         = useState(false);
  const [importResult, setImportResult]   = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importError, setImportError]     = useState('');
  const [fileName, setFileName]           = useState('');

  useEffect(() => { fetchEtudiants(); }, []);

  const fetchEtudiants = async () => {
    try {
      const res = await api.get('/admin/etudiants');
      setEtudiants(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchDemandes = async (id) => {
    try {
      const res = await api.get(`/admin/etudiants/${id}/demandes`);
      setDemandes(res.data);
    } catch (e) { setDemandes([]); }
  };

  const selectEtudiant = (e) => { setSelected(e); fetchDemandes(e.id); };

  const handleCreate = async () => {
    if (!form.matricule || !form.nom || !form.prenom || !form.filiere) {
      setError(fr ? 'Matricule, nom, prénom et filière sont obligatoires.' : 'Student ID, last name, first name and program are required.');
      return;
    }
    setSaving(true); setError('');
    try {
      await api.post('/admin/etudiants', form);
      setForm({ matricule: '', nom: '', prenom: '', filiere: '', password: '', has_password: false });
      setShowForm(false);
      fetchEtudiants();
    } catch (e) {
      setError(e?.response?.data?.message || (fr ? 'Erreur lors de la création.' : 'Error while creating.'));
    } finally { setSaving(false); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setImportResult(null);
    setImportError('');
    setImportPreview(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const text = XLSX.utils.sheet_to_csv(sheet);
        setImportPreview(text);
      } catch (err) {
        setImportError(fr ? "Impossible de lire le fichier. Vérifiez qu'il s'agit d'un fichier Excel ou CSV valide." : 'Unable to read the file. Check it is a valid Excel or CSV file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImportIA = async () => {
    if (!importPreview) return;
    setImporting(true);
    setImportError('');
    setImportResult(null);
    try {
      const res = await api.post('/admin/ia/import-etudiants', { contenu: importPreview });
      setImportResult(res.data);
      fetchEtudiants();
    } catch (e) {
      setImportError(e?.response?.data?.message || (fr ? "Erreur lors de l'import." : 'Import error.'));
    } finally { setImporting(false); }
  };

  const resetImport = () => {
    setFileName('');
    setImportPreview(null);
    setImportResult(null);
    setImportError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const filtered = etudiants.filter(e =>
    e.nom?.toLowerCase().includes(search.toLowerCase()) ||
    e.prenom?.toLowerCase().includes(search.toLowerCase()) ||
    e.matricule?.toLowerCase().includes(search.toLowerCase())
  );

  const inp = { backgroundColor: colors.input, border: `1px solid ${colors.border}`, borderRadius: 11, padding: '11px 13px', color: colors.text, fontSize: 13, outline: 'none' };
  const secTitle = { fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: colors.muted, fontWeight: 700 };

  return (
    <div style={{ animation: 'fadeUp 0.35s ease both' }}>
      {/* EN-TÊTE */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 800, letterSpacing: -0.6, color: colors.text }}>{t.etudiants}</h1>
          <p style={{ fontSize: 13.5, color: colors.muted, marginTop: 4 }}>
            {fr ? 'Liste des étudiants enregistrés dans le système' : 'Students registered in the system'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: '9px 14px', width: 230, maxWidth: '100%' }}>
            <Search size={14} color={colors.muted} />
            <input style={{ background: 'none', border: 'none', outline: 'none', color: colors.text, fontSize: 13, flex: 1 }}
              placeholder={fr ? 'Rechercher…' : 'Search…'} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button onClick={() => { setShowImport(!showImport); setShowForm(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: 7, backgroundColor: 'rgba(107,143,203,0.14)', border: '1px solid rgba(107,143,203,0.35)', borderRadius: 12, padding: '10px 16px', color: colors.blue, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            <Sparkles size={14} /> Import IA
          </button>
          <button onClick={() => { setShowForm(!showForm); setShowImport(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: 7, backgroundColor: colors.red, border: 'none', borderRadius: 12, padding: '10px 16px', color: '#FFFFFF', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 22px rgba(196,58,47,0.32)' }}>
            <Plus size={14} /> {fr ? 'Nouvel étudiant' : 'New student'}
          </button>
        </div>
      </div>

      {/* CRÉATION MANUELLE — POST /admin/etudiants */}
      {showForm && (
        <div style={{ backgroundColor: colors.card, borderRadius: 18, padding: 20, marginBottom: 18, border: `1px solid ${colors.border}`, animation: 'fadeUp 0.25s ease both' }}>
          <h3 style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 800, color: colors.text, marginBottom: 14 }}>
            {fr ? 'Créer un étudiant' : 'Create a student'}
          </h3>
          {error && (
            <div style={{ backgroundColor: 'rgba(196,58,47,0.10)', border: '1px solid rgba(196,58,47,0.30)', borderRadius: 10, padding: '10px 14px', color: colors.redInk, fontSize: 12.5, marginBottom: 14 }}>{error}</div>
          )}
          <div className="g-form2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            {[
              { key: 'matricule', label: 'Matricule *', placeholder: 'IUC2024-0001' },
              { key: 'nom', label: fr ? 'Nom *' : 'Last name *', placeholder: 'NGONO' },
              { key: 'prenom', label: fr ? 'Prénom *' : 'First name *', placeholder: 'Karine' },
              { key: 'filiere', label: fr ? 'Filière *' : 'Program *', placeholder: 'Programmation et Applications Mobiles' },
            ].map(f => (
              <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11.5, color: colors.muted, fontWeight: 600 }}>{f.label}</label>
                <input style={inp} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
              </div>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 11.5, color: colors.muted, fontWeight: 600 }}>
                {fr ? 'Mot de passe (optionnel)' : 'Password (optional)'}
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={{ ...inp, flex: 1 }} type={showPwd ? 'text' : 'password'}
                  placeholder={fr ? 'Laisser vide = sans MDP' : 'Empty = no password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value, has_password: e.target.value.length > 0 })} />
                <button onClick={() => setShowPwd(!showPwd)}
                  style={{ backgroundColor: colors.input, border: `1px solid ${colors.border}`, borderRadius: 11, padding: '10px 12px', color: colors.muted, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => { setShowForm(false); setError(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: 5, backgroundColor: colors.card2, border: `1px solid ${colors.border}`, borderRadius: 10, padding: '9px 16px', color: colors.muted, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
              <X size={13} /> {t.annuler}
            </button>
            <button onClick={handleCreate} disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: 5, backgroundColor: colors.red, border: 'none', borderRadius: 10, padding: '9px 18px', color: '#FFFFFF', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              <Check size={13} /> {saving ? (fr ? 'Création…' : 'Creating…') : t.creer}
            </button>
          </div>
        </div>
      )}

      {/* IMPORT IA — POST /admin/ia/import-etudiants */}
      {showImport && (
        <div style={{ backgroundColor: colors.card, borderRadius: 18, padding: 20, marginBottom: 18, border: '1px solid rgba(107,143,203,0.35)', animation: 'fadeUp 0.25s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(107,143,203,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={17} color={colors.blue} />
            </div>
            <div>
              <div style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 800, color: colors.text }}>
                Import IA — {fr ? 'Intégration en masse' : 'Bulk integration'}
              </div>
              <div style={{ fontSize: 12, color: colors.muted, marginTop: 1 }}>
                {fr ? "L'IA analyse votre fichier et intègre automatiquement les étudiants" : 'AI analyzes your file and automatically integrates students'}
              </div>
            </div>
          </div>

          {/* Colonnes attendues */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14, alignItems: 'center' }}>
            {[
              { label: 'Matricule', desc: 'IUC2024-0001', color: colors.redInk, bd: 'rgba(196,58,47,0.25)' },
              { label: fr ? 'Nom' : 'Last name', desc: fr ? 'En majuscules' : 'Uppercase', color: colors.greenInk, bd: 'rgba(34,160,107,0.30)' },
              { label: fr ? 'Prénom' : 'First name', desc: fr ? '1re lettre maj.' : 'Capitalized', color: colors.blue, bd: 'rgba(107,143,203,0.30)' },
              { label: fr ? 'Filière' : 'Program', desc: fr ? 'Nom du programme' : 'Program name', color: colors.gold, bd: 'rgba(233,168,76,0.30)' },
            ].map((c, i) => (
              <div key={i} style={{ backgroundColor: colors.card2, borderRadius: 10, padding: '8px 13px', border: `1px solid ${c.bd}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: c.color }}>{c.label}</div>
                <div style={{ fontSize: 10, color: colors.muted, marginTop: 1 }}>{c.desc}</div>
              </div>
            ))}
            <div style={{ fontSize: 11, color: colors.muted }}>
              {fr ? 'Formats : ' : 'Formats: '}<strong style={{ color: colors.text }}>.xlsx, .xls, .csv</strong> — {fr ? "l'IA s'adapte aux noms de colonnes." : 'AI adapts to column names.'}
            </div>
          </div>

          {/* Zone upload / fichier chargé */}
          {!importPreview ? (
            <div onClick={() => fileRef.current?.click()}
              style={{ border: `2px dashed ${colors.border}`, borderRadius: 14, padding: '30px 20px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = colors.blue}
              onMouseLeave={e => e.currentTarget.style.borderColor = colors.border}>
              <Upload size={30} color={colors.muted} style={{ margin: '0 auto 10px', display: 'block' }} />
              <div style={{ fontSize: 13.5, fontWeight: 700, color: colors.text }}>
                {fr ? 'Cliquez pour sélectionner votre fichier' : 'Click to select your file'}
              </div>
              <div style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>Excel (.xlsx, .xls) · CSV</div>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} style={{ display: 'none' }} />
            </div>
          ) : (
            <div style={{ backgroundColor: colors.card2, borderRadius: 12, padding: '13px 14px', border: `1px solid ${colors.border}`, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <FileText size={19} color={colors.blue} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>{fileName}</div>
                  <div style={{ fontSize: 11, color: colors.muted, marginTop: 1 }}>
                    {importPreview.split('\n').filter(l => l.trim()).length} {fr ? 'lignes détectées' : 'rows detected'}
                  </div>
                </div>
                <button onClick={resetImport} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.muted, display: 'flex' }}>
                  <X size={15} />
                </button>
              </div>
              <div style={{ marginTop: 12, backgroundColor: colors.card, borderRadius: 10, padding: 10, maxHeight: 120, overflowY: 'auto' }}>
                <pre style={{ fontSize: 10, color: colors.muted, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {importPreview.split('\n').slice(0, 6).join('\n')}
                  {importPreview.split('\n').length > 6 ? '\n…' : ''}
                </pre>
              </div>
            </div>
          )}

          {importError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: 'rgba(196,58,47,0.10)', border: '1px solid rgba(196,58,47,0.30)', borderRadius: 10, padding: '10px 14px', color: colors.redInk, fontSize: 12, margin: '12px 0' }}>
              <AlertCircle size={14} /> {importError}
            </div>
          )}

          {/* Résultat réel de l'API (created / skipped / errors) */}
          {importResult && (
            <div style={{ backgroundColor: 'rgba(34,160,107,0.10)', border: '1px solid rgba(34,160,107,0.35)', borderRadius: 14, padding: 16, margin: '12px 0', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 800, color: colors.greenInk }}>
                <CheckCircle size={17} /> {fr ? 'Import terminé' : 'Import completed'}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 800, color: colors.greenInk }}>{importResult.created}</div>
                <div style={{ fontSize: 11, color: colors.muted }}>{fr ? 'Créés' : 'Created'}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 800, color: colors.gold }}>{importResult.skipped}</div>
                <div style={{ fontSize: 11, color: colors.muted }}>{fr ? 'Ignorés (doublons)' : 'Skipped (duplicates)'}</div>
              </div>
              {importResult.errors?.length > 0 && (
                <div style={{ flexBasis: '100%', fontSize: 11, color: colors.redInk }}>
                  {importResult.errors.map((err, i) => <div key={i}>⚠ {err}</div>)}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button onClick={() => { setShowImport(false); resetImport(); }}
              style={{ backgroundColor: colors.card2, border: `1px solid ${colors.border}`, borderRadius: 10, padding: '9px 16px', color: colors.muted, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
              {fr ? 'Fermer' : 'Close'}
            </button>
            {importPreview && !importResult && (
              <button onClick={handleImportIA} disabled={importing}
                style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: colors.blue, border: 'none', borderRadius: 10, padding: '9px 16px', color: '#FFFFFF', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', opacity: importing ? 0.7 : 1 }}>
                <Sparkles size={13} /> {importing ? (fr ? 'Analyse IA en cours…' : 'AI analysis in progress…') : (fr ? "Lancer l'import IA" : 'Run AI import')}
              </button>
            )}
            {importResult && (
              <button onClick={resetImport}
                style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: colors.blue, border: 'none', borderRadius: 10, padding: '9px 16px', color: '#FFFFFF', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
                <Upload size={13} /> {fr ? 'Nouveau fichier' : 'New file'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* LISTE + DÉTAIL — données réelles */}
      <div className="g-split" style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {loading ? (
            <div style={{ color: colors.muted, fontSize: 13, padding: 24, textAlign: 'center' }}>{t.chargement}</div>
          ) : filtered.length === 0 ? (
            <div style={{ color: colors.muted, fontSize: 13, padding: 24, textAlign: 'center' }}>
              {fr ? 'Aucun étudiant trouvé.' : 'No students found.'}
            </div>
          ) : filtered.map(e => (
            <div key={e.id} onClick={() => selectEtudiant(e)}
              style={{ backgroundColor: selected?.id === e.id ? 'rgba(196,58,47,0.06)' : colors.card, borderRadius: 16, padding: '14px 16px', border: `1px solid ${selected?.id === e.id ? colors.red : colors.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 13, flexWrap: 'wrap', transition: 'border-color 0.15s' }}>
              <div style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: colors.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#FFFFFF', flexShrink: 0 }}>
                {e.nom?.charAt(0)}{e.prenom?.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: colors.text }}>{e.prenom} {e.nom}</div>
                <div style={{ fontSize: 11.5, color: colors.muted, marginTop: 1 }}>{e.matricule}</div>
              </div>
              <span style={{ fontSize: 11.5, color: colors.greenInk, fontWeight: 600 }}>{e.filiere}</span>
              <span style={{ fontSize: 10.5, padding: '4px 10px', borderRadius: 999, fontWeight: 700, backgroundColor: e.has_password ? 'rgba(34,160,107,0.14)' : 'rgba(233,168,76,0.14)', color: e.has_password ? colors.greenInk : colors.gold, flexShrink: 0 }}>
                {e.has_password ? (fr ? 'MDP défini' : 'Password set') : (fr ? 'Sans MDP' : 'No password')}
              </span>
            </div>
          ))}
        </div>

        {selected && (
          <div className="split-detail" style={{ backgroundColor: colors.card, borderRadius: 20, border: `1px solid ${colors.border}`, padding: 20, position: 'sticky', top: 86 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.muted, display: 'flex' }}>
                <X size={15} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingBottom: 16, borderBottom: `1px solid ${colors.border}` }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: colors.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#FFFFFF' }}>
                {selected.nom?.charAt(0)}{selected.prenom?.charAt(0)}
              </div>
              <div style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 800, color: colors.text, marginTop: 10 }}>
                {selected.prenom} {selected.nom}
              </div>
              <div style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{selected.matricule}</div>
              <span style={{ fontSize: 11, color: colors.greenInk, fontWeight: 700, backgroundColor: 'rgba(34,160,107,0.12)', borderRadius: 999, padding: '4px 12px', marginTop: 8 }}>
                {selected.filiere}
              </span>
            </div>
            <div style={{ ...secTitle, margin: '14px 0 8px' }}>
              {fr ? "Demandes de l'étudiant" : "Student's requests"} ({demandes.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {demandes.length === 0 ? (
                <div style={{ color: colors.muted, fontSize: 12.5, padding: 12, textAlign: 'center' }}>
                  {fr ? 'Aucune demande soumise.' : 'No requests submitted.'}
                </div>
              ) : demandes.map(d => {
                const s = STATUTS[d.statut];
                return (
                  <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 9, backgroundColor: colors.card2, borderRadius: 11, padding: '10px 12px' }}>
                    <FileText size={13} color={colors.muted} />
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: colors.text }}>{d.type_demande?.libelle}</span>
                    <span style={{ fontSize: 10, padding: '3px 9px', borderRadius: 999, fontWeight: 700, backgroundColor: s?.bg, color: s?.color }}>
                      {fr ? s?.label : s?.labelEn}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
