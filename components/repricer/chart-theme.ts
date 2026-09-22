// Shared chart palette and dark-mode hook for the repricer charts.
// Colors are the dataviz reference categorical palette — first three slots
// validate all-pairs colorblind checks in both modes. Floor/target reference
// lines use status colors (critical/good), never series hues.

import { useEffect, useState } from "react"

export const SERIES = {
  light: { our: "#2a78d6", buyBox: "#eb6834", lowest: "#1baf7a" },
  dark: { our: "#3987e5", buyBox: "#d95926", lowest: "#199e70" },
}

export const CHROME = {
  light: { grid: "#e1e0d9", axis: "#898781", floor: "#d03b3b", target: "#0ca30c" },
  dark: { grid: "#2c2c2a", axis: "#898781", floor: "#d03b3b", target: "#0ca30c" },
}

export function useDarkMode(): boolean {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const compute = () => setDark(root.classList.contains("dark") || media.matches)
    compute()
    const observer = new MutationObserver(compute)
    observer.observe(root, { attributes: true, attributeFilter: ["class"] })
    media.addEventListener("change", compute)
    return () => {
      observer.disconnect()
      media.removeEventListener("change", compute)
    }
  }, [])
  return dark
}
