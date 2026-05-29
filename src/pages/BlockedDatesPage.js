import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function BlockedDatesPage() {
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadDates(); }, []);

  const loadDates = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/blocked-dates');
      setDates(data);
    } catch {} finally { setLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!date) return;
    setSaving(true);
    try {
      await api.post('/blocked-dates', { date, reason });
      toast.success('Fecha bloqueada');
      setDate(''); setReason('');
      loadDates();
    } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, d) => {
    if (!window.confirm('Desbloquear la fecha ' + d + '?')) return;
    try {
      await api.delete('/blocked-dates/' + id);
      toast.success('Fecha desbloqueada');
      loadDates();
    } catch { toast.error('Error al desbloquear'); }
  };

  return (
    <div>
      <div className='page-header'>
        <div>
          <h1 className='page-title'>Fechas bloqueadas</h1>
          <p className='page-subtitle'>Bloquear fechas para mantenimiento u otros eventos</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>
        <div className='card'>
          <div className='card-header'><span style={{ fontWeight: 700 }}>Bloquear nueva fecha</span></div>
          <div className='card-body'>
            <form onSubmit={handleAdd}>
              <div className='form-group'>
                <label className='form-label'>Fecha *</label>
                <input className='form-control' type='date' required value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className='form-group'>
                <label className='form-label'>Motivo</label>
                <input className='form-control' value={reason} onChange={e => setReason(e.target.value)} placeholder='Ej: Mantenimiento, festivo...' />
              </div>
              <button type='submit' className='btn btn-primary' disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
                <Plus size={14} /> {saving ? 'Guardando...' : 'Bloquear fecha'}
              </button>
            </form>
          </div>
        </div>
        <div className='card'>
          <div className='card-header'><span style={{ fontWeight: 700 }}>Fechas bloqueadas ({dates.length})</span></div>
          {loading ? <div className='loading-inline'><div className='spinner' /></div> : (
            <div className='table-wrapper'>
              <table>
                <thead><tr><th>Fecha</th><th>Motivo</th><th></th></tr></thead>
                <tbody>
                  {dates.map(d => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 600 }}>{d.date}</td>
                      <td style={{ color: 'var(--gray-500)' }}>{d.reason}</td>
                      <td><button className='btn btn-danger btn-sm' onClick={() => handleDelete(d.id, d.date)}><Trash2 size={13} /></button></td>
                    </tr>
                  ))}
                  {dates.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px' }}>No hay fechas bloqueadas.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
