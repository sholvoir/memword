import { Tag } from "vocabulary/tag.ts";

export const settingFormat = '0.0.3';

export interface ISetting {
    format: string;
    showStartPage?: true;
    sprintNumber: number;
    readBooks: Array<Tag>;
    listenBooks: Array<Tag>;
};

export const defaultSetting = () => ({
    format: settingFormat,
    sprintNumber: 10,
    listenBooks: [],
    readBooks: [],
    showStartPage: true
}) as ISetting;