export const PET_SIZE = 32;

export interface Animation {
  name: string;
  startFrame: number;
  frameCount: number;
  frameRate: number;
  loop: boolean;
  nextState?: PetState;
}

export type PetState = "idle" | "walk" | "sleep" | "jump" | "eat" | "pet";

export const animations: Record<PetState, Animation> = {
  idle: {
    name: "idle",
    startFrame: 8,
    frameCount: 8,
    frameRate: 150,
    loop: true,
  },
  walk: {
    name: "walk",
    startFrame: 5,
    frameCount: 8,
    frameRate: 100,
    loop: true,
  },
  sleep: {
    name: "sleep",
    startFrame: 10,
    frameCount: 5,
    frameRate: 300,
    loop: true,
  },
  jump: {
    name: "jump",
    startFrame: 25,
    frameCount: 1,
    frameRate: 100,
    loop: false,
    nextState: "idle",
  },
  eat: {
    name: "eat",
    startFrame: 33,
    frameCount: 10,
    frameRate: 100,
    loop: false,
    nextState: "sleep",
  },
  pet: {
    name: "pet",
    startFrame: 59,
    frameCount: 8,
    frameRate: 100,
    loop: false,
    nextState: "idle",
  },
};
