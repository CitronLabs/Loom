#import "/_utils/html_helpers.typ": *

#let navbar(logo) = nav(class: "navbar")[
  #div(class: "brand")[
    #image(logo)
  ]
  #div(class: "links")[
    #a(href: "index.html")[Home]
    #a(href: "about.html")[About]
  ]
]
