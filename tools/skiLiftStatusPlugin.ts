import type {
  Plugin,
} from 'vite'


type LiftItem = {
  name: string

  code?:
    string

  status:
    | 'open'
    | 'hold'
    | 'closed'
}


type LiftStatusPayload = {
  success: boolean
  supported: boolean
  resortId: string
  resortName?: string

  live: boolean

  sourceMode:
    | 'official_live'
    | 'official_summary'
    | 'official_schedule'
    | 'official_only'
    | 'unsupported'

  open:
    number |
    null

  total:
    number |
    null

  onHold:
    number |
    null

  closed:
    number |
    null

  lifts: LiftItem[]

  updatedAt?:
    string |
    null

  fetchedAt:
    string

  sourceUrl?:
    string

  officialUrl?:
    string

  message?:
    string

  error?:
    string

  cache?:
    boolean
}


type ResortAdapter =
  | 'furano_summary'
  | 'gala_table'
  | 'happo_table'
  | 'niseko_dynamic'
  | 'official_only'


type ResortSource = {
  id: string
  name: string
  officialUrl: string
  statusUrl: string
  adapter: ResortAdapter
}


const CACHE_SECONDS =
  90


const FETCH_TIMEOUT_MS =
  8000


const RESORT_SOURCES:
  Record<
    string,
    ResortSource
  > =
{
  // ==========================================================
  // Initial live / parsed adapters
  // ==========================================================

  furano: {
    id:
      'furano',

    name:
      'Furano Ski Resort',

    officialUrl:
      'https://www.princehotels.co.jp/ski/furano/winter/',

    statusUrl:
      'https://www.princehotels.co.jp/ski/furano/winter/coursemap/?tab=lift',

    adapter:
      'furano_summary',
  },


  'gala-yuzawa': {
    id:
      'gala-yuzawa',

    name:
      'GALA Yuzawa Snow Resort',

    officialUrl:
      'https://gala.co.jp/en/winter/',

    statusUrl:
      'https://gala.co.jp/en/winter/gelande/',

    adapter:
      'gala_table',
  },


  'hakuba-happo': {
    id:
      'hakuba-happo',

    name:
      'Hakuba Happo-One',

    officialUrl:
      'https://www.happo-one.jp/en/winter/',

    statusUrl:
      'https://www.happo-one.jp/en/gelande/lift-report/',

    adapter:
      'happo_table',
  },


  'niseko-hirafu': {
    id:
      'niseko-hirafu',

    name:
      'Niseko Tokyu Grand Hirafu',

    officialUrl:
      'https://www.niseko.ne.jp/en/',

    statusUrl:
      'https://www.niseko.ne.jp/en/niseko-lift-status/',

    adapter:
      'niseko_dynamic',
  },


  'niseko-hanazono': {
    id:
      'niseko-hanazono',

    name:
      'Niseko Hanazono Resort',

    officialUrl:
      'https://hanazononiseko.com/',

    statusUrl:
      'https://www.niseko.ne.jp/en/niseko-lift-status/',

    adapter:
      'niseko_dynamic',
  },


  // ==========================================================
  // Official fallback only
  // ==========================================================

  'sapporo-teine': {
    id:
      'sapporo-teine',

    name:
      'Sapporo Teine',

    officialUrl:
      'https://sapporo-teine.com/snow/',

    statusUrl:
      'https://sapporo-teine.com/snow/',

    adapter:
      'official_only',
  },


  'sapporo-kokusai': {
    id:
      'sapporo-kokusai',

    name:
      'Sapporo Kokusai Ski Resort',

    officialUrl:
      'https://www.sapporo-kokusai.jp/',

    statusUrl:
      'https://www.sapporo-kokusai.jp/',

    adapter:
      'official_only',
  },


  rusutsu: {
    id:
      'rusutsu',

    name:
      'Rusutsu Resort',

    officialUrl:
      'https://rusutsu.com/',

    statusUrl:
      'https://rusutsu.com/',

    adapter:
      'official_only',
  },


  tomamu: {
    id:
      'tomamu',

    name:
      'Hoshino Resorts Tomamu',

    officialUrl:
      'https://www.snowtomamu.jp/winter/en/',

    statusUrl:
      'https://www.snowtomamu.jp/winter/en/',

    adapter:
      'official_only',
  },


  kiroro: {
    id:
      'kiroro',

    name:
      'Kiroro Snow World',

    officialUrl:
      'https://www.kiroro.co.jp/',

    statusUrl:
      'https://www.kiroro.co.jp/',

    adapter:
      'official_only',
  },


  kamui: {
    id:
      'kamui',

    name:
      'Kamui Ski Links',

    officialUrl:
      'https://www.kamui-skilinks.com/',

    statusUrl:
      'https://www.kamui-skilinks.com/',

    adapter:
      'official_only',
  },


  hakkoda: {
    id:
      'hakkoda',

    name:
      'Hakkoda Ski Area',

    officialUrl:
      'https://hakkoda-ropeway.jp/',

    statusUrl:
      'https://hakkoda-ropeway.jp/',

    adapter:
      'official_only',
  },


  appi: {
    id:
      'appi',

    name:
      'Appi Kogen Ski Resort',

    officialUrl:
      'https://www.appi.co.jp/',

    statusUrl:
      'https://www.appi.co.jp/',

    adapter:
      'official_only',
  },


  zao: {
    id:
      'zao',

    name:
      'Zao Onsen Ski Resort',

    officialUrl:
      'https://zaomountainresort.com/',

    statusUrl:
      'https://zaomountainresort.com/',

    adapter:
      'official_only',
  },


  nekoma: {
    id:
      'nekoma',

    name:
      'NEKOMA Mountain',

    officialUrl:
      'https://www.nekoma.co.jp/',

    statusUrl:
      'https://www.nekoma.co.jp/',

    adapter:
      'official_only',
  },


  kawaba: {
    id:
      'kawaba',

    name:
      'Kawaba Ski Resort',

    officialUrl:
      'https://www.kawaba.co.jp/',

    statusUrl:
      'https://www.kawaba.co.jp/',

    adapter:
      'official_only',
  },


  marunuma: {
    id:
      'marunuma',

    name:
      'Marunuma Kogen Ski Resort',

    officialUrl:
      'https://www.marunuma.jp/winter/',

    statusUrl:
      'https://www.marunuma.jp/winter/',

    adapter:
      'official_only',
  },


  naeba: {
    id:
      'naeba',

    name:
      'Naeba Ski Resort',

    officialUrl:
      'https://www.princehotels.co.jp/ski/naeba/winter/',

    statusUrl:
      'https://www.princehotels.co.jp/ski/naeba/winter/',

    adapter:
      'official_only',
  },


  kagura: {
    id:
      'kagura',

    name:
      'Kagura Ski Resort',

    officialUrl:
      'https://www.princehotels.co.jp/ski/kagura/winter/',

    statusUrl:
      'https://www.princehotels.co.jp/ski/kagura/winter/',

    adapter:
      'official_only',
  },


  'joetsu-kokusai': {
    id:
      'joetsu-kokusai',

    name:
      'Joetsu Kokusai Ski Resort',

    officialUrl:
      'https://jkokusai.co.jp/ski/',

    statusUrl:
      'https://jkokusai.co.jp/ski/',

    adapter:
      'official_only',
  },


  'hakuba-goryu': {
    id:
      'hakuba-goryu',

    name:
      'Hakuba Goryu',

    officialUrl:
      'https://www.hakubaescal.com/winter-en/',

    statusUrl:
      'https://www.hakubaescal.com/winter-en/',

    adapter:
      'official_only',
  },


  tsugaike: {
    id:
      'tsugaike',

    name:
      'Tsugaike Mountain Resort',

    officialUrl:
      'https://www.tsugaike.gr.jp/',

    statusUrl:
      'https://www.tsugaike.gr.jp/',

    adapter:
      'official_only',
  },


  nozawa: {
    id:
      'nozawa',

    name:
      'Nozawa Onsen Ski Resort',

    officialUrl:
      'https://en.nozawaski.com/',

    statusUrl:
      'https://en.nozawaski.com/',

    adapter:
      'official_only',
  },


  'shiga-kogen': {
    id:
      'shiga-kogen',

    name:
      'Shiga Kogen',

    officialUrl:
      'https://shigakogen-ski.or.jp/english/',

    statusUrl:
      'https://shigakogen-ski.or.jp/english/',

    adapter:
      'official_only',
  },


  takasu: {
    id:
      'takasu',

    name:
      'Takasu Snow Park',

    officialUrl:
      'https://www.takasu.gr.jp/',

    statusUrl:
      'https://www.takasu.gr.jp/',

    adapter:
      'official_only',
  },


  dynaland: {
    id:
      'dynaland',

    name:
      'Dynaland',

    officialUrl:
      'https://www.dynaland.co.jp/',

    statusUrl:
      'https://www.dynaland.co.jp/',

    adapter:
      'official_only',
  },
}


