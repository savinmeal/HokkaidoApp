import {
  loadEnv,
  type Plugin,
  type ResolvedConfig,
} from 'vite'


// ============================================================
// Ocean Sightings Vite Middleware
//
// Sources
// 1. iOcean / Ocean Conservation Administration open data
// 2. Google News RSS for recent Taiwan marine-life coverage
//
// No extra npm dependencies.
// ============================================================


const IOCEAN_CSV_URL =
  'https://iocean.oca.gov.tw/oca_datahub/WebService/GetData.ashx?id=efb09ebd-1191-43be-ab52-80285c61d703'


const IOCEAN_PUBLIC_REPORT_URL =
  'https://iocean.oca.gov.tw/OCA_OceanConservation/PUBLIC/Report_Sightings.aspx'


const NEWS_SEARCH_URL =
  'https://news.google.com/rss/search'


const THREADS_API_HOST =
  'https://graph.threads.net'


const YOUTUBE_SEARCH_URL =
  'https://www.googleapis.com/youtube/v3/search'


let threadsAccessToken =
  ''


let youtubeApiKey =
  ''


const CACHE_TTL_MS =
  30 *
  60 *
  1000


type SightingCategory =
  | 'whale-shark'
  | 'manta'
  | 'cetacean'
  | 'shark'
  | 'sunfish'
  | 'turtle'
  | 'ray'
  | 'school'
  | 'wildlife'


type SightingItem = {
  id:
    string

  kind:
    'official' |
    'news' |
    'threads' |
    'youtube'

  category:
    SightingCategory

  speciesLabel:
    string

  title:
    string

  regionId:
    string

  regionName:
    string

  locationLabel:
    string

  date:
    string

  count:
    number |
    null

  latitude:
    number |
    null

  longitude:
    number |
    null

  sourceName:
    string

  authorName?:
    string |
    null

  thumbnailUrl?:
    string |
    null

  url:
    string |
    null
}


type CacheValue<T> = {
  at:
    number

  value:
    T
}


const cache =
  new Map<
    string,
    CacheValue<unknown>
  >()


const REGION_NAMES:
  Record<
    string,
    string
  > =
{
  taiwan:
    '全台',

  northeast:
    '東北角',

  kenting:
    '墾丁',

  liuqiu:
    '小琉球',

  'green-island':
    '綠島',

  lanyu:
    '蘭嶼',

  taitung:
    '台東',

  penghu:
    '澎湖',
}

const REGION_SEARCH_TERMS:
  Record<
    string,
    string
  > =
{
  taiwan:
    '台灣',

  northeast:
    '東北角 龍洞 鼻頭角',

  kenting:
    '墾丁 後壁湖',

  liuqiu:
    '小琉球',

  'green-island':
    '綠島',

  lanyu:
    '蘭嶼',

  taitung:
    '台東 東部海岸',

  penghu:
    '澎湖',
}


function regionSearchTerm(
  regionId:
    string
) {

  return (
    REGION_SEARCH_TERMS[
      regionId
    ] ??
    REGION_NAMES[
      regionId
    ] ??
    '台灣'
  )

}



// ============================================================
// Fallback news
//
// These are intentionally minimal. They keep the UI useful if
// Google News is temporarily unavailable.
// ============================================================

const FALLBACK_NEWS:
  SightingItem[] =
[
  {
    id:
      'fallback-green-island-whale-shark-2026-08-16',

    kind:
      'news',

    category:
      'whale-shark',

    speciesLabel:
      '鯨鯊',

    title:
      '綠島大多莉礁水下約 5 公尺目擊鯨鯊',

    regionId:
      'green-island',

    regionName:
      '綠島',

    locationLabel:
      '大多莉礁',

    date:
      '2026-08-16T00:00:00+08:00',

    count:
      1,

    latitude:
      null,

    longitude:
      null,

    sourceName:
      '公視新聞網',

    url:
      'https://news.pts.org.tw/article/822908',
  },

  {
    id:
      'fallback-green-island-batfish-2026-06-30',

    kind:
      'news',

    category:
      'school',

    speciesLabel:
      '尖翅燕魚群',

    title:
      '綠島鋼鐵礁再現約 40 隻尖翅燕魚群',

    regionId:
      'green-island',

    regionName:
      '綠島',

    locationLabel:
      '鋼鐵礁',

    date:
      '2026-06-30T00:00:00+08:00',

    count:
      40,

    latitude:
      null,

    longitude:
      null,

    sourceName:
      '公視新聞網',

    url:
      'https://news.pts.org.tw/article/815737',
  },
]


// ============================================================
// Utility
// ============================================================

