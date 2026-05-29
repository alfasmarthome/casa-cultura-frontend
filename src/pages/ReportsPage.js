import React, { useState } from 'react';
import { Download, BarChart2 } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const today = new Date();
  const firstDay = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-01';
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const lastDayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(lastDay.getDate()).padStart(2, '0');

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDayStr);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [monthYear, setMonthYear] = useState(today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0'));

  const handleExport = async () => {
    setLoadingExport(true);
    try {
      const response = await api.get('/reports/export?startDate=' + startDate + '&endDate=' + endDate, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reservas_' + startDate + '_' + endDate + '.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Archivo descargado');
    } catch { toast.error('Error al exportar'); }
    finally { setLoadingExport(false); }
  };

  const handleMonthlySummary = async () => {
    const [year, month] = monthYear.split('-');
    setLoadingSummary(true);
    try {
      const { data } = await api.get('/reports/monthly?year=' + year + '&month=' + month);
      setMonthlySummary(data);
    } catch { toast.error('Error al cargar resumen'); }
    finally { setLoadingSummary(false); }
  };

  return (
    <div>
      <div className='page-header'>
        <div>
          <h1 className='page-title'>Reportes</h1>
          <p className='page-subtitle'>Exportacion y analisis de reservas</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className='card'>
          <div className='card-header'><span style={{ fontWeight: 700 }}>Exportar a Excel</span></div>
          <div className='card-body'>
            <div className='form-group'>
              <label className='form-label'>Desde</label>
              <input className='form-control' type='date' value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className='form-group'>
              <label className='form-label'>Hasta</label>
              <input className='form-control' type='date' value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <button className='btn btn-primary' onClick={handleExport} disabled={loadingExport} style={{ width: '100%', justifyContent: 'center' }}>
              <Download size={14} /> {loadingExport ? 'Descargando...' : 'Descargar Excel'}
            </button>
          </div>
        </div>
        <div className='card'>
          <div className='card-header'><span style={{ fontWeight: 700 }}>Resumen mensual</span></div>
          <div className='card-body'>
            <div className='form-group'>
              <label className='form-label'>Mes</label>
              <input className='form-control' type='month' value={monthYear} onChange={e => setMonthYear(e.target.value)} />
            </div>
            <button className='btn btn-secondary' onClick={handleMonthlySummary} disabled={loadingSummary} style={{ width: '100%', justifyContent: 'center', marginBottom: 16 }}>
              <BarChart2 size={14} /> {loadingSummary ? 'Cargando...' : 'Ver resumen'}
            </button>
            {monthlySummary && (
              <div>
                <div style={{ background: 'var(--primary-light)', borderRadius: 8, padding: '12px 16px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-dark)' }}>Total reservas</span>
                  <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>{monthlySummary.total}</span>
                </div>
                <table style={{ width: '100%', fontSize: 13 }}>
                  <thead><tr>
                    <th style={{ textAlign: 'left', padding: '6px 0', fontSize: 11, color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>Espacio</th>
                    <th style={{ textAlign: 'right', padding: '6px 0', fontSize: 11, color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>Reservas</th>
                  </tr></thead>
                  <tbody>
                    {Object.entries(monthlySummary.bySpace).sort((a, b) => b[1] - a[1]).map(([name, count]) => (
                      <tr key={name}>
                        <td style={{ padding: '6px 0', borderBottom: '1px solid var(--gray-100)' }}>{name}</td>
                        <td style={{ textAlign: 'right', padding: '6px 0', fontWeight: 600, borderBottom: '1px solid var(--gray-100)' }}>{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
