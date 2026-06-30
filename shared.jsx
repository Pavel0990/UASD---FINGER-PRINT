/* shared.jsx — i18n, layout chrome, icons, employee data */

const I18N = {
  es: {
    appName: 'Sistema de Registro Biométrico',
    appSub: 'UASD · Departamento de Recursos Humanos',
    nav_kiosk: 'Marcaje',
    nav_dashboard: 'Empleados',
    nav_register: 'Registrar',
    nav_reports: 'Reportes',
    nav_changelog: 'Control de actividad',
    nav_roles: 'Roles y perfiles',
    nav_signout: 'Cerrar sesión',
    um_role: 'Rol',
    um_role_admin: 'Administrador',
    um_perm_enroll: 'Registrar huellas',
    um_perm_reports: 'Ver reportes',
    um_perm_manage: 'Gestionar empleados',
    um_id: 'Código',
    um_dept: 'Departamento',
    um_last: 'Último acceso',
    um_view: 'Mi cuenta',
    um_settings: 'Configuración',
    acc_title: 'Mi cuenta',
    acc_sub: 'Gestiona tu acceso',
    acc_pw_title: 'Cambiar contraseña',
    acc_pw_current: 'Contraseña actual',
    acc_pw_new: 'Nueva contraseña',
    acc_pw_confirm: 'Confirmar contraseña',
    acc_pw_hint: 'Usa al menos 8 caracteres, una mayúscula, un número y un símbolo.',
    acc_pw_mismatch: 'Las contraseñas no coinciden.',
    acc_pw_short: 'La contraseña no cumple los requisitos.',
    acc_pw_save: 'Actualizar contraseña',
    acc_pw_ok: 'Contraseña actualizada correctamente',
    acc_prefs_title: 'Preferencias',
    acc_lang: 'Idioma predeterminado',
    acc_security_title: 'Seguridad',
    acc_last_access: 'Último acceso',
    acc_session: 'Sesión activa',
    acc_device: 'Dispositivo',
    acc_fp_title: 'Mi huella',
    acc_fp_status: 'Huella registrada',
    acc_fp_reenroll: 'Volver a registrar',
    acc_profile_title: 'Perfil institucional',
    acc_role_title: 'Rol y permisos',
    acc_permissions: 'Permisos activos',
    acc_no_role: 'Sin rol asignado',
    acc_manage_roles: 'Administrar roles',
    acc_close: 'Cerrar',

    // Kiosk
    kiosk_pre: 'Punto de Marcaje · Edificio Central',
    kiosk_title: 'Coloque su dedo en el <strong style="color:#1a1f3a">lector</strong>',
    kiosk_hint: 'El reconocimiento es automático en menos de un segundo.',
    kiosk_scanning: 'Escaneando huella...',
    kiosk_ready: 'Lector activo',
    kiosk_demo: 'Iniciar escaneo',
    kiosk_reset: 'Reiniciar',
    kiosk_admin: 'Panel de administración',
    kiosk_demo_label: 'Modo demo · próximo marcaje',
    kiosk_demo_in: 'Entrada',
    kiosk_demo_out: 'Salida',
    kiosk_demo_error: 'No reconocido',
    kiosk_recent: 'Marcajes recientes',
    kiosk_recent_empty: 'Aún no hay marcajes registrados en este turno.',
    kiosk_welcome: 'Bienvenido,',
    kiosk_farewell: 'Hasta pronto,',
    enroll_pre: 'Registro Biométrico · Auto-servicio',
    enroll_title: 'Registre su <strong>huella dactilar</strong>',
    enroll_sub: 'Identifíquese con su código de empleado para vincular su huella y activar su horario.',
    enroll_field: 'Código de empleado o cédula',
    enroll_ph: 'Ej. EMP-00521  ·  402-1102934-7',
    enroll_btn: 'Continuar',
    enroll_back: 'Volver al terminal',
    enroll_notfound: 'No encontramos ese código. Verifique e intente de nuevo.',
    enroll_confirm_title: 'Confirme su identidad',
    enroll_place: 'Coloque su dedo en el lector',
    enroll_scanning: 'Registrando su huella…',
    enroll_capture: 'Registrar huella',
    enroll_redo: 'Repetir',
    enroll_continue: 'Confirmar registro',
    enroll_step_schedule: 'Su horario asignado',
    enroll_thanks_pre: 'Registro completado',
    enroll_thanks_title: '¡Gracias por registrarte, {name}!',
    enroll_thanks_sub: 'Tu huella quedó vinculada y tu horario está activo. Ya puedes marcar tu asistencia en el terminal.',
    enroll_done_schedule: 'Horario registrado',
    enroll_done_fp: 'Huella vinculada',
    enroll_done_id: 'Código',
    enroll_finish: 'Finalizar',
    enroll_another: 'Registrar otro empleado',
    enroll_quality: 'Calidad de captura',
    kiosk_welcome_sub: 'Que tengas una excelente jornada.',
    kiosk_farewell_sub: 'Gracias por tu dedicación de hoy.',
    kiosk_welcome_bank: [
    'Que tengas una excelente jornada.',
    'Bienvenido de nuevo, que sea un gran día.',
    'Comienza con buena energía.',
    'Que sea un día productivo.',
    'Nos alegra verte de nuevo.',
    'Qué bueno tenerte de vuelta.',
    '¡A por un gran día!',
    'Grandes obras nacen de pequeños pasos.',
    'Hoy es el mejor día para dar lo mejor de ti.',
    'Tu presencia hace la diferencia.'],

    kiosk_farewell_bank: [
    'Gracias por tu dedicación de hoy.',
    'Buen viaje de regreso a casa.',
    'Descansa, te lo ganaste.',
    'Hasta mañana, ¡buen trabajo!',
    'Que disfrutes el resto del día.',
    'Gracias por tu esfuerzo de hoy.',
    'La virtud está en el esfuerzo.',
    'El descanso también es parte del camino.',
    'Lo que haces cada día construye quién eres.',
    'Hoy diste lo mejor de ti.'],

    kiosk_late: 'Tardanza',
    kiosk_clockin: 'Entrada registrada',
    kiosk_clockout: 'Salida registrada',
    kiosk_not_recognized: 'Huella no reconocida',
    kiosk_try_again: 'Intente nuevamente.',
    kiosk_status_secure: 'Conexión segura',
    kiosk_status_device: 'Lector #PA-14',
    kiosk_today: 'Hoy',
    kiosk_in: 'Entrada',
    kiosk_out: 'Salida',

    // Login
    login_brand_title: 'Acceso seguro al <strong>sistema biométrico</strong> institucional.',
    login_brand_sub: 'Plataforma de control y verificación de asistencia para personal docente y administrativo.',
    login_brand_v: 'Versión 2.0.1',
    login_brand_env: 'Entorno · Producción',
    login_title: 'Iniciar sesión',
    login_sub: 'Use sus credenciales institucionales.',
    login_email: 'Correo institucional',
    login_pass: 'Contraseña',
    login_remember: 'Mantener sesión iniciada',
    login_btn: 'Acceder',
    login_forgot: '¿Olvidó su contraseña?',
    login_foot: 'Acceso restringido',
    login_back: 'Volver al terminal de marcaje',
    login_err_title: 'Credenciales incorrectas',
    login_err_sub: 'Verifique su correo institucional y contraseña.',
    login_terms: 'Términos y condiciones',
    login_chip_mark: 'Marcaje registrado',
    login_chip_welcome: 'Bienvenida',

    // Dashboard
    dash_title: 'Empleados registrados',
    dash_sub: 'Personal del Recinto Valverde, Mao',
    dash_sub_count: 'Personal del Recinto · {total} registrados · {pending} pendientes de captura',
    dash_search: 'Buscar por nombre, cédula, código o departamento…',
    dash_new: 'Nuevo empleado',
    dash_export: 'Exportar',
    dash_export_pdf: 'Exportar a PDF',
    dash_export_excel: 'Exportar a Excel',
    dash_kpi_total: 'Total de empleados',
    dash_kpi_today: 'Entradas hoy',
    dash_kpi_pending: 'Pendientes de entrada',
    dash_kpi_active: 'Activos ahora',
    dash_col_employee: 'Empleado',
    dash_col_dept: 'Departamento',
    dash_col_role: 'Cargo',
    dash_col_schedule: 'Jornada',
    dash_col_status: 'Estados',
    dash_col_last: 'Último marcaje',
    dash_col_dob: 'Fecha nac.',
    dash_fld_dob: 'Fecha de nacimiento',
    dash_filter_all: 'Todos',
    dash_filter_active: 'Activos',
    dash_filter_pending: 'Pendientes',
    dash_filter_inactive: 'No activos',
    dash_filter_licensed: 'Licencia laboral',
    dash_filter_retired: 'Pensionados',
    dash_filter_suspended: 'Suspendidos',
    dash_status_ok: 'Registrado',
    dash_status_pending: 'Pendiente',
    dash_status_inactive: 'No activo',
    dash_status_suspended: 'Suspendido',
    dash_status_inactive_other: 'Licencia laboral',
    dash_status_retired: 'Pensionado',
    dash_col_comment: 'Comentario',
    dash_no_comment: '—',
    dash_kpi_late: 'Tardanzas hoy',
    dash_delta_total: '+12 esta semana',
    dash_delta_today: '+8% vs. ayer',
    dash_delta_pending: 'Requiere captura',
    dash_delta_active: 'En sede ahora',
    dash_pill_review: 'Revisar',
    dash_pill_live: 'En vivo',
    dash_empty: 'No se encontraron empleados.',
    dash_showing: 'Mostrando {n} de {total} empleados',

    // Register
    reg_title: 'Registrar nuevo empleado',
    reg_sub: 'Complete los datos y capture la huella del empleado',
    reg_step_1: 'Datos personales',
    reg_step_2: 'Captura de huella',
    reg_step_3: 'Confirmación',
    reg_back: 'Atrás',
    reg_next: 'Continuar',
    reg_save: 'Guardar empleado',
    reg_fld_name: 'Nombre completo',
    reg_fld_cedula: 'Cédula de identidad',
    reg_fld_code: 'Código de empleado',
    reg_fld_dept: 'Departamento / Facultad',
    reg_fld_role: 'Cargo',
    reg_fld_email: 'Correo institucional',
    reg_fld_phone: 'Teléfono',
    reg_fld_schedule: 'Jornada laboral',
    reg_fld_photo: 'Foto de perfil',
    reg_photo_upload: 'Subir foto',
    reg_capture_title: 'Captura de huella',
    reg_capture_instr: 'Coloque el dedo en el lector',
    reg_capture_finger: 'Dedo a registrar',
    reg_capture_quality: 'Calidad',
    reg_capture_start: 'Iniciar captura',
    reg_capture_recap: 'Recapturar',
    reg_capture_done: 'Captura completada',
    reg_confirm_title: 'Confirmación',
    reg_confirm_sub: 'Confirme que los datos son correctos antes de guardar.',
    reg_saved: 'Empleado registrado correctamente',
    reg_cancel: 'Cancelar',
    reg_step1_sub: 'Datos requeridos del empleado',
    reg_photo_sub: 'JPG / PNG · máx. 2MB',
    reg_photo_ph: 'foto de perfil',
    reg_photo_tip_label: 'Consejo:',
    reg_photo_tip: 'Use una foto frontal, con fondo neutral y rostro claramente visible. Esta foto aparecerá en el terminal principal.',
    reg_cap_sub: 'Capture al menos 2 dedos para mejor precisión',
    reg_cap_count: 'capturados',
    reg_cap_legend: 'T·pulgar · I·índice · M·medio · A·anular · P·meñique  |  D·derecha · I·izquierda',
    reg_cap_done_msg: 'Huella de {f} capturada con calidad excelente.',
    reg_cap_instr_msg: 'Coloque el dedo ({f}) sobre el lector óptico y manténgalo firme durante 2 segundos.',
    reg_summary: 'Resumen',
    reg_summary_sub: 'Empleado en proceso de registro',
    reg_prints_captured: 'Huellas capturadas',
    reg_prints_none: 'Aún sin capturas. Recomendamos al menos 2 dedos.',
    reg_prints_registered: 'Huellas registradas',
    reg_fingers_unit: 'dedo',
    reg_fingers_unit_pl: 'dedos',
    reg_prints_none_title: 'Ninguna huella capturada.',
    reg_quality_lbl: 'Calidad',
    reg_schedule_hint: 'Formato 12 h · ej. 8:00 AM — 4:00 PM',
    reg_must2: 'Debe capturar al menos 2 huellas para continuar.',
    fingers: {
      'T-D': 'Pulgar derecho', 'I-D': 'Índice derecho', 'M-D': 'Medio derecho',
      'A-D': 'Anular derecho', 'P-D': 'Meñique derecho',
      'T-I': 'Pulgar izquierdo', 'I-I': 'Índice izquierdo', 'M-I': 'Medio izquierdo',
      'A-I': 'Anular izquierdo', 'P-I': 'Meñique izquierdo'
    },

    // Reports
    rep_title: 'Reportes y estadísticas',
    rep_sub: 'Análisis de asistencia y actividad biométrica.',
    rep_range: 'Últimos 7 días',
    rep_attend: 'Asistencia diaria',
    rep_attend_sub: 'Marcajes válidos por día',
    rep_punctual: 'Puntualidad',
    rep_dept: 'Distribución por departamento',
    rep_dept_sub: 'Empleados registrados por unidad',
    rep_top: 'Actividad reciente',
    rep_punctual_on: 'A tiempo',
    rep_punctual_late: 'Tarde',
    rep_punctual_absent: 'Ausentes',
    rep_kpi_hours: 'Horas trabajadas',
    rep_delta_week: 'vs. semana pasada',
    rep_avg_month: 'Promedio mensual',
    rep_total_week: 'Total esta semana',
    rep_micro_avg: 'Promedio diario',
    rep_micro_avg_unit: 'marcajes',
    rep_micro_peak: 'Día más activo',
    rep_micro_peak_day: 'Miércoles',
    rep_micro_peak_unit: '301 marcajes',
    rep_micro_total: 'Marcajes totales',
    rep_micro_total_unit: 'esta semana',
    rep_donut_emp: 'Empleados',
    rep_hours_title: 'Llegadas por hora',
    rep_hours_sub: 'Distribución de entradas · hoy',
    rep_peak_msg: 'Pico de marcajes a las {h} con {n} entradas.',
    rep_recent_60: 'Últimos 60 minutos',
    rep_live: 'En vivo',
    rep_ago: 'hace {n} min',
    rep_days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],

    // Changelog
    cl_subtitle:     'Registro trazable de acciones del sistema',
    cl_label_admins: 'Administradores',
    cl_all_name:     'Todos',
    cl_all_dept:     'Vista unificada del sistema',
    cl_all_unified:  'Vista unificada',
    cl_filter_all:   'Todos',
    cl_filter_add:   'Registros',
    cl_filter_edit:  'Modificaciones',
    cl_filter_delete:'Eliminaciones',
    cl_moment:       'Hace un momento',
    cl_mins_ago:     'Hace {n} min',
    cl_hours_ago:    'Hace {n} h',
    cl_empty_title:  'Sin actividad registrada',
    cl_empty_sub:    'Las acciones de este administrador aparecerán aquí.',
    cl_empty_sub_all:'Las acciones del sistema aparecerán aquí.',
    cl_action:       'acción',
    cl_actions:      'acciones',
    cl_badge_add:    'Registro',
    cl_badge_edit:   'Modificación',
    cl_badge_delete: 'Eliminación',
    cl_msg_add_v:    'registró',
    cl_msg_add_c:    'a',
    cl_msg_edit_v:   'modificó',
    cl_msg_edit_c:   'el perfil de',
    cl_msg_del_v:    'eliminó',
    cl_msg_del_c:    'a',
    cl_msg_other:    'realizó una acción sobre',
    cl_msg_actor:    'Administrador',
    cl_msg_subject:  'un empleado',

    // Eventualidades
    event_title:     'Eventualidades',
    event_sub:       'Registro de trabajo en días libres y días libres emitidos',
    event_add:       'Agregar eventualidad',
    event_type:      'Tipo',
    type_eventualidad: 'Trabajo en día libre',
    type_dia_libre:  'Día libre emitido',
    event_motivo:    'Motivo',
    event_date:      'Fecha',
    event_sin:       'Sin eventualidades registradas.',
    event_ph_motivo_ev: 'Ej. Proyecto especial, sustitución…',
    event_ph_motivo_libre: 'Ej. Permiso personal, cita médica…',
    event_saved:     'Eventualidad registrada',
    event_removed:   'Eventualidad eliminada',

    // Finca Experimental
    farm_title:        'Finca Experimental',
    farm_sub:          'Control de asistencia para trabajadores de la finca',
    farm_all_present:  'Todos presentes',
    farm_no_employees: 'Sin empleados asignados',
    farm_no_emps_manage: 'Usa «Gestionar» para agregar personal a la finca.',
    farm_no_emps_admin: 'Contacta a un administrador para ser asignado.',
  },
  en: {
    appName: 'Biometric Attendance System',
    appSub: 'UASD · Human Resources Department',
    nav_kiosk: 'Clock-in',
    nav_dashboard: 'Employees',
    nav_register: 'Register',
    nav_reports: 'Reports',
    nav_changelog: 'Activity log',
    nav_roles: 'Roles & profiles',
    nav_signout: 'Sign out',
    um_role: 'Role',
    um_role_admin: 'Administrator',
    um_perm_enroll: 'Enroll fingerprints',
    um_perm_reports: 'View reports',
    um_perm_manage: 'Manage employees',
    um_id: 'Code',
    um_dept: 'Department',
    um_last: 'Last access',
    um_view: 'My account',
    um_settings: 'Settings',
    acc_title: 'My account',
    acc_sub: 'Manage your access',
    acc_pw_title: 'Change password',
    acc_pw_current: 'Current password',
    acc_pw_new: 'New password',
    acc_pw_confirm: 'Confirm password',
    acc_pw_hint: 'Use at least 8 characters, one uppercase, one number and one symbol.',
    acc_pw_mismatch: 'Passwords do not match.',
    acc_pw_short: 'Password does not meet the requirements.',
    acc_pw_save: 'Update password',
    acc_pw_ok: 'Password updated successfully',
    acc_prefs_title: 'Preferences',
    acc_lang: 'Default language',
    acc_security_title: 'Security',
    acc_last_access: 'Last access',
    acc_session: 'Active session',
    acc_device: 'Device',
    acc_fp_title: 'My fingerprint',
    acc_fp_status: 'Fingerprint enrolled',
    acc_fp_reenroll: 'Re-enroll',
    acc_profile_title: 'Institutional profile',
    acc_role_title: 'Role and permissions',
    acc_permissions: 'Active permissions',
    acc_no_role: 'No role assigned',
    acc_manage_roles: 'Manage roles',
    acc_close: 'Close',

    kiosk_pre: 'Attendance Terminal · Main Building',
    kiosk_title: 'Place your finger on the <strong style="color:#1a1f3a">reader</strong>',
    kiosk_hint: 'Recognition is automatic in under a second.',
    kiosk_scanning: 'Scanning fingerprint...',
    kiosk_ready: 'Reader active',
    kiosk_demo: 'Start scan',
    kiosk_reset: 'Reset',
    kiosk_admin: 'Admin panel',
    kiosk_demo_label: 'Demo mode · next scan',
    kiosk_demo_in: 'Entry',
    kiosk_demo_out: 'Exit',
    kiosk_demo_error: 'Not recognized',
    kiosk_recent: 'Recent activity',
    kiosk_recent_empty: 'No clock-ins recorded in this shift yet.',
    kiosk_welcome: 'Welcome,',
    kiosk_farewell: 'See you soon,',
    enroll_pre: 'Biometric Enrollment · Self-service',
    enroll_title: 'Enroll your <strong>fingerprint</strong>',
    enroll_sub: 'Identify yourself with your employee code to link your fingerprint and activate your schedule.',
    enroll_field: 'Employee code or national ID',
    enroll_ph: 'e.g. EMP-00521  ·  402-1102934-7',
    enroll_btn: 'Continue',
    enroll_back: 'Back to terminal',
    enroll_notfound: 'We couldn’t find that code. Please check and try again.',
    enroll_confirm_title: 'Confirm your identity',
    enroll_place: 'Place your finger on the reader',
    enroll_scanning: 'Enrolling your fingerprint…',
    enroll_capture: 'Enroll fingerprint',
    enroll_redo: 'Retry',
    enroll_continue: 'Confirm enrollment',
    enroll_step_schedule: 'Your assigned schedule',
    enroll_thanks_pre: 'Enrollment complete',
    enroll_thanks_title: 'Thank you for enrolling, {name}!',
    enroll_thanks_sub: 'Your fingerprint is linked and your schedule is active. You can now clock in at the terminal.',
    enroll_done_schedule: 'Schedule registered',
    enroll_done_fp: 'Fingerprint linked',
    enroll_done_id: 'Code',
    enroll_finish: 'Finish',
    enroll_another: 'Enroll another employee',
    enroll_quality: 'Capture quality',
    kiosk_welcome_sub: 'Have a great workday.',
    kiosk_farewell_sub: 'Thank you for your dedication today.',
    kiosk_welcome_bank: [
    'Have a great workday.',
    'Welcome back, may it be a great day.',
    'Start with good energy.',
    'Let’s make today productive.',
    'Good to see you again.',
    'Great to have you back.',
    'Have a wonderful day ahead!',
    'Great works are born of small steps.',
    'Today is the best day to give your best.',
    'Your presence makes a difference.'],

    kiosk_farewell_bank: [
    'Thank you for your dedication today.',
    'Safe trip back home.',
    'Rest well, you earned it.',
    'See you tomorrow, great job!',
    'Enjoy the rest of your day.',
    'Thank you for your effort today.',
    'Virtue lies in the effort.',
    'Rest is also part of the journey.',
    'What you do each day builds who you are.',
    'Today you gave your best.'],

    kiosk_late: 'Late',
    kiosk_clockin: 'Entry recorded',
    kiosk_clockout: 'Exit recorded',
    kiosk_not_recognized: 'Fingerprint not recognized',
    kiosk_try_again: 'Please try again.',
    kiosk_status_secure: 'Secure connection',
    kiosk_status_device: 'Reader #PA-14',
    kiosk_today: 'Today',
    kiosk_in: 'IN',
    kiosk_out: 'OUT',

    login_brand_title: 'Secure access to the institutional <strong>biometric system</strong>.',
    login_brand_sub: 'Attendance control and verification platform for academic and administrative staff.',
    login_brand_v: 'Version 2.0.1',
    login_brand_env: 'Environment · Production',
    login_title: 'Sign in',
    login_sub: 'Use your institutional credentials.',
    login_email: 'Institutional email',
    login_pass: 'Password',
    login_remember: 'Keep me signed in',
    login_btn: 'Access',
    login_forgot: 'Forgot your password?',
    login_foot: 'Restricted access',
    login_back: 'Back to attendance terminal',
    login_err_title: 'Incorrect credentials',
    login_err_sub: 'Check your institutional email and password.',
    login_terms: 'Terms & conditions',
    login_chip_mark: 'Entry recorded',
    login_chip_welcome: 'Welcome',

    dash_title: 'Registered employees',
    dash_sub: 'Valverde campus staff, Mao',
    dash_sub_count: 'Campus staff · {total} enrolled · {pending} pending capture',
    dash_search: 'Search by name, ID, code, department or role…',
    dash_new: 'New employee',
    dash_export: 'Export',
    dash_export_pdf: 'Export to PDF',
    dash_export_excel: 'Export to Excel',
    dash_kpi_total: 'Total employees',
    dash_kpi_today: 'Entries today',
    dash_kpi_pending: 'Pending entry',
    dash_kpi_active: 'Currently on-site',
    dash_col_employee: 'Employee',
    dash_col_dept: 'Department',
    dash_col_role: 'Role',
    dash_col_schedule: 'Schedule',
    dash_col_status: 'Status',
    dash_col_last: 'Last entry',
    dash_col_dob: 'Birth date',
    dash_fld_dob: 'Date of birth',
    dash_filter_all: 'All',
    dash_filter_active: 'Active',
    dash_filter_pending: 'Pending',
    dash_filter_registered: 'Registered fingerprint',
    dash_filter_inactive: 'Inactive',
    dash_filter_licensed: 'Licensed',
    dash_filter_retired: 'Retired',
    dash_filter_suspended: 'Suspended',
    dash_filter_inactive_other: 'Other inactive',
    dash_status_ok: 'Enrolled',
    dash_status_pending: 'No print',
    dash_status_inactive: 'Inactive',
    dash_status_retired: 'Retired',
    dash_status_suspended: 'Suspended',
    dash_status_inactive_other: 'Inactive',
    dash_col_comment: 'Comment',
    dash_no_comment: 'No comment',
    dash_kpi_late: 'Late arrivals today',
    dash_delta_total: '+12 this week',
    dash_delta_today: '+8% vs. yesterday',
    dash_delta_pending: 'Requires capture',
    dash_delta_active: 'On-site now',
    dash_pill_review: 'Review',
    dash_pill_live: 'Live',
    dash_empty: 'No employees found.',
    dash_showing: 'Showing {n} of {total} employees',

    reg_title: 'Register new employee',
    reg_sub: 'Complete the details and capture the employee\'s fingerprint',
    reg_step_1: 'Personal data',
    reg_step_2: 'Biometric capture',
    reg_step_3: 'Confirmation',
    reg_back: 'Back',
    reg_next: 'Continue',
    reg_save: 'Save employee',
    reg_fld_name: 'Full name',
    reg_fld_cedula: 'National ID',
    reg_fld_code: 'Employee code',
    reg_fld_dept: 'Department / Faculty',
    reg_fld_role: 'Role',
    reg_fld_email: 'Institutional email',
    reg_fld_phone: 'Phone',
    reg_fld_schedule: 'Work schedule',
    reg_fld_photo: 'Profile photo',
    reg_photo_upload: 'Upload photo',
    reg_capture_title: 'Fingerprint capture',
    reg_capture_instr: 'Place finger on the reader',
    reg_capture_finger: 'Finger to enroll',
    reg_capture_quality: 'Quality',
    reg_capture_start: 'Start capture',
    reg_capture_recap: 'Re-capture',
    reg_capture_done: 'Capture complete',
    reg_confirm_title: 'Final review',
    reg_confirm_sub: 'Confirm the data is correct before saving.',
    reg_saved: 'Employee registered successfully',
    reg_cancel: 'Cancel',
    reg_step1_sub: 'Required employee details',
    reg_photo_sub: 'JPG / PNG, max. 2MB',
    reg_photo_ph: 'profile photo',
    reg_photo_tip_label: 'Tip:',
    reg_photo_tip: 'Use a front-facing photo with a neutral background and a clearly visible face. This photo will appear on the terminal when the employee is recognized.',
    reg_cap_sub: 'Capture at least 2 fingers for better accuracy',
    reg_cap_count: 'captured',
    reg_cap_legend: 'T·thumb · I·index · M·middle · A·ring · P·little  |  D·right · I·left',
    reg_cap_done_msg: '{f} fingerprint captured with excellent quality.',
    reg_cap_instr_msg: 'Place the finger ({f}) on the optical reader and hold it steady for 2 seconds.',
    reg_summary: 'Summary',
    reg_summary_sub: 'Employee being registered',
    reg_prints_captured: 'Fingerprints captured',
    reg_prints_none: 'No captures yet. We recommend at least 2 fingers.',
    reg_prints_registered: 'Fingerprints enrolled',
    reg_fingers_unit: 'finger',
    reg_fingers_unit_pl: 'fingers',
    reg_prints_none_title: 'No fingerprints captured.',
    reg_quality_lbl: 'Quality',
    reg_schedule_hint: '12 h format · e.g. 8:00 AM — 4:00 PM',
    reg_must2: 'You must capture at least 2 fingerprints to continue.',
    fingers: {
      'T-D': 'Right thumb', 'I-D': 'Right index', 'M-D': 'Right middle',
      'A-D': 'Right ring', 'P-D': 'Right little',
      'T-I': 'Left thumb', 'I-I': 'Left index', 'M-I': 'Left middle',
      'A-I': 'Left ring', 'P-I': 'Left little'
    },

    rep_title: 'Reports & analytics',
    rep_sub: 'Attendance and biometric activity analysis.',
    rep_range: 'Last 7 days',
    rep_attend: 'Daily attendance',
    rep_attend_sub: 'Valid clock-ins per day',
    rep_punctual: 'Punctuality',
    rep_dept: 'Distribution by department',
    rep_dept_sub: 'Employees registered per unit',
    rep_top: 'Recent activity',
    rep_punctual_on: 'On time',
    rep_punctual_late: 'Late',
    rep_punctual_absent: 'Absent',
    rep_kpi_hours: 'Hours worked',
    rep_delta_week: 'vs. last week',
    rep_avg_month: 'Monthly average',
    rep_total_week: 'Total this week',
    rep_micro_avg: 'Daily average',
    rep_micro_avg_unit: 'clock-ins',
    rep_micro_peak: 'Busiest day',
    rep_micro_peak_day: 'Wednesday',
    rep_micro_peak_unit: '301 clock-ins',
    rep_micro_total: 'Total clock-ins',
    rep_micro_total_unit: 'this week',
    rep_donut_emp: 'Employees',
    rep_hours_title: 'Arrivals by hour',
    rep_hours_sub: 'Entry distribution · today',
    rep_peak_msg: 'Peak clock-ins at {h} with {n} entries.',
    rep_recent_60: 'Last 60 minutes',
    rep_live: 'Live',
    rep_ago: '{n} min ago',
    rep_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],

    // Changelog
    cl_subtitle:     'Traceable system activity log',
    cl_label_admins: 'Administrators',
    cl_all_name:     'All',
    cl_all_dept:     'System-wide view',
    cl_all_unified:  'Unified view',
    cl_filter_all:   'All',
    cl_filter_add:   'Registrations',
    cl_filter_edit:  'Modifications',
    cl_filter_delete:'Deletions',
    cl_moment:       'Just now',
    cl_mins_ago:     '{n} min ago',
    cl_hours_ago:    '{n} h ago',
    cl_empty_title:  'No activity recorded',
    cl_empty_sub:    "This administrator's actions will appear here.",
    cl_empty_sub_all:'System actions will appear here.',
    cl_action:       'action',
    cl_actions:      'actions',
    cl_badge_add:    'Registration',
    cl_badge_edit:   'Modification',
    cl_badge_delete: 'Deletion',
    cl_msg_add_v:    'registered',
    cl_msg_add_c:    '',
    cl_msg_edit_v:   'modified',
    cl_msg_edit_c:   'the profile of',
    cl_msg_del_v:    'removed',
    cl_msg_del_c:    '',
    cl_msg_other:    'performed an action on',
    cl_msg_actor:    'Administrator',
    cl_msg_subject:  'an employee',

    // Eventualidades
    event_title:     'Eventualidades',
    event_sub:       'Work on days off & issued days off',
    event_add:       'Add record',
    event_type:      'Type',
    type_eventualidad: 'Work on day off',
    type_dia_libre:  'Issued day off',
    event_motivo:    'Reason',
    event_date:      'Date',
    event_sin:       'No eventualities recorded.',
    event_ph_motivo_ev: 'e.g. Special project, substitution…',
    event_ph_motivo_libre: 'e.g. Personal leave, medical appointment…',
    event_saved:     'Eventuality recorded',
    event_removed:   'Eventuality removed',

    // Experimental Farm
    farm_title:        'Experimental Farm',
    farm_sub:          'Attendance control for farm workers',
    farm_all_present:  'All present',
    farm_no_employees: 'No employees assigned',
    farm_no_emps_manage: 'Use «Manage» to add staff to the farm.',
    farm_no_emps_admin: 'Contact an administrator to be assigned.',
  }
};

