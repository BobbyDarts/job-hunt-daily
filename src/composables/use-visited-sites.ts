import { ref, computed, Ref } from 'vue';
import type { VisitedSites } from '@/types';

export function useVisitedSites(storageKey: string, totalSites: Ref<number>) {
    const visitedSites = ref<Set<string>>(new Set());
    const lastVisitDate = ref('');

    const visitedCount = computed(() => visitedSites.value.size);
    const isComplete = computed(() => visitedCount.value === totalSites.value);

    const getTodayDate = () => new Date().toISOString().split('T')[0];

    const loadVisitedSites = () => {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            const parsed: VisitedSites = JSON.parse(stored);
            const today = getTodayDate();
            if (parsed.date === today) visitedSites.value = new Set(parsed.visited);
            else visitedSites.value.clear();
            lastVisitDate.value = today;
        }
    };

    const saveVisitedSites = () => {
        const toSave: VisitedSites = {
            date: getTodayDate(),
            visited: Array.from(visitedSites.value)
        };
        localStorage.setItem(storageKey, JSON.stringify(toSave));
    };

    const markVisited = (url: string) => {
        visitedSites.value.add(url);
        saveVisitedSites();
    };

    loadVisitedSites();

    return {
        visitedSites,
        visitedCount,
        isComplete,
        markVisited,
        isSiteVisited: (url: string) => visitedSites.value.has(url),
    };
}
