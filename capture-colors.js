(() => {
  const colors = []

  const colorElements = document.querySelectorAll('[id^="color-"]')

  colorElements.forEach((el) => {
    const id = Number.parseInt(el.id.replace("color-", ""))
    
    // Get the computed style to extract RGB values
    const computedStyle = window.getComputedStyle(el)
    const backgroundColor = computedStyle.backgroundColor
    
    // Extract RGB values from the background color
    const rgbMatch = backgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    const rgb = rgbMatch ? {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3])
    } : null

    // Get color name from title, aria-label, or data attribute if available
    const name = el.title || el.getAttribute('aria-label') || el.getAttribute('data-color-name') || `Color ${id}`

    colors.push({
      id: id,
      name: name,
      rgb: rgb
    })
  })

  console.log("Colors:", colors)
  return colors
})()
