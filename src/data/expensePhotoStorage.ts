// ============================================================
// Expense Photo Storage
//
// 照片使用 IndexedDB 儲存 Blob，避免把大型 Base64 圖片塞進
// localStorage。
// ============================================================

const DB_NAME =
  'travel_v100_expense_photo_db'

const DB_VERSION =
  1

const STORE_NAME =
  'expensePhotos'


type ExpensePhotoRecord = {
  id: string
  blob: Blob
  fileName: string
  mimeType: string
  createdAt: number
}


function createPhotoId() {

  if (
    typeof crypto !== 'undefined' &&
    'randomUUID' in crypto
  ) {
    return crypto.randomUUID()
  }


  return (
    `expense-photo-${Date.now()}-` +
    Math.random()
      .toString(36)
      .slice(2, 9)
  )

}


function openExpensePhotoDb():
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


export async function saveExpensePhoto(
  file: File
):
  Promise<string> {

  const db =
    await openExpensePhotoDb()


  const id =
    createPhotoId()


  const record:
    ExpensePhotoRecord =
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


      const store =
        transaction.objectStore(
          STORE_NAME
        )


      store.put(
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


export async function getExpensePhotoBlob(
  id: string
):
  Promise<Blob | null> {

  const db =
    await openExpensePhotoDb()


  const result =
    await new Promise<
      ExpensePhotoRecord |
      undefined
    >(
      (
        resolve,
        reject
      ) => {

        const transaction =
          db.transaction(
            STORE_NAME,
            'readonly'
          )


        const request =
          transaction
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
                | ExpensePhotoRecord
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


export async function deleteExpensePhoto(
  id: string
):
  Promise<void> {

  const db =
    await openExpensePhotoDb()


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


export async function deleteExpensePhotos(
  ids: string[]
):
  Promise<void> {

  await Promise.all(
    ids.map(
      id =>
        deleteExpensePhoto(
          id
        )
    )
  )

}