import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, X, Check, Power } from 'lucide-react';
import api from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

const DISPLAY = "'Bricolage Grotesque', 'Instrument Sans', sans-serif";

export default function TypesDemandesPage() {
  const { colors, t, langue } = useSettings();
  const fr = langue === 'fr';
  const [types, setTypes]             = useState([]);
  const [expanded, setExpanded]       = useState(null);
  const [showForm, setShowForm]       = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [form, setForm]               = useState({ libelle: '', description: '' });
  const [docForm, setDocForm]         = useState({ libelle: '', obligatoire: true });
  const [showDocForm, setShowDocForm] = useState(null);
  const [loading, setLoading]         = useState(false);

  useEffect(() => { fetchTypes(); }, []);

  const fetchTypes = async () => {
    const res = await api.get('/admin/type-demandes');
    setTypes(res.data);
  };

  const handleSaveType = async () => {
    if (!form.libelle.trim()) return;
    setLoading(true);
    try {
      if (editingType) { await api.put(`/admin/type-demandes/${editingType.id}`, form); }
      else             { await api.post('/admin/type-demandes', form); }
      setForm({ libelle: '', description: '' });
      setShowForm(false); setEditingType(null);
      fetchTypes();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDeleteType = async (id) => {
    if (!confirm(fr ? 'Supprimer ce type ?' : 'Delete this type?')) return;
    await api.delete(`/admin/type-demandes/${id}`); fetchTypes();
  };

  const handleToggleActif = async (type) => {
    await api.put(`/admin/type-demandes/${type.id}`, { actif: !type.actif }); fetchTypes();
  };

  const handleSaveDoc = async (typeId) => {
    if (!docForm.libelle.trim()) return;
    await api.post(`/admin/type-demandes/${typeId}/documents`, docForm);
    setDocForm({ libelle: '', obligatoire: true }); setShowDocForm(null); fetchTypes();
  };

  const handleDeleteDoc = async (typeId, docId) => {
    await api.delete(`/admin/type-demandes/${typeId}/documents/${docId}`); fetchTypes();
  };

  const startEdit = (type) => {
    setEditingType(type);
    setForm({ libelle: type.libelle, description: type.description || '' });
    setShowForm(true);
  };

  const inp   = { backgroundColor: colors.input, border: `1px solid ${colors.border}`, borderRadius: 11, padding: '11px 13px', color: colors.text, fontSize: 13, outline: 'none' };
  const bSave = { display: 'flex', alignItems: 'center', gap: 5, backgroundColor: colors.red, border: 'none', borderRadius: 10, padding: '9px 18px', color: '#FFFFFF', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' };
  const bCanc = { display: 'flex', alignItems: 'center', gap: 5, backgroundColor: colors.card2, border: `1px solid ${colors.border}`, borderRadius: 10, padding: '9px 16px', color: colors.muted, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' };
  const iBtn  = (c) => ({ width: 30, height: 30, borderRadius: 9, border: `1px solid ${colors.border}`, background: 'none', cursor: 'pointer', color: c || colors.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' });

  return (
    <div style={{ animation: 'fadeUp 0.35s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 800, letterSpacing: -0.6, color: colors.text }}>{t.typesdemande}</h1>
          <p style={{ fontSize: 13.5, color: colors.muted, marginTop: 4 }}>
            {fr ? 'Gérez les catégories de demandes et leurs documents requis' : 'Manage request categories and their required documents'}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingType(null); setForm({ libelle: '', description: '' }); }}
          style={{ display: 'flex', alignItems: 'center', gap: 7, backgroundColor: colors.red, border: 'none', borderRadius: 12, padding: '10px 16px', color: '#FFFFFF', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 22px rgba(196,58,47,0.32)' }}>
          <Plus size={14} /> {fr ? 'Nouveau type' : 'New type'}
        </button>
      </div>

      {/* FORM — POST / PUT /admin/type-demandes */}
      {showForm && (
        <div style={{ backgroundColor: colors.card, borderRadius: 18, padding: 20, marginBottom: 18, border: `1px solid ${colors.border}`, animation: 'fadeUp 0.25s ease both' }}>
          <h3 style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 800, color: colors.text, marginBottom: 14 }}>
            {editingType ? (fr ? 'Modifier le type' : 'Edit type') : (fr ? 'Nouveau type de demande' : 'New request type')}
          </h3>
          <div className="g-form2" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginBottom: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 11.5, color: colors.muted, fontWeight: 600 }}>{fr ? 'Libellé *' : 'Label *'}</label>
              <input style={inp} placeholder="Ex: Attestation de scolarité" value={form.libelle} onChange={e => setForm({ ...form, libelle: e.target.value })} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 11.5, color: colors.muted, fontWeight: 600 }}>Description</label>
              <input style={inp} placeholder={fr ? 'Description optionnelle' : 'Optional description'} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button style={bCanc} onClick={() => { setShowForm(false); setEditingType(null); }}><X size={13} /> {t.annuler}</button>
            <button style={{ ...bSave, opacity: loading ? 0.7 : 1 }} onClick={handleSaveType} disabled={loading}>
              <Check size={13} /> {editingType ? t.modifier : t.creer}
            </button>
          </div>
        </div>
      )}

      {/* LISTE — données réelles /admin/type-demandes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {types.map((type) => (
          <div key={type.id} style={{ backgroundColor: colors.card, borderRadius: 18, border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '16px 18px', flexWrap: 'wrap' }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: type.actif ? colors.green : colors.muted, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setExpanded(expanded === type.id ? null : type.id)}>
                <div style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>{type.libelle}</div>
                {type.description && <div style={{ fontSize: 11.5, color: colors.muted, marginTop: 2 }}>{type.description}</div>}
              </div>
              <span style={{ fontSize: 10.5, padding: '4px 11px', borderRadius: 999, fontWeight: 700, backgroundColor: type.actif ? 'rgba(34,160,107,0.14)' : colors.border, color: type.actif ? colors.greenInk : colors.muted }}>
                {type.actif ? (fr ? 'Actif' : 'Active') : (fr ? 'Inactif' : 'Inactive')}
              </span>
              <span style={{ fontSize: 11.5, color: colors.muted, fontWeight: 600 }}>{type.documents_requis?.length || 0} docs</span>
              <button style={iBtn()} title={t.modifier} onClick={() => startEdit(type)}><Pencil size={13} /></button>
              <button style={iBtn(type.actif ? colors.muted : colors.greenInk)} title={fr ? 'Activer / Désactiver' : 'Enable / Disable'} onClick={() => handleToggleActif(type)}><Power size={13} /></button>
              <button style={iBtn(colors.redInk)} title={fr ? 'Supprimer' : 'Delete'} onClick={() => handleDeleteType(type.id)}><Trash2 size={13} /></button>
              <button style={iBtn()} onClick={() => setExpanded(expanded === type.id ? null : type.id)}>
                {expanded === type.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>

            {expanded === type.id && (
              <div style={{ padding: '14px 18px 16px', borderTop: `1px solid ${colors.border}`, backgroundColor: colors.card2 }}>
                <div style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: colors.muted, fontWeight: 700, marginBottom: 9 }}>
                  {t.documentsrequis}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {type.documents_requis?.map((doc) => (
                    <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 10, backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 11, padding: '9px 13px' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: colors.green, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: colors.text }}>{doc.libelle}</span>
                      <span style={{ fontSize: 10, padding: '3px 9px', borderRadius: 999, fontWeight: 700, backgroundColor: doc.obligatoire ? 'rgba(233,168,76,0.14)' : 'rgba(107,143,203,0.14)', color: doc.obligatoire ? colors.gold : colors.blue }}>
                        {doc.obligatoire ? (fr ? 'Obligatoire' : 'Required') : (fr ? 'Facultatif' : 'Optional')}
                      </span>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.redInk, padding: 4, display: 'flex' }} onClick={() => handleDeleteDoc(type.id, doc.id)}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  {showDocForm === type.id ? (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
                      <input style={{ ...inp, flex: 1 }} placeholder={fr ? 'Nom du document' : 'Document name'} value={docForm.libelle} onChange={e => setDocForm({ ...docForm, libelle: e.target.value })} />
                      <label style={{ fontSize: 11.5, color: colors.muted, display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', cursor: 'pointer' }}>
                        <input type="checkbox" checked={docForm.obligatoire} onChange={e => setDocForm({ ...docForm, obligatoire: e.target.checked })} style={{ accentColor: colors.red }} />
                        {fr ? 'Obligatoire' : 'Required'}
                      </label>
                      <button style={bSave} onClick={() => handleSaveDoc(type.id)}><Check size={13} /> {fr ? 'Ajouter' : 'Add'}</button>
                      <button style={bCanc} onClick={() => setShowDocForm(null)}><X size={13} /></button>
                    </div>
                  ) : (
                    <button onClick={() => setShowDocForm(type.id)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'none', border: `1.5px dashed ${colors.border}`, borderRadius: 11, padding: 9, color: colors.muted, fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}>
                      <Plus size={12} /> {fr ? 'Ajouter un document' : 'Add a document'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
