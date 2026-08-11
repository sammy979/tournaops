-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isPro" BOOLEAN NOT NULL DEFAULT false,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "dodoCustomerId" TEXT,
    "dodoSubscriptionId" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "chatHistory" JSONB DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "game" TEXT NOT NULL DEFAULT 'pubg_mobile',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "format" TEXT,
    "prizePool" TEXT,
    "maxTeams" INTEGER NOT NULL DEFAULT 16,
    "scoringRule" JSONB NOT NULL DEFAULT '{}',
    "mapRotation" TEXT[],
    "overlayToken" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "discord" TEXT,
    "rules" TEXT,
    "bannerImage" TEXT,
    "brandingData" JSONB,
    "scheduleData" JSONB,
    "registrationData" JSONB,
    "trophyImage" TEXT,
    "coverImage" TEXT,
    "sponsorLogos" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tag" TEXT,
    "logo" TEXT,
    "seed" INTEGER,
    "contact" TEXT,
    "players" JSONB NOT NULL,
    "banner" TEXT,
    "country" TEXT,
    "countryFlag" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tournamentId" TEXT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Round" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "matchesPerLobby" INTEGER NOT NULL,
    "advanceTop" INTEGER,
    "order" INTEGER NOT NULL,
    "lobbies" JSONB NOT NULL,
    "tournamentId" TEXT NOT NULL,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "lobbyId" TEXT NOT NULL,
    "map" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "matchNumber" INTEGER,
    "results" JSONB,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "groupId" TEXT,
    "stageId" TEXT,
    "compensationData" JSONB,
    "notes" TEXT,
    "penaltyData" JSONB,
    "screenshotUrl" TEXT,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscordImport" (
    "id" TEXT NOT NULL,
    "discordMessageId" TEXT NOT NULL,
    "discordChannelId" TEXT NOT NULL,
    "discordChannelName" TEXT NOT NULL,
    "discordGuildId" TEXT NOT NULL,
    "discordGuildName" TEXT NOT NULL,
    "discordUserId" TEXT NOT NULL,
    "discordUsername" TEXT NOT NULL,
    "discordUserAvatar" TEXT,
    "messageContent" TEXT NOT NULL,
    "parseResult" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "importedAt" TIMESTAMP(3),
    "tournamentId" TEXT,

    CONSTRAINT "DiscordImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stage" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "numGroups" INTEGER NOT NULL DEFAULT 1,
    "teamsPerGroup" INTEGER NOT NULL DEFAULT 16,
    "matchesPerGroup" INTEGER NOT NULL DEFAULT 4,
    "totalTeams" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "registrationOpens" TIMESTAMP(3),
    "registrationCloses" TIMESTAMP(3),
    "qualificationRule" JSONB NOT NULL,
    "teamsAdvancing" INTEGER NOT NULL DEFAULT 0,
    "teamsEliminated" INTEGER NOT NULL DEFAULT 0,
    "mapRotation" TEXT[],
    "scoringRule" JSONB NOT NULL DEFAULT '{}',
    "tiebreakerOrder" TEXT[] DEFAULT ARRAY['points', 'kills', 'damage', 'wwcd']::TEXT[],
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StageGroup" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "teamIds" TEXT[],
    "matchIds" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StageGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamProgression" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "entryPosition" INTEGER,
    "finalPosition" INTEGER,
    "points" INTEGER NOT NULL DEFAULT 0,
    "kills" INTEGER NOT NULL DEFAULT 0,
    "matchesPlayed" INTEGER NOT NULL DEFAULT 0,
    "wwcds" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "advancedToStageId" TEXT,
    "manualOverride" BOOLEAN NOT NULL DEFAULT false,
    "overrideNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamProgression_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualifierAuditLog" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "stageId" TEXT,
    "teamId" TEXT,
    "teamName" TEXT,
    "action" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "metadata" JSONB,
    "performedBy" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QualifierAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserScoringPreset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scoringRule" JSONB NOT NULL DEFAULT '{}',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserScoringPreset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tournamentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ign" TEXT,
    "pubgId" TEXT,
    "role" TEXT,
    "photo" TEXT,
    "country" TEXT,
    "countryFlag" TEXT,
    "isCaptain" BOOLEAN NOT NULL DEFAULT false,
    "isSubstitute" BOOLEAN NOT NULL DEFAULT false,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Tournament_slug_key" ON "Tournament"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tournament_overlayToken_key" ON "Tournament"("overlayToken");

