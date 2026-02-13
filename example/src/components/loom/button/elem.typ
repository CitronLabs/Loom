#import "/_utils/html_helpers.typ": *

#let loom_button(label: "Click Me", ..args) = {
  button(class: "loom-button", ..args)[#label]
}