// workDays: array of JS getDay() values — 0=Dom 1=Lun 2=Mar 3=Mié 4=Jue 5=Vie 6=Sáb
const EMPLOYEES = [
{ id: 'EMP-00702', name: 'Pavel Abreu Torres',    cedula: '40298731045', dept: 'Data',                     role: 'Desarrollador',         email: 'pabreu@uasd.edu.do',      phone: '+1 809 555 0702', schedule: '8:00 AM — 6:00 PM',   workDays: [1,2,3,4,5],     status: 'ok',       lastIn: '08:00', dob: '12/06/1999' },
{ id: 'EMP-00601', name: 'Gabriel Gómez',          cedula: '40220274583', dept: 'Data',                     role: 'Analista de Datos',     email: 'ggomez@uasd.edu.do',      phone: '+1 809 555 0601', schedule: '8:00 AM — 6:00 PM',   workDays: [1,2,3,4,5],     status: 'ok',       lastIn: '07:58', dob: '14/03/1991' },
{ id: 'EMP-00214', name: 'María Reyes Castillo',   cedula: '40212845637', dept: 'Facultad de Ingeniería',   role: 'Decana',                email: 'mreyes@uasd.edu.do',      phone: '+1 809 555 0142', schedule: '7:00 AM — 3:00 PM',   workDays: [1,2,3,4,5],     status: 'ok',       lastIn: '07:54', dob: '22/07/1978' },
{ id: 'EMP-00187', name: 'Carlos Méndez Polanco',  cedula: '00119238472', dept: 'Recursos Humanos',         role: 'Director',              email: 'cmendez@uasd.edu.do',     phone: '+1 809 555 0238', schedule: '8:00 AM — 4:00 PM',   workDays: [1,2,3,4,5],     status: 'ok',       lastIn: '08:02', dob: '05/11/1975' },
{ id: 'EMP-00342', name: 'Lourdes Peña Vargas',    cedula: '40277823419', dept: 'Biblioteca Central',       role: 'Bibliotecaria Jefa',    email: 'lpena@uasd.edu.do',       phone: '+1 829 555 0411', schedule: '8:00 AM — 5:00 PM',   workDays: [1,2,3,4,5,6],   status: 'ok',       lastIn: '07:48', dob: '30/01/1983' },
{ id: 'EMP-00501', name: 'Juan Manuel Tavárez',    cedula: '40233498721', dept: 'Facultad de Ciencias',     role: 'Profesor Titular',      email: 'jtavarez@uasd.edu.do',    phone: '+1 809 555 0623', schedule: '9:00 AM — 1:00 PM',   workDays: [1,2,3,4],       status: 'ok',       lastIn: '08:55', dob: '18/09/1969' },
{ id: 'EMP-00298', name: 'Ana Cristina Jiménez',   cedula: '00111457824', dept: 'Tesorería',                role: 'Auxiliar Contable',     email: 'ajimenez@uasd.edu.do',    phone: '+1 809 555 0388', schedule: '8:00 AM — 4:00 PM',   workDays: [1,2,3,4,5],     status: 'pending',  lastIn: '—',     dob: '09/06/1997' },
{ id: 'EMP-00412', name: 'Roberto Núñez Espinal',  cedula: '40299123413', dept: 'Sistemas e Informática',   role: 'Ingeniero de Redes',    email: 'rnunez@uasd.edu.do',      phone: '+1 829 555 0712', schedule: '8:00 AM — 5:00 PM',   workDays: [1,2,3,4,5],     status: 'ok',       lastIn: '08:11', dob: '27/04/1988' },
{ id: 'EMP-00103', name: 'Elena Sánchez Brito',    cedula: '00122849136', dept: 'Rectoría',                 role: 'Asistente Ejecutiva',   email: 'esanchez@uasd.edu.do',    phone: '+1 809 555 0119', schedule: '7:30 AM — 3:30 PM',   workDays: [1,2,3,4,5],     status: 'ok',       lastIn: '07:32', dob: '11/12/1994' },
{ id: 'EMP-00276', name: 'Pedro Antonio Rosario',  cedula: '40255678232', dept: 'Mantenimiento',            role: 'Supervisor',            email: 'prosario@uasd.edu.do',    phone: '+1 829 555 0834', schedule: '6:00 AM — 2:00 PM',   workDays: [1,2,3,4,5,6],   status: 'ok',       lastIn: '05:51', dob: '03/08/1980' },
{ id: 'EMP-00388', name: 'Yolanda Fernández Cruz', cedula: '40277231048', dept: 'Facultad de Humanidades',  role: 'Profesora Auxiliar',    email: 'yfernandez@uasd.edu.do',  phone: '+1 809 555 0277', schedule: '10:00 AM — 2:00 PM',  workDays: [1,2,3,4,5],     status: 'inactive', lastIn: '—',     dob: '15/02/1962', inactiveReason: 'retired',    inactiveComment: 'Pensionada por tiempo de servicio. Resolución RRHH-2026-014.' },
{ id: 'EMP-00455', name: 'Miguel Ángel Rodríguez', cedula: '00133987215', dept: 'Seguridad',                role: 'Agente',                email: 'mrodriguez@uasd.edu.do',  phone: '+1 829 555 0566', schedule: '2:00 PM — 10:00 PM',  workDays: [0,1,2,3,4,5,6], status: 'ok',       lastIn: '13:58', dob: '20/05/1993' },
{ id: 'EMP-00521', name: 'Sofía Hernández Marte',  cedula: '40211029347', dept: 'Registro',                 role: 'Analista',              email: 'shernandez@uasd.edu.do',  phone: '+1 809 555 0445', schedule: '8:00 AM — 4:00 PM',   workDays: [1,2,3,4,5],     status: 'pending',  lastIn: '—',     dob: '07/10/1999' },
{ id: 'EMP-00237', name: 'Francisco Pimentel Lora',cedula: '00128913451', dept: 'Comunicaciones',           role: 'Coordinador',           email: 'fpimentel@uasd.edu.do',   phone: '+1 829 555 0291', schedule: '9:00 AM — 5:00 PM',   workDays: [1,2,3,4,5],     status: 'inactive', lastIn: '08:45', dob: '25/11/1986', inactiveReason: 'other',      inactiveComment: 'Licencia administrativa temporal pendiente de revisión.' },
];


