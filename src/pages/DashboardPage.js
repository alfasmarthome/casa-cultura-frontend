import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Plus, Trash2, Edit } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ReservationModal from '../components/Reservations/ReservationModal';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { isAdmin, isOperator } = useAuth();
  const [events, setEvents] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [defaultDate, setDefaultDate] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentRange, setCurrentRange] = useState({ start: '', end: '' });

  useEffect(() => { loadSpaces(); }, []);

  const loadSpaces = async () => {
    try {
      const { data } = await api.get('/spaces');
      setSpaces(data);
    } catch {}
  };

  const loadReservations = useCallback(async (start, end) => {
    try {
      const startDate = start.toISOString().split('T')[0];
      const endDate = end.toISOString().split('T')[0];
      const { data } = await api.get('/reservations?startDate=' + startDate + '&endDate=' + endDate);
      const spaceColorMap = {};
      spaces.forEach(s => { spaceColorMap[s.id] = s.color; });
      const calEvents = data.map(r => ({
        id: r.id,
        title: r.eventName,
        start: r.date + 'T' + r.startTime,
        end: r.date + 'T' + r.endTime,
        backgroundColor: spaceColorMap[r.spaceId] || '#1a56db',
        borderColor: spaceColorMap[r.spaceId] || '#1a56db',
        extendedProps: { ...r, spaceName: spaces.find(s => s.id === r.spaceId)?.name }
      }));
      setEvents(calEvents);
      setCurrentRange({ start: startDate, end: endDate });
    } catch {}
  }, [spaces]);

  const handleDateClick = (info) => {
    if (!isOperator) return;
    setDefaultDate(info.dateStr);
    setSelectedReservation(null);
    setSelectedEvent(null);
    setShowModal(true);
  };

  const handleEventClick = (info) => {
    setSelectedEvent(info.event.extendedProps);
    setShowModal(false);
  };

  const handleEditEvent = () => {
    setSelectedReservation(selectedEvent);
    setShowModal(true);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm('Eliminar la reserva ' + selectedEvent.eventName + '?')) return;
    try {
      await api.delete('/reservations/' + selectedEvent.id);
      toast.success('Reserva eliminada');
      setSelectedEvent(null);
      loadReservations(new Date(currentRange.start), new Date(currentRange.end));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al eliminar');
    }
  };

  return (
    <div>
      <div className='page-header'>
        <div>
          <h1 className='page-title'>Calendario de reservas</h1>
          <p className='page-subtitle'>Gestion de espacios - Casa de Cultura Ipiales</p>
        </div>
        {isOperator && (
          <button className='btn btn-primary' onClick={() => { setSelectedReservation(null); setDefaultDate(new Date().toISOString().split('T')[0]); setShowModal(true); }}>
            <Plus size={15} /> Nueva reserva
          </button>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {spaces.map(s => (
          <span key={s.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--gray-600)', padding: '4px 10px', background: 'white', border: '1px solid var(--gray-200)', borderRadius: 99 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            {s.name}
          </span>
        ))}
      </div>
      <div className='card'>
        <div className='card-body' style={{ padding: 16 }}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView='dayGridMonth'
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
            buttonText={{ today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día' }}
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            datesSet={info => loadReservations(info.start, info.end)}
            height='auto'
            eventDisplay='block'
            dayMaxEvents={4}
            locale='es'
          />
        </div>
      </div>
      {selectedEvent && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 200, background: 'white', border: '1px solid var(--gray-200)', borderRadius: 12, padding: '16px 20px', boxShadow: 'var(--shadow-lg)', minWidth: 280, maxWidth: 340 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <strong style={{ fontSize: 14 }}>{selectedEvent.eventName}</strong>
            <button onClick={() => setSelectedEvent(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: 2 }}>X</button>
          </div>
          <div style={{ fontSize: 13, color: 'var(--gray-600)', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span>Espacio: {selectedEvent.spaceName || selectedEvent.spaceId}</span>
            <span>Fecha: {selectedEvent.date} - {selectedEvent.startTime} a {selectedEvent.endTime}</span>
            <span>Responsable: {selectedEvent.responsible}</span>
            <span>Contacto: {selectedEvent.contact}</span>
            {selectedEvent.confirmationCode && <span style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 700 }}>{selectedEvent.confirmationCode}</span>}
          </div>
          {isOperator && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className='btn btn-secondary btn-sm' onClick={handleEditEvent}><Edit size={13} /> Editar</button>
              {isAdmin && <button className='btn btn-danger btn-sm' onClick={handleDeleteEvent}><Trash2 size={13} /> Eliminar</button>}
            </div>
          )}
        </div>
      )}
      {showModal && (
        <ReservationModal
          reservation={selectedReservation}
          spaces={spaces}
          defaultDate={defaultDate}
          onClose={() => { setShowModal(false); setSelectedReservation(null); }}
          onSaved={() => { loadReservations(new Date(currentRange.start), new Date(currentRange.end)); }}
          //onSaved={() => { setShowModal(false); setSelectedReservation(null); loadReservations(new Date(currentRange.start), new Date(currentRange.end)); }}
        />
      )}
    </div>
  );
}
