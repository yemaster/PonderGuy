import { Scene, Vector3 } from 'three'

class Point {
    x: number;
    y: number;
    vis: boolean = false;
    constructor(x?: number, y?: number) {
        this.x = x || 0
        this.y = y || 0
    }
    fromArray(p: number[]) {
        if (p.length === 3) {
            this.x = -p[1] + p[2]
            this.y = p[0] - p[1]
        }
        return this
    }
    fromVector3(p: Vector3) {
        return this.fromArray(p.toArray())
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

export default function calcRoute(scene: Scene, start: Vector3, end: Vector3): Vector3[] | null {
    const elements = scene.children
    const tmpPoint: number[][] = [];
    elements.forEach(v => {
        if (v.isGroup) {
            //console.log(v)
            switch (v.name) {
                case "Cube":
                    tmpPoint.push(v.pos)
                    break
                case "Drawbox":
                    for (let i = 0; i < v.len[0]; ++i)
                        for (let j = 0; j < v.len[1]; ++j)
                            for (let k = 0; k < v.len[2]; ++k) {
                                tmpPoint.push([
                                    v.pos[0] + i,
                                    v.pos[1] + j,
                                    v.pos[2] + k
                                ])
                            }
                    break
                case "Rotator":
                    //console.log(v.pos, v.len, v.angle)
                    const d1 = [0, 0, 1]
                    if (v.angle === 1 || v.angle === 2)
                        d1[2] = -1
                    const d2 = [1, 0, 0]
                    if (v.angle === 2 || v.angle === 3)
                        d2[0] = -1
                    for (let i = 0; i < v.len; ++i) {
                        tmpPoint.push([
                            v.pos[0] + d1[0] * i,
                            v.pos[1] + d1[1] * i,
                            v.pos[2] + d1[2] * i
                        ])
                    }
                    for (let i = 1; i < v.len; ++i) {
                        tmpPoint.push([
                            v.pos[0] + d2[0] * i,
                            v.pos[1] + d2[1] * i,
                            v.pos[2] + d2[2] * i
                        ])
                    }
            }
        }
    })

    const points: Point[] = []
    let st = 0, ed = 0
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
    for (let i = 0; i < tmpPoint.length; ++i) {
        let flag = true
        for (let j = 0; j < tmpPoint.length; ++j) {
            const d1x = tmpPoint[i][0] - tmpPoint[i][1]
            const d1y = tmpPoint[i][2] - tmpPoint[i][1]
            const d2x = tmpPoint[j][0] - tmpPoint[j][1]
            const d2y = tmpPoint[j][2] - tmpPoint[j][1]
            if (tmpPoint[j][1] > tmpPoint[i][1] &&
                (((d1x === d2x) && (d1y === d2y + 1)) ||
                    ((d1x === d2x + 1) && (d1y === d2y)) ||
                    ((d1x === d2x + 1) && (d1y === d2y + 1)))) {
                flag = false
                break
            }
        }
        if (flag) {
            addPoint(new Point().fromArray(tmpPoint[i]))
        }
    }
    //console.log(st, ed, points)
    const edges = new Array(points.length)
    for (let i = 0; i < edges.length; ++i)
        edges[i] = []
    for (let i = 0; i < points.length; ++i)
        for (let j = 0; j < points.length; ++j) {
            if (points[i].manhattanDist(points[j]) === 1)
                edges[i].push(j)
        }
    //console.log(edges)
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