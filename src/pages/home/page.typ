#import "../../_global/layout.typ": layout
#import "../../components/nav/elem.typ": navbar
#import "../../_utils/html_helpers.typ": *

#show: layout.with(title: "Home")

#navbar()

#main()[
  #header()[= Welcome Home]
  #div()[This is my custom SSG built with Typst.]
]
