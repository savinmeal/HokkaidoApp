import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'

import {
  createPortal,
} from 'react-dom'

import {
  deleteTrailMapImage,
  getTrailMapImage,
  loadSkiResortMaps,
  saveSkiResortMaps,
  saveTrailMapImage,
  type SkiResortMapRecord,
} from '../data/skiResortMapStorage'


function useTrailMapUrl(
  imageId:
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

        if (!imageId) {

          setUrl(
            null
          )

          return
        }


        try {

          const blob =
            await getTrailMapImage(
              imageId
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
            'Trail map image load failed:',
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
    imageId,
  ])


  return url

}


function TrailMapViewer({
  open,
  record,
  onClose,
}: {
  open: boolean
  record:
    SkiResortMapRecord
  onClose: () => void
}) {

  const url =
    useTrailMapUrl(
      open
        ? record.imageId
        : undefined
    )


  const [
    zoom,
    setZoom,
  ] = useState(1)


  const [
    rotation,
    setRotation,
  ] = useState(0)


  useEffect(() => {

    if (open) {

      setZoom(1)
      setRotation(0)

    }

  }, [
    open,
    record.id,
  ])


  if (
    !open ||
    typeof document ===
      'undefined'
  ) {
    return null
  }


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
        z-[1200]
        flex
        flex-col
        bg-slate-950
        text-white
      "
    >

      <div
        className="
          flex
          items-center
          justify-between
          px-4
          pb-3
          pt-[calc(12px+env(safe-area-inset-top))]
        "
      >

        <div>

          <p
            className="
              text-[9px]
              font-semibold
              tracking-[0.15em]
              text-white/45
            "
          >
            TRAIL MAP
          </p>


          <p
            className="
              mt-1
              text-[13px]
              font-semibold
              text-white/90
            "
          >
            {record.resortName}
          </p>

        </div>


        <button
          type="button"
          onClick={
            onClose
          }
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            bg-white/10
            text-[22px]
            font-light
          "
        >
          ×
        </button>

      </div>


      <div
        className="
          relative
          min-h-0
          flex-1
          overflow-auto
          bg-black
        "
      >

        <div
          className="
            flex
            min-h-full
            min-w-full
            items-center
            justify-center
            p-4
          "
        >

          {url
            ? (
              <img
                src={
                  url
                }
                alt={
                  record.resortName
                }

                onLoad={
                  event => {

                    const image =
                      event.currentTarget


                    if (
                      image.naturalHeight >
                      image.naturalWidth
                    ) {

                      setRotation(
                        90
                      )

                    }

                  }
                }

                className="
                  max-h-[82dvh]
                  max-w-[92vw]
                  select-none
                  object-contain
                  transition-transform
                  duration-200
                "

                style={{
                  transform:
                    `rotate(${rotation}deg) scale(${zoom})`,

                  transformOrigin:
                    'center center',
                }}
              />
            )
            : (
              <p
                className="
                  text-[11px]
                  text-white/50
                "
              >
                尚未匯入離線雪場地圖
              </p>
            )
          }

        </div>

      </div>


      <div
        className="
          grid
          grid-cols-4
          gap-2
          px-4
          pb-[calc(12px+env(safe-area-inset-bottom))]
          pt-3
        "
      >

        <button
          type="button"

          onClick={() =>
            setZoom(
              current =>
                Math.max(
                  0.75,
                  current - 0.25
                )
            )
          }

          className="
            rounded-[14px]
            bg-white/10
            py-3
            text-[13px]
            font-semibold
          "
        >
          −
        </button>


        <button
          type="button"

          onClick={() =>
            setZoom(
              current =>
                Math.min(
                  4,
                  current + 0.25
                )
            )
          }

          className="
            rounded-[14px]
            bg-white/10
            py-3
            text-[13px]
            font-semibold
          "
        >
          ＋
        </button>


        <button
          type="button"

          onClick={() =>
            setRotation(
              current =>
                (
                  current + 90
                ) % 360
            )
          }

          className="
            rounded-[14px]
            bg-white/10
            py-3
            text-[10px]
            font-semibold
          "
        >
          ROTATE
        </button>


        <button
          type="button"

          onClick={() => {

            setZoom(1)
            setRotation(0)

          }}

          className="
            rounded-[14px]
            bg-white/10
            py-3
            text-[10px]
            font-semibold
          "
        >
          RESET
        </button>

      </div>

    </div>,
    document.body
  )

}


