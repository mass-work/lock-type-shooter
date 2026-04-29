export const JAPANESE_WORDS = [
  { prompt: "猫", reading: "ねこ" },
  { prompt: "犬", reading: "いぬ" },
  { prompt: "象", reading: "ぞう" },
  { prompt: "子猫", reading: "こねこ" },
  { prompt: "子犬", reading: "こいぬ" },
  { prompt: "うさぎ", reading: "うさぎ" },
  { prompt: "くま", reading: "くま" },
  { prompt: "パンダ", reading: "ぱんだ" },
  { prompt: "コアラ", reading: "こあら" },
  { prompt: "きつね", reading: "きつね" },
  { prompt: "たぬき", reading: "たぬき" },
  { prompt: "りす", reading: "りす" },
  { prompt: "ねずみ", reading: "ねずみ" },
  { prompt: "さる", reading: "さる" },
  { prompt: "とら", reading: "とら" },
  { prompt: "らいおん", reading: "らいおん" },
  { prompt: "きりん", reading: "きりん" },
  { prompt: "しまうま", reading: "しまうま" },
  { prompt: "かば", reading: "かば" },
  { prompt: "さい", reading: "さい" },
  { prompt: "らくだ", reading: "らくだ" },
  { prompt: "ひつじ", reading: "ひつじ" },
  { prompt: "やぎ", reading: "やぎ" },
  { prompt: "うし", reading: "うし" },
  { prompt: "うま", reading: "うま" },
  { prompt: "ぶた", reading: "ぶた" },
  { prompt: "にわとり", reading: "にわとり" },
  { prompt: "ひよこ", reading: "ひよこ" },
  { prompt: "あひる", reading: "あひる" },
  { prompt: "ぺんぎん", reading: "ぺんぎん" },
  { prompt: "いるか", reading: "いるか" },
  { prompt: "くじら", reading: "くじら" },
  { prompt: "さかな", reading: "さかな" },
  { prompt: "きんぎょ", reading: "きんぎょ" },
  { prompt: "かえる", reading: "かえる" },
  { prompt: "へび", reading: "へび" },
  { prompt: "かめ", reading: "かめ" },
  { prompt: "わに", reading: "わに" },
  { prompt: "とかげ", reading: "とかげ" },
  { prompt: "ちょうちょ", reading: "ちょうちょ" },
  { prompt: "とんぼ", reading: "とんぼ" },
  { prompt: "キー", reading: "きー" },
  { prompt: "スイッチ", reading: "すいっち" },
  { prompt: "キーボード", reading: "きーぼーど" },
  { prompt: "マウス", reading: "まうす" },
  { prompt: "ボタン", reading: "ぼたん" },
  { prompt: "画面", reading: "がめん" },
  { prompt: "充電", reading: "じゅうでん" },
  { prompt: "ケーブル", reading: "けーぶる" },
  { prompt: "イヤホン", reading: "いやほん" },
  { prompt: "スマホ", reading: "すまほ" },
  { prompt: "パソコン", reading: "ぱそこん" },
  { prompt: "ランプ", reading: "らんぷ" },
  { prompt: "時計", reading: "とけい" },
  { prompt: "机", reading: "つくえ" },
  { prompt: "椅子", reading: "いす" },
  { prompt: "本", reading: "ほん" },
  { prompt: "ノート", reading: "のーと" },
  { prompt: "鉛筆", reading: "えんぴつ" },
  { prompt: "消しゴム", reading: "けしごむ" },
  { prompt: "ランドセル", reading: "らんどせる" },
  { prompt: "りんご", reading: "りんご" },
  { prompt: "みかん", reading: "みかん" },
  { prompt: "バナナ", reading: "ばなな" },
  { prompt: "いちご", reading: "いちご" },
  { prompt: "ぶどう", reading: "ぶどう" },
  { prompt: "すいか", reading: "すいか" },
  { prompt: "トマト", reading: "とまと" },
  { prompt: "にんじん", reading: "にんじん" },
  { prompt: "じゃがいも", reading: "じゃがいも" },
  { prompt: "玉ねぎ", reading: "たまねぎ" },
  { prompt: "ごはん", reading: "ごはん" },
  { prompt: "食パン", reading: "しょくぱん" },
  { prompt: "おにぎり", reading: "おにぎり" },
  { prompt: "たまご", reading: "たまご" },
  { prompt: "牛乳", reading: "ぎゅうにゅう" },
  { prompt: "カレー", reading: "かれー" },
  { prompt: "ラーメン", reading: "らーめん" },
  { prompt: "学校", reading: "がっこう" },
  { prompt: "家族", reading: "かぞく" },
  { prompt: "友達", reading: "ともだち" },
  { prompt: "公園", reading: "こうえん" },
  { prompt: "電車", reading: "でんしゃ" },
  { prompt: "自転車", reading: "じてんしゃ" },
  { prompt: "花火", reading: "はなび" },
  { prompt: "青空", reading: "あおぞら" },
  { prompt: "夕焼け", reading: "ゆうやけ" },
  { prompt: "朝ごはん", reading: "あさごはん" },
  { prompt: "お弁当", reading: "おべんとう" },
  { prompt: "宿題", reading: "しゅくだい" },
  { prompt: "誕生日", reading: "たんじょうび" },
  { prompt: "ぬいぐるみ", reading: "ぬいぐるみ" },
  { prompt: "動物園", reading: "どうぶつえん" },
];