function getCached<T>(
  key:
    string
):
  T |
  null {

  const entry =
    cache.get(
      key
    )


  if (
    !entry
  ) {
    return null
  }


  if (
    Date.now() -
      entry.at >
    CACHE_TTL_MS
  ) {

    cache.delete(
      key
    )

    return null

  }


  return entry.value as T

}


function setCached<T>(
  key:
    string,
  value:
    T
) {

  cache.set(
    key,
    {
      at:
        Date.now(),

      value,
    }
  )

}


function htmlDecode(
  input:
    string
) {

  return input
    .replace(
      /<!\[CDATA\[([\s\S]*?)\]\]>/g,
      '$1'
    )
    .replace(
      /&amp;/g,
      '&'
    )
    .replace(
      /&quot;/g,
      '"'
    )
    .replace(
      /&#39;|&apos;/g,
      "'"
    )
    .replace(
      /&lt;/g,
      '<'
    )
    .replace(
      /&gt;/g,
      '>'
    )
    .replace(
      /&#x2F;/g,
      '/'
    )
    .trim()

}


function stripTags(
  input:
    string
) {

  return htmlDecode(
    input.replace(
      /<[^>]+>/g,
      ' '
    )
  )
    .replace(
      /\s+/g,
      ' '
    )
    .trim()

}


function safeNumber(
  value:
    unknown
):
  number |
  null {

  const number =
    Number(
      value
    )


  return Number.isFinite(
    number
  )
    ? number
    : null

}


function normalizeDate(
  value:
    unknown
):
  string |
  null {

  if (
    typeof value !==
      'string' ||
    !value.trim()
  ) {
    return null
  }


  const input =
    value
      .trim()
      .replace(
        /\//g,
        '-'
      )


  const timestamp =
    Date.parse(
      input
    )


  if (
    !Number.isFinite(
      timestamp
    )
  ) {
    return null
  }


  return new Date(
    timestamp
  )
    .toISOString()

}


function ageDays(
  iso:
    string
) {

  const timestamp =
    Date.parse(
      iso
    )


  if (
    !Number.isFinite(
      timestamp
    )
  ) {
    return Number.POSITIVE_INFINITY
  }


  return (
    Date.now() -
    timestamp
  ) /
    86400000

}


// ============================================================
// CSV
// ============================================================

function parseCsv(
  text:
    string
) {

  const rows:
    string[][] =
    []


  let row:
    string[] =
    []

  let cell =
    ''

  let quoted =
    false


  for (
    let index =
      0;
    index <
      text.length;
    index +=
      1
  ) {

    const char =
      text[
        index
      ]


    if (
      quoted
    ) {

      if (
        char ===
          '"' &&
        text[
          index +
          1
        ] ===
          '"'
      ) {

        cell +=
          '"'

        index +=
          1

      } else if (
        char ===
        '"'
      ) {

        quoted =
          false

      } else {

        cell +=
          char

      }

      continue

    }


    if (
      char ===
      '"'
    ) {

      quoted =
        true

      continue

    }


    if (
      char ===
      ','
    ) {

      row.push(
        cell
      )

      cell =
        ''

      continue

    }


    if (
      char ===
        '\n' ||
      char ===
        '\r'
    ) {

      if (
        char ===
          '\r' &&
        text[
          index +
          1
        ] ===
          '\n'
      ) {
        index +=
          1
      }


      row.push(
        cell
      )

      cell =
        ''


      if (
        row.some(
          value =>
            value.trim()
        )
      ) {

        rows.push(
          row
        )

      }


      row =
        []

      continue

    }


    cell +=
      char

  }


  if (
    cell ||
    row.length
  ) {

    row.push(
      cell
    )

    rows.push(
      row
    )

  }


  if (
    rows.length <
    2
  ) {
    return []
  }


  const headers =
    rows[
      0
    ]
      .map(
        header =>
          header
            .replace(
              /^\uFEFF/,
              ''
            )
            .trim()
      )


  return rows
    .slice(
      1
    )
    .map(
      values => {

        const record:
          Record<
            string,
            string
          > =
          {}


        headers.forEach(
          (
            header,
            index
          ) => {

            record[
              header
            ] =
              values[
                index
              ] ??
              ''

          }
        )


        return record

      }
    )

}


// ============================================================
// Region mapping
// ============================================================

