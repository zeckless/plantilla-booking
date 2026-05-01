-- CreateTable
CREATE TABLE "time_slots" (
    "id" TEXT NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "time_slots_datetime_key" ON "time_slots"("datetime");
