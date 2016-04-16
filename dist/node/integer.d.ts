import { Type, TypeSync, StaticType } from "via-core";
import { ViaTypeError } from "./via-type-error";
export declare class IntegerTypeError extends ViaTypeError {
}
export declare class NumericError extends IntegerTypeError {
    constructor(value: number);
}
export declare class IntegerTypeSync implements TypeSync<number, number> {
    isSync: boolean;
    name: string;
    readTrustedSync(format: string, val: any): number;
    readSync(format: string, val: any): number;
    writeSync(format: string, val: number): any;
    testSync(val: any): Error;
    equalsSync(val1: number, val2: number): boolean;
    cloneSync(val: number): number;
    diffSync(oldVal: number, newVal: number): number;
    patchSync(oldVal: number, diff: number): number;
    revertSync(newVal: number, diff: number): number;
}
export declare let IntegerType: StaticType<number, number>;
export declare type IntegerType = Type<number, number>;
