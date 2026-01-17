import { parse, loadLanguages, allLanguages } from "../syntax"

import de from "../locales/de.json" with { type: "json" }
import ja from "../locales/ja.json" with { type: "json" }
import ko from "../locales/ko.json" with { type: "json" }
import pt_br from "../locales/pt-br.json" with { type: "json" }
import rap from "../locales/rap.json" with { type: "json" }
import uz from "../locales/uz.json" with { type: "json" }
import zh_cn from "../locales/zh-cn.json" with { type: "json" }

loadLanguages({
  de,
  ja,
  ko,
  pt_br,
  rap,
  uz,
  zh_cn,
})
const optionsFor = code => ({
  languages: ["en", code],
})

function getScript(doc) {
  expect(doc.scripts.length).toBe(1)
  return doc.scripts[0]
}

function parseScript(code, options) {
  return getScript(parse(code, options))
}

function parseBlock(code, options) {
  const script = getScript(parse(code, options))
  expect(script.blocks.length).toBe(1)
  return script.blocks[0]
}

/* * */

describe("blocks with symbols", () => {
  const flag = {
    shape: "hat",
    category: "events",
    selector: "whenGreenFlag",
  }

  test("when flag clicked", () => {
    expect(parseBlock("when @greenFlag clicked").info).toMatchObject(flag)
    expect(parseBlock("when green flag clicked").info).toMatchObject(flag)
    expect(parseBlock("when flag clicked").info).toMatchObject(flag)
    expect(parseBlock("when gf clicked").info).toMatchObject(flag)
  })

  test("when flag clicked: de", () => {
    expect(
      parseBlock("Wenn die grüne Flagge angeklickt", optionsFor("de")).info,
    ).toMatchObject(flag)
    expect(
      parseBlock("Wenn ⚑ angeklickt wird", optionsFor("de")).info,
    ).toMatchObject(flag)
    expect(
      parseBlock("Wenn @greenFlag angeklickt wird", optionsFor("de")).info,
    ).toMatchObject(flag)
  })

  test("when flag clicked: ja", () => {
    expect(parseBlock("⚑ が押されたとき", optionsFor("ja")).info).toMatchObject(
      flag,
    )
  })

  const turnLeft = {
    selector: "turnLeft:",
    shape: "stack",
    category: "motion",
  }

  test("turn left", () => {
    expect(parseBlock("turn ccw (15) degrees").info).toMatchObject(turnLeft)
    expect(parseBlock("turn left (15) degrees").info).toMatchObject(turnLeft)
    expect(parseBlock("turn @turnLeft (15) degrees").info).toMatchObject(
      turnLeft,
    )
  })

  test("turn left: de", () => {
    expect(
      parseBlock("drehe dich nach links um (15) Grad", optionsFor("de")).info,
    ).toMatchObject(turnLeft)
    expect(
      parseBlock("drehe dich ↺ um (15) Grad", optionsFor("de")).info,
    ).toMatchObject(turnLeft)
    expect(
      parseBlock("drehe dich @turnLeft um (15) Grad", optionsFor("de")).info,
    ).toMatchObject(turnLeft)
  })

  const turnRight = {
    selector: "turnRight:",
    shape: "stack",
    category: "motion",
  }

  test("turn right", () => {
    expect(parseBlock("turn cw (15) degrees").info).toMatchObject(turnRight)
    expect(parseBlock("turn right (15) degrees").info).toMatchObject(turnRight)
    expect(parseBlock("turn @turnRight (15) degrees").info).toMatchObject(
      turnRight,
    )
  })

  test("turn right: de", () => {
    expect(
      parseBlock("drehe dich nach rechts um (15) Grad", optionsFor("de")).info,
    ).toMatchObject(turnRight)
    expect(
      parseBlock("drehe dich ↻ um (15) Grad", optionsFor("de")).info,
    ).toMatchObject(turnRight)
    expect(
      parseBlock("drehe dich @turnRight um (15) Grad", optionsFor("de")).info,
    ).toMatchObject(turnRight)
  })
})

