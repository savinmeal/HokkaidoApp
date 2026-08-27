import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react'

import {
  createPortal,
} from 'react-dom'

import {
  createSnowPassRecord,
  deleteSnowPassPhoto,
  getSnowPassPhoto,
  loadSnowPasses,
  saveSnowPasses,
  saveSnowPassPhoto,
  type SnowPassRecord,
} from '../data/snowPassStorage'


// ============================================================
// Photo Hook
// ============================================================

function useSnowPassPhotoUrl(
  photoId:
    string |
    undefined
) {

  const [
    url,
    setUrl,
  ] = useState<string | null>(
    null
  )


  useEffect(() => {

    let cancelled =
      false

    let objectUrl:
      string |
      null =
      null


    const load =
      async () => {

        if (!photoId) {
          setUrl(null)
          return
        }


        try {

          const blob =
            await getSnowPassPhoto(
              photoId
            )


          if (
            !blob ||
            cancelled
          ) {
            return
          }


          objectUrl =
            URL.createObjectURL(
              blob
            )


          setUrl(
            objectUrl
          )

        } catch (error) {

          console.error(
            'Snow pass photo load failed:',
            error
          )

        }

      }


    void load()


    return () => {

      cancelled =
        true


      if (objectUrl) {

        URL.revokeObjectURL(
          objectUrl
        )

      }

    }

  }, [
    photoId,
  ])


  return url

}


// ============================================================
// Pass Slide
// ============================================================

function SnowPassSlide({
  record,
}: {
  record:
    SnowPassRecord
}) {

  const url =
    useSnowPassPhotoUrl(
      record.photoId
    )


  return (
    <div
      className="
        flex
        h-[235px]
        w-full
        items-center
        justify-center
        rounded-[22px]
        bg-white
        p-3
      "
    >

      {url
        ? (
          <img
            src={
              url
            }
            alt={
              record.name
            }
            draggable={false}
            className="
              h-full
              w-full
              select-none
              object-contain
            "
          />
        )
        : (
          <p
            className="
              text-[11px]
              text-slate-400
            "
          >
            讀取雪票中...
          </p>
        )
      }

    </div>
  )

}


// ============================================================
// Editor Sheet
// ============================================================

type SnowPassEditorProps = {
  open:
    boolean

  mode:
    'create' |
    'edit'

  record?:
    SnowPassRecord

  onSave:
    (
      name: string,
      file:
        File |
        null
    ) => Promise<void>

  onDelete?:
    () => Promise<void>

  onClose:
    () => void
}


