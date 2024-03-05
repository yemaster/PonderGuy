import { Quaternion, Vector3 } from 'three'

class Point {
    x: number;
    y: number;
    vis: boolean = false;
    constructor(x?: number, y?: number) {
        this.x = x || 0
        this.y = y || 0
    }
    fromArray(p: [number, number, number, number?]) {
        if (p.length === 3 || p.length === 4) {
            this.x = -p[1] + p[2]
            this.y = p[0] - p[1]
        }
        return this
    }
    fromVector3(p: Vector3) {
        return this.fromArray([p.x, p.y, p.z])
    }
    manhattanDist(p: Point) {
        return Math.abs(this.x - p.x) + Math.abs(this.y - p.y)
    }
    equal(x: number | Point, y?: number): boolean {
        if (typeof (x) === "number" && y !== undefined)
            return (this.x === x && this.y === y)
        else if (typeof (x) !== "number")
            return (this.x === x.x && this.y === x.y)
        return false
    }
    toVector3(): Vector3 {
        return new Vector3(this.y + 10, 10, this.x + 10)
    }
}

function getVirtualPos(arr: any[]) {
    const res: [number, number, number][] = []
    arr.forEach(v => {
        if (v.isGroup) {
            let d1: Vector3
            let d2: Vector3
            let rotQuaternion: Quaternion
            const directionVectors = [
                new Vector3(1, 0, 0),
                new Vector3(0, 1, 0),
                new Vector3(0, 0, 1)
            ];
            //console.log(v)
            switch (v.name) {
                case "Cube":
                    res.push([
                        v.pos[0],
                        v.pos[1],
                        v.pos[2]
                    ])
                    break
                case "Drawbox":
                    for (let i = 0; i < v.len[0]; ++i)
                        for (let j = 0; j < v.len[1]; ++j)
                            for (let k = 0; k < v.len[2]; ++k) {
                                res.push([
                                    v.pos[0] + i,
                                    v.pos[1] + j,
                                    v.pos[2] + k
                                ])
                            }
                    break
                case "Rotator":
                    d1 = new Vector3()
                    d2 = new Vector3()
                    d1[v.face[0][1] as ("x" | "y" | "z")] = v.face[0][0] === "-" ? -1 : 1
                    d2[v.face[1][1] as ("x" | "y" | "z")] = v.face[1][0] === "-" ? -1 : 1
                    //console.log(d1, d2)
                    rotQuaternion = new Quaternion().setFromAxisAngle(directionVectors[v.direction], v.angle * Math.PI / 2)
                    //console.log(directionVectors[v.direction])
                    d1.applyQuaternion(rotQuaternion).round()
                    d2.applyQuaternion(rotQuaternion).round()

                    for (let i = 0; i < v.len[0]; ++i) {
                        res.push([
                            v.pos[0] + d1.x * i,
                            v.pos[1] + d1.y * i,
                            v.pos[2] + d1.z * i
                        ])
                    }
                    for (let i = 1; i < v.len[1]; ++i) {
                        res.push([
                            v.pos[0] + d2.x * i,
                            v.pos[1] + d2.y * i,
                            v.pos[2] + d2.z * i
                        ])
                    }
            }
        }
    })
    return res
}


function filterObjs(pos: [number, number, number, number?][], mPos: [number, number, number], mLen: [number, number, number], type: number = 1) {
    const face = mLen[0] === 0 ? 0 : 2

    const left = (face === 2) ? (mPos[2] - mPos[0] - mLen[0] + 1) : (mPos[2] - mPos[0] + 1)
    const right = (face === 2) ? (mPos[2] - mPos[0] - 1) : (mPos[2] + mLen[2] - mPos[0] - 1)
    const bottom = (face === 2) ? (mPos[2] - mPos[1] - mLen[1] + 1) : (mPos[0] - mPos[1] - mLen[1] + 1)
    const top = (face === 2) ? (mPos[2] - mPos[1]) : (mPos[0] - mPos[1])

    pos.forEach(v => {
        let res = 0
        const x = v[2] - v[1], y = v[0] - v[1]
        const row = x - y, col = (face === 2) ? x : y

        if (v[face] >= mPos[face])
            res = 0
        else if (bottom <= col && col <= top) {
            if (left <= row && row <= right)
                res = 3
            else if (row + 1 === left)
                res = 2
            else if (row === right + 1)
                res = 1
            else
                res = 0
        }
        else
            res = 0

        if (type !== 1)
            res = 3 - res

        if (v.length === 4)
            v[3] = res
        else
            v.push(res)
    })
}