describe("literals", () => {
  test("can be parsed", () => {
    const b = parseBlock("say [Hello!] for (2) secs")
    expect(b.children[1].isInput).toBe(true)
    expect(b.children[3].isInput).toBe(true)
  })

  // test('numbers can be scientific', () => {
  //   testBlock('change [foo v] by (2e-50)', ['changeVar:by:', 'foo', 2e-50])
  // })

  test("variables are not numbers", () => {
    const b = parseBlock("say [Hello!] for (foo) secs")
    expect(b.children[3].info).toMatchObject({
      category: "variables",
    })
  })

  test("strings can be backslash-escaped", () => {
    const b = parseBlock("say [hello \\] world]")
    expect(b.children[1].isInput).toBe(true)
    expect(b.children[1].value).toBe("hello ] world")
  })

  test("labels can contain backslashes", () => {
    const code = "foo \\]"
    expect(parseBlock(code).stringify()).toBe(code)
    // var code = 'foo ]' // TODO don't escape lone slashes
    // expect(parseBlock(code).stringify()).toBe(code)
  })
})

describe("escaping and stringifying", () => {
  test("closing bracket", () => {
    const code = String.raw`say [\]]`
    expect(parseBlock(code).stringify()).toBe(code)
  })

  test("backslash", () => {
    const code = String.raw`say [\\]`
    expect(parseBlock(code).stringify()).toBe(code)
  })

  test("dropdown v should be escaped", () => {
    const code = String.raw`say [ \v]`
    expect(parseBlock(code).stringify()).toBe(code)
  })

  test("non-dropdown v should not be escaped", () => {
    const code = String.raw`say [v]`
    expect(parseBlock(code).stringify()).toBe(code)
  })

  test("backslash and v", () => {
    const code = String.raw`say [ \\v]`
    expect(parseBlock(code).stringify()).toBe(code)
  })

  test("multiple escapes", () => {
    const code = String.raw`say [\\\] \v]`
    expect(parseBlock(code).stringify()).toBe(code)
  })

  test("unnecessary escapes should be removed", () => {
    const input = String.raw`say [\[\)\v]`
    const expected = String.raw`say [[)v]`
    expect(parseBlock(input).stringify()).toBe(expected)
  })

  test("#576: colon escaping", () => {
    const code = String.raw`test :\: test`
    expect(parseBlock(code).stringify()).toBe(code)
  })

  test("#576: colon escaping 2", () => {
    const code = String.raw`test :\:\: test`
    expect(parseBlock(code).stringify()).toBe(code)
  })

  test("#576: backslash shoud not be escaped outside string input", () => {
    const code = String.raw`test \\ test`
    expect(parseBlock(code).stringify()).toBe(code)
  })
})

describe("overrides", () => {
  test("#570: stringifying with shape override", () => {
    const code = "forever :: stack"
    expect(parseBlock(code).stringify()).toEqual(code)
  })

  test("parentheses in number-dropdown", () => {
    const code = String.raw`say (\(\) v)`
    expect(parseBlock(code).stringify()).toBe(code)
  })

  test("brackets in number-dropdown", () => {
    const code = String.raw`say (\[] v)`
    expect(parseBlock(code).stringify()).toBe(code)
  })

  test("boolean in number-dropdown", () => {
    const code = String.raw`say (\<> v)`
    expect(parseBlock(code).stringify()).toBe(code)
  })

  test("parentheses in dropdown", () => {
    const code = String.raw`say [() v]`
    expect(parseBlock(code).stringify()).toBe(code)
  })

  test("brackets in dropdown", () => {
    const code = String.raw`say [[\] v]`
    expect(parseBlock(code).stringify()).toBe(code)
  })
})

describe("color literals", () => {
  test("work", () => {
    const b = parseBlock("<touching color [#f0f] ?>")
    expect(b.children[2].shape).toBe("color")
    expect(b.children[2].value).toBe("#f0f")
  })

  test("can be round", () => {
    const b = parseBlock("<touching color (#f0f) ?>")
    expect(b.children[2].shape).toBe("color")
    expect(b.children[2].value).toBe("#f0f")
  })
})

