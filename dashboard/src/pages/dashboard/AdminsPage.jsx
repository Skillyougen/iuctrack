import { useState, useEffect } from 'react';
import { Plus, Shield, Trash2, X, Check, Eye, EyeOff, Search, Users, FileText, Tag } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

const DISPLAY = "'Bricolage Grotesque', 'Instrument Sans', sans-serif";

const ALL_PERMISSIONS = [
  { key: 'demandes',        label: 'Demandes',                      labelEn: 'Requests',           icon: FileText, color: '#6B8FCB' },
  { key: 'etudiants',       label: 'Étudiants',                     labelEn: 'Students',           icon: Users,    color: '#22A06B' },
  { key: 'types_documents', label: 'Types de demandes & Documents', labelEn: 'Types & Documents',  icon: Tag,      color: '#E9A84C' },
];

export default function AdminsPage() {
  const { colors, t, langue } = useSettings();
  const fr = langue === 'fr';
  const { admin: currentAdmin } = useAuth();
  const [admins, setAdmins]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPwd, setShowPwd]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [filtre, setFiltre]     = useState('tous');
  const [form, setForm]         = useState({ nom: '', prenom: '', email: '', password: '', role: 'admin', permissions: [] });

  useEffect(() => { fetchAdmins(); }, []);

  const fetchAdmins = async () => {
    try {
      const res = await api.get('/admin/admins');
      setAdmins(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const togglePermission = (key) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter(p => p !== key)
        : [...prev.permissions, key]
    }));
  };

  const handleCreate = async () => {
    if (!form.nom || !form.prenom || !form.email || !form.password) {
      setError(fr ? 'Tous les champs obligatoires doivent être remplis.' : 'All required fields must be filled.');
      return;
    }
    setSaving(true); setError('');
    try {
      await api.post('/admin/admins', { ...form, permissions: JSON.stringify(form.permissions) });
      setForm({ nom: '', prenom: '', email: '', password: '', role: 'admin', permissions: [] });
      setShowForm(false);
      fetchAdmins();
    } catch (e) {
      setError(e?.response?.data?.message || (fr ? 'Erreur lors de la création.' : 'Error while creating.'));
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (id === currentAdmin?.id) return;
    if (!confirm(fr ? 'Supprimer cet administrateur ?' : 'Delete this administrator?')) return;
    await api.delete(`/admin/admins/${id}`);
    fetchAdmins();
  };

  const getPermissions = (admin) => {
    try { return admin.permissions ? JSON.parse(admin.permissions) : []; }
    catch { return []; }
  };

  const superAdmins = admins.filter(a => a.role === 'super_admin');
  const regularAdmins = admins.filter(a => a.role === 'admin').filter(a => {
    if (search) {
      const s = search.toLowerCase();
      return a.nom?.toLowerCase().includes(s) || a.prenom?.toLowerCase().includes(s) || a.email?.toLowerCase().includes(s);
    }
    if (filtre === 'tous') return true;
    return getPermissions(a).includes(filtre);
  });

  const inp = { backgroundColor: colors.input, border: `1px solid ${colors.border}`, borderRadius: 11, padding: '11px 13px', color: colors.text, fontSize: 13, outline: 'none' };
  const secLabel = { fontSize: 11.5, fontWeight: 800, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.8 };

  const AdminCard = ({ a, isSuper }) => {
    const perms = getPermissions(a);
    return (
      <div style={{ backgroundColor: colors.card, borderRadius: 18, padding: 17, border: `1px solid ${colors.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 12, borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: isSuper ? colors.red : colors.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#FFFFFF', flexShrink: 0 }}>
            {a.nom?.charAt(0)}{a.prenom?.charAt(0)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: colors.text }}>{a.prenom} {a.nom}</div>
            <div style={{ fontSize: 11, color: colors.muted, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.email}</div>
          </div>
          {a.id !== currentAdmin?.id && (
            <button onClick={() => handleDelete(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.redInk, padding: 4, display: 'flex' }}>
              <Trash2 size={14} />
            </button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 11 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, padding: '4px 10px', borderRadius: 999, fontWeight: 700, backgroundColor: isSuper ? 'rgba(196,58,47,0.14)' : 'rgba(107,143,203,0.14)', color: isSuper ? colors.redInk : colors.blue }}>
            {isSuper ? <Shield size={10} /> : <Users size={10} />} {isSuper ? 'Super Admin' : 'Admin'}
          </span>
          {a.id === currentAdmin?.id && (
            <span style={{ fontSize: 10.5, padding: '3px 10px', borderRadius: 999, backgroundColor: 'rgba(34,160,107,0.14)', color: colors.greenInk, fontWeight: 700 }}>
              {fr ? 'Vous' : 'You'}
            </span>
          )}
        </div>
        {!isSuper && (
          perms.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 11 }}>
              {perms.map(p => {
                const perm = ALL_PERMISSIONS.find(ap => ap.key === p);
                if (!perm) return null;
                const Icon = perm.icon;
                return (
                  <span key={p} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, padding: '4px 9px', borderRadius: 999, backgroundColor: `${perm.color}20`, color: perm.color, border: `1px solid ${perm.color}`, fontWeight: 700 }}>
                    <Icon size={9} /> {fr ? perm.label : perm.labelEn}
                  </span>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: 10.5, color: colors.muted, fontStyle: 'italic', marginTop: 11 }}>
              {fr ? 'Aucune permission accordée' : 'No permissions granted'}
            </div>
          )
        )}
      </div>
    );
  };

  return (
    <div style={{ animation: 'fadeUp 0.35s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
        <div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 800, letterSpacing: -0.6, color: colors.text }}>
            {fr ? 'Administrateurs' : 'Administrators'}
          </h1>
          <p style={{ fontSize: 13.5, color: colors.muted, marginTop: 4 }}>
            {fr ? 'Gérez les comptes administrateurs de la plateforme' : "Manage the platform's administrator accounts"}
          </p>
        </div>
        {currentAdmin?.role === 'super_admin' && (
          <button onClick={() => setShowForm(!showForm)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, backgroundColor: colors.red, border: 'none', borderRadius: 12, padding: '10px 16px', color: '#FFFFFF', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 22px rgba(196,58,47,0.32)' }}>
            <Plus size={14} /> {fr ? 'Nouvel admin' : 'New admin'}
          </button>
        )}
      </div>

      {/* FORM — POST /admin/admins */}
      {showForm && (
        <div style={{ backgroundColor: colors.card, borderRadius: 18, padding: 20, marginBottom: 20, border: `1px solid ${colors.border}`, animation: 'fadeUp 0.25s ease both' }}>
          <h3 style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 800, color: colors.text, marginBottom: 14 }}>
            {fr ? 'Créer un administrateur' : 'Create an administrator'}
          </h3>
          {error && (
            <div style={{ backgroundColor: 'rgba(196,58,47,0.10)', border: '1px solid rgba(196,58,47,0.30)', borderRadius: 10, padding: '10px 14px', color: colors.redInk, fontSize: 12.5, marginBottom: 14 }}>{error}</div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            {[
              { key: 'nom', label: fr ? 'Nom *' : 'Last name *', placeholder: 'ANGO', type: 'text' },
              { key: 'prenom', label: fr ? 'Prénom *' : 'First name *', placeholder: 'Jean-Baptiste', type: 'text' },
              { key: 'email', label: 'Email *', placeholder: 'admin@iuctrack.cm', type: 'email' },
            ].map(f => (
              <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11.5, color: colors.muted, fontWeight: 600 }}>{f.label}</label>
                <input style={inp} type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
              </div>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 11.5, color: colors.muted, fontWeight: 600 }}>{fr ? 'Mot de passe *' : 'Password *'}</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={{ ...inp, flex: 1 }} type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                <button onClick={() => setShowPwd(!showPwd)}
                  style={{ backgroundColor: colors.input, border: `1px solid ${colors.border}`, borderRadius: 11, padding: '10px 12px', color: colors.muted, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Rôle — cartes cliquables */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <div onClick={() => setForm({ ...form, role: 'admin' })}
              style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, backgroundColor: colors.card2, border: `2px solid ${form.role === 'admin' ? colors.blue : colors.border}`, borderRadius: 13, padding: '12px 14px', cursor: 'pointer' }}>
              <Users size={15} color={colors.blue} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>Admin</div>
                <div style={{ fontSize: 10.5, color: colors.muted }}>{fr ? 'Accès selon permissions' : 'Permission-based access'}</div>
              </div>
            </div>
            <div onClick={() => setForm({ ...form, role: 'super_admin', permissions: [] })}
              style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, backgroundColor: colors.card2, border: `2px solid ${form.role === 'super_admin' ? colors.red : colors.border}`, borderRadius: 13, padding: '12px 14px', cursor: 'pointer' }}>
              <Shield size={15} color={colors.redInk} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>Super Admin</div>
                <div style={{ fontSize: 10.5, color: colors.muted }}>{fr ? 'Accès complet' : 'Full access'}</div>
              </div>
            </div>
          </div>

          {form.role === 'admin' && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: colors.muted, fontWeight: 700, marginBottom: 8 }}>
                {fr ? 'Visibilités / Permissions' : 'Visibility / Permissions'}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {ALL_PERMISSIONS.map(p => {
                  const Icon = p.icon;
                  const active = form.permissions.includes(p.key);
                  return (
                    <div key={p.key} onClick={() => togglePermission(p.key)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: active ? `${p.color}18` : colors.card2, border: `1.5px solid ${active ? p.color : colors.border}`, borderRadius: 11, padding: '10px 14px', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: active ? colors.text : colors.muted }}>
                      <Icon size={13} color={active ? p.color : colors.muted} />
                      {fr ? p.label : p.labelEn}
                      {active && <Check size={13} color={p.color} strokeWidth={3} />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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

      {/* SUPER ADMINS — données réelles */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Shield size={14} color={colors.redInk} />
        <span style={secLabel}>{fr ? 'Super Administrateurs' : 'Super Administrators'} ({superAdmins.length})</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 26 }}>
        {loading ? (
          <div style={{ color: colors.muted, fontSize: 13 }}>{t.chargement}</div>
        ) : superAdmins.map(a => <AdminCard key={a.id} a={a} isSuper />)}
      </div>

      {/* ADMINS — recherche + filtre par permission */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={14} color={colors.blue} />
          <span style={secLabel}>{fr ? 'Administrateurs' : 'Administrators'} ({admins.filter(a => a.role === 'admin').length})</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 10, padding: '7px 12px' }}>
            <Search size={12} color={colors.muted} />
            <input style={{ background: 'none', border: 'none', outline: 'none', color: colors.text, fontSize: 12, width: 150 }}
              placeholder={fr ? 'Rechercher…' : 'Search…'} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={filtre} onChange={e => setFiltre(e.target.value)}
            style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 10, padding: '7px 10px', color: colors.text, fontSize: 12, cursor: 'pointer', outline: 'none' }}>
            <option value="tous">{fr ? 'Tous' : 'All'}</option>
            <option value="demandes">{fr ? 'Demandes' : 'Requests'}</option>
            <option value="etudiants">{fr ? 'Étudiants' : 'Students'}</option>
            <option value="types_documents">Types & Documents</option>
          </select>
        </div>
      </div>

      {regularAdmins.length === 0 ? (
        <div style={{ color: colors.muted, fontSize: 13, padding: 24, textAlign: 'center', backgroundColor: colors.card, borderRadius: 16, border: `1px solid ${colors.border}` }}>
          {fr ? 'Aucun administrateur trouvé.' : 'No administrators found.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {regularAdmins.map(a => <AdminCard key={a.id} a={a} />)}
        </div>
      )}
    </div>
  );
}
