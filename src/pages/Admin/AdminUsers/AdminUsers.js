// src/pages/Admin/AdminUsers/AdminUsers.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../data/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import './AdminUsers.scss';

const AdminUsers = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('admin');
  const [submitting, setSubmitting] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const navigate = useNavigate();

  const availableRoles = ['admin', 'operador'];
  const REQUIRED_ROLE_FOR_MANAGEMENT = 'superadmin';

  useEffect(() => {
    checkAuthAndLoadRole();
    loadAdmins();
  }, []);

  useEffect(() => {
    if (currentUserRole && !['superadmin', 'admin'].includes(currentUserRole)) {
      navigate('/admin/dashboard');
      alert('No tienes permisos para acceder a esta sección');
    }
  }, [currentUserRole, navigate]);

  // Validar fortaleza de contraseña en tiempo real
  useEffect(() => {
    const password = showEditModal ? editPassword : newAdminPassword;
    if (password) {
      validatePasswordStrength(password);
    } else {
      setPasswordStrength(null);
      setPasswordErrors([]);
    }
  }, [newAdminPassword, editPassword, showEditModal]);

  const validatePasswordStrength = (password) => {
    const errors = [];
    let strength = 0;

    if (password.length < 8) {
      errors.push('Debe tener al menos 8 caracteres');
    } else {
      strength += 20;
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Debe contener al menos una letra mayúscula');
    } else {
      strength += 20;
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Debe contener al menos una letra minúscula');
    } else {
      strength += 20;
    }

    if (!/\d/.test(password)) {
      errors.push('Debe contener al menos un número');
    } else {
      strength += 20;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Debe contener al menos un carácter especial (!@#$%^&*)');
    } else {
      strength += 20;
    }

    if (/(.)\1{5,}/.test(password)) {
      errors.push('No uses caracteres repetitivos');
      strength = Math.min(strength, 20);
    }

    if (/(?:0(?=1)|1(?=2)|2(?=3)|3(?=4)|4(?=5)|5(?=6)|6(?=7)|7(?=8)|8(?=9)){5,}/.test(password) ||
      /(?:9(?=8)|8(?=7)|7(?=6)|6(?=5)|5(?=4)|4(?=3)|3(?=2)|2(?=1)|1(?=0)){5,}/.test(password)) {
      errors.push('No uses secuencias numéricas');
      strength = Math.min(strength, 20);
    }

    setPasswordErrors(errors);
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (!passwordStrength) return '';
    if (passwordStrength < 40) return '#e53e3e';
    if (passwordStrength < 60) return '#ed8936';
    if (passwordStrength < 80) return '#ecc94b';
    return '#48bb78';
  };

  const getPasswordStrengthLabel = () => {
    if (!passwordStrength) return '';
    if (passwordStrength < 40) return 'Muy débil';
    if (passwordStrength < 60) return 'Débil';
    if (passwordStrength < 80) return 'Buena';
    return 'Fuerte';
  };

  const checkAuthAndLoadRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/admin/login');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('admins')
        .select('role')
        .eq('email', user.email)
        .single();

      if (error) throw error;

      if (data) {
        setCurrentUserRole(data.role);
      }
    } catch (error) {
      console.error('Error loading current user role:', error);
      alert('Error al obtener el rol. Por favor, vuelve a iniciar sesión.');
      navigate('/admin/login');
    }
  };

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdmins(data || []);
    } catch (error) {
      console.error('Error loading admins:', error);
      alert('Error al cargar administradores');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    const rolesPermitidosParaCrear = ['superadmin', 'admin'];

    if (currentUserRole === 'admin' && (newAdminRole === 'admin' || newAdminRole === 'superadmin')) {
      alert('Acceso Denegado: Como administrador, solo puedes asignar el rol de operador.');
      return;
    }

    if (!rolesPermitidosParaCrear.includes(currentUserRole)) {
      alert('Acceso Denegado: Solo los administradores o superadministradores pueden crear usuarios.');
      return;
    }

    if (!newAdminEmail || !newAdminPassword) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (passwordErrors.length > 0) {
      alert('La contraseña no cumple con los requisitos de seguridad:\n\n• ' + passwordErrors.join('\n• '));
      return;
    }

    if (passwordStrength < 60) {
      const confirm = window.confirm(
        'La contraseña es débil. Se recomienda usar una contraseña más fuerte.\n\n¿Deseas continuar de todas formas?'
      );
      if (!confirm) return;
    }

    setSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No hay sesión activa');
      }

      const { data, error } = await supabase.functions.invoke('manage-admin', {
        body: {
          action: 'create',
          email: newAdminEmail,
          password: newAdminPassword,
          role: newAdminRole
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      alert('Administrador creado exitosamente');
      setShowModal(false);
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminRole('admin');
      setPasswordStrength(null);
      setPasswordErrors([]);
      loadAdmins();
    } catch (error) {
      console.error('Error creating admin:', error);
      alert('Error al crear administrador: ' + (error.message || 'Error desconocido'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditAdmin = async (e) => {
    e.preventDefault();

    if (currentUserRole !== REQUIRED_ROLE_FOR_MANAGEMENT) {
      alert('Acceso Denegado: Solo el superadministrador puede editar usuarios.');
      return;
    }

    if (editingAdmin.role === REQUIRED_ROLE_FOR_MANAGEMENT) {
      alert('No puedes editar a un usuario con el rol de superadministrador.');
      return;
    }

    if (!editEmail) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    // Si se está cambiando la contraseña, validarla
    if (editPassword) {
      if (passwordErrors.length > 0) {
        alert('La contraseña no cumple con los requisitos de seguridad:\n\n• ' + passwordErrors.join('\n• '));
        return;
      }

      if (passwordStrength < 60) {
        const confirm = window.confirm(
          'La contraseña es débil. Se recomienda usar una contraseña más fuerte.\n\n¿Deseas continuar de todas formas?'
        );
        if (!confirm) return;
      }
    }

    setSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No hay sesión activa');
      }

      const body = {
        action: 'update',
        adminId: editingAdmin.id,
        email: editEmail,
        role: editRole
      };

      // Solo incluir password si se ingresó uno nuevo
      if (editPassword) {
        body.password = editPassword;
      }

      const { data, error } = await supabase.functions.invoke('manage-admin', {
        body,
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      alert('Administrador actualizado exitosamente');
      setShowEditModal(false);
      setEditingAdmin(null);
      setEditEmail('');
      setEditRole('');
      setEditPassword('');
      setPasswordStrength(null);
      setPasswordErrors([]);
      loadAdmins();
    } catch (error) {
      console.error('Error updating admin:', error);
      alert('Error al actualizar administrador: ' + (error.message || 'Error desconocido'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (id, email, role) => {
    if (currentUserRole !== REQUIRED_ROLE_FOR_MANAGEMENT) {
      alert('Acceso Denegado: Solo el superadministrador puede eliminar usuarios.');
      return;
    }

    if (role === REQUIRED_ROLE_FOR_MANAGEMENT) {
      alert('No puedes eliminar a un usuario con el rol de superadministrador.');
      return;
    }

    if (!window.confirm(`¿Estás seguro de eliminar al administrador "${email}"?`)) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No hay sesión activa');
      }

      const { data, error } = await supabase.functions.invoke('manage-admin', {
        body: {
          action: 'delete',
          adminId: id
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      alert('Administrador eliminado exitosamente');
      loadAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert('Error al eliminar administrador: ' + (error.message || 'Error desconocido'));
    }
  };

  const openEditModal = (admin) => {
    if (currentUserRole !== REQUIRED_ROLE_FOR_MANAGEMENT) {
      alert('Acceso Denegado: Solo el superadministrador puede editar usuarios.');
      return;
    }

    if (admin.role === REQUIRED_ROLE_FOR_MANAGEMENT) {
      alert('No puedes editar a un usuario con el rol de superadministrador.');
      return;
    }

    setEditingAdmin(admin);
    setEditEmail(admin.email);
    setEditRole(admin.role || 'admin');
    setEditPassword('');
    setPasswordStrength(null);
    setPasswordErrors([]);
    setShowEditModal(true);
  };

  const canManageAdmins = currentUserRole === REQUIRED_ROLE_FOR_MANAGEMENT;

  if (loading || currentUserRole === null) {
    return (
      <div className="admin-users">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando administradores y perfil de usuario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="admin-container">
        <div className="page-header">
          <div className="header-left">
            <Link to="/admin/dashboard" className="back-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Volver
            </Link>
            <div>
              <h1>Gestión de Administradores</h1>
              <p className="subtitle">{admins.length} administradores registrados</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
            disabled={!canManageAdmins}
            title={!canManageAdmins ? 'Solo el superadmin puede crear nuevos usuarios.' : 'Crear nuevo administrador'}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Nuevo Administrador
          </button>
        </div>

        {admins.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No hay administradores</h3>
            <p>Comienza agregando el primer administrador</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
              disabled={!canManageAdmins}
            >
              Crear Administrador
            </button>
          </div>
        ) : (
          <div className="admins-table-wrapper">
            <table className="admins-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Fecha de Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => (
                  <tr key={admin.id}>
                    <td>
                      <div className="admin-info">
                        <div className="admin-avatar">
                          {admin.email.charAt(0).toUpperCase()}
                        </div>
                        <span className="admin-email">{admin.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className="role-badge">
                        {admin.role || 'admin'}
                      </span>
                    </td>
                    <td className="date">
                      {new Date(admin.created_at).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="actions">
                      <button
                        onClick={() => openEditModal(admin)}
                        className="btn-edit"
                        title={!canManageAdmins ? 'Solo el superadmin puede editar usuarios.' : 'Editar'}
                        disabled={!canManageAdmins}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M11.3333 2.00004C11.5084 1.82494 11.7163 1.68605 11.9451 1.59129C12.1739 1.49653 12.4191 1.44775 12.6666 1.44775C12.9142 1.44775 13.1594 1.49653 13.3882 1.59129C13.617 1.68605 13.8249 1.82494 14 2.00004C14.1751 2.17513 14.314 2.383 14.4087 2.61178C14.5035 2.84055 14.5523 3.08575 14.5523 3.33337C14.5523 3.58099 14.5035 3.82619 14.4087 4.05497C14.314 4.28374 14.1751 4.49161 14 4.66671L5.00001 13.6667L1.33334 14.6667L2.33334 11L11.3333 2.00004Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteAdmin(admin.id, admin.email, admin.role)}
                        className="btn-delete"
                        title={!canManageAdmins ? 'Solo el superadmin puede eliminar usuarios.' : 'Eliminar'}
                        disabled={!canManageAdmins}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M2 4H14M12.6667 4V13.3333C12.6667 14 12 14.6667 11.3333 14.6667H4.66667C4 14.6667 3.33333 14 3.33333 13.3333V4M5.33333 4V2.66667C5.33333 2 6 1.33333 6.66667 1.33333H9.33333C10 1.33333 10.6667 2 10.6667 2.66667V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal Crear */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Nuevo Administrador</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowModal(false)}
                  aria-label="Cerrar"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateAdmin} className="modal-form">
                <div className="form-group">
                  <label htmlFor="email">
                    Correo Electrónico <span className="required">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="admin@ejemplo.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role">
                    Asignar Rol <span className="required">*</span>
                  </label>
                  <select
                    id="role"
                    value={newAdminRole}
                    onChange={(e) => setNewAdminRole(e.target.value)}
                    required
                  >
                    {availableRoles.map(role => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                  <p className="helper-text">
                    Define los permisos de acceso del nuevo usuario.
                  </p>
                </div>

                <div className="form-group">
                  <label htmlFor="password">
                    Contraseña <span className="required">*</span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    minLength="8"
                    required
                  />

                  {newAdminPassword && (
                    <>
                      <div className="password-strength">
                        <div className="strength-bar-container">
                          <div
                            className="strength-bar"
                            style={{
                              width: `${passwordStrength}%`,
                              backgroundColor: getPasswordStrengthColor()
                            }}
                          />
                        </div>
                        <span
                          className="strength-label"
                          style={{ color: getPasswordStrengthColor() }}
                        >
                          {getPasswordStrengthLabel()}
                        </span>
                      </div>

                      {passwordErrors.length > 0 && (
                        <ul className="password-errors">
                          {passwordErrors.map((error, index) => (
                            <li key={index}>❌ {error}</li>
                          ))}
                        </ul>
                      )}

                      <div className="password-requirements">
                        <p className="requirements-title">La contraseña debe contener:</p>
                        <ul>
                          <li className={newAdminPassword.length >= 8 ? 'valid' : ''}>
                            ✓ Al menos 8 caracteres
                          </li>
                          <li className={/[A-Z]/.test(newAdminPassword) ? 'valid' : ''}>
                            ✓ Una letra mayúscula
                          </li>
                          <li className={/[a-z]/.test(newAdminPassword) ? 'valid' : ''}>
                            ✓ Una letra minúscula
                          </li>
                          <li className={/\d/.test(newAdminPassword) ? 'valid' : ''}>
                            ✓ Un número
                          </li>
                          <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newAdminPassword) ? 'valid' : ''}>
                            ✓ Un carácter especial (!@#$%^&*)
                          </li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={submitting || passwordErrors.length > 0}
                  >
                    {submitting ? (
                      <>
                        <div className="btn-spinner"></div>
                        Creando...
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Crear Administrador
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Editar */}
        {showEditModal && editingAdmin && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Editar Administrador</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowEditModal(false)}
                  aria-label="Cerrar"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleEditAdmin} className="modal-form">
                <div className="form-group">
                  <label htmlFor="edit-email">
                    Correo Electrónico <span className="required">*</span>
                  </label>
                  <input
                    id="edit-email"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="admin@ejemplo.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-role">
                    Asignar Rol <span className="required">*</span>
                  </label>
                  <select
                    id="edit-role"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    required
                  >
                    {availableRoles.map(role => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                  <p className="helper-text">
                    Define los permisos de acceso del usuario.
                  </p>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-password">
                    Nueva Contraseña <span className="optional">(Opcional)</span>
                  </label>
                  <input
                    id="edit-password"
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Dejar vacío para mantener la actual"
                    minLength="8"
                  />
                  <p className="helper-text">
                    Solo completa este campo si deseas cambiar la contraseña.
                  </p>

                  {editPassword && (
                    <>
                      <div className="password-strength">
                        <div className="strength-bar-container">
                          <div
                            className="strength-bar"
                            style={{
                              width: `${passwordStrength}%`,
                              backgroundColor: getPasswordStrengthColor()
                            }}
                          />
                        </div>
                        <span
                          className="strength-label"
                          style={{ color: getPasswordStrengthColor() }}
                        >
                          {getPasswordStrengthLabel()}
                        </span>
                      </div>

                      {passwordErrors.length > 0 && (
                        <ul className="password-errors">
                          {passwordErrors.map((error, index) => (
                            <li key={index}>❌ {error}</li>
                          ))}
                        </ul>
                      )}

                      <div className="password-requirements">
                        <p className="requirements-title">La contraseña debe contener:</p>
                        <ul>
                          <li className={editPassword.length >= 8 ? 'valid' : ''}>
                            ✓ Al menos 8 caracteres
                          </li>
                          <li className={/[A-Z]/.test(editPassword) ? 'valid' : ''}>
                            ✓ Una letra mayúscula
                          </li>
                          <li className={/[a-z]/.test(editPassword) ? 'valid' : ''}>
                            ✓ Una letra minúscula
                          </li>
                          <li className={/\d/.test(editPassword) ? 'valid' : ''}>
                            ✓ Un número
                          </li>
                          <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(editPassword) ? 'valid' : ''}>
                            ✓ Un carácter especial (!@#$%^&*)
                          </li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={submitting || (editPassword && passwordErrors.length > 0)}
                  >
                    {submitting ? (
                      <>
                        <div className="btn-spinner"></div>
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;