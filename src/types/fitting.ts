// ============================================================
// CORE FITTING TYPES
// ============================================================

export type Handedness = "right" | "left";
export type Gender = "male" | "female" | "other" | "prefer_not_to_say";
export type PlayingFrequency = "rarely" | "monthly" | "weekly" | "multiple_weekly" | "daily";
export type SwingMiss = "slice" | "hook" | "push" | "pull" | "push_fade" | "pull_draw" | "double_cross" | "straight";
export type StrikePattern = "heel" | "toe" | "thin" | "fat" | "high_face" | "low_face" | "center";
export type BallFlight = "low" | "mid" | "high";
export type ShotShape = "fade" | "draw" | "straight";
export type ShaftFlex = "ladies" | "senior" | "regular" | "stiff" | "x_stiff" | "tour_x";
export type MonitorType = "trackman" | "gcquad" | "flightscope" | "skytrak" | "uneekor" | "other";
export type IronCategory = "muscle_back" | "players_cavity" | "players_distance" | "game_improvement" | "super_game_improvement";
export type WedgeBounce = "low" | "mid" | "high";
export type WedgeGrind = "standard" | "wide" | "narrow" | "s_grind" | "m_grind" | "k_grind" | "t_grind" | "f_grind";
export type ClubCategory = "driver" | "fairway_wood" | "hybrid" | "driving_iron" | "iron_set" | "wedge" | "putter";

export type ConfidenceTier =
  | "very_high"    // 90-100
  | "high"         // 75-89
  | "moderate"     // 60-74
  | "low"          // 40-59
  | "insufficient"; // <40

// ============================================================
// PLAYER PROFILE INPUT
// ============================================================

export interface PlayerProfileInput {
  name: string;
  email: string;
  phone?: string;
  age?: number;
  gender?: Gender;
  dominantHand: Handedness;
  handicap: number;
  heightCm: number;
  wristToFloorCm?: number;
  averageScore?: number;
  goals?: string[];
  playingFrequency?: PlayingFrequency;
  experience?: string;
}

// ============================================================
// CURRENT BAG INPUT
// ============================================================

export interface ClubInBag {
  category: ClubCategory;
  brand?: string;
  model?: string;
  loft?: number;
  shaft?: string;
  flex?: ShaftFlex;
  length?: string;
  notes?: string;
}

export interface CurrentBagInput {
  clubs: ClubInBag[];
}

// ============================================================
// SHOT TENDENCIES INPUT
// ============================================================

export interface ShotTendenciesInput {
  typicalMiss?: SwingMiss;
  strikePattern?: StrikePattern;
  ballFlight?: BallFlight;
  shotShape?: ShotShape;
  frustrations?: string[];
  driverNotes?: string;
  ironNotes?: string;
  shortGameNotes?: string;
}

// ============================================================
// DISTANCE MATRIX INPUT
// ============================================================

export interface DistanceMatrixInput {
  driver?: number;
  threeWood?: number;
  fiveWood?: number;
  sevenWood?: number;
  hybrid?: number;
  drivingIron?: number;
  fourIron?: number;
  fiveIron?: number;
  sixIron?: number;
  sevenIron?: number;
  eightIron?: number;
  nineIron?: number;
  pitchingWedge?: number;
  gapWedge?: number;
  sandWedge?: number;
  lobWedge?: number;
  unit?: "yards" | "meters";
}

// ============================================================
// LAUNCH MONITOR DATA INPUT
// ============================================================

export interface DriverLaunchData {
  clubSpeed?: number;      // mph
  ballSpeed?: number;      // mph
  smashFactor?: number;
  launchAngle?: number;    // degrees
  spinRate?: number;       // rpm
  carryDistance?: number;  // yards
  totalDistance?: number;  // yards
  attackAngle?: number;    // degrees (positive = up, negative = down)
  clubPath?: number;       // degrees (positive = in-to-out)
  faceAngle?: number;      // degrees (positive = open)
  dynamicLoft?: number;    // degrees
  apex?: number;           // yards
  descentAngle?: number;   // degrees
  spinAxis?: number;       // degrees
  sidespin?: number;       // rpm
}

export interface IronLaunchData {
  club?: string;
  clubSpeed?: number;
  ballSpeed?: number;
  launchAngle?: number;
  spinRate?: number;
  carryDistance?: number;
  peakHeight?: number;
  descentAngle?: number;
  landingAngle?: number;
}

export interface LaunchMonitorInput {
  monitorType?: MonitorType;
  driverData?: DriverLaunchData;
  ironData?: IronLaunchData;
  wedgeData?: IronLaunchData;
}

// ============================================================
// FITTING ENGINE INPUT
// ============================================================

export interface FittingEngineInput {
  sessionId: string;
  retailerId?: string;
  profile: PlayerProfileInput;
  currentBag?: CurrentBagInput;
  tendencies?: ShotTendenciesInput;
  distanceMatrix?: DistanceMatrixInput;
  launchMonitor?: LaunchMonitorInput;
  swingVideoCount?: number;
}

// ============================================================
// CONFIDENCE SCORES
// ============================================================

export interface ConfidenceScores {
  overall: number;
  driver: number;
  irons: number;
  wedges: number;
  shaft: number;
  lieLength: number;
  bagGapping: number;
  productRecommendation: number;
}

export interface ConfidenceDetail {
  score: number;
  tier: ConfidenceTier;
  explanation: string;
  missingData: string[];
  improvementTips: string[];
}

