export const unitWidth = 12

export type CubeInfo = {
    type: "Cube";
    pos: [number, number, number];
    size?: never;
    angle?: never;
    direction?: never;
    face?: never;
    range?: never;
    color?: string;
}

export type DrawboxInfo = {
    type: "Drawbox";
    pos: [number, number, number];
    size: [number, number, number];
    angle?: never;
    direction?: never;
    face?: never;
    range: [number[], number[], number[]];
    color?: string;
}

export type RotatorInfo = {
    type: "Rotator";
    pos: [number, number, number];
    size: [number, number];
    angle: number;
    direction: number;
    face: number;
    range?: never;
    color?: string;
}

export type PlaneInfo = {
    type: "Plane";
    pos: [number, number, number];
    size?: never;
    angle?: never;
    direction?: never;
    face?: never;
    range?: never;
    color?: string;
}

export type objectInfo = CubeInfo | DrawboxInfo | RotatorInfo | PlaneInfo

export type MirrorInfo = {
    pos: [number, number, number],
    size: [number, number, number],
    range: [number[], number[], number[]]
}

export type levelData = {
    background: string,
    start: [number, number, number];
    dests: [number, number, number][];
    objects: objectInfo[];
    mirror?: MirrorInfo;
}