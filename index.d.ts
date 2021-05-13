/// <reference types="node" />
import { MessagePort, Worker, TransferListItem } from 'worker_threads';
declare type GenericFunction = (...args: any) => any;
export declare type AsyncClass<Class> = {
    [key in keyof Class as Class[key] extends GenericFunction ? key : never]: Class[key] extends GenericFunction ? (...args: Parameters<Class[key]>) => Promise<ReturnType<Class[key]>> : never;
};
declare type TransferConsumer<Class> = {
    [key in keyof Class as Class[key] extends GenericFunction ? key : never]?: Class[key] extends GenericFunction ? (...args: Parameters<Class[key]>) => readonly TransferListItem[] : never;
};
declare type TransferProvider<Class> = {
    [key in keyof Class as Class[key] extends GenericFunction ? key : never]?: Class[key] extends GenericFunction ? (result: ReturnType<Class[key]>, ...args: Parameters<Class[key]>) => readonly TransferListItem[] : never;
};
export declare const rpcConsumer: <Class>(port: MessagePort | Worker, Constructor: new () => Class, options?: {
    transfer?: TransferConsumer<Class>;
}) => AsyncClass<Class>;
export declare const rpcProvider: <Class>(port: MessagePort | Worker, instance: Class, options?: {
    transfer?: TransferProvider<Class>;
}) => void;
export {};
