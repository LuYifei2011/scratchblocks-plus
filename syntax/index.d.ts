import type {
  Block as BlockInstance,
  BlockConstructor,
  Comment as CommentInstance,
  CommentConstructor,
  Document as DocumentInstance,
  DocumentConstructor,
  Glow as GlowInstance,
  GlowConstructor,
  Icon as IconInstance,
  IconConstructor,
  Input as InputInstance,
  InputConstructor,
  Label as LabelInstance,
  LabelConstructor,
  LanguageData,
  Matrix as MatrixInstance,
  MatrixConstructor,
  RegisterBlockOptions,
  RenderOptions,
  Script as ScriptInstance,
  ScriptConstructor,
} from "../index.js"

export type {
  BlockInfo,
  LanguageData,
  RegisterBlockOptions,
  RenderOptions,
} from "../index.js"

export type Label = LabelInstance
export type Icon = IconInstance
export type Input = InputInstance
export type Matrix = MatrixInstance
export type Block = BlockInstance
export type Comment = CommentInstance
export type Glow = GlowInstance
export type Script = ScriptInstance
export type Document = DocumentInstance

export const Label: LabelConstructor
export const Icon: IconConstructor
export const Input: InputConstructor
export const Matrix: MatrixConstructor
export const Block: BlockConstructor
export const Comment: CommentConstructor
export const Glow: GlowConstructor
export const Script: ScriptConstructor
export const Document: DocumentConstructor

export function parse(code: string, options?: RenderOptions): Document
export function registerIconName(name: string): void

export const allLanguages: Record<string, LanguageData>
export function loadLanguages(languages: Record<string, LanguageData>): void
export function blockName(block: Block): string | undefined
export function registerCategoryName(
  name: string,
  icon?: string,
  aliases?: string[],
): void
export function registerBlock(options: RegisterBlockOptions): void
export function registerBlockTranslation(
  lang: string,
  blockId: string,
  spec: string,
  aliases?: string[],
): void

export const movedExtensions: Record<string, string>
export const extensions: Record<string, string>
export const aliasExtensions: Record<string, string>
export const customExtensions: Record<string, { icon?: string }>
