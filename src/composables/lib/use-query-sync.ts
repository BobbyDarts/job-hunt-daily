// /src/composables/lib/use-query-sync.ts

import { watch } from "vue";
import { useRoute, useRouter, type LocationQuery } from "vue-router";

export function useQuerySync<
  T extends Record<string, string | number | boolean>,
>({
  state,
  toQuery,
  fromQuery,
}: {
  state: T;
  toQuery: (state: T) => Record<string, string | undefined>;
  fromQuery: (query: LocationQuery) => Partial<T>;
}) {
  const route = useRoute();
  const router = useRouter();

  watch(
    () => route.query,
    query => {
      const next = fromQuery(query);
      Object.assign(state, next);
    },
    { immediate: true },
  );

  watch(
    state,
    stateVal => {
      const nextQuery = toQuery(stateVal);

      // Always fully replace, prevent sticking old keys
      void router.replace({ name: route.name, query: nextQuery });
    },
    { deep: true },
  );
}
