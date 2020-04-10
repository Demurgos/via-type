/**
 * @module kryo/builtins/sint32
 */

import { IntegerType } from "../integer.js";

export const $Sint32: IntegerType = new IntegerType({min: -2147483648, max: 2147483647});