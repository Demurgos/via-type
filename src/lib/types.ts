/**
 * Represents a lazy value of type `T`.
 * You can retrieve it with `const val = typeof lazy === "function" ? lazy() : lazy;`.
 * This library guarantees that it will be only called once but you should still ensure that it is idempotent.
 */
export type Lazy<T> = T | (() => T);

export interface Type<T> {
  name: string;
  testError(val: T): Error | undefined;
  test(val: T): boolean;
  equals(val1: T, val2: T): boolean;
  clone(val: T): T;
  toJSON(): any;
}

export interface JsonSerializer<T, Input = any, Output extends Input = any> {
  writeJson(val: T): Output;
  readJson(serialized: Input): T;
  readTrustedJson(serialized: Output): T;
}

export interface BsonSerializer<T, Input = any, Output extends Input = any> {
  writeBson(val: T): Output;
  readBson(serialized: Input): T;
  readTrustedBson(serialized: Output): T;
}

export interface QsSerializer<T, Input = any, Output extends Input = any> {
  writeQs(val: T): Output;
  readQs(serialized: Input): T;
  readTrustedQs(serialized: Output): T;
}

export interface VersionedType<T, Input, Output extends Input, Diff>
  extends Type<T>, JsonSerializer<T, Input, Output> {
  /**
   * Returns undefined if both values are equivalent, otherwise a diff representing the change from
   * oldVal to newVal.
   *
   * @param oldVal The old value
   * @param newVal The new value
   */
  diff(oldVal: T, newVal: T): Diff | undefined;
  patch(oldVal: T, diff: Diff | undefined): T;
  reverseDiff(diff: Diff | undefined): Diff | undefined;
  squash(oldDiff: Diff | undefined, newDiff: Diff | undefined): Diff | undefined;
  // readonly diffType: Type<Diff>;
}

export interface CollectionType <T, I> extends Type<T> {
  iterateSync(value: T, visitor: (item: I) => any): void;
}

// tslint:disable-next-line:max-line-length
// export interface VersionedCollectionType<T, S, D, I> extends CollectionType <T, D, I>, VersionedType<T, S, D> {
//   isCollection: true;
//   isVersioned: true;
//   isSerializable: true;
// }