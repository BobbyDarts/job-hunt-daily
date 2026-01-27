import { describe, it, expect, beforeEach, vi } from 'vitest';
import { defineComponent, ref } from 'vue';
import { useVisitedSites } from './use-visited-sites';
import { mount } from '@vue/test-utils';

const STORAGE_KEY = 'test-visited-sites';

const today = new Date().toISOString().split('T')[0];

describe('useVisitedSites', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it('starts with no visited sites', () => {
        const totalSites = ref(5);

        const { visitedCount, isComplete } =
            useVisitedSites(STORAGE_KEY, totalSites);

        expect(visitedCount.value).toBe(0);
        expect(isComplete.value).toBe(false);
    });

    it('marks a site as visited and persists it', () => {
        const totalSites = ref(3);

        const { visitedCount, isSiteVisited, markVisited } =
            useVisitedSites(STORAGE_KEY, totalSites);

        markVisited('https://example.com');

        expect(visitedCount.value).toBe(1);
        expect(isSiteVisited('https://example.com')).toBe(true);

        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
        expect(stored.visited).toContain('https://example.com');
        expect(stored.date).toBe(today);
    });

    it('does not duplicate visited sites', () => {
        const totalSites = ref(2);

        const { visitedCount, markVisited } =
            useVisitedSites(STORAGE_KEY, totalSites);

        markVisited('a.com');
        markVisited('a.com');
        markVisited('a.com');

        expect(visitedCount.value).toBe(1);
    });

    it('calculates completion correctly', () => {
        const totalSites = ref(2);

        const { isComplete, markVisited } =
            useVisitedSites(STORAGE_KEY, totalSites);

        markVisited('a.com');
        expect(isComplete.value).toBe(false);

        markVisited('b.com');
        expect(isComplete.value).toBe(true);
    });

    it('loads visited sites from localStorage on mount (same day)', async () => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                date: today,
                visited: ['a.com', 'b.com'],
            })
        );

        let exposed: any;

        const TestComponent = defineComponent({
            setup() {
                const totalSites = ref(3);
                exposed = useVisitedSites(STORAGE_KEY, totalSites);
                return () => null;
            },
        });

        mount(TestComponent);

        await Promise.resolve(); // allow mounted hook to run

        expect(exposed.visitedCount.value).toBe(2);
        expect(exposed.isSiteVisited('a.com')).toBe(true);
        expect(exposed.isSiteVisited('b.com')).toBe(true);
    });

    it('resets visited sites if stored date is from a previous day', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                date: yesterday.toISOString().split('T')[0],
                visited: ['a.com', 'b.com'],
            })
        );

        const totalSites = ref(3);

        const { visitedCount } =
            useVisitedSites(STORAGE_KEY, totalSites);

        expect(visitedCount.value).toBe(0);
    });

    it('updates isComplete reactively when totalSites changes', () => {
        const totalSites = ref(1);

        const { isComplete, markVisited } =
            useVisitedSites(STORAGE_KEY, totalSites);

        markVisited('a.com');
        expect(isComplete.value).toBe(true);

        totalSites.value = 2;
        expect(isComplete.value).toBe(false);
    });
});
