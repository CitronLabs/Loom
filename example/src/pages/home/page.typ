#import "/global/layout.typ": layout
#import "/components/loom/hero/elem.typ": hero_visual
#import "/components/loom/button/elem.typ": loom_button
#import "/components/loom/disclosures/elem.typ": accordion
#import "/_utils/html_helpers.typ": div, p, section, h2

#show: layout.with(
  title: "LOOM Framework",
  js_bundle: "index",
  css_files: ("global.css", "home_style.css", "loom_hero.css", "loom_button.css", "loom_disclosures.css")
)

#hero_visual("LOOM")

#section(class: "explanation")[
  #div(class: "container")[
    #h2()["Bare-Metal Web Development"]
    #p()[
      Loom orchestrates WebGPU compute, WASM logic, and Typst design. 
      Click the button below to trigger a C-compiled calculation.
    ]
    
    #loom_button(label: "Execute WASM")

    #h2()["Framework FAQ"]
    #accordion((
      (id: "q1", title: "What is the core tech?", body: "Emscripten for C/C++, Typst for HTML, and native Web APIs."),
      (id: "q2", title: "Is it production ready?", body: "It's built for high-performance niche applications.")
    ))
  ]
]
