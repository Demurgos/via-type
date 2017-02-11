import * as _ from "lodash";
import {ucs2} from "punycode";
import {nfc as unormNfc} from "unorm";
import {LowerCaseError} from "./errors/case-error";
import {MaxLengthError} from "./errors/max-length-error";
import {MinLengthError} from "./errors/min-length-error";
import {TrimError} from "./errors/not-trimmed-error";
import {PatternError} from "./errors/pattern-error";
import {IncidentTypeError} from "./errors/unexpected-type-error";
import {
  SerializableTypeAsync,
  SerializableTypeSync,
  VersionedTypeAsync,
  VersionedTypeSync
} from "./interfaces";

export const NAME: string = "string";

export interface StringOptions {
  /**
   * Use codepoints instead of codeunits when checking the length.
   * Javascript's string are lists of 16-bit code units instead of unicode codepoints so
   * codepoints outside of the Basic Multilingual Plane (BMP) are encoded as surrogate pairs.
   * It leads to `"𝄞".length === 2` even if the `MUSICAL SYMBOL G CLEF` is a single codepoint.
   * If you enable unicodeSupplementaryPlanes, the string will be decoded as an array of
   * codepoints first and treated as a string with length 1. This is acts similarly to the `u`
   * flag for regular expressions.
   *
   * Here is a concrete example:
   * ```
   * new StringType({unicodeSupplementaryPlanes: true, maxLength: 1}).test("𝄞"); // true
   * new StringType({unicodeSupplementaryPlanes: false, maxLength: 1}).test("𝄞"); // false
   * ```
   */
  unicodeSupplementaryPlanes?: boolean;

  /**
   * Ensure NFC normalization when reading strings.
   *
   * References:
   * - http://unicode.org/faq/normalization.html
   * - http://unicode.org/reports/tr15/
   */
  unicodeNormalization?: boolean;

  regex?: RegExp | null;
  lowerCase?: boolean;
  trimmed?: boolean;
  minLength?: number | null;
  maxLength?: number | null;
}

export interface CompleteStringOptions extends StringOptions {
  unicodeSupplementaryPlanes: boolean;
  unicodeNormalization: boolean;
  regex: RegExp | null;
  lowerCase: boolean;
  trimmed: boolean;
  minLength: number | null;
  maxLength: number | null;
}

const DEFAULT_OPTIONS: CompleteStringOptions = {
  unicodeSupplementaryPlanes: false,
  unicodeNormalization: false,
  regex: null,
  lowerCase: false,
  trimmed: false,
  minLength: null,
  maxLength: null
};

function readSync(format: "json-doc" | "bson-doc", val: any, options: StringOptions): string {
  let valStr: string = String(val);

  if (options.unicodeNormalization) {
    valStr = unormNfc(valStr);
  }

  if (options.lowerCase) {
    valStr = valStr.toLowerCase();
  }

  if (options.trimmed) {
    valStr = _.trim(valStr);
  }

  const error: Error | null = testErrorSync(valStr, options);
  if (error !== null) {
    throw error;
  }
  return valStr;
}

function readTrustedSync(format: "json-doc" | "bson-doc", val: any): string {
  return val;
}

function writeSync(format: "json-doc" | "bson-doc", val: string): string {
  return val;
}

function testErrorSync(val: any, options: StringOptions) {
  if (!(typeof val === "string")) {
    return new IncidentTypeError("string", val);
  }

  if (options.lowerCase) {
    if (val !== val.toLowerCase()) {
      return new LowerCaseError(val);
    }
  }

  if (options.trimmed) {
    if (val !== _.trim(val)) {
      return new TrimError(val);
    }
  }

  const symbols: string | number[] = options.unicodeSupplementaryPlanes ? ucs2.decode(val) : val;
  const strLen: number = symbols.length;

  const minLength: number | null | undefined = options.minLength;
  if (typeof minLength === "number" && strLen < minLength) {
    return new MinLengthError(symbols, minLength);
  }

  const maxLength: number | null | undefined = options.maxLength;
  if (typeof maxLength === "number" && strLen > maxLength) {
    return new MaxLengthError(symbols, maxLength);
  }

  if (options.regex instanceof RegExp) {
    if (!options.regex.test(val)) {
      return new PatternError(val, options.regex);
    }
  }

  return null;
}

