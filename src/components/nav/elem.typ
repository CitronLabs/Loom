#import "../../_utils/html_helpers.typ": *

#let navbar() = nav(attrs: (class: "navbar"))[
  #div(attrs: (class: "brand"))[
    #image("../../_assets/Phoebe_Text_Logo.svg")
  ]
  #div(attrs: (class: "links"))[
    #link("index.html")[Home]
    #link("about.html")[About]
  ]
]
