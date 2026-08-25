import type {
  Block as BlockInstance,
  BlockConstructor,
  Comment as CommentInstance,
  CommentConstructor,
  Document as DocumentInstance,
  DocumentConstructor,
  DocumentView as DocumentViewInstance,
  Icon as IconInstance,
  IconConstructor,
  Input as InputInstance,
  InputConstructor,
  Label as LabelInstance,
  LabelConstructor,
  LanguageData,
  RenderOptions,
  Script as ScriptInstance,
  ScriptConstructor,
} from "./index.js"

export type { LanguageData, RenderOptions } from "./index.js"

export type Label = LabelInstance
export type Icon = IconInstance
export type Input = InputInstance
export type Block = BlockInstance
export type Comment = CommentInstance
export type Script = ScriptInstance
export type Document = DocumentInstance
export type DocumentView = DocumentViewInstance

export const allLanguages: Record<string, LanguageData>
export function loadLanguages(languages: Record<string, LanguageData>): void

export const Label: LabelConstructor
export const Icon: IconConstructor
export const Input: InputConstructor
export const Block: BlockConstructor
export const Comment: CommentConstructor
export const Script: ScriptConstructor
export const Document: DocumentConstructor

export function parse(code: string, options?: RenderOptions): Document
export function newView(doc: Document, options?: RenderOptions): DocumentView
export function render(doc: Document, options?: RenderOptions): SVGElement
export function renderToSVGString(code: string, options?: RenderOptions): string
