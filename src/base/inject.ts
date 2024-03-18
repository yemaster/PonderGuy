const injectFunctions = {
    async checkUpdate(onFinish: (needUpdate: boolean, nowVersion: string, latestVersion: string, updateLogs: string) => void, onError: Function) {
        console.log("Oh mama")
        setTimeout(() => {
            onFinish(false, "1.0.0", "1.0.0", "")
        }, 1000)
    },
    async update(onUpdate: (val: number, speed: number, all: number, now: number) => void, onFinish: () => void, onError: (err: string) => void) {
        let progress = 0
        const timer = setInterval(() => {
            progress += Math.random()
            if (progress >= 100) {
                progress = 100
                onFinish()
                clearInterval(timer)
            }
            else {
                onUpdate(progress, Math.random() * 1024 * 10, 123456, 123456 * progress / 100)
            }
        }, 100)
    },
    async restartAPP() {
        location.reload()
    }
}

export default injectFunctions