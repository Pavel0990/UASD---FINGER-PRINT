/* shared.jsx — i18n, layout chrome, icons, employee data */

const I18N = {
  es: {
    appName: 'Sistema de Registro Biométrico',
    appSub: 'UASD · Departamento de Recursos Humanos',
    nav_kiosk: 'Marcaje',
    nav_dashboard: 'Empleados',
    nav_register: 'Registrar',
    nav_reports: 'Reportes',
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
    dash_sub: 'Personal del Recinto Valverde, Mao.',
    dash_sub_count: 'Personal del Recinto · {total} registrados · {pending} pendientes de captura',
    dash_search: 'Buscar por nombre, cédula, código, departamento o cargo…',
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
    dash_col_schedule: 'Horario',
    dash_col_status: 'Estado',
    dash_col_last: 'Último marcaje',
    dash_filter_all: 'Todos',
    dash_filter_active: 'Activos',
    dash_filter_pending: 'Pendientes',
    dash_filter_inactive: 'No activos',
    dash_filter_licensed: 'Licencia laboral',
    dash_filter_retired: 'Pensionados',
    dash_filter_suspended: 'Suspendidos',
    dash_status_ok: 'Registrado',
    dash_status_pending: 'Pendiente',
    dash_status_inactive: 'No activos',
    dash_status_suspended: 'Suspendidos',
    dash_status_inactive_other: 'Licencia laboral',
    dash_status_retired: 'Pensionados',
    dash_col_comment: 'Comentario',
    dash_no_comment: '-',
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
    reg_sub: 'Complete los datos y capture la huella biométrica del empleado.',
    reg_step_1: 'Datos personales',
    reg_step_2: 'Captura biométrica',
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
    reg_fld_schedule: 'Horario laboral',
    reg_fld_photo: 'Foto de perfil',
    reg_photo_upload: 'Subir foto',
    reg_capture_title: 'Captura de huella',
    reg_capture_instr: 'Coloque el dedo en el lector',
    reg_capture_finger: 'Dedo a registrar',
    reg_capture_quality: 'Calidad',
    reg_capture_start: 'Iniciar captura',
    reg_capture_recap: 'Recapturar',
    reg_capture_done: 'Captura completada',
    reg_confirm_title: 'Revisión final',
    reg_confirm_sub: 'Confirme que los datos son correctos antes de guardar.',
    reg_saved: 'Empleado registrado correctamente',
    reg_cancel: 'Cancelar',
    reg_step1_sub: 'Datos requeridos del empleado',
    reg_photo_sub: 'Opcional · JPG / PNG, máx. 2MB',
    reg_photo_ph: 'foto de perfil',
    reg_photo_tip_label: 'Consejo:',
    reg_photo_tip: 'Use foto frontal, con fondo neutral y rostro claramente visible. Esta foto aparecerá en el terminal de marcaje al reconocer al empleado.',
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
    reg_schedule_hint: 'Formato 12 h · ej. 8:00 a.m. — 4:00 p.m.',
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
    rep_days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  },
  en: {
    appName: 'Biometric Attendance System',
    appSub: 'UASD · Human Resources Department',
    nav_kiosk: 'Clock-in',
    nav_dashboard: 'Employees',
    nav_register: 'Register',
    nav_reports: 'Reports',
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
    dash_sub: 'Valverde campus staff, Mao.',
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
    dash_delta_total: '+12 this week',
    dash_delta_today: '+8% vs. yesterday',
    dash_delta_pending: 'Requires capture',
    dash_delta_active: 'On-site now',
    dash_pill_review: 'Review',
    dash_pill_live: 'Live',
    dash_empty: 'No employees found.',
    dash_showing: 'Showing {n} of {total} employees',

    reg_title: 'Register new employee',
    reg_sub: 'Complete the details and capture the employee\'s fingerprint.',
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
    reg_photo_sub: 'Optional · JPG / PNG, max. 2MB',
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
    reg_schedule_hint: '12 h format · e.g. 8:00 a.m. — 4:00 p.m.',
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
    rep_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  }
};

