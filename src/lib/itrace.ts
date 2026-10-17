import type { WithID } from "@sholvoir/dict-server/src/lib/common.ts";
import type { ITrace } from "@sholvoir/memword-server/src/lib/itrace.ts";

export type { ITrace };

export const mergeTrace = <T extends ITrace>(objective: T, trace: ITrace) => {
   objective.last = trace.last;
   objective.next = trace.next;
   objective.level = trace.level;
   return objective;
};

export const extractTrace = <T extends ITrace>({
   last,
   next,
   level,
}: T): ITrace => ({
   last,
   next,
   level,
});

export const extractIDTrace = <T extends WithID<ITrace>>({
   id,
   last,
   next,
   level,
}: T): WithID<ITrace> => ({
   id,
   last,
   next,
   level,
});
