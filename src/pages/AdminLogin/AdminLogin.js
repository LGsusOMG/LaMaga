// src/pages/Admin/AdminLogin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../data/supabaseClient';
import './AdminLogin.scss';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Iniciar sesión con Supabase Auth
      const { error: authError } = await supabase.auth.signInWithPassword({ // ← Eliminado authData no usado
        email: email.trim(),
        password: password
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Credenciales incorrectas o usuario no registrado');
        }
        throw authError;
      }

      // 2. Verificar si el usuario está en la tabla de administradores
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email.trim())
        .single();

      if (adminError || !adminData) {
        await supabase.auth.signOut();
        throw new Error('No tienes permisos de administrador');
      }

      // 3. Login exitoso
      console.log('✅ Login exitoso como administrador');
      navigate('/admin/dashboard');

    } catch (error) {
      console.error('❌ Error en login:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!email || !password) {
      setError('Email y contraseña son requeridos');
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ Crear usuario en Auth
      const { error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });
      if (authError) throw authError;

      // 2️⃣ Verificar si ya existe en la tabla 'admins'
      const { data: existingAdmin, error: fetchError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email.trim())
        .single();

      if (existingAdmin) {
        setError('⚠️ Ya existe un administrador con ese correo.');
        return;
      }

      // 3️⃣ Si no existe, insertarlo
      const { error: adminError } = await supabase
        .from('admins')
        .insert([{ email: email.trim() }]);
      if (adminError) throw adminError;

      setError('✅ Usuario administrador creado. Ahora puedes iniciar sesión.');
    } catch (error) {
      setError('Error creando administrador: ' + error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="admin-login">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h2>Panel de Administración</h2>
            <p>Abarrote LaMaga </p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@lamaga.com"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña:</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                disabled={loading}
                minLength="6"
              />
            </div>

            {error && (
              <div className={`error-message ${error.includes('✅') ? 'success' : ''}`}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="login-btn"
            >
              {loading ? '🔐 Iniciando sesión...' : '🚀 Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;