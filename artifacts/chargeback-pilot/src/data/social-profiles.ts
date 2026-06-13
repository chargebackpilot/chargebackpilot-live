export const SOCIAL_PROFILES = {
  linkedin: "",
  x: "",
  facebook: "",
  instagram: "",
} as const;

export const ACTIVE_SOCIAL_PROFILE_URLS = Object.values(SOCIAL_PROFILES).filter(Boolean);