function detectRegionFromText(
  text:
    string
):
  string |
  null {

  const value =
    text
      .toLowerCase()


  const rules:
    Array<
      [
        string,
        string[]
      ]
    > =
  [
    [
      'green-island',
      [
        '綠島',
        'green island',
        '鋼鐵礁',
        '柴口',
        '石朗',
        '大多莉',
      ],
    ],

    [
      'lanyu',
      [
        '蘭嶼',
        'orchid island',
        '椰油',
        '野銀',
      ],
    ],

    [
      'liuqiu',
      [
        '小琉球',
        '琉球',
        'xiaoliuqiu',
      ],
    ],

    [
      'kenting',
      [
        '墾丁',
        '後壁湖',
        '萬里桐',
        '恆春',
        'kenting',
      ],
    ],

    [
      'penghu',
      [
        '澎湖',
        'penghu',
      ],
    ],

    [
      'northeast',
      [
        '東北角',
        '龍洞',
        '鼻頭角',
        '瑞芳',
        '貢寮',
        '潮境',
        '基隆',
      ],
    ],

    [
      'taitung',
      [
        '台東',
        '臺東',
        '東部海岸',
        '杉原',
        '石梯坪',
        'taitung',
      ],
    ],
  ]


  for (
    const [
      regionId,
      keywords,
    ] of rules
  ) {

    if (
      keywords.some(
        keyword =>
          value.includes(
            keyword.toLowerCase()
          )
      )
    ) {

      return regionId

    }

  }


  return null

}


function detectRegionFromCoordinate(
  latitude:
    number |
    null,
  longitude:
    number |
    null
):
  string {

  if (
    latitude ===
      null ||
    longitude ===
      null
  ) {
    return 'taiwan'
  }


  // Offshore islands first.

  if (
    latitude >=
      22.56 &&
    latitude <=
      22.78 &&
    longitude >=
      121.42 &&
    longitude <=
      121.60
  ) {
    return 'green-island'
  }


  if (
    latitude >=
      21.86 &&
    latitude <=
      22.18 &&
    longitude >=
      121.43 &&
    longitude <=
      121.68
  ) {
    return 'lanyu'
  }


  if (
    latitude >=
      22.22 &&
    latitude <=
      22.42 &&
    longitude >=
      120.28 &&
    longitude <=
      120.47
  ) {
    return 'liuqiu'
  }


  if (
    latitude >=
      23.15 &&
    latitude <=
      24.05 &&
    longitude >=
      119.10 &&
    longitude <=
      119.85
  ) {
    return 'penghu'
  }


  if (
    latitude >=
      24.85 &&
    latitude <=
      25.35 &&
    longitude >=
      121.62 &&
    longitude <=
      122.20
  ) {
    return 'northeast'
  }


  if (
    latitude >=
      21.78 &&
    latitude <=
      22.20 &&
    longitude >=
      120.62 &&
    longitude <=
      121.08
  ) {
    return 'kenting'
  }


  if (
    latitude >=
      22.05 &&
    latitude <=
      23.65 &&
    longitude >=
      120.90 &&
    longitude <=
      121.70
  ) {
    return 'taitung'
  }


  return 'taiwan'

}


// ============================================================
// Species classification
// ============================================================

function classifySighting(
  input:
    string
): {
  category:
    SightingCategory

  speciesLabel:
    string
} |
  null {

  const text =
    input.toLowerCase()


  if (
    text.includes(
      'rhincodon'
    ) ||
    text.includes(
      'whale shark'
    ) ||
    text.includes(
      '鯨鯊'
    )
  ) {
    return {
      category:
        'whale-shark',

      speciesLabel:
        '鯨鯊',
    }
  }


  if (
    text.includes(
      'mobula'
    ) ||
    text.includes(
      'manta'
    ) ||
    text.includes(
      '鬼蝠魟'
    ) ||
    text.includes(
      '蝠魟'
    )
  ) {
    return {
      category:
        'manta',

      speciesLabel:
        '鬼蝠魟',
    }
  }


  if (
    text.includes(
      'mola mola'
    ) ||
    text.includes(
      'sunfish'
    ) ||
    text.includes(
      '翻車魚'
    )
  ) {
    return {
      category:
        'sunfish',

      speciesLabel:
        '翻車魚',
    }
  }


  if (
    text.includes(
      '鯨豚'
    ) ||
    text.includes(
      '鯨魚'
    ) ||
    text.includes(
      '海豚'
    ) ||
    text.includes(
      'dolphin'
    ) ||
    text.includes(
      'whale'
    ) ||
    text.includes(
      'cetace'
    )
  ) {
    return {
      category:
        'cetacean',

      speciesLabel:
        text.includes(
          '海豚'
        ) ||
        text.includes(
          'dolphin'
        )
          ? '海豚'
          : '鯨豚',
    }
  }


  if (
    text.includes(
      '鯊'
    ) ||
    text.includes(
      'shark'
    )
  ) {
    return {
      category:
        'shark',

      speciesLabel:
        '鯊魚',
    }
  }


  if (
    text.includes(
      '海龜'
    ) ||
    text.includes(
      'turtle'
    )
  ) {
    return {
      category:
        'turtle',

      speciesLabel:
        '海龜',
    }
  }


  if (
    text.includes(
      '魟'
    ) ||
    text.includes(
      'ray'
    )
  ) {
    return {
      category:
        'ray',

      speciesLabel:
        '大型魟魚',
    }
  }


  if (
    text.includes(
      '燕魚'
    ) ||
    text.includes(
      '魚群'
    ) ||
    text.includes(
      'school'
    )
  ) {
    return {
      category:
        'school',

      speciesLabel:
        '特殊魚群',
    }
  }


  return null

}


