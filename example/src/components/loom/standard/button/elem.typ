#import "/_utils/html_helpers.typ": *

#let standard_button(label: "Click Me", ..args) = {
  // Any extra attributes passed to standard_button are forwarded to the HTML button
  button(class: "standard-button", ..args)[#label]

}