describe("recognise lists", () => {
  const variable = {
    category: "variables",
    selector: "readVariable",
  }

  test("not a list", () => {
    const b = parseBlock("say (list)")
    expect(b.children[1].info).toMatchObject(variable)
  })

  const list = {
    category: "list",
    selector: "contentsOfList:",
  }

  test("from add command", () => {
    const s = parseScript("say (list)\nadd [x] to [list v]")
    const b = s.blocks[0]
    expect(b.children[1].info).toMatchObject(list)
  })

  test("from insert command", () => {
    const s = parseScript("say (list)\ninsert [x] at (99 v) of [list v]")
    const b = s.blocks[0]
    expect(b.children[1].info).toMatchObject(list)
  })

  test("from show command", () => {
    const s = parseScript("say (list)\nshow list [list v]")
    const b = s.blocks[0]
    expect(b.children[1].info).toMatchObject(list)
  })
})

describe("disambiguation", () => {
  const stringLength = {
    category: "operators",
    selector: "stringLength:",
  }

  test("green: length of string", () => {
    expect(parseBlock("(length of [world])").info).toMatchObject(stringLength)
    expect(parseBlock("(length of (foo))").info).toMatchObject(stringLength)
  })

  const lineCount = {
    category: "list",
    selector: "lineCountOfList:",
  }

  test("orange: length of list", () => {
    expect(parseBlock("(length of [list v])").info).toMatchObject(lineCount)
  })

  const mathFunc = {
    category: "operators",
    selector: "computeFunction:of:",
  }

  test("green: math op", () => {
    expect(parseBlock("([sqrt v] of (9))").info).toMatchObject(mathFunc)
    expect(parseBlock("([sqrt v] of (foo))").info).toMatchObject(mathFunc)
    expect(parseBlock("([e ^ v] of (20))").info).toMatchObject(mathFunc)
  })

  const attributeOf = {
    category: "sensing",
    selector: "getAttribute:of:",
  }

  test("blue: attribute of", () => {
    expect(parseBlock("([x position v] of [Sprite1 v])").info).toMatchObject(
      attributeOf,
    )
    expect(parseBlock("([x position v] of (foo))").info).toMatchObject(
      attributeOf,
    )
    // invalid --not a math function
    expect(parseBlock("([e^ v] of (9)").info).toMatchObject(attributeOf)
  })

  const setGraphicEffect = {
    category: "looks",
    id: "LOOKS_SETEFFECTTO",
  }

  const changeGraphicEffect = {
    category: "looks",
    id: "LOOKS_CHANGEEFFECTBY",
  }

  test("looks: graphic effects", () => {
    expect(parseBlock("set [ghost v] effect to (100)").info).toMatchObject(
      setGraphicEffect,
    )
    expect(parseBlock("change [ghost v] effect by (5)").info).toMatchObject(
      changeGraphicEffect,
    )
  })

  test("looks: graphic effects: de", () => {
    expect(
      parseBlock("setze Effekt [Farbe v] auf (100)", optionsFor("de")).info,
    ).toMatchObject(setGraphicEffect)
  })

  const setSoundEffect = {
    category: "sound",
    id: "SOUND_SETEFFECTO",
  }
  const changeSoundEffect = {
    category: "sound",
    id: "SOUND_CHANGEEFFECTBY",
  }

  test("sound: sound effects", () => {
    expect(parseBlock("set [pitch v] effect to (100)").info).toMatchObject(
      setSoundEffect,
    )
    expect(
      parseBlock("set [pan left/right v] effect to (100)").info,
    ).toMatchObject(setSoundEffect)
    expect(parseBlock("change [pitch v] effect by (5)").info).toMatchObject(
      changeSoundEffect,
    )
  })

  test("sound: sound effects: de", () => {
    expect(
      parseBlock("setze Effekt [Höhe v] auf (100)", optionsFor("de")).info,
    ).toMatchObject(setSoundEffect)
    expect(
      parseBlock("setze Effekt [Hohe v] auf (100)", optionsFor("de")).info,
    ).toMatchObject(setSoundEffect)
  })

  const listContains = {
    category: "list",
    selector: "list:contains:",
  }

  test("red: list contains", () => {
    expect(parseBlock("<[list v] contains [f] ?>").info).toMatchObject(
      listContains,
    )
  })

  const stringContains = {
    category: "operators",
    id: "OPERATORS_CONTAINS",
  }

  test("green: string contains", () => {
    expect(parseBlock("<[foo] contains [f] ?>").info).toMatchObject(
      stringContains,
    )
    expect(parseBlock("<(foo) contains [f] ?>").info).toMatchObject(
      stringContains,
    )
  })

  // TODO test all disambiguations for other languages

  const stopCap = {
    shape: "cap",
    selector: "stopScripts",
    category: "control",
  }

  test("stop block cap", () => {
    expect(parseBlock("stop [all v]").info).toMatchObject(stopCap)
  })

  test("stop block cap: de", () => {
    expect(parseBlock("stoppe [alles v]", optionsFor("de")).info).toMatchObject(
      stopCap,
    )
  })

  test("stop block cap: ja", () => {
    expect(
      parseBlock("[すべてを止める v]", optionsFor("ja")).info,
    ).toMatchObject(stopCap)
  })

  const stopStack = {
    shape: "stack",
    selector: "stopScripts",
  }

  test("stop block stack", () => {
    expect(parseBlock("stop [other scripts in sprite v]").info).toMatchObject(
      stopStack,
    )
  })

  test("stop block stack: de", () => {
    expect(
      parseBlock("stoppe [andere Skripte der Figur v]", optionsFor("de")).info,
    ).toMatchObject(stopStack)
  })

  test("stop block stack: ja", () => {
    expect(
      parseBlock("[スプライトの他のスクリプトを止める v]", optionsFor("ja"))
        .info,
    ).toMatchObject(stopStack)
  })

  const looksSay = {
    shape: "stack",
    id: "LOOKS_SAY",
  }

  test("looks say", () => {
    expect(parseBlock("say [hello]").info).toMatchObject(looksSay)
  })

  test("looks say: de", () => {
    expect(parseBlock("sage [Hallo]", optionsFor("de")).info).toMatchObject(
      looksSay,
    )
  })

  test("looks say: ja", () => {
    expect(parseBlock("[Hello] と言う", optionsFor("ja")).info).toMatchObject(
      looksSay,
    )
  })

  const microbitWhen = {
    shape: "hat",
    id: "microbit.whenGesture",
  }

  test("microbit when", () => {
    expect(parseBlock("when [moved v]").info).toMatchObject(microbitWhen)
  })

  test("microbit when: de", () => {
    expect(parseBlock("Wenn [bewegt v]", optionsFor("de")).info).toMatchObject(
      microbitWhen,
    )
  })

  test("microbit when: ja", () => {
    expect(parseBlock("[動いた v]とき", optionsFor("ja")).info).toMatchObject(
      microbitWhen,
    )
  })

  const simpleRemapping = new Map([
    [
      {
        en: "when tilted [any v]",
        de: "Wenn [biliebig v] geneigt",
        ja: "[どれかの向き v]に傾いたとき",
      },
      {
        shape: "hat",
        id: "microbit.whenTilted",
      },
    ],
    [
      {
        en: "tilted [any v]?",
        de: "[biliebig v] geneigt?",
        ja: "[どれかの向き v]に傾いた",
      },
      {
        shape: "boolean",
        id: "microbit.isTilted",
      },
    ],
    [
      {
        en: "tilt angle [front v]",
        de: "Neigungswinkel [nach vorne v]",
        ja: "[前 v]方向の傾き",
      },
      {
        shape: "reporter",
        id: "microbit.tiltAngle",
      },
    ],
    [
      {
        en: "when [any v] key pressed",
        de: "Wenn Taste [biliebiges v] gedrückt wird",
        ja: "[どれかの v]キーが押されたとき",
      },
      {
        shape: "hat",
        id: "EVENT_WHENKEYPRESSED",
      },
    ],
    [
      {
        en: "motor [A v] position",
        de: "Position von Motor [A v]",
        ja: "モーター[A v]の位置",
      },
      {
        shape: "reporter",
        id: "ev3.getMotorPosition",
      },
    ],
    [
      {
        en: "distance",
        de: "Abstand",
        ja: "距離",
      },
      {
        shape: "reporter",
        id: "ev3.getDistance",
      },
    ],
    [
      {
        en: "set light color to (0)",
        de: "setze Lichtfarbe auf (0)",
        ja: "ライトの色を (0) にする",
      },
      {
        shape: "stack",
        id: "wedo2.setLightHue",
      },
    ],
    [
      {
        en: "button [1 v] pressed?",
        de: "Knopf [1 v] gedrückt?",
        ja: "ボタン [1 v]が押された",
      },
      {
        shape: "boolean",
        id: "ev3.buttonPressed",
      },
    ],
    [
      {
        en: "[A v] button pressed?",
        de: "Knopf [A v] gedrückt?",
        ja: "ボタン [A v]が押された",
      },
      {
        shape: "boolean",
        id: "microbit.isButtonPressed",
      },
    ],
  ])

  simpleRemapping.forEach((result, messages) => {
    test(result.id, () => {
      expect(parseBlock(messages.en).info).toMatchObject(result)
    })
    test(result.id + ": de", () => {
      expect(parseBlock(messages.de, optionsFor("de")).info).toMatchObject(
        result,
      )
    })
    test(result.id + ": ja", () => {
      expect(parseBlock(messages.ja, optionsFor("ja")).info).toMatchObject(
        result,
      )
    })
  })
})

