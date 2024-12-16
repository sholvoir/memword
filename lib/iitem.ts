import { IDict } from "@sholvoir/dict/lib/idict.ts";

export interface IDiction extends IDict {
    word: string;
    version: number;
}