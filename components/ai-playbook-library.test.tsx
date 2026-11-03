// @vitest-environment jsdom
import React, { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AiPlaybookLibrary } from './ai-playbook-library'
import { AI_PLAYBOOKS } from '@/lib/ai-playbooks'

const cards = AI_PLAYBOOKS.map(({ slug, title, summary, category, readTime, outcome }) => ({ slug, title, summary, category, readTime, outcome }))
let container: HTMLDivElement
let root: Root
const titles = () => Array.from(container.querySelectorAll('article h3')).map(node => node.textContent)

async function search(value: string) {
  const input = container.querySelector('input[type="search"]') as HTMLInputElement
  await act(async () => {
    // Use the native setter so React observes a real input change.
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
}
async function category(value: string) {
  const select = container.querySelector('select') as HTMLSelectElement
  await act(async () => {
    select.value = value
    select.dispatchEvent(new Event('change', { bubbles: true }))
  })
}

beforeEach(async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  await act(async () => { root.render(<AiPlaybookLibrary playbooks={cards} />) })
})
afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
  vi.unstubAllGlobals()
})

describe('AI playbook discovery', () => {
  it('finds the customer-support workflow when words appear across card fields', async () => {
    await search('customer support')
    const support = cards.find(card => card.category === 'Support')!
    expect(titles()).toEqual([support.title])
    expect(container.querySelector('[role="status"]')?.textContent).toBe('1 playbook')
    expect(container.querySelector('article a')?.getAttribute('href')).toBe(`/ai/${support.slug}`)
  })

  it('shows an empty result and resets both filters back to the full library', async () => {
    await category('Support')
    await search('zzznomatchingworkflowzzz')
    expect(titles()).toEqual([])
    expect(container.textContent).toContain('No playbooks match this view.')
    const reset = Array.from(container.querySelectorAll('button')).find(button => button.textContent === 'Reset filters')!
    await act(async () => { reset.click() })
    expect((container.querySelector('input[type="search"]') as HTMLInputElement).value).toBe('')
    expect((container.querySelector('select') as HTMLSelectElement).value).toBe('All workflows')
    expect(titles()).toEqual(cards.map(card => card.title))
  })

  it('intersects the selected category with the search instead of ignoring either', async () => {
    await search('customer support')
    await category('Listings')
    expect(titles()).toEqual([])
    await category('Support')
    expect(titles()).toEqual([cards.find(card => card.category === 'Support')!.title])
    await search('verified product facts')
    expect(titles()).toEqual([])
    await category('Listings')
    expect(titles()).toEqual([cards.find(card => card.category === 'Listings')!.title])
  })
})