const CACHE =
  new Map<
    string,
    {
      savedAt:
        number

      payload:
        LiftStatusPayload
    }
  >()


// ============================================================
// Utility
// ============================================================

function nowIso() {

  return new Date()
    .toISOString()

}


function decodeHtml(
  value:
    string
) {

  return value
    .replace(
      /&nbsp;/gi,
      ' '
    )
    .replace(
      /&amp;/gi,
      '&'
    )
    .replace(
      /&quot;/gi,
      '"'
    )
    .replace(
      /&#39;/gi,
      "'"
    )
    .replace(
      /&lt;/gi,
      '<'
    )
    .replace(
      /&gt;/gi,
      '>'
    )

}


function stripHtml(
  html:
    string
) {

  return decodeHtml(
    html
      .replace(
        /<script\b[^>]*>[\s\S]*?<\/script>/gi,
        ' '
      )
      .replace(
        /<style\b[^>]*>[\s\S]*?<\/style>/gi,
        ' '
      )
      .replace(
        /<[^>]+>/g,
        ' '
      )
      .replace(
        /\s+/g,
        ' '
      )
      .trim()
  )

}


function getTableRows(
  html:
    string
) {

  return Array.from(
    html.matchAll(
      /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi
    )
  )
    .map(
      match => {

        const rawRow =
          match[1]


        const imageHints =
          Array.from(
            rawRow.matchAll(
              /<img\b[^>]*(?:alt|title|src)=["']([^"']+)["'][^>]*>/gi
            )
          )
            .map(
              imageMatch =>
                imageMatch[1]
            )
            .join(
              ' '
            )


        return `${stripHtml(
          rawRow
        )} ${imageHints}`
          .replace(
            /\s+/g,
            ' '
          )
          .trim()

      }
    )
    .filter(
      Boolean
    )

}


