-- CreateTable
CREATE TABLE "eventualities" (
    "id" SERIAL NOT NULL,
    "employee_id" TEXT NOT NULL,
    "date_start" DATE NOT NULL,
    "date_end" DATE NOT NULL,
    "type" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "approved_by_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventualities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collective_vacation_periods" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collective_vacation_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collective_vacation_days" (
    "id" SERIAL NOT NULL,
    "period_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "collective_vacation_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collective_vacation_assignments" (
    "id" SERIAL NOT NULL,
    "period_id" INTEGER NOT NULL,
    "employee_id" TEXT NOT NULL,

    CONSTRAINT "collective_vacation_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "collective_vacation_periods_year_key" ON "collective_vacation_periods"("year");

-- CreateIndex
CREATE UNIQUE INDEX "collective_vacation_days_period_id_date_key" ON "collective_vacation_days"("period_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "collective_vacation_assignments_period_id_employee_id_key" ON "collective_vacation_assignments"("period_id", "employee_id");

-- AddForeignKey
ALTER TABLE "eventualities" ADD CONSTRAINT "eventualities_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collective_vacation_days" ADD CONSTRAINT "collective_vacation_days_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "collective_vacation_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collective_vacation_assignments" ADD CONSTRAINT "collective_vacation_assignments_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "collective_vacation_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collective_vacation_assignments" ADD CONSTRAINT "collective_vacation_assignments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
