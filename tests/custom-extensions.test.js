import { createCanvas } from "@napi-rs/canvas"
import { DOMImplementation, DOMParser, XMLSerializer } from "@xmldom/xmldom"

import init from "../index.js"
import { makeStyleString } from "../scratch3/index.js"

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

test("render and replace apply their default options", () => {
  const scratchblocks = init(makeWindow())
  const document = scratchblocks.parse("move (10) steps")
  const svg = scratchblocks.render(document)
  const target = svg.ownerDocument.createElement("section")

  expect(svg.getAttribute("class")).toBe("scratchblocks-style-scratch2")
  expect(() => scratchblocks.replace(target, svg, document)).not.toThrow()
  expect(target.firstChild.className).toBe("scratchblocks")
})

test("custom image icons keep their registered dimensions", () => {
  const scratchblocks = init(makeWindow())
  scratchblocks.registerIcon({
    name: "testExtensionIcon",
    scratch3: {
      width: 40,
      height: 40,
      source: {
        type: "image",
        data: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E",
      },
    },
  })
  scratchblocks.registerCategory({
    name: "testExtension",
    icon: "testExtensionIcon",
    styles: {
      scratch3: {
        primary: "#0fbd8c",
        secondary: "#0da57a",
        tertiary: "#0b8e69",
      },
    },
  })
  scratchblocks.registerBlock({
    id: "testExtension.command",
    shape: "stack",
    category: "testExtension",
  })
  scratchblocks.registerBlockTranslation(
    "en",
    "testExtension.command",
    "test command",
  )

  const document = scratchblocks.parse("test command")
  const view = scratchblocks.newView(document, { style: "scratch3" })
  const svg = view.render()
  const icon = svg.getElementsByTagName("image").item(0)

  expect(icon.getAttribute("width")).toBe("40px")
  expect(icon.getAttribute("height")).toBe("40px")
})

test("inline image aliases keep the extension icon and inline image distinct", () => {
  const scratchblocks = init(makeWindow())
  scratchblocks.registerIcon({
    name: "testInlineDefaultIcon",
    scratch3: {
      width: 40,
      height: 40,
      source: {
        type: "image",
        data: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E",
      },
    },
  })
  scratchblocks.registerIcon({
    name: "testInlineArgumentIcon",
    inline: true,
    scratch3: {
      width: 20,
      height: 20,
      source: {
        type: "image",
        data: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E",
      },
    },
  })
  scratchblocks.registerCategory({
    name: "testInlineAliasCategory",
    icon: "testInlineDefaultIcon",
    styles: {
      scratch3: {
        primary: "#e6282a",
        secondary: "#c52224",
        tertiary: "#a51c1e",
      },
    },
  })
  scratchblocks.registerBlock({
    id: "testInlineAliasCategory.compare",
    spec: "compare @testInlineArgumentIcon %1",
    inputs: ["%s"],
    shape: "boolean",
    category: "testInlineAliasCategory",
  })
  scratchblocks.registerBlockTranslation(
    "en",
    "testInlineAliasCategory.compare",
    "compare @testInlineArgumentIcon %1",
    ["compare %1"],
  )

  const document = scratchblocks.parse("compare [text]")
  const view = scratchblocks.newView(document, { style: "scratch3" })
  const svg = view.render()
  const hrefs = Array.from(svg.getElementsByTagName("use"), use =>
    use.getAttribute("href"),
  )

  expect(hrefs).toContain("#sb3-testInlineDefaultIcon")
  expect(hrefs).toContain("#sb3-testInlineArgumentIcon")
  expect(document.stringify()).toBe("<compare [text]>")
})

test("inline image aliases preserve repeated icons", () => {
  const scratchblocks = init(makeWindow())
  scratchblocks.registerIcon({
    name: "testRepeatedInlineIcon",
    inline: true,
    scratch3: {
      width: 20,
      height: 20,
      source: {
        type: "image",
        data: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E",
      },
    },
  })
  scratchblocks.registerCategory({
    name: "testRepeatedInlineCategory",
    styles: {
      scratch3: {
        primary: "#e6282a",
        secondary: "#c52224",
        tertiary: "#a51c1e",
      },
    },
  })
  scratchblocks.registerBlock({
    id: "testRepeatedInlineCategory.equal",
    spec: "@testRepeatedInlineIcon %1 = @testRepeatedInlineIcon %2",
    inputs: ["%s", "%s"],
    shape: "boolean",
    category: "testRepeatedInlineCategory",
  })
  scratchblocks.registerBlockTranslation(
    "en",
    "testRepeatedInlineCategory.equal",
    "@testRepeatedInlineIcon %1 = @testRepeatedInlineIcon %2",
    ["regexp %1 = regexp %2"],
  )

  const document = scratchblocks.parse("<regexp [one] = regexp [two]>")
  const view = scratchblocks.newView(document, { style: "scratch3" })
  const svg = view.render()
  const matchingIcons = Array.from(svg.getElementsByTagName("use")).filter(
    use => use.getAttribute("href") === "#sb3-testRepeatedInlineIcon",
  )

  expect(matchingIcons).toHaveLength(2)
  expect(document.stringify()).toBe("<regexp [one] = regexp [two]>")
})

test("custom outline categories use white blocks and outlined boolean inputs", () => {
  const scratchblocks = init(makeWindow())
  scratchblocks.registerCategory({
    name: "testOutlineCategory",
    styles: {
      scratch3Outline: {
        primary: "#fff",
        secondary: "#f5f7fa",
        tertiary: "#123456",
      },
    },
  })

  const css = makeStyleString()
  expect(css).toContain(`
svg.scratchblocks-style-scratch3-outline .sb3-testOutlineCategory {
  fill: #fff;
  stroke: #123456;
}`)
  expect(css).toContain(`
svg.scratchblocks-style-scratch3-outline .sb3-testOutlineCategory-alt {
  fill: #f5f7fa;
}`)
  expect(css).toContain(`
svg.scratchblocks-style-scratch3-outline .sb3-input-boolean.sb3-testOutlineCategory-dark {
  fill: #fff;
  stroke: #123456;
}`)
})
