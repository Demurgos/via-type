import { createInvalidTimestampError } from "../errors/invalid-timestamp";
import { createInvalidTypeError } from "../errors/invalid-type";
import { readVisitor } from "../readers/read-visitor";
import { IoType, Reader, VersionedType, Writer } from "../types";

export type Name = "date";
export const name: Name = "date";
export namespace json {
  export type Input = string | number;
  export type Output = string;

  export interface Type {
    name: Name;
  }
}
export type Diff = number;

export class DateType implements IoType<Date>, VersionedType<Date, Diff> {
  readonly name: Name = name;

  toJSON(): json.Type {
    return {name};
  }

  // TODO: Dynamically add with prototype?
  read<R>(reader: Reader<R>, raw: R): Date {
    return reader.readDate(raw, readVisitor({
      fromDate: (input: Date): Date => {
        const error: Error | undefined = this.testError(input);
        if (error !== undefined) {
          throw error;
        }
        return input;
      },
    }));
  }

  // TODO: Dynamically add with prototype?
  write<W>(writer: Writer<W>, value: Date): W {
    return writer.writeDate(value);
  }

  testError(val: Date): Error | undefined {
    if (!(val instanceof Date)) {
      return createInvalidTypeError("Date", val);
    }
    const time: number = val.getTime();
    if (isNaN(time) || time > Number.MAX_SAFE_INTEGER || time < Number.MIN_SAFE_INTEGER) {
      return createInvalidTimestampError(val);
    }

    return undefined;
  }

  test(val: Date): val is Date {
    return this.testError(val) === undefined;
  }

  equals(val1: Date, val2: Date): boolean {
    return val1.getTime() === val2.getTime();
  }

  clone(val: Date): Date {
    return new Date(val.getTime());
  }

  diff(oldVal: Date, newVal: Date): Diff | undefined {
    /* tslint:disable-next-line:strict-boolean-expressions */
    return newVal.getTime() - oldVal.getTime() || undefined;
  }

  patch(oldVal: Date, diff: Diff | undefined): Date {
    /* tslint:disable-next-line:strict-boolean-expressions */
    return new Date(oldVal.getTime() + (diff || 0));
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    /* tslint:disable-next-line:strict-boolean-expressions */
    return diff && -diff;
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    if (diff1 === undefined) {
      return diff2;
    } else if (diff2 === undefined) {
      return diff1;
    }
    return diff2 === -diff1 ? undefined : diff1 + diff2;
  }
}
