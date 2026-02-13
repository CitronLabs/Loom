#import "/_utils/html_helpers.typ": *

#let hero_visual(title) = {
  div(class: "hero-container")[
    #canvas(id: "hero-gpu-canvas", width: "1920", height: "1080")[]
    #div(class: "hero-content")[
      #h1(class: "glitch-text")[#title]
    ]
  ]
}
