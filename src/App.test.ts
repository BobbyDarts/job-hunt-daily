import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import App from './App.vue'

describe('App.vue', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders the main heading', () => {
    const wrapper = mount(App)
    expect(wrapper.find('h1').text()).toBe('Job Hunt Daily')
  })

  it('displays total number of sites', () => {
    const wrapper = mount(App)
    const totalSites = wrapper.vm.totalSites
    expect(totalSites).toBeGreaterThan(0)
  })

  it('starts with 0 visited sites', () => {
    const wrapper = mount(App)
    expect(wrapper.vm.visitedCount).toBe(0)
  })

  it('shows 0% progress initially', () => {
    const wrapper = mount(App)
    expect(wrapper.vm.progress).toBe(0)
  })

  it('increments visited count when site is clicked', async () => {
    const wrapper = mount(App)
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    const buttons = wrapper.findAll('button').filter(btn =>
      btn.attributes('class')?.includes('w-full')
    )
    const firstButton = buttons[0]

    if (firstButton) {
      await firstButton.trigger('click')
      expect(wrapper.vm.visitedCount).toBe(1)
    }

    openSpy.mockRestore()
  })

  it('marks site as visited after clicking', async () => {
    const wrapper = mount(App)
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    const buttons = wrapper.findAll('button').filter(btn =>
      btn.attributes('class')?.includes('w-full')
    )
    const firstButtonText = buttons[0]?.text()

    if (buttons[0]) {
      await buttons[0].trigger('click')
      await wrapper.vm.$nextTick()

      // Find the button again after it's moved to visited section
      const updatedButtons = wrapper.findAll('button').filter(btn =>
        btn.text().includes(firstButtonText)
      )

      // Check if checkmark appears
      expect(updatedButtons[0].text()).toContain('✓')
    }

    openSpy.mockRestore()
  })

  it('opens link in new tab when clicked', async () => {
    const wrapper = mount(App)
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    const buttons = wrapper.findAll('button').filter(btn =>
      btn.attributes('class')?.includes('w-full')
    )
    const firstButton = buttons[0]

    if (firstButton) {
      await firstButton.trigger('click')
      expect(openSpy).toHaveBeenCalledWith(
        expect.any(String),
        '_blank',
        'noopener,noreferrer'
      )
    }

    openSpy.mockRestore()
  })

  it('shows completion message when all sites visited', async () => {
    const wrapper = mount(App)
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    // Click all site buttons
    const buttons = wrapper.findAll('button').filter(btn =>
      btn.attributes('class')?.includes('w-full')
    )

    for (const button of buttons) {
      await button.trigger('click')
    }

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.isComplete).toBe(true)
    expect(wrapper.text()).toContain('All done for today')

    openSpy.mockRestore()
  })

  it('persists visited sites to localStorage', async () => {
    const wrapper = mount(App)
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    const buttons = wrapper.findAll('button').filter(btn =>
      btn.attributes('class')?.includes('w-full')
    )
    const firstButton = buttons[0]

    if (firstButton) {
      await firstButton.trigger('click')

      const stored = localStorage.getItem('job-hunt-visited')
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored!)
      expect(parsed.visited).toHaveLength(1)
    }

    openSpy.mockRestore()
  })

  it('does not duplicate visited sites when clicked multiple times', async () => {
    const wrapper = mount(App)
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    const buttons = wrapper.findAll('button').filter(btn =>
      btn.attributes('class')?.includes('w-full')
    )
    const firstButton = buttons[0]

    if (firstButton) {
      await firstButton.trigger('click')
      await firstButton.trigger('click')
      await firstButton.trigger('click')

      expect(wrapper.vm.visitedCount).toBe(1)

      const stored = localStorage.getItem('job-hunt-visited')
      const parsed = JSON.parse(stored!)
      expect(parsed.visited).toHaveLength(1)
    }

    openSpy.mockRestore()
  })

  it('loads visited sites from localStorage on mount', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    // Pre-populate localStorage with visited site
    const today = new Date().toISOString().split('T')[0]
    const mockData = {
      date: today,
      visited: ['https://www.linkedin.com/jobs/']
    }
    localStorage.setItem('job-hunt-visited', JSON.stringify(mockData))

    const wrapper = mount(App)
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.visitedCount).toBe(1)
    expect(wrapper.vm.isSiteVisited('https://www.linkedin.com/jobs/')).toBe(true)

    openSpy.mockRestore()
  })

  it('resets visited sites for a new day', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    // Pre-populate localStorage with yesterday's data
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const mockData = {
      date: yesterdayStr,
      visited: ['https://www.linkedin.com/jobs/', 'https://www.indeed.com/']
    }
    localStorage.setItem('job-hunt-visited', JSON.stringify(mockData))

    const wrapper = mount(App)
    await wrapper.vm.$nextTick()

    // Should reset to 0 for new day
    expect(wrapper.vm.visitedCount).toBe(0)

    openSpy.mockRestore()
  })

  it('renders all categories from JSON data', () => {
    const wrapper = mount(App)

    // Check that category headings exist
    expect(wrapper.text()).toContain('General Job Boards')
    expect(wrapper.text()).toContain('Tech & Startup Boards')
    expect(wrapper.text()).toContain('Remote-Focused Boards')
    expect(wrapper.text()).toContain('Company Career Pages')
    expect(wrapper.text()).toContain('Staffing & Recruiting Firms')
  })

  it('calculates progress correctly at different percentages', async () => {
    const wrapper = mount(App)
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    const totalSites = wrapper.vm.totalSites
    const buttons = wrapper.findAll('button').filter(btn =>
      btn.attributes('class')?.includes('w-full')
    )

    // Click half the sites
    const halfCount = Math.floor(buttons.length / 2)
    for (let i = 0; i < halfCount; i++) {
      await buttons[i].trigger('click')
    }

    await wrapper.vm.$nextTick()

    const expectedProgress = Math.round((halfCount / totalSites) * 100)
    expect(wrapper.vm.progress).toBe(expectedProgress)

    openSpy.mockRestore()
  })

  it('updates progress bar width based on completion', async () => {
    const wrapper = mount(App)
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    // Initial state - should be 0% complete
    expect(wrapper.vm.progress).toBe(0)

    // Click one site
    const buttons = wrapper.findAll('button').filter(btn =>
      btn.attributes('class')?.includes('w-full')
    )
    const firstButton = buttons[0]

    if (firstButton) {
      await firstButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Progress should be greater than 0
      expect(wrapper.vm.progress).toBeGreaterThan(0)
    }

    openSpy.mockRestore()
  })

  it('stores the correct date in localStorage', async () => {
    const wrapper = mount(App)
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    const buttons = wrapper.findAll('button').filter(btn =>
      btn.attributes('class')?.includes('w-full')
    )
    const firstButton = buttons[0]

    if (firstButton) {
      await firstButton.trigger('click')

      const stored = localStorage.getItem('job-hunt-visited')
      const parsed = JSON.parse(stored!)
      const today = new Date().toISOString().split('T')[0]

      expect(parsed.date).toBe(today)
    }

    openSpy.mockRestore()
  })
})