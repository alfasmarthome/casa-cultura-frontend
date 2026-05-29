import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function PublicCalendarPage() {
  const [events, setEvents] = useState([]);
  const [spaces, setSpaces] = useState([]);

  useEffect(() => { loadSpaces(); }, []);

  const loadSpaces = async () => {
    try {
      const { data } = await api.get('/public/spaces');
      setSpaces(data);
    } catch {}
  };

  const loadReservations = useCallback(async (start, end) => {
    try {
      const startDate = start.toISOString().split('T')[0];
      const endDate = end.toISOString().split('T')[0];
      const [resRes, blockedRes] = await Promise.all([
        api.get('/public/reservations?startDate=' + startDate + '&endDate=' + endDate),
        api.get('/public/blocked-dates')
      ]);
      const spaceColorMap = {};
      spaces.forEach(s => { spaceColorMap[s.id] = s.color; });
      const calEvents = resRes.data.map(r => ({
        id: r.id,
        title: r.eventName,
        start: r.date + 'T' + r.startTime,
        end: r.date + 'T' + r.endTime,
        backgroundColor: spaceColorMap[r.spaceId] || '#1a56db',
        borderColor: spaceColorMap[r.spaceId] || '#1a56db',
        extendedProps: { spaceName: spaces.find(s => s.id === r.spaceId)?.name }
      }));
      const blockedEvents = blockedRes.data
        .filter(b => b.date >= startDate && b.date <= endDate)
        .map(b => ({ id: 'blocked-' + b.id, title: 'Bloqueado: ' + b.reason, start: b.date, allDay: true, backgroundColor: '#6b7280', borderColor: '#4b5563', display: 'background' }));
      setEvents([...calEvents, ...blockedEvents]);
    } catch {}
  }, [spaces]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      <header className='public-header'>
        <div>
          <h1>Casa de Cultura Ipiales</h1>
          <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>Disponibilidad de espacios</p>
        </div>
        <Link to='/login'>Acceso personal</Link>
      </header>
      <div className='public-content'>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {spaces.map(s => (
            <span key={s.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--gray-600)', padding: '4px 10px', background: 'white', border: '1px solid var(--gray-200)', borderRadius: 99 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />
              {s.name}
            </span>
          ))}
        </div>
        <div className='card'>
          <div className='card-body' style={{ padding: 16 }}>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin]}
              initialView='dayGridMonth'
              headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' }}
              events={events}
              datesSet={info => loadReservations(info.start, info.end)}
              height='auto'
              eventDisplay='block'
              dayMaxEvents={5}
              locale='es'
            />
          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--gray-400)', marginTop: 16 }}>
          Para hacer una reserva contacta al personal de la Casa de Cultura Ipiales.
        </p>
      </div>
    </div>
  );
}