describe("standalone blocks", () => {
  test("reporters may stand alone", () => {
    expect(parseBlock("(variable)").info.shape).toBe("reporter")
    expect(parseBlock("<loud?>").info.shape).toBe("boolean")
  })

  test("standalone inputs get put in stack block", () => {
    expect(parseBlock("[cheesecake]").info.shape).toBe("stack")
    expect(parseBlock("(3.12)").info.shape).toBe("stack")
    expect(parseBlock("(menu v)").info.shape).toBe("stack")
    expect(parseBlock("[dropdown v]").info.shape).toBe("stack")
  })

  test("stack blocks always stand alone", () => {
    expect(parseBlock("stamp").info.shape).toBe("stack")
    expect(parseBlock("say [hi]").info.shape).toBe("stack")
    expect(parseBlock("[thing] (123) (variable)").info.shape).toBe("stack")
    // expect(parseBlock('[attribute v] of [Stage v]').info.shape).toBe('stack') // oops v3 changed this
  })
})

describe("c blocks", () => {
  const ifBlock = {
    selector: "doIf",
  }

  test("if else", () => {
    // We used to give these different IDs for toJSON(); we no longer need to.
    expect(parseBlock("if <> then \n  \nend").info).toMatchObject(ifBlock)
    expect(parseBlock("if <> then \n  \nelse\nend").info).toMatchObject(ifBlock)
  })

  test("standalone else", () => {
    expect(parseBlock("else").info.shape).toBe("stack")
    expect(parseBlock("end").info.shape).toBe("stack")
  })

  test("#567: comments", () => {
    const script = "if <> then // comment\nend"
    expect(parseScript(script).stringify()).toEqual(script)
  })

  test("#567: comments cannot be attached to end", () => {
    const script = "if <> then\nend // comment"
    expect(parseScript(script).stringify()).toEqual("if <> then\nend")
  })

  test("#567: comments cannot be attached to else", () => {
    const script = "if <> then\nelse //comment\nend"
    expect(parseScript(script).stringify()).toEqual("if <> then\n\nelse\nend")
  })
})

