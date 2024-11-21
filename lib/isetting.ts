import { Tag } from "@sholvoir/vocabulary";

export const settingFormat = '0.1.0';

export interface ISetting {
    format: string;
    version: number;
    sprint: number;
    books: Array<Tag>;
};

export const defaultSetting = () => ({
    format: settingFormat,
    version: 0,
    sprint: 10,
    books: ['__']
}) as ISetting;