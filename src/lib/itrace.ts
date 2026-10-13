import type { ITrace } from "@sholvoir/memword-server/src/lib/itrace.ts";

export type { ITrace };
export interface IIDTrace extends ITrace {
   id: string;
}

export const toIDTrace = <T extends IIDTrace>({
   id,
   last,
   next,
   level,
}: T): IIDTrace => ({
   id,
   last,
   next,
   level,
});

export const mergeTrace = <T extends ITrace>(objective: T, trace: ITrace) => {
   objective.last = trace.last;
   objective.next = trace.next;
   objective.level = trace.level;
   return objective;
};
