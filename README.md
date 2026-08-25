Make pictures of Scratch blocks from text.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="/readme-assets/images/dark.png">
  <img alt="Screenshot" src="/readme-assets/images/light.png">
</picture>

**[Try it out!](https://luyifei2011.github.io/scratchblocks-plus/)**

[Documentation](https://luyifei2011.github.io/scratchblocks-plus-docs/)

---

**scratchblocks-plus** is a fork of **scratchblocks**, and adds the following features:

- matrix support
  - [try it out!](https://luyifei2011.github.io/scratchblocks-plus/#?style=scratch3&script=display%20(%7B01010%2C%0A%20%20%20%20%20%20%20%20%20%2010101%2C%0A%20%20%20%20%20%20%20%20%20%2010001%2C%0A%20%20%20%20%20%20%20%20%20%2001010%2C%0A%20%20%20%20%20%20%20%20%20%2000100%7D%20v))
  - issue: [scratchblocks#509](https://github.com/scratchblocks/scratchblocks/issues/509)
  - PR: [scratchblocks#573](https://github.com/scratchblocks/scratchblocks/pull/573)
- block highlight
  - [example 1](https://luyifei2011.github.io/scratchblocks-plus/example/text-highlight.html)
  - [example 2](https://luyifei2011.github.io/scratchblocks-plus/example/speech-highlight.html)
- dropdown menu translate
  - [try it out!](https://luyifei2011.github.io/scratchblocks-plus/translator/#?lang=zh_cn&script=go%20to%20(mouse-pointer%20v))
  - issue: [scratchblocks#324](https://github.com/scratchblocks/scratchblocks/issues/324)
  - PR: [scratchblocks#556](https://github.com/scratchblocks/scratchblocks/pull/556)
- server-side rendering
  - issue: [scratchblocks#402](https://github.com/scratchblocks/scratchblocks/issues/402)
  - PR: [scratchblocks#589](https://github.com/scratchblocks/scratchblocks/pull/589)
- basic TypeScript support
- and more!

### Compatibility with scratchblocks

**scratchblocks-plus** follows the core text syntax and common browser APIs of
**scratchblocks 3.x**, including `parse`, `render`, `renderMatching`, and
`loadLanguages`. Most browser integrations can migrate by changing the package
or script name.

It is not a complete package-level drop-in replacement:

- scratchblocks-plus is ESM-first and does not support CommonJS `require()`;
- the root package entry is browser-only because it uses `window` and the DOM;
- Node.js rendering and syntax-only parsing use dedicated package subpaths;
- internal modules and exact generated SVG markup are not compatibility
  guarantees.

The classic script build still creates `window.scratchblocks`, so existing
browser code that uses the documented scratchblocks API generally remains
compatible.

---

**scratchblocks-plus** is used to write Scratch scripts:

It's MIT licensed, so you can use it in your projects.

For the full guide to the syntax, see [the wiki](https://en.scratch-wiki.info/wiki/Block_Plugin/Syntax).

# Usage

## ESM (recommended)

Install the package from npm:

```sh
npm install scratchblocks-plus
```

The root entry is intended for browser applications and bundlers. It
default-exports the initialized scratchblocks API and automatically adds the
required styles to the page:

```js
import scratchblocks from "scratchblocks-plus"

scratchblocks.renderMatching("pre.blocks", {
  style: "scratch3",
  languages: ["en"],
  // catHats: true,
  // fontFamily: '"Noto Sans SC", sans-serif',
})
```

Set `catHats` to `true` to render all Scratch 3 hat and custom block
definition hats as cat hats. It defaults to `false` and has no visual effect
with the `scratch2` style.

Use `fontFamily` to override the font family for all block labels, input
values, and comments in that render. The value uses CSS `font-family` syntax;
load the font before rendering, for example by waiting for
`document.fonts.ready`. If the option is omitted or empty, each style keeps its
default fonts.

The ESM entry does not create `window.scratchblocks`. Import the default export
wherever it is needed.

To load every bundled locale in an ESM application:

```js
import scratchblocks from "scratchblocks-plus"
import locales from "scratchblocks-plus/locales/all"

scratchblocks.loadLanguages(locales)
```

The all-locales entry is large. Import individual locale JSON files when your
bundler supports JSON modules and you only need a few languages.

### Node.js rendering

Use the dedicated SSR entry instead of the browser root. Install a DOM and
canvas implementation alongside scratchblocks-plus:

```sh
npm install scratchblocks-plus @xmldom/xmldom @napi-rs/canvas
```

```js
import { renderToSVGString } from "scratchblocks-plus/node-ssr"

const svg = renderToSVGString("move (10) steps", {
  style: "scratch3",
  fontFamily: '"Noto Sans SC", sans-serif',
})
```

For custom fonts in Node.js, register the font with the selected Canvas
implementation before rendering so SVG layout measurement uses the same font.

### Syntax-only parsing

Parsing and document analysis do not require a DOM or canvas implementation:

```js
import { parse } from "scratchblocks-plus/syntax"

const document = parse("move (10) steps")
const block = document.scripts[0].blocks[0]

console.log(block.info.id) // "MOTION_MOVESTEPS"
```

TypeScript model names are available as type-only exports from the browser
entry:

```ts
import scratchblocks, {
  type Block,
  type Document,
} from "scratchblocks-plus"

const document: Document = scratchblocks.parse("move (10) steps")
const block: Block = document.scripts[0].blocks[0]
```

<!--
## MediaWiki

Use [the MediaWiki plugin](https://github.com/InternationalScratchWiki/mw-ScratchBlocks4).
(This is what the [Scratch Wiki](https://en.scratch-wiki.info/wiki/Block_Plugin) uses.)

## WordPress

I found [a WordPress plugin](https://github.com/tkc49/scratchblocks-for-wp).
It might work for you; I haven't tried it.

## Pandoc

Code Club use their own [lesson_format](https://github.com/CodeClub/lesson_format) tool to generate the PDF versions of their project guides.
It uses the [pandoc_scratchblocks](https://github.com/CodeClub/pandoc_scratchblocks) plugin they wrote to make pictures of Scratch scripts.

This would probably be a good way to write a Scratch book.
-->

## React

Use the [scratchblocks-plus-react](https://github.com/LuYifei2011/scratchblocks-plus-react) package to render scratchblocks in React.

## Classic HTML script

ESM is recommended for new projects. The classic IIFE build remains available
for pages that use a global `window.scratchblocks` object.

You'll need to include a copy of the scratchblocks-plus JS file on your webpage.
There are a few ways of getting one:

- Download it from the <https://github.com/LuYifei2011/scratchblocks-plus/releases> page
<!--* If you have a fancy JS build system, you might like to include the `scratchblocks-plus` package from NPM-->
- You could clone this repository and build it yourself using Node 16.14.0+ (`npm run build`).

```html
<script src="scratchblocks-plus.min.js"></script>
```

The convention is to write scratchblocks inside `pre` tags with the class `blocks`:

```html
<pre class="blocks">
when flag clicked
move (10) steps
</pre>
```

You then need to call `scratchblocks.renderMatching` after the page has loaded.
Make sure this appears at the end of the page (just before the closing `</body>` tag):

```html
<script>
  scratchblocks.renderMatching("pre.blocks", {
    style: "scratch3", // Optional, defaults to "scratch2".
    languages: ["en", "de"], // Optional, defaults to ["en"].
    scale: 1, // Optional, defaults to 1.
  })
</script>
```

The `renderMatching()` function takes a CSS-style selector for the elements that contain scratchblocks code: we use `pre.blocks` to target `pre` tags with the class `blocks`.

The `style` option controls how the blocks appear. Supported built-in styles are `scratch2`, `scratch3`, `scratch3-high-contrast`, and `scratch3-outline`.

### Inline blocks

You might also want to use blocks "inline", inside a paragraph:

```html
I'm rather fond of the <code class="b">stamp</code> block in Scratch.
```

To allow this, make a second call to `renderMatching` using the `inline` argument.

```html
<script>
  scratchblocks.renderMatching("pre.blocks", ...)

  scratchblocks.renderMatching("code.b", {
    inline: true,
    // Repeat `style` and `languages` options here.
  })
</script>
```

This time we use `code.b` to target `code` blocks with the class `b`.

### Translations

If you want to use languages other than English, you'll need to include a second JS file that contains translations.
The releases page includes two options; you can pick one:

- `translations.js` includes a limited set of languages, as seen on the Scratch Forums
- `translations-all.js` includes every language that Scratch supports.

The translations files are hundreds of kilobytes in size, so to keep your page bundle size down you might like to build your own file with just the languages you need.

For example, a translations file that just loads the German language (ISO code `de`) would look something like this:

```js
scratchblocks.loadLanguages({
    de: <contents of locales/de.json>
})
```

With ESM, import the locale JSON file when your bundler supports JSON modules:

```js
import de from "scratchblocks-plus/locales/de.json"

scratchblocks.loadLanguages({
  de,
})
```

# Languages

To update the translations:

```sh
npm upgrade scratch-l10n
npm run locales
```

## Adding a language

Each language **requires** some [additional words](https://github.com/LuYifei2011/scratchblocks-plus/blob/master/locales-src/extra_aliases.js) which aren't in Scratch itself (mainly the words used for the flag and arrow images).
I'd be happy to accept pull requests for those! You'll need to rebuild the translations with `npm run locales` after editing the aliases.

# Development

This should set you up and start a http-server for development:

```sh
npm install
npm start
```

Then open <http://localhost:8000/> :-)

For more details, see [`CONTRIBUTING.md`](https://github.com/LuYifei2011/scratchblocks-plus/blob/main/.github/CONTRIBUTING.md).

# Credits

Many, many thanks to the [contributors](https://github.com/LuYifei2011/scratchblocks-plus/graphs/contributors)!

- Maintained by [LuYifei2011](https://github.com/LuYifei2011)
- This is a fork of [scratchblocks](https://github.com/scratchblocks/scratchblocks), so all the credit there still applies here.
- Original scratchblocks library by [tjvr](https://github.com/tjvr)
- Original scratchblocks library maintained by tjvr and [apple502j](https://github.com/apple502j)
- Icons derived from [Scratch Blocks](https://github.com/scratchfoundation/scratch-blocks) (Apache License 2.0)
- Scratch 2 SVG proof-of-concept, shapes & filters by [as-com](https://github.com/as-com)
- Anna helped with a formula, and pointed out that tjvr can't read graphs
- JSO designed the syntax and wrote the original [Block Plugin](https://en.scratch-wiki.info/wiki/Block_Plugin_\(1.4\))
- Help with translation code from [joooni](https://scratch.mit.edu/users/joooni/)
- Block translations from the [scratch-l10n repository](https://github.com/scratchfoundation/scratch-l10n/)
- Ported to node by [arve0](https://github.com/arve0)
