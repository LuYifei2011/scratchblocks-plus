import { createCanvas } from "@napi-rs/canvas"
import { DOMImplementation, DOMParser, XMLSerializer } from "@xmldom/xmldom"

import init from "../index.js"
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

const styles = ["scratch3", "scratch3-high-contrast", "scratch3-outline"]

const source = `when flag clicked
move (10) steps

define test
move (10) steps`

const explicitCatSource = `when flag clicked :: cat
move (10) steps

define test :: cat
move (10) steps`

function serialize(window, svg) {
  return new window.XMLSerializer().serializeToString(svg)
}

function renderSource(scratchblocks, sourceCode, options) {
  const document = scratchblocks.parse(sourceCode)
  return scratchblocks.render(document, options)
}

test.each(styles)("renders hat and define blocks as cat hats in %s", style => {
  const window = makeWindow()
  const scratchblocks = init(window)

  const withOption = renderSource(scratchblocks, source, {
    style,
    catHats: true,
  })
  const withOverrides = renderSource(scratchblocks, explicitCatSource, {
    style,
  })

  expect(serialize(window, withOption)).toBe(serialize(window, withOverrides))
})

test("catHats overrides an explicit hat shape", () => {
  const window = makeWindow()
  const scratchblocks = init(window)

  const withOption = renderSource(scratchblocks, "say [hello] :: hat", {
    style: "scratch3",
    catHats: true,
  })
  const cat = renderSource(scratchblocks, "say [hello] :: cat", {
    style: "scratch3",
  })

  expect(serialize(window, withOption)).toBe(serialize(window, cat))
})

test("leaves existing cat hats unchanged", () => {
  const window = makeWindow()
  const scratchblocks = init(window)

  const withoutOption = renderSource(scratchblocks, explicitCatSource, {
    style: "scratch3",
  })
  const withOption = renderSource(scratchblocks, explicitCatSource, {
    style: "scratch3",
    catHats: true,
  })

  expect(serialize(window, withOption)).toBe(serialize(window, withoutOption))
})

test("defaults to regular hats and leaves Scratch 2 unchanged", () => {
  const window = makeWindow()
  const scratchblocks = init(window)

  const defaultScratch3 = renderSource(scratchblocks, source, {
    style: "scratch3",
  })
  const disabledScratch3 = renderSource(scratchblocks, source, {
    style: "scratch3",
    catHats: false,
  })
  const defaultScratch2 = renderSource(scratchblocks, source, {
    style: "scratch2",
  })
  const catScratch2 = renderSource(scratchblocks, source, {
    style: "scratch2",
    catHats: true,
  })

  expect(serialize(window, disabledScratch3)).toBe(
    serialize(window, defaultScratch3),
  )
  expect(serialize(window, catScratch2)).toBe(
    serialize(window, defaultScratch2),
  )
})

test("does not mutate a document while rendering cat hats", () => {
  const window = makeWindow()
  const scratchblocks = init(window)
  const document = scratchblocks.parse(source)
  const originalText = document.stringify()
  const originalShapes = document.scripts.map(script =>
    script.blocks.map(block => block.info.shape),
  )
  const regularBefore = scratchblocks.render(document, { style: "scratch3" })

  scratchblocks.render(document, { style: "scratch3", catHats: true })
  const regularAfter = scratchblocks.render(document, { style: "scratch3" })

  expect(document.stringify()).toBe(originalText)
  expect(
    document.scripts.map(script =>
      script.blocks.map(block => block.info.shape),
    ),
  ).toEqual(originalShapes)
  expect(serialize(window, regularAfter)).toBe(serialize(window, regularBefore))
})

test("passes catHats through renderMatching", () => {
  const window = makeWindow()
  const scratchblocks = init(window)
  let renderedSVG
  window.document.querySelectorAll = () => [{}]

  scratchblocks.renderMatching("pre.blocks", {
    style: "scratch3",
    catHats: true,
    read: () => source,
    replace: (_el, svg) => {
      renderedSVG = svg
    },
  })

  expect(serialize(window, renderedSVG)).toContain('fill="#FFD5E6"')
})

test("renders cat hats through the server-side entry point", () => {
  const svg = renderToSVGString(source, {
    style: "scratch3",
    catHats: true,
  })

  expect(svg).toContain('fill="#FFD5E6"')
})
