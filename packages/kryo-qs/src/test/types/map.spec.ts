import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";
import { IntegerType } from "kryo/lib/types/integer.js";
import { MapType } from "kryo/lib/types/map.js";
import { Ucs2StringType } from "kryo/lib/types/ucs2-string.js";

import { QsReader } from "../../lib/qs-reader.js";
import { QsWriter } from "../../lib/qs-writer.js";

describe("kryo-qs | Map", function () {
  const QS_READER: QsReader = new QsReader();
  const QS_WRITER: QsWriter = new QsWriter();

  describe("IntMap", function () {
    const $IntMap: MapType<number, number> = new MapType({
      keyType: new IntegerType(),
      valueType: new IntegerType(),
      maxSize: 5,
    });

    const items: TestItem[] = [
      {
        value: new Map([[1, 100], [2, 200]]),
        io: [
          {writer: QS_WRITER, reader: QS_READER, raw: "%221%22=100&%222%22=200"},
          {reader: QS_READER, raw: "\"1\"=100&\"2\"=200"},
        ],
      },
    ];

    registerMochaSuites($IntMap, items);

    describe("Reader", function () {
      const invalids: string[] = [
        "null",
        "true",
        "false",
        "",
        "0",
        "1",
        "0.5",
        "0.0001",
        "2.220446049250313e-16",
        "9007199254740991",
        "-9007199254740991",
        "\"\"",
        "\"0\"",
        "\"1\"",
        "\"null\"",
        "\"true\"",
        "\"false\"",
        "\"undefined\"",
        "\"NaN\"",
        "\"Infinity\"",
        "\"-Infinity\"",
        "\"foo\"",
        "[]",
        "{}",
        "\"1970-01-01T00:00:00.000Z\"",
      ];
      registerErrMochaTests(QS_READER, $IntMap, invalids);
    });
  });

  describe("StringMap", function () {
    const $StringMap: MapType<string, number> = new MapType({
      keyType: new Ucs2StringType({pattern: /^a+$/, maxLength: 10}),
      valueType: new IntegerType(),
      maxSize: 5,
      assumeStringKey: true,
    });

    const items: TestItem[] = [
      {
        value: new Map([["a", 100], ["aa", 200]]),
        io: [
          {writer: QS_WRITER, reader: QS_READER, raw: "a=100&aa=200"},
        ],
      },
    ];

    registerMochaSuites($StringMap, items);

    describe("Reader", function () {
      const invalids: string[] = [
        "null",
        "true",
        "false",
        "",
        "0",
        "1",
        "0.5",
        "0.0001",
        "2.220446049250313e-16",
        "9007199254740991",
        "-9007199254740991",
        "\"\"",
        "\"0\"",
        "\"1\"",
        "\"null\"",
        "\"true\"",
        "\"false\"",
        "\"undefined\"",
        "\"NaN\"",
        "\"Infinity\"",
        "\"-Infinity\"",
        "\"foo\"",
        "[]",
        "{}",
        "\"1970-01-01T00:00:00.000Z\"",
      ];
      registerErrMochaTests(QS_READER, $StringMap, invalids);
    });
  });
});