describe("comparison ops: < and > ", () => {
  test("ahahahaha", () => {
    expect(parseBlock("<[10]<(foo)>").info.selector).toBe("<")
    expect(parseBlock("<[10]<[11]>").info.selector).toBe("<")
    expect(parseBlock("<(foo)<(foo)>").info.selector).toBe("<")
    expect(parseBlock("<(foo)<[11]>").info.selector).toBe("<")
    expect(parseBlock("<[10]>(foo)>").info.selector).toBe(">")
    expect(parseBlock("<[10]>[11]>").info.selector).toBe(">")
    expect(parseBlock("<(foo)>(foo)>").info.selector).toBe(">")
    expect(parseBlock("<(foo)>[11]>").info.selector).toBe(">")
    expect(parseBlock("<<><<>>").info.selector).toBe("<")
    expect(parseBlock("<<>><>>").info.selector).toBe(">")
  })

  test("regression for #399", () => {
    expect(parseBlock("join (1) <(1)=(1)>").children.length).toBe(3)
    expect(
      parseBlock("go [forward v] <(1) = (1)> layers").children.length,
    ).toBe(4)
  })
})

// Test that blocks renamed between Scratch 2 and Scratch 3 work in either form.
describe("renamed blocks", () => {
  const say = {
    selector: "say:duration:elapsed:from:",
  }

  test("say for secs", () => {
    expect(parseBlock("say [Hello!] for (2) secs").info).toMatchObject(say)
    expect(parseBlock("say [Hello!] for (2) seconds").info).toMatchObject(say)
  })

  const think = {
    selector: "think:duration:elapsed:from:",
  }

  test("think for secs", () => {
    expect(parseBlock("think [Hmm...] for (2) secs").info).toMatchObject(think)
    expect(parseBlock("think [Hmm...] for (2) seconds").info).toMatchObject(
      think,
    )
  })

  const playSound = {
    selector: "playSound:",
  }

  test("play sound", () => {
    expect(parseBlock("play sound [moo v]").info).toMatchObject(playSound)
    expect(parseBlock("start sound [moo v]").info).toMatchObject(playSound)
  })

  const eraseAll = {
    selector: "clearPenTrails",
  }

  test("clear", () => {
    expect(parseBlock("clear").info).toMatchObject(eraseAll)
    expect(parseBlock("erase all").info).toMatchObject(eraseAll)
  })

  const wait = {
    selector: "wait:elapsed:from:",
  }

  test("wait secs", () => {
    expect(parseBlock("wait (1) secs").info).toMatchObject(wait)
    expect(parseBlock("wait (1) seconds").info).toMatchObject(wait)
  })

  const setTempo = {
    selector: "setTempoTo:",
  }

  test("set tempo", () => {
    expect(parseBlock("set tempo to (120) bpm").info).toMatchObject(setTempo)
    expect(parseBlock("set tempo to (120)").info).toMatchObject(setTempo)
  })
})

