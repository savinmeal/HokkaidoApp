export type SkiResortMapRecord = {
  id: string
  resortId: string
  resortName: string
  shortName: string
  region: string
  imageId?: string
  updatedAt: number
}


export const SKI_RESORT_MAP_STORAGE_KEY =
  'travel_v100_ski_resort_maps_v1'


const DB_NAME =
  'travel_v100_ski_resort_maps_db'

const DB_VERSION =
  1

const STORE_NAME =
  'trailMapImages'


type StoredImage = {
  id: string
  blob: Blob
  fileName: string
  mimeType: string
  createdAt: number
}


export const DEFAULT_SKI_RESORT_MAPS:
  SkiResortMapRecord[] =
[
  {
    id:
      'furano',

    resortId:
      'furano',

    resortName:
      '富良野滑雪場',

    shortName:
      'FURANO',

    region:
      '富良野',

    updatedAt:
      0,
  },

  {
    id:
      'kamui',

    resortId:
      'kamui',

    resortName:
      'KAMUI SKI LINKS',

    shortName:
      'KAMUI',

    region:
      '旭川',

    updatedAt:
      0,
  },

  {
    id:
      'teine',

    resortId:
      'teine',

    resortName:
      'SAPPORO TEINE',

    shortName:
      'TEINE',

    region:
      '札幌',

    updatedAt:
      0,
  },

  {
    id:
      'kokusai',

    resortId:
      'kokusai',

    resortName:
      '札幌國際滑雪場',

    shortName:
      'KOKUSAI',

    region:
      '札幌',

    updatedAt:
      0,
  },

  {
    id:
      'tenguyama',

    resortId:
      'tenguyama',

    resortName:
      '小樽天狗山',

    shortName:
      'TENGU',

    region:
      '小樽',

    updatedAt:
      0,
  },

  {
    id:
      'asarigawa',

    resortId:
      'asarigawa',

    resortName:
      '朝里川溫泉滑雪場',

    shortName:
      'ASARI',

    region:
      '小樽',

    updatedAt:
      0,
  },

  {
    id:
      'grand-hirafu',

    resortId:
      'grand-hirafu',

    resortName:
      'Niseko Grand Hirafu',

    shortName:
      'HIRAFU',

    region:
      '二世古',

    updatedAt:
      0,
  },

  {
    id:
      'hanazono',

    resortId:
      'hanazono',

    resortName:
      'Niseko Hanazono',

    shortName:
      'HANAZONO',

    region:
      '二世古',

    updatedAt:
      0,
  },
]


function openDb():
  Promise<IDBDatabase> {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      const request =
        indexedDB.open(
          DB_NAME,
          DB_VERSION
        )


      request.onupgradeneeded =
        () => {

          const db =
            request.result


          if (
            !db.objectStoreNames.contains(
              STORE_NAME
            )
          ) {

            db.createObjectStore(
              STORE_NAME,
              {
                keyPath:
                  'id',
              }
            )

          }

        }


      request.onsuccess =
        () => {
          resolve(
            request.result
          )
        }


      request.onerror =
        () => {
          reject(
            request.error
          )
        }

    }
  )

}


function createImageId() {

  if (
    typeof crypto !==
      'undefined' &&
    'randomUUID' in crypto
  ) {
    return crypto.randomUUID()
  }


  return (
    `trail-map-${Date.now()}-` +
    Math.random()
      .toString(36)
      .slice(2, 8)
  )

}


export function loadSkiResortMaps():
  SkiResortMapRecord[] {

  try {

    const saved =
      localStorage.getItem(
        SKI_RESORT_MAP_STORAGE_KEY
      )


    if (!saved) {

      return (
        DEFAULT_SKI_RESORT_MAPS.map(
          item => ({
            ...item,
          })
        )
      )

    }


    const parsed =
      JSON.parse(
        saved
      ) as
        SkiResortMapRecord[]


    const savedMap =
      new Map(
        parsed.map(
          item => [
            item.resortId,
            item,
          ]
        )
      )


    return (
      DEFAULT_SKI_RESORT_MAPS.map(
        item =>
          savedMap.get(
            item.resortId
          ) ?? {
            ...item,
          }
      )
    )

  } catch (error) {

    console.error(
      'Ski resort maps load failed:',
      error
    )


    return (
      DEFAULT_SKI_RESORT_MAPS.map(
        item => ({
          ...item,
        })
      )
    )

  }

}


export function saveSkiResortMaps(
  records:
    SkiResortMapRecord[]
) {

  try {

    localStorage.setItem(
      SKI_RESORT_MAP_STORAGE_KEY,
      JSON.stringify(
        records
      )
    )

  } catch (error) {

    console.error(
      'Ski resort maps metadata save failed:',
      error
    )

  }

}


export async function saveTrailMapImage(
  file: File
):
  Promise<string> {

  const db =
    await openDb()


  const id =
    createImageId()


  const record:
    StoredImage =
  {
    id,
    blob:
      file,
    fileName:
      file.name,
    mimeType:
      file.type,
    createdAt:
      Date.now(),
  }


  await new Promise<void>(
    (
      resolve,
      reject
    ) => {

      const tx =
        db.transaction(
          STORE_NAME,
          'readwrite'
        )


      tx
        .objectStore(
          STORE_NAME
        )
        .put(
          record
        )


      tx.oncomplete =
        () => {
          resolve()
        }


      tx.onerror =
        () => {
          reject(
            tx.error
          )
        }

    }
  )


  db.close()


  return id

}


export async function getTrailMapImage(
  id: string
):
  Promise<Blob | null> {

  const db =
    await openDb()


  const result =
    await new Promise<
      StoredImage |
      undefined
    >(
      (
        resolve,
        reject
      ) => {

        const request =
          db.transaction(
            STORE_NAME,
            'readonly'
          )
            .objectStore(
              STORE_NAME
            )
            .get(
              id
            )


        request.onsuccess =
          () => {
            resolve(
              request.result as
                | StoredImage
                | undefined
            )
          }


        request.onerror =
          () => {
            reject(
              request.error
            )
          }

      }
    )


  db.close()


  return (
    result?.blob ??
    null
  )

}


export async function deleteTrailMapImage(
  id: string
) {

  const db =
    await openDb()


  await new Promise<void>(
    (
      resolve,
      reject
    ) => {

      const tx =
        db.transaction(
          STORE_NAME,
          'readwrite'
        )


      tx
        .objectStore(
          STORE_NAME
        )
        .delete(
          id
        )


      tx.oncomplete =
        () => {
          resolve()
        }


      tx.onerror =
        () => {
          reject(
            tx.error
          )
        }

    }
  )


  db.close()

}
