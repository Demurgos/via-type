import { Incident } from "incident";
import { lazyProperties } from "../_helpers/lazy-properties";
import { NotImplementedError } from "../errors/not-implemented";
import { WrongTypeError } from "../errors/wrong-type";
import { Lazy, VersionedType } from "../types";

export type Name = "map";
export const name: Name = "map";
export namespace bson {
  export interface Input {
    [key: string]: any;
  }

  export interface Output {
    [key: string]: any;
  }
}
export namespace json {
  export interface Input {
    [key: string]: any;
  }

  export interface Output {
    [key: string]: any;
  }

  // TODO(demurgos): Export arrayType to JSON
  export type Type = undefined;
}
export namespace qs {
  export interface Input {
    [key: string]: any;
  }

  export interface Output {
    [key: string]: any;
  }
}
export type Diff = any;

export interface Options<K, V> {
  keyType: VersionedType<K, any, any, any>;
  valueType: VersionedType<V, any, any, any>;
  maxSize: number;
  assumeStringKey?: boolean;
}

export class MapType<K, V> implements VersionedType<Map<K, V>, json.Input, json.Output, Diff> {
  readonly name: Name = name;
  readonly keyType: VersionedType<K, any, any, any>;
  readonly valueType: VersionedType<V, any, any, any>;
  readonly maxSize: number;
  readonly assumeStringKey: boolean;

  private _options: Lazy<Options<K, V>>;

  constructor(options: Lazy<Options<K, V>>, lazy?: boolean) {
    this._options = options;
    if (lazy === undefined) {
      lazy = typeof options === "function";
    }
    if (!lazy) {
      this._applyOptions();
    } else {
      lazyProperties(
        this,
        this._applyOptions,
        ["keyType", "valueType", "maxSize", "assumeStringKey"],
      );
    }
  }

  toJSON(): json.Type {
    throw NotImplementedError.create("MapType#toJSON");
  }

  readTrustedJson(input: json.Output): Map<K, V> {
    const result: Map<K, V> = new Map();
    for (const keyString in input) {
      const key: K = this.keyType.readTrustedJson(JSON.parse(keyString));
      const value: V = this.valueType.readTrustedJson(input[keyString]);
      result.set(key, value);
    }
    return result;
  }

  readJson(input: any): Map<K, V> {
    if (typeof input !== "object" || input === null) {
      throw WrongTypeError.create("object", input);
    }
    const result: Map<K, V> = new Map();
    for (const keyString in input) {
      let rawKey: any;
      try {
        rawKey = JSON.parse(keyString);
      } catch (err) {
        throw err;
      }
      const key: K = this.keyType.readJson(rawKey);
      const value: V = this.valueType.readJson(input[keyString]);
      result.set(key, value);
    }
    const error: Error | undefined = this.testError(result);
    if (error !== undefined) {
      throw error;
    }
    return result;
  }

  writeJson(val: Map<K, V>): json.Output {
    const result: {[key: string]: any} = {};
    for (const [key, value] of val) {
      const rawKey: any = this.keyType.writeJson(key);
      const keyString: string = JSON.stringify(rawKey);
      // TODO(demurgos): Check for duplicate keys
      result[keyString] = this.valueType.writeJson(value);
    }
    return result;
  }

  testError(val: Map<K, V>): Error | undefined {
    if (!(val instanceof Map)) {
      return WrongTypeError.create("Map", val);
    }
    for (const [key, value] of val) {
      // TODO: test keyType
      const keyError: Error | undefined = this.keyType.testError(key);
      if (keyError !== undefined) {
        return new Incident("InvalidMapKey", {key, value}, "Invalid map entry: invalid key");
      }
      const valueError: Error | undefined = this.valueType.testError(value);
      if (valueError !== undefined) {
        return new Incident("InvalidMapValue", {key, value}, "Invalid map entry: invalid value");
      }
    }
    return undefined;
  }

  test(val: Map<K, V>): boolean {
    return this.testError(val) === undefined;
  }

  equals(val1: Map<K, V>, val2: Map<K, V>): boolean {
    if (val2.size !== val1.size) {
      return false;
    }
    // TODO(demurgos): This test is brittle (order-sensitive) and involves unnecessary serialization.
    const val1Json: string = JSON.stringify(this.writeJson(val1));
    const val2Json: string = JSON.stringify(this.writeJson(val2));
    return val1Json === val2Json;
  }

  clone(val: Map<K, V>): Map<K, V> {
    const result: Map<K, V> = new Map();
    for (const [key, value] of val) {
      const keyClone: K = this.keyType.clone(key);
      const valueClone: V = this.valueType.clone(value);
      result.set(key, value);
    }
    return result;
  }

  diff(oldVal: Map<K, V>, newVal: Map<K, V>): Diff | undefined {
    throw NotImplementedError.create("MapType#diff");
  }

  patch(oldVal: Map<K, V>, diff: Diff | undefined): Map<K, V> {
    throw NotImplementedError.create("MapType#patch");
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    throw NotImplementedError.create("MapType#reverseDiff");
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    throw NotImplementedError.create("MapType#squash");
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw new Incident("No pending options");
    }
    const options: Options<K, V> = typeof this._options === "function" ? this._options() : this._options;

    const keyType: VersionedType<K, any, any, any> = options.keyType;
    const valueType: VersionedType<V, any, any, any> = options.valueType;
    const maxSize: number = options.maxSize;
    const assumeStringKey: boolean = options.assumeStringKey || false;

    Object.assign(this, {keyType, valueType, maxSize, assumeStringKey});
    Object.freeze(this);
  }
}