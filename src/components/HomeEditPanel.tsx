import {
  createPortal,
} from 'react-dom'

import type {
  HomeModuleKey,
  HomeModuleVisibility,
} from '../data/homePreferences'


type HomeEditPanelProps = {
  open: boolean

  visibility:
    HomeModuleVisibility

  onChange: (
    next:
      HomeModuleVisibility
  ) => void

  onClose: () => void
}


const OPTIONS:
  {
    key:
      HomeModuleKey

    title:
      string

    description:
      string
  }[] =
[
  {
    key:
      'weather',

    title:
      '天氣',

    description:
      '目前城市與天氣預報',
  },

  {
    key:
      'snowForecast',

    title:
      '雪況',

    description:
      '滑雪場雪況與預報',
  },

  {
    key:
      'snowPass',

    title:
      '雪票',

    description:
      '快速開啟雪票條碼或 QR 圖片',
  },

  {
    key:
      'paymentMethods',

    title:
      '付款方式',

    description:
      '信用卡額度與目前使用狀況',
  },

  {
    key:
      'tripStatus',

    title:
      '旅程狀態',

    description:
      '行程規劃、GPS、旅行回憶狀態',
  },

  {
    key:
      'quickLinks',

    title:
      '快捷卡片',

    description:
      '首頁下方 Mission / Places 等快捷區',
  },
]


function HomeEditPanel({
  open,
  visibility,
  onChange,
  onClose,
}: HomeEditPanelProps) {

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
        z-[1100]
        flex
        items-end
        justify-center
      "
    >

      <button
        type="button"
        aria-label="關閉 Home 編輯"
        onClick={
          onClose
        }
        className="
          absolute
          inset-0
          bg-slate-950/35
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
              HOME LAYOUT
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
              首頁顯示
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
              font-light
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


export default HomeEditPanel