describe("translate", () => {
  test("reorders arguments: en -> de", () => {
    const b = parseBlock("go [backward v] (1) layers")
    b.translate(allLanguages.de)
    expect(b.stringify()).toEqual("gehe (1) Ebenen [nach hinten v]")
  })

  test("reorders arguments: de -> en", () => {
    const b = parseBlock("gehe (1) Ebenen [nach hinten v]", optionsFor("de"))
    b.translate(allLanguages.en)
    expect(b.stringify()).toEqual("go [backward v] (1) layers")
  })

  test("turn left: en -> de", () => {
    const b = parseBlock("turn cw (45) degrees")
    b.translate(allLanguages.de)
    expect(b.stringify()).toEqual("drehe dich nach rechts um (45) Grad")
  })

  test("turn left: de -> en", () => {
    const b = parseBlock(
      "drehe dich nach rechts um (45) Grad",
      optionsFor("de"),
    )
    b.translate(allLanguages.en)
    expect(b.stringify()).toEqual("turn cw (45) degrees")
  })

  test("c blocks", () => {
    const b = parseBlock("forever\nmove (10) steps\nend")
    b.translate(allLanguages.de)
    expect(b.stringify()).toEqual(
      "wiederhole fortlaufend\n  gehe (10) er Schritt\nEnde",
    )
  })

  test("if else: en -> de", () => {
    const b = parseBlock("if <> then\n  stamp\nelse\n  clear\nend")
    b.translate(allLanguages.de)
    expect(b.stringify()).toEqual(
      "falls <> , dann\n  hinterlasse Abdruck\nsonst\n  lösche alles\nEnde",
    )
  })

  test("when flag clicked: en -> de", () => {
    const b = parseBlock("when flag clicked")
    b.translate(allLanguages.de)
    expect(b.stringify()).toEqual("Wenn die grüne Flagge angeklickt")
  })

  test("when flag clicked: en -> ja", () => {
    const b = parseBlock("when flag clicked")
    b.translate(allLanguages.ja)
    expect(b.stringify()).toEqual("緑の旗が押されたとき")
  })

  test("escapes brackets in labels: en -> ko", () => {
    const b = parseBlock("if <mouse down?> then")
    b.translate(allLanguages.ko)
    expect(b.stringify()).toEqual(
      "만약 <마우스를 클릭했는가?> \\(이\\)라면\nend",
    )
  })

  test("translates stop block: en -> ja", () => {
    const b = parseBlock("stop [all v]")
    b.translate(allLanguages.ja)
    expect(b.stringify()).toEqual("[すべてを止める v]")
  })

  test("#549: comments are translated no-op", () => {
    const c = "// hello"
    const s = parseScript(c)
    s.translate(allLanguages.ja)
    expect(s.stringify()).toEqual(c)
  })

  test("custom blocks (see also #552, #566)", () => {
    const doc = parse(
      "Definiere (答え) と言う\nsage (答え)\n\n(answer) と言う\n",
      optionsFor("de"),
    )
    doc.scripts.forEach(s => s.translate(allLanguages.ja))
    expect(doc.scripts[0].stringify()).toEqual(
      "定義 (答え :: custom-arg) と言う\n(答え :: custom-arg) と言う",
    )
    expect(doc.scripts[1].stringify()).toEqual("(答え) と言う :: custom")
  })

  // TODO translate end
})

