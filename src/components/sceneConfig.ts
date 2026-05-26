export interface SceneSettings {
  autoRotate: boolean;
  rotationSpeed: number;
  showParticles: boolean;
  showRings: boolean;
  backgroundOpacity: number;
}

export const defaultSettings: SceneSettings = {
  autoRotate: true,
  rotationSpeed: 0.4,
  showParticles: true,
  showRings: true,
  backgroundOpacity: 0.3,
};
