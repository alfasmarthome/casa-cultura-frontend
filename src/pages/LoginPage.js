import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: 52, height: 52, background: 'var(--primary)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 22 }}>???</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--gray-900)' }}>Casa de Cultura</h1>
          <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>Ipiales - Sistema de Gestion</p>
        </div>
        <div className='card'>
          <div className='card-body'>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Iniciar sesion</h2>
            {error && <div className='alert alert-error'>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className='form-group'>
                <label className='form-label'>Correo electronico</label>
                <input className='form-control' type='email' required value={email} onChange={e => setEmail(e.target.value)} placeholder='usuario@ejemplo.com' />
              </div>
              <div className='form-group'>
                <label className='form-label'>Contrasena</label>
                <input className='form-control' type='password' required value={password} onChange={e => setPassword(e.target.value)} placeholder='........' />
              </div>
              <button type='submit' className='btn btn-primary' disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
                {loading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>
          </div>
        </div>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--gray-400)' }}>
          <a href='/calendario-publico' style={{ color: 'var(--primary)', textDecoration: 'none' }}>Ver calendario publico</a>
        </p>
      </div>
    </div>
  );
}
