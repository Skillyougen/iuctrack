import { useState, useEffect } from 'react';
import { User, Shield, Eye, EyeOff, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import api from '../../services/api';

const DISPLAY = "'Bricolage Grotesque', 'Instrument Sans', sans-serif";

export default function ProfilAdminPage() {
  const { admin, setAdmin } = useAuth();
  const { colors, langue } = useSettings();
  const fr = langue === 'fr';
  const [editInfo, setEditInfo]   = useState(false);
  const [editPwd, setEditPwd]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [form, setForm]           = useState({ nom: '', prenom: '', email: '' });
  const [pwdForm, setPwdForm]     = useState({ current_password: '', password: '', password_confirmation: '' });

  useEffect(() => {
    if (admin) setForm({ nom: admin.nom || '', prenom: admin.prenom || '', email: admin.email || '' });
  }, [admin]);

  const handleSaveInfo = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const res = await api.put('/admin/profil', form);
      setAdmin(res.data);
      setEditInfo(false);
      setSuccess(fr ? 'Informations mises à jour avec succès.' : 'Information updated successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e?.response?.data?.message || (fr ? 'Erreur lors de la mise à jour.' : 'Update error.'));
    } finally { setSaving(false); }
  };

  const handleSavePwd = async () => {
    if (pwdForm.password !== pwdForm.password_confirmation) {
      setError(fr ? 'Les mots de passe ne correspondent pas.' : 'Passwords do not match.'); return;
    }
    if (pwdForm.password.length < 6) {
      setError(fr ? 'Le mot de passe doit contenir au moins 6 caractères.' : 'Password must be at least 6 characters.'); return;
    }
    setSavingPwd(true); setError(''); setSuccess('');
    try {
      await api.put('/admin/profil/password', pwdForm);
      setPwdForm({ current_password: '', password: '', password_confirmation: '' });
      setEditPwd(false);
      setSuccess(fr ? 'Mot de passe modifié avec succès.' : 'Password changed successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e?.response?.data?.message || (fr ? 'Erreur lors du changement de mot de passe.' : 'Password change error.'));
    } finally { setSavingPwd(false); }
  };

  const isSuper = admin?.role === 'super_admin';
  const inp = { backgroundColor: colors.input, border: `1px solid ${colors.border}`, borderRadius: 11, padding: '11px 13px', color: colors.text, fontSize: 13.5, outline: 'none', width: '100%', boxSizing: 'border-box' };
  const card = { backgroundColor: colors.card, borderRadius: 20, border: `1px solid ${colors.border}`, overflow: 'hidden' };
  const btnGhost = { backgroundColor: colors.card2, border: `1px solid ${colors.border}`, borderRadius: 9, padding: '7px 14px', fontSize: 12, color: colors.text, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 };
  const btnRed = { backgroundColor: colors.red, border: 'none', borderRadius: 9, padding: '7px 14px', fontSize: 12, color: '#FFFFFF', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 };

  return (
    <div style={{ animation: 'fadeUp 0.35s ease both', maxWidth: 760 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 800, letterSpacing: -0.6, color: colors.text }}>
          {fr ? 'Mon Profil' : 'My Profile'}
        </h1>
        <p style={{ fontSize: 13.5, color: colors.muted, marginTop: 4 }}>
          {fr ? 'Gérez vos informations personnelles et vos identifiants de connexion' : 'Manage your personal information and login credentials'}
        </p>
      </div>

      {error && (
        <div style={{ backgroundColor: 'rgba(196,58,47,0.10)', border: '1px solid rgba(196,58,47,0.30)', borderRadius: 12, padding: '12px 16px', color: colors.redInk, fontSize: 13.5, marginBottom: 16 }}>{error}</div>
      )}
      {success && (
        <div style={{ backgroundColor: 'rgba(34,160,107,0.10)', border: '1px solid rgba(34,160,107,0.32)', borderRadius: 12, padding: '12px 16px', color: colors.greenInk, fontSize: 13.5, marginBottom: 16, fontWeight: 600 }}>✓ {success}</div>
      )}

      {/* CARTE HÉROS — panneau crème, données réelles du compte */}
      <div style={{ backgroundColor: colors.panel, color: colors.panelInk, borderRadius: 20, padding: 22, border: `1px solid ${colors.panelBorder}`, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: colors.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: '#FFFFFF', fontFamily: DISPLAY }}>
          {admin?.nom?.charAt(0)}{admin?.prenom?.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 800 }}>{admin?.prenom} {admin?.nom}</div>
          <div style={{ fontSize: 13, color: colors.panelMuted, marginTop: 2 }}>{admin?.email}</div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, fontSize: 11, backgroundColor: 'rgba(196,58,47,0.12)', color: colors.red, padding: '4px 11px', borderRadius: 999, fontWeight: 700 }}>
            <Shield size={11} />
            {isSuper ? (fr ? 'Super Administrateur' : 'Super Administrator') : (fr ? 'Administrateur' : 'Administrator')}
          </span>
        </div>
      </div>

      {/* INFORMATIONS PERSONNELLES — PUT /admin/profil */}
      <div style={{ ...card, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: `1px solid ${colors.border}` }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: DISPLAY, fontSize: 15, fontWeight: 800, color: colors.text }}>
            <User size={15} color={colors.muted} /> {fr ? 'Informations personnelles' : 'Personal information'}
          </span>
          {!editInfo ? (
            <button onClick={() => { setEditInfo(true); setError(''); }} style={btnGhost}>{fr ? 'Modifier' : 'Edit'}</button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setEditInfo(false); setError(''); setForm({ nom: admin.nom, prenom: admin.prenom, email: admin.email }); }} style={{ ...btnGhost, color: colors.muted }}>
                <X size={13} /> {fr ? 'Annuler' : 'Cancel'}
              </button>
              <button onClick={handleSaveInfo} disabled={saving} style={{ ...btnRed, opacity: saving ? 0.7 : 1 }}>
                <Check size={13} /> {saving ? (fr ? 'Enregistrement…' : 'Saving…') : (fr ? 'Enregistrer' : 'Save')}
              </button>
            </div>
          )}
        </div>
        <div style={{ padding: '18px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { key: 'prenom', label: fr ? 'Prénom' : 'First name', placeholder: 'Jean-Baptiste' },
            { key: 'nom', label: fr ? 'Nom' : 'Last name', placeholder: 'ANGO' },
          ].map(f => (
            <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 11.5, color: colors.muted, fontWeight: 600 }}>{f.label}</label>
              {editInfo ? (
                <input style={inp} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
              ) : (
                <div style={{ fontSize: 14.5, fontWeight: 600, color: colors.text, padding: '8px 0' }}>{admin?.[f.key] || '—'}</div>
              )}
            </div>
          ))}
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 11.5, color: colors.muted, fontWeight: 600 }}>{fr ? 'Adresse email' : 'Email address'}</label>
            {editInfo ? (
              <input style={inp} type="email" placeholder="admin@iuctrack.cm" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            ) : (
              <div style={{ fontSize: 14.5, fontWeight: 600, color: colors.text, padding: '8px 0' }}>{admin?.email || '—'}</div>
            )}
          </div>
        </div>
      </div>

      {/* SÉCURITÉ — PUT /admin/profil/password */}
      <div style={{ ...card, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: editPwd ? `1px solid ${colors.border}` : 'none' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: DISPLAY, fontSize: 15, fontWeight: 800, color: colors.text }}>
            <Shield size={15} color={colors.muted} /> {fr ? 'Sécurité — Mot de passe' : 'Security — Password'}
          </span>
          {!editPwd ? (
            <button onClick={() => { setEditPwd(true); setError(''); }} style={btnGhost}>{fr ? 'Modifier' : 'Edit'}</button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setEditPwd(false); setError(''); setPwdForm({ current_password: '', password: '', password_confirmation: '' }); }} style={{ ...btnGhost, color: colors.muted }}>
                <X size={13} /> {fr ? 'Annuler' : 'Cancel'}
              </button>
              <button onClick={handleSavePwd} disabled={savingPwd} style={{ ...btnRed, opacity: savingPwd ? 0.7 : 1 }}>
                <Check size={13} /> {savingPwd ? (fr ? 'Enregistrement…' : 'Saving…') : (fr ? 'Enregistrer' : 'Save')}
              </button>
            </div>
          )}
        </div>
        {editPwd ? (
          <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { key: 'current_password', label: fr ? 'Mot de passe actuel' : 'Current password', placeholder: fr ? 'Votre mot de passe actuel' : 'Your current password' },
              { key: 'password', label: fr ? 'Nouveau mot de passe' : 'New password', placeholder: fr ? 'Minimum 6 caractères' : 'At least 6 characters' },
              { key: 'password_confirmation', label: fr ? 'Confirmer le nouveau mot de passe' : 'Confirm new password', placeholder: fr ? 'Répétez le nouveau mot de passe' : 'Repeat the new password' },
            ].map(f => (
              <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11.5, color: colors.muted, fontWeight: 600 }}>{f.label}</label>
                <div style={{ position: 'relative' }}>
                  <input style={{ ...inp, paddingRight: 44 }} type={showPwd ? 'text' : 'password'} placeholder={f.placeholder}
                    value={pwdForm[f.key]} onChange={e => setPwdForm({ ...pwdForm, [f.key]: e.target.value })} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: colors.muted, display: 'flex' }}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '0 20px 16px' }}>
            <div style={{ fontSize: 14, color: colors.muted, letterSpacing: 2 }}>••••••••••••</div>
          </div>
        )}
      </div>

      {/* COMPTE — lecture seule */}
      <div style={{ backgroundColor: colors.card, borderRadius: 20, border: `1px solid ${colors.border}`, padding: '18px 20px' }}>
        <div style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: colors.muted, fontWeight: 700, marginBottom: 12 }}>
          {fr ? 'Informations du compte' : 'Account information'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: fr ? 'Identifiant' : 'ID', val: `#${admin?.id}` },
            { label: fr ? 'Rôle' : 'Role', val: isSuper ? (fr ? 'Super Administrateur' : 'Super Administrator') : (fr ? 'Administrateur' : 'Administrator') },
          ].map((item, i) => (
            <div key={i} style={{ backgroundColor: colors.card2, borderRadius: 12, padding: '12px 15px' }}>
              <div style={{ fontSize: 10.5, color: colors.muted, marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>{item.val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