export const LANGUAGE_CONFIG = {
  japanese: {
    label: "日本語",
    shortLabel: "日本語",
  },
};

export const DEFAULT_LANGUAGE = "japanese";

export const WORD_LENGTH_CYCLE = {
  cycleSize: 24,
  growthSpan: 17,
  burstSpan: 7,
  minLength: 5,
  maxLength: 12,
};

const ROMAJI_MAP = {
  きゃ: ["kya"],
  きゅ: ["kyu"],
  きょ: ["kyo"],
  しゃ: ["sha", "sya"],
  しゅ: ["shu", "syu"],
  しょ: ["sho", "syo"],
  ちゃ: ["cha", "tya", "cya"],
  ちゅ: ["chu", "tyu", "cyu"],
  ちょ: ["cho", "tyo", "cyo"],
  にゃ: ["nya"],
  にゅ: ["nyu"],
  にょ: ["nyo"],
  ひゃ: ["hya"],
  ひゅ: ["hyu"],
  ひょ: ["hyo"],
  みゃ: ["mya"],
  みゅ: ["myu"],
  みょ: ["myo"],
  りゃ: ["rya"],
  りゅ: ["ryu"],
  りょ: ["ryo"],
  ぎゃ: ["gya"],
  ぎゅ: ["gyu"],
  ぎょ: ["gyo"],
  じゃ: ["ja", "jya", "zya"],
  じゅ: ["ju", "jyu", "zyu"],
  じょ: ["jo", "jyo", "zyo"],
  びゃ: ["bya"],
  びゅ: ["byu"],
  びょ: ["byo"],
  ぴゃ: ["pya"],
  ぴゅ: ["pyu"],
  ぴょ: ["pyo"],
  ふぁ: ["fa"],
  ふぃ: ["fi"],
  ふぇ: ["fe"],
  ふぉ: ["fo"],
  うぃ: ["wi"],
  うぇ: ["we"],
  あ: ["a"],
  い: ["i"],
  う: ["u"],
  え: ["e"],
  お: ["o"],
  か: ["ka"],
  き: ["ki"],
  く: ["ku"],
  け: ["ke"],
  こ: ["ko"],
  さ: ["sa"],
  し: ["shi", "si"],
  す: ["su"],
  せ: ["se"],
  そ: ["so"],
  た: ["ta"],
  ち: ["chi", "ti"],
  つ: ["tsu", "tu"],
  て: ["te"],
  と: ["to"],
  な: ["na"],
  に: ["ni"],
  ぬ: ["nu"],
  ね: ["ne"],
  の: ["no"],
  は: ["ha"],
  ひ: ["hi"],
  ふ: ["fu", "hu"],
  へ: ["he"],
  ほ: ["ho"],
  ま: ["ma"],
  み: ["mi"],
  む: ["mu"],
  め: ["me"],
  も: ["mo"],
  や: ["ya"],
  ゆ: ["yu"],
  よ: ["yo"],
  ら: ["ra"],
  り: ["ri"],
  る: ["ru"],
  れ: ["re"],
  ろ: ["ro"],
  わ: ["wa"],
  を: ["wo", "o"],
  が: ["ga"],
  ぎ: ["gi"],
  ぐ: ["gu"],
  げ: ["ge"],
  ご: ["go"],
  ざ: ["za"],
  じ: ["ji", "zi"],
  ず: ["zu"],
  ぜ: ["ze"],
  ぞ: ["zo"],
  だ: ["da"],
  ぢ: ["ji", "di"],
  づ: ["zu", "du"],
  で: ["de"],
  ど: ["do"],
  ば: ["ba"],
  び: ["bi"],
  ぶ: ["bu"],
  べ: ["be"],
  ぼ: ["bo"],
  ぱ: ["pa"],
  ぴ: ["pi"],
  ぷ: ["pu"],
  ぺ: ["pe"],
  ぽ: ["po"],
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function uniqueOptions(values) {
  return [...new Set(values)].slice(0, 96);
}

function getLastVowel(value) {
  return value.match(/[aiueo](?!.*[aiueo])/)?.[0] ?? "";
}

export function buildRomajiOptions(reading) {
  const build = (index, previousVowel = "") => {
    if (index >= reading.length) return [""];

    const char = reading[index];
    if (char === "っ") {
      return build(index + 1, previousVowel).flatMap((rest) => {
        const head = rest[0];
        return head && /[bcdfghjklmpqrstvwxyz]/.test(head) ? [head + rest, `xtsu${rest}`, `ltsu${rest}`] : [`xtsu${rest}`, `ltsu${rest}`];
      });
    }

    if (char === "ん") {
      return build(index + 1, previousVowel).flatMap((rest) => {
        const next = rest[0];
        const needsApostrophe = next && /^[aiueoyn]/.test(next);
        return needsApostrophe ? [`n'${rest}`, `nn${rest}`, `xn${rest}`] : [`n${rest}`, `nn${rest}`, `xn${rest}`];
      });
    }

    if (char === "ー") {
      const options = previousVowel ? ["-", previousVowel] : ["-"];
      return options.flatMap((part) => build(index + 1, previousVowel).map((rest) => part + rest));
    }

    const pair = reading.slice(index, index + 2);
    const pairOptions = ROMAJI_MAP[pair];
    if (pairOptions) {
      return pairOptions.flatMap((part) => build(index + 2, getLastVowel(part) || previousVowel).map((rest) => part + rest));
    }

    const options = ROMAJI_MAP[char] ?? [char];
    return options.flatMap((part) => build(index + 1, getLastVowel(part) || previousVowel).map((rest) => part + rest));
  };

  return uniqueOptions(build(0));
}

export function getEnemyPacing(breaks = 0) {
  const safeBreaks = Math.max(0, breaks);
  const cycle = WORD_LENGTH_CYCLE.cycleSize;
  const phase = safeBreaks % cycle;
  const loop = Math.floor(safeBreaks / cycle);
  const inBurst = phase >= WORD_LENGTH_CYCLE.growthSpan;
  const burstPhase = inBurst ? phase - WORD_LENGTH_CYCLE.growthSpan : 0;
  const growthRatio = inBurst ? 0 : clamp(phase / (WORD_LENGTH_CYCLE.growthSpan - 1), 0, 1);
  const longTarget = Math.round(
    WORD_LENGTH_CYCLE.minLength + (WORD_LENGTH_CYCLE.maxLength - WORD_LENGTH_CYCLE.minLength) * growthRatio,
  );
  const shortBurstTarget = WORD_LENGTH_CYCLE.minLength + Math.min(2, Math.floor(burstPhase / 2));
  const targetLength = inBurst ? shortBurstTarget : longTarget;
  const loopBoost = Math.min(0.22, loop * 0.045);
  const burstBoost = inBurst ? 0.14 + (burstPhase / Math.max(1, WORD_LENGTH_CYCLE.burstSpan - 1)) * 0.1 : 0;
  const enemyLimitBonus = Math.min(2, loop + (inBurst ? 1 : 0));

  return {
    targetLength,
    lengthTolerance: inBurst ? 1 : 2 + Math.min(1, Math.floor(loop / 2)),
    speedMultiplier: 1 + loopBoost + burstBoost,
    spawnIntervalMultiplier: 1 - Math.min(0.42, loopBoost * 0.82 + burstBoost * 0.62),
    enemyLimitBonus,
  };
}

const JAPANESE_WORD_ENTRIES = JAPANESE_WORDS.map((item) => {
  const answerOptions = buildRomajiOptions(item.reading);
  return {
    prompt: item.prompt,
    reading: item.reading,
    answerOptions,
    minInputLength: Math.min(...answerOptions.map((option) => option.length)),
    language: "japanese",
  };
});

export function createWordEntry(language = DEFAULT_LANGUAGE, breaks = 0) {
  const pacing = getEnemyPacing(breaks);
  const pool = JAPANESE_WORD_ENTRIES;
  const candidates = pool.filter(
    (item) => Math.abs(item.minInputLength - pacing.targetLength) <= pacing.lengthTolerance,
  );
  const pickFrom = candidates.length ? candidates : pool;
  const picked = pickFrom[Math.floor(Math.random() * pickFrom.length)];

  return {
    prompt: picked.prompt,
    reading: picked.reading,
    answerOptions: picked.answerOptions,
    language: picked.language ?? language,
  };
}
