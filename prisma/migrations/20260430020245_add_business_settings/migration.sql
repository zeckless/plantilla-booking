-- CreateTable
CREATE TABLE "business_settings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Barbería & Estética',
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "instagram" TEXT,
    "mapsEmbedUrl" TEXT,

    CONSTRAINT "business_settings_pkey" PRIMARY KEY ("id")
);