function extractLiftCode(
  name:
    string
):
  string |
  undefined {

  const hashMatch =
    name.match(
      /#\s*(\d+)/i
    )


  if (
    hashMatch
  ) {

    return `#${hashMatch[1]}`

  }


  const trailingNumber =
    name.match(
      /\b(\d+)\s*$/
    )


  if (
    trailingNumber
  ) {

    return `#${trailingNumber[1]}`

  }


  return undefined

}


function classifyStatus(
  row:
    string
):
  LiftItem['status'] |
  null {

  const value =
    ` ${row.toLowerCase()} `


  const openTokens = [
    ' ○ ',
    ' 運行中 ',
    ' 営業中 ',
    ' operating ',
    ' open ',
    ' status_open ',
    ' status-open ',
    ' ico_open ',
  ]


  const holdTokens = [
    ' 準備中 ',
    ' 待機 ',
    ' 一時運休 ',
    ' on hold ',
    ' standby ',
    ' status_hold ',
    ' status-hold ',
  ]


  const closedTokens = [
    ' × ',
    ' － ',
    ' 運休 ',
    ' 休止 ',
    ' 終了 ',
    ' 時間外 ',
    ' 期間外 ',
    ' closed ',
    ' out of business hours ',
    ' status_close ',
    ' status-close ',
  ]


  if (
    openTokens.some(
      token =>
        value.includes(
          token
        )
    )
  ) {

    return 'open'

  }


  if (
    holdTokens.some(
      token =>
        value.includes(
          token
        )
    )
  ) {

    return 'hold'

  }


  if (
    closedTokens.some(
      token =>
        value.includes(
          token
        )
    )
  ) {

    return 'closed'

  }


  return null

}


