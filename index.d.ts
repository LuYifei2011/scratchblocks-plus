/**
 * A label/text element in a block
 */
export class Label {
  constructor(value: string, cls?: string)
  value: string
  cls: string
  el: SVGElement | null
  height: number
  metrics: { width: number } | null
  x: number
  readonly isLabel: true
  stringify(): string
}

/**
 * An icon in a block (e.g., greenFlag, stopSign)
 */
export class Icon {
  constructor(name: string)
  name: string
  isArrow: boolean
  readonly isIcon: true
  static icons: Record<string, boolean>
  stringify(): string
}

/**
 * Block information object
 */
export interface BlockInfo {
  id?: string
  spec?: string
  parts?: string[]
  selector?: string
  inputs?: string[]
  shape: string
  category: string
  categoryIsDefault?: boolean
  hasLoopArrow?: boolean
  argument?: "boolean" | "number" | "string"
  call?: string
  names?: string[]
  color?: string
  diff?: "+" | "-"
  hash?: string
  isReset?: boolean
  shapeIsDefault?: boolean
  language?: LanguageData
  isRTL?: boolean
}

/**
 * An input element in a block (text input, dropdown, etc.)
 */
export class Input {
  constructor(shape: string, value: string | number | boolean | Matrix | null)
  shape: string
  value: string | number | boolean | Matrix | null
  menu?: string
  label: Label | null
  x: number
  readonly isInput: true
  isRound: boolean
  isBoolean: boolean
  isStack: boolean
  isInset: boolean
  isColor: boolean
  isMatrix: boolean
  hasArrow: boolean
  isDarker: boolean
  isSquare: boolean
  hasLabel: boolean
  setMenu(value: string): void
  stringify(parentPrefix?: string): string
  translate(lang: LanguageData): void
}

/**
 * A matrix element in a block
 */
export class Matrix {
  constructor(rows: boolean[][])
  rows: boolean[][]
  readonly isMatrix: true
  stringify(): string
  translate(lang?: LanguageData): void
}

/**
 * A block definition
 */
export class Block {
  constructor(info: BlockInfo, children: (Label | Icon | Input | Block | Script | Comment | Glow)[], comment?: Comment | null)
  info: BlockInfo
  children: (Label | Icon | Input | Block | Script | Comment | Glow)[]
  comment: Comment | null
  diff: "+" | "-" | null
  blockPath: string | null
  readonly isBlock: true
  isHat: boolean
  hasPuzzle: boolean
  isFinal: boolean
  isCommand: boolean
  isOutline: boolean
  isReporter: boolean
  isBoolean: boolean
  isRing: boolean
  hasScript: boolean
  isElse: boolean
  isEnd: boolean
  stringify(extras?: string): string
  translate(lang: LanguageData): void
}

/**
 * A comment element
 */
export class Comment {
  constructor(value: string, hasBlock?: boolean)
  label: Label
  width: number | null
  hasBlock?: boolean
  readonly isComment: true
  stringify(): string
  translate(): void
}

/**
 * A glow effect (highlight) wrapper for blocks
 */
export class Glow {
  constructor(child: Block | Script)
  child: Block | Script
  shape: string
  info?: BlockInfo
  readonly isGlow: true
  stringify(): string
  translate(lang: LanguageData): void
}

/**
 * A script (sequence of blocks)
 */
export class Script {
  constructor(blocks: Block[])
  blocks: Block[]
  isEmpty: boolean
  isFinal: boolean
  scriptIndex: number | null
  readonly isScript: true
  stringify(): string
  translate(lang: LanguageData): void
}

/**
 * A parsed document containing scripts
 */
export class Document {
  constructor(scripts: Script[])
  scripts: Script[]
  blockMap: Map<string, Block>
  getBlockByPath(path: string): Block | null
  stringify(): string
  translate(lang: LanguageData): void
}