const EMPLOYEES = [
{ id: 'EMP-00601', name: 'Gabriel Gómez', cedula: '402-2027458-3', dept: 'Data', role: 'Analista de Datos', email: 'ggomez@uasd.edu.do', phone: '+1 809 555 0601', schedule: '8:00 a.m. — 6:00 p.m.', status: 'ok', lastIn: '07:58' },
{ id: 'EMP-00214', name: 'María Reyes Castillo', cedula: '402-1284563-7', dept: 'Facultad de Ingeniería', role: 'Decana', email: 'mreyes@uasd.edu.do', phone: '+1 809 555 0142', schedule: '7:00 a.m. — 3:00 p.m.', status: 'ok', lastIn: '07:54' },
{ id: 'EMP-00187', name: 'Carlos Méndez Polanco', cedula: '001-1923847-2', dept: 'Recursos Humanos', role: 'Director', email: 'cmendez@uasd.edu.do', phone: '+1 809 555 0238', schedule: '8:00 a.m. — 4:00 p.m.', status: 'ok', lastIn: '08:02' },
{ id: 'EMP-00342', name: 'Lourdes Peña Vargas', cedula: '402-7782341-9', dept: 'Biblioteca Central', role: 'Bibliotecaria Jefa', email: 'lpena@uasd.edu.do', phone: '+1 829 555 0411', schedule: '8:00 a.m. — 5:00 p.m.', status: 'ok', lastIn: '07:48' },
{ id: 'EMP-00501', name: 'Juan Manuel Tavárez', cedula: '402-3349872-1', dept: 'Facultad de Ciencias', role: 'Profesor Titular', email: 'jtavarez@uasd.edu.do', phone: '+1 809 555 0623', schedule: '9:00 a.m. — 1:00 p.m.', status: 'ok', lastIn: '08:55' },
{ id: 'EMP-00298', name: 'Ana Cristina Jiménez', cedula: '001-1145782-4', dept: 'Tesorería', role: 'Auxiliar Contable', email: 'ajimenez@uasd.edu.do', phone: '+1 809 555 0388', schedule: '8:00 a.m. — 4:00 p.m.', status: 'pending', lastIn: '—' },
{ id: 'EMP-00412', name: 'Roberto Núñez Espinal', cedula: '402-9912341-3', dept: 'Sistemas e Informática', role: 'Ingeniero de Redes', email: 'rnunez@uasd.edu.do', phone: '+1 829 555 0712', schedule: '8:00 a.m. — 5:00 p.m.', status: 'ok', lastIn: '08:11' },
{ id: 'EMP-00103', name: 'Elena Sánchez Brito', cedula: '001-2284913-6', dept: 'Rectoría', role: 'Asistente Ejecutiva', email: 'esanchez@uasd.edu.do', phone: '+1 809 555 0119', schedule: '7:30 a.m. — 3:30 p.m.', status: 'ok', lastIn: '07:32' },
{ id: 'EMP-00276', name: 'Pedro Antonio Rosario', cedula: '402-5567823-2', dept: 'Mantenimiento', role: 'Supervisor', email: 'prosario@uasd.edu.do', phone: '+1 829 555 0834', schedule: '6:00 a.m. — 2:00 p.m.', status: 'ok', lastIn: '05:51' },
{ id: 'EMP-00388', name: 'Yolanda Fernández Cruz', cedula: '402-7723104-8', dept: 'Facultad de Humanidades', role: 'Profesora Auxiliar', email: 'yfernandez@uasd.edu.do', phone: '+1 809 555 0277', schedule: '10:00 a.m. — 2:00 p.m.', status: 'inactive', inactiveReason: 'retired', inactiveComment: 'Pensionada por tiempo de servicio. Resolución RRHH-2026-014.', lastIn: '—' },
{ id: 'EMP-00455', name: 'Miguel Ángel Rodríguez', cedula: '001-3398721-5', dept: 'Seguridad', role: 'Agente', email: 'mrodriguez@uasd.edu.do', phone: '+1 829 555 0566', schedule: '2:00 p.m. — 10:00 p.m.', status: 'ok', lastIn: '13:58' },
{ id: 'EMP-00521', name: 'Sofía Hernández Marte', cedula: '402-1102934-7', dept: 'Registro', role: 'Analista', email: 'shernandez@uasd.edu.do', phone: '+1 809 555 0445', schedule: '8:00 a.m. — 4:00 p.m.', status: 'pending', lastIn: '—' },
{ id: 'EMP-00237', name: 'Francisco Pimentel Lora', cedula: '001-2891345-1', dept: 'Comunicaciones', role: 'Coordinador', email: 'fpimentel@uasd.edu.do', phone: '+1 829 555 0291', schedule: '9:00 a.m. — 5:00 p.m.', status: 'inactive', inactiveReason: 'other', inactiveComment: 'Licencia administrativa temporal pendiente de revisión.', lastIn: '08:45' }];


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
{ name: 'Administración', value: 53, color: '#C9A961' },
{ name: 'Servicios', value: 31, color: '#8b97b3' }];


