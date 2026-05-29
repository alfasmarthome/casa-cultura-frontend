import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ReservationModal({ reservation, spaces, defaultDate, onClose, onSaved }) {
  const isEdit = !!reservation;
  const [form, setForm] = useState({ eventName: '', responsible: '', contact: '', spaceId: '', date: defaultDate || '', startTime: '', endTime: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrData, setQrData] = useState(null);

  useEffect(() => { if (reservation) setForm({ ...reservation }); }, [reservation]);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        await api.put('/reservations/' + reservation.id, form);
        toast.success('Reserva actualizada');
        onSaved();
      } else {
        const { data } = await api.post('/reservations', form);
        setQrData(data);
        toast.success('Reserva creada exitosamente');
        onSaved();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar la reserva');
    } finally {
      setLoading(false);
    }
  };

  if (qrData) {
    return (
      <div className='modal-overlay'>
        <div className='modal' style={{ maxWidth: 420 }}>
          <div className='modal-header'>
            <span className='modal-title'>✅ Reserva confirmada</span>
            <button className='modal-close' onClick={onClose}><X size={18} /></button>
          </div>
          <div className='modal-body'>
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              {qrData.qrCode && (
                <img src={qrData.qrCode} alt='Codigo QR' style={{ width: 180, height: 180, margin: '0 auto 12px', display: 'block' }} />
              )}
              <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 6 }}>Codigo de confirmacion</p>
              <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em', marginBottom: 16 }}>
                {qrData.confirmationCode}
              </div>
              <div style={{ fontSize: 13, color: 'var(--gray-600)', textAlign: 'left', background: 'var(--gray-50)', padding: '12px', borderRadius: 8 }}>
                <strong>{qrData.eventName}</strong><br />
                📅 {qrData.date} · {qrData.startTime} – {qrData.endTime}<br />
                👤 {qrData.responsible}<br />
                📞 {qrData.contact}
              </div>
            </div>
          </div>
          <div className='modal-footer'>
            <button className='btn btn-primary' onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='modal-overlay'>
      <div className='modal'>
        <div className='modal-header'>
          <span className='modal-title'>{isEdit ? 'Editar reserva' : 'Nueva reserva'}</span>
          <button className='modal-close' onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className='modal-body'>
            {error && <div className='alert alert-error'>{error}</div>}
            <div className='form-group'>
              <label className='form-label'>Nombre del evento *</label>
              <input className='form-control' required value={form.eventName} onChange={e => set('eventName', e.target.value)} placeholder='Ej: Taller de pintura' />
            </div>
            <div className='form-row'>
              <div className='form-group'>
                <label className='form-label'>Responsable *</label>
                <input className='form-control' required value={form.responsible} onChange={e => set('responsible', e.target.value)} placeholder='Nombre completo' />
              </div>
              <div className='form-group'>
                <label className='form-label'>Contacto *</label>
                <input className='form-control' required value={form.contact} onChange={e => set('contact', e.target.value)} placeholder='Telefono o email' />
              </div>
            </div>
            <div className='form-group'>
              <label className='form-label'>Espacio *</label>
              <select className='form-control' required value={form.spaceId} onChange={e => set('spaceId', e.target.value)}>
                <option value=''>Seleccionar espacio...</option>
                {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className='form-group'>
              <label className='form-label'>Fecha *</label>
              <input className='form-control' type='date' required value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
            <div className='form-row'>
              <div className='form-group'>
                <label className='form-label'>Hora inicio *</label>
                <input className='form-control' type='time' required value={form.startTime} onChange={e => set('startTime', e.target.value)} />
              </div>
              <div className='form-group'>
                <label className='form-label'>Hora fin *</label>
                <input className='form-control' type='time' required value={form.endTime} onChange={e => set('endTime', e.target.value)} />
              </div>
            </div>
            <div className='form-group'>
              <label className='form-label'>Notas (opcional)</label>
              <textarea className='form-control' rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder='Observaciones adicionales...' />
            </div>
          </div>
          <div className='modal-footer'>
            <button type='button' className='btn btn-secondary' onClick={onClose}>Cancelar</button>
            <button type='submit' className='btn btn-primary' disabled={loading}>{loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear reserva'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}