export interface IdentityProfile {
  fullName: string;
  preferredName?: string;
  age?: number;
  country?: string;
  timezone?: string;
}

export interface MissionProfile {
  lifeMission?: string;
  currentMission?: string;
  biggestGoal?: string;
  currentProject?: string;
}

export interface PersonalityProfile {
  communicationStyle?: string;
  learningStyle?: string;
  decisionStyle?: string;
}

export interface ProductivityProfile {
  bestWorkingHours?: string;
  biggestDistraction?: string;
  planningStyle?: string;
}

export interface InterestsProfile {
  favoriteTopics?: string[];
  favoriteBooks?: string[];
  favoriteCreators?: string[];
}

export interface MetadataProfile {
  createdAt: string;
  updatedAt: string;
}

export interface HumanProfile {
  id: string;

  identity: IdentityProfile;

  mission: MissionProfile;

  personality: PersonalityProfile;

  productivity: ProductivityProfile;

  interests: InterestsProfile;

  metadata: MetadataProfile;
}