/* ============================================
   Icons
   ============================================ */
const Icon = ({ name, size = 18, stroke = 1.6 }) => {
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
    bell: <><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M14 21a2 2 0 0 1-4 0" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
    barChart: <><path d="M3 21h18M7 17V9M12 17V5M17 17v-7" /></>,
    upload: <><path d="M12 16V4M6 10l6-6 6 6M5 20h14" /></>,
    award: <><circle cx="12" cy="8" r="5" /><path d="M8.5 12.5 7 22l5-3 5 3-1.5-9.5" /><path d="m9.8 8 1.4 1.4L14.5 6" /></>
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


/* ============================================
   Top bar (admin pages)
   ============================================ */
function TopBar({ route, setRoute, lang, setLang, t }) {
  const nav = [
  { id: 'dashboard', label: t.nav_dashboard, icon: 'user', key: '1' },
  { id: 'reports', label: t.nav_reports, icon: 'barChart', key: '2' }];

  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e) => {if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);};
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);

  const [accountOpen, setAccountOpen] = React.useState(false);

  return (
    <div className="topbar">
      <div className="topbar__brand">
        <Crest size={58} />
        <div>
          <div className="topbar__title">{t.appName}</div>
          <div className="topbar__subtitle">{t.appSub}</div>
        </div>
      </div>
      <nav className="topbar__nav">
        {nav.map((n) =>
        <button key={n.id}
        className={`topbar__nav-item ${route === n.id ? 'topbar__nav-item--active' : ''}`}
        onClick={() => setRoute(n.id)}
        title={`${n.label}  ·  ${n.key}`}>
            <Icon name={n.icon} size={15} />
            {n.label}
          </button>
        )}
      </nav>
      <div className="topbar__right">
        <LangSwitch lang={lang} setLang={setLang} />
        <div className="topbar__usermenu" ref={menuRef}>
          <button className={`topbar__user ${menuOpen ? 'topbar__user--open' : ''}`} onClick={() => setMenuOpen((o) => !o)}>
            <div className="topbar__user-avatar">GG</div>
            <div className="topbar__user-name">G. Gómez</div>
            <span className="topbar__user-caret"><Icon name="chevDown" size={14} /></span>
          </button>
          {menuOpen && <UserMenu t={t} setRoute={setRoute} close={() => setMenuOpen(false)} onAccount={() => { setMenuOpen(false); setAccountOpen(true); }} />}
        </div>
        <button className="topbar__nav-item topbar__signout" onClick={() => setRoute('kiosk')} aria-label={t.nav_signout} data-tip={t.nav_signout}>
          <Icon name="logOut" size={16} />
        </button>
      </div>
      {accountOpen && <AccountModal t={t} lang={lang} setLang={setLang} close={() => setAccountOpen(false)} />}
    </div>);

}

