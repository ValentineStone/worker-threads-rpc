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
exports.rpcProvider = exports.rpcConsumer = void 0;
const promise_guts = () => {
    let guts = {};
    guts.promise = new Promise((resolve, reject) => {
        guts.resolve = resolve;
        guts.reject = reject;
    });
    return guts;
};
const rpcConsumer = (port, Constructor, options = {}) => {
    const methods = Object.getOwnPropertyNames(Constructor.prototype);
    const callbacks = {};
    const proxy = {};
    let callidCounter = 1;
    for (const method of methods) {
        if (method === 'constructor')
            continue;
        proxy[method] = (...args) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const callid = callidCounter++;
            port.postMessage({ method, args, callid }, (_b = (_a = options === null || options === void 0 ? void 0 : options.transfer) === null || _a === void 0 ? void 0 : _a[method]) === null || _b === void 0 ? void 0 : _b.call(_a, ...args));
            callbacks[callid] = promise_guts();
            return callbacks[callid].promise;
        });
    }
    port.on('message', value => {
        if (value === null || value === void 0 ? void 0 : value.callid) {
            const { callid, resolve, reject } = value;
            if (reject)
                callbacks[callid].reject(reject);
            else
                callbacks[callid].resolve(resolve);
            delete callbacks[callid];
        }
    });
    return proxy;
};
exports.rpcConsumer = rpcConsumer;
const rpcProvider = (port, instance, options = {}) => {
    port.on('message', (value) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        if (value === null || value === void 0 ? void 0 : value.callid) {
            const { callid, method, args } = value;
            try {
                const resolve = yield instance[method](...args);
                port.postMessage({ callid, resolve }, (_b = (_a = options === null || options === void 0 ? void 0 : options.transfer) === null || _a === void 0 ? void 0 : _a[method]) === null || _b === void 0 ? void 0 : _b.call(_a, resolve, ...args));
            }
            catch (reject) {
                port.postMessage({ callid, reject });
            }
        }
    }));
};
exports.rpcProvider = rpcProvider;
