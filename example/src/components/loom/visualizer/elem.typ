#import "/_utils/html_helpers.typ": *

#let visualizer() = {
  div(class: "graphics-container")[
    #div(class: "canvas-pair")[
      #canvas(id: "gl-canvas", width: "300", height: "300")[]
      #canvas(id: "gpu-canvas", width: "300", height: "300")[]
    ]
    #div(class: "label")[Left: WebGL | Right: WebGPU]
  ]
}
