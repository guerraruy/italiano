-- CreateTable
CREATE TABLE "VerbConjugation" (
    "id" TEXT NOT NULL,
    "verbId" TEXT NOT NULL,
    "conjugation" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerbConjugation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VerbConjugation_verbId_key" ON "VerbConjugation"("verbId");

-- CreateIndex
CREATE INDEX "VerbConjugation_verbId_idx" ON "VerbConjugation"("verbId");

-- AddForeignKey
ALTER TABLE "VerbConjugation" ADD CONSTRAINT "VerbConjugation_verbId_fkey" FOREIGN KEY ("verbId") REFERENCES "Verb"("id") ON DELETE CASCADE ON UPDATE CASCADE;