const RECENT_LOG = [
{ empId: 'EMP-00214', name: 'María Reyes', dept: 'Ingeniería', time: '08:14', kind: 'in' },
{ empId: 'EMP-00187', name: 'Carlos Méndez', dept: 'Recursos Humanos', time: '08:02', kind: 'in' },
{ empId: 'EMP-00276', name: 'Pedro Rosario', dept: 'Mantenimiento', time: '07:51', kind: 'in' },
{ empId: 'EMP-00103', name: 'Elena Sánchez', dept: 'Rectoría', time: '07:32', kind: 'in' },
{ empId: 'EMP-00342', name: 'Lourdes Peña', dept: 'Biblioteca', time: '07:48', kind: 'in' }];


const DEPT_DIST = [
{ name: 'Ingeniería', value: 142, color: '#1A1F3A' },
{ name: 'Humanidades', value: 98, color: '#2C3E66' },
{ name: 'Ciencias', value: 76, color: '#5a6a90' },
{ name: 'Administración', value: 53, color: '#8b2942' },
{ name: 'Servicios', value: 31, color: '#8b97b3' }];


/* ============================================
   Icons
   ============================================ */
const Icon = ({ name, size = 18, stroke = 1.6 }) => {
  const materialPaths = {
    usersActive: <path d="m160-419 101-101-101-101L59-520l101 101Zm540-21 100-160 100 160H700Zm-220-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Zm0-160q-17 0-28.5 11.5T440-600q0 17 11.5 28.5T480-560q17 0 28.5-11.5T520-600q0-17-11.5-28.5T480-640Zm0 40ZM0-240v-63q0-44 44.5-70.5T160-400q13 0 25 .5t23 2.5q-14 20-21 43t-7 49v65H0Zm240 0v-65q0-65 66.5-105T480-450q108 0 174 40t66 105v65H240Zm560-160q72 0 116 26.5t44 70.5v63H780v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5Zm-320 30q-57 0-102 15t-53 35h311q-9-20-53.5-35T480-370Zm0 50Z" />,
    usersTotal: <path d="M38-160v-94q0-35 18-63.5t50-42.5q73-32 131.5-46T358-420q62 0 120 14t131 46q32 14 50.5 42.5T678-254v94H38Zm700 0v-94q0-63-32-103.5T622-423q69 8 130 23.5t99 35.5q33 19 52 47t19 63v94H738ZM250-523q-42-42-42-108t42-108q42-42 108-42t108 42q42 42 42 108t-42 108q-42 42-108 42t-108-42Zm426 0q-42 42-108 42-11 0-24.5-1.5T519-488q24-25 36.5-61.5T568-631q0-45-12.5-79.5T519-774q11-3 24.5-5t24.5-2q66 0 108 42t42 108q0 66-42 108ZM98-220h520v-34q0-16-9.5-31T585-306q-72-32-121-43t-106-11q-57 0-106.5 11T130-306q-14 6-23 21t-9 31v34Zm324.5-346.5Q448-592 448-631t-25.5-64.5Q397-721 358-721t-64.5 25.5Q268-670 268-631t25.5 64.5Q319-541 358-541t64.5-25.5ZM358-220Zm0-411Z" />,
    groupAdmins: <path d="m150-400 82-80-82-82-80 82 80 80Zm573-10 87-140 88 140H723Zm-243-70q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Zm.35-180q-25.35 0-42.85 17.15t-17.5 42.5q0 25.35 17.35 42.85t43 17.5Q506-540 523-557.35t17-43Q540-626 522.85-643t-42.5-17Zm-.35 60ZM0-240v-53q0-39.46 42-63.23Q84-380 150.4-380q12.16 0 23.38.5 11.22.5 22.22 2.23-8 17.27-12 34.84-4 17.57-4 37.43v65H0Zm240 0v-65q0-65 66.5-105T480-450q108 0 174 40t66 105v65H240Zm570-140q67.5 0 108.75 23.77T960-293v53H780v-65q0-19.86-3.5-37.43T765-377.27q11-1.73 22.17-2.23 11.17-.5 22.83-.5Zm-330.2-10Q400-390 350-366q-50 24-50 61v5h360v-6q0-36-49.5-60t-130.7-24Zm.2 90Z" />,
  };
  if (materialPaths[name]) {
    return <svg width={size} height={size} viewBox="0 -960 960 960" fill="currentColor">{materialPaths[name]}</svg>;
  }
  const props = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: stroke,
    strokeLinecap: 'round', strokeLinejoin: 'round'
  };
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    arrowRight: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    arrowLeft: <><path d="M19 12H5M11 6l-6 6 6 6" /></>,
    panelLeft: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /></>,
    check: <><path d="M5 12l5 5 9-11" /></>,
    x: <><path d="M6 6l12 12M18 6L6 18" /></>,
    download: <><path d="M12 4v12M6 12l6 6 6-6M5 20h14" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>,
    logOut: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></>,
    refresh: <><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    phone: <><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .6 2.9a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.5 2.9.6a2 2 0 0 1 1.7 2z" /></>,
    badge: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="12" cy="10" r="2.5" /><path d="M8 17c.8-1.8 2.3-3 4-3s3.2 1.2 4 3" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    fingerprint: <><path d="M6 17c0-1 .3-2 .8-3M12 3a9 9 0 0 0-9 9c0 1.4.3 2.7.8 3.9" /><path d="M21 12a9 9 0 0 0-9-9c-1 0-2 .2-3 .5M9 21a8 8 0 0 1-2-4c-.5-2-.3-4.2.5-6" /><path d="M16 21a18 18 0 0 0 1-7c0-2.8-2-5-5-5s-5 2.2-5 5" /><path d="M12 21v-7c0-1.1.9-2 2-2s2 .9 2 2v3" /></>,
    eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>,
    chevDown: <><path d="m6 9 6 6 6-6" /></>,
    filter: <><path d="M4 6h16M7 12h10M10 18h4" /></>,
    bell: <><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M14 21a2 2 0 0 1-4 0" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
    shieldUser: <><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M6.376 18.91a6 6 0 0 1 11.249.003"/><circle cx="12" cy="11" r="4"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
    barChart: <><path d="M3 21h18M7 17V9M12 17V5M17 17v-7" /></>,
    activity: <><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" /></>,
    upload: <><path d="M12 16V4M6 10l6-6 6 6M5 20h14" /></>,
    award: <><circle cx="12" cy="8" r="5" /><path d="M8.5 12.5 7 22l5-3 5 3-1.5-9.5" /><path d="m9.8 8 1.4 1.4L14.5 6" /></>,
    edit: <><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></>,
    trash: <><path d="M3 6h18M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M19 6l-1 14c0 1-1 2-2 2H8c-1 0-2-1-2-2L5 6" /></>,
    userPlus: <><circle cx="10" cy="8" r="4" /><path d="M2 21c0-4.4 3.6-8 8-8M19 11v6M16 14h6" /></>,
    users: <><circle cx="9" cy="7" r="3.5" /><path d="M2 21c0-3.9 3.1-7 7-7s7 3.1 7 7" /><circle cx="18" cy="6" r="2.5" /><path d="M22 21c0-2.8-1.8-5.2-4.3-6.1" /></>,
    landPlot: <><path d="m12 8 6-3-6-3v10"/><path d="m8 11.99-5.5 3.14a1 1 0 0 0 0 1.74l8.5 4.86a2 2 0 0 0 2 0l8.5-4.86a1 1 0 0 0 0-1.74L16 12"/><path d="m6.49 12.85 11.02 6.3"/><path d="M17.51 12.85 6.5 19.15"/></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    userMale: <><circle cx="10" cy="11" r="7"/><path d="M15.5 3H21v5.5M21 3l-7 7"/></>,
    userFemale: <><circle cx="12" cy="9" r="7"/><path d="M12 16v6M9 19h6"/></>,
    photoMale: <><circle cx="12" cy="7" r="4.5"/><path d="M3.5 21a8.5 8.5 0 0 1 17 0"/></>,
    photoFemale: <><path d="M6.5 9C6.5 4.5 9 2 12 2s5.5 2.5 5.5 7"/><path d="M6.5 9c-.5 3 0 5.5 1.5 7"/><path d="M17.5 9c.5 3 0 5.5-1.5 7"/><circle cx="12" cy="8" r="3.5"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></>,
    baseball: <><circle cx="12" cy="12" r="9"/><path d="M9.5 4.5C8 7.5 8 10.5 9.5 13.5"/><path d="M9.5 13.5C8 16.5 8 19 9.5 21"/><path d="M14.5 4.5C16 7.5 16 10.5 14.5 13.5"/><path d="M14.5 13.5C16 16.5 16 19 14.5 21"/></>,
    absent: <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4"/></>,
    doorOpen: <><path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h20"/><path d="M13 20V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16"/></>,
  };
  return <svg {...props}>{paths[name]}</svg>;
};

