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
    nav_roles: 'Roles',
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
    kiosk_demo_badge: 'Modo demostración — no se guardó asistencia',
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
    kiosk_already_done_title: 'Marcaje del día completo',
    kiosk_already_done_sub: 'Ya registró su entrada y salida de hoy.',
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
    login_err_norole_title: 'Acceso denegado',
    login_err_norole_sub: 'Su cuenta no tiene un rol asignado. Contacte al administrador del sistema.',
    login_err_offline_title: 'Servicio no disponible',
    login_err_offline_sub: 'No se pudo conectar con el servidor. Intente de nuevo en unos momentos.',
    login_err_locked_title: 'Demasiados intentos',
    login_err_locked_sub: 'Espere {n} segundos antes de volver a intentar.',
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
    reg_saved: 'Empleado registrado',
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
    rep_view_summary: 'Resumen',
    rep_view_detail: 'Detalle',
    rep_view_calendar: 'Calendario',
    rep_range: 'Últimos 7 días',
    rep_attend: 'Asistencia diaria',
    rep_attend_sub: 'Marcajes válidos por día',
    rep_punctual: 'Puntualidad',
    rep_dept: 'Distribución por departamento',
    rep_dept_sub: 'Empleados registrados por unidad',
    rep_top: 'Actividad reciente',
    rep_punctual_on: 'Puntualidad',
    rep_punctual_late: 'Tardanzas',
    rep_punctual_absent: 'Ausencias',
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
    cl_label_admins: 'Usuarios',
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
    farm_no_employees: 'Sin personal asignado',
    farm_no_emps_manage: 'Usa «Agregar» para asignar personal a la finca.',
    farm_no_emps_admin: 'Contacta a un administrador para asignar personal.',
    liceo_title:       'Liceo Experimental',
    liceo_sub:         'Control de asistencia de estudiantes del liceo',
    vacaciones_title:  'Vacaciones Colectivas',
    feriados_title:    'Días feriados',
    feriados_sub:      'Administración de días inhábiles nacionales',
  },
  en: {
    appName: 'Biometric Attendance System',
    appSub: 'UASD · Human Resources Department',
    nav_kiosk: 'Clock-in',
    nav_dashboard: 'Employees',
    nav_register: 'Register',
    nav_reports: 'Reports',
    nav_changelog: 'Activity log',
    nav_roles: 'Roles',
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
    kiosk_demo_badge: 'Demo mode — attendance not saved',
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
    kiosk_already_done_title: 'Daily check-in complete',
    kiosk_already_done_sub: 'You already recorded your entry and exit today.',
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
    login_err_norole_title: 'Access denied',
    login_err_norole_sub: 'Your account has no assigned role. Contact the system administrator.',
    login_err_offline_title: 'Service unavailable',
    login_err_offline_sub: 'Could not reach the server. Please try again shortly.',
    login_err_locked_title: 'Too many attempts',
    login_err_locked_sub: 'Wait {n} seconds before trying again.',
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
    reg_saved: 'Employee registered',
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
    rep_view_summary: 'Summary',
    rep_view_detail: 'Detail',
    rep_view_calendar: 'Calendar',
    rep_range: 'Last 7 days',
    rep_attend: 'Daily attendance',
    rep_attend_sub: 'Valid clock-ins per day',
    rep_punctual: 'Punctuality',
    rep_dept: 'Distribution by department',
    rep_dept_sub: 'Employees registered per unit',
    rep_top: 'Recent activity',
    rep_punctual_on: 'Punctuality',
    rep_punctual_late: 'Late arrivals',
    rep_punctual_absent: 'Absences',
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
    cl_label_admins: 'Users',
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
    farm_no_employees: 'No staff assigned',
    farm_no_emps_manage: 'Use «Add» to assign workers to the farm.',
    farm_no_emps_admin: 'Contact an administrator to assign staff.',
    liceo_title:       'Experimental High School',
    liceo_sub:         'Student attendance control for the school',
    vacaciones_title:  'Collective Vacations',
    feriados_title:    'Public Holidays',
    feriados_sub:      'Administration of national non-working days',
  }
};