async function fetchOfficialHtml(
  url:
    string
) {

  const controller =
    new AbortController()


  const timer =
    setTimeout(
      () =>
        controller.abort(),
      FETCH_TIMEOUT_MS
    )


  try {

    const response =
      await fetch(
        url,
        {
          signal:
            controller.signal,

          headers: {
            'User-Agent':
              'Mozilla/5.0 travel-v100-ski-status/1.0',

            'Accept-Language':
              'ja,en-US;q=0.8,en;q=0.7',
          },
        }
      )


    if (
      !response.ok
    ) {

      throw new Error(
        `Official page returned ${response.status}`
      )

    }


    return await response.text()

  } finally {

    clearTimeout(
      timer
    )

  }

}


// ============================================================
// Resort parsers
// ============================================================

function parseFurano(
  source:
    ResortSource,
  html:
    string
):
  LiftStatusPayload {

  const text =
    stripHtml(
      html
    )


  const match =
    text.match(
      /(?:リフト|Lift)\s*(\d+)\s*\/\s*(\d+)/i
    )


  if (
    !match
  ) {

    throw new Error(
      'Furano lift ratio not found'
    )

  }


  const open =
    Number(
      match[1]
    )


  const total =
    Number(
      match[2]
    )


  return {
    success:
      true,

    supported:
      true,

    resortId:
      source.id,

    resortName:
      source.name,

    live:
      false,

    sourceMode:
      'official_summary',

    open,

    total,

    onHold:
      0,

    closed:
      Math.max(
        total -
        open,
        0
      ),

    lifts:
      [],

    updatedAt:
      null,

    fetchedAt:
      nowIso(),

    sourceUrl:
      source.statusUrl,

    officialUrl:
      source.officialUrl,

    message:
      'Official Furano lift summary. Realtime operation may change during the day.',
  }

}


const GALA_LIFT_KEYWORDS = [
  'chairlift',
  'gondola',
  'ropeway',
  'ディリジャンス',
  'コーチ',
  'バルーシュ',
  'ソーシャブル',
  'フェートン',
  'ビクトリア',
  'シャリオ',
  'ティルバリー',
  'バギー',
  'ランドー',
  'ワゴネット',
]