function SkiResortMapCard() {

  const [
    records,
    setRecords,
  ] = useState(
    loadSkiResortMaps
  )


  const [
    selectedIndex,
    setSelectedIndex,
  ] = useState(0)


  const [
    viewerOpen,
    setViewerOpen,
  ] = useState(false)


  const inputRef =
    useRef<HTMLInputElement>(
      null
    )


  const selected =
    records[
      Math.min(
        selectedIndex,
        records.length - 1
      )
    ]


  const previewUrl =
    useTrailMapUrl(
      selected?.imageId
    )


  useEffect(() => {

    saveSkiResortMaps(
      records
    )

  }, [
    records,
  ])


  const handleFile =
    async (
      event:
        ChangeEvent<HTMLInputElement>
    ) => {

      const file =
        event.target.files?.[
          0
        ]


      event.target.value =
        ''


      if (
        !file ||
        !selected
      ) {
        return
      }


      try {

        const imageId =
          await saveTrailMapImage(
            file
          )


        if (
          selected.imageId
        ) {

          try {

            await deleteTrailMapImage(
              selected.imageId
            )

          } catch (error) {

            console.error(
              'Old trail map cleanup failed:',
              error
            )

          }

        }


        setRecords(
          current =>
            current.map(
              item =>
                item.id ===
                selected.id
                  ? {
                      ...item,

                      imageId,

                      updatedAt:
                        Date.now(),
                    }
                  : item
            )
        )

      } catch (error) {

        console.error(
          'Trail map save failed:',
          error
        )


        window.alert(
          '雪場地圖儲存失敗，請重新嘗試。'
        )

      }

    }


  return (

    <section
      className="
        mt-5
        overflow-hidden
        rounded-[28px]
        bg-slate-950
        px-5
        pb-5
        pt-5
        text-white
        shadow-xl
        shadow-slate-900/15
      "
    >

      <div
        className="
          flex
          items-start
          justify-between
          gap-4
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
            SKI RESORT MAP
          </p>


          <h2
            className="
              mt-1
              text-[17px]
              font-semibold
              tracking-[-0.02em]
              text-white/90
            "
          >
            雪場地圖
          </h2>

        </div>


        <span
          className="
            rounded-full
            border
            border-emerald-300/15
            bg-emerald-300/10
            px-2.5
            py-1
            text-[8px]
            font-semibold
            tracking-[0.08em]
            text-emerald-200
          "
        >
          OFFLINE
        </span>

      </div>


      <div
        className="
          mt-4
          flex
          gap-2
          overflow-x-auto
          pb-1
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >

        {records.map(
          (
            record,
            index
          ) => {

            const active =
              index ===
              selectedIndex


            return (
              <button
                key={
                  record.id
                }
                type="button"

                onClick={() =>
                  setSelectedIndex(
                    index
                  )
                }

                className={`
                  shrink-0
                  rounded-full
                  border
                  px-3
                  py-2
                  text-[9px]
                  font-semibold
                  transition

                  ${
                    active
                      ? `
                          border-white/25
                          bg-white/12
                          text-white
                        `
                      : `
                          border-white/[0.06]
                          bg-white/[0.025]
                          text-white/40
                        `
                  }
                `}
              >
                {record.shortName}
              </button>
            )

          }
        )}

      </div>


      <p
        className="
          mt-2
          text-[10px]
          text-white/45
        "
      >
        {
          selected?.resortName
        }
      </p>


      <button
        type="button"

        disabled={
          !selected?.imageId
        }

        onClick={() =>
          setViewerOpen(
            true
          )
        }

        className="
          mt-4
          flex
          h-[190px]
          w-full
          items-center
          justify-center
          overflow-hidden
          rounded-[22px]
          border
          border-white/10
          bg-white/[0.035]
          p-3
          disabled:cursor-default
        "
      >

        {previewUrl
          ? (
            <img
              src={
                previewUrl
              }
              alt={
                selected?.resortName
              }
              className="
                h-full
                w-full
                object-contain
              "
            />
          )
          : (
            <div
              className="
                text-center
              "
            >

              <p
                className="
                  text-[12px]
                  font-semibold
                  text-white/65
                "
              >
                尚未匯入地圖
              </p>


              <p
                className="
                  mt-2
                  text-[9px]
                  leading-5
                  text-white/35
                "
              >
                事先儲存 Trail Map
                <br />
                雪場沒網路時仍可查看
              </p>

            </div>
          )
        }

      </button>


      <button
        type="button"

        onClick={() =>
          inputRef.current
            ?.click()
        }

        className="
          mt-3
          w-full
          rounded-[15px]
          border
          border-white/10
          bg-white/5
          px-4
          py-3
          text-[10px]
          font-semibold
          text-white/70
          transition
          active:scale-[0.99]
        "
      >
        {
          selected?.imageId
            ? '更新離線雪場地圖'
            : '匯入離線雪場地圖'
        }
      </button>


      <input
        ref={
          inputRef
        }
        type="file"
        accept="image/*"
        onChange={
          handleFile
        }
        className="hidden"
      />


      {selected && (
        <TrailMapViewer
          open={
            viewerOpen
          }

          record={
            selected
          }

          onClose={() =>
            setViewerOpen(
              false
            )
          }
        />
      )}

    </section>

  )

}


export default SkiResortMapCard