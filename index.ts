import { MessagePort, Worker, TransferListItem } from 'worker_threads'

const promise_guts = <T = any>() => {
  let guts = {} as {
    resolve: (value: unknown) => void
    reject: (reason?: any) => void
    promise: Promise<T>
  }
  guts.promise = new Promise<T>((resolve, reject) => {
    guts.resolve = resolve
    guts.reject = reject
  })
  return guts
}

type GenericFunction = (...args: any) => any

export type AsyncClass<Class> = {
  [key in keyof Class as Class[key] extends GenericFunction ? key : never]:
  Class[key] extends GenericFunction
  ? (...args: Parameters<Class[key]>) => Promise<ReturnType<Class[key]>>
  : never
}

type TransferConsumer<Class> = {
  [key in keyof Class as Class[key] extends GenericFunction ? key : never]?:
  Class[key] extends GenericFunction
  ? (...args: Parameters<Class[key]>) => readonly TransferListItem[]
  : never
}

type TransferProvider<Class> = {
  [key in keyof Class as Class[key] extends GenericFunction ? key : never]?:
  Class[key] extends GenericFunction
  ? (result: ReturnType<Class[key]>, ...args: Parameters<Class[key]>) => readonly TransferListItem[]
  : never
}

export const rpcConsumer = <Class>(
  port: MessagePort | Worker,
  Constructor: { new(): Class },
  options: {
    transfer?: TransferConsumer<Class>
  } = {}
) => {
  const methods = Object.getOwnPropertyNames(Constructor.prototype)
  const callbacks: { [key: string]: ReturnType<typeof promise_guts> } = {}
  const proxy = {} as AsyncClass<Class>
  let callidCounter = 1
  for (const method of methods) {
    if (method === 'constructor') continue
    proxy[method] = async (...args) => {
      const callid = callidCounter++
      port.postMessage(
        { method, args, callid },
        options?.transfer?.[method]?.(...args)
      )
      callbacks[callid] = promise_guts()
      return callbacks[callid].promise
    }
  }
  port.on('message', value => {
    if (value?.callid) {
      const { callid, resolve, reject } = value
      if (reject)
        callbacks[callid].reject(reject)
      else
        callbacks[callid].resolve(resolve)
      delete callbacks[callid]
    }
  })
  return proxy
}

export const rpcProvider = <Class>(
  port: MessagePort | Worker,
  instance: Class,
  options: {
    transfer?: TransferProvider<Class>
  } = {}
) => {
  port.on('message', async value => {
    if (value?.callid) {
      const { callid, method, args } = value
      try {
        const resolve = await instance[method](...args)
        port.postMessage(
          { callid, resolve },
          options?.transfer?.[method]?.(resolve, ...args)
        )
      } catch (reject) {
        port.postMessage({ callid, reject })
      }
    }
  })
}