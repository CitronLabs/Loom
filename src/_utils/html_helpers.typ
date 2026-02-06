// Basic HTML tag wrappers for cleaner component code
#let div(..args) = html.elem("div", ..args)
#let nav(..args) = html.elem("nav", ..args)
#let span(..args) = html.elem("span", ..args)
#let section(..args) = html.elem("section", ..args)
#let header(..args) = html.elem("header", ..args)
#let footer(..args) = html.elem("footer", ..args)
#let main(..args) = html.elem("main", ..args)
#let style(..args) = html.elem("style", ..args)

// Usage example: #div(attrs: (class: "container"))[Content]
