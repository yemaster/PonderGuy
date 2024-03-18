export const appInfo = {
    name: "Ponder Guy",
    applicationId: "js.vtdev.ponderguy",
    version: "1.0.1",
}

export const unitWidth = 8

export type faceType = "+x" | "+y" | "+z" | "-x" | "-y" | "-z"

export type CubeInfo = {
    type: "Cube";
    name?: string;
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
    name?: string;
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
    name?: string;
    pos: [number, number, number];
    size: [number, number];
    angle: number;
    direction: number;
    face: [faceType, faceType];
    range?: never;
    color?: string;
}

export type PlaneInfo = {
    type: "Plane";
    name?: string;
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

export type appendObjectsMethod = {
    type: "add" | "remove" | "change";
    obj: objectInfo;
}

export type levelData = {
    background: string,
    start: [number, number, number];
    dests: [number, number, number][];
    objects: objectInfo[];
    mirror?: MirrorInfo;
    appendActions?: any;
    appendObjects?: {
        [key: string]: appendObjectsMethod[];
    }
}