// ============================================================
// iOcean
// ============================================================

function firstValue(
  record:
    Record<
      string,
      string
    >,
  keys:
    string[]
) {

  for (
    const key of keys
  ) {

    const value =
      record[
        key
      ]


    if (
      typeof value ===
        'string' &&
      value.trim()
    ) {

      return value.trim()

    }

  }


  return ''

}


async function fetchOfficialSightings() {

  const cached =
    getCached<
      SightingItem[]
    >(
      'official'
    )


  if (
    cached
  ) {
    return cached
  }


  const response =
    await fetch(
      IOCEAN_CSV_URL,
      {
        headers: {
          Accept:
            'text/csv,text/plain,*/*',

          'User-Agent':
            'travel-v100-ocean-sightings',
        },
      }
    )


  if (
    !response.ok
  ) {

    throw new Error(
      `iOcean ${response.status}`
    )

  }


  const text =
    await response.text()


  let records:
    Record<
      string,
      string
    >[] =
    []


  const trimmed =
    text.trim()


  if (
    trimmed.startsWith(
      '['
    ) ||
    trimmed.startsWith(
      '{'
    )
  ) {

    try {

      const parsed =
        JSON.parse(
          trimmed
        )


      if (
        Array.isArray(
          parsed
        )
      ) {

        records =
          parsed

      } else {

        const candidates =
          Object.values(
            parsed
          )
            .find(
              value =>
                Array.isArray(
                  value
                )
            )


        if (
          Array.isArray(
            candidates
          )
        ) {
          records =
            candidates as
              Record<
                string,
                string
              >[]
        }

      }

    } catch {
      records =
        []
    }

  }


  if (
    !records.length
  ) {

    records =
      parseCsv(
        text
      )

  }


  const items =
    records
      .map(
        (
          record,
          index
        ):
          SightingItem |
          null => {

          const type =
            firstValue(
              record,
              [
                'OCA_Sightings_Type',
                '海洋生物類型',
                'Sightings_Type',
              ]
            )


          const species =
            firstValue(
              record,
              [
                'Species_Name',
                '海洋生物學名',
                'Species',
              ]
            )


          const code =
            firstValue(
              record,
              [
                'Name_Code',
                '物種學名代碼',
              ]
            )


          const classified =
            classifySighting(
              [
                type,
                species,
                code,
              ].join(
                ' '
              )
            )


          if (
            !classified
          ) {
            return null
          }


          const date =
            normalizeDate(
              firstValue(
                record,
                [
                  'Sightings_Time',
                  '目擊時間',
                ]
              )
            )


          if (
            !date
          ) {
            return null
          }


          const latitude =
            safeNumber(
              firstValue(
                record,
                [
                  'WGS84Y',
                  '緯度',
                ]
              )
            )


          const longitude =
            safeNumber(
              firstValue(
                record,
                [
                  'WGS84X',
                  '經度',
                ]
              )
            )


          const regionId =
            detectRegionFromCoordinate(
              latitude,
              longitude
            )


          const count =
            safeNumber(
              firstValue(
                record,
                [
                  'Sightings_Count',
                  '數量概估',
                ]
              )
            )


          const id =
            firstValue(
              record,
              [
                'ID',
                '編號',
              ]
            ) ||
            `official-${index}-${date}`


          return {
            id:
              `iocean-${id}`,

            kind:
              'official',

            category:
              classified.category,

            speciesLabel:
              classified.speciesLabel,

            title:
              `${classified.speciesLabel}目擊紀錄`,

            regionId,

            regionName:
              REGION_NAMES[
                regionId
              ] ??
              '台灣海域',

            locationLabel:
              REGION_NAMES[
                regionId
              ] ??
              '台灣海域',

            date,

            count,

            latitude,

            longitude,

            sourceName:
              'iOcean · 海洋保育署',

            url:
              IOCEAN_PUBLIC_REPORT_URL,
          }

        }
      )
      .filter(
        (
          item
        ):
          item is SightingItem =>
          Boolean(
            item
          )
      )
      .sort(
        (
          a,
          b
        ) =>
          Date.parse(
            b.date
          ) -
          Date.parse(
            a.date
          )
      )


  setCached(
    'official',
    items
  )


  return items

}


