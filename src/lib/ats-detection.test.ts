import { describe, it, expect } from 'vitest';
import { detectATS, getATSType } from './ats-detection';
import type { JobSite } from '@/types';

describe('detectATS', () => {
    describe('Workday detection', () => {
        it('detects Workday from myworkdayjobs.com URL', () => {
            const url = 'https://unum.wd1.myworkdayjobs.com/en-US/External/userHome';
            expect(detectATS(url)).toBe('workday');
        });

        it('detects Workday from wd1. subdomain', () => {
            const url = 'https://company.wd1.myworkdayjobs.com/jobs';
            expect(detectATS(url)).toBe('workday');
        });

        it('detects Workday from wd5. subdomain', () => {
            const url = 'https://travelers.wd5.myworkdayjobs.com/External';
            expect(detectATS(url)).toBe('workday');
        });
    });

    describe('Greenhouse detection', () => {
        it('detects Greenhouse from greenhouse.io URL', () => {
            const url = 'https://boards.greenhouse.io/company/jobs/123456';
            expect(detectATS(url)).toBe('greenhouse');
        });

        it('detects Greenhouse from my.greenhouse.io URL', () => {
            const url = 'https://my.greenhouse.io/company';
            expect(detectATS(url)).toBe('greenhouse');
        });
    });

    describe('Lever detection', () => {
        it('detects Lever from lever.co URL', () => {
            const url = 'https://jobs.lever.co/company';
            expect(detectATS(url)).toBe('lever');
        });
    });

    describe('BambooHR detection', () => {
        it('detects BambooHR from bamboohr.com URL', () => {
            const url = 'https://company.bamboohr.com/jobs';
            expect(detectATS(url)).toBe('bamboohr');
        });
    });

    describe('Unknown ATS', () => {
        it('returns undefined for unrecognized URLs', () => {
            const url = 'https://example.com/careers';
            expect(detectATS(url)).toBeUndefined();
        });

        it('returns undefined for LinkedIn', () => {
            const url = 'https://www.linkedin.com/jobs/';
            expect(detectATS(url)).toBeUndefined();
        });

        it('returns undefined for Indeed', () => {
            const url = 'https://www.indeed.com/';
            expect(detectATS(url)).toBeUndefined();
        });
    });

    describe('Case insensitivity', () => {
        it('detects Workday regardless of URL case', () => {
            const url = 'https://company.WD1.MYWORKDAYJOBS.COM/jobs';
            expect(detectATS(url)).toBe('workday');
        });
    });
});

describe('getATSType', () => {
    it('uses manual atsType when provided', () => {
        const site: JobSite = {
            name: 'Test Company',
            url: 'https://example.com/careers',
            atsType: 'greenhouse'
        };
        expect(getATSType(site)).toBe('greenhouse');
    });

    it('falls back to auto-detection when atsType is not provided', () => {
        const site: JobSite = {
            name: 'Workday Company',
            url: 'https://company.wd1.myworkdayjobs.com/jobs'
        };
        expect(getATSType(site)).toBe('workday');
    });

    it('returns undefined when no atsType and detection fails', () => {
        const site: JobSite = {
            name: 'Unknown Company',
            url: 'https://example.com/careers'
        };
        expect(getATSType(site)).toBeUndefined();
    });

    it('prioritizes manual atsType over auto-detection', () => {
        const site: JobSite = {
            name: 'Override Test',
            url: 'https://company.wd1.myworkdayjobs.com/jobs',
            atsType: 'custom'
        };
        // Even though URL would detect as 'workday', manual override wins
        expect(getATSType(site)).toBe('custom');
    });
});