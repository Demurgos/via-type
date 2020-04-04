import { IoType, Reader, VersionedType, Writer } from "../core.js";
import { createInvalidTypeError } from "../errors/invalid-type.js";
import { readVisitor } from "../readers/read-visitor.js";

export type Name = "null";
export const name: Name = "null";

export class NullType implements IoType<null>, VersionedType<null, undefined> {
  readonly name: Name = name;

  read<R>(reader: Reader<R>, raw: R): null {
    return reader.readNull(raw, readVisitor({
      fromNull: () => null,
    }));
  }

  // TODO: Dynamically add with prototype?
  write<W>(writer: Writer<W>, _: null): W {
    return writer.writeNull();
  }

  testError(val: null): Error | undefined {
    if (val !== null) {
      return createInvalidTypeError("null", val);
    }
    return undefined;
  }

  test(val: null): val is null {
    return val === null;
  }

  equals(val1: null, val2: null): boolean {
    return val1 === val2;
  }

  clone(val: null): null {
    return val;
  }

  /**
   * @param _oldVal
   * @param _newVal
   * @returns `true` if there is a difference, `undefined` otherwise
   */
  diff(_oldVal: null, _newVal: null): undefined {
    return;
  }

  patch(_oldVal: null, _diff: undefined): null {
    return null;
  }

  reverseDiff(_diff: undefined): undefined {
    return;
  }

  squash(_diff1: undefined, _diff2: undefined): undefined {
    return;
  }
}
