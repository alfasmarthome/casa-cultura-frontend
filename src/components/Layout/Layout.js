import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Users, Building2, History, Ban, BarChart2, LogOut, Globe } from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout, isAdmin, isOperator } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className='layout'>
      <aside className='sidebar'>
        <div className='sidebar-logo'>
          <h1>Casa de Cultura</h1>
          <span>Ipiales - Gestion</span>
        </div>
        <nav className='sidebar-nav'>
          <NavLink to='/dashboard' className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
            <Calendar size={16} /> Calendario
          </NavLink>
          <a href='/calendario-publico' target='_blank' rel='noreferrer' className='nav-item'>
            <Globe size={16} /> Vista publica
          </a>
          {isAdmin && (
            <>
              <div className='nav-label'>Administracion</div>
              <NavLink to='/usuarios' className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
                <Users size={16} /> Usuarios
              </NavLink>
              <NavLink to='/espacios' className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
                <Building2 size={16} /> Espacios
              </NavLink>
              <NavLink to='/fechas-bloqueadas' className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
                <Ban size={16} /> Fechas bloqueadas
              </NavLink>
            </>
          )}
          {isOperator && (
            <>
              <div className='nav-label'>Consultas</div>
              <NavLink to='/historial' className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
                <History size={16} /> Historial
              </NavLink>
              <NavLink to='/reportes' className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
                <BarChart2 size={16} /> Reportes
              </NavLink>
            </>
          )}
        </nav>
        <div className='sidebar-user'>
          <div className='user-avatar'>{user?.name?.[0]?.toUpperCase()}</div>
          <div className='user-info'>
            <div className='user-name'>{user?.name}</div>
            <div className='user-role'>{user?.role}</div>
          </div>
          <button className='logout-btn' onClick={handleLogout} title='Cerrar sesion'>
            <LogOut size={15} />
          </button>
        </div>
      </aside>
      <main className='main-content'>{children}</main>
    </div>
  );
}
