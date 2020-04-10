/**
 * @module kryo/writers/bson
 */

import BSON from "bson";
import { Writer } from "kryo/lib/core.js";

import { BsonValueWriter } from "./bson-value-writer.js";

export class BsonWriter implements Writer<Buffer> {
  private readonly valueWriter: BsonValueWriter;
  private readonly primitiveWrapper: string;

  constructor(primitiveWrapper: string = "_") {
    this.primitiveWrapper = primitiveWrapper;
    this.valueWriter = new BsonValueWriter();
  }

  writeAny(value: number): Buffer {
    return BSON.serialize({[this.primitiveWrapper]: this.valueWriter.writeAny(value)});
  }

  writeBoolean(value: boolean): Buffer {
    return BSON.serialize({[this.primitiveWrapper]: this.valueWriter.writeBoolean(value)});
  }

  writeBytes(value: Uint8Array): Buffer {
    return BSON.serialize({[this.primitiveWrapper]: this.valueWriter.writeBytes(value)});
  }

  writeDate(value: Date): Buffer {
    return BSON.serialize({[this.primitiveWrapper]: this.valueWriter.writeDate(value)});
  }

  writeDocument<K extends string>(
    keys: Iterable<K>,
    handler: (key: K, fieldWriter: Writer<any>) => any,
  ): Buffer {
    return BSON.serialize(this.valueWriter.writeDocument(keys, handler));
  }

  writeFloat64(value: number): Buffer {
    return BSON.serialize({[this.primitiveWrapper]: this.valueWriter.writeFloat64(value)});
  }

  writeList(size: number, handler: (index: number, itemWriter: Writer<any>) => any): Buffer {
    return BSON.serialize({[this.primitiveWrapper]: this.valueWriter.writeList(size, handler)});
  }

  writeMap(
    size: number,
    keyHandler: <KW>(index: number, mapKeyWriter: Writer<KW>) => KW,
    valueHandler: <VW>(index: number, mapValueWriter: Writer<VW>) => VW,
  ): any {
    return BSON.serialize(this.valueWriter.writeMap(size, keyHandler, valueHandler));
  }

  writeNull(): Buffer {
    return BSON.serialize({[this.primitiveWrapper]: this.valueWriter.writeNull()});
  }

  writeString(value: string): Buffer {
    return BSON.serialize({[this.primitiveWrapper]: this.valueWriter.writeString(value)});
  }
}
