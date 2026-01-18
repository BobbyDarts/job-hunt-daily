export interface JobSite {
    name: string
    url: string
}

export interface JobCategory {
    name: string
    sites: JobSite[]
}

export interface JobHuntData {
    categories: JobCategory[]
}

export interface VisitedSites {
    date: string
    visited: string[] // array of site URLs
}