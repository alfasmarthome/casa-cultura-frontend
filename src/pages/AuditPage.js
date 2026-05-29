import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const ACTION_LABELS = {
  CREATE_RESERVATION: { label: 'Creo reserva', color: 'badge-green' },
  UPDATE_RESERVATION: { label: 'Edito reserva', color: 'badge-yellow' },
  DELETE_RESERVATION: { label: 'Elimino reserva', color: 'badge-red' },
  CREATE_USER: { label: 'Creo usuario', color: 'badge-blue' },
  UPDATE_USER: { label: 'Edito usuario', color: 'badge-yellow' },
  DELETE_USER: { label: 'Elimino usuario', color: 'badge-red' },
  CREATE_SPACE: { label: 'Creo espacio', color: 'badge-blue' },
  UPDATE_SPACE: { label: 'Edito espacio', color: 'badge-yellow' },
  DELETE_SPACE: { label: 'Elimino espacio', color: 'badge-red' },
  BLOCK_DATE: { label: 'Bloqueo fecha', color: 'badge-yellow' },
  UNBLOCK_DATE: { label: 'Desbloqueo fecha', color: 'badge-green' },
};

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/audit?limit=200')
      .then(({ data }) => setLogs(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className='page-header'>
        <div>
          <h1 className='page-title'>Historial de cambios</h1>
          <p className='page-subtitle'>Registro de todas las acciones realizadas en el sistema</p>
        </div>
      </div>
      <div className='card'>
        {loading ? <div className='loading-inline'><div className='spinner' /></div> : (
          <div className='table-wrapper'>
            <table>
              <thead><tr><th>Fecha y hora</th><th>Accion</th><th>Realizada por</th><th>Detalle</th></tr></thead>
              <tbody>
                {logs.map(log => {
                  const action = ACTION_LABELS[log.action] || { label: log.action, color: 'badge-gray' };
                  return (
                    <tr key={log.id}>
                      <td style={{ color: 'var(--gray-500)', whiteSpace: 'nowrap', fontSize: 12 }}>{new Date(log.timestamp).toLocaleString('es-CO')}</td>
                      <td><span className={'badge ' + action.color}>{action.label}</span></td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{log.performedBy?.name}</div>
                        <div style={{ color: 'var(--gray-400)', fontSize: 11 }}>{log.performedBy?.role}</div>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                        {log.details?.eventName && <span>{log.details.eventName} </span>}
                        {log.details?.date && <span>{log.details.date} </span>}
                        {log.details?.name && !log.details.eventName && <span>{log.details.name} </span>}
                        {log.details?.email && <span>{log.details.email}</span>}
                      </td>
                    </tr>
                  );
                })}
                {logs.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px' }}>No hay registros de actividad aun.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
