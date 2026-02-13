#import "/_utils/html_helpers.typ": *

#let standard_card(title: "", ..args) = {
  div(class: "standard-card")[
    #if title != "" { h3()[#title] }
    #args.pos().at(0)
  ]
}
