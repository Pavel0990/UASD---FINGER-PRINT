-- CreateTable
CREATE TABLE "departments" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_statuses" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "employee_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "label_es" TEXT NOT NULL,
    "label_en" TEXT NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cedula" TEXT NOT NULL,
    "department_id" INTEGER,
    "role_title" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "schedule" TEXT,
    "work_days" INTEGER[],
    "status_id" INTEGER NOT NULL,
    "inactive_reason" TEXT,
    "inactive_comment" TEXT,
    "dob" DATE,
    "gender" CHAR(1),
    "photo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credentials" (
    "employee_id" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "must_change_password" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "credentials_pkey" PRIMARY KEY ("employee_id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "employee_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "user_agent" TEXT,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "is_protected" BOOLEAN NOT NULL DEFAULT false,
    "max_members" INTEGER,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "roleId" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleId","permission_id")
);

-- CreateTable
CREATE TABLE "role_assignments" (
    "employee_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_assignments_pkey" PRIMARY KEY ("employee_id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" BIGSERIAL NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor_employee_id" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "subject_employee_id" TEXT,
    "subject_label" TEXT,
    "detail" JSONB,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "employee_statuses_code_key" ON "employee_statuses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "employees_cedula_key" ON "employees"("cedula");

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "employee_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_assignments" ADD CONSTRAINT "role_assignments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_assignments" ADD CONSTRAINT "role_assignments_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_employee_id_fkey" FOREIGN KEY ("actor_employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_subject_employee_id_fkey" FOREIGN KEY ("subject_employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
