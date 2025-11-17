import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Lista expandida de contraseñas comunes
const COMMON_PASSWORDS = new Set([
    '123456', '123456789', 'password', '12345678', '12345', '1234567',
    'qwerty', 'abc123', '111111', '000000', 'password1', 'admin',
    'letmein', 'welcome', 'monkey', 'dragon', 'master', 'sunshine',
    'princess', 'football', 'iloveyou', 'admin123', '123123',
    'qwerty123', '1q2w3e4r', 'qazwsx', '123qwe', 'password123',
    'welcome123', 'login', 'passw0rd', 'superman', 'trustno1',
    'contraseña', 'clave', 'secreto', 'bienvenido', 'teamo',
    '2024', '2023', '2022', '2021', '2020','1234', '1234567890', 
    'asdfgh', 'asdf1234', '00000',
    'pokemon', 'starwars', 'hallo', 'batman', 'spiderman',
    '1111', '222222', '333333', '444444', '555555', '666666',
    '777777', '888888', '999999',
    'password!', 'password@123', 'mypassword', 'default',
    'changeme', 'welcome1', 'welcome2', 'letmein1',
    'abcd1234', 'abcd', 'qwertyuiop', 'qwerty1',
    '123abc', '321321', '654321', '987654321',
    'america', 'mexico', 'messi', 'cristiano',
    'amor123', 'holamundo', '123321', '112233',
    'pepito', 'garfield', 'naruto', 'goku', 'dragonball',
    'password2024', 'usuario', 'usuario123',
    'temporal', 'temporal123',
    'miamor', 'soltero', 'soltera',
    'perrito', 'gatito', 'chocolate', 'futbol123',
    'qwert', 'asdf', 'zxcv', 'zxcvbn', '1qaz2wsx',
    'pass123', 'pass1234', 'pass', 'mypc123',
    'soyadmin', 'root', 'root123',
    'admin1', 'administrator', 'administrator123',
    'system', 'system123', 'manager', 'manager123'
]);


// Función de validación de seguridad de contraseñas
const validatePasswordSecurity = (password, email) => {
    const errors = [];
    
    if (password.length < 12) {
        errors.push('La contraseña debe tener al menos 12 caracteres');
    }
    
    if (password.length > 128) {
        errors.push('La contraseña es demasiado larga');
    }
    
    if (COMMON_PASSWORDS.has(password.toLowerCase())) {
        errors.push('Esta contraseña es muy común y vulnerable');
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    if (!hasUpperCase) errors.push('Debe contener al menos una mayúscula');
    if (!hasLowerCase) errors.push('Debe contener al menos una minúscula');
    if (!hasNumber) errors.push('Debe contener al menos un número');
    if (!hasSpecialChar) errors.push('Debe contener al menos un carácter especial');
    
    if (/(.)\1{3,}/.test(password)) {
        errors.push('Demasiados caracteres repetidos consecutivos');
    }
    
    if (/(012|123|234|345|456|567|678|789|987|876|765|654|543|432|321|210)/.test(password)) {
        errors.push('No uses secuencias numéricas simples');
    }
    
    if (email) {
        const emailLocalPart = email.split('@')[0];
        if (password.toLowerCase().includes(emailLocalPart.toLowerCase())) {
            errors.push('La contraseña no debe contener tu email');
        }
    }
    
    return errors;
};

// Función para buscar usuario Auth por email
const findAuthUserByEmail = async (supabaseAdmin, email) => {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) return null;
    return data.users.find(user => user.email?.toLowerCase() === email.toLowerCase());
};

