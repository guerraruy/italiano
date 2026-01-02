-- CreateTable
CREATE TABLE "Verb" (
    "id" TEXT NOT NULL,
    "italian" TEXT NOT NULL,
    "regular" BOOLEAN NOT NULL DEFAULT true,
    "reflexive" BOOLEAN NOT NULL DEFAULT false,
    "tr_ptBR" TEXT NOT NULL,
    "tr_en" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verb_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Verb_italian_key" ON "Verb"("italian");