function stableTextHash(
  input:
    string
) {

  let hash =
    2166136261


  for (
    let index =
      0;
    index <
      input.length;
    index +=
      1
  ) {

    hash ^=
      input.charCodeAt(
        index
      )

    hash =
      Math.imul(
        hash,
        16777619
      )

  }


  return (
    hash >>>
    0
  )
    .toString(
      36
    )

}


// ============================================================
// News RSS
// ============================================================

function extractXmlTag(
  block:
    string,
  tag:
    string
) {

  const match =
    block.match(
      new RegExp(
        `<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`,
        'i'
      )
    )


  return match
    ? stripTags(
        match[
          1
        ]
      )
    : ''

}


function extractNewsSource(
  block:
    string
) {

  const match =
    block.match(
      /<source(?:\s[^>]*)?>([\s\S]*?)<\/source>/i
    )


  return match
    ? stripTags(
        match[
          1
        ]
      )
    : 'News'
}


function parseNewsRss(
  xml:
    string
) {

  return (
    xml.match(
      /<item>[\s\S]*?<\/item>/gi
    ) ??
    []
  )
    .map(
      block => ({
        title:
          extractXmlTag(
            block,
            'title'
          ),

        link:
          extractXmlTag(
            block,
            'link'
          ),

        pubDate:
          extractXmlTag(
            block,
            'pubDate'
          ),

        description:
          extractXmlTag(
            block,
            'description'
          ),

        source:
          extractNewsSource(
            block
          ),
      })
    )

}


const NEWS_QUERIES =
[
  '台灣 潛水 鯨鯊 when:90d',
  '台灣 潛水 鬼蝠魟 manta when:90d',
  '台灣 潛水 鯨魚 海豚 when:90d',
  '台灣 潛水 翻車魚 鯊魚 when:90d',
  '綠島 蘭嶼 潛水 魚群 when:90d',
]


async function fetchNewsSightings() {

  const cached =
    getCached<{
      items:
        SightingItem[]

      liveAvailable:
        boolean
    }>(
      'news'
    )


  if (
    cached
  ) {
    return cached
  }


  const responses =
    await Promise.allSettled(
      NEWS_QUERIES.map(
        async query => {

          const url =
            `${NEWS_SEARCH_URL}?q=${encodeURIComponent(
              query
            )}&hl=zh-TW&gl=TW&ceid=TW:zh-Hant`


          const response =
            await fetch(
              url,
              {
                headers: {
                  Accept:
                    'application/rss+xml,application/xml,text/xml,*/*',

                  'User-Agent':
                    'travel-v100-ocean-sightings',
                },
              }
            )


          if (
            !response.ok
          ) {

            throw new Error(
              `Google News ${response.status}`
            )

          }


          return parseNewsRss(
            await response.text()
          )

        }
      )
    )


  const rows =
    responses.flatMap(
      result =>
        result.status ===
          'fulfilled'
          ? result.value
          : []
    )


  const seen =
    new Set<
      string
    >()


  const items:
    SightingItem[] =
    []


  rows.forEach(
    (
      row,
      index
    ) => {

      const content =
        `${row.title} ${row.description}`


      const classified =
        classifySighting(
          content
        )


      if (
        !classified
      ) {
        return
      }


      const date =
        normalizeDate(
          row.pubDate
        )


      if (
        !date ||
        ageDays(
          date
        ) >
          120
      ) {
        return
      }


      const normalizedTitle =
        row.title
          .replace(
            /\s+/g,
            ' '
          )
          .trim()


      const dedupeKey =
        normalizedTitle
          .toLowerCase()


      if (
        seen.has(
          dedupeKey
        )
      ) {
        return
      }


      seen.add(
        dedupeKey
      )


      const regionId =
        detectRegionFromText(
          content
        ) ??
        'taiwan'


      items.push({
        id:
          `news-${index}-${stableTextHash(
            dedupeKey
          )}`,

        kind:
          'news',

        category:
          classified.category,

        speciesLabel:
          classified.speciesLabel,

        title:
          normalizedTitle,

        regionId,

        regionName:
          REGION_NAMES[
            regionId
          ] ??
          '全台',

        locationLabel:
          REGION_NAMES[
            regionId
          ] ??
          '台灣海域',

        date,

        count:
          null,

        latitude:
          null,

        longitude:
          null,

        sourceName:
          row.source,

        url:
          row.link ||
          null,
      })

    }
  )


  const merged =
    [
      ...items,
      ...FALLBACK_NEWS,
    ]
      .filter(
        (
          item,
          index,
          all
        ) =>
          all.findIndex(
            candidate =>
              candidate.title
                .toLowerCase() ===
              item.title
                .toLowerCase()
          ) ===
          index
      )
      .sort(
        (
          a,
          b
        ) =>
          Date.parse(
            b.date
          ) -
          Date.parse(
            a.date
          )
      )


  const result = {
    items:
      merged,

    liveAvailable:
      rows.length >
      0,
  }


  setCached(
    'news',
    result
  )


  return result

}


