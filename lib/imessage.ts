// deno-lint-ignore-file no-explicit-any
export const MessageTypes = ['init', 'close', 'setting', 'stats'] as const;
export type MessageType = typeof MessageTypes[number];
export interface IMessage { type: MessageType; data?: any; }