describe("define hats", () => {
  const defineHat = {
    shape: "define-hat",
    category: "custom",
    selector: "procDef",
  }

  test("empty", () => {
    const b = parseBlock("define")
    expect(b.info).toMatchObject(defineHat)
  })

  test("en", () => {
    expect(parseBlock("define foo (bar) quxx").info).toMatchObject(defineHat)
  })

  test("translate en -> de", () => {
    const b = parseBlock("define foo (bar) quxx")
    b.translate(allLanguages.de)
    // TODO omit custom-arg here
    expect(b.stringify()).toEqual("Definiere foo (bar :: custom-arg) quxx")
  })

  test("de", () => {
    expect(
      parseBlock("Definiere foo (bar) quxx", optionsFor("de")).info,
    ).toMatchObject(defineHat)
  })

  test("matches define keyword last", () => {
    expect(
      parseBlock(
        "defina o estilo de rotação para [left-right v]",
        optionsFor("pt_br"),
      ).info,
    ).toMatchObject({
      category: "motion",
      selector: "setRotationStyle",
    })
    expect(
      parseBlock("defina o tamanho como (100) %", optionsFor("pt_br")).info,
    ).toMatchObject({
      category: "looks",
      selector: "setSizeTo:",
    })
    expect(
      parseBlock("defina foo (bar) quxx", optionsFor("pt_br")).info,
    ).toMatchObject(defineHat)
  })

  test("rap: three-word define prefix", () => {
    expect(
      parseBlock("haka tano te foo (bar) quxx", optionsFor("rap")).info,
    ).toMatchObject(defineHat)
  })

  test("uz: two-word define suffix", () => {
    expect(
      parseBlock("foo (bar) quxx ni belgilash", optionsFor("uz")).info,
    ).toMatchObject(defineHat)
  })
})

describe("misc regression test", () => {
  test("#534", () => {
    expect(parseBlock("::+").info).toMatchObject({ category: "obsolete" })
  })
})

// TODO test { } handling

/* Block path and cursor highlighting tests */

