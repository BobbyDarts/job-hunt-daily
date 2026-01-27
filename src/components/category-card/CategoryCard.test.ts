import { describe, it, expect, vi } from 'vitest';
import { mountWithProviders } from '@/test-utils/mount-with-providers';
import { CategoryCard } from '.';
import { useCategoryProgress } from '@/composables/use-category-progress';
import type { JobSite, JobCategory } from '@/types';

// Mock category and visited checker
const mockCategory: JobCategory = {
    name: 'Test Category',
    sites: [
        { name: 'Site A', url: 'https://a.com' },
        { name: 'Site B', url: 'https://b.com' },
    ],
};

const isSiteVisited = (url: string) => false;

// Real composable to provide splitCategorySites and getCategoryProgress
const { splitCategorySites, getCategoryProgress } = useCategoryProgress(
    { categories: [mockCategory] },
    isSiteVisited
);

// Default props for mounting
const defaultProps = {
    providers: [], // add providers here if needed later
    props: {
        category: mockCategory,
        maxHeightRem: 6,
        isSiteVisited,
        onSiteClick: () => { },
        getCategoryProgress,
        splitCategorySites,
    },
};

describe('CategoryCard', () => {
    it('renders category name', () => {
        const wrapper = mountWithProviders(CategoryCard, defaultProps);
        expect(wrapper.text()).toContain('Test Category');
    });

    it('renders all JobSiteButton components', () => {
        const wrapper = mountWithProviders(CategoryCard, defaultProps);
        const buttons = wrapper.findAll('button');
        expect(buttons).toHaveLength(mockCategory.sites.length);
    });

    it('calls onClick when a JobSiteButton is clicked', async () => {
        const clickSpy = vi.fn();
        const wrapper = mountWithProviders(CategoryCard, {
            ...defaultProps,
            props: { ...defaultProps.props, onSiteClick: clickSpy },
        });

        const buttons = wrapper.findAll('button');
        await buttons[0].trigger('click');

        expect(clickSpy).toHaveBeenCalledWith(mockCategory.sites[0].url);
    });
});
