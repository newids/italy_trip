import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import LandingPage from '@/components/LandingPage'

describe('LandingPage', () => {
    it('renders hero section correctly', () => {
        render(<LandingPage locale="en" />)

        expect(screen.getByText('Plan your dream trip')).toBeDefined()
        expect(screen.getByText('in minutes.')).toBeDefined()
        expect(screen.getByRole('link', { name: 'Start First Trip' })).toBeDefined()
    })

    it('renders features correctly', () => {
        render(<LandingPage locale="en" />)

        expect(screen.getAllByRole('heading', { name: 'Drag & Drop Planning' })[0]).toBeDefined()
        expect(screen.getAllByRole('heading', { name: 'Community Sharing' })[0]).toBeDefined()
        expect(screen.getAllByRole('heading', { name: 'Mobile First' })[0]).toBeDefined()
    })

    it('renders sign in buttons in header', () => {
        render(<LandingPage locale="en" />)

        // Use getAllByRole to be robust against responsive duplicates (e.g. mobile menu)
        expect(screen.getAllByRole('link', { name: /Sign In/i })[0]).toBeDefined()
        expect(screen.getAllByRole('link', { name: /Get Started/i })[0]).toBeDefined()
    })
})
