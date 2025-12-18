
export interface GeneratedImage {
  id: string;
  url: string;
  theme: string;
  description: string;
  timestamp: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  geminiApiKey?: string;
}

export interface ThemeSuggestion {
  title: string;
  prompt: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export type AppView = 
  | 'HOME' 
  | 'WEB_LISTING' 
  | 'STUDIO_SHOOT' 
  | 'AI_INFLUENCER'
  | 'RELOCATE_PRODUCT'
  | 'FASHION_HOME'
  | 'CLOTHING_STUDIO'
  | 'CLOTHING_INFLUENCER'
  | 'PROFILE'
  | 'SIGNAL'
  | 'AMPLIFY'
  | 'HOOKLAB'
  | 'CREOSCORE'
  | 'MERIDIAN'
  | 'ATLAS'
  | 'PRICEWISE'
  | 'FUNNELMAP';

export type AspectRatio = "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "9:16" | "16:9" | "21:9" | "4:5";

export const ASPECT_RATIOS: AspectRatio[] = ["1:1", "3:4", "4:3", "9:16", "16:9"];

export type MockupStyle = "Minimal / Pure" | "Podium / Pedestal" | "With Props (Natural)" | "Floating / Creative" | "Flat Lay";

export const MOCKUP_STYLES: MockupStyle[] = ["Minimal / Pure", "Podium / Pedestal", "With Props (Natural)", "Floating / Creative", "Flat Lay"];

export type StudioAngle = 
  | "Eye-Level"
  | "Low Angle"
  | "High Angle"
  | "Top-Down"
  | "Three-Quarter"
  | "Macro Detail"
  | "Profile View"
  | "Dutch Angle"
  | "Dynamic Action"
  | "Floating Zero-G"
  | "Cinematic Depth"
  | "Isometric"
  | "Wide Horizon"
  | "Backlit Silhouette"
  | "Under-side View";

export const STUDIO_ANGLES: StudioAngle[] = [
  "Eye-Level",
  "Low Angle",
  "High Angle",
  "Top-Down",
  "Three-Quarter",
  "Macro Detail",
  "Profile View",
  "Dutch Angle",
  "Dynamic Action",
  "Floating Zero-G",
  "Cinematic Depth",
  "Isometric",
  "Wide Horizon",
  "Backlit Silhouette",
  "Under-side View"
];

export interface ProductColor {
  name: string;
  hex: string;
}

export const PRODUCT_COLORS: ProductColor[] = [
  { name: "Original", hex: "" }, 
  { name: "Ruby Red", hex: "#bd0218" },
  { name: "Midnight Blue", hex: "#021e9c" },
  { name: "Emerald Green", hex: "#065f46" },
  { name: "Sahara Sand", hex: "#fcd34d" },
  { name: "Pure White", hex: "#ffffff" },
  { name: "Obsidian Black", hex: "#000000" },
  { name: "Soft Rose", hex: "#fda4af" },
];

export type VideoDuration = "5" | "8" | "10" | "15";
export type CameraMotion = "Auto" | "Static" | "Slow Push-In" | "Slow Pull-Out" | "Orbit" | "Vertical Rise" | "Parallax Slide";
export const CAMERA_MOTIONS: CameraMotion[] = ["Auto", "Static", "Slow Push-In", "Slow Pull-Out", "Orbit", "Vertical Rise", "Parallax Slide"];

export type CinematicStyle = "Auto" | "Luxury Studio" | "Minimal Clean" | "Futuristic" | "Dark Moody" | "Bright Commercial";
export const CINEMATIC_STYLES: CinematicStyle[] = ["Auto", "Luxury Studio", "Minimal Clean", "Futuristic", "Dark Moody", "Bright Commercial"];

export type SoundStyle = "Auto" | "Ambient cinematic" | "Soft whoosh transitions" | "Subtle mechanical" | "No Sound";
export const SOUND_STYLES: SoundStyle[] = ["Auto", "Ambient cinematic", "Soft whoosh transitions", "Subtle mechanical", "No Sound"];

export type InfluencerGender = "Male" | "Female";
export type InfluencerSetting = "Casual Home" | "Outdoor Urban" | "Cafe/Restaurant" | "Gym/Fitness" | "Bedroom/Studio" | "Living Room";
export type InfluencerPersona = "Tech Reviewer" | "Lifestyle Blogger" | "Fashion Influencer" | "Fitness Freak" | "Everyday User";
export type InfluencerRegionalLook = "Auto" | "North Indian" | "South Indian" | "Metro/Urban Indian";
export type InfluencerAge = "Auto" | "Gen Z (18-24)" | "Millennial (25-40)" | "Middle-aged (40+)";
export type InfluencerSkinTone = "Auto" | "Fair" | "Medium" | "Dusky" | "Deep";
export type InfluencerBodyType = "Auto" | "Slim" | "Athletic" | "Curvy" | "Plus-size";
export type InfluencerShotType = "Standard UGC" | "Size & Fit Comparison" | "Hand & Interaction Focus" | "Unboxing Moment" | "Close-up Detail";
export type InfluencerPose = "Auto" | "Holding product" | "Using product" | "Unboxing" | "Candid lifestyle";

export const INFLUENCER_SETTINGS: InfluencerSetting[] = ["Casual Home", "Outdoor Urban", "Cafe/Restaurant", "Gym/Fitness", "Bedroom/Studio", "Living Room"];
export const INFLUENCER_REGIONAL: InfluencerRegionalLook[] = ["Auto", "North Indian", "South Indian", "Metro/Urban Indian"];

// Fix: Replaced bitwise OR '|' with commas to correctly initialize the array of strings for INFLUENCER_AGES
export const INFLUENCER_AGES: InfluencerAge[] = ["Auto", "Gen Z (18-24)", "Millennial (25-40)", "Middle-aged (40+)"];

export const INFLUENCER_SKIN_TONES: InfluencerSkinTone[] = ["Auto", "Fair", "Medium", "Dusky", "Deep"];
export const INFLUENCER_BODY_TYPES: InfluencerBodyType[] = ["Auto", "Slim", "Athletic", "Curvy", "Plus-size"];

export interface OutfitInput {
  upper: string | null;
  bottom: string | null;
  accessory: string | null;
  cap: string | null;
  chain: string | null;
  bracelet: string | null;
  watch: string | null;
}

export type StylePreference = "Auto" | "Realistic" | "Minimalist" | "High Fashion" | "Cinematic";
export type LightingPreference = "Studio Balanced (Default)" | "Natural Light" | "Moody / Dramatic" | "Golden Hour" | "Soft / Airy";
export type CompositionPreference = "Auto" | "Centered" | "Rule of Thirds" | "Macro" | "Top Down";

export type VideoFps = "24" | "30" | "60";
export type VideoLens = "Standard (35mm)" | "Wide (16mm)" | "Portrait (50mm)" | "Telephoto (85mm)";

export type AdType = "PROMO" | "REVIEW";

export interface AdAnalysis {
  headline: string;
  subHeadline: string;
  cta: string;
  price: string;
  primaryColor: string;
  textColor: string;
  layoutStyle: 'CENTERED' | 'SPLIT_LEFT' | 'SPLIT_RIGHT' | 'BOTTOM_HEAVY';
  adType: AdType;
  performanceReasoning?: string;
}

export interface GeneratedAd {
  id: string;
  imageUrl: string;
  data: AdAnalysis;
  timestamp: number;
}

export interface InfluencerScene {
  title: string;
  description: string;
  persona: string;
  setting: string;
}

export interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export const AD_HOOKS = [
  { id: "H1", title: "Just Dropped", subtitle: "Freshly launched. Be the first to own it." },
  { id: "H2", title: "The Wait is Over", subtitle: "Finally back in stock. Grab yours now." },
  { id: "H3", title: "Limited Edition", subtitle: "Once it's gone, it's gone for good." },
  { id: "H4", title: "Treat Yourself", subtitle: "Because you deserve the best in quality." },
  { id: "H5", title: "Modern Classic", subtitle: "Timeless design meets contemporary function." }
];
