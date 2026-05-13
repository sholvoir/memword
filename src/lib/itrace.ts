import type { ITrace } from "#srv/lib/itrace.ts";

export type { ITrace };

export const toTrace = ({ id, last, next, level }: ITrace): ITrace => ({
   id,
   last,
   next,
   level,
});

export const mergeTrace = (objective: ITrace, trace: ITrace) => {
   objective.last = trace.last;
   objective.next = trace.next;
   objective.level = trace.level;
};
