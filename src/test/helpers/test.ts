import bson from "bson";
import chai from "chai";
import qs from "qs";
import { BsonReader } from "../../lib/readers/bson";
import { JsonReader } from "../../lib/readers/json";
import { QsReader } from "../../lib/readers/qs";
import { IoType, Type } from "../../lib/types";
import { BsonWriter } from "../../lib/writers/bson";
import { JsonWriter } from "../../lib/writers/json";
import { QsWriter } from "../../lib/writers/qs";

export interface NamedValue {
  name?: string;
  value: any;
}

export interface CheckedValue extends NamedValue {
  valid: boolean;
}

export interface InvalidTypedValue extends CheckedValue {
  valid: boolean;
  testError?: Error;
}

export interface ValidTypedValue extends CheckedValue {
  valid: boolean;

  output?: {
    [formatName: string]: any;
  };

  inputs?: {
    [formatName: string]: any;
  };

  invalidInputs?: {
    [formatName: string]: any;
  };
}

export type TypedValue = InvalidTypedValue | ValidTypedValue;

function getName(namedValue: NamedValue) {
  return "name" in namedValue ? namedValue.name : JSON.stringify(namedValue.value);
}

export function testInvalidValueSync(type: Type<any>, item: InvalidTypedValue) {
  it("Should return an Error for .testErrorSync", function () {
    chai.assert.instanceOf(type.testError(item.value), Error);
  });

  it("Should return `false` for .testSync", function () {
    chai.assert.isFalse(type.test(item.value));
  });
}

export function testValidValueSync(type: Type<any>, item: ValidTypedValue) {
  it("Should return `undefined` for .testErrorSync", function () {
    const error: Error | undefined = type.testError(item.value);
    if (error !== undefined) {
      chai.assert.fail(error, undefined, String(error));
    }
  });

  it("Should return `true` for .testSync", function () {
    chai.assert.isTrue(type.test(item.value));
  });
}

export function testBsonSerialization<T>(type: IoType<T>, typedValue: ValidTypedValue): void {
  const writer: BsonWriter = new BsonWriter(bson);
  const reader: BsonReader = new BsonReader();
  const trustedReader: BsonReader = new BsonReader(true);
  let actualSerialized: Buffer;

  if (typedValue.output !== undefined && "bson" in typedValue.output) {
    const output: any = typedValue.output["bson"];
    const expectedSerialized: Buffer = new bson.BSON().serialize({wrapper: output});
    it("`.writeBson(val)` should return the expected value", function () {
      const exported: any = type.write(writer, typedValue.value);
      actualSerialized = new bson.BSON().serialize({wrapper: exported});
      chai.assert.deepEqual(actualSerialized, expectedSerialized);
    });
  } else {
    it("`t.writeBson(val)` should not throw", function () {
      const exported: any = type.write(writer, typedValue.value);
      actualSerialized = new bson.BSON().serialize({wrapper: exported});
    });
  }

  it("`t.readTrustedBson(t.writeBson(val))` should be valid and equal to `val`", function () {
    const deserialized: any = new bson.BSON().deserialize(actualSerialized).wrapper;
    const imported: T = type.read!(trustedReader, deserialized);
    chai.assert.isTrue(type.test(imported));
    chai.assert.isTrue(type.equals(imported, typedValue.value));
  });

  it("`t.readBson(t.writeBson(val))` should be valid and equal to `val`", function () {
    const deserialized: any = new bson.BSON().deserialize(actualSerialized).wrapper;
    const imported: T = type.read!(reader, deserialized);
    chai.assert.isTrue(type.test(imported));
    chai.assert.isTrue(type.equals(imported, typedValue.value));
  });
}

export function testJsonSerialization<T>(type: IoType<T>, typedValue: ValidTypedValue): void {
  const writer: JsonWriter = new JsonWriter();
  const reader: JsonReader = new JsonReader();
  const trustedReader: JsonReader = new JsonReader(true);
  let actualSerialized: string;

  if (typedValue.output !== undefined && "json" in typedValue.output) {
    const output: any = typedValue.output["json"];
    const expectedSerialized: string = JSON.stringify(output);
    it(`\`.writeJson(val)\` should return \`${expectedSerialized}\``, function () {
      const exported: any = type.write(writer, typedValue.value);
      actualSerialized = JSON.stringify(exported);
      chai.assert.deepEqual(exported, output);
    });
  } else {
    it("`t.writeJson(val)` should not throw", function () {
      const exported: any = type.write(writer, typedValue.value);
      actualSerialized = JSON.stringify(exported);
    });
  }

  it("`t.readTrustedJson(t.writeJson(val))` should be valid and equal to `val`", function () {
    const imported: T = type.read!(trustedReader, actualSerialized);
    chai.assert.isTrue(type.test(imported));
    chai.assert.isTrue(type.equals(imported, typedValue.value));
  });

  it("`t.readJson(t.writeJson(val))` should be valid and equal to `val`", function () {
    const imported: T = type.read!(reader, actualSerialized);
    chai.assert.isTrue(type.test(imported));
    chai.assert.isTrue(type.equals(imported, typedValue.value));
  });
}

export function testQsSerialization<T>(type: IoType<T>, typedValue: ValidTypedValue): void {
  const writer: QsWriter = new QsWriter();
  const reader: QsReader = new QsReader();
  const trustedReader: QsReader = new QsReader(true);
  let actualSerialized: string;

  if (typedValue.output !== undefined && "qs" in typedValue.output) {
    if (typedValue.output["qs"] === "ignore") {
      return;
    }
    const output: any = typedValue.output["qs"];
    const expectedSerialized: string = qs.stringify({wrapper: output});
    it(`\`.writeQs(val)\` should return the wrapped value \`${expectedSerialized}\``, function () {
      const exported: any = type.write(writer, typedValue.value);
      actualSerialized = qs.stringify({wrapper: exported});
      chai.assert.deepEqual(exported, output);
    });
  } else {
    it("`t.writeQs(val)` should not throw", function () {
      const exported: any = type.write(writer, typedValue.value);
      actualSerialized = qs.stringify({wrapper: exported});
    });
  }

  it("`t.readTrustedQs(t.writeQs(val))` should be valid and equal to `val`", function () {
    const deserialized: any = qs.parse(actualSerialized).wrapper;
    const imported: T = type.read!(trustedReader, deserialized);
    chai.assert.isTrue(type.test(imported));
    chai.assert.isTrue(type.equals(imported, typedValue.value));
  });

  it("`t.readQs(t.writeQs(val))` should be valid and equal to `val`", function () {
    const deserialized: any = qs.parse(actualSerialized).wrapper;
    const imported: T = type.read!(reader, deserialized);
    chai.assert.isTrue(type.test(imported));
    chai.assert.isTrue(type.equals(imported, typedValue.value));
  });
}

export function testSerialization<T>(type: IoType<T>, typedValue: ValidTypedValue): void {
  testBsonSerialization(type, typedValue);
  testJsonSerialization(type, typedValue);
  testQsSerialization(type, typedValue);
}

export function testValueSync(type: Type<any>, item: TypedValue): void {
  if (item.valid) {
    testValidValueSync(type, item);
    testSerialization(type as IoType<any>, item);
  } else {
    testInvalidValueSync(type, item);
  }
}

export function runTests(type: Type<any>, items: TypedValue[]): void {
  for (const item of items) {
    describe(`Item: ${getName(item)}`, function () {
      testValueSync(type, item);
    });
  }
}
