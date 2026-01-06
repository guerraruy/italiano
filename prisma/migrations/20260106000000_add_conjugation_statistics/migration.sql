-- CreateTable
CREATE TABLE "ConjugationStatistic" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verbId" TEXT NOT NULL,
    "mood" TEXT NOT NULL,
    "tense" TEXT NOT NULL,
    "person" TEXT NOT NULL,
    "correctAttempts" INTEGER NOT NULL DEFAULT 0,
    "wrongAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastPracticed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConjugationStatistic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConjugationStatistic_userId_idx" ON "ConjugationStatistic"("userId");

-- CreateIndex
CREATE INDEX "ConjugationStatistic_verbId_idx" ON "ConjugationStatistic"("verbId");

-- CreateIndex
CREATE INDEX "ConjugationStatistic_userId_verbId_idx" ON "ConjugationStatistic"("userId", "verbId");

-- CreateIndex
CREATE UNIQUE INDEX "ConjugationStatistic_userId_verbId_mood_tense_person_key" ON "ConjugationStatistic"("userId", "verbId", "mood", "tense", "person");

-- AddForeignKey
ALTER TABLE "ConjugationStatistic" ADD CONSTRAINT "ConjugationStatistic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

