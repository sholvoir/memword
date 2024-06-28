import { Tag } from "vocabulary/tag.ts";

export const settingFormat = '0.0.3';

export interface ISetting {
    format: string;
    showStartPage?: true;
    sprintNumber: number;
    readBooks: Array<Tag>;
    listenBooks: Array<Tag>;
};