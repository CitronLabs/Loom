#let element(tag, ..args) = {
  let body = if args.pos().len() > 0 { args.pos().at(0) } else { [] }
  let named = args.named()
  
  // Extract and merge the 'attrs' dictionary if it exists
  let custom_attrs = named.remove("attrs", default: (:))
  
  // Merge the standard named arguments (like id, class) with custom_attrs
  let final_attrs = (:)
  for (key, value) in custom_attrs {
    final_attrs.insert(key, str(value))
  }
  for (key, value) in named {
    final_attrs.insert(key, str(value))
  }

  html.elem(tag, attrs: final_attrs, body)
}

// --- Layout & Sectioning ---
#let div(..args) = element("div", ..args)
#let section(..args) = element("section", ..args)
#let article(..args) = element("article", ..args)
#let header(..args) = element("header", ..args)
#let footer(..args) = element("footer", ..args)
#let main(..args) = element("main", ..args)
#let nav(..args) = element("nav", ..args)
#let aside(..args) = element("aside", ..args)

// --- Typography ---
#let h1(..args) = element("h1", ..args)
#let h2(..args) = element("h2", ..args)
#let h3(..args) = element("h3", ..args)
#let h4(..args) = element("h4", ..args)
#let h5(..args) = element("h5", ..args)
#let h6(..args) = element("h6", ..args)
#let p(..args) = element("p", ..args)
#let span(..args) = element("span", ..args)
#let strong(..args) = element("strong", ..args)
#let em(..args) = element("em", ..args)
#let blockquote(..args) = element("blockquote", ..args)
#let hr(..args) = element("hr", ..args)

// --- Interactive & Media ---
#let button(..args) = element("button", ..args)
#let a(..args) = element("a", ..args)
#let img(..args) = element("img", ..args)
#let video(..args) = element("video", ..args)
#let canvas(..args) = element("canvas", ..args)
#let svg(..args) = element("svg", ..args)

// --- Lists ---
#let ul(..args) = element("ul", ..args)
#let ol(..args) = element("ol", ..args)
#let li(..args) = element("li", ..args)

// --- Forms ---
#let form(..args) = element("form", ..args)
#let input(..args) = element("input", ..args)
#let label(..args) = element("label", ..args)
#let textarea(..args) = element("textarea", ..args)
#let select(..args) = element("select", ..args)
#let option(..args) = element("option", ..args)

// --- Custom Style/Script Tags ---
#let style(..args) = element("style", ..args)
#let script(..args) = element("script", ..args)

// Usage: #element("article", class: "post", id: "main-content")[Content here]
