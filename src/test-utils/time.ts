// /src/test-utils/time.ts

import { getNow, setNow } from "@/lib/time";

export function advanceTimeBy(ms: number) {
  setNow(getNow().add({ milliseconds: ms }));
}