function parseGala(
  source:
    ResortSource,
  html:
    string
):
  LiftStatusPayload {

  const rows =
    getTableRows(
      html
    )


  const lifts:
    LiftItem[] =
    []


  for (
    const row
    of rows
  ) {

    const lower =
      row.toLowerCase()


    const isLift =
      GALA_LIFT_KEYWORDS.some(
        keyword =>
          lower.includes(
            keyword.toLowerCase()
          )
      )


    if (
      !isLift
    ) {
      continue
    }


    const status =
      classifyStatus(
        row
      )


    if (
      !status
    ) {
      continue
    }


    const name =
      row
        .replace(
          /\s+[○×－]\s*$/,
          ''
        )
        .slice(
          0,
          120
        )


    lifts.push({
      name,

      code:
        extractLiftCode(
          name
        ),

      status,
    })

  }


  if (
    lifts.length ===
    0
  ) {

    throw new Error(
      'GALA lift rows not found'
    )

  }


  const open =
    lifts.filter(
      lift =>
        lift.status ===
        'open'
    ).length


  const onHold =
    lifts.filter(
      lift =>
        lift.status ===
        'hold'
    ).length


  return {
    success:
      true,

    supported:
      true,

    resortId:
      source.id,

    resortName:
      source.name,

    live:
      false,

    sourceMode:
      'official_schedule',

    open,

    total:
      lifts.length,

    onHold,

    closed:
      Math.max(
        lifts.length -
        open -
        onHold,
        0
      ),

    lifts,

    updatedAt:
      null,

    fetchedAt:
      nowIso(),

    sourceUrl:
      source.statusUrl,

    officialUrl:
      source.officialUrl,

    message:
      "Official GALA today's lift operation schedule.",
  }

}


const HAPPO_LIFT_NAMES = [
  'Grat Quad',
  'Alpen Quad',
  'Usagidaira',
  'Happo Riesen Quad',
  'Nakiyama 2',
  'Nakiyama 3',
  'ADAM Gondola',
  'Shirakaba 1',
  'Shirakaba 2',
  'Panorama Pair',
  'Kokusai 1',
  'Kokusai 3',
  'Kurobishi 2',
  'Kurobishi 3',
  'Skyline 2',
  'Sakka 2',
  'Sakka 3',
  'Sakka Kitaone',
  'Kitaone 3',
]


function parseHappo(
  source:
    ResortSource,
  html:
    string
):
  LiftStatusPayload {

  const rows =
    getTableRows(
      html
    )


  const lifts:
    LiftItem[] =
    []


  for (
    const row
    of rows
  ) {

    const name =
      HAPPO_LIFT_NAMES.find(
        liftName =>
          row
            .toLowerCase()
            .includes(
              liftName
                .toLowerCase()
            )
      )


    if (
      !name
    ) {
      continue
    }


    const status =
      classifyStatus(
        row
      )


    if (
      !status
    ) {
      continue
    }


    lifts.push({
      name,

      code:
        extractLiftCode(
          name
        ),

      status,
    })

  }


  if (
    lifts.length ===
    0
  ) {

    throw new Error(
      'Happo lift rows not found'
    )

  }


  const open =
    lifts.filter(
      lift =>
        lift.status ===
        'open'
    ).length


  const onHold =
    lifts.filter(
      lift =>
        lift.status ===
        'hold'
    ).length


  const pageText =
    stripHtml(
      html
    )


  const updateMatch =
    pageText.match(
      /(?:Update at\s*)?(\d{4}[./-]\d{1,2}[./-]\d{1,2}\s+\d{1,2}:\d{2})/i
    )


  return {
    success:
      true,

    supported:
      true,

    resortId:
      source.id,

    resortName:
      source.name,

    live:
      true,

    sourceMode:
      'official_live',

    open,

    total:
      lifts.length,

    onHold,

    closed:
      Math.max(
        lifts.length -
        open -
        onHold,
        0
      ),

    lifts,

    updatedAt:
      updateMatch
        ?.at(
          1
        ) ??
      null,

    fetchedAt:
      nowIso(),

    sourceUrl:
      source.statusUrl,

    officialUrl:
      source.officialUrl,

    message:
      'Official Happo-One lift operations.',
  }

}


const NISEKO_TARGET_LIFTS:
  Record<
    string,
    string[]
  > =
{
  'niseko-hirafu': [
    'Ace Family Quad Lift',
    'Ace Gondola',
    'Ace Pair Lift #3',
    'Ace Pair Lift #4',
    'King Gondola',
    'King Holiday Pair Lift',
    'King Sixpack Lift #3',
    'King Single Lift #4',
    'Swinging Monkey',
  ],

  'niseko-hanazono': [
    'Hanazono Hooded Lift #1',
    'Hanazono Quad Lift #2',
    'Hanazono Hooded Quad Lift #3',
    'Hanazono Symphony Gondola',
  ],
}


