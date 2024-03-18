import type { Box3 } from "three"
import { unitWidth } from "./constants"

const l = ["B", "KB", "MB", "GB", "PB"]
export const formatSize = (p: number) => {
    let level = 0
    while (p >= 1024) {
        level ++
        p /= 1024
    }
    return `${p.toFixed(2)}${l[level]}`
}

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

export const isCollide = (box1: Box3, box2: Box3): boolean => {
    if (box1.max.x <= box2.min.x || box1.min.x >= box2.max.x)
        return false
    if (box1.max.y <= box2.min.y || box1.min.y >= box2.max.y)
        return false
    if (box1.max.z <= box2.min.z || box1.min.z >= box2.max.z)
        return false
    return true
}