export const settingFormat = '0.0.5';

export interface ISetting {
    format: string;
    version: number;
    sprint: number;
    books: Array<string>;
};

export const defaultSetting = () => ({
    format: settingFormat,
    version: 0,
    sprint: 10,
    books: ['R__', 'L__']
}) as ISetting;