#import "../_utils/html_helpers.typ": *

#let layout(title: "My Site", js_file: none, body) = {
  let global-css = read("styles.css")
  
  html.elem("html", attrs: (lang: "en"))[
    #html.elem("head")[
      #html.elem("meta", attrs: (charset: "utf-8"))
      #html.elem("title")[#title]
      #style()[#global-css]
      
      // If a js_file is provided, inject the script tag
      #if js_file != none {
        html.elem("script", attrs: (src: js_file, type: "module"))[]
      }
    ]
    #html.elem("body")[#body]
  ]
}