/* ============================================
   Crest
   ============================================ */
const Crest = ({ size = 38, dark = false }) =>
<div style={{
  width: size, height: size, borderRadius: '50%',
  border: `1px solid var(--ink-600)`,
  background: '#fff',
  display: 'grid', placeItems: 'center',
  overflow: 'hidden',
  flexShrink: 0
}}>
    <img src="assets/uasd-crest.png" alt="Escudo UASD"
  style={{ width: '80%', height: '80%', objectFit: 'contain', display: 'block' }} />
  </div>;

function getAccountContext() {
  if (typeof getCurrentUserProfile === 'function') {
    const ctx = getCurrentUserProfile();
    if (ctx?.employee) return ctx;
  }
  const employee = EMPLOYEES.find(e => e.id === 'EMP-00601') || EMPLOYEES[0];
  const role = typeof getRoles === 'function'
    ? getRoles().find(r => r.id === 'role_admin') || null
    : { name: 'Administrador', description: 'Acceso completo a todas las funciones del sistema.', color: '#8b2942', perms: ['enroll','reports','manage','roles','audit','farm'] };
  return { employee, role, assignment: role ? { empId: employee?.id, roleId: role.id } : null };
}

function permissionLabel(perm, lang) {
  const list = window.ALL_PERMS || [];
  const item = list.find(p => p.id === perm);
  if (!item) return perm;
  return lang === 'en' ? item.label_en : item.label_es;
}


