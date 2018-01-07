import { NotImplementedError } from "../errors/not-implemented";
import { Lazy, Serializer, VersionedType } from "../types";
import * as union from "./union";

export type Name = "try-union";
export const name: Name = "try-union";
export namespace json {
  export interface Input {
    [key: string]: any;
  }

  export interface Output {
    [key: string]: any;
  }

  export type Type = undefined;
}
export type Diff = any;

export interface Options<T, Output, Input extends Output, Diff> {
  variants: VersionedType<T, any, any, Diff>[];
}

function toUnionOptions<T>(options: Options<T, any, any, any>): union.Options<T, any, any, any> {
  const variants: VersionedType<T, any, any, Diff>[] = options.variants;
  const matcher: union.Matcher<T> = (value: any) => {
    for (const variant of variants) {
      if (variant.test(value)) {
        return variant;
      }
    }
    return undefined;
  };
  const readMatcher: union.ReadMatcher<T> = (input: any, serializer: Serializer) => {
    for (const variant of variants) {
      try {
        serializer.read(variant, input);
        return variant;
      } catch (err) {
        // Ignore error and try next variant
      }
    }
    return undefined;
  };
  return {variants: options.variants, matcher, readMatcher};
}

export class TryUnionType<T extends {}> extends union.UnionType<T> {
  readonly names: string[] = [this.name, name];

  constructor(options: Lazy<Options<T, any, any, any>>, lazy?: boolean) {
    super(() => toUnionOptions(typeof options === "function" ? options() : options), lazy);
  }

  toJSON(): json.Type {
    throw NotImplementedError.create("TryUnionType#toJSON");
  }

  diff(oldVal: T, newVal: T): Diff | undefined {
    throw NotImplementedError.create("TryUnionType#diff");
  }

  patch(oldVal: T, diff: Diff | undefined): T {
    throw NotImplementedError.create("TryUnionType#patch");
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    throw NotImplementedError.create("TryUnionType#reverseDiff");
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    throw NotImplementedError.create("TryUnionType#squash");
  }
}