function parseNiseko(
  source:
    ResortSource,
  html:
    string
):
  LiftStatusPayload {

  const rows =
    getTableRows(
      html
    )


  const targetLifts =
    NISEKO_TARGET_LIFTS[
      source.id
    ] ??
    []


  const lifts:
    LiftItem[] =
    []


  for (
    const row
    of rows
  ) {

    const name =
      targetLifts.find(
        liftName =>
          row
            .toLowerCase()
            .includes(
              liftName
                .toLowerCase()
            )
      )


    if (
      !name
    ) {
      continue
    }


    const status =
      classifyStatus(
        row
      )


    if (
      status
    ) {

      lifts.push({
        name,

        code:
          extractLiftCode(
            name
          ),

        status,
      })

    }

  }


  if (
    lifts.length ===
    0
  ) {

    return {
      success:
        true,

      supported:
        true,

      resortId:
        source.id,

      resortName:
        source.name,

      live:
        false,

      sourceMode:
        'official_only',

      open:
        null,

      total:
        targetLifts.length ||
        null,

      onHold:
        null,

      closed:
        null,

      lifts:
        [],

      updatedAt:
        null,

      fetchedAt:
        nowIso(),

      sourceUrl:
        source.statusUrl,

      officialUrl:
        source.officialUrl,

      message:
        'Official Niseko status page is available, but reliable machine-readable statuses were not found.',
    }

  }


  const open =
    lifts.filter(
      lift =>
        lift.status ===
        'open'
    ).length


  const onHold =
    lifts.filter(
      lift =>
        lift.status ===
        'hold'
    ).length


  return {
    success:
      true,

    supported:
      true,

    resortId:
      source.id,

    resortName:
      source.name,

    live:
      true,

    sourceMode:
      'official_live',

    open,

    total:
      targetLifts.length,

    onHold,

    closed:
      Math.max(
        targetLifts.length -
        open -
        onHold,
        0
      ),

    lifts,

    updatedAt:
      null,

    fetchedAt:
      nowIso(),

    sourceUrl:
      source.statusUrl,

    officialUrl:
      source.officialUrl,

    message:
      'Official Niseko United lift status.',
  }

}


function officialOnly(
  source:
    ResortSource
):
  LiftStatusPayload {

  return {
    success:
      true,

    supported:
      true,

    resortId:
      source.id,

    resortName:
      source.name,

    live:
      false,

    sourceMode:
      'official_only',

    open:
      null,

    total:
      null,

    onHold:
      null,

    closed:
      null,

    lifts:
      [],

    updatedAt:
      null,

    fetchedAt:
      nowIso(),

    sourceUrl:
      source.statusUrl,

    officialUrl:
      source.officialUrl,

    message:
      'Official page available. Live parser has not been added yet.',
  }

}


// ============================================================
// Adapter runner
// ============================================================

async function runAdapter(
  source:
    ResortSource
):
  Promise<LiftStatusPayload> {

  if (
    source.adapter ===
    'official_only'
  ) {

    return officialOnly(
      source
    )

  }


  const html =
    await fetchOfficialHtml(
      source.statusUrl
    )


  switch (
    source.adapter
  ) {

    case 'furano_summary':
      return parseFurano(
        source,
        html
      )


    case 'gala_table':
      return parseGala(
        source,
        html
      )


    case 'happo_table':
      return parseHappo(
        source,
        html
      )


    case 'niseko_dynamic':
      return parseNiseko(
        source,
        html
      )


    default:
      return officialOnly(
        source
      )

  }

}


// ============================================================
// API
// ============================================================

