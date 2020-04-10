import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";
import { Ucs2StringType } from "kryo/lib/ucs2-string.js";

import { JsonReader } from "../../lib/json-reader.js";
import { JsonWriter } from "../../lib/json-writer.js";

describe("kryo-json | Ucs2StringType", function () {
  const JSON_READER: JsonReader = new JsonReader();
  const JSON_WRITER: JsonWriter = new JsonWriter();

  describe("Ucs2StringType({maxLength: 15})", function () {
    const $String50: Ucs2StringType = new Ucs2StringType({maxLength: 15});

    const items: TestItem[] = [
      {
        value: "",
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "\"\""},
        ],
      },
      {
        value: "Hello World!",
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "\"Hello World!\""},
        ],
      },
      {
        value: "ԂЯØǷ Łƕ੬ ɃɅϨϞ",
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "\"ԂЯØǷ Łƕ੬ ɃɅϨϞ\""},
        ],
      },
    ];

    registerMochaSuites($String50, items);

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
      registerErrMochaTests(JSON_READER, $String50, invalids);
    });
  });
});
