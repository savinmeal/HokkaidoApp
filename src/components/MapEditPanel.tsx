import {
  createPortal,
} from 'react-dom'

import type {
  MapModuleKey,
  MapModuleVisibility,
} from '../data/mapPreferences'


type Props = {
  open: boolean
  visibility: MapModuleVisibility

  onChange: (
    next:
      MapModuleVisibility
  ) => void

  onClose: () => void
}


const OPTIONS:
  {
    key:
      MapModuleKey

    title:
      string

    description:
      string
  }[] =
[
  {
    key:
      'skiTrack',

    title:
      '雪場軌跡',

    description:
      '滑雪軌跡、速度與趟數分析',
  },

  {
    key:
      'skiMaps',

    title:
      '雪場地圖',

    description:
      '離線保存雪場 Trail Map',
  },

  {
    key:
      'tripRoute',

    title:
      '行程軌跡',

    description:
      '每日 GPS 路徑與 Trip 景點標記',
  },
]


function MapEditPanel({
  open,
  visibility,
  onChange,
  onClose,
}: Props) {

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
        z-[1150]
        flex
        items-end
        justify-center
      "
    >

      <button
        type="button"
        aria-label="關閉 Map 設定"
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
              MAP LAYOUT
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
              地圖顯示
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


        <div
          className="
            mt-5
            space-y-2
          "
        >

          {OPTIONS.map(
            option => {

              const enabled =
                visibility[
                  option.key
                ]


              return (
                <button
                  key={
                    option.key
                  }
                  type="button"

                  onClick={() =>
                    onChange({
                      ...visibility,

                      [option.key]:
                        !enabled,
                    })
                  }

                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    gap-4
                    rounded-[18px]
                    border
                    border-slate-200
                    bg-white/75
                    px-4
                    py-3
                    text-left
                  "
                >

                  <div>

                    <p
                      className="
                        text-[12px]
                        font-semibold
                        text-slate-800
                      "
                    >
                      {option.title}
                    </p>


                    <p
                      className="
                        mt-1
                        text-[9px]
                        leading-4
                        text-slate-500
                      "
                    >
                      {
                        option.description
                      }
                    </p>

                  </div>


                  <span
                    className={`
                      relative
                      h-6
                      w-11
                      shrink-0
                      rounded-full
                      transition

                      ${
                        enabled
                          ? 'bg-slate-950'
                          : 'bg-slate-300'
                      }
                    `}
                  >

                    <span
                      className={`
                        absolute
                        top-1
                        h-4
                        w-4
                        rounded-full
                        bg-white
                        shadow-sm
                        transition

                        ${
                          enabled
                            ? 'left-6'
                            : 'left-1'
                        }
                      `}
                    />

                  </span>

                </button>
              )

            }
          )}

        </div>

      </section>

    </div>,
    document.body
  )

}


export default MapEditPanel