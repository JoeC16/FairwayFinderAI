-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CONSUMER', 'RETAILER', 'ADMIN');

-- CreateEnum
CREATE TYPE "FittingStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'PROCESSING');

-- CreateEnum
CREATE TYPE "VideoView" AS ENUM ('FACE_ON', 'DOWN_THE_LINE');

-- CreateEnum
CREATE TYPE "VideoAnalysisStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'NOT_REQUESTED');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('DRIVER', 'FAIRWAY_WOOD', 'HYBRID', 'DRIVING_IRON', 'IRON_SET', 'INDIVIDUAL_IRON', 'WEDGE', 'PUTTER', 'SHAFT', 'GRIP', 'BAG', 'ACCESSORY');

-- CreateEnum
CREATE TYPE "RetailerPlan" AS ENUM ('STARTER', 'PROFESSIONAL', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "image" TEXT,
    "password" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CONSUMER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "referralCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "FittingSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "retailerId" TEXT,
    "guestToken" TEXT,
    "status" "FittingStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "source" TEXT,
    "metadata" JSONB,
    "swingAnalysis" JSONB,
    "resultsUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FittingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerProfile" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "age" INTEGER,
    "gender" TEXT,
    "dominantHand" TEXT NOT NULL DEFAULT 'right',
    "handicap" DOUBLE PRECISION NOT NULL,
    "heightCm" INTEGER NOT NULL,
    "wristToFloorCm" INTEGER,
    "averageScore" INTEGER,
    "goals" TEXT[],
    "playingFrequency" TEXT,
    "experience" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PlayerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrentBag" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "clubs" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CurrentBag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShotTendencies" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "typicalMiss" TEXT,
    "strikePattern" TEXT,
    "ballFlight" TEXT,
    "shotShape" TEXT,
    "frustrations" TEXT[],
    "driverNotes" TEXT,
    "ironNotes" TEXT,
    "shortGameNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ShotTendencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DistanceMatrix" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "distances" JSONB NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'yards',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DistanceMatrix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaunchMonitorData" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "monitorType" TEXT,
    "driverData" JSONB,
    "ironData" JSONB,
    "wedgeData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LaunchMonitorData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SwingVideo" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "view" "VideoView" NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "analysisStatus" "VideoAnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "analysisData" JSONB,
    "analyzedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SwingVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FittingResult" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "overallConfidence" DOUBLE PRECISION NOT NULL,
    "confidenceScores" JSONB NOT NULL,
    "driverRec" JSONB,
    "ironRec" JSONB,
    "wedgeRec" JSONB,
    "shaftRec" JSONB,
    "lieLengthRec" JSONB,
    "bagGapAnalysis" JSONB,
    "upgradeOrder" JSONB,
    "aiSummary" TEXT,
    "pdfKey" TEXT,
    "pdfUrl" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FittingResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER,
    "category" "ProductCategory" NOT NULL,
    "subcategory" TEXT,
    "description" TEXT,
    "specs" JSONB NOT NULL,
    "imageUrl" TEXT,
    "msrp" DOUBLE PRECISION,
    "tags" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductRecommendation" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "productId" TEXT,
    "category" "ProductCategory" NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "confidence" DOUBLE PRECISION NOT NULL,
    "reasoning" TEXT NOT NULL,
    "specs" JSONB,
    "custom" JSONB,
    CONSTRAINT "ProductRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Retailer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "address" TEXT,
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#166534',
    "secondaryColor" TEXT NOT NULL DEFAULT '#d97706',
    "customDomain" TEXT,
    "plan" "RetailerPlan" NOT NULL DEFAULT 'STARTER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "trialEndsAt" TIMESTAMP(3),
    "onboardedAt" TIMESTAMP(3),
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Retailer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalPartner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "tagline" TEXT,
    "website" TEXT NOT NULL,
    "searchUrlTemplate" TEXT,
    "logoUrl" TEXT,
    "accentColor" TEXT NOT NULL DEFAULT '#166534',
    "bgColor" TEXT NOT NULL DEFAULT '#f0fdf4',
    "initials" TEXT,
    "countries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "scraperEnabled" BOOLEAN NOT NULL DEFAULT false,
    "scraperType" TEXT,
    "scraperConfig" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ExternalPartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapeCache" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "results" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ScrapeCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetailerInventoryItem" (
    "id" TEXT NOT NULL,
    "retailerId" TEXT NOT NULL,
    "productId" TEXT,
    "sku" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "loft" TEXT,
    "shaft" TEXT,
    "flex" TEXT,
    "handedness" TEXT,
    "length" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "salePrice" DOUBLE PRECISION,
    "stockQty" INTEGER NOT NULL DEFAULT 0,
    "productUrl" TEXT,
    "imageUrl" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "specs" JSONB,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RetailerInventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryMatch" (
    "id" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "matchScore" DOUBLE PRECISION NOT NULL,
    "matchBreakdown" JSONB,
    "matchReason" TEXT,
    CONSTRAINT "InventoryMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "retailerId" TEXT NOT NULL,
    "sessionId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "location" TEXT,
    "handicap" DOUBLE PRECISION,
    "interests" TEXT[],
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "source" TEXT,
    "notes" TEXT,
    "assignedTo" TEXT,
    "convertedAt" TIMESTAMP(3),
    "lastContactedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WidgetConfig" (
    "id" TEXT NOT NULL,
    "retailerId" TEXT NOT NULL,
    "embedType" TEXT NOT NULL DEFAULT 'inline',
    "showLogo" BOOLEAN NOT NULL DEFAULT true,
    "showBranding" BOOLEAN NOT NULL DEFAULT true,
    "welcomeTitle" TEXT,
    "welcomeText" TEXT,
    "ctaText" TEXT,
    "successMessage" TEXT,
    "primaryColor" TEXT,
    "allowedDomains" TEXT[],
    "collectLeads" BOOLEAN NOT NULL DEFAULT true,
    "requireEmail" BOOLEAN NOT NULL DEFAULT true,
    "redirectUrl" TEXT,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WidgetConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubId" TEXT,
    "stripePriceId" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "status" TEXT NOT NULL DEFAULT 'active',
    "fittingCredits" INTEGER NOT NULL DEFAULT 0,
    "promoterUntil" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "trialEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetailerSubscription" (
    "id" TEXT NOT NULL,
    "retailerId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubId" TEXT,
    "stripePriceId" TEXT,
    "plan" "RetailerPlan" NOT NULL DEFAULT 'STARTER',
    "status" TEXT NOT NULL DEFAULT 'trialing',
    "fittingsUsed" INTEGER NOT NULL DEFAULT 0,
    "fittingsLimit" INTEGER NOT NULL DEFAULT 50,
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RetailerSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralPartner" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReferralPartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralConversion" (
    "id" TEXT NOT NULL,
    "referralPartnerId" TEXT NOT NULL,
    "userId" TEXT,
    "userEmail" TEXT,
    "type" TEXT NOT NULL,
    "amountPence" INTEGER,
    "commissionPence" INTEGER,
    "stripeSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReferralConversion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "retailerId" TEXT,
    "sessionId" TEXT,
    "userId" TEXT,
    "eventType" TEXT NOT NULL,
    "eventData" JSONB,
    "pageUrl" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_referralCode_idx" ON "User"("referralCode");

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

CREATE UNIQUE INDEX "FittingSession_guestToken_key" ON "FittingSession"("guestToken");
CREATE INDEX "FittingSession_userId_idx" ON "FittingSession"("userId");
CREATE INDEX "FittingSession_retailerId_idx" ON "FittingSession"("retailerId");
CREATE INDEX "FittingSession_status_idx" ON "FittingSession"("status");
CREATE INDEX "FittingSession_guestToken_idx" ON "FittingSession"("guestToken");

CREATE UNIQUE INDEX "PlayerProfile_sessionId_key" ON "PlayerProfile"("sessionId");
CREATE INDEX "PlayerProfile_email_idx" ON "PlayerProfile"("email");

CREATE UNIQUE INDEX "CurrentBag_sessionId_key" ON "CurrentBag"("sessionId");

CREATE UNIQUE INDEX "ShotTendencies_sessionId_key" ON "ShotTendencies"("sessionId");

CREATE UNIQUE INDEX "DistanceMatrix_sessionId_key" ON "DistanceMatrix"("sessionId");

CREATE UNIQUE INDEX "LaunchMonitorData_sessionId_key" ON "LaunchMonitorData"("sessionId");

CREATE INDEX "SwingVideo_sessionId_idx" ON "SwingVideo"("sessionId");

CREATE UNIQUE INDEX "FittingResult_sessionId_key" ON "FittingResult"("sessionId");
CREATE INDEX "FittingResult_sessionId_idx" ON "FittingResult"("sessionId");

CREATE UNIQUE INDEX "Product_brand_model_year_key" ON "Product"("brand", "model", "year");
CREATE INDEX "Product_brand_idx" ON "Product"("brand");
CREATE INDEX "Product_category_idx" ON "Product"("category");
CREATE INDEX "Product_active_idx" ON "Product"("active");

CREATE INDEX "ProductRecommendation_resultId_idx" ON "ProductRecommendation"("resultId");
CREATE INDEX "ProductRecommendation_productId_idx" ON "ProductRecommendation"("productId");

CREATE UNIQUE INDEX "Retailer_userId_key" ON "Retailer"("userId");
CREATE UNIQUE INDEX "Retailer_slug_key" ON "Retailer"("slug");
CREATE UNIQUE INDEX "Retailer_customDomain_key" ON "Retailer"("customDomain");
CREATE INDEX "Retailer_slug_idx" ON "Retailer"("slug");
CREATE INDEX "Retailer_customDomain_idx" ON "Retailer"("customDomain");
CREATE INDEX "Retailer_active_idx" ON "Retailer"("active");

CREATE UNIQUE INDEX "ExternalPartner_slug_key" ON "ExternalPartner"("slug");
CREATE INDEX "ExternalPartner_active_idx" ON "ExternalPartner"("active");

CREATE UNIQUE INDEX "ScrapeCache_partnerId_query_key" ON "ScrapeCache"("partnerId", "query");
CREATE INDEX "ScrapeCache_expiresAt_idx" ON "ScrapeCache"("expiresAt");

CREATE UNIQUE INDEX "RetailerInventoryItem_retailerId_sku_key" ON "RetailerInventoryItem"("retailerId", "sku");
CREATE INDEX "RetailerInventoryItem_retailerId_idx" ON "RetailerInventoryItem"("retailerId");
CREATE INDEX "RetailerInventoryItem_category_idx" ON "RetailerInventoryItem"("category");
CREATE INDEX "RetailerInventoryItem_available_idx" ON "RetailerInventoryItem"("available");

CREATE INDEX "InventoryMatch_recommendationId_idx" ON "InventoryMatch"("recommendationId");
CREATE INDEX "InventoryMatch_inventoryItemId_idx" ON "InventoryMatch"("inventoryItemId");

CREATE UNIQUE INDEX "Lead_sessionId_key" ON "Lead"("sessionId");
CREATE INDEX "Lead_retailerId_idx" ON "Lead"("retailerId");
CREATE INDEX "Lead_status_idx" ON "Lead"("status");
CREATE INDEX "Lead_email_idx" ON "Lead"("email");

CREATE UNIQUE INDEX "WidgetConfig_retailerId_key" ON "WidgetConfig"("retailerId");

CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");
CREATE UNIQUE INDEX "Subscription_stripeCustomerId_key" ON "Subscription"("stripeCustomerId");
CREATE UNIQUE INDEX "Subscription_stripeSubId_key" ON "Subscription"("stripeSubId");

CREATE UNIQUE INDEX "RetailerSubscription_retailerId_key" ON "RetailerSubscription"("retailerId");
CREATE UNIQUE INDEX "RetailerSubscription_stripeCustomerId_key" ON "RetailerSubscription"("stripeCustomerId");
CREATE UNIQUE INDEX "RetailerSubscription_stripeSubId_key" ON "RetailerSubscription"("stripeSubId");

CREATE UNIQUE INDEX "ReferralPartner_code_key" ON "ReferralPartner"("code");
CREATE INDEX "ReferralPartner_code_idx" ON "ReferralPartner"("code");

CREATE UNIQUE INDEX "ReferralConversion_stripeSessionId_key" ON "ReferralConversion"("stripeSessionId");
CREATE INDEX "ReferralConversion_referralPartnerId_idx" ON "ReferralConversion"("referralPartnerId");

CREATE INDEX "AnalyticsEvent_retailerId_idx" ON "AnalyticsEvent"("retailerId");
CREATE INDEX "AnalyticsEvent_eventType_idx" ON "AnalyticsEvent"("eventType");
CREATE INDEX "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");

CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");
CREATE INDEX "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Retailer" ADD CONSTRAINT "Retailer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RetailerSubscription" ADD CONSTRAINT "RetailerSubscription_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "Retailer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WidgetConfig" ADD CONSTRAINT "WidgetConfig_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "Retailer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FittingSession" ADD CONSTRAINT "FittingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FittingSession" ADD CONSTRAINT "FittingSession_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "Retailer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PlayerProfile" ADD CONSTRAINT "PlayerProfile_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "FittingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CurrentBag" ADD CONSTRAINT "CurrentBag_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "FittingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShotTendencies" ADD CONSTRAINT "ShotTendencies_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "FittingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DistanceMatrix" ADD CONSTRAINT "DistanceMatrix_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "FittingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LaunchMonitorData" ADD CONSTRAINT "LaunchMonitorData_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "FittingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SwingVideo" ADD CONSTRAINT "SwingVideo_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "FittingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FittingResult" ADD CONSTRAINT "FittingResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "FittingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductRecommendation" ADD CONSTRAINT "ProductRecommendation_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "FittingResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductRecommendation" ADD CONSTRAINT "ProductRecommendation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ScrapeCache" ADD CONSTRAINT "ScrapeCache_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "ExternalPartner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RetailerInventoryItem" ADD CONSTRAINT "RetailerInventoryItem_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "Retailer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RetailerInventoryItem" ADD CONSTRAINT "RetailerInventoryItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InventoryMatch" ADD CONSTRAINT "InventoryMatch_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "ProductRecommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InventoryMatch" ADD CONSTRAINT "InventoryMatch_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "RetailerInventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "Retailer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "FittingSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "Retailer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReferralConversion" ADD CONSTRAINT "ReferralConversion_referralPartnerId_fkey" FOREIGN KEY ("referralPartnerId") REFERENCES "ReferralPartner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
