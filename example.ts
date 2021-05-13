import { Worker, isMainThread, parentPort, workerData } from 'worker_threads'
import { rpcConsumer, rpcProvider } from '.'

class Mathr {
  add(a = 0, b = 0) {
    return a + b
  }
  div(a = 0, b = 0) {
    return a / b
  }
  nono() {
    throw new Error('NO')
  }
}

(async () => {
  if (isMainThread) {
    const worker = new Worker(__filename, {
      workerData: { /* worker data here */ }
    })

    const mathr = rpcConsumer(worker, Mathr)
    const res = await mathr.add(1, 2)
    console.log(res)

  } else {
    const someWorkerData = workerData
    const mathr = new Mathr()
    rpcProvider(parentPort, mathr)
  }
})()