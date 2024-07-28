export const settingFormat = '0.0.4';

export interface ISetting {
    format: string;
    sprint: number;
    books: Array<string>;
    unsynced?: true
};

export const defaultSetting = () => ({
    format: settingFormat,
    sprint: 10,
    books: ['R__', 'L__']
}) as ISetting;