export interface ScriptView {
  blocks: Array<Block | Glow>
  isEmpty: boolean
  isFinal: boolean
  scriptIndex: number | null
  readonly isScript: true
  width: number
  height: number
  y: number
  draw(iconStyle: string, inside?: boolean): SVGElement
  measure(): void
}

/**
 * A view of a rendered document
 */
export interface DocumentView {
  scripts: ScriptView[]
  doc: Document
  width: number | null
  height: number | null
  el: SVGElement | null
  defs: SVGDefsElement | null
  scale: number
  elementMap: Map<string, { el: SVGElement }>
  
  measure(): void
  render(): SVGElement
  highlightBlock(path: string, options?: HighlightOptions): boolean
  clearHighlight(path?: string | null): void
  getElementByPath(path: string): SVGElement | null
  exportSVGString(): string
  exportSVG(): string
  toCanvas(cb: (canvas: HTMLCanvasElement) => void, exportScale?: number): void
  exportPNG(cb: (url: string) => void, scale?: number): void
}

/**
 * Options for rendering
 */
export interface RenderOptions {
  style?:
    | "scratch2"
    | "scratch3"
    | "scratch3-high-contrast"
    | "scratch3-outline"
    | string
  inline?: boolean
  languages?: string[]
  scale?: number
  read?: (el: HTMLElement, options: RenderOptions) => string
  parse?: (code: string, options: RenderOptions) => Document
  render?: (doc: Document, options: RenderOptions) => SVGElement
  replace?: (el: HTMLElement, svg: SVGElement, doc: Document, options: RenderOptions) => void
}

/**
 * Options for highlighting blocks
 */
export interface HighlightOptions {
  blink?: boolean
}

/**
 * Language data object containing dropdowns and block information
 */
export interface LanguageData {
  code?: string
  commands: Record<string, string>
  dropdowns: Record<string, { value: string; parents?: string[] }>
  aliases: Record<string, string>
  renamedBlocks: Record<string, string>
  definePrefix: string[]
  defineSuffix: string[]
  ignorelt: string[]
  math: string[]
  name: string
  faceParts: string[]
  soundEffects: string[]
  microbitWhen: string[]
  osis: string[]
  palette: Record<string, string>
  percentTranslated: number
  categories: Record<string, string>
  blocksByHash?: Record<string, BlockInfo[]>
  nativeAliases?: Record<string, string[]>
  nativeDropdowns?: Record<string, Array<{ id: string; parents?: string[] }>>
}

/**
 * Main scratchblocks API returned by the default export function
 */
export interface ScratchblocksAPI {
  // Languages
  readonly allLanguages: Record<string, LanguageData>
  loadLanguages(languages: Record<string, LanguageData>): void

  // Parsing and rendering
  parse(code: string, options?: RenderOptions): Document
  stringify(doc: Document): string
  newView(doc: Document, options?: RenderOptions): DocumentView
  render(doc: Document, options?: RenderOptions): SVGElement
  renderMatching(selector?: string, options?: RenderOptions): void

  // Reading and replacing
  read(el: HTMLElement, options?: { inline?: boolean }): string
  replace(el: HTMLElement, svg: SVGElement, doc: Document, options?: RenderOptions): void

  // Styles
  appendStyles(): void

  // Classes
  Label: typeof Label
  Icon: typeof Icon
  Input: typeof Input
  Block: typeof Block
  Comment: typeof Comment
  Script: typeof Script
  Document: typeof Document

  // Highlight API
  highlightBlock(view: DocumentView, path: string, options?: HighlightOptions): boolean
  clearHighlight(view: DocumentView, path?: string | null): void
  getBlockByPath(doc: Document, path: string): Block | null
  getElementByPath(view: DocumentView, path: string): SVGElement | null
}

/**
 * Initializes scratchblocks with a window object and returns the scratchblocks API
 * When imported from npm, this is the default export
 */
declare const scratchblocks: ScratchblocksAPI

export default scratchblocks
