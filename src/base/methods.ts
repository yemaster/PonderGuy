import { unitWidth } from "./constants"

export const calcPos = (p: number, l: number = 1, tp: boolean = false): number => {
    let ml = 1
    if (tp)
        ml = 0
    return p * unitWidth + unitWidth * (l || 1) / 2 * ml
}

export const fixPos = (p: number, l: number = 1): number => {
    return Math.round((p - unitWidth * (l || 1) / 2) / unitWidth)
}


export const calcMirrorPos = (p: [number, number, number], m: [number, number, number], face: number): [number, number, number] => {
    const tmp = Array.from(p) as [number, number, number]
    tmp[face] = 2 * m[face] - tmp[face] - 1
    return tmp
}

export const calcMirrorAngle = (angle: number, face: number = 2) => {
    if (face === 0)
        return 3 - angle
    if (angle <= 1)
        return 1 - angle
    return 5 - angle
}