async function getLiftStatus(
  resortId:
    string,
  force:
    boolean
):
  Promise<LiftStatusPayload> {

  const source =
    RESORT_SOURCES[
      resortId
    ]


  if (
    !source
  ) {

    return {
      success:
        false,

      supported:
        false,

      resortId,

      live:
        false,

      sourceMode:
        'unsupported',

      open:
        null,

      total:
        null,

      onHold:
        null,

      closed:
        null,

      lifts:
        [],

      updatedAt:
        null,

      fetchedAt:
        nowIso(),

      message:
        'This ski resort is not registered.',
    }

  }


  if (
    !force
  ) {

    const cached =
      CACHE.get(
        resortId
      )


    if (
      cached &&
      Date.now() -
        cached.savedAt <
        CACHE_SECONDS *
        1000
    ) {

      return {
        ...cached.payload,

        cache:
          true,
      }

    }

  }


  try {

    const payload =
      await runAdapter(
        source
      )


    CACHE.set(
      resortId,
      {
        savedAt:
          Date.now(),

        payload,
      }
    )


    return {
      ...payload,

      cache:
        false,
    }

  } catch (
    error
  ) {

    return {
      success:
        false,

      supported:
        true,

      resortId:
        source.id,

      resortName:
        source.name,

      live:
        false,

      sourceMode:
        'official_only',

      open:
        null,

      total:
        null,

      onHold:
        null,

      closed:
        null,

      lifts:
        [],

      updatedAt:
        null,

      fetchedAt:
        nowIso(),

      sourceUrl:
        source.statusUrl,

      officialUrl:
        source.officialUrl,

      message:
        'Official status could not be parsed. Use official link as fallback.',

      error:
        error instanceof
          Error
          ? `${error.name}: ${error.message}`
          : String(
              error
            ),

      cache:
        false,
    }

  }

}


// ============================================================
// Vite middleware
// ============================================================

function sendJson(
  response:
    any,
  payload:
    unknown,
  statusCode =
    200
) {

  response.statusCode =
    statusCode

  response.setHeader(
    'Content-Type',
    'application/json; charset=utf-8'
  )

  response.setHeader(
    'Cache-Control',
    'no-store'
  )

  response.end(
    JSON.stringify(
      payload
    )
  )

}


function createMiddleware() {

  return async (
    request:
      any,
    response:
      any,
    next:
      () => void
  ) => {

    const rawUrl =
      request.url ??
      ''


    const url =
      new URL(
        rawUrl,
        'http://localhost'
      )


    if (
      url.pathname ===
      '/api/ski/lift-status'
    ) {

      sendJson(
        response,
        {
          count:
            Object.keys(
              RESORT_SOURCES
            ).length,

          cacheSeconds:
            CACHE_SECONDS,

          resorts:
            Object.values(
              RESORT_SOURCES
            )
              .map(
                source => ({
                  id:
                    source.id,

                  name:
                    source.name,

                  adapter:
                    source.adapter,

                  officialUrl:
                    source.officialUrl,

                  statusUrl:
                    source.statusUrl,
                })
              ),
        }
      )

      return

    }


    const match =
      url.pathname.match(
        /^\/api\/ski\/lift-status\/([^/]+)$/
      )


    if (
      !match
    ) {

      next()

      return

    }


    const resortId =
      decodeURIComponent(
        match[1]
      )


    const force =
      url.searchParams
        .get(
          'force'
        ) ===
      'true'


    const payload =
      await getLiftStatus(
        resortId,
        force
      )


    sendJson(
      response,
      payload
    )

  }

}


// ============================================================
// Plugin export
// ============================================================

function skiLiftStatusPlugin():
  Plugin {

  return {
    name:
      'travel-v100-ski-lift-status',

    configureServer(
      server
    ) {

      server.middlewares.use(
        createMiddleware()
      )

    },

    configurePreviewServer(
      server
    ) {

      server.middlewares.use(
        createMiddleware()
      )

    },
  }

}


export default skiLiftStatusPlugin
