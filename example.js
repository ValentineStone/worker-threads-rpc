"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const _1 = require(".");
class Mathr {
    add(a = 0, b = 0) {
        return a + b;
    }
    div(a = 0, b = 0) {
        return a / b;
    }
    nono() {
        throw new Error('NO');
    }
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    if (worker_threads_1.isMainThread) {
        const worker = new worker_threads_1.Worker(__filename, {
            workerData: { /* worker data here */}
        });
        const mathr = _1.rpcConsumer(worker, Mathr);
        const res = yield mathr.add(1, 2);
        console.log(res);
    }
    else {
        const someWorkerData = worker_threads_1.workerData;
        const mathr = new Mathr();
        _1.rpcProvider(worker_threads_1.parentPort, mathr);
    }
}))();
