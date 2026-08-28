// ============================================================
// Snow Pass / Ticket Storage
// ============================================================

export type TicketType =
  | 'ski'
  | 'train'
  | 'flight'


export type SnowPassRecord = {
  id: string
  name: string
  photoId: string
  createdAt: number

  // Optional for backward compatibility.
  // Older records without this field are treated as ski tickets.
  ticketType?: TicketType
}


export const SNOW_PASS_STORAGE_KEY =
  'travel_v100_snow_passes_v1'


const DB_NAME =
  'travel_v100_home_media_db'

const DB_VERSION =
  1

const STORE_NAME =
  'snowPassPhotos'


type SnowPassPhotoRecord = {
  id: string
  blob: Blob
  fileName: string
  mimeType: string
  createdAt: number
}


function createId(
  prefix: string
) {

  if (
    typeof crypto !== 'undefined' &&
    'randomUUID' in crypto
  ) {
    return crypto.randomUUID()
  }


  return (
    `${prefix}-${Date.now()}-` +
    Math.random()
      .toString(36)
      .slice(2, 9)
  )

}


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


export function loadSnowPasses():
  SnowPassRecord[] {

  try {

    const saved =
      localStorage.getItem(
        SNOW_PASS_STORAGE_KEY
      )


    if (!saved) {
      return []
    }


    const parsed =
      JSON.parse(
        saved
      ) as
        SnowPassRecord[]


    if (
      !Array.isArray(
        parsed
      )
    ) {
      return []
    }


    // Backward compatibility:
    // all old records are ski tickets.
    return parsed.map(
      record => ({
        ...record,

        ticketType:
          record.ticketType ??
          'ski',
      })
    )

  } catch (error) {

    console.error(
      'Ticket load failed:',
      error
    )


    return []

  }

}


export function saveSnowPasses(
  records:
    SnowPassRecord[]
) {

  try {

    localStorage.setItem(
      SNOW_PASS_STORAGE_KEY,
      JSON.stringify(
        records
      )
    )

  } catch (error) {

    console.error(
      'Ticket metadata save failed:',
      error
    )

  }

}


export async function saveSnowPassPhoto(
  file: File
):
  Promise<string> {

  const db =
    await openDb()


  const id =
    createId(
      'snow-pass-photo'
    )


  const record:
    SnowPassPhotoRecord =
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

      const transaction =
        db.transaction(
          STORE_NAME,
          'readwrite'
        )


      transaction
        .objectStore(
          STORE_NAME
        )
        .put(
          record
        )


      transaction.oncomplete =
        () => {
          resolve()
        }


      transaction.onerror =
        () => {
          reject(
            transaction.error
          )
        }

    }
  )


  db.close()


  return id

}


export async function getSnowPassPhoto(
  id: string
):
  Promise<Blob | null> {

  const db =
    await openDb()


  const result =
    await new Promise<
      SnowPassPhotoRecord |
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
                | SnowPassPhotoRecord
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


export async function deleteSnowPassPhoto(
  id: string
) {

  const db =
    await openDb()


  await new Promise<void>(
    (
      resolve,
      reject
    ) => {

      const transaction =
        db.transaction(
          STORE_NAME,
          'readwrite'
        )


      transaction
        .objectStore(
          STORE_NAME
        )
        .delete(
          id
        )


      transaction.oncomplete =
        () => {
          resolve()
        }


      transaction.onerror =
        () => {
          reject(
            transaction.error
          )
        }

    }
  )


  db.close()

}


export function createSnowPassRecord(
  name: string,
  photoId: string,
  ticketType:
    TicketType =
      'ski'
):
  SnowPassRecord {

  return {
    id:
      createId(
        'ticket'
      ),

    ticketType,

    name:
      name.trim(),

    photoId,

    createdAt:
      Date.now(),
  }

}
