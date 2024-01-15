import { IDict } from "dict/lib/idict.ts";
import { ITask } from "./itask.ts";

export interface IStudy {
    task: ITask;
    dict?: IDict;
}