// ============================================================
// Threads Social Search
// ============================================================

type ThreadsPost = {
  id?: string
  permalink?: string
  username?: string
  text?: string
  timestamp?: string
  media_type?: string
  thumbnail_url?: string
}


async function fetchThreadsSightings(
  regionId:
    string,
  days:
    number
) {

  if (
    !threadsAccessToken
  ) {
    return []
  }


  const cacheKey =
    `threads:${regionId}:${days}`


  const cached =
    getCached<
      SightingItem[]
    >(
      cacheKey
    )


  if (
    cached
  ) {
    return cached
  }


  const region =
    regionSearchTerm(
      regionId
    )


  const since =
    new Date(
      Date.now() -
      days *
      86400000
    )
      .toISOString()


  const queries =
    [
      `${region} 鯨鯊`,
      `${region} 鬼蝠魟 manta`,
      `${region} 潛水 海豚 鯊魚`,
    ]


  const responses =
    await Promise.allSettled(
      queries.map(
        async query => {

          const params =
            new URLSearchParams({
              q:
                query,

              search_type:
                'RECENT',

              search_mode:
                'KEYWORD',

              fields:
                'id,permalink,username,text,timestamp,media_type,thumbnail_url',

              limit:
                '25',

              since,
            })


          const response =
            await fetch(
              `${THREADS_API_HOST}/keyword_search?${params.toString()}`,
              {
                headers: {
                  Accept:
                    'application/json',

                  Authorization:
                    `Bearer ${threadsAccessToken}`,
                },
              }
            )


          if (
            !response.ok
          ) {
            throw new Error(
              `Threads ${response.status}`
            )
          }


          const body =
            await response.json() as {
              data?: ThreadsPost[]
            }


          return body.data ??
            []

        }
      )
    )


  const seen =
    new Set<
      string
    >()


  const items:
    SightingItem[] =
    []


  responses.forEach(
    result => {

      if (
        result.status !==
        'fulfilled'
      ) {
        return
      }


      result.value.forEach(
        post => {

          const postText =
            (
              post.text ??
              ''
            )
              .replace(
                /\s+/g,
                ' '
              )
              .trim()


          if (
            !postText
          ) {
            return
          }


          const classified =
            classifySighting(
              postText
            )


          if (
            !classified
          ) {
            return
          }


          const date =
            normalizeDate(
              post.timestamp
            )


          if (
            !date ||
            ageDays(
              date
            ) >
              days
          ) {
            return
          }


          const key =
            post.id ??
            post.permalink ??
            `${post.username}-${date}-${postText.slice(0, 24)}`


          if (
            seen.has(
              key
            )
          ) {
            return
          }


          seen.add(
            key
          )


          const detectedRegion =
            detectRegionFromText(
              postText
            )


          const actualRegion =
            detectedRegion ??
            regionId


          items.push({
            id:
              `threads-${key}`,

            kind:
              'threads',

            category:
              classified.category,

            speciesLabel:
              classified.speciesLabel,

            title:
              postText.length >
                120
                ? `${postText.slice(0, 117)}...`
                : postText,

            regionId:
              actualRegion,

            regionName:
              REGION_NAMES[
                actualRegion
              ] ??
              '台灣海域',

            locationLabel:
              REGION_NAMES[
                actualRegion
              ] ??
              '台灣海域',

            date,

            count:
              null,

            latitude:
              null,

            longitude:
              null,

            sourceName:
              'Threads',

            authorName:
              post.username
                ? `@${post.username}`
                : null,

            thumbnailUrl:
              post.thumbnail_url ??
              null,

            url:
              post.permalink ??
              null,
          })

        }
      )

    }
  )


  items.sort(
    (
      a,
      b
    ) =>
      Date.parse(
        b.date
      ) -
      Date.parse(
        a.date
      )
  )


  setCached(
    cacheKey,
    items
  )


  return items

}