/* ============================================
   Top bar (admin pages)
   ============================================ */
function TopBar({ route, setRoute, lang, setLang, t }) {
  const isRegister  = route === 'register';

  const account = getAccountContext();
  const emp = account.employee || {};
  const mainNav = [
    { id: 'dashboard', label: t.nav_dashboard, icon: 'user',     key: '1' },
    { id: 'reports',   label: t.nav_reports,   icon: 'barChart', key: '2' },
  ];
  const regNav = [
    { id: 'register',  label: t.nav_register,  icon: 'userPlus', key: '1' },
    { id: 'dashboard', label: t.nav_dashboard, icon: 'user',     key: '2' },
    { id: 'reports',   label: t.nav_reports,   icon: 'barChart', key: '3' },
  ];
  const activeNav = isRegister ? regNav : mainNav;

  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);

  const [adminTab, setAdminTab] = React.useState(null);

  const navRef    = React.useRef(null);
  const itemRefs  = React.useRef({});
  const [pill, setPill] = React.useState({ opacity: 0 });

  React.useLayoutEffect(() => {
    const measure = () => {
      const el   = itemRefs.current[route];
      const wrap = navRef.current;
      if (!el || !wrap) return;
      const er = el.getBoundingClientRect();
      const wr = wrap.getBoundingClientRect();
      setPill({ opacity: 1, width: er.width, height: er.height, transform: `translateX(${Math.round(er.left - wr.left)}px)` });
    };
    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  }, [route]);

  return (
    <div className="topbar">
      <div className="topbar__brand">
        <Crest size={58} />
        <div>
          <div className="topbar__title">{t.appName}</div>
          <div className="topbar__subtitle">{t.appSub}</div>
        </div>
      </div>
      <nav className="topbar__nav" ref={navRef}>
        <span className="topbar__nav-pill" style={pill} aria-hidden="true" />
        {activeNav.map((n) => (
          <button key={n.id}
            ref={(el) => (itemRefs.current[n.id] = el)}
            className={`topbar__nav-item ${route === n.id ? 'topbar__nav-item--active' : ''}`}
            onClick={() => setRoute(n.id)}
            title={`${n.label}  ·  ${n.key}`}>
            <Icon name={n.icon} size={15} />
            {n.label}
          </button>
        ))}
      </nav>
      <div className="topbar__right">
        <LangSwitch lang={lang} setLang={setLang} />
        <div className="topbar__usermenu" ref={menuRef}>
          <button className={`topbar__user ${menuOpen ? 'topbar__user--open' : ''}`} onClick={() => setMenuOpen((o) => !o)}>
            <div className="topbar__user-avatar">{initials(emp.name || 'Usuario')}</div>
            <div className="topbar__user-name">{emp.name ? emp.name.split(' ')[0][0] + '. ' + emp.name.split(' ').slice(-1)[0] : 'Usuario'}</div>
            <span className="topbar__user-caret"><Icon name="chevDown" size={14} /></span>
          </button>
          {menuOpen && <UserMenu t={t} lang={lang} account={account} setRoute={setRoute} close={() => setMenuOpen(false)} onAdmin={(tab) => { setMenuOpen(false); setAdminTab(tab); }} />}
        </div>
        <button className="topbar__nav-item topbar__signout" onClick={() => setRoute('kiosk')} aria-label={t.nav_signout} data-tip={t.nav_signout}>
          <Icon name="logOut" size={16} />
        </button>
      </div>
      {adminTab && <AdminPanel t={t} lang={lang} setLang={setLang} setRoute={setRoute} initialTab={adminTab} close={() => setAdminTab(null)} />}
    </div>);

}


