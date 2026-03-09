// /src/composables/lib/use-select-model.ts

import { computed } from "vue";

export function useSelectModel<T extends string>(
  getValue: () => T | T[],
  emit: (value: T | T[]) => void,
  options: { multiple?: boolean } = {},
) {
  const isSelected = (val: T): boolean => {
    const current = getValue();
    if (Array.isArray(current)) return current.includes(val);
    return current === val;
  };

  const toggle = (val: T | "__all__") => {
    if (val === "__all__") {
      emit(options.multiple ? ([] as T[]) : ("__all__" as T));
      return;
    }

    if (!options.multiple) {
      emit(val as T);
      return;
    }

    const current = getValue();
    const arr = Array.isArray(current) ? current : [];
    const next = arr.includes(val as T)
      ? arr.filter(v => v !== val)
      : [...arr, val as T];
    emit(next);
  };

  const selectedCount = computed(() => {
    const current = getValue();
    return Array.isArray(current) ? current.length : current ? 1 : 0;
  });

  return { isSelected, toggle, selectedCount };
}