// Logging de seguridad
const logSecurityEvent = (event, userEmail, targetEmail = null, details = {}) => {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        event,
        user: userEmail,
        target: targetEmail,
        details,
        type: 'security'
    }));
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: 'No authorization header' }),
                {
                    status: 401,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

        if (userError || !user) {
            return new Response(
                JSON.stringify({ error: 'Invalid token' }),
                {
                    status: 401,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        const { data: currentAdmin, error: adminError } = await supabaseAdmin
            .from('admins')
            .select('role')
            .eq('email', user.email)
            .single()

        if (adminError || !currentAdmin) {
            return new Response(
                JSON.stringify({ error: 'User is not an admin' }),
                {
                    status: 403,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        const { action, email, password, role, adminId } = await req.json()

        // ============================================
        // ACCIÓN: CREATE
        // ============================================
        if (action === 'create') {
            if (!['superadmin', 'admin'].includes(currentAdmin.role)) {
                return new Response(
                    JSON.stringify({ error: 'Solo administradores pueden crear usuarios' }),
                    {
                        status: 403,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    }
                )
            }

            if (currentAdmin.role === 'admin' && ['admin', 'superadmin'].includes(role)) {
                return new Response(
                    JSON.stringify({ error: 'Los administradores solo pueden crear operadores' }),
                    {
                        status: 403,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    }
                )
            }

            if (role === 'superadmin' && currentAdmin.role !== 'superadmin') {
                return new Response(
                    JSON.stringify({ error: 'Solo superadministradores pueden crear superadmins' }),
                    {
                        status: 403,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    }
                )
            }

            if (!email || !password || !role) {
                return new Response(
                    JSON.stringify({ error: 'Faltan campos requeridos' }),
                    {
                        status: 400,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    }
                )
            }

            // ✅ VALIDACIÓN MEJORADA DE CONTRASEÑA
            const passwordErrors = validatePasswordSecurity(password, email);
            if (passwordErrors.length > 0) {
                return new Response(
                    JSON.stringify({ 
                        error: 'Problemas de seguridad en la contraseña',
                        details: passwordErrors 
                    }),
                    {
                        status: 400,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    }
                )
            }

            const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: { role }
            })

            if (authError) {
                console.error('Error creating auth user:', authError)
                return new Response(
                    JSON.stringify({ error: 'Error al crear usuario: ' + authError.message }),
                    {
                        status: 400,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    }
                )
            }

            const { error: insertError } = await supabaseAdmin
                .from('admins')
                .insert([{ email: email, role: role }])

            if (insertError) {
                await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
                return new Response(
                    JSON.stringify({ error: 'Error al registrar administrador: ' + insertError.message }),
                    {
                        status: 400,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    }
                )
            }

            logSecurityEvent('admin_created', user.email, email, { role });
            
            return new Response(
                JSON.stringify({
                    success: true,
                    message: 'Administrador creado exitosamente',
                    data: { email, role }
                }),
                {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        // ============================================
        // ACCIÓN: UPDATE
        // ============================================
        if (action === 'update') {
            // Solo superadmin puede editar
            if (currentAdmin.role !== 'superadmin') {
                return new Response(
                    JSON.stringify({ error: 'Solo el superadministrador puede editar usuarios' }),
                    {
                        status: 403,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    }
                )
            }

            if (!adminId || !email || !role) {
                return new Response(
                    JSON.stringify({ error: 'Faltan campos requeridos (adminId, email, role)' }),
                    {
                        status: 400,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    }
                )
            }

            // Obtener el admin a editar
            const { data: adminToUpdate, error: fetchError } = await supabaseAdmin
                .from('admins')
                .select('email, role')
                .eq('id', adminId)
                .single()

            if (fetchError || !adminToUpdate) {
                return new Response(
                    JSON.stringify({ error: 'Administrador no encontrado' }),
                    {
                        status: 404,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    }
                )
            }

            // No se puede editar a un superadmin
            if (adminToUpdate.role === 'superadmin') {
                return new Response(
                    JSON.stringify({ error: 'No se puede editar a un superadministrador' }),
                    {
                        status: 403,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    }
                )
            }

            // Si se proporciona contraseña, validarla
            if (password) {
                const passwordErrors = validatePasswordSecurity(password, email);
                if (passwordErrors.length > 0) {
                    return new Response(
                        JSON.stringify({ 
                            error: 'Problemas de seguridad en la contraseña',
                            details: passwordErrors 
                        }),
                        {
                            status: 400,
                            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                        }
                    )
                }
            }

            // Buscar el usuario en Auth
            const authUser = await findAuthUserByEmail(supabaseAdmin, adminToUpdate.email);
            
            if (!authUser) {
                return new Response(
                    JSON.stringify({ error: 'Usuario de autenticación no encontrado' }),
                    {
                        status: 404,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    }
                )
            }

            // Actualizar en la tabla admins
            const { error: updateError } = await supabaseAdmin
                .from('admins')
                .update({ 
                    email: email, 
                    role: role 
                })
                .eq('id', adminId)

            if (updateError) {
                return new Response(
                    JSON.stringify({ error: 'Error al actualizar administrador: ' + updateError.message }),
                    {
                        status: 400,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    }
                )
            }

            // Actualizar usuario en Auth (email y contraseña si se proporcionó)
            const updateData = {
                email: email,
                user_metadata: { role: role }
            };

            if (password) {
                updateData.password = password;
            }

            const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
                authUser.id,
                updateData
            );

            if (authUpdateError) {
                // Revertir cambio en la tabla admins si falla Auth
                await supabaseAdmin
                    .from('admins')
                    .update({ 
                        email: adminToUpdate.email, 
                        role: adminToUpdate.role 
                    })
                    .eq('id', adminId);

                return new Response(
                    JSON.stringify({ error: 'Error al actualizar autenticación: ' + authUpdateError.message }),
                    {
                        status: 400,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    }
                )
            }

            logSecurityEvent('admin_updated', user.email, email, { 
                oldEmail: adminToUpdate.email, 
                newRole: role,
                passwordChanged: !!password 
            });
            
            return new Response(
                JSON.stringify({
                    success: true,
                    message: 'Administrador actualizado exitosamente',
                    data: { email, role }
                }),
                {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        // ============================================
        // ACCIÓN: DELETE
        // ============================================
        if (action === 'delete') {
            if (currentAdmin.role !== 'superadmin') {
                return new Response(
                    JSON.stringify({ error: 'Solo el superadministrador puede eliminar usuarios' }),
                    {
                        status: 403,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    }
                )
            }

            if (!adminId) {
                return new Response(
                    JSON.stringify({ error: 'Se requiere el ID del administrador' }),
                    {
                        status: 400,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    }
                )
            }

            const { data: adminToDelete, error: fetchError } = await supabaseAdmin
                .from('admins')
                .select('email, role')
                .eq('id', adminId)
                .single()

            if (fetchError || !adminToDelete) {
                return new Response(
                    JSON.stringify({ error: 'Administrador no encontrado' }),
                    {
                        status: 404,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    }
                )
            }

            if (adminToDelete.role === 'superadmin') {
                return new Response(
                    JSON.stringify({ error: 'No se puede eliminar a un superadministrador' }),
                    {
                        status: 403,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    }
                )
            }

            if (adminToDelete.email === user.email) {
                return new Response(
                    JSON.stringify({ error: 'No puedes eliminarte a ti mismo' }),
                    {
                        status: 403,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    }
                )
            }

            const { error: deleteError } = await supabaseAdmin
                .from('admins')
                .delete()
                .eq('id', adminId)

            if (deleteError) {
                return new Response(
                    JSON.stringify({ error: 'Error al eliminar administrador: ' + deleteError.message }),
                    {
                        status: 400,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    }
                )
            }

            // ✅ ELIMINACIÓN MEJORADA DE AUTH
            const authUser = await findAuthUserByEmail(supabaseAdmin, adminToDelete.email);
            if (authUser) {
                await supabaseAdmin.auth.admin.deleteUser(authUser.id);
            }

            logSecurityEvent('admin_deleted', user.email, adminToDelete.email);
            
            return new Response(
                JSON.stringify({
                    success: true,
                    message: 'Administrador eliminado exitosamente'
                }),
                {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        return new Response(
            JSON.stringify({ error: 'Acción no válida' }),
            {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )

    } catch (error) {
        console.error('Error:', error)
        return new Response(
            JSON.stringify({ error: error.message || 'Error interno del servidor' }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )
    }
})