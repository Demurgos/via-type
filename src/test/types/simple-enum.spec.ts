import {CaseStyle} from "../../lib/helpers/rename";
import {SimpleEnumType} from "../../lib/types/simple-enum";
import {runTests, TypedValue} from "../helpers/test";

describe("SimpleEnum", function () {
  enum Color {
    Red,
    Green,
    Blue
  }

  const type: SimpleEnumType<Color> = new SimpleEnumType({enum: Color});

  const items: TypedValue[] = [
    {
      name: "Color.Red",
      value: Color.Red,
      valid: true,
      serialized: {
        json: {canonical: "Red"}
      }
    },
    {
      name: "Color.Green",
      value: Color.Green,
      valid: true,
      serialized: {
        json: {canonical: "Green"}
      }
    },
    {
      name: "Color.Blue",
      value: Color.Blue,
      valid: true,
      serialized: {
        json: {canonical: "Blue"}
      }
    },
    {
      name: "0",
      value: 0,
      valid: true,
      serialized: {
        json: {canonical: "Red"}
      }
    },
    {
      name: "1",
      value: 1,
      valid: true,
      serialized: {
        json: {canonical: "Green"}
      }
    },
    {
      name: "2",
      value: 2,
      valid: true,
      serialized: {
        json: {canonical: "Blue"}
      }
    },

    {name: "new Date()", value: new Date(), valid: false},
    {name: "3", value: 3, valid: false},
    {name: "-1", value: -1, valid: false},
    {name: '""', value: "", valid: false},
    {name: '"0"', value: "0", valid: false},
    {name: '"true"', value: "true", valid: false},
    {name: '"false"', value: "false", valid: false},
    {name: "Infinity", value: Infinity, valid: false},
    {name: "-Infinity", value: -Infinity, valid: false},
    {name: "NaN", value: NaN, valid: false},
    {name: "undefined", value: undefined, valid: false},
    {name: "null", value: null, valid: false},
    {name: "[]", value: [], valid: false},
    {name: "{}", value: {}, valid: false},
    {name: "/regex/", value: /regex/, valid: false}
  ];

  runTests(type, items);
});

describe("SimpleEnum#rename", function () {
  enum Node {
    Expression,
    BinaryOperator,
    BlockStatement
  }

  const type: SimpleEnumType<Node> = new SimpleEnumType({enum: Node, rename: CaseStyle.KebabCase});

  const items: TypedValue[] = [
    {
      name: "Node.Expression",
      value: Node.Expression,
      valid: true,
      serialized: {
        json: {canonical: "expression"}
      }
    },
    {
      name: "Node.BinaryOperator",
      value: Node.BinaryOperator,
      valid: true,
      serialized: {
        json: {canonical: "binary-operator"}
      }
    },
    {
      name: "Node.BlockStatement",
      value: Node.BlockStatement,
      valid: true,
      serialized: {
        json: {canonical: "block-statement"}
      }
    },
    {
      name: "0",
      value: 0,
      valid: true,
      serialized: {
        json: {canonical: "expression"}
      }
    },
    {
      name: "1",
      value: 1,
      valid: true,
      serialized: {
        json: {canonical: "binary-operator"}
      }
    },
    {
      name: "2",
      value: 2,
      valid: true,
      serialized: {
        json: {canonical: "block-statement"}
      }
    }
  ];

  runTests(type, items);
});
