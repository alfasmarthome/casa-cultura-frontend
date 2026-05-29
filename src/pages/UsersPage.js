import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'operator', active: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch { toast.error('Error al cargar usuarios'); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setForm({ name: '', email: '', password: '', role: 'operator', active: true }); setError(''); setShowModal(true); };
  const openEdit = (user) => { setEditing(user); setForm({ name: user.name, email: user.email, password: '', role: user.role, active: user.active }); setError(''); setShowModal(true); };

  const handleDelete = async (user) => {
    if (!window.confirm('Eliminar el usuario ' + user.name + '?')) return;
    try {
      await api.delete('/users/' + user.uid);
      toast.success('Usuario eliminado');
      loadUsers();
    } catch (err) { toast.error(err.response?.data?.error || 'Error al eliminar'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editing) { await api.put('/users/' + editing.uid, form); toast.success('Usuario actualizado'); }
      else { await api.post('/users', form); toast.success('Usuario creado'); }
      setShowModal(false);
      loadUsers();
    } catch (err) { setError(err.response?.data?.error || 'Error al guardar'); }
    finally { setSaving(false); }
  };

  const set = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  return (
    <div>
      <div className='page-header'>
        <div>
          <h1 className='page-title'>Usuarios</h1>
          <p className='page-subtitle'>Administracion de accesos al sistema</p>
        </div>
        <button className='btn btn-primary' onClick={openCreate}><Plus size={15} /> Nuevo usuario</button>
      </div>
      <div className='card'>
        {loading ? <div className='loading-inline'><div className='spinner' /></div> : (
          <div className='table-wrapper'>
            <table>
              <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.uid}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td style={{ color: 'var(--gray-500)' }}>{u.email}</td>
                    <td><span className={'badge ' + (u.role === 'admin' ? 'badge-blue' : 'badge-gray')}>{u.role}</span></td>
                    <td><span className={'badge ' + (u.active ? 'badge-green' : 'badge-red')}>{u.active ? 'Activo' : 'Inactivo'}</span></td>
                    <td><div style={{ display: 'flex', gap: 6 }}>
                      <button className='btn btn-secondary btn-sm' onClick={() => openEdit(u)}><Edit size={13} /></button>
                      <button className='btn btn-danger btn-sm' onClick={() => handleDelete(u)}><Trash2 size={13} /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showModal && (
        <div className='modal-overlay'>
          <div className='modal'>
            <div className='modal-header'>
              <span className='modal-title'>{editing ? 'Editar usuario' : 'Nuevo usuario'}</span>
              <button className='modal-close' onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className='modal-body'>
                {error && <div className='alert alert-error'>{error}</div>}
                <div className='form-group'>
                  <label className='form-label'>Nombre completo *</label>
                  <input className='form-control' required value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div className='form-group'>
                  <label className='form-label'>Email *</label>
                  <input className='form-control' type='email' required value={form.email} onChange={e => set('email', e.target.value)} disabled={!!editing} />
                </div>
                <div className='form-group'>
                  <label className='form-label'>{editing ? 'Nueva contrasena (dejar vacio para no cambiar)' : 'Contrasena *'}</label>
                  <input className='form-control' type='password' required={!editing} minLength={6} value={form.password} onChange={e => set('password', e.target.value)} placeholder='Minimo 6 caracteres' />
                </div>
                <div className='form-row'>
                  <div className='form-group'>
                    <label className='form-label'>Rol *</label>
                    <select className='form-control' value={form.role} onChange={e => set('role', e.target.value)}>
                      <option value='operator'>Operador</option>
                      <option value='admin'>Administrador</option>
                    </select>
                  </div>
                  {editing && (
                    <div className='form-group'>
                      <label className='form-label'>Estado</label>
                      <select className='form-control' value={form.active} onChange={e => set('active', e.target.value === 'true')}>
                        <option value='true'>Activo</option>
                        <option value='false'>Inactivo</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
              <div className='modal-footer'>
                <button type='button' className='btn btn-secondary' onClick={() => setShowModal(false)}>Cancelar</button>
                <button type='submit' className='btn btn-primary' disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