export default function calcRoute(levelObjs: { objs: any[], mirror?: { pos: [number, number, number], len: [number, number, number], objs: any[] } }, start: Vector3, end: Vector3): Vector3[] | null {
    let realPoints: [number, number, number, number?][] = getVirtualPos(levelObjs.objs)

    const points: Point[] = []
    let st = -1, ed = -1
    const startPoint = new Point().fromVector3(start),
        endPoint = new Point().fromVector3(end)
    const addPoint = (p: Point) => {
        let flag = false
        for (let i = 0; i < points.length; ++i)
            if (p.equal(points[i])) {
                flag = true
                break
            }
        if (!flag) {
            points.push(p)
            if (p.equal(startPoint))
                st = points.length - 1
            if (p.equal(endPoint))
                ed = points.length - 1
        }
    }

    if (levelObjs.mirror !== undefined) {
        filterObjs(realPoints, levelObjs.mirror.pos, levelObjs.mirror.len, 1)
        const mirrorPoints: [number, number, number, number?][] = getVirtualPos(levelObjs.mirror.objs)
        filterObjs(mirrorPoints, levelObjs.mirror.pos, levelObjs.mirror.len, 0)
        realPoints = realPoints.concat(mirrorPoints)
    }

    // Build Vertex

    // Handle covering
    const tmp = []
    for (let i = 0; i < realPoints.length; ++i) {
        let flag = true
        const d1x = realPoints[i][0] - realPoints[i][1] // -2
        const d1y = realPoints[i][2] - realPoints[i][1] // -3
        const s1 = realPoints[i][3] || 0
        if (s1 === 3)
            continue
        for (let j = 0; j < realPoints.length; ++j) {
            const d2x = realPoints[j][0] - realPoints[j][1] // -3
            const d2y = realPoints[j][2] - realPoints[j][1] // -3
            const s2 = realPoints[j][3] || 0
            if (s2 === 3)
                continue
            if ((realPoints[j][1] > realPoints[i][1]) &&
                (((d1x === d2x) && (d1y === d2y + 1) && (s2 <= 1) && (s1 !== 1)) ||   // 从右上遮住
                    ((d1x === d2x + 1) && (d1y === d2y) && ((s2 & 1) === 0) && (s1 !== 2)) ||  // 从左上遮住
                    ((d1x === d2x + 1) && (d1y === d2y + 1) && (s2 < 3) && ((s2 === 0) || (s2 === s1))))) {     // 从正上方遮住
                flag = false
                break
            }
        }
        if (flag) {
            tmp.push(realPoints[i])
        }
    }
    // Handle Mirror
    for (let i = 0; i < tmp.length; ++i) {
        let flag = false
        const status = tmp[i][3] || 0
        // Skip hidden cubes
        if (status === 3)
            continue
        else if (status > 0) {
            // Find another part
            for (let j = 0; j < tmp.length; ++j)
                if (((tmp[j][3] || 0) + status === 3) &&
                    (tmp[j][2] - tmp[j][1] === tmp[i][2] - tmp[i][1]) &&
                    (tmp[j][0] - tmp[j][1] === tmp[i][0] - tmp[i][1])) {
                    flag = true
                    break
                }
        }
        else
            flag = true
        if (flag)
            addPoint(new Point().fromArray(tmp[i]))
    }
    //console.log(st, ed, points)
    if (st === -1)
        return null
    if (ed === -1)
        return null

    // Build Edges
    const edges = new Array(points.length)
    for (let i = 0; i < edges.length; ++i)
        edges[i] = []
    for (let i = 0; i < points.length; ++i)
        for (let j = 0; j < points.length; ++j) {
            if (points[i].manhattanDist(points[j]) === 1)
                edges[i].push(j)
        }
    //console.log(edges)

    // Use SPFA to calculate route
    const vis = new Array(points.length)
    const dis = new Array(points.length)
    const pre = new Array(points.length)
    const que: number[] = []
    for (let i = 0; i < points.length; ++i) {
        vis[i] = false
        dis[i] = 0x3f3f3f3f
        pre[i] = -1
    }
    vis[st] = true
    dis[st] = 0
    que.push(st)
    let head = 0, tail = 1
    while (head < tail) {
        const u = que[head]
        head++
        vis[u] = false
        for (let i = 0; i < edges[u].length; ++i) {
            const v = edges[u][i]
            if (dis[v] > dis[u] + 1) {
                dis[v] = dis[u] + 1
                pre[v] = u
                if (!vis[v]) {
                    vis[v] = true
                    que.push(v)
                    tail++
                }
            }
        }
    }
    if (dis[ed] === 0x3f3f3f3f)
        return null
    else {
        const ret: Vector3[] = []
        let p = ed
        while (p !== st) {
            //console.log(p)
            ret.push(points[p].toVector3())
            p = pre[p]
        }
        ret.push(startPoint.toVector3())
        //console.log(ret)
        return ret.reverse()
    }
}