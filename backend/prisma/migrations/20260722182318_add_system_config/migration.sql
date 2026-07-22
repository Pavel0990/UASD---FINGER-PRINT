-- CreateTable
CREATE TABLE "system_config" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "late_threshold_minutes" INTEGER NOT NULL DEFAULT 15,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);
