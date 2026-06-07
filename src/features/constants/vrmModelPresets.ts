export type VrmModelPreset = {
  id: string;
  name: string;
  description: string;
  fileName: string;
};

export type CustomVrmModel = {
  id: string;
  name: string;
};

export const VRM_MODEL_PRESETS: VrmModelPreset[] = [
  {
    id: "default",
    name: "Default",
    description: "Original sample avatar",
    fileName: "avatar_sample.vrm",
  },
  {
    id: "coach1",
    name: "Stella Vio",
    description: "Your collection #1",
    fileName: "avatar_coach1.vrm",
  },
  {
    id: "coach2",
    name: "Scarlet Nunn",
    description: "Your collection #2",
    fileName: "avatar_coach2.vrm",
  },
  {
    id: "coach3",
    name: "Frosty Kael",
    description: "Your collection #3",
    fileName: "avatar_coach3.vrm",
  },
  {
    id: "coach4",
    name: "Lynn Emerald",
    description: "Your collection #4",
    fileName: "avatar_coach4.vrm",
  },
];
