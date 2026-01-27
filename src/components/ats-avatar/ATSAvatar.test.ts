import { describe, it, expect } from 'vitest';
import { ATSAvatar } from '.';
import type { ATSInfo } from '@/lib/ats-detection';
import type { JobSite } from '@/types';
import { mountWithProviders } from '@/test-utils/mount-with-providers';
import { TooltipProvider } from '@/components/ui/tooltip';

const mockSite: JobSite = {
    name: 'Example Site',
    url: 'https://example.com',
};

const mockATSInfo: ATSInfo = {
    type: 'greenhouse',
    initials: 'GH',
    classes: 'bg-green-500 text-white',
    patterns: ['greenhouse.io'],
};

// default mounting options
const defaultProps = {
    providers: [TooltipProvider],
};

describe('ATSAvatar', () => {
    it('does not render when atsInfo is not provided', () => {
        const wrapper = mountWithProviders(ATSAvatar, {
            ...defaultProps,
            props: { site: mockSite },
        });

        expect(wrapper.find('[data-testid="ats-badge"]').exists()).toBe(false);
    });

    it('renders ATS badge when atsInfo is provided', () => {
        const wrapper = mountWithProviders(ATSAvatar, {
            ...defaultProps,
            props: { site: mockSite, atsInfo: mockATSInfo },
        });

        expect(wrapper.find('[data-testid="ats-badge"]').exists()).toBe(true);
    });

    it('displays the correct ATS initials', () => {
        const wrapper = mountWithProviders(ATSAvatar, {
            ...defaultProps,
            props: { site: mockSite, atsInfo: mockATSInfo },
        });

        expect(wrapper.text()).toContain('GH');
    });

    it('applies visited variant styling', () => {
        const wrapper = mountWithProviders(ATSAvatar, {
            ...defaultProps,
            props: { site: mockSite, atsInfo: mockATSInfo, variant: 'visited' },
        });

        const avatar = wrapper.find('[data-testid="ats-badge"]');
        expect(avatar.classes()).toContain('opacity-70');
    });
});