// ============================================================
// YouTube Social Search
// ============================================================

type YouTubeSearchItem = {
  id?: {
    videoId?: string
  }

  snippet?: {
    publishedAt?: string
    channelTitle?: string
    title?: string
    description?: string

    thumbnails?: {
      medium?: {
        url?: string
      }

      default?: {
        url?: string
      }
    }
  }
}


async function fetchYouTubeSightings(
  regionId:
    string,
  days:
    number
) {

  if (
    !youtubeApiKey
  ) {
    return []
  }


  const cacheKey =
    `youtube:${regionId}:${days}`


  const cached =
    getCached<
      SightingItem[]
    >(
      cacheKey
    )


  if (
    cached
  ) {
    return cached
  }


  const region =
    regionSearchTerm(
      regionId
    )


  const publishedAfter =
    new Date(
      Date.now() -
      days *
      86400000
    )
      .toISOString()


  const params =
    new URLSearchParams({
      part:
        'snippet',

      type:
        'video',

      q:
        `${region} 潛水 鯨鯊|鬼蝠魟|manta|鯊魚|海豚|翻車魚`,

      maxResults:
        '25',

      order:
        'date',

      publishedAfter,

      regionCode:
        'TW',

      relevanceLanguage:
        'zh-Hant',

      safeSearch:
        'moderate',

      key:
        youtubeApiKey,
    })


  const response =
    await fetch(
      `${YOUTUBE_SEARCH_URL}?${params.toString()}`,
      {
        headers: {
          Accept:
            'application/json',
        },
      }
    )


  if (
    !response.ok
  ) {
    throw new Error(
      `YouTube ${response.status}`
    )
  }


  const body =
    await response.json() as {
      items?: YouTubeSearchItem[]
    }


  const items:
    SightingItem[] =
    []


  ;(
    body.items ??
    []
  ).forEach(
    (
      item,
      index
    ) => {

      const videoId =
        item.id
          ?.videoId


      const snippet =
        item.snippet


      if (
        !videoId ||
        !snippet
      ) {
        return
      }


      const title =
        htmlDecode(
          snippet.title ??
          ''
        )


      const description =
        htmlDecode(
          snippet.description ??
          ''
        )


      const content =
        `${title} ${description}`


      const classified =
        classifySighting(
          content
        )


      if (
        !classified
      ) {
        return
      }


      const date =
        normalizeDate(
          snippet.publishedAt
        )


      if (
        !date
      ) {
        return
      }


      const detectedRegion =
        detectRegionFromText(
          content
        )


      const actualRegion =
        detectedRegion ??
        regionId


      items.push({
        id:
          `youtube-${videoId}-${index}`,

        kind:
          'youtube',

        category:
          classified.category,

        speciesLabel:
          classified.speciesLabel,

        title,

        regionId:
          actualRegion,

        regionName:
          REGION_NAMES[
            actualRegion
          ] ??
          '台灣海域',

        locationLabel:
          REGION_NAMES[
            actualRegion
          ] ??
          '台灣海域',

        date,

        count:
          null,

        latitude:
          null,

        longitude:
          null,

        sourceName:
          'YouTube',

        authorName:
          snippet.channelTitle ??
          null,

        thumbnailUrl:
          snippet.thumbnails
            ?.medium
            ?.url ??
          snippet.thumbnails
            ?.default
            ?.url ??
          null,

        url:
          `https://www.youtube.com/watch?v=${videoId}`,
      })

    }
  )


  items.sort(
    (
      a,
      b
    ) =>
      Date.parse(
        b.date
      ) -
      Date.parse(
        a.date
      )
  )


  setCached(
    cacheKey,
    items
  )


  return items

}


// ============================================================
// API
// ============================================================

