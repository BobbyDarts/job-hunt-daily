// /src/composables/dashboard/use-period-unit.ts

import { reactive } from "vue";

import { useQuerySync } from "@/composables/lib";
import type { PeriodUnit } from "@/types";

const VALID_PERIOD_UNITS = new Set<PeriodUnit>(["day", "week", "month"]);

const state = reactive<{ periodUnit: PeriodUnit }>({ periodUnit: "day" });

export function usePeriodUnit() {
  useQuerySync({
    state,
    toQuery: s => ({
      ...(s.periodUnit !== "day" ? { period: s.periodUnit } : {}),
    }),
    fromQuery: q => {
      const raw = Array.isArray(q.period) ? q.period[0] : q.period;
      return {
        periodUnit: VALID_PERIOD_UNITS.has(raw as PeriodUnit)
          ? (raw as PeriodUnit)
          : "day",
      };
    },
  });

  return { state };
}
