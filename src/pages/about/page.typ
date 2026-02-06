#import "../../_global/layout.typ": layout
#import "../../components/nav/elem.typ": navbar
#import "../../_utils/html_helpers.typ": *

#show: layout.with(title: "About")

#navbar()

#main()[
  #header()[= About]
  #div()[This is the About Page]
]