function createHandler() {

  return async (
    req:
      any,
    res:
      any,
    next:
      any
  ) => {

    const requestUrl =
      req.url ??
      ''


    if (
      !requestUrl.startsWith(
        '/api/ocean/sightings'
      )
    ) {

      next()

      return

    }


    const url =
      new URL(
        requestUrl,
        'http://localhost'
      )


    const requestedRegionId =
      url.searchParams.get(
        'regionId'
      ) ??
      'taiwan'


    const limit =
      Math.max(
        1,
        Math.min(
          20,
          Number(
            url.searchParams.get(
              'limit'
            ) ??
            8
          ) ||
          8
        )
      )


    const days =
      Math.max(
        7,
        Math.min(
          365,
          Number(
            url.searchParams.get(
              'days'
            ) ??
            120
          ) ||
          120
        )
      )


    let official:
      SightingItem[] =
      []

    let news:
      SightingItem[] =
      []

    let threads:
      SightingItem[] =
      []

    let youtube:
      SightingItem[] =
      []

    let officialAvailable =
      false

    let newsAvailable =
      false

    let threadsAvailable =
      false

    let youtubeAvailable =
      false


    const [
      officialResult,
      newsResult,
      threadsResult,
      youtubeResult,
    ] =
      await Promise.allSettled([
        fetchOfficialSightings(),
        fetchNewsSightings(),
        fetchThreadsSightings(
          requestedRegionId,
          days
        ),
        fetchYouTubeSightings(
          requestedRegionId,
          days
        ),
      ])


    if (
      officialResult.status ===
      'fulfilled'
    ) {

      official =
        officialResult.value

      officialAvailable =
        true

    }


    if (
      newsResult.status ===
      'fulfilled'
    ) {

      news =
        newsResult.value
          .items

      newsAvailable =
        newsResult.value
          .liveAvailable

    } else {

      news =
        FALLBACK_NEWS

    }


    if (
      threadsResult.status ===
      'fulfilled'
    ) {

      threads =
        threadsResult.value

      threadsAvailable =
        Boolean(
          threadsAccessToken
        )

    }


    if (
      youtubeResult.status ===
      'fulfilled'
    ) {

      youtube =
        youtubeResult.value

      youtubeAvailable =
        Boolean(
          youtubeApiKey
        )

    }


    const cutoff =
      Date.now() -
      days *
      86400000


    const allRecent =
      [
        ...official,
        ...threads,
        ...youtube,
        ...news,
      ]
        .filter(
          item =>
            Date.parse(
              item.date
            ) >=
            cutoff
        )
        .filter(
          (
            item,
            index,
            all
          ) =>
            all.findIndex(
              candidate =>
                (
                  candidate.url &&
                  item.url
                    ? candidate.url ===
                      item.url
                    : candidate.title
                        .toLowerCase() ===
                      item.title
                        .toLowerCase()
                )
            ) ===
            index
        )
        .sort(
          (
            a,
            b
          ) => {

            // Official observations win a tie.
            const dateDiff =
              Date.parse(
                b.date
              ) -
              Date.parse(
                a.date
              )


            if (
              dateDiff !==
              0
            ) {
              return dateDiff
            }


            const priority:
              Record<
                SightingItem[
                  'kind'
                ],
                number
              > =
            {
              official:
                0,

              threads:
                1,

              youtube:
                2,

              news:
                3,
            }


            return (
              priority[
                a.kind
              ] -
              priority[
                b.kind
              ]
            )

          }
        )


    const regionItems =
      requestedRegionId ===
        'taiwan'
        ? allRecent
        : allRecent.filter(
            item =>
              item.regionId ===
                requestedRegionId
          )


    const fallbackToTaiwan =
      requestedRegionId !==
        'taiwan' &&
      regionItems.length ===
        0


    const usedRegionId =
      fallbackToTaiwan
        ? 'taiwan'
        : requestedRegionId


    const items =
      (
        fallbackToTaiwan
          ? allRecent
          : regionItems
      )
        .slice(
          0,
          limit
        )


    res.statusCode =
      200

    res.setHeader(
      'Content-Type',
      'application/json; charset=utf-8'
    )

    res.setHeader(
      'Cache-Control',
      'no-store'
    )


    res.end(
      JSON.stringify({
        success:
          true,

        updatedAt:
          new Date()
            .toISOString(),

        requestedRegionId,

        usedRegionId,

        fallbackToTaiwan,

        officialAvailable,

        newsAvailable,

        threadsConfigured:
          Boolean(
            threadsAccessToken
          ),

        threadsAvailable,

        youtubeConfigured:
          Boolean(
            youtubeApiKey
          ),

        youtubeAvailable,

        items,
      })
    )

  }

}


export default function oceanSightingsPlugin():
  Plugin {

  return {
    name:
      'travel-v100-ocean-sightings',

    configResolved(
      config:
        ResolvedConfig
    ) {

      const env =
        loadEnv(
          config.mode,
          config.root,
          ''
        )


      threadsAccessToken =
        env.THREADS_ACCESS_TOKEN ??
        ''


      youtubeApiKey =
        env.YOUTUBE_API_KEY ??
        ''

    },

    configureServer(
      server
    ) {

      server.middlewares.use(
        createHandler()
      )

    },

    configurePreviewServer(
      server
    ) {

      server.middlewares.use(
        createHandler()
      )

    },
  }

}