-- CreateIndex
CREATE INDEX "Tournament_userId_idx" ON "Tournament"("userId");

-- CreateIndex
CREATE INDEX "Tournament_slug_idx" ON "Tournament"("slug");

-- CreateIndex
CREATE INDEX "Tournament_status_idx" ON "Tournament"("status");

-- CreateIndex
CREATE INDEX "Team_tournamentId_idx" ON "Team"("tournamentId");

-- CreateIndex
CREATE INDEX "Team_seed_idx" ON "Team"("seed");

-- CreateIndex
CREATE INDEX "Round_tournamentId_idx" ON "Round"("tournamentId");

-- CreateIndex
CREATE INDEX "Round_order_idx" ON "Round"("order");

-- CreateIndex
CREATE INDEX "Match_tournamentId_idx" ON "Match"("tournamentId");

-- CreateIndex
CREATE INDEX "Match_status_idx" ON "Match"("status");

-- CreateIndex
CREATE INDEX "Match_roundId_idx" ON "Match"("roundId");

-- CreateIndex
CREATE INDEX "Match_stageId_idx" ON "Match"("stageId");

-- CreateIndex
CREATE UNIQUE INDEX "Match_stageId_groupId_matchNumber_key" ON "Match"("stageId", "groupId", "matchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "DiscordImport_discordMessageId_key" ON "DiscordImport"("discordMessageId");

-- CreateIndex
CREATE INDEX "DiscordImport_status_idx" ON "DiscordImport"("status");

-- CreateIndex
CREATE INDEX "DiscordImport_discordGuildId_idx" ON "DiscordImport"("discordGuildId");

-- CreateIndex
CREATE INDEX "DiscordImport_receivedAt_idx" ON "DiscordImport"("receivedAt");

-- CreateIndex
CREATE INDEX "Stage_tournamentId_order_idx" ON "Stage"("tournamentId", "order");

-- CreateIndex
CREATE INDEX "Stage_status_idx" ON "Stage"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Stage_tournamentId_order_key" ON "Stage"("tournamentId", "order");

-- CreateIndex
CREATE INDEX "StageGroup_stageId_idx" ON "StageGroup"("stageId");

-- CreateIndex
CREATE UNIQUE INDEX "StageGroup_stageId_order_key" ON "StageGroup"("stageId", "order");

-- CreateIndex
CREATE INDEX "TeamProgression_tournamentId_teamId_idx" ON "TeamProgression"("tournamentId", "teamId");

-- CreateIndex
CREATE INDEX "TeamProgression_stageId_idx" ON "TeamProgression"("stageId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamProgression_stageId_teamId_key" ON "TeamProgression"("stageId", "teamId");

-- CreateIndex
CREATE INDEX "QualifierAuditLog_tournamentId_idx" ON "QualifierAuditLog"("tournamentId");

-- CreateIndex
CREATE INDEX "QualifierAuditLog_stageId_idx" ON "QualifierAuditLog"("stageId");

-- CreateIndex
CREATE INDEX "QualifierAuditLog_teamId_idx" ON "QualifierAuditLog"("teamId");

-- CreateIndex
CREATE INDEX "QualifierAuditLog_performedAt_idx" ON "QualifierAuditLog"("performedAt");

-- CreateIndex
CREATE INDEX "UserScoringPreset_userId_idx" ON "UserScoringPreset"("userId");

-- CreateIndex
CREATE INDEX "Player_teamId_idx" ON "Player"("teamId");

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscordImport" ADD CONSTRAINT "DiscordImport_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageGroup" ADD CONSTRAINT "StageGroup_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamProgression" ADD CONSTRAINT "TeamProgression_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamProgression" ADD CONSTRAINT "TeamProgression_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualifierAuditLog" ADD CONSTRAINT "QualifierAuditLog_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualifierAuditLog" ADD CONSTRAINT "QualifierAuditLog_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserScoringPreset" ADD CONSTRAINT "UserScoringPreset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

