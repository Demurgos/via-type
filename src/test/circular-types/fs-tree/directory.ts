import { CaseStyle } from "../../../lib/_helpers/rename";
import { ArrayType } from "../../../lib/types/array";
import { DocumentType } from "../../../lib/types/document";
import { LiteralType } from "../../../lib/types/literal";
import { $FsNode, FsNode } from "./fs-node";
import { $FsNodeBase, FsNodeBase } from "./fs-node-base";
import { $FsNodeType, FsNodeType } from "./fs-node-type";

export interface Directory extends FsNodeBase {
  type: FsNodeType.Directory;
  children: FsNode[];
}

export const $Directory: DocumentType<Directory> = new DocumentType<Directory>({
  properties: {
    ...$FsNodeBase.properties,
    type: {type: new LiteralType({type: $FsNodeType, value: FsNodeType.Directory})},
    children: {type: new ArrayType({itemType: $FsNode, maxLength: Infinity}), optional: true},
  },
  rename: CaseStyle.SnakeCase,
});
