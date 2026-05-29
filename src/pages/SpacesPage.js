import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const PRESET_COLORS = ['#1a56db','#057a55','#d97706','#e02424','#7e3af2','#0694a2','#e74694','#3f83f8','#31c48d','#f98080'];

export default function SpacesPage() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', color: '#1a56db', capacity: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadSpaces(); }, []);

  const loadSpaces = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/spaces');
      setSpaces(data);
    } catch { toast.error('Error al cargar espacios'); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '', color: PRESET_COLORS[0], capacity: '' }); setError(''); setShowModal(true); };
  const openEdit = (space) => { setEditing(space); setForm({ name: space.name, description: space.description || '', color: space.color, capacity: space.capacity || '' }); setError(''); setShowModal(true); };

  const handleDelete = async (space) => {
    if (!window.confirm('Desactivar el espacio ' + space.name + '?')) return;
    try {
      await api.delete('/spaces/' + space.id);
      toast.success('Espacio desactivado');
      loadSpaces();
    } catch (err) { toast.error(err.response?.data?.error || 'Error al eliminar'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editing) { await api.put('/spaces/' + editing.id, { ...form, capacity: form.capacity || null }); toast.success('Espacio actualizado'); }
      else { await api.post('/spaces', { ...form, capacity: form.capacity || null }); toast.success('Espacio creado'); }
      setShowModal(false);
      loadSpaces();
    } catch (err) { setError(err.response?.data?.error || 'Error al guardar'); }
    finally { setSaving(false); }
  };

  const set = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  return (
    <div>
      <div className='page-header'>
        <div>
          <h1 className='page-title'>Espacios</h1>
          <p className='page-subtitle'>Configuracion de espacios disponibles para reserva</p>
        </div>
        <button className='btn btn-primary' onClick={openCreate}><Plus size={15} /> Nuevo espacio</button>
      </div>
      <div className='card'>
        {loading ? <div className='loading-inline'><div className='spinner' /></div> : (
          <div className='table-wrapper'>
            <table>
              <thead><tr><th>Espacio</th><th>Descripcion</th><th>Capacidad</th><th>Color</th><th></th></tr></thead>
              <tbody>
                {spaces.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 12, height: 12, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                        {s.name}
                      </div>
                    </td>
                    <td style={{ color: 'var(--gray-500)' }}>{s.description || '-'}</td>
                    <td>{s.capacity || '-'}</td>
                    <td><code style={{ fontSize: 11, color: 'var(--gray-500)' }}>{s.color}</code></td>
                    <td><div style={{ display: 'flex', gap: 6 }}>
                      <button className='btn btn-secondary btn-sm' onClick={() => openEdit(s)}><Edit size={13} /></button>
                      <button className='btn btn-danger btn-sm' onClick={() => handleDelete(s)}><Trash2 size={13} /></button>
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
              <span className='modal-title'>{editing ? 'Editar espacio' : 'Nuevo espacio'}</span>
              <button className='modal-close' onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className='modal-body'>
                {error && <div className='alert alert-error'>{error}</div>}
                <div className='form-group'>
                  <label className='form-label'>Nombre del espacio *</label>
                  <input className='form-control' required value={form.name} onChange={e => set('name', e.target.value)} placeholder='Ej: Sala de exposiciones' />
                </div>
                <div className='form-group'>
                  <label className='form-label'>Descripcion</label>
                  <input className='form-control' value={form.description} onChange={e => set('description', e.target.value)} placeholder='Descripcion opcional' />
                </div>
                <div className='form-row'>
                  <div className='form-group'>
                    <label className='form-label'>Capacidad (personas)</label>
                    <input className='form-control' type='number' min={1} value={form.capacity} onChange={e => set('capacity', e.target.value)} placeholder='Opcional' />
                  </div>
                  <div className='form-group'>
                    <label className='form-label'>Color en calendario</label>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                      {PRESET_COLORS.map(c => (
                        <button key={c} type='button' onClick={() => set('color', c)} style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer', outline: form.color === c ? '3px solid ' + c : 'none', outlineOffset: 2 }} />
                      ))}
                    </div>
                  </div>
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
