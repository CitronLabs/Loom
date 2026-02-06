#import "../_utils/html_helpers.typ": *

#let layout(title: "My Site", body) = {
  let global-css = read("styles.css")
  
  html.elem("html", attrs: (lang: "en"))[
    #html.elem("head")[
      #html.elem("meta", attrs: (charset: "utf-8"))
      #html.elem("title")[#title]
      #style()[#global-css]
    ]
    #html.elem("body")[#body]
  ]
}