function SnowPassEditor({
  open,
  mode,
  record,
  onSave,
  onDelete,
  onClose,
}: SnowPassEditorProps) {

  const [
    name,
    setName,
  ] = useState('')


  const [
    file,
    setFile,
  ] = useState<
    File |
    null
  >(
    null
  )


  const [
    previewUrl,
    setPreviewUrl,
  ] = useState<
    string |
    null
  >(
    null
  )


  const [
    saving,
    setSaving,
  ] = useState(false)


  const inputRef =
    useRef<HTMLInputElement>(
      null
    )


  useEffect(() => {

    if (!open) {
      return
    }


    setName(
      record?.name ??
      ''
    )

    setFile(
      null
    )

    setPreviewUrl(
      null
    )

  }, [
    open,
    record,
  ])


  useEffect(() => {

    if (!file) {
      return
    }


    const url =
      URL.createObjectURL(
        file
      )


    setPreviewUrl(
      url
    )


    return () => {

      URL.revokeObjectURL(
        url
      )

    }

  }, [
    file,
  ])


  if (
    !open ||
    typeof document ===
      'undefined'
  ) {
    return null
  }


  const canSave =
    name.trim().length >
      0 &&
    (
      mode === 'edit' ||
      Boolean(
        file
      )
    )


  return createPortal(

    <div
      data-disable-swipe-back="true"

      onPointerDown={event => {
        event.stopPropagation()
      }}

      onPointerMove={event => {
        event.stopPropagation()
      }}

      onPointerUp={event => {
        event.stopPropagation()
      }}

      className="
        fixed
        inset-0
        z-[1150]
        flex
        items-end
        justify-center
      "
    >

      <button
        type="button"
        aria-label="關閉雪票編輯"
        onClick={
          onClose
        }
        className="
          absolute
          inset-0
          bg-slate-950/40
          backdrop-blur-[2px]
        "
      />


      <section
        className="
          relative
          z-10
          w-full
          max-w-md
          rounded-t-[30px]
          bg-[#f7f7f5]
          px-5
          pb-[calc(24px+env(safe-area-inset-bottom))]
          pt-3
          shadow-2xl
        "
      >

        <div
          className="
            mx-auto
            h-1
            w-10
            rounded-full
            bg-slate-300
          "
        />


        <div
          className="
            mt-5
            flex
            items-start
            justify-between
          "
        >

          <div>

            <p
              className="
                text-[9px]
                font-semibold
                tracking-[0.18em]
                text-slate-500
              "
            >
              SNOW PASS
            </p>


            <h2
              className="
                mt-1
                text-[24px]
                font-semibold
                tracking-[-0.03em]
                text-slate-950
              "
            >
              {
                mode === 'create'
                  ? '新增雪票'
                  : '編輯雪票'
              }
            </h2>

          </div>


          <button
            type="button"
            onClick={
              onClose
            }
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-slate-200/80
              text-[18px]
              text-slate-700
            "
          >
            ×
          </button>

        </div>


        <label
          className="
            mt-5
            block
          "
        >

          <span
            className="
              text-[10px]
              font-semibold
              tracking-[0.1em]
              text-slate-600
            "
          >
            NAME / CODE
          </span>


          <input
            type="text"
            value={
              name
            }
            placeholder="例如：FURANO / JEFF"
            onChange={event =>
              setName(
                event.target.value
              )
            }
            className="
              mt-2
              w-full
              rounded-[16px]
              border
              border-slate-200
              bg-white
              px-4
              py-3
              text-[14px]
              text-slate-900
              outline-none
              placeholder:text-slate-400
              focus:border-slate-400
            "
          />

        </label>


        <div
          className="
            mt-4
          "
        >

          <button
            type="button"
            onClick={() =>
              inputRef.current
                ?.click()
            }
            className="
              w-full
              rounded-[16px]
              border
              border-slate-200
              bg-white
              px-4
              py-3
              text-[11px]
              font-semibold
              text-slate-700
            "
          >
            {
              mode === 'edit'
                ? '重新選擇雪票照片'
                : '選擇雪票照片'
            }
          </button>


          <input
            ref={
              inputRef
            }
            type="file"
            accept="image/*"
            onChange={(
              event:
                ChangeEvent<HTMLInputElement>
            ) => {

              const next =
                event.target.files?.[
                  0
                ] ??
                null


              setFile(
                next
              )


              event.target.value =
                ''

            }}
            className="hidden"
          />


          {previewUrl && (

            <div
              className="
                mt-3
                flex
                h-[180px]
                items-center
                justify-center
                rounded-[18px]
                bg-white
                p-3
              "
            >
              <img
                src={
                  previewUrl
                }
                alt="雪票預覽"
                className="
                  h-full
                  w-full
                  object-contain
                "
              />
            </div>

          )}

        </div>


        <button
          type="button"
          disabled={
            !canSave ||
            saving
          }

          onClick={() => {

            setSaving(
              true
            )


            void onSave(
              name,
              file
            )
              .finally(
                () => {

                  setSaving(
                    false
                  )

                }
              )

          }}

          className="
            mt-5
            w-full
            rounded-[17px]
            bg-slate-950
            px-4
            py-4
            text-[13px]
            font-semibold
            text-white
            disabled:opacity-30
          "
        >
          {
            saving
              ? '儲存中...'
              : '儲存'
          }
        </button>


        {
          mode === 'edit' &&
          onDelete && (

            <button
              type="button"

              onClick={() => {

                void onDelete()

              }}

              className="
                mt-2
                w-full
                rounded-[15px]
                px-4
                py-3
                text-[11px]
                font-semibold
                text-red-500
              "
            >
              刪除此雪票
            </button>

          )
        }

      </section>

    </div>,
    document.body
  )

}


// ============================================================
// Main Component
// ============================================================

function SnowPassWallet() {

  const [
    records,
    setRecords,
  ] = useState<
    SnowPassRecord[]
  >(
    loadSnowPasses
  )


  const [
    selectedIndex,
    setSelectedIndex,
  ] = useState(0)


  const [
    editorOpen,
    setEditorOpen,
  ] = useState(false)


  const [
    editorMode,
    setEditorMode,
  ] = useState<
    'create' |
    'edit'
  >(
    'create'
  )


  const scrollerRef =
    useRef<HTMLDivElement>(
      null
    )


  const longPressTimerRef =
    useRef<
      number |
      null
    >(
      null
    )


  const pressRef =
    useRef({
      x:
        0,

      y:
        0,

      moved:
        false,
    })


  const current =
    records[
      selectedIndex
    ]


  useEffect(() => {

    saveSnowPasses(
      records
    )


    if (
      selectedIndex >
      records.length - 1
    ) {

      setSelectedIndex(
        Math.max(
          0,
          records.length - 1
        )
      )

    }

  }, [
    records,
    selectedIndex,
  ])


  const clearLongPress =
    () => {

      if (
        longPressTimerRef.current !==
        null
      ) {

        window.clearTimeout(
          longPressTimerRef.current
        )

        longPressTimerRef.current =
          null

      }

    }


  const handlePassPointerDown =
    (
      event:
        ReactPointerEvent<HTMLDivElement>
    ) => {

      event.stopPropagation()


      pressRef.current = {
        x:
          event.clientX,

        y:
          event.clientY,

        moved:
          false,
      }


      clearLongPress()


      if (!current) {
        return
      }


      longPressTimerRef.current =
        window.setTimeout(
          () => {

            if (
              pressRef.current.moved
            ) {
              return
            }


            setEditorMode(
              'edit'
            )

            setEditorOpen(
              true
            )

          },
          650
        )

    }


  const handlePassPointerMove =
    (
      event:
        ReactPointerEvent<HTMLDivElement>
    ) => {

      event.stopPropagation()


      const dx =
        event.clientX -
        pressRef.current.x


      const dy =
        event.clientY -
        pressRef.current.y


      if (
        Math.abs(
          dx
        ) > 8 ||
        Math.abs(
          dy
        ) > 8
      ) {

        pressRef.current.moved =
          true

        clearLongPress()

      }

    }


  const finishPassPointer =
    (
      event:
        ReactPointerEvent<HTMLDivElement>
    ) => {

      event.stopPropagation()

      clearLongPress()

    }


  const handleScroll =
    () => {

      const element =
        scrollerRef.current


      if (
        !element ||
        records.length === 0
      ) {
        return
      }


      const index =
        Math.round(
          element.scrollLeft /
          Math.max(
            element.clientWidth,
            1
          )
        )


      setSelectedIndex(
        Math.max(
          0,
          Math.min(
            index,
            records.length - 1
          )
        )
      )

    }


  const handleWheel =
    (
      event:
        ReactWheelEvent<HTMLDivElement>
    ) => {

      const element =
        scrollerRef.current


      if (!element) {
        return
      }


      if (
        Math.abs(
          event.deltaY
        ) >
        Math.abs(
          event.deltaX
        )
      ) {

        element.scrollLeft +=
          event.deltaY

        event.preventDefault()

      }

    }


  const openCreate =
    () => {

      setEditorMode(
        'create'
      )

      setEditorOpen(
        true
      )

    }


  const saveEditor =
    async (
      name: string,
      file:
        File |
        null
    ) => {

      if (
        editorMode ===
        'create'
      ) {

        if (!file) {
          return
        }


        const photoId =
          await saveSnowPassPhoto(
            file
          )


        const next =
          createSnowPassRecord(
            name,
            photoId
          )


        setRecords(
          currentRecords => [
            ...currentRecords,
            next,
          ]
        )


        window.setTimeout(
          () => {

            const element =
              scrollerRef.current


            if (!element) {
              return
            }


            element.scrollTo({
              left:
                element.scrollWidth,

              behavior:
                'smooth',
            })

          },
          0
        )

      } else if (current) {

        let nextPhotoId =
          current.photoId


        if (file) {

          nextPhotoId =
            await saveSnowPassPhoto(
              file
            )


          try {

            await deleteSnowPassPhoto(
              current.photoId
            )

          } catch (error) {

            console.error(
              'Old snow pass photo cleanup failed:',
              error
            )

          }

        }


        setRecords(
          currentRecords =>
            currentRecords.map(
              item =>
                item.id ===
                current.id
                  ? {
                      ...item,

                      name:
                        name.trim(),

                      photoId:
                        nextPhotoId,
                    }
                  : item
            )
        )

      }


      setEditorOpen(
        false
      )

    }


  const deleteCurrent =
    async () => {

      if (!current) {
        return
      }


      const confirmed =
        window.confirm(
          `確定要刪除「${current.name}」嗎？`
        )


      if (!confirmed) {
        return
      }


      try {

        await deleteSnowPassPhoto(
          current.photoId
        )

      } catch (error) {

        console.error(
          'Snow pass photo delete failed:',
          error
        )

      }


      setRecords(
        currentRecords =>
          currentRecords.filter(
            item =>
              item.id !==
              current.id
          )
      )


      setEditorOpen(
        false
      )

    }


  return (

    <section
      className="
        mt-5
      "
    >

      <div
        className="
          overflow-hidden
          rounded-[28px]
          bg-slate-950
          px-4
          pb-4
          pt-4
          text-white
          shadow-xl
          shadow-slate-900/15
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
            gap-4
            px-1
          "
        >

          <div>
            <p
              className="
                text-[9px]
                font-semibold
                tracking-[0.18em]
                text-white/55
              "
            >
              SNOW PASS
            </p>

            <p
              className="
                mt-1
                text-[13px]
                font-medium
                text-white/85
              "
            >
              快速雪票
            </p>
          </div>


          <button
            type="button"
            onClick={
              openCreate
            }
            className="
              flex
              h-9
              items-center
              gap-1.5
              rounded-full
              border
              border-white/15
              bg-white/8
              px-3
              text-[9px]
              font-semibold
              tracking-[0.08em]
              text-white/80
            "
          >
            ＋ ADD
          </button>

        </div>


        {records.length === 0
          ? (
            <button
              type="button"
              onClick={
                openCreate
              }
              className="
                mt-4
                flex
                h-[190px]
                w-full
                flex-col
                items-center
                justify-center
                rounded-[22px]
                border
                border-dashed
                border-white/20
                bg-white/5
                text-center
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-white/8
                  text-[22px]
                  text-white/70
                "
              >
                ＋
              </div>

              <p
                className="
                  mt-3
                  text-[11px]
                  font-medium
                  text-white/75
                "
              >
                上傳雪票條碼 / QR 圖片
              </p>

              <p
                className="
                  mt-1
                  text-[9px]
                  text-white/45
                "
              >
                可輸入名稱或代號
              </p>
            </button>
          )
          : (
            <>
              <div
                ref={
                  scrollerRef
                }

                data-horizontal-scroll="true"

                onPointerDown={
                  handlePassPointerDown
                }

                onPointerMove={
                  handlePassPointerMove
                }

                onPointerUp={
                  finishPassPointer
                }

                onPointerCancel={
                  finishPassPointer
                }

                onScroll={
                  handleScroll
                }

                onWheel={
                  handleWheel
                }

                className="
                  mt-4
                  flex
                  touch-pan-x
                  snap-x
                  snap-mandatory
                  overflow-x-auto
                  overscroll-x-contain
                  scroll-smooth
                  [scrollbar-width:none]
                  [&::-webkit-scrollbar]:hidden
                "
              >

                {records.map(
                  record => (

                    <div
                      key={
                        record.id
                      }
                      className="
                        min-w-full
                        snap-center
                      "
                    >
                      <SnowPassSlide
                        record={
                          record
                        }
                      />
                    </div>

                  )
                )}

              </div>


              <div
                className="
                  mt-3
                  flex
                  items-center
                  justify-between
                  gap-3
                  px-1
                "
              >

                <div
                  className="
                    min-w-0
                  "
                >
                  <p
                    className="
                      truncate
                      text-[12px]
                      font-semibold
                      text-white/90
                    "
                  >
                    {
                      current?.name ??
                      ''
                    }
                  </p>

                  <p
                    className="
                      mt-1
                      text-[8px]
                      tracking-[0.1em]
                      text-white/45
                    "
                  >
                    {
                      selectedIndex + 1
                    } / {
                      records.length
                    }
                    {' · '}
                    長按編輯
                  </p>
                </div>


                <div
                  className="
                    flex
                    gap-1
                  "
                >
                  {records.map(
                    record => (

                      <span
                        key={
                          record.id
                        }
                        className={`
                          h-1.5
                          rounded-full
                          transition

                          ${
                            record.id ===
                            current?.id
                              ? 'w-5 bg-white/80'
                              : 'w-1.5 bg-white/25'
                          }
                        `}
                      />

                    )
                  )}
                </div>

              </div>
            </>
          )
        }

      </div>


      <SnowPassEditor
        open={
          editorOpen
        }

        mode={
          editorMode
        }

        record={
          editorMode ===
          'edit'
            ? current
            : undefined
        }

        onSave={
          saveEditor
        }

        onDelete={
          editorMode ===
          'edit'
            ? deleteCurrent
            : undefined
        }

        onClose={() =>
          setEditorOpen(
            false
          )
        }
      />

    </section>

  )

}


export default SnowPassWallet