function UserMenu({ t, lang, account, setRoute, close, onAdmin }) {
  const emp = account?.employee || {};
  const role = account?.role;
  const rolePerms = role?.perms || [];
  return (
    <div className="usermenu" role="menu">
      <div className="usermenu__head">
        <div className="usermenu__avatar">{initials(emp.name || 'Usuario')}</div>
        <div className="usermenu__id">
          <div className="usermenu__name">{emp.name || 'Usuario'}</div>
          <div className="usermenu__email mono">{emp.email || 'usuario@uasd.edu.do'}</div>
        </div>
      </div>

      <div className="usermenu__actions">
        <button className="usermenu__action" onClick={() => onAdmin('account')}>
          <Icon name="user" size={15} /> {t.um_view}
        </button>
        {(typeof userHasPermission !== 'function' || userHasPermission('audit')) && (
        <button className="usermenu__action" onClick={() => onAdmin('changelog')}>
          <Icon name="activity" size={15} /> {t.nav_changelog}
        </button>
        )}
        {(typeof userHasPermission !== 'function' || userHasPermission('roles')) && (
        <button className="usermenu__action" onClick={() => onAdmin('roles')}>
          <Icon name="shieldUser" size={15} /> {t.nav_roles}
        </button>
        )}
        {(typeof userHasPermission !== 'function' || userHasPermission('farm')) && (
        <button className="usermenu__action" onClick={() => { onAdmin('finca'); }}>
          <Icon name="landPlot" size={15} /> {t.farm_title}
        </button>
        )}
      </div>
    </div>);

}

