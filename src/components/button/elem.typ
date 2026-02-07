#import "../../_utils/html_helpers.typ": div, span

#let counter_button(label: "Click me") = div(attrs: (class: "counter-wrapper"))[
  #html.elem("button", attrs: (id: "increment-btn"))[#label]
  #div()[
    Current Count: #span(attrs: (id: "count-display"))[0]
  ]
]
