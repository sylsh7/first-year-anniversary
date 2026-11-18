// Measure the loaded handwriting at the actual paper size; keep paragraphs intact whenever they fit.
export function paginateLetter(paragraphs: readonly string[], fits: (parts: string[]) => boolean) {
  const pages: string[][] = []
  let current: string[] = []
  for (const paragraph of paragraphs) {
    if (fits([...current, paragraph])) { current.push(paragraph); continue }
    if (current.length) { pages.push(current); current = [] }
    if (fits([paragraph])) { current.push(paragraph); continue }
    let rest = paragraph
    while (rest) {
      const chars = Array.from(rest)
      let low = 1, high = chars.length, count = 1
      while (low <= high) {
        const middle = Math.floor((low + high) / 2)
        if (fits([chars.slice(0, middle).join('')])) { count = middle; low = middle + 1 } else high = middle - 1
      }
      if (count < chars.length) {
        for (let i = count - 1; i >= count * .5; i--) if (/[。！？；]/.test(chars[i])) { count = i + 1; break }
      }
      const part = chars.slice(0, count).join('')
      rest = chars.slice(count).join('')
      if (rest) pages.push([part]); else current = [part]
    }
  }
  if (current.length) pages.push(current)
  return pages
}