function AccountPanelContent({ t }) {
  const [cur, setCur] = React.useState('');
  const [npw, setNpw] = React.useState('');
  const [conf, setConf] = React.useState('');
  const [msg, setMsg] = React.useState(null);

  const strong = (p) => p.length >= 8 && /[A-Z]/.test(p) && /[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p);

  const savePw = (e) => {
    e.preventDefault();
    if (!strong(npw)) { setMsg({ type: 'err', text: t.acc_pw_short }); return; }
    if (npw !== conf)  { setMsg({ type: 'err', text: t.acc_pw_mismatch }); return; }
    const uid = typeof getCurrentUserId === 'function' ? getCurrentUserId() : '';
    if (uid && typeof saveCredential === 'function') {
      const creds = typeof getCredentials === 'function' ? getCredentials() : {};
      const c = creds[uid] || {};
      saveCredential(uid, c.email || '', npw);
    }
    setMsg({ type: 'ok', text: t.acc_pw_ok });
    setCur(''); setNpw(''); setConf('');
  };

  const account = getAccountContext();
  const emp = account.employee || {};
  const role = account.role;

  return (
    <div style={{ padding:'32px', display:'flex', flexDirection:'column', gap:24 }}>

      {/* ── Datos: código, rol, depto, último acceso ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:1, background:'var(--ink-100)', border:'1px solid var(--ink-100)', borderRadius:'var(--radius-md)', overflow:'hidden' }}>
        {[
          { label: t.um_id,          value: emp.id   || '—',               mono: true  },
          { label: t.dash_col_role,  value: role?.name || t.acc_no_role,   mono: false, roleColor: role?.color },
          { label: t.um_dept,        value: emp.dept  || '—',              mono: false },
          { label: t.um_last,        value: localStorage.getItem('uasd_last_login') || '—', mono: true },
        ].map((item, i) => (
          <div key={i} style={{ padding:'16px 20px', background:'var(--paper)' }}>
            <div style={{ fontFamily:'var(--font-sans)', fontSize:10, fontWeight:700, color:'var(--ink-300)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:6 }}>{item.label}</div>
            <div style={{ fontFamily: item.mono ? 'var(--font-mono)' : 'var(--font-sans)', fontSize:13, fontWeight:600, color: item.roleColor || 'var(--ink-800)' }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* ── Cambiar contraseña ── */}
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
          <Icon name="lock" size={13} stroke={2} style={{ color:'var(--ink-400)' }} />
          <span style={{ fontFamily:'var(--font-sans)', fontSize:11, fontWeight:700, color:'var(--ink-300)', letterSpacing:'0.08em', textTransform:'uppercase' }}>{t.acc_pw_title}</span>
        </div>
        <div style={{ border:'1px solid var(--ink-100)', borderRadius:'var(--radius-md)', padding:'22px 24px', background:'var(--paper)' }}>
          <form className="acc-form" onSubmit={savePw}>
            <div className="field">
              <label className="field__label">{t.acc_pw_current}</label>
              <input className="field__input" type="password" value={cur}
                     onChange={(e) => { setCur(e.target.value); setMsg(null); }} placeholder="••••••••" />
            </div>
            <div className="acc-form__row">
              <div className="field">
                <label className="field__label">{t.acc_pw_new}</label>
                <input className="field__input" type="password" value={npw}
                       onChange={(e) => { setNpw(e.target.value); setMsg(null); }} placeholder="••••••••" />
              </div>
              <div className="field">
                <label className="field__label">{t.acc_pw_confirm}</label>
                <input className="field__input" type="password" value={conf}
                       onChange={(e) => { setConf(e.target.value); setMsg(null); }} placeholder="••••••••" />
              </div>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, marginTop:4 }}>
              <span className="field__hint">{t.acc_pw_hint}</span>
              <button className="btn btn--primary" type="submit">{t.acc_pw_save}</button>
            </div>
            {msg && (
              <div className={`acc-msg acc-msg--${msg.type}`} style={{ marginTop:12 }}>
                <Icon name={msg.type === 'ok' ? 'check' : 'x'} size={14} stroke={2.4} /> {msg.text}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

function AdminPanel({ t, lang, setLang, setRoute, close, initialTab = 'account' }) {
  const [tab, setTab] = React.useState(initialTab);
  const [collapsed, setCollapsed] = React.useState(false);
  const account = getAccountContext();
  const emp = account.employee || {};
  const canAudit = typeof userHasPermission !== 'function' || userHasPermission('audit');
  const canRoles = typeof userHasPermission !== 'function' || userHasPermission('roles');

  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [close]);

  const canFarm = typeof userHasPermission === 'function' ? userHasPermission('farm') : true;
  const tabs = [
    { id: 'account',   label: t.um_view,       icon: 'user'   },
    ...(canAudit ? [{ id: 'changelog', label: t.nav_changelog, icon: 'activity' }] : []),
    ...(canRoles ? [{ id: 'roles',     label: t.nav_roles,     icon: 'shieldUser' }] : []),
    ...(canFarm  ? [{ id: 'finca',     label: t.farm_title,    icon: 'landPlot' }] : []),
  ];

  return (
    <div className="acc-overlay" onMouseDown={close}>
      <div className={`admin-panel${collapsed ? ' admin-panel--collapsed' : ''}`} onMouseDown={e => e.stopPropagation()} role="dialog" aria-modal="true">
        {/* Banda azul */}
        <div className="acc-modal__head">
          <button onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expandir panel' : 'Contraer panel'}
            className="acc-modal__close"
            style={{ marginRight:8 }}>
            <span className="admin-panel__toggle-icon">
              <Icon name="panelLeft" size={18} stroke={1.8} />
            </span>
          </button>
          <div className="acc-modal__head-id">
            <div className="acc-modal__avatar">{initials(emp.name || 'Usuario')}</div>
            <div>
              <div className="acc-modal__title">{emp.name || 'Usuario'}</div>
              <div className="acc-modal__sub">{emp.email || 'usuario@uasd.edu.do'}</div>
            </div>
          </div>
          <button className="acc-modal__close acc-modal__close--x" onClick={close} aria-label="Cerrar">
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Cuerpo: sidebar + contenido */}
        <div className="admin-panel__body">
          <div className={`admin-panel__sidebar${collapsed ? ' admin-panel__sidebar--collapsed' : ''}`}>
            {!collapsed && <div className="admin-panel__sidebar-label">Administración</div>}
            {tabs.map(item => (
              <button key={item.id}
                className={`admin-panel__nav-item${tab === item.id ? ' admin-panel__nav-item--active' : ''}`}
                title={collapsed ? item.label : undefined}
                onClick={() => setTab(item.id)}
                style={{ justifyContent: 'flex-start', padding: collapsed ? '10px 16px' : '10px 14px' }}>
                <Icon name={item.icon} size={15} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          <div className="admin-panel__content">
            {tab === 'account'   && <AccountPanelContent t={t} lang={lang} setLang={setLang} />}
            {tab === 'changelog' && <ChangelogView t={t} setRoute={setRoute} />}
            {tab === 'roles'     && <RolesView t={t} setRoute={setRoute} onClose={close} />}
            {tab === 'finca'     && <FarmView t={t} lang={lang} setRoute={setRoute} />}
          </div>
        </div>
      </div>
    </div>
  );
}
function LangSwitch({ lang, setLang, dark = false }) {
  const wrapRef  = React.useRef(null);
  const itemRefs = React.useRef({});
  const [pill, setPill] = React.useState({ opacity: 0 });

  React.useLayoutEffect(() => {
    const el   = itemRefs.current[lang];
    const wrap = wrapRef.current;
    if (!el || !wrap) return;
    const er = el.getBoundingClientRect();
    const wr = wrap.getBoundingClientRect();
    setPill({
      opacity:   1,
      width:     er.width,
      height:    er.height,
      transform: `translateX(${Math.round(er.left - wr.left)}px)`,
    });
  }, [lang]);

  return (
    <div className={`lang ${dark ? 'lang--dark' : ''}`} ref={wrapRef}>
      <span className="lang__pill" style={pill} aria-hidden="true" />
      {['es', 'en'].map(l => (
        <button key={l}
          ref={el => (itemRefs.current[l] = el)}
          className={`lang__btn ${lang === l ? 'lang__btn--active' : ''}`}
          onClick={() => setLang(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/* ============================================
   Helpers
   ============================================ */
const initials = (name) =>
name.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase();

const inactiveStatus = (employee, t) => {
  if (employee?.status === 'custom') {
    try {
      const list = JSON.parse(localStorage.getItem('uasd_custom_statuses') || '[]');
      const cs = list.find(c => c.id === employee.inactiveReason);
      if (cs) {
        if (cs.color) {
          const r = parseInt(cs.color.slice(1,3),16), g = parseInt(cs.color.slice(3,5),16), b = parseInt(cs.color.slice(5,7),16);
          return { cls: '', label: cs.label, style: { background: `rgba(${r},${g},${b},0.12)`, color: cs.color } };
        }
        return { cls: cs.cls || 'badge--neutral', label: cs.label };
      }
    } catch {}
    return { cls: 'badge--neutral', label: 'Estado personalizado' };
  }
  if (employee?.status !== 'inactive') return null;
  if (employee.inactiveReason === 'retired')   return { cls: 'badge--retired', label: t.dash_status_retired   || 'Pensionados' };
  if (employee.inactiveReason === 'suspended') return { cls: 'badge--warn',    label: t.dash_status_suspended || 'Suspendidos' };
  return { cls: 'badge--neutral', label: t.dash_status_inactive_other || t.dash_filter_licensed || 'Licencia laboral' };
};

const StatusBadge = ({ status, t, employee }) => {
  const map = {
    ok: { cls: 'badge--ok', label: t.dash_status_ok },
    pending: { cls: 'badge--warn', label: t.dash_status_pending },
    inactive: { cls: 'badge--neutral', label: t.dash_status_inactive }
  };
  const s = inactiveStatus(employee, t) || map[status] || map.inactive;
  return (
    <span className={`badge ${s.cls || ''}`} style={s.style || {}}>
      {s.icon ? <Icon name={s.icon} size={12} stroke={2.1} /> : <span className="badge__dot"></span>}
      {s.label}
    </span>);

};

/* Format cedula: 11 digits → XXX-XXXXXXX-X, else return as-is */
function formatCedula(v) {
  if (!v) return '';
  const digits = v.replace(/\D/g, '');
  if (digits.length === 11) return `${digits.slice(0,3)}-${digits.slice(3,10)}-${digits.slice(10)}`;
  return v;
}

/* Format time like 09:14:32 */
function formatTime(date, lang) {
  let h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  const isPM = h >= 12;
  h = h % 12;
  if (h === 0) h = 12;
  const suffix = isPM ? 'PM' : 'AM';
  return `${String(h).padStart(2, '0')}:${m}:${s} ${suffix}`;
}
function formatDate(date, lang) {
  const opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString(lang === 'es' ? 'es-DO' : 'en-US', opts);
}

/* Render template with <strong> */
const T = ({ html }) => <span dangerouslySetInnerHTML={{ __html: html }} />;

/* ── Toggle switch ───────────────────────────────────────────── */
function ToggleSwitch({ value, onChange, disabled, style }) {
  return (
    <button type="button" onClick={() => !disabled && onChange(!value)}
      style={{
        width:40, height:22, borderRadius:11, border:'none', cursor: disabled ? 'default' : 'pointer',
        background: value ? 'var(--ink-700)' : 'var(--ink-200)',
        position:'relative', transition:'background .2s', flexShrink:0,
        opacity: disabled ? 0.4 : 1,
        ...style,
      }}>
      <span style={{
        position:'absolute', top:3, left: value ? 21 : 3,
        width:16, height:16, borderRadius:'50%',
        background:'var(--paper)', transition:'left .2s',
        boxShadow:'0 1px 3px rgba(0,0,0,0.2)',
      }}/>
    </button>
  );
}

/* ── Jornada laboral ──────────────────────────────────────────── */
// 0=Dom 1=Lun 2=Mar 3=Mié 4=Jue 5=Vie 6=Sáb
const WEEK_DAYS = [
  { n:1, label:'L' }, { n:2, label:'M' }, { n:3, label:'X' },
  { n:4, label:'J' }, { n:5, label:'V' }, { n:6, label:'S' }, { n:0, label:'D' },
];

function WorkDaysPicker({ value, onChange }) {
  const days = value || [];
  const toggle = (n) => {
    const next = days.includes(n) ? days.filter(d => d !== n) : [...days, n];
    if (next.length > 0) onChange(next);
  };
  return (
    <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
      {WEEK_DAYS.map(({ n, label }) => {
        const active = days.includes(n);
        return (
          <button key={n} type="button" onClick={() => toggle(n)} style={{
            width:32, height:32, borderRadius:'50%', border:'none', cursor:'pointer',
            fontFamily:'var(--font-ui)', fontSize:12, fontWeight:700,
            background: active ? 'var(--ink-700)' : 'var(--ink-100)',
            color: active ? 'var(--cream-100)' : 'var(--ink-400)',
            transition:'background .12s, color .12s',
          }}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

function workDaysLabel(days) {
  if (!days || days.length === 0) return '—';
  const names = { 1:'Lun', 2:'Mar', 3:'Mié', 4:'Jue', 5:'Vie', 6:'Sáb', 0:'Dom' };
  return days.slice().sort((a,b) => (a===0?7:a)-(b===0?7:b)).map(d => names[d]).join(' · ');
}

/* ── Tardanza helper ───────────────────────────────────────── */
function getLateMinutes(schedule, timeStr) {
  if (!schedule || !timeStr) return 0;
  const s = /(\d+):(\d+)\s*(AM|PM)/i.exec(schedule);
  if (!s) return 0;
  let sH = parseInt(s[1]) % 12;
  if (s[3].toUpperCase() === 'PM') sH += 12;
  const startMin = sH * 60 + parseInt(s[2]);

  const t = /(\d+):(\d+)/.exec(timeStr);
  if (!t) return 0;
  let tH = parseInt(t[1]) % 12;
  if (/PM/i.test(timeStr)) tH += 12;
  const actualMin = tH * 60 + parseInt(t[2]);

  return actualMin - startMin;
}

Object.assign(window, {
  I18N, EMPLOYEES, RECENT_LOG, DEPT_DIST,
  Icon, Crest, TopBar, LangSwitch, AdminPanel,
  initials, StatusBadge, formatTime, formatDate, formatCedula, T, getLateMinutes,
  WEEK_DAYS, WorkDaysPicker, workDaysLabel, ToggleSwitch,
});
