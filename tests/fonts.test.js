import { createCanvas } from "@napi-rs/canvas"
import { DOMImplementation, DOMParser, XMLSerializer } from "@xmldom/xmldom"

import init from "../index.js"
import { LabelView as Scratch3LabelView } from "../scratch3/blocks.js"
import { renderToSVGString } from "../node-ssr.js"

function makeWindow() {
  const document = new DOMImplementation().createDocument(
    "http://www.w3.org/2000/svg",
    null,
    null,
  )
  const createElement = document.createElement.bind(document)
  document.createElement = tagName =>
    tagName === "canvas" ? createCanvas(300, 150) : createElement(tagName)

  return {
    document,
    DOMParser,
    XMLSerializer,
  }
}

const source = "say [hello] // note"
const fontFamily = '"Custom Font", monospace'

test.each([
  "scratch2",
  "scratch3",
  "scratch3-high-contrast",
  "scratch3-outline",
])("applies a custom font family to all text in %s", style => {
  const scratchblocks = init(makeWindow())
  const document = scratchblocks.parse(source)
  const svg = scratchblocks.render(document, { style, fontFamily })
  const textElements = Array.from(svg.getElementsByTagName("text"))

  expect(textElements.length).toBeGreaterThanOrEqual(3)
  expect(
    textElements.some(text => /literal/.test(text.getAttribute("class"))),
  ).toBe(true)
  expect(
    textElements.some(text => /comment-label/.test(text.getAttribute("class"))),
  ).toBe(true)
  expect(
    textElements.every(
      text => text.getAttribute("style") === `font-family: ${fontFamily}`,
    ),
  ).toBe(true)
})

test.each([undefined, "", "   "])(
  "keeps the default font when fontFamily is %p",
  customFont => {
    const scratchblocks = init(makeWindow())
    const document = scratchblocks.parse(source)
    const svg = scratchblocks.render(document, {
      style: "scratch3",
      fontFamily: customFont,
    })

    expect(
      Array.from(svg.getElementsByTagName("text")).every(
        text => !text.hasAttribute("style"),
      ),
    ).toBe(true)
  },
)

test("separates text measurement caches by font", () => {
  const scratchblocks = init(makeWindow())
  const document = scratchblocks.parse("say [hello]")
  Scratch3LabelView.metricsCache = {}

  scratchblocks
    .newView(document, { style: "scratch3", fontFamily: "serif" })
    .render()
  scratchblocks
    .newView(document, { style: "scratch3", fontFamily: "monospace" })
    .render()

  const cache = Scratch3LabelView.metricsCache["sb3-"]
  expect(cache).toHaveProperty("500 12pt serif")
  expect(cache).toHaveProperty("500 12pt monospace")
})

test("passes fontFamily through renderMatching", () => {
  const window = makeWindow()
  const scratchblocks = init(window)
  let renderedSVG
  window.document.querySelectorAll = () => [{}]

  scratchblocks.renderMatching("pre.blocks", {
    style: "scratch3",
    fontFamily,
    read: () => source,
    replace: (_el, svg) => {
      renderedSVG = svg
    },
  })

  expect(
    Array.from(renderedSVG.getElementsByTagName("text")).every(
      text => text.getAttribute("style") === `font-family: ${fontFamily}`,
    ),
  ).toBe(true)
})

test("includes the custom font in server-rendered SVG", () => {
  const svg = renderToSVGString(source, {
    style: "scratch3",
    fontFamily,
  })

  expect(svg).toContain("font-family: &quot;Custom Font&quot;, monospace")
})