// workDays: array of JS getDay() values — 0=Dom 1=Lun 2=Mar 3=Mié 4=Jue 5=Vie 6=Sáb
let EMPLOYEES = [
{ id: 'EMP-00702', name: 'Pavel Abreu Torres',    cedula: '40298731045', dept: 'Data',                     role: 'Desarrollador',         email: 'pabreu@uasd.edu.do',      phone: '+1 809 555 0702', schedule: '8:00 AM — 6:00 PM',   workDays: [1,2,3,4,5],     status: 'ok',       lastIn: '08:00', dob: '12/06/1999', gender: 'M' },
{ id: 'EMP-00601', name: 'Gabriel Gómez',          cedula: '40220274583', dept: 'Data',                     role: 'Analista de Datos',     email: 'ggomez@uasd.edu.do',      phone: '+1 809 555 0601', schedule: '8:00 AM — 6:00 PM',   workDays: [1,2,3,4,5],     status: 'ok',       lastIn: '07:58', dob: '14/03/1991', gender: 'M' },
{ id: 'EMP-00214', name: 'María Reyes Castillo',   cedula: '40212845637', dept: 'Facultad de Ingeniería',   role: 'Decana',                email: 'mreyes@uasd.edu.do',      phone: '+1 809 555 0142', schedule: '7:00 AM — 3:00 PM',   workDays: [1,2,3,4,5],     status: 'ok',       lastIn: '07:54', dob: '22/07/1978', gender: 'F' },
{ id: 'EMP-00187', name: 'Carlos Méndez Polanco',  cedula: '00119238472', dept: 'Recursos Humanos',         role: 'Director',              email: 'cmendez@uasd.edu.do',     phone: '+1 809 555 0238', schedule: '8:00 AM — 4:00 PM',   workDays: [1,2,3,4,5],     status: 'ok',       lastIn: '08:02', dob: '05/11/1975', gender: 'M' },
{ id: 'EMP-00342', name: 'Lourdes Peña Vargas',    cedula: '40277823419', dept: 'Biblioteca Central',       role: 'Bibliotecaria Jefa',    email: 'lpena@uasd.edu.do',       phone: '+1 829 555 0411', schedule: '8:00 AM — 5:00 PM',   workDays: [1,2,3,4,5,6],   status: 'ok',       lastIn: '07:48', dob: '30/01/1983', gender: 'F' },
{ id: 'EMP-00501', name: 'Juan Manuel Tavárez',    cedula: '40233498721', dept: 'Facultad de Ciencias',     role: 'Profesor Titular',      email: 'jtavarez@uasd.edu.do',    phone: '+1 809 555 0623', schedule: '9:00 AM — 1:00 PM',   workDays: [1,2,3,4],       status: 'ok',       lastIn: '08:55', dob: '18/09/1969', gender: 'M' },
{ id: 'EMP-00298', name: 'Ana Cristina Jiménez',   cedula: '00111457824', dept: 'Tesorería',                role: 'Auxiliar Contable',     email: 'ajimenez@uasd.edu.do',    phone: '+1 809 555 0388', schedule: '8:00 AM — 4:00 PM',   workDays: [1,2,3,4,5],     status: 'pending',  lastIn: '—',     dob: '09/06/1997', gender: 'F' },
{ id: 'EMP-00412', name: 'Roberto Núñez Espinal',  cedula: '40299123413', dept: 'Sistemas e Informática',   role: 'Ingeniero de Redes',    email: 'rnunez@uasd.edu.do',      phone: '+1 829 555 0712', schedule: '8:00 AM — 5:00 PM',   workDays: [1,2,3,4,5],     status: 'ok',       lastIn: '08:11', dob: '27/04/1988', gender: 'M' },
{ id: 'EMP-00103', name: 'Elena Sánchez Brito',    cedula: '00122849136', dept: 'Rectoría',                 role: 'Asistente Ejecutiva',   email: 'esanchez@uasd.edu.do',    phone: '+1 809 555 0119', schedule: '7:30 AM — 3:30 PM',   workDays: [1,2,3,4,5],     status: 'ok',       lastIn: '07:32', dob: '11/12/1994', gender: 'F' },
{ id: 'EMP-00276', name: 'Pedro Antonio Rosario',  cedula: '40255678232', dept: 'Mantenimiento',            role: 'Supervisor',            email: 'prosario@uasd.edu.do',    phone: '+1 829 555 0834', schedule: '6:00 AM — 2:00 PM',   workDays: [1,2,3,4,5,6],   status: 'ok',       lastIn: '05:51', dob: '03/08/1980', gender: 'M' },
{ id: 'EMP-00388', name: 'Yolanda Fernández Cruz', cedula: '40277231048', dept: 'Facultad de Humanidades',  role: 'Profesora Auxiliar',    email: 'yfernandez@uasd.edu.do',  phone: '+1 809 555 0277', schedule: '10:00 AM — 2:00 PM',  workDays: [1,2,3,4,5],     status: 'inactive', lastIn: '—',     dob: '15/02/1962',  gender: 'F', inactiveReason: 'retired',    inactiveComment: 'Pensionada por tiempo de servicio. Resolución RRHH-2026-014.' },
{ id: 'EMP-00455', name: 'Miguel Ángel Rodríguez', cedula: '00133987215', dept: 'Seguridad',                role: 'Agente',                email: 'mrodriguez@uasd.edu.do',  phone: '+1 829 555 0566', schedule: '2:00 PM — 10:00 PM',  workDays: [0,1,2,3,4,5,6], status: 'ok',       lastIn: '13:58', dob: '20/05/1993', gender: 'M' },
{ id: 'EMP-00521', name: 'Sofía Hernández Marte',  cedula: '40211029347', dept: 'Registro',                 role: 'Analista',              email: 'shernandez@uasd.edu.do',  phone: '+1 809 555 0445', schedule: '8:00 AM — 4:00 PM',   workDays: [1,2,3,4,5],     status: 'pending',  lastIn: '—',     dob: '07/10/1999', gender: 'F' },
{ id: 'EMP-00237', name: 'Francisco Pimentel Lora',cedula: '00128913451', dept: 'Comunicaciones',           role: 'Coordinador',           email: 'fpimentel@uasd.edu.do',   phone: '+1 829 555 0291', schedule: '9:00 AM — 5:00 PM',   workDays: [1,2,3,4,5],     status: 'inactive', lastIn: '08:45', dob: '25/11/1986', gender: 'M', inactiveReason: 'other',      inactiveComment: 'Licencia administrativa temporal pendiente de revisión.' },
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
    checkCircle: <><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></>,
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
    eyeOff: <><path d="M17.9 17.9A10 10 0 0 1 12 19c-6 0-10-7-10-7a17.6 17.6 0 0 1 4.1-5"/><path d="M9.5 4.7A9.4 9.4 0 0 1 12 5c6 0 10 7 10 7a17.7 17.7 0 0 1-2.2 3.2"/><path d="M14.1 14.1A3 3 0 0 1 9.9 9.9"/><path d="M2 2l20 20"/></>,
    chevDown: <><path d="m6 9 6 6 6-6" /></>,
    filter: <><path d="M4 6h16M7 12h10M10 18h4" /></>,
    bell: <><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M14 21a2 2 0 0 1-4 0" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
    shieldUser: <><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M6.376 18.91a6 6 0 0 1 11.249.003"/><circle cx="12" cy="11" r="4"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
    calendar1: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /><path d="M11 14h1v4" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
    barChart: <><path d="M3 21h18M7 17V9M12 17V5M17 17v-7" /></>,
    activity: <><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" /></>,
    upload: <><path d="M12 16V4M6 10l6-6 6 6M5 20h14" /></>,
    award: <><circle cx="12" cy="8" r="5" /><path d="M8.5 12.5 7 22l5-3 5 3-1.5-9.5" /><path d="m9.8 8 1.4 1.4L14.5 6" /></>,
    school: <><path d="M14 21v-3a2 2 0 0 0-4 0v3"/><path d="M18 4.933V21"/><path d="m4 6 7.106-3.79a2 2 0 0 1 1.788 0L20 6"/><path d="m6 11-3.52 2.147a1 1 0 0 0-.48.854V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a1 1 0 0 0-.48-.853L18 11"/><path d="M6 4.933V21"/><circle cx="12" cy="9" r="2"/></>,
    idCard: <><path d="M13.5 8h-3"/><path d="m15 2-1 2h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3"/><path d="M16.899 22A5 5 0 0 0 7.1 22"/><path d="m9 2 3 6"/><circle cx="12" cy="15" r="3"/></>,
    edit: <><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></>,
    trash: <><path d="M3 6h18M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M19 6l-1 14c0 1-1 2-2 2H8c-1 0-2-1-2-2L5 6" /></>,
    userPlus: <><circle cx="10" cy="8" r="4" /><path d="M2 21c0-4.4 3.6-8 8-8M19 11v6M16 14h6" /></>,
    users: <><circle cx="9" cy="7" r="3.5" /><path d="M2 21c0-3.9 3.1-7 7-7s7 3.1 7 7" /><circle cx="18" cy="6" r="2.5" /><path d="M22 21c0-2.8-1.8-5.2-4.3-6.1" /></>,
    landPlot: <><path d="m12 8 6-3-6-3v10"/><path d="m8 11.99-5.5 3.14a1 1 0 0 0 0 1.74l8.5 4.86a2 2 0 0 0 2 0l8.5-4.86a1 1 0 0 0 0-1.74L16 12"/><path d="m6.49 12.85 11.02 6.3"/><path d="M17.51 12.85 6.5 19.15"/></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    diamondPlus: <><path d="M12 8v8"/><path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0z"/><path d="M8 12h8"/></>,
    userMale: <><circle cx="10" cy="11" r="7"/><path d="M15.5 3H21v5.5M21 3l-7 7"/></>,
    userFemale: <><circle cx="12" cy="9" r="7"/><path d="M12 16v6M9 19h6"/></>,
    photoMale: <><circle cx="12" cy="7" r="4.5"/><path d="M3.5 21a8.5 8.5 0 0 1 17 0"/></>,
    photoFemale: <><path d="M6.5 9C6.5 4.5 9 2 12 2s5.5 2.5 5.5 7"/><path d="M6.5 9c-.5 3 0 5.5 1.5 7"/><path d="M17.5 9c.5 3 0 5.5-1.5 7"/><circle cx="12" cy="8" r="3.5"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></>,
    baseball: <><circle cx="12" cy="12" r="9"/><path d="M9.5 4.5C8 7.5 8 10.5 9.5 13.5"/><path d="M9.5 13.5C8 16.5 8 19 9.5 21"/><path d="M14.5 4.5C16 7.5 16 10.5 14.5 13.5"/><path d="M14.5 13.5C16 16.5 16 19 14.5 21"/></>,
    absent: <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4"/></>,
    doorOpen: <><path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h20"/><path d="M13 20V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16"/></>,
    alertTriangle: <><path d="M10.3 3.5 2 19h20L13.7 3.5a2 2 0 0 0-3.4 0z"/><path d="M12 9v4"/><circle cx="12" cy="16.5" r=".5" fill="currentColor"/></>,
    key: <><circle cx="7.5" cy="15.5" r="3.5"/><path d="M10.9 12.1 20 3"/><path d="M19 4l1 1"/><path d="M17 6l1 1"/></>,
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
    : { name: 'Administrador', description: 'Acceso completo a todas las funciones del sistema.', color: '#8b2942', perms: ['enroll','reports','manage','roles','audit','farm','liceo'] };
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
  const canReports = typeof userHasPermission !== 'function' || userHasPermission('reports');
  const reportsItem = { id: 'reports', label: t.nav_reports, icon: 'barChart', key: '2' };
  const mainNav = [
    { id: 'dashboard', label: t.nav_dashboard, icon: 'user', key: '1' },
    ...(canReports ? [reportsItem] : []),
  ];
  const regNav = [
    { id: 'register',  label: t.nav_register,  icon: 'userPlus', key: '1' },
    { id: 'dashboard', label: t.nav_dashboard, icon: 'user',     key: '2' },
    ...(canReports ? [{ ...reportsItem, key: '3' }] : []),
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
        <Crest size={66} />
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
            <Icon name={n.icon} size={17} />
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
        {(typeof userHasPermission !== 'function' || userHasPermission('liceo')) && (
        <button className="usermenu__action" onClick={() => { onAdmin('liceo'); }}>
          <Icon name="school" size={15} /> {t.liceo_title}
        </button>
        )}
        <button className="usermenu__action" onClick={() => { onAdmin('feriados'); }}>
          <Icon name="calendar1" size={15} /> {t.feriados_title}
        </button>
        {(typeof userHasPermission !== 'function' || userHasPermission('vacaciones')) && (
        <button className="usermenu__action" onClick={() => { onAdmin('vacaciones'); }}>
          <Icon name="absent" size={15} /> {t.vacaciones_title}
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

  const canFarm     = typeof userHasPermission === 'function' ? userHasPermission('farm')  : true;
  const canLiceo    = typeof userHasPermission === 'function' ? userHasPermission('liceo') : true;
  const canVac      = typeof userHasPermission === 'function' ? userHasPermission('vacaciones') : true;
  const canFeriados = typeof userHasPermission === 'function' ? userHasPermission('feriados') : true;
  const tabs = [
    { id: 'account',   label: t.um_view,       icon: 'user'      },
    ...(canAudit ? [{ id: 'changelog', label: t.nav_changelog, icon: 'activity'   }] : []),
    ...(canRoles ? [{ id: 'roles',     label: t.nav_roles,     icon: 'shieldUser' }] : []),
    ...(canFarm  ? [{ id: 'finca',     label: t.farm_title,    icon: 'landPlot'   }] : []),
    ...(canLiceo ? [{ id: 'liceo',     label: t.liceo_title,   icon: 'school'     }] : []),
    ...(canFeriados ? [{ id: 'feriados', label: t.feriados_title, icon: 'calendar1' }] : []),
    ...(canVac   ? [{ id: 'vacaciones', label: t.vacaciones_title, icon: 'absent' }] : []),
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
            {tab === 'finca'     && <FarmView      t={t} lang={lang} setRoute={setRoute} />}
            {tab === 'liceo'     && <LiceoView     t={t} lang={lang} setRoute={setRoute} />}
            {tab === 'vacaciones' && <VacacionesView t={t} lang={lang} />}
            {tab === 'feriados'  && <FeriadosView  t={t} lang={lang} />}
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

// Antepone un apóstrofo a celdas que empiezan con =,+,-,@ antes de exportar a
// CSV/Excel — sin esto, Excel/Sheets puede interpretar el valor como fórmula
// (CSV/formula injection clásico) si un campo de texto libre (ej. comentario
// de un empleado) empieza con esos caracteres.
function csvSafe(v) {
  const s = String(v ?? '');
  return /^[=+\-@]/.test(s) ? `'${s}` : s;
}

/* Render template with <strong> */
const T = ({ html }) => <span dangerouslySetInnerHTML={{ __html: html }} />;

/* ── Toggle switch ───────────────────────────────────────────── */
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

const PRESET_COLORS = ['#C9A961','#2C3E66','#1A1F3A','#5a6a90','#8a6c2c','#2f7a5a','#8b2942','#4a6fa5'];
const PRESET_COLOR_NAMES = {
  '#C9A961': 'Dorado', '#2C3E66': 'Marino', '#1A1F3A': 'Medianoche', '#5a6a90': 'Pizarra',
  '#8a6c2c': 'Ámbar', '#2f7a5a': 'Verde', '#8b2942': 'Granate', '#4a6fa5': 'Azul',
};
const COLOR_NAMES = [
  { name:'Rojo',     hex:'#c1554d' }, { name:'Naranja', hex:'#c1793c' },
  { name:'Ámbar',    hex:'#8a6c2c' }, { name:'Lima',    hex:'#5a8a2c' },
  { name:'Verde',    hex:'#2f7a5a' }, { name:'Turquesa',hex:'#2d7d9a' },
  { name:'Azul',     hex:'#4a6fa5' }, { name:'Marino',  hex:'#2C3E66' },
  { name:'Púrpura',  hex:'#6b5b9e' }, { name:'Rosa',    hex:'#9e4d6b' },
  { name:'Gris',     hex:'#8b97b3' },
];
function nearestColorName(hex) {
  if (PRESET_COLOR_NAMES[hex]) return PRESET_COLOR_NAMES[hex];
  const r1 = parseInt(hex.slice(1,3),16), g1 = parseInt(hex.slice(3,5),16), b1 = parseInt(hex.slice(5,7),16);
  return COLOR_NAMES.reduce((best, c) => {
    const r2 = parseInt(c.hex.slice(1,3),16), g2 = parseInt(c.hex.slice(3,5),16), b2 = parseInt(c.hex.slice(5,7),16);
    const d = (r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2;
    return d < best.d ? { d, name: c.name } : best;
  }, { d: Infinity, name: '' }).name;
}
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS_ES   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

const EMP_EMAILS_KEY = 'uasd_employee_emails';
function getEmployeeEmails() {
  // Con backend, el email ya vive en employees.email — se deriva de EMPLOYEES
  // en vez de mantener esta tabla redundante.
  if (typeof isBackendActive === 'function' && isBackendActive()) {
    const map = {};
    EMPLOYEES.forEach(e => { map[e.id] = e.email; });
    return map;
  }
  try { return JSON.parse(localStorage.getItem(EMP_EMAILS_KEY) || '{}'); } catch { return {}; }
}
function saveEmployeeEmail(empId, email) {
  // Con backend: no-op — saveRegisteredEmployee ya persiste employee.email.
  if (typeof isBackendActive === 'function' && isBackendActive()) return;
  try {
    const map = getEmployeeEmails();
    map[empId] = email;
    localStorage.setItem(EMP_EMAILS_KEY, JSON.stringify(map));
  } catch {}
}

/* ── Departamento system ──────────────────────────── */
const DEFAULT_DEPARTMENTS = [
  'Data', 'Recursos Humanos', 'Facultad de Ingeniería', 'Biblioteca Central',
  'Tesorería', 'Sistemas e Informática', 'Rectoría', 'Mantenimiento',
  'Facultad de Humanidades', 'Seguridad', 'Registro', 'Comunicaciones',
  'Economato', 'Caja',
];
const DEPARTMENTS_KEY = 'uasd_departments';
function getDepartments() {
  if (typeof isBackendActive === 'function' && isBackendActive() && DataStore.departments.length) {
    return [...DataStore.departments].sort();
  }
  try {
    const custom = JSON.parse(localStorage.getItem(DEPARTMENTS_KEY) || '[]');
    const merged = [...new Set([...DEFAULT_DEPARTMENTS, ...custom])].sort();
    return merged;
  } catch { return [...DEFAULT_DEPARTMENTS].sort(); }
}
function addDepartment(name) {
  const trimmed = name.trim();
  if (!trimmed) return false;
  if (typeof isBackendActive === 'function' && isBackendActive()) {
    if (DataStore.departments.includes(trimmed)) return false;
    DataStore.departments.push(trimmed);
    apiFetch('/departments', { method: 'POST', body: JSON.stringify({ name: trimmed }) }).catch(err => console.error('addDepartment', err));
    return true;
  }
  try {
    const existing = JSON.parse(localStorage.getItem(DEPARTMENTS_KEY) || '[]');
    if (existing.includes(trimmed) || DEFAULT_DEPARTMENTS.includes(trimmed)) return false;
    existing.push(trimmed);
    localStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(existing));
    return true;
  } catch { return false; }
}
function removeDepartment(name) {
  try {
    let custom = JSON.parse(localStorage.getItem(DEPARTMENTS_KEY) || '[]');
    custom = custom.filter(d => d !== name);
    localStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(custom));
    return true;
  } catch { return false; }
}

/* ── Employee persistence ─────────────────────────────────────────────
   Con sesión de backend activa (DataStore.session), EMPLOYEES ya viene
   poblado desde Postgres (bootstrapStore() en store.jsx) y es la única
   fuente — por eso getRegisteredEmployees() devuelve [] en ese caso (si no,
   [...EMPLOYEES, ...getRegisteredEmployees()] duplicaría). Sin sesión (modo
   dev/local por defecto, sin login), se preserva el comportamiento anterior
   100% intacto sobre localStorage. */
const REG_EMP_KEY = 'uasd_registered_employees';
function getRegisteredEmployees() {
  if (typeof isBackendActive === 'function' && isBackendActive()) return [];
  try { return JSON.parse(localStorage.getItem(REG_EMP_KEY) || '[]'); } catch { return []; }
}
function saveRegisteredEmployee(emp) {
  if (typeof isBackendActive === 'function' && isBackendActive()) {
    const idx = EMPLOYEES.findIndex(e => e.id === emp.id);
    if (idx >= 0) EMPLOYEES[idx] = { ...EMPLOYEES[idx], ...emp };
    else EMPLOYEES.push(emp);

    const isNew = idx < 0;
    const body = JSON.stringify(emp);
    const req = isNew
      ? apiFetch('/employees', { method: 'POST', body })
      : apiFetch(`/employees/${encodeURIComponent(emp.id)}`, { method: 'PATCH', body });
    req.catch(err => console.error('saveRegisteredEmployee', err));
    return;
  }
  try {
    const list = getRegisteredEmployees();
    const idx = list.findIndex(e => e.id === emp.id);
    if (idx >= 0) list[idx] = emp;
    else list.push(emp);
    localStorage.setItem(REG_EMP_KEY, JSON.stringify(list));
  } catch {}
}
function removeRegisteredEmployee(empId) {
  if (typeof isBackendActive === 'function' && isBackendActive()) {
    const idx = EMPLOYEES.findIndex(e => e.id === empId);
    if (idx >= 0) EMPLOYEES.splice(idx, 1);
    apiFetch(`/employees/${encodeURIComponent(empId)}`, { method: 'DELETE' }).catch(err => console.error('removeRegisteredEmployee', err));
    return;
  }
  try {
    const list = getRegisteredEmployees().filter(e => e.id !== empId);
    localStorage.setItem(REG_EMP_KEY, JSON.stringify(list));
  } catch {}
}

/* ── Días feriados ─────────────────────────────── */
const HOLIDAYS_KEY            = 'uasd_holidays';
const HOLIDAYS_REMOVED_KEY    = 'uasd_holidays_removed';
const HOLIDAY_TYPES_KEY       = 'uasd_holiday_types';
const HOLIDAY_TYPE_COLORS_KEY = 'uasd_holiday_type_colors';
const DEFAULT_HOLIDAYS = [
  { date: '2026-01-01', name_es: 'Año Nuevo', name_en: "New Year's Day", type: 'fixed' },
  { date: '2026-01-06', name_es: 'Día de los Santos Reyes', name_en: 'Epiphany', type: 'fixed' },
  { date: '2026-01-21', name_es: 'Día de la Altagracia', name_en: 'Our Lady of Altagracia', type: 'fixed' },
  { date: '2026-01-26', name_es: 'Día de Duarte', name_en: 'Duarte Day', type: 'fixed' },
  { date: '2026-02-27', name_es: 'Día de la Independencia', name_en: 'Independence Day', type: 'fixed' },
  { date: '2026-04-18', name_es: 'Viernes Santo', name_en: 'Good Friday', type: 'fixed' },
  { date: '2026-05-01', name_es: 'Día del Trabajo', name_en: 'Labor Day', type: 'fixed' },
  { date: '2026-06-19', name_es: 'Día de Corpus Christi', name_en: 'Corpus Christi', type: 'fixed' },
  { date: '2026-08-16', name_es: 'Restauración de la República', name_en: 'Restoration Day', type: 'fixed' },
  { date: '2026-09-24', name_es: 'Nuestra Señora de las Mercedes', name_en: 'Our Lady of Mercedes', type: 'fixed' },
  { date: '2026-10-28', name_es: 'Día de la UASD', name_en: 'UASD Day', type: 'uasd' },
  { date: '2026-11-06', name_es: 'Día de la Constitución', name_en: 'Constitution Day', type: 'fixed' },
  { date: '2026-12-25', name_es: 'Navidad', name_en: 'Christmas Day', type: 'fixed' },
];
function getHolidays() {
  try {
    const custom = JSON.parse(localStorage.getItem(HOLIDAYS_KEY) || '[]');
    const removed = new Set(JSON.parse(localStorage.getItem(HOLIDAYS_REMOVED_KEY) || '[]'));
    const customDates = new Set(custom.map(h => h.date));
    const defaults = DEFAULT_HOLIDAYS.filter(h => !removed.has(h.date) && !customDates.has(h.date));
    return [...defaults, ...custom].sort((a, b) => a.date.localeCompare(b.date));
  } catch { return [...DEFAULT_HOLIDAYS]; }
}
function saveHolidays(list) {
  try {
    const defaultDates = new Set(DEFAULT_HOLIDAYS.map(h => h.date));
    const activeDates = new Set(list.map(h => h.date));
    const removed = DEFAULT_HOLIDAYS.filter(h => !activeDates.has(h.date)).map(h => h.date);
    const custom = list.filter(h => !defaultDates.has(h.date));
    const overrides = list.filter(h => defaultDates.has(h.date));
    localStorage.setItem(HOLIDAYS_KEY, JSON.stringify([...overrides, ...custom]));
    localStorage.setItem(HOLIDAYS_REMOVED_KEY, JSON.stringify(removed));
  } catch {}
}
function isHoliday(dateStr) {
  return getHolidays().some(h => h.date === dateStr);
}

function FeriadosView({ t, lang }) {
  const [holidays, setHolidays] = React.useState(getHolidays);
  const [year, setYear] = React.useState(new Date().getFullYear());
  const [addOpen, setAddOpen] = React.useState(false);
  const [newDate, setNewDate] = React.useState('');
  const [newName, setNewName] = React.useState('');
  const [err, setErr] = React.useState({});
  const [editId, setEditId] = React.useState(null);
  const [editClosing, setEditClosing] = React.useState(false);
  const [editDate, setEditDate] = React.useState('');
  const [editName, setEditName] = React.useState('');
  const [editErr, setEditErr] = React.useState({});
  const [newType, setNewType] = React.useState('');
  const [editType, setEditType] = React.useState('');
  const [hoverId, setHoverId] = React.useState(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState(null);
  const [customHTypes, setCustomHTypes] = React.useState(function() {
    try { return JSON.parse(localStorage.getItem(HOLIDAY_TYPES_KEY) || '[]'); } catch { return []; }
  });
  const [hTypeColors, setHTypeColors] = React.useState(function() {
    try { return JSON.parse(localStorage.getItem(HOLIDAY_TYPE_COLORS_KEY) || '{}'); } catch { return {}; }
  });

  var extendedHTypePalette = React.useMemo(function() {
    var usedInPreset = {};
    PRESET_COLORS.forEach(function(h) { usedInPreset[h] = true; });
    return PRESET_COLORS.concat(
      COLOR_NAMES.map(function(c) { return c.hex; }).filter(function(h) { return !usedInPreset[h]; })
    );
  }, []);

  function nextHTypeColor(colors) {
    var usedSet = {};
    Object.values(colors).forEach(function(h) { usedSet[h.toLowerCase()] = true; });
    var available = extendedHTypePalette.filter(function(h) { return !usedSet[h.toLowerCase()]; });
    if (available.length > 0) {
      return available[Math.floor(Math.random() * available.length)];
    }
    var hex;
    do { hex = '#' + Math.floor(Math.random()*0xFFFFFF).toString(16).padStart(6, '0'); } while (usedSet[hex.toLowerCase()]);
    return hex;
  }

  const closeAdd = () => { setAddOpen(false); setNewDate(''); setNewName(''); setNewType(''); setErr({}); };

  const closeEdit = () => {
    setEditClosing(true);
    setTimeout(() => { setEditId(null); setEditClosing(false); setEditErr({}); }, 300);
  };

  React.useEffect(() => { setNewDate(''); setNewType(''); setEditDate(''); setEditType(''); setEditId(null); setEditClosing(false); setEditErr({}); }, [year]);

  React.useEffect(() => {
    const now = new Date();
    if (now.getMonth() !== 11) return;
    const nextYear = now.getFullYear() + 1;
    const nextYearStr = String(nextYear);
    const nextYearHolidays = holidays.filter(h => h.date.startsWith(nextYearStr));
    if (nextYearHolidays.length > 0) return;
    const currentYearStr = String(now.getFullYear());
    const currentHolidays = holidays.filter(h => h.date.startsWith(currentYearStr));
    if (currentHolidays.length === 0) return;
    const inherited = currentHolidays.map(h => ({
      ...h,
      date: h.date.replace(currentYearStr, nextYearStr),
    }));
    const merged = [...holidays, ...inherited].sort((a, b) => a.date.localeCompare(b.date));
    setHolidays(merged);
    saveHolidays(merged);
  }, []);

  const defaults = new Set(DEFAULT_HOLIDAYS.map(h => h.date));
  const yearHolidays = holidays.filter(h => h.date.startsWith(String(year)));

  const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const MONTHS = lang === 'es' ? MONTHS_ES : MONTHS_EN;
  const DOW_ES  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const DOW_EN  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const DOWS    = lang === 'es' ? DOW_ES : DOW_EN;

  const HEAD_ES = ['Fecha','Día','Nombre','Tipo',''];
  const HEAD_EN = ['Date','Day','Name','Type',''];
  const HEADS   = lang === 'es' ? HEAD_ES : HEAD_EN;

  const TYPE_LABEL = {
    fixed: lang === 'es' ? 'Nacional' : 'National',
    uasd: 'UASD',
    'Nacional': 'Nacional', 'National': 'National', 'UASD': 'UASD',
  };

  const hTypeToDisplay = function(type) {
    if (!type || type === 'custom') return '';
    return TYPE_LABEL[type] || type;
  };

  const hTypeOptions = [lang === 'es' ? 'Nacional' : 'National', 'UASD'].concat(customHTypes);
  const removableHTypes = new Set(customHTypes);

  React.useEffect(function() {
    var colors = { ...hTypeColors };
    var changed = false;
    var builtinNacional = lang === 'es' ? 'Nacional' : 'National';
    if (!colors[builtinNacional]) { colors[builtinNacional] = '#2C3E66'; changed = true; }
    if (!colors['UASD']) { colors['UASD'] = '#8b2942'; changed = true; }
    hTypeOptions.forEach(function(label) {
      if (!colors[label]) { colors[label] = nextHTypeColor(colors); changed = true; }
    });
    if (changed) {
      localStorage.setItem(HOLIDAY_TYPE_COLORS_KEY, JSON.stringify(colors));
      setHTypeColors(colors);
    }
  }, []);

  const commitHType = function(label) {
    var trimmed = label.trim();
    if (!trimmed) return;
    if (!hTypeOptions.some(function(o) { return o.toLowerCase() === trimmed.toLowerCase(); })) {
      var updated = customHTypes.concat([trimmed]);
      localStorage.setItem(HOLIDAY_TYPES_KEY, JSON.stringify(updated));
      setCustomHTypes(updated);
      var colors = { ...hTypeColors };
      colors[trimmed] = nextHTypeColor(colors);
      localStorage.setItem(HOLIDAY_TYPE_COLORS_KEY, JSON.stringify(colors));
      setHTypeColors(colors);
    }
  };

  const hTypeBadgeStyle = function(label) {
    var hex = hTypeColors[label];
    if (!hex) return {};
    return { background: hexToRgba(hex, 0.12), color: hex };
  };

  const removeHType = function(label) {
    var updated = customHTypes.filter(function(t) { return t !== label; });
    localStorage.setItem(HOLIDAY_TYPES_KEY, JSON.stringify(updated));
    setCustomHTypes(updated);
  };

  function parseDDMMYYYY(v) {
    if (!v) return '';
    const [d, m, y] = v.split('/');
    if (!d || !m || !y || y.length < 4) return '';
    return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
  }

  const remove = (date) => {
    const removed = holidays.find(h => h.date === date);
    const next = holidays.filter(h => h.date !== date);
    setHolidays(next); saveHolidays(next);
    if (removed && removed.type && !hTypeOptions.includes(removed.type)) {
      const typeStillUsed = next.some(h => h.type === removed.type);
      if (!typeStillUsed) {
        var colors = { ...hTypeColors };
        delete colors[removed.type];
        localStorage.setItem(HOLIDAY_TYPE_COLORS_KEY, JSON.stringify(colors));
        setHTypeColors(colors);
      }
    }
  };

  const add = () => {
    const e = {};
    const sd = parseDDMMYYYY(newDate);
    if (!sd) e.date = true;
    else if (holidays.some(h => h.date === sd)) e.date = 'dup';
    if (!newName.trim()) e.name = true;
    if (!newType.trim()) e.type = true;
    if (Object.keys(e).length) { setErr(e); return; }
    if (newType.trim()) commitHType(newType);
    const entry = { date: sd, name_es: newName.trim(), name_en: newName.trim(), type: newType.trim() };
    const next = [...holidays, entry].sort((a, b) => a.date.localeCompare(b.date));
    setHolidays(next); saveHolidays(next);
    setYear(Number(sd.slice(0,4)));
    setAddOpen(false); setNewDate(''); setNewName(''); setNewType(''); setErr({});
  };

  const startEdit = (h) => {
    const d = new Date(h.date + 'T00:00:00');
    const dd = String(d.getDate()).padStart(2,'0');
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const yyyy = d.getFullYear();
    setEditClosing(false);
    setEditId(h.date);
    setEditDate(`${dd}/${mm}/${yyyy}`);
    setEditName(lang === 'es' ? h.name_es : h.name_en);
    setEditType(hTypeToDisplay(h.type));
    setEditErr({});
    setAddOpen(false);
  };

  const saveEdit = () => {
    const e = {};
    const sd = parseDDMMYYYY(editDate);
    if (!sd) e.date = true;
    else if (holidays.some(h => h.date === sd && h.date !== editId)) e.date = 'dup';
    if (!editName.trim()) e.name = true;
    if (!editType.trim()) e.type = true;
    if (Object.keys(e).length) { setEditErr(e); return; }
    const next = holidays.map(h => {
      if (h.date !== editId) return h;
      if (editType.trim()) commitHType(editType);
      return { date: sd, name_es: editName.trim(), name_en: editName.trim(), type: editType.trim() };
    }).sort((a, b) => a.date.localeCompare(b.date));
    setHolidays(next); saveHolidays(next);
    setEditId(null); setEditDate(''); setEditName(''); setEditType(''); setEditErr({});
    setYear(Number(sd.slice(0,4)));
  };

  return (
    <div className="page" style={{ paddingTop: 32, paddingBottom: 60, animation:'body-in .28s cubic-bezier(0.33,1,0.68,1) both' }}>
      <div className="page__head" style={{ marginBottom: 24 }}>
        <div>
          <div className="page__title">{t.feriados_title}</div>
          <div className="page__subtitle">{t.feriados_sub}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', border:'1px solid var(--ink-100)', borderRadius:8, padding:'4px 6px', background:'var(--paper)', width:140, boxSizing:'border-box', flexShrink:0 }}>
            <button className="dp-cal__arrow" onClick={() => setYear(y => y-1)}>‹</button>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:15, fontWeight:700, color:'var(--ink-800)', flex:1, textAlign:'center' }}>{year}</span>
            <button className="dp-cal__arrow" onClick={() => setYear(y => y+1)}>›</button>
          </div>
          <button className={'btn ' + (addOpen ? 'btn--ghost' : 'btn--primary')} style={{ gap:7 }} onClick={() => { if (addOpen) { closeAdd(); } else { setAddOpen(true); setEditId(null); } }}>
            <Icon name={addOpen ? 'x' : 'plus'} size={13}/> {lang === 'es' ? 'Agregar' : 'Add'}
          </button>
        </div>
      </div>

      <div style={{ overflow:'hidden', display:'grid', gridTemplateRows: addOpen ? '1fr' : '0fr', marginBottom: addOpen ? 20 : 0, transition:'grid-template-rows .38s cubic-bezier(0.16,1,0.3,1), margin-bottom .38s cubic-bezier(0.16,1,0.3,1)' }}>
        <div style={{ minHeight:0 }}>
        <div style={{ opacity: addOpen ? 1 : 0, transform: addOpen ? 'scale(1)' : 'scale(0.98)', transition: addOpen ? 'opacity .28s .05s ease, transform .36s .03s cubic-bezier(0.16,1,0.3,1)' : 'opacity .2s ease, transform .2s ease', background:'var(--cream-100)', border:'1px solid var(--ink-100)', borderRadius:'var(--radius-md)', padding:20, display:'flex', flexDirection:'column', gap:14, pointerEvents: addOpen ? 'auto' : 'none' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
            <div className={`field${err.date ? ' field--error' : ''}`}>
              <span className="field__label">{lang === 'es' ? 'Fecha' : 'Date'} <span className="field__req">*</span></span>
              <DatePickerField key={`add-date-${addOpen}`} value={newDate} onChange={v => { setNewDate(v); setErr(p => ({...p, date:false})); }} minDate={year+'-01-01'} maxDate={year+'-12-31'} />
              {err.date === 'dup' && <span className="field__err">{lang === 'es' ? 'Esta fecha ya existe.' : 'Date already exists.'}</span>}
            </div>
            <div className={`field${err.name ? ' field--error' : ''}`}>
              <span className="field__label">{lang === 'es' ? 'Nombre' : 'Name'} <span className="field__req">*</span></span>
              <input className="field__input" style={{ fontFamily:'var(--font-sans)' }} value={newName} maxLength={60} placeholder={lang === 'es' ? 'Ej. Día de la universidad…' : 'e.g. University Day…'}
                onChange={e => { setNewName(e.target.value); setErr(p => ({...p, name:false})); }} />
            </div>
            <div className={`field${err.type ? ' field--error' : ''}`}>
              <span className="field__label">{lang === 'es' ? 'Tipo' : 'Type'} <span className="field__req">*</span></span>
              <ComboBoxField key={`add-type-${addOpen}`} value={newType} options={hTypeOptions} maxLength={40}
                placeholder={lang === 'es' ? 'Seleccionar o agregar…' : 'Select or add…'}
                onChange={v => { setNewType(v); setErr(p => ({...p, type:false})); }}
                removableOptions={removableHTypes} onRemoveOption={removeHType} />
              {err.type && <span className="field__err">{lang === 'es' ? 'El tipo es obligatorio.' : 'Type is required.'}</span>}
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
            <button className="btn btn--ghost" onClick={closeAdd}>{lang === 'es' ? 'Cancelar' : 'Cancel'}</button>
            <button className="btn btn--primary" onClick={add}>{lang === 'es' ? 'Guardar' : 'Save'}</button>
          </div>
        </div>
        </div>
      </div>

      {yearHolidays.length === 0 ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, padding:'100px 24px', textAlign:'center', color:'var(--ink-300)', minHeight:400 }}>
          <Icon name="calendar" size={48} stroke={1.2} />
          <div style={{ fontSize:20, fontWeight:600, color:'var(--ink-500)' }}>{lang === 'es' ? 'No hay feriados registrados' : 'No holidays found'}</div>
          <div style={{ fontSize:14, color:'var(--ink-300)', maxWidth:320, lineHeight:1.5 }}>{lang === 'es' ? `Agrega un feriado para comenzar con el año ${year}.` : `Add a holiday to get started with ${year}.`}</div>
        </div>
      ) : (
        <div className="chart-card" style={{ padding:0, overflow:'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width:'22%', background:'transparent' }}>{HEADS[0]}</th>
                <th style={{ width:'10%', background:'transparent' }}>{HEADS[1]}</th>
                <th style={{ width:'38%', background:'transparent' }}>{HEADS[2]}</th>
                <th style={{ width:'18%', background:'transparent' }}>{HEADS[3]}</th>
                <th style={{ width:'12%', textAlign:'right', background:'transparent' }}>{HEADS[4]}</th>
              </tr>
            </thead>
            <tbody key={year} className="tbody--in">
              {yearHolidays.map((h, i) => {
                const d = new Date(h.date + 'T00:00:00');
                const monthName = MONTHS[d.getMonth()];
                const dayNum = d.getDate();
                const dow = DOWS[d.getDay()];
                const isDefault = defaults.has(h.date);
                const typeKey = h.type || 'custom';
                const typeLabel = TYPE_LABEL[typeKey] || (typeKey !== 'custom' ? typeKey : (lang === 'es' ? 'Personalizado' : 'Custom'));
                const typeBadgeStyle = hTypeBadgeStyle(typeLabel);
                if (editId === h.date) {
                  const ec = editClosing;
                  return (
                    <tr key={h.date} className="table__row--selected" style={{ cursor:'default' }}>
                      <td colSpan={5} style={{ padding:0 }}>
                        <div style={{ animation: ec ? 'credFormOut .3s cubic-bezier(0.4,0,0.2,1) both' : 'credFormIn .22s cubic-bezier(0.16,1,0.3,1) both', background:'var(--cream-100)', border:'1px solid var(--ink-100)', borderRadius:'var(--radius-md)', padding:20, display:'flex', flexDirection:'column', gap:14, pointerEvents: ec ? 'none' : 'auto' }}>
                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
                            <div className={`field${editErr.date ? ' field--error' : ''}`}>
                              <span className="field__label">{lang === 'es' ? 'Fecha' : 'Date'} <span className="field__req">*</span></span>
                              <DatePickerField key={`edit-date-${editId}`} value={editDate} onChange={v => { setEditDate(v); setEditErr(p => ({...p, date:false})); }} minDate={year+'-01-01'} maxDate={year+'-12-31'} />
                              {editErr.date === 'dup' && <span className="field__err">{lang === 'es' ? 'Esta fecha ya existe.' : 'Date already exists.'}</span>}
                            </div>
                            <div className={`field${editErr.name ? ' field--error' : ''}`}>
                              <span className="field__label">{lang === 'es' ? 'Nombre' : 'Name'} <span className="field__req">*</span></span>
                              <input className="field__input" style={{ fontFamily:'var(--font-sans)' }} value={editName} maxLength={60}
                                onChange={e => { setEditName(e.target.value); setEditErr(p => ({...p, name:false})); }} />
                            </div>
                            <div className={`field${editErr.type ? ' field--error' : ''}`}>
                              <span className="field__label">{lang === 'es' ? 'Tipo' : 'Type'} <span className="field__req">*</span></span>
                              <ComboBoxField key={`edit-type-${editId}`} value={editType} options={hTypeOptions} maxLength={40}
                                placeholder={lang === 'es' ? 'Seleccionar o agregar…' : 'Select or add…'}
                                onChange={v => { setEditType(v); setEditErr(p => ({...p, type:false})); }}
                                removableOptions={removableHTypes} onRemoveOption={removeHType} />
                              {editErr.type && <span className="field__err">{lang === 'es' ? 'El tipo es obligatorio.' : 'Type is required.'}</span>}
                            </div>
                          </div>
                          <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
                            <button className="btn btn--ghost" onClick={closeEdit}>{lang === 'es' ? 'Cancelar' : 'Cancel'}</button>
                            <button className="btn btn--primary" onClick={saveEdit}>{lang === 'es' ? 'Guardar' : 'Save'}</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr key={h.date}
                    onMouseEnter={() => setHoverId(h.date)}
                    onMouseLeave={() => setHoverId(null)}>
                    <td style={{ whiteSpace:'nowrap' }}>
                      <span className="mono" style={{ fontWeight:700, color:'var(--ink-800)' }}>
                        {String(dayNum).padStart(2,'0')}
                      </span>
                      <span style={{ fontWeight:500, color:'var(--ink-600)', marginLeft:6 }}>
                        {monthName}
                      </span>
                      <span className="mono" style={{ fontSize:12, color:'var(--ink-400)', marginLeft:4 }}>
                        {year}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize:12, color:'var(--ink-400)' }}>{dow}</span>
                    </td>
                    <td style={{ fontWeight:600, color:'var(--ink-800)' }}>
                      {lang === 'es' ? h.name_es : h.name_en}
                    </td>
                    <td>
                      <span className="badge" style={{ fontSize:11, padding:'2px 9px', ...typeBadgeStyle }}>{typeLabel}</span>
                    </td>
                    <td className="table__actions-cell">
                      <div className="table__actions" style={{ opacity: hoverId === h.date ? 1 : 0, transition:'opacity .15s ease' }}>
                        <button className="table__action-btn" onClick={() => startEdit(h)} title={lang === 'es' ? 'Editar' : 'Edit'}>
                          <Icon name="edit" size={14}/>
                        </button>
                        <button className="table__action-btn table__action-btn--del" onClick={() => setDeleteConfirm(h)} title={lang === 'es' ? 'Eliminar' : 'Delete'}>
                          <Icon name="trash" size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {deleteConfirm && ReactDOM.createPortal(
        <div className="edit-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="del-confirm" onClick={e => e.stopPropagation()}>
            <div className="del-confirm__hero">
              <div className="del-confirm__icon">
                <Icon name="trash" size={40} stroke={1.6}/>
              </div>
              <div className="del-confirm__title">
                {lang === 'es' ? '¿Eliminar feriado?' : 'Delete holiday?'}
              </div>
              <div className="del-confirm__sub">
                {lang === 'es'
                  ? <span>Estás a punto de eliminar <strong style={{ color:'#fff' }}>{deleteConfirm.name_es}</strong>.<br/>Esta acción no se puede deshacer.</span>
                  : <span>You are about to delete <strong style={{ color:'#fff' }}>{deleteConfirm.name_en}</strong>.<br/>This action cannot be undone.</span>
                }
              </div>
              <div className="del-confirm__id mono">
                {(() => { const [y,m,d] = deleteConfirm.date.split('-'); return `${d}/${m}/${y}`; })()}
              </div>
            </div>
            <div className="del-confirm__foot">
              <button className="btn btn--ghost" onClick={() => setDeleteConfirm(null)}>
                {lang === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button className="btn btn--danger" onClick={() => { remove(deleteConfirm.date); setDeleteConfirm(null); }}>
                <Icon name="trash" size={14}/> {lang === 'es' ? 'Eliminar' : 'Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

Object.assign(window, {
  I18N, EMPLOYEES, RECENT_LOG, DEPT_DIST,
  Icon, Crest, TopBar, LangSwitch, AdminPanel,
  initials, StatusBadge, formatTime, formatDate, formatCedula, T, getLateMinutes,
  WEEK_DAYS, WorkDaysPicker, workDaysLabel,
  PRESET_COLORS, PRESET_COLOR_NAMES, nearestColorName,
  MONTHS_ES, DAYS_ES,
  getEmployeeEmails, saveEmployeeEmail,
  DEFAULT_DEPARTMENTS, getDepartments, addDepartment, removeDepartment,
  getRegisteredEmployees, saveRegisteredEmployee, removeRegisteredEmployee,
  getHolidays, saveHolidays, isHoliday, DEFAULT_HOLIDAYS,
  FeriadosView,
});
