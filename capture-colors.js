(() => {
  const colors = []

  const colorElements = document.querySelectorAll('[id^="color-"]')
  console.log(`Found ${colorElements.length} color elements`)

  colorElements.forEach((el) => {
    const id = Number.parseInt(el.id.replace("color-", ""))
    
    // Get the computed style to extract color values
    const computedStyle = window.getComputedStyle(el)
    const backgroundColor = computedStyle.backgroundColor
    
    console.log(`Processing element ${el.id}:`, {
      backgroundColor,
      background: computedStyle.background,
      element: el
    })
    
    let rgb = null
    
    // Try to extract RGB values from background-color
    const rgbMatch = backgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (rgbMatch) {
      rgb = {
        r: parseInt(rgbMatch[1]),
        g: parseInt(rgbMatch[2]),
        b: parseInt(rgbMatch[3])
      }
    } else {
      // Try to extract from rgba
      const rgbaMatch = backgroundColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/)
      if (rgbaMatch) {
        rgb = {
          r: parseInt(rgbaMatch[1]),
          g: parseInt(rgbaMatch[2]),
          b: parseInt(rgbaMatch[3])
        }
      } else {
        // Check if it's a hex color in a data attribute or style
        const hexColor = el.getAttribute('data-color') || el.style.backgroundColor
        if (hexColor && hexColor.startsWith('#')) {
          const hex = hexColor.replace('#', '')
          rgb = {
            r: parseInt(hex.substr(0, 2), 16),
            g: parseInt(hex.substr(2, 2), 16),
            b: parseInt(hex.substr(4, 2), 16)
          }
        }
      }
    }

    // Get color name from various sources
    const name = el.title || 
                 el.getAttribute('aria-label') || 
                 el.getAttribute('data-color-name') || 
                 el.getAttribute('data-name') ||
                 `Color ${id}`

    const colorData = {
      id: id,
      name: name,
      rgb: rgb,
      rawBackgroundColor: backgroundColor,
      element: el.outerHTML.substring(0, 200) // First 200 chars for debugging
    }
    
    console.log(`Color ${id}:`, colorData)
    colors.push(colorData)
  })

  console.log("Final colors array:", colors)
  return colors
})()
