import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Check, FileText } from 'lucide-react';
import api from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

const DISPLAY = "'Bricolage Grotesque', 'Instrument Sans', sans-serif";

export default function DocumentsRequisPage() {
  const { colors, t, langue } = useSettings();
  const fr = langue === 'fr';
  const [types, setTypes]       = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [docForm, setDocForm]   = useState({ libelle: '', obligatoire: true });
  const [saving, setSaving]     = useState(false);

  useEffect(() => { fetchTypes(); }, []);

  const fetchTypes = async () => {
    const res = await api.get('/admin/type-demandes');
    setTypes(res.data);
    if (res.data.length > 0 && !selected) setSelected(res.data[0]);
  };

  const handleAddDoc = async () => {
    if (!docForm.libelle.trim() || !selected) return;
    setSaving(true);
    try {
      await api.post(`/admin/type-demandes/${selected.id}/documents`, docForm);
      setDocForm({ libelle: '', obligatoire: true });
      setShowForm(false);
      fetchTypes();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDeleteDoc = async (docId) => {
    if (!confirm(fr ? 'Supprimer ce document ?' : 'Delete this document?')) return;
    await api.delete(`/admin/type-demandes/${selected.id}/documents/${docId}`);
    fetchTypes();
  };

  const inp   = { backgroundColor: colors.input, border: `1px solid ${colors.border}`, borderRadius: 11, padding: '11px 13px', color: colors.text, fontSize: 13, outline: 'none' };
  const bSave = { display: 'flex', alignItems: 'center', gap: 5, backgroundColor: colors.red, border: 'none', borderRadius: 10, padding: '9px 18px', color: '#FFFFFF', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' };
  const bCanc = { display: 'flex', alignItems: 'center', gap: 5, backgroundColor: colors.card2, border: `1px solid ${colors.border}`, borderRadius: 10, padding: '9px 16px', color: colors.muted, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' };

  const selectedType = types.find(tp => tp.id === selected?.id);

  return (
    <div style={{ animation: 'fadeUp 0.35s ease both' }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 800, letterSpacing: -0.6, color: colors.text }}>{t.documentsrequis}</h1>
        <p style={{ fontSize: 13.5, color: colors.muted, marginTop: 4 }}>
          {fr ? 'Gérez les documents requis par type de demande' : 'Manage required documents per request type'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'start' }}>
        {/* TYPES — données réelles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: colors.muted, fontWeight: 700, padding: '0 4px 2px' }}>
            {t.typesdemande}
          </div>
          {types.map(type => (
            <div key={type.id} onClick={() => setSelected(type)}
              style={{ backgroundColor: colors.card, borderRadius: 14, padding: '13px 15px', border: `1px solid ${selected?.id === type.id ? colors.red : colors.border}`, cursor: 'pointer', transition: 'border-color 0.15s' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>{type.libelle}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <span style={{ fontSize: 11, color: colors.muted }}>
                  {type.documents_requis?.length || 0} document(s)
                </span>
                <span style={{ fontSize: 9.5, padding: '2px 8px', borderRadius: 999, fontWeight: 700, backgroundColor: type.actif ? 'rgba(34,160,107,0.14)' : colors.border, color: type.actif ? colors.greenInk : colors.muted }}>
                  {type.actif ? (fr ? 'Actif' : 'Active') : (fr ? 'Inactif' : 'Inactive')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* DOCUMENTS DU TYPE — endpoints réels */}
        {selectedType && (
          <div style={{ backgroundColor: colors.card, borderRadius: 20, border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '17px 20px', borderBottom: `1px solid ${colors.border}` }}>
              <div>
                <div style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 800, color: colors.text }}>{selectedType.libelle}</div>
                <div style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{selectedType.description}</div>
              </div>
              <button onClick={() => setShowForm(!showForm)}
                style={{ display: 'flex', alignItems: 'center', gap: 7, backgroundColor: colors.red, border: 'none', borderRadius: 11, padding: '9px 15px', color: '#FFFFFF', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
                <Plus size={13} /> {fr ? 'Ajouter un document' : 'Add a document'}
              </button>
            </div>

            {showForm && (
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.card2 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1, minWidth: 220 }}>
                    <label style={{ fontSize: 11.5, color: colors.muted, fontWeight: 600 }}>
                      {fr ? 'Nom du document *' : 'Document name *'}
                    </label>
                    <input style={inp} placeholder={fr ? "Ex: Copie CNI, Photo d'identité…" : 'e.g. ID copy, photo…'} value={docForm.libelle} onChange={e => setDocForm({ ...docForm, libelle: e.target.value })} />
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: colors.text, cursor: 'pointer', paddingBottom: 11, whiteSpace: 'nowrap' }}>
                    <input type="checkbox" checked={docForm.obligatoire} onChange={e => setDocForm({ ...docForm, obligatoire: e.target.checked })} style={{ accentColor: colors.red }} />
                    {fr ? 'Obligatoire' : 'Required'}
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={bCanc} onClick={() => { setShowForm(false); setDocForm({ libelle: '', obligatoire: true }); }}>
                      <X size={13} /> {t.annuler}
                    </button>
                    <button style={{ ...bSave, opacity: saving ? 0.7 : 1 }} onClick={handleAddDoc} disabled={saving}>
                      <Check size={13} /> {saving ? (fr ? 'Ajout…' : 'Adding…') : (fr ? 'Ajouter' : 'Add')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div>
              {selectedType.documents_requis?.length === 0 ? (
                <div style={{ color: colors.muted, fontSize: 13, padding: '30px 20px', textAlign: 'center' }}>
                  {fr ? 'Aucun document requis pour ce type. Cliquez sur « Ajouter un document ».' : 'No required documents for this type yet. Click "Add a document".'}
                </div>
              ) : selectedType.documents_requis?.map((doc, i) => (
                <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 20px', borderBottom: i < selectedType.documents_requis.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
                  <span style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: 'rgba(196,58,47,0.12)', color: colors.redInk, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={15} />
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>{doc.libelle}</div>
                    <div style={{ fontSize: 11, color: colors.muted, marginTop: 1 }}>
                      {doc.obligatoire ? (fr ? 'Document obligatoire' : 'Required document') : (fr ? 'Document facultatif' : 'Optional document')}
                    </div>
                  </div>
                  <span style={{ fontSize: 10.5, padding: '4px 11px', borderRadius: 999, fontWeight: 700, backgroundColor: doc.obligatoire ? 'rgba(233,168,76,0.14)' : 'rgba(107,143,203,0.14)', color: doc.obligatoire ? colors.gold : colors.blue }}>
                    {doc.obligatoire ? (fr ? 'Obligatoire' : 'Required') : (fr ? 'Facultatif' : 'Optional')}
                  </span>
                  <button onClick={() => handleDeleteDoc(doc.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.redInk, padding: 5, display: 'flex' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
