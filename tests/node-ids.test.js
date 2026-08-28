import { createCanvas } from "@napi-rs/canvas"
import { DOMImplementation, DOMParser, XMLSerializer } from "@xmldom/xmldom"

import init from "../index.js"

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

function getIdentifiedElements(root) {
  return Array.from(root.getElementsByTagName("*")).filter(el =>
    el.hasAttribute("data-sb-id"),
  )
}

function getNodes(document) {
  const script = document.scripts[0]
  const block = script.blocks[0]
  const nestedBlock = block.children.find(child => child.isBlock)
  const input = nestedBlock.children.find(child => child.isInput)
  const comment = block.comment
  return { script, block, nestedBlock, input, comment }
}

const source = "say (join [hello] [world]) // note"
const styles = [
  "scratch2",
  "scratch3",
  "scratch3-high-contrast",
  "scratch3-outline",
]

test("parsed nodes default to no external ID", () => {
  const scratchblocks = init(makeWindow())
  const document = scratchblocks.parse(source)
  const { script, block, input, comment } = getNodes(document)

  expect(script.id).toBeNull()
  expect(block.id).toBeNull()
  expect(input.id).toBeNull()
  expect(comment.id).toBeNull()
  expect(block.info.id).toBe("LOOKS_SAY")
  expect(block.blockPath).toBe("1.1")
})

test.each(styles)("renders external node IDs in %s", style => {
  const scratchblocks = init(makeWindow())
  const document = scratchblocks.parse(source)
  const { script, block, nestedBlock, input, comment } = getNodes(document)
  const originalSource = document.stringify()

  script.id = "script"
  block.id = "block"
  nestedBlock.id = "nested-block"
  input.id = "input"
  comment.id = "comment"

  const view = scratchblocks.newView(document, { style })
  expect(view.getElementById("script")).toBeNull()

  const svg = view.render()
  const identifiedElements = getIdentifiedElements(svg)

  expect(identifiedElements.map(el => el.getAttribute("data-sb-id"))).toEqual([
    "script",
    "block",
    "nested-block",
    "input",
    "comment",
  ])
  for (const id of ["script", "block", "nested-block", "input", "comment"]) {
    const element = view.getElementById(id)
    expect(element).not.toBeNull()
    expect(element.tagName).toBe("g")
    expect(scratchblocks.getElementById(view, id)).toBe(element)
  }
  expect(view.getElementById("missing")).toBeNull()
  expect(scratchblocks.getElementById(null, "script")).toBeNull()
  expect(view.getElementById("block").getAttribute("data-block-path")).toBe(
    "1.1",
  )
  expect(document.stringify()).toBe(originalSource)
})

test("keeps the first rendered element when external IDs are duplicated", () => {
  const scratchblocks = init(makeWindow())
  const document = scratchblocks.parse(source)
  const { script, block } = getNodes(document)
  script.id = "duplicate"
  block.id = "duplicate"

  const view = scratchblocks.newView(document, { style: "scratch3" })
  const svg = view.render()
  const identifiedElements = getIdentifiedElements(svg)

  expect(identifiedElements).toHaveLength(2)
  expect(view.getElementById("duplicate")).toBe(identifiedElements[0])
})

test("preserves empty and XML-sensitive external IDs", () => {
  const window = makeWindow()
  const scratchblocks = init(window)
  const document = scratchblocks.parse(source)
  const { input, comment } = getNodes(document)
  const specialId = `comment<&"'`
  input.id = ""
  comment.id = specialId

  const view = scratchblocks.newView(document, { style: "scratch3" })
  view.render()

  expect(view.getElementById("").getAttribute("data-sb-id")).toBe("")
  expect(view.getElementById(specialId).getAttribute("data-sb-id")).toBe(
    specialId,
  )

  const reparsed = new window.DOMParser().parseFromString(
    view.exportSVGString(),
    "image/svg+xml",
  )
  expect(
    getIdentifiedElements(reparsed).map(el => el.getAttribute("data-sb-id")),
  ).toEqual(["", specialId])
})
