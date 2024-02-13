import { Tag } from "vocabulary/tag.ts";

export interface ISetting {
    format: string;
    showStartPage?: true;
    sprintNumber: number;
    readBooks: Array<Tag>;
    listenBooks: Array<Tag>;
};