function TopBarClock({ t, lang }) {
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const dateStr = now.toLocaleDateString(lang === 'es' ? 'es-DO' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  return (
    <div className="topbar__clock">
      <div className="topbar__clock-time mono">{formatTime(now, lang)}</div>
      <div className="topbar__clock-date">{dateStr}</div>
    </div>);
}

function UserMenu({ t, setRoute, close, onAccount }) {
  return (
    <div className="usermenu" role="menu">
      <div className="usermenu__head">
        <div className="usermenu__avatar">GG</div>
        <div className="usermenu__id">
          <div className="usermenu__name">Gabriel Gómez</div>
          <div className="usermenu__email mono">ggomez@uasd.edu.do</div>
        </div>
      </div>

      <div className="usermenu__role">
        <div className="usermenu__role-row">
          <span className="usermenu__role-label">{t.um_role}</span>
          <span className="badge badge--ok"><span className="badge__dot"></span>{t.um_role_admin}</span>
        </div>
        <div className="usermenu__perms">
          {[t.um_perm_enroll, t.um_perm_reports, t.um_perm_manage].map((p, i) =>
          <span className="usermenu__perm" key={i}><Icon name="check" size={12} stroke={2.6} />{p}</span>
          )}
        </div>
      </div>

      <div className="usermenu__meta">
        <div className="usermenu__meta-item">
          <span className="usermenu__meta-label">{t.um_id}</span>
          <span className="usermenu__meta-val mono">EMP-00601</span>
        </div>
        <div className="usermenu__meta-item">
          <span className="usermenu__meta-label">{t.um_dept}</span>
          <span className="usermenu__meta-val">Data</span>
        </div>
        <div className="usermenu__meta-item">
          <span className="usermenu__meta-label">{t.um_last}</span>
          <span className="usermenu__meta-val mono">07:58 a.m.</span>
        </div>
      </div>

      <div className="usermenu__actions">
        <button className="usermenu__action" onClick={onAccount}>
          <Icon name="user" size={15} /> {t.um_view}
        </button>
      </div>
    </div>);

}

function AccountModal({ t, lang, setLang, close }) {
  const [cur, setCur] = React.useState('');
  const [npw, setNpw] = React.useState('');
  const [conf, setConf] = React.useState('');
  const [msg, setMsg] = React.useState(null); // {type, text}
  const [reenroll, setReenroll] = React.useState(false);

  const strong = (p) => p.length >= 8 && /[A-Z]/.test(p) && /[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p);

  const savePw = (e) => {
    e.preventDefault();
    if (!strong(npw)) { setMsg({ type: 'err', text: t.acc_pw_short }); return; }
    if (npw !== conf) { setMsg({ type: 'err', text: t.acc_pw_mismatch }); return; }
    setMsg({ type: 'ok', text: t.acc_pw_ok });
    setCur(''); setNpw(''); setConf('');
  };

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="acc-overlay" onMouseDown={close}>
      <div className="acc-modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="acc-modal__head">
          <div className="acc-modal__head-id">
            <div className="acc-modal__avatar">GG</div>
            <div>
              <div className="acc-modal__title">{t.acc_title}</div>
              <div className="acc-modal__sub">{t.acc_sub}</div>
            </div>
          </div>
          <button className="acc-modal__close" onClick={close} aria-label={t.acc_close}>
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="acc-modal__body">
          {/* Change password */}
          <section className="acc-sec">
            <div className="acc-sec__title"><Icon name="shield" size={15} /> {t.acc_pw_title}</div>
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
              <div className="acc-form__foot">
                <span className="field__hint">{t.acc_pw_hint}</span>
                <button className="btn btn--primary" type="submit">{t.acc_pw_save}</button>
              </div>
              {msg && (
                <div className={`acc-msg acc-msg--${msg.type}`}>
                  <Icon name={msg.type === 'ok' ? 'check' : 'x'} size={14} stroke={2.4} /> {msg.text}
                </div>
              )}
            </form>
          </section>
        </div>
      </div>
    </div>);

}

function LangSwitch({ lang, setLang, dark = false }) {
  return (
    <div className={`lang ${dark ? 'lang--dark' : ''}`} data-lang={lang}>
      <span className="lang__pill"></span>
      <button className={`lang__btn ${lang === 'es' ? 'lang__btn--active' : ''}`}
      onClick={() => setLang('es')}>ES</button>
      <button className={`lang__btn ${lang === 'en' ? 'lang__btn--active' : ''}`}
      onClick={() => setLang('en')}>EN</button>
    </div>);

}

/* ============================================
   Helpers
   ============================================ */
const initials = (name) =>
name.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase();

const inactiveStatus = (employee, t) => {
  if (employee?.status !== 'inactive') return null;
  if (employee.inactiveReason === 'retired') {
    return { cls: 'badge--retired', label: t.dash_status_retired || 'Pensionados' };
  }
  if (employee.inactiveReason === 'suspended') {
    return { cls: 'badge--warn', label: t.dash_status_suspended || 'Suspendidos' };
  }
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
    <span className={`badge ${s.cls}`}>
      {s.icon ? <Icon name={s.icon} size={12} stroke={2.1} /> : <span className="badge__dot"></span>}
      {s.label}
    </span>);

};

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
Object.assign(window, {
  I18N, EMPLOYEES, RECENT_LOG, DEPT_DIST,
  Icon, Crest, TopBar, LangSwitch,
  initials, StatusBadge, formatTime, formatDate, T
});