export interface FullConfidenceReport {
  overall: ConfidenceDetail;
  driver: ConfidenceDetail;
  irons: ConfidenceDetail;
  wedges: ConfidenceDetail;
  shaft: ConfidenceDetail;
  lieLength: ConfidenceDetail;
  bagGapping: ConfidenceDetail;
  productRecommendation: ConfidenceDetail;
}

// ============================================================
// DRIVER RECOMMENDATION
// ============================================================

export interface DriverRecommendation {
  loft: number;
  loftRange: string;
  flex: ShaftFlex;
  shaftWeight: string;
  shaftProfile: "low" | "mid" | "high";
  shaftSpin: "low" | "mid" | "high";
  headStyle: "draw_bias" | "neutral" | "low_spin" | "max_forgiveness";
  headStyleLabel: string;
  swingWeight: string;
  length: string;
  recommendedProducts: ProductRec[];
  shaftOptions: ShaftRec[];
  reasoning: string[];
  adjustmentNotes: string[];
}

// ============================================================
// IRON RECOMMENDATION
// ============================================================

export interface IronRecommendation {
  category: IronCategory;
  categoryLabel: string;
  flex: ShaftFlex;
  shaftType: "steel" | "graphite";
  shaftWeight: string;
  shaftProfile: "low" | "mid" | "high";
  lengthAdjustment: string;
  loftAdjustment: string;
  lieAdjustment: string;
  setComposition: string;
  recommendedProducts: ProductRec[];
  shaftOptions: ShaftRec[];
  reasoning: string[];
}

// ============================================================
// WEDGE RECOMMENDATION
// ============================================================

export interface WedgeSetup {
  loft: number;
  purpose: string;
  bounce: WedgeBounce;
  bounceAngle: string;
  grind: WedgeGrind;
  grindLabel: string;
}

export interface WedgeRecommendation {
  setup: WedgeSetup[];
  numberOfWedges: number;
  bounce: WedgeBounce;
  primaryGrind: WedgeGrind;
  recommendedProducts: ProductRec[];
  gapIssues: string[];
  reasoning: string[];
}

// ============================================================
// SHAFT RECOMMENDATION
// ============================================================

export interface ShaftRec {
  name: string;
  manufacturer: string;
  weight: string;
  flex: ShaftFlex;
  profile: "low" | "mid" | "high";
  spin: "low" | "mid" | "high";
  torque?: string;
  tier: "premium" | "mid" | "budget";
  suitedFor: string;
  confidence: number;
}

export interface ShaftRecommendation {
  driverShafts: ShaftRec[];
  ironShafts: ShaftRec[];
  wedgeShafts: ShaftRec[];
  reasoning: string[];
}

// ============================================================
// LIE & LENGTH RECOMMENDATION
// ============================================================

export interface LieLengthRecommendation {
  driverLength: string;
  ironLength: string;
  lengthAdjustment: number;
  lieAdjustment: string;
  lieAdjustmentDegrees: number;
  reasoning: string[];
  measurementMethod: "height_wrist" | "height_only" | "estimated";
}

// ============================================================
// BAG GAP ANALYSIS
// ============================================================

export interface ClubGap {
  fromClub: string;
  toClub: string;
  fromDistance: number;
  toDistance: number;
  gap: number;
  targetGap: number;
  severity: "optimal" | "acceptable" | "concern" | "problem";
  recommendation?: string;
}

export interface BagGapAnalysis {
  gaps: ClubGap[];
  overallGrading: "excellent" | "good" | "fair" | "poor";
  missingWindows: string[];
  overlaps: string[];
  totalBagReach: number;
  longestGap: ClubGap | null;
  recommendations: string[];
  chartData: GapChartPoint[];
}

export interface GapChartPoint {
  club: string;
  carry: number;
  target?: number;
  optimal?: boolean;
}

// ============================================================
// PRODUCT RECOMMENDATION
// ============================================================

export interface ProductRec {
  brand: string;
  model: string;
  category: string;
  loft?: string;
  shaft?: string;
  flex?: string;
  specs?: Record<string, string | number>;
  imageUrl?: string;
  msrp?: number;
  reasoning: string;
  confidence: number;
  matchType: "exact" | "close" | "category";
  inventoryMatch?: InventoryMatchResult;
}

export interface InventoryMatchResult {
  inventoryItemId: string;
  sku: string;
  price: number;
  salePrice?: number;
  productUrl?: string;
  imageUrl?: string;
  stockQty: number;
  matchScore: number;
}

// ============================================================
// UPGRADE PRIORITY
// ============================================================

export interface UpgradePriority {
  rank: number;
  club: string;
  currentClub?: string;
  recommendedClub: string;
  expectedImprovement: string;
  estimatedCost: string;
  priority: "high" | "medium" | "low";
  reasoning: string;
}

// ============================================================
// FULL FITTING RESULT
// ============================================================

export interface FittingResult {
  sessionId: string;
  confidence: FullConfidenceReport;
  driver: DriverRecommendation;
  irons: IronRecommendation;
  wedges: WedgeRecommendation;
  shafts: ShaftRecommendation;
  lieLength: LieLengthRecommendation;
  bagGaps: BagGapAnalysis;
  upgradePriorities: UpgradePriority[];
  summaryPoints: string[];
  expectedBenefits: string[];
  generatedAt: Date;
}
