/**
 * Runtime node markers used by the parser and renderer.
 * Non-matching markers are absent at runtime and therefore typed as optional
 * false values.
 */
export interface SyntaxNodeFlags<
  Kind extends
    | "label"
    | "icon"
    | "input"
    | "matrix"
    | "block"
    | "comment"
    | "glow"
    | "script",
> {
  readonly [marker: `is${string}`]: boolean | undefined
  readonly isLabel?: Kind extends "label" ? true : false
  readonly isIcon?: Kind extends "icon" ? true : false
  readonly isInput?: Kind extends "input" ? true : false
  readonly isMatrix?: Kind extends "matrix"
    ? true
    : Kind extends "input"
      ? boolean
      : false
  readonly isBlock?: Kind extends "block" ? true : false
  readonly isComment?: Kind extends "comment" ? true : false
  readonly isGlow?: Kind extends "glow" ? true : false
  readonly isScript?: Kind extends "script" ? true : false
}

/**
 * A label/text element in a block
 */
export interface Label extends SyntaxNodeFlags<"label"> {
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
export interface Icon extends SyntaxNodeFlags<"icon"> {
  name: string
  isArrow: boolean
  readonly isIcon: true
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
export interface Input extends SyntaxNodeFlags<"input"> {
  shape: string
  value: string | number | boolean | Matrix | null | undefined
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
  stringify(parentPrefix?: string): string
  translate(lang: LanguageData): void
}

/**
 * A matrix element in a block
 */
export interface Matrix extends SyntaxNodeFlags<"matrix"> {
  rows: boolean[][]
  readonly isMatrix: true
  stringify(): string
  translate(lang?: LanguageData): void
}

/**
 * A block definition
 */
export interface Block extends SyntaxNodeFlags<"block"> {
  info: BlockInfo
  children: BlockChild[]
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
export interface Comment extends SyntaxNodeFlags<"comment"> {
  label: Label
  width: number | null
  hasBlock?: boolean
  readonly isComment: true
  stringify(): string
}

/**
 * A glow effect (highlight) wrapper for blocks
 */
export interface Glow extends SyntaxNodeFlags<"glow"> {
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
export interface Script extends SyntaxNodeFlags<"script"> {
  blocks: ScriptBlock[]
  isEmpty: boolean
  isFinal: boolean
  scriptIndex: number | null
  readonly isScript: true
  stringify(): string
  translate(lang: LanguageData): void
}

export type BlockChild = Label | Icon | Input | Block | Script | Comment | Glow

export type ScriptBlock = Block | Glow

export type SyntaxNode = BlockChild | Matrix

/**
 * A parsed document containing scripts
 */
export interface Document {
  scripts: Script[]
  blockMap: Map<string, Block>
  getBlockByPath(path: string): Block | null
  stringify(): string
  translate(lang: LanguageData): void
}

export interface ScriptView extends SyntaxNodeFlags<"script"> {
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
  fontFamily?: string
  catHats?: boolean
  read?: (el: HTMLElement, options: RenderOptions) => string
  parse?: (code: string, options: RenderOptions) => Document
  render?: (doc: Document, options: RenderOptions) => SVGElement
  replace?: (
    el: HTMLElement,
    svg: SVGElement,
    doc: Document,
    options: RenderOptions,
  ) => void
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
  renamedBlocks?: Record<string, string>
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
  categories?: Record<string, string>
  blocksByHash?: Record<string, BlockInfo[]>
  nativeAliases?: Record<string, string[]>
  nativeDropdowns?: Record<string, Array<{ id: string; parents?: string[] }>>
}

export interface LabelConstructor {
  new (value: string, cls?: string): Label
}

export interface IconConstructor {
  new (name: string): Icon
  readonly icons: Record<string, boolean>
}

export interface InputConstructor {
  new (shape: string, value?: string | number | boolean | Matrix | null): Input
}

export interface MatrixConstructor {
  new (rows: boolean[][]): Matrix
}

export interface BlockConstructor {
  new (info: BlockInfo, children: BlockChild[], comment?: Comment | null): Block
}

export interface CommentConstructor {
  new (value: string, hasBlock?: boolean): Comment
}

export interface GlowConstructor {
  new (child: Block | Script): Glow
}

export interface ScriptConstructor {
  new (blocks: ScriptBlock[]): Script
}

export interface DocumentConstructor {
  new (scripts: Script[]): Document
}

export interface IconSource {
  type: "svg" | "image"
  data: string
}

export interface IconStyleInfo {
  width: number
  height: number
  dy?: number
  source: IconSource
}

export interface RegisterIconOptions {
  name: string
  inline?: boolean
  scratch2?: IconStyleInfo
  scratch3?: IconStyleInfo
  scratch3HighContrast?: IconStyleInfo
}

export interface Scratch3CategoryStyle {
  primary: string
  secondary: string
  tertiary: string
}

export type CategoryStyles = Record<
  string,
  string | Scratch3CategoryStyle | undefined
> & {
  scratch2?: string
  scratch3?: Scratch3CategoryStyle
  scratch3HighContrast?: Scratch3CategoryStyle
  scratch3Outline?: Scratch3CategoryStyle
}

export interface RegisterCategoryOptions {
  name: string
  icon?: string
  aliases?: string[]
  styles?: CategoryStyles
}

export interface RegisterBlockOptions {
  id: string
  spec?: string
  inputs?: string[]
  shape: string
  category: string
  hasLoopArrow?: boolean
}

/**
 * Main scratchblocks API exposed by the default export
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
  replace(
    el: HTMLElement,
    svg: SVGElement,
    doc: Document,
    options?: RenderOptions,
  ): void

  // Styles
  appendStyles(): void
  updateStyles(): void

  // Classes
  Label: LabelConstructor
  Icon: IconConstructor
  Input: InputConstructor
  Block: BlockConstructor
  Comment: CommentConstructor
  Script: ScriptConstructor
  Document: DocumentConstructor

  // Highlight API
  highlightBlock(
    view: DocumentView,
    path: string,
    options?: HighlightOptions,
  ): boolean
  clearHighlight(view: DocumentView, path?: string | null): void
  getBlockByPath(doc: Document, path: string): Block | null
  getElementByPath(view: DocumentView, path: string): SVGElement | null

  // Custom extensions
  registerIcon(options: RegisterIconOptions): void
  registerCategory(options: RegisterCategoryOptions): void
  registerBlock(options: RegisterBlockOptions): void
  registerBlockTranslation(
    lang: string,
    blockId: string,
    spec: string,
    aliases?: string[],
  ): void
}

/**
 * Browser-ready scratchblocks API
 */
declare const scratchblocks: ScratchblocksAPI

export default scratchblocks
