import { describe, it, expect } from 'vitest';
import { useATSDetection } from './use-ats-detection';
import type { JobHuntData, JobSite } from '@/types';

describe('useATSDetection', () => {
    const mockData: JobHuntData = {
        categories: [
            {
                name: 'Test Category 1',
                sites: [
                    {
                        name: 'Workday Company',
                        url: 'https://company.wd1.myworkdayjobs.com/jobs',
                    },
                    {
                        name: 'Greenhouse Company',
                        url: 'https://boards.greenhouse.io/company',
                    },
                    {
                        name: 'Regular Site',
                        url: 'https://example.com/careers',
                    },
                ],
            },
            {
                name: 'Test Category 2',
                sites: [
                    {
                        name: 'Lever Company',
                        url: 'https://jobs.lever.co/company',
                    },
                    {
                        name: 'BambooHR Company',
                        url: 'https://company.bamboohr.com/jobs',
                    },
                ],
            },
        ],
    };

    describe('initialization', () => {
        it('creates a map for all sites in the data', () => {
            const { atsMap } = useATSDetection(mockData);

            // Should have an entry for each site
            expect(atsMap.size).toBe(5);
        });

        it('correctly identifies Workday sites', () => {
            const { atsMap } = useATSDetection(mockData);
            const workdaySite = mockData.categories[0].sites[0];

            const atsInfo = atsMap.get(workdaySite.url);
            expect(atsInfo).toBeDefined();
            expect(atsInfo?.type).toBe('workday');
            expect(atsInfo?.initials).toBe('WD');
        });

        it('correctly identifies Greenhouse sites', () => {
            const { atsMap } = useATSDetection(mockData);
            const greenhouseSite = mockData.categories[0].sites[1];

            const atsInfo = atsMap.get(greenhouseSite.url);
            expect(atsInfo).toBeDefined();
            expect(atsInfo?.type).toBe('greenhouse');
            expect(atsInfo?.initials).toBe('GH');
        });

        it('correctly identifies Lever sites', () => {
            const { atsMap } = useATSDetection(mockData);
            const leverSite = mockData.categories[1].sites[0];

            const atsInfo = atsMap.get(leverSite.url);
            expect(atsInfo).toBeDefined();
            expect(atsInfo?.type).toBe('lever');
            expect(atsInfo?.initials).toBe('LV');
        });

        it('correctly identifies BambooHR sites', () => {
            const { atsMap } = useATSDetection(mockData);
            const bambooSite = mockData.categories[1].sites[1];

            const atsInfo = atsMap.get(bambooSite.url);
            expect(atsInfo).toBeDefined();
            expect(atsInfo?.type).toBe('bamboohr');
            expect(atsInfo?.initials).toBe('BH');
        });

        it('returns undefined for non-ATS sites', () => {
            const { atsMap } = useATSDetection(mockData);
            const regularSite = mockData.categories[0].sites[2];

            const atsInfo = atsMap.get(regularSite.url);
            expect(atsInfo).toBeUndefined();
        });
    });

    describe('getATS', () => {
        it('returns ATSInfo for a Workday site', () => {
            const { getATS } = useATSDetection(mockData);
            const workdaySite = mockData.categories[0].sites[0];

            const atsInfo = getATS(workdaySite);
            expect(atsInfo).toBeDefined();
            expect(atsInfo?.type).toBe('workday');
            expect(atsInfo?.initials).toBe('WD');
            expect(atsInfo?.classes).toContain('blue');
        });

        it('returns ATSInfo for a Greenhouse site', () => {
            const { getATS } = useATSDetection(mockData);
            const greenhouseSite = mockData.categories[0].sites[1];

            const atsInfo = getATS(greenhouseSite);
            expect(atsInfo).toBeDefined();
            expect(atsInfo?.type).toBe('greenhouse');
            expect(atsInfo?.classes).toContain('green');
        });

        it('returns undefined for non-ATS sites', () => {
            const { getATS } = useATSDetection(mockData);
            const regularSite = mockData.categories[0].sites[2];

            const atsInfo = getATS(regularSite);
            expect(atsInfo).toBeUndefined();
        });

        it('returns undefined for unknown site URLs', () => {
            const { getATS } = useATSDetection(mockData);
            const unknownSite: JobSite = {
                name: 'Unknown',
                url: 'https://unknown.com/jobs',
            };

            const atsInfo = getATS(unknownSite);
            expect(atsInfo).toBeUndefined();
        });
    });

    describe('isATS', () => {
        it('returns true for Workday sites', () => {
            const { isATS } = useATSDetection(mockData);
            const workdaySite = mockData.categories[0].sites[0];

            expect(isATS(workdaySite)).toBe(true);
        });

        it('returns true for Greenhouse sites', () => {
            const { isATS } = useATSDetection(mockData);
            const greenhouseSite = mockData.categories[0].sites[1];

            expect(isATS(greenhouseSite)).toBe(true);
        });

        it('returns true for Lever sites', () => {
            const { isATS } = useATSDetection(mockData);
            const leverSite = mockData.categories[1].sites[0];

            expect(isATS(leverSite)).toBe(true);
        });

        it('returns true for BambooHR sites', () => {
            const { isATS } = useATSDetection(mockData);
            const bambooSite = mockData.categories[1].sites[1];

            expect(isATS(bambooSite)).toBe(true);
        });

        it('returns false for non-ATS sites', () => {
            const { isATS } = useATSDetection(mockData);
            const regularSite = mockData.categories[0].sites[2];

            expect(isATS(regularSite)).toBe(false);
        });

        it('returns false for unknown site URLs', () => {
            const { isATS } = useATSDetection(mockData);
            const unknownSite: JobSite = {
                name: 'Unknown',
                url: 'https://unknown.com/jobs',
            };

            expect(isATS(unknownSite)).toBe(false);
        });
    });

    describe('manual atsType override', () => {
        it('respects manual atsType in job site data', () => {
            const dataWithOverride: JobHuntData = {
                categories: [
                    {
                        name: 'Test',
                        sites: [
                            {
                                name: 'Override Test',
                                url: 'https://example.com/careers',
                                atsType: 'greenhouse', // Manual override
                            },
                        ],
                    },
                ],
            };

            const { getATS, isATS } = useATSDetection(dataWithOverride);
            const site = dataWithOverride.categories[0].sites[0];

            expect(isATS(site)).toBe(true);
            expect(getATS(site)?.type).toBe('greenhouse');
        });
    });

    describe('edge cases', () => {
        it('handles empty categories array', () => {
            const emptyData: JobHuntData = { categories: [] };
            const { atsMap, getATS, isATS } = useATSDetection(emptyData);

            expect(atsMap.size).toBe(0);

            const testSite: JobSite = { name: 'Test', url: 'https://test.com' };
            expect(getATS(testSite)).toBeUndefined();
            expect(isATS(testSite)).toBe(false);
        });

        it('handles categories with no sites', () => {
            const data: JobHuntData = {
                categories: [{ name: 'Empty Category', sites: [] }],
            };
            const { atsMap } = useATSDetection(data);

            expect(atsMap.size).toBe(0);
        });

        it('handles multiple sites with the same URL', () => {
            const data: JobHuntData = {
                categories: [
                    {
                        name: 'Category 1',
                        sites: [
                            { name: 'Site A', url: 'https://company.wd1.myworkdayjobs.com/jobs' },
                        ],
                    },
                    {
                        name: 'Category 2',
                        sites: [
                            { name: 'Site B', url: 'https://company.wd1.myworkdayjobs.com/jobs' }, // Duplicate URL
                        ],
                    },
                ],
            };

            const { atsMap } = useATSDetection(data);

            // Should only have one entry (map keys are unique)
            expect(atsMap.size).toBe(1);
            expect(atsMap.get('https://company.wd1.myworkdayjobs.com/jobs')?.type).toBe('workday');
        });
    });

    describe('ATSInfo structure', () => {
        it('returns complete ATSInfo with all required fields', () => {
            const { getATS } = useATSDetection(mockData);
            const workdaySite = mockData.categories[0].sites[0];

            const atsInfo = getATS(workdaySite);
            expect(atsInfo).toHaveProperty('type');
            expect(atsInfo).toHaveProperty('patterns');
            expect(atsInfo).toHaveProperty('initials');
            expect(atsInfo).toHaveProperty('classes');
        });

        it('has correct color classes for each ATS type', () => {
            const { getATS } = useATSDetection(mockData);

            const workdayInfo = getATS(mockData.categories[0].sites[0]);
            expect(workdayInfo?.classes).toContain('blue');

            const greenhouseInfo = getATS(mockData.categories[0].sites[1]);
            expect(greenhouseInfo?.classes).toContain('green');

            const leverInfo = getATS(mockData.categories[1].sites[0]);
            expect(leverInfo?.classes).toContain('purple');

            const bambooInfo = getATS(mockData.categories[1].sites[1]);
            expect(bambooInfo?.classes).toContain('orange');
        });
    });
});