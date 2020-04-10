import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";
import { CaseStyle } from "kryo/lib/core.js";
import { DateType } from "kryo/lib/date.js";
import { IntegerType } from "kryo/lib/integer.js";
import { RecordIoType } from "kryo/lib/record";
import { RecordType } from "kryo/lib/record.js";

import { JsonReader } from "../../lib/json-reader.js";
import { JsonWriter } from "../../lib/json-writer.js";

describe("kryo-json | Record", function () {
  const JSON_READER: JsonReader = new JsonReader();
  const JSON_WRITER: JsonWriter = new JsonWriter();

  const documentType: RecordIoType<any> = new RecordType({
    noExtraKeys: false,
    properties: {
      dateProp: {
        optional: false,
        type: new DateType(),
      },
      optIntProp: {
        optional: true,
        type: new IntegerType(),
      },
      nestedDoc: {
        optional: true,
        type: new RecordType({
          noExtraKeys: false,
          properties: {
            id: {
              optional: true,
              type: new IntegerType(),
            },
          },
        }),
      },
    },
  });

  const items: TestItem[] = [
    {
      value: {
        dateProp: new Date(0),
        optIntProp: 50,
        nestedDoc: {
          id: 10,
        },
      },
      io: [
        {
          writer: JSON_WRITER, reader: JSON_READER, raw: JSON.stringify({
            dateProp: "1970-01-01T00:00:00.000Z",
            optIntProp: 50,
            nestedDoc: {id: 10},
          }),
        },
      ],
    },
    {
      value: {
        dateProp: new Date(0),
        nestedDoc: {
          id: 10,
        },
      },
      io: [
        {
          writer: JSON_WRITER,
          reader: JSON_READER,
          raw: JSON.stringify({dateProp: "1970-01-01T00:00:00.000Z", nestedDoc: {id: 10}}),
        },
      ],
    },
  ];

  registerMochaSuites(documentType, items);

  describe("Reader", function () {
    const invalids: string[] = [
      "\"1970-01-01T00:00:00.000Z\"",
      "null",
      "0",
      "1",
      "\"\"",
      "\"0\"",
      "\"true\"",
      "\"false\"",
      "true",
      "false",
      "[]",
      "{}",
    ];
    registerErrMochaTests(JSON_READER, documentType, invalids);
  });
});

describe("Document: rename", function () {
  const JSON_READER: JsonReader = new JsonReader();
  const JSON_WRITER: JsonWriter = new JsonWriter();

  interface Rect {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
  }

  const type: RecordIoType<Rect> = new RecordType<Rect>({
    properties: {
      xMin: {type: new IntegerType()},
      xMax: {type: new IntegerType(), changeCase: CaseStyle.ScreamingSnakeCase},
      yMin: {type: new IntegerType(), rename: "__yMin"},
      yMax: {type: new IntegerType()},
    },
    rename: {xMin: "xmin"},
    changeCase: CaseStyle.KebabCase,
  });

  const items: TestItem[] = [
    {
      name: "Rect {xMin: 0, xMax: 10, yMin: 20, yMax: 30}",
      value: {
        xMin: 0,
        xMax: 10,
        yMin: 20,
        yMax: 30,
      },
      io: [
        {
          writer: JSON_WRITER,
          reader: JSON_READER,
          raw: JSON.stringify({"xmin": 0, "X_MAX": 10, "__yMin": 20, "y-max": 30}),
        },
      ],
    },
  ];

  registerMochaSuites(type, items);
});
