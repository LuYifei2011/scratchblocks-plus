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

function serialize(window, svg) {
  return new window.XMLSerializer().serializeToString(svg)
}

function renderSource(source, style, configure) {
  const window = makeWindow()
  const scratchblocks = init(window)
  const document = scratchblocks.parse(source)
  configure?.(document)
  const view = scratchblocks.newView(document, { style })
  const svg = view.render()
  return { window, scratchblocks, document, view, svg }
}

function isEffectivelyHidden(element) {
  for (let node = element; node; node = node.parentNode) {
    if (node.getAttribute?.("visibility") === "hidden") {
      return true
    }
  }
  return false
}

function elementsWithClass(root, className) {
  return Array.from(root.getElementsByTagName("*")).filter(element =>
    (element.getAttribute("class") || "").split(/\s+/).includes(className),
  )
}

const styles = [
  "scratch2",
  "scratch3",
  "scratch3-high-contrast",
  "scratch3-outline",
]

test.each(styles)(
  "hidden defaults preserve the rendered output in %s",
  style => {
    const source = "move (10) steps"
    const baseline = renderSource(source, style)
    const explicitlyVisible = renderSource(source, style, document => {
      document.getBlockByPath("1.1").hidden = false
    })

    expect(serialize(explicitlyVisible.window, explicitlyVisible.svg)).toBe(
      serialize(baseline.window, baseline.svg),
    )
  },
)

test.each(styles)(
  "hidden stack blocks preserve layout, comments, and deletion marks in %s",
  style => {
    const source = `move (10) steps
- say [secret] // note
turn cw (15) degrees`
    const baseline = renderSource(source, style, document => {
      document.getBlockByPath("1.2").id = "secret"
      document.getBlockByPath("1.2").comment.id = "secret-comment"
    })
    const hidden = renderSource(source, style, document => {
      const block = document.getBlockByPath("1.2")
      block.id = "secret"
      block.comment.id = "secret-comment"
      block.hidden = true
    })

    expect([hidden.view.width, hidden.view.height]).toEqual([
      baseline.view.width,
      baseline.view.height,
    ])
    expect(
      hidden.view.getElementByPath("1.3").parentNode.getAttribute("transform"),
    ).toBe(
      baseline.view
        .getElementByPath("1.3")
        .parentNode.getAttribute("transform"),
    )

    const blockElement = hidden.view.getElementById("secret")
    const commentElement = hidden.view.getElementById("secret-comment")
    const deletionClass = style === "scratch2" ? "sb-diff-del" : "sb3-diff-del"
    const deletionLine = elementsWithClass(hidden.svg, deletionClass)[0]

    expect(blockElement.getAttribute("visibility")).toBe("hidden")
    expect(blockElement.getAttribute("aria-hidden")).toBe("true")
    expect(isEffectivelyHidden(commentElement)).toBe(true)
    expect(isEffectivelyHidden(deletionLine)).toBe(true)
  },
)

test.each(styles)(
  "hidden nested and C blocks preserve parent and script layout in %s",
  style => {
    const reporterSource = "say (join [visible] [secret])"
    const reporterBaseline = renderSource(reporterSource, style)
    const reporterHidden = renderSource(reporterSource, style, document => {
      document.getBlockByPath("1.1.1").hidden = true
    })

    expect([reporterHidden.view.width, reporterHidden.view.height]).toEqual([
      reporterBaseline.view.width,
      reporterBaseline.view.height,
    ])
    expect(
      reporterHidden.view.getElementByPath("1.1").getAttribute("visibility"),
    ).toBeFalsy()
    expect(
      reporterHidden.view.getElementByPath("1.1.1").getAttribute("visibility"),
    ).toBe("hidden")

    const cBlockSource = `repeat (10)
  move (10) steps
end
say [after]`
    const cBlockBaseline = renderSource(cBlockSource, style)
    const cBlockHidden = renderSource(cBlockSource, style, document => {
      document.getBlockByPath("1.1").hidden = true
    })

    expect([cBlockHidden.view.width, cBlockHidden.view.height]).toEqual([
      cBlockBaseline.view.width,
      cBlockBaseline.view.height,
    ])
    expect(
      cBlockHidden.view
        .getElementByPath("1.2")
        .parentNode.getAttribute("transform"),
    ).toBe(
      cBlockBaseline.view
        .getElementByPath("1.2")
        .parentNode.getAttribute("transform"),
    )
    expect(
      isEffectivelyHidden(cBlockHidden.view.getElementByPath("1.1.1.1")),
    ).toBe(true)
  },
)

test.each(styles)(
  "Glow visibility follows all hidden blocks without hiding visible siblings in %s",
  style => {
    const insertionClass = style === "scratch2" ? "sb-diff-ins" : "sb3-diff-ins"

    const singleHidden = renderSource("+ move (10) steps", style, document => {
      document.getBlockByPath("1.1.1").hidden = true
    })
    const singleGlow = elementsWithClass(singleHidden.svg, insertionClass)[0]
    expect(isEffectivelyHidden(singleGlow)).toBe(true)

    const source = `+ move (10) steps
+ turn cw (15) degrees`

    const partiallyHidden = renderSource(source, style, document => {
      document.getBlockByPath("1.1.1").hidden = true
    })
    const partialGlow = elementsWithClass(
      partiallyHidden.svg,
      insertionClass,
    )[0]

    expect(
      isEffectivelyHidden(partiallyHidden.view.getElementByPath("1.1.1")),
    ).toBe(true)
    expect(
      isEffectivelyHidden(partiallyHidden.view.getElementByPath("1.1.2")),
    ).toBe(false)
    expect(isEffectivelyHidden(partialGlow)).toBe(false)

    const allHidden = renderSource(source, style, document => {
      document.getBlockByPath("1.1.1").hidden = true
      document.getBlockByPath("1.1.2").hidden = true
    })
    const hiddenGlow = elementsWithClass(allHidden.svg, insertionClass)[0]

    expect(isEffectivelyHidden(hiddenGlow)).toBe(true)
  },
)

test.each(styles)(
  "hidden blocks remain queryable and cannot be revealed by highlighting in %s",
  style => {
    const { scratchblocks, view } = renderSource(
      "say [secret]",
      style,
      document => {
        const block = document.getBlockByPath("1.1")
        block.id = "secret"
        block.hidden = true
      },
    )

    const element = view.getElementByPath("1.1")
    expect(element).toBe(view.getElementById("secret"))
    expect(scratchblocks.getElementByPath(view, "1.1")).toBe(element)
    expect(scratchblocks.getElementById(view, "secret")).toBe(element)
    expect(scratchblocks.highlightBlock(view, "1.1")).toBe(true)
    expect(element.getAttribute("visibility")).toBe("hidden")
  },
)

test("hidden is application-only and is not serialized into scratchblocks text", () => {
  const scratchblocks = init(makeWindow())
  const source = "move (10) steps"
  const document = scratchblocks.parse(source)
  const block = document.getBlockByPath("1.1")

  expect(block.hidden).toBeUndefined()
  block.hidden = true
  expect(document.stringify()).toBe(source)
  expect(
    scratchblocks.parse(document.stringify()).getBlockByPath("1.1").hidden,
  ).toBeUndefined()

  const textOverride = scratchblocks.parse("move (10) steps :: hidden")
  expect(textOverride.getBlockByPath("1.1").hidden).toBeUndefined()
})