function testSync(val: string, options: StringOptions): boolean {
  return testErrorSync(val, options) === null;
}

function equalsSync(val1: string, val2: string): boolean {
  return val1 === val2;
}

function cloneSync(val: string): string {
  return val;
}

function diffSync(oldVal: string, newVal: string): [string, string] | null {
  return oldVal === newVal ? null : [oldVal, newVal];
}

function patchSync(oldVal: string, diff: [string, string] | null): string {
  return diff === null ? oldVal : diff[1];
}

function reverseDiffSync(diff: [string, string] | null): [string, string] | null {
  return diff === null ? null : [diff[1], diff[0]];
}

function squashSync(diff1: [string, string] | null, diff2: [string, string] | null): [string, string] | null {
  if (diff1 === null) {
    return diff2 === null ? null : diff2;
  } else {
    return diff2 === null ? diff1 : [diff1[0], diff2[1]];
  }
}

export class StringType implements SerializableTypeSync<string, "bson-doc", string>,
  VersionedTypeSync<string, string, [string, string]>,
  SerializableTypeAsync<string, "bson-doc", string>,
  VersionedTypeAsync<string, string, [string, string]> {

  isSync: true = true;
  isAsync: true = true;
  isSerializable: true = true;
  isVersioned: true = true;
  isCollection: false = false;
  type: string = NAME;
  types: string[] = [NAME];

  options: CompleteStringOptions;

  constructor(options?: StringOptions) {
    this.options = _.merge({}, DEFAULT_OPTIONS, options);
  }

  toJSON(): null { // TODO: return options
    return null;
  }

  readTrustedSync(format: "json-doc" | "bson-doc", val: any): string {
    return readTrustedSync(format, val);
  }

  async readTrustedAsync(format: "json-doc", val: string): Promise<string>;
  async readTrustedAsync(format: "bson-doc", val: string): Promise<string>;
  async readTrustedAsync(format: any, val: any): Promise<any> {
    return readTrustedSync(format, val);
  }

  readSync(format: "json-doc" | "bson-doc", val: any): string {
    return readSync(format, val, this.options);
  }

  async readAsync(format: "json-doc" | "bson-doc", val: any): Promise<string> {
    return readSync(format, val, this.options);
  }

  writeSync(format: "json-doc" | "bson-doc", val: string): any {
    return writeSync(format, val);
  }

  async writeAsync(format: "json-doc" | "bson-doc", val: string): Promise<any> {
    return writeSync(format, val);
  }

  testErrorSync(val: any): Error | null {
    return testErrorSync(val, this.options);
  }

  async testErrorAsync(val: any): Promise<Error | null> {
    return testErrorSync(val, this.options);
  }

  testSync(val: any): boolean {
    return testSync(val, this.options);
  }

  async testAsync(val: any): Promise<boolean> {
    return testSync(val, this.options);
  }

  equalsSync(val1: string, val2: string): boolean {
    return equalsSync(val1, val2);
  }

  async equalsAsync(val1: string, val2: string): Promise<boolean> {
    return equalsSync(val1, val2);
  }

  cloneSync(val: string): string {
    return cloneSync(val);
  }

  async cloneAsync(val: string): Promise<string> {
    return cloneSync(val);
  }

  diffSync(oldVal: string, newVal: string): [string, string] | null {
    return diffSync(oldVal, newVal);
  }

  async diffAsync(oldVal: string, newVal: string): Promise<[string, string] | null> {
    return diffSync(oldVal, newVal);
  }

  patchSync(oldVal: string, diff: [string, string] | null): string {
    return patchSync(oldVal, diff);
  }

  async patchAsync(oldVal: string, diff: [string, string] | null): Promise<string> {
    return patchSync(oldVal, diff);
  }

  reverseDiffSync(diff: [string, string] | null): [string, string] | null {
    return reverseDiffSync(diff);
  }

  async reverseDiffAsync(diff: [string, string] | null): Promise<[string, string] | null> {
    return reverseDiffSync(diff);
  }

  squashSync(diff1: [string, string] | null, diff2: [string, string] | null): [string, string] | null {
    return squashSync(diff1, diff2);
  }

  async squashAsync(diff1: [string, string] | null, diff2: [string, string] | null): Promise<[string, string] | null> {
    return squashSync(diff1, diff2);
  }
}