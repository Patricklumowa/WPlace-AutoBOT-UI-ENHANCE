(() => {
  const availableColors = []
  const unavailableColors = []

  const colorElements = document.querySelectorAll('[id^="color-"]')

  colorElements.forEach((el) => {
    const id = Number.parseInt(el.id.replace("color-", ""))
    if (el.querySelector("svg")) {
      unavailableColors.push(id)
    } else {
      availableColors.push(id)
    }
  })

  console.log("Available Colors:", availableColors)
  console.log("Unavailable Colors:", unavailableColors)
})()