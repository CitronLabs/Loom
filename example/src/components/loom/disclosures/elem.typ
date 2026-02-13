#import "/_utils/html_helpers.typ": div, button

#let accordion_item(id, title, content) = {
  div(class: "accordion-item")[
    #button(class: "accordion-header", attrs: ("data-toggle": id, "aria-expanded": "false"))[#title]
    #div(id: id, class: "accordion-content", hidden: "true")[#content]
  ]
}

#let accordion(items) = {
  div(class: "disclosure-group", attrs: ("data-accordion": "true"))[
    #for item in items { accordion_item(item.id, item.title, item.body) }
  ]
}
