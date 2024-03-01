export const unitWidth = 12

export type objectInfo = {
    type: string,
    pos?: [number, number, number],
    size?: number | [number, number, number],
    range?: [number[], number[], number[]],
    angle?: number,
    color?: string
}

export type levelData = {
    background: string,
    start: [number, number, number],
    dests: [number, number, number][],
    objects: objectInfo[],
    mirror?: {
        pos: [number, number, number],
        size: [number, number, number],
        range: [number[], number[], number[]]
    }
}