describe("block paths", () => {
  test("simple block gets path", () => {
    const doc = parse("say [hello]")
    expect(doc.blockMap.size).toBeGreaterThan(0)
    const block = doc.blockMap.get("1.1")
    expect(block).toBeDefined()
    expect(block.blockPath).toBe("1.1")
  })

  test("nested reporter blocks get paths", () => {
    const doc = parse("say (answer)")
    expect(doc.blockMap.get("1.1")).toBeDefined()
    expect(doc.blockMap.get("1.1.1")).toBeDefined()
  })

  test("deeply nested blocks get correct paths", () => {
    const doc = parse("ask (join [hello] (answer))")
    expect(doc.blockMap.get("1.1")).toBeDefined()
    expect(doc.blockMap.get("1.1.1")).toBeDefined()
    expect(doc.blockMap.get("1.1.1.1")).toBeDefined()
  })

  test("c-block children get correct paths", () => {
    const doc = parse(`repeat (10)
  move (10) steps
end`)
    expect(doc.blockMap.get("1.1")).toBeDefined() // repeat
    expect(doc.blockMap.get("1.1.1.1")).toBeDefined() // move inside repeat
  })

  test("if-else children get correct paths", () => {
    const doc = parse(`if <> then
  say [hello]
else
  say [world]
end`)
    expect(doc.blockMap.get("1.1")).toBeDefined() // if block
    expect(doc.blockMap.get("1.1.1.1")).toBeDefined() // say hello in if branch
    expect(doc.blockMap.get("1.1.2.1")).toBeDefined() // say world in else branch
  })

  test("multiple scripts get separate path prefixes", () => {
    const doc = parse(`say [hello]

say [world]`)
    expect(doc.blockMap.get("1.1")).toBeDefined() // first script
    expect(doc.blockMap.get("2.1")).toBeDefined() // second script
  })
})

describe("getBlockByPath", () => {
  test("returns block for valid path", () => {
    const doc = parse("say [hello]")
    const block = doc.getBlockByPath("1.1")
    expect(block).toBeDefined()
    expect(block.blockPath).toBe("1.1")
  })

  test("returns null for invalid path", () => {
    const doc = parse("say [hello]")
    const block = doc.getBlockByPath("99.99")
    expect(block).toBeNull()
  })

  test("returns nested block for nested path", () => {
    const doc = parse("say (answer)")
    const block = doc.getBlockByPath("1.1.1")
    expect(block).toBeDefined()
    expect(block.info.category).toBe("sensing")
  })
})

describe("input parsing for highlight tests", () => {
  test("block with string and number inputs", () => {
    const b = parseBlock("say [hello] for (2) secs")
    const labels = b.children.filter(c => c.isLabel)
    const inputs = b.children.filter(c => c.isInput)
    expect(labels.length).toBeGreaterThan(0)
    expect(inputs.length).toBe(2) // [hello] and (2)
  })

  test("block with dropdown input", () => {
    const b = parseBlock("set [x v] to (10)")
    const inputs = b.children.filter(c => c.isInput)
    expect(inputs.some(i => i.shape === "dropdown")).toBe(true)
    expect(inputs.some(i => i.shape === "number")).toBe(true)
  })

  test("block with nested reporter", () => {
    const doc = parse("say (join [a] [b])")
    const outerBlock = doc.blockMap.get("1.1")
    const innerBlock = doc.blockMap.get("1.1.1")
    expect(outerBlock).toBeDefined()
    expect(innerBlock).toBeDefined()
    expect(innerBlock.info.selector).toBe("concatenate:with:")
  })
})

describe("stack input {} handling", () => {
  test("inline {} creates nested block", () => {
    const doc = parse("test {test}")
    expect(doc.blockMap.get("1.1")).toBeDefined()
    expect(doc.blockMap.get("1.1.1")).toBeDefined()
  })

  test("multiline {} creates nested blocks", () => {
    const doc = parse(`run {
  move (10) steps
} :: control`)
    expect(doc.blockMap.get("1.1")).toBeDefined() // run block
    expect(doc.blockMap.get("1.1.1.1")).toBeDefined() // move block inside {}
  })

  test("multiple {} inputs create separate paths", () => {
    const doc = parse(`test {
    test
} test {
    test
} test {
    test
}`)
    expect(doc.blockMap.get("1.1")).toBeDefined() // parent
    expect(doc.blockMap.get("1.1.1.1")).toBeDefined() // first {} child
    expect(doc.blockMap.get("1.1.2.1")).toBeDefined() // second {} child
    expect(doc.blockMap.get("1.1.3.1")).toBeDefined() // third {} child
  })
})
