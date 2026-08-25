/**
 * Language data for locale files
 */
interface LocaleData {
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
}

/**
 * All available language locales
 */
declare const locales: {
  ab: LocaleData
  af: LocaleData
  am: LocaleData
  an: LocaleData
  ar: LocaleData
  ast: LocaleData
  az: LocaleData
  be: LocaleData
  bg: LocaleData
  bn: LocaleData
  ca: LocaleData
  ckb: LocaleData
  cs: LocaleData
  cy: LocaleData
  da: LocaleData
  de: LocaleData
  el: LocaleData
  eo: LocaleData
  es: LocaleData
  es_419: LocaleData
  et: LocaleData
  eu: LocaleData
  fa: LocaleData
  fi: LocaleData
  fil: LocaleData
  fr: LocaleData
  fy: LocaleData
  ga: LocaleData
  gd: LocaleData
  gl: LocaleData
  ha: LocaleData
  he: LocaleData
  hi: LocaleData
  hr: LocaleData
  ht: LocaleData
  hu: LocaleData
  hy: LocaleData
  id: LocaleData
  is: LocaleData
  it: LocaleData
  ja: LocaleData
  ja_Hira: LocaleData
  ka: LocaleData
  kk: LocaleData
  km: LocaleData
  ko: LocaleData
  ku: LocaleData
  lt: LocaleData
  lv: LocaleData
  mi: LocaleData
  mn: LocaleData
  nb: LocaleData
  nl: LocaleData
  nn: LocaleData
  nso: LocaleData
  oc: LocaleData
  or: LocaleData
  pl: LocaleData
  pt: LocaleData
  pt_br: LocaleData
  qu: LocaleData
  rap: LocaleData
  ro: LocaleData
  ru: LocaleData
  sk: LocaleData
  sl: LocaleData
  sr: LocaleData
  sv: LocaleData
  sw: LocaleData
  th: LocaleData
  tn: LocaleData
  tr: LocaleData
  uk: LocaleData
  uz: LocaleData
  vi: LocaleData
  xh: LocaleData
  zh_cn: LocaleData
  zh_tw: LocaleData
  zu: LocaleData
}

export default locales
