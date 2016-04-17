import * as Promise from "bluebird";
import * as _ from "lodash";
import {Type, CollectionType, CollectionTypeAsync, UpdateQuery} from "via-core";
import {
  UnsupportedFormatError, UnexpectedTypeError, UnavailableSyncError,
  ViaTypeError
} from "./helpers/via-type-error";
import {Dictionary} from "via-core";

export interface ArrayOptions {
  maxLength: number;
}

let defaultOptions: ArrayOptions = {
  maxLength: 100
};

export class ArrayTypeError extends ViaTypeError {}

export class ItemsTestError extends ArrayTypeError {
  constructor (errors: Dictionary<Error>) {
    let errorDetails = "";
    let first = true;
    for (let index in errors) {
      errorDetails = errorDetails + (first ? "" : ", ") + index + ": " + errors[index];
      first = false;
    }
    super (null, "ArrayTypeError", {errors: errors}, `Failed test for the items: {${errorDetails}}`);
  }
}

export class MaxLengthError extends ArrayTypeError {
  constructor (array: any[], maxLength: number) {
    super (null, "via-type-array-maxlength", {array: array, maxLength: maxLength}, `Expected array length (${array.length}) to be less than or equal to ${maxLength}`);
  }
}

export class ArrayType implements CollectionTypeAsync<any[], any> {

  isSync: boolean = true;
  name: string = "array";
  options: ArrayOptions;
  itemType: Type<any, any>;

  constructor (itemType: Type<any, any>, options: ArrayOptions) {
    this.options = <ArrayOptions> _.assign(_.clone(defaultOptions), options);
    this.isSync = itemType.isSync;
    this.itemType = itemType;
  }

  readTrustedSync(format: string, val: any): any[] {
    throw new UnavailableSyncError(this, "readTrusted");
  }

  readTrusted(format: string, val: any): Promise<any[]> {
    return this.read(format, val);
  }

  readSync(format: string, val: any): any[] {
    throw new UnavailableSyncError(this, "read");
  }

  read(format: string, val: any): Promise<any[]> {
    return Promise.try(() => {
      switch (format) {
        case "bson":
        case "json":
          return Promise
            .map(val, (item: any, i: number, len: number) => {
              return this.itemType.read(format, item);
            });
        default:
          return Promise.reject(new UnsupportedFormatError(format));
      }
    });
  }

  writeSync(format: string, val: any[]): any {
    throw new UnavailableSyncError(this, "write");
  }

  write(format: string, val: any[]): Promise<any> {
    return Promise.try(() => {
      switch (format) {
        case "bson":
        case "json":
          return Promise
            .map(val, (item: any, i: number, len: number) => {
              return this.itemType.write(format, item);
            });
        default:
          return Promise.reject(new UnsupportedFormatError(format));
      }
    });
  }

  testSync (val: any[]): Error {
    throw new UnavailableSyncError(this, "test");
  }

  test (val: any[]): Promise<Error> {
    return Promise.try((): Promise<Error> => {
      if (!_.isArray(val)) {
        return Promise.reject(new UnexpectedTypeError(typeof val, "array"));
      }

      if (this.options.maxLength !== null && val.length > this.options.maxLength) {
        return Promise.resolve(new MaxLengthError(val, this.options.maxLength));
      }

      if (this.itemType === null) { // manually managed type
        return Promise.resolve<Error>(null);
      }

      return Promise
        .map(val, (item: string, i: number, len: number) => {
          return this.itemType.test(item);
        })
        .then(function(res){
          let errors: Dictionary<Error> = {};
          let noErrors = true;
          for (let i = 0, l = res.length; i < l; i++) {
            if (res[i] !== null) {
              errors[i] = res[i];
              noErrors = false;
            }
          }
          if (!noErrors) {
            return new ItemsTestError(errors);
          }
          return null;
        });
    });
  }

  equalsSync(val1: any, val2: any): boolean {
    throw new UnavailableSyncError(this, "equals");
  }

  equals (val1: any, val2: any): Promise<boolean> {
    return Promise.reject(new ViaTypeError("todo", "ArrayType does not support equals"));
  }

  cloneSync(val: any): any {
    throw new UnavailableSyncError(this, "clone");
  }

  clone (val: any): Promise<any> {
    return Promise.resolve(this.cloneSync(val));
  }

  diffSync(oldVal: any, newVal: any): any {
    throw new UnavailableSyncError(this, "diff");
  }

  diff (oldVal: any, newVal: any): Promise<any> {
    return Promise.resolve(this.diffSync(oldVal, newVal));
  }

  patchSync(oldVal: any, diff: any): any {
    throw new UnavailableSyncError(this, "patch");
  }

  patch (oldVal: any, diff: any): Promise<any> {
    return Promise.resolve(this.patchSync(oldVal, diff));
  }

  revertSync(newVal: any, diff: any): any {
    throw new UnavailableSyncError(this, "revert");
  }

  revert (newVal: any, diff: any): Promise<any> {
    return Promise.resolve(this.revertSync(newVal, diff));
  }

  reflect (visitor: (value?: any, key?: string, parent?: CollectionType<any, any>) => any) {
    return Promise.try(() => {
      visitor(this.itemType, null, <CollectionType<any, any>> this);
      if ((<CollectionType<any, any>> this.itemType).reflect) {
        (<CollectionType<any, any>> this.itemType).reflect(visitor);
      }
    });
  }

  diffToUpdate (newVal: any, diff: any, format: string): Promise<UpdateQuery> {
    let update: UpdateQuery = {
      $set: {},
      $unset: {}
    };

    return Promise.resolve(update);
  }
}
