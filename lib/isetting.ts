import { Tag } from "@sholvoir/vocabulary";

export const settingFormat = '0.1.1';

export interface ISetting {
    format: string;
    version: number;
    books: Array<Tag>;
};

export const defaultSetting = () => ({
    format: settingFormat,
    version: 0,
    books: ['__']
}) as ISetting;