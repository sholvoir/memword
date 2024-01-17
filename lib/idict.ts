import { IDict } from "dict/lib/idict.ts";

export interface IDiction extends IDict {
    word: string;
    version: number;
}