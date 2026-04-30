import { createSignal } from "solid-js";
import { type IStats, initStats } from "../lib/istat.ts";
import * as mem from "../lib/mem.ts";

const [stats, setStats] = createSignal<IStats>(initStats());
const totalStats = async () => setStats(await mem.totalStats());

export { stats, totalStats };
