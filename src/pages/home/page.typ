#import "../../_global/layout.typ": layout
#import "../../components/nav/elem.typ": navbar
#import "../../components/button/elem.typ": counter_button

// This passes title and js_file to the layout function defined above
#show: layout.with(
  title: "WASM Counter",
  js_file: "index.js" 
)

#navbar()

#counter_button(label: "Increment C Counter")
