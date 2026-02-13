#import "/_utils/html_helpers.typ": *

#let layout(title: "", js_bundle: "", css_files: (), content) = {
  // Wrap everything in a single html element
  html.elem("html", attrs: (lang: "en"))[
    #html.elem("head")[
      #html.elem("title")[#title]
      
      // Bootstrap JS
      #html.elem("script", attrs: (
        src: js_bundle + "_bootstrap.js", 
        type: "module"
      ))[]

      // Dynamic CSS Links
      #for css in css_files {
        html.elem("link", attrs: (rel: "stylesheet", href: css))
      }
    ]
    
    #html.elem("body")[
      #content
    ]
  ]
}
