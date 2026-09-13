import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'

import {
  createPortal,
} from 'react-dom'

import type {
  ExpenseCurrency,
} from '../data/tripData'

import {
  EXPENSE_CURRENCIES,
  EXPENSE_DISPLAY_CURRENCY_KEY,
  convertExpenseAmount,
  formatExpenseAmount,
  isExpenseCurrency,
} from '../data/expenseCurrency'

import {
  PAYMENT_USAGE_UPDATED_EVENT,
  createPaymentProfile,
  getAllTripExpenses,
  getPaymentProfileSpend,
  loadPaymentProfiles,
  savePaymentProfiles,
  type PaymentProfile,
  type PaymentProfileType,
} from '../data/paymentMethodStorage'



type PaymentWalletStyle =
  | 'black_metal'
  | 'japanese'
  | 'glass'
  | 'classic_bank'


const PAYMENT_WALLET_STYLE_KEY =
  'travel_v100_payment_wallet_style_v1'


const PAYMENT_WALLET_STYLES: {
  id: PaymentWalletStyle
  label: string
  subLabel: string
}[] = [
  {
    id:
      'black_metal',
    label:
      'BLACK METAL',
    subLabel:
      '黑卡 / 金屬',
  },
  {
    id:
      'japanese',
    label:
      'JAPANESE',
    subLabel:
      '日系 / 和風',
  },
  {
    id:
      'glass',
    label:
      'GLASS',
    subLabel:
      '透明 / 光影',
  },
  {
    id:
      'classic_bank',
    label:
      'CLASSIC BANK',
    subLabel:
      '傳統銀行卡',
  },
]


function loadPaymentWalletStyle():
  PaymentWalletStyle {

  try {

    const saved =
      localStorage.getItem(
        PAYMENT_WALLET_STYLE_KEY
      )


    if (
      saved ===
        'black_metal' ||
      saved ===
        'japanese' ||
      saved ===
        'glass' ||
      saved ===
        'classic_bank'
    ) {
      return saved
    }

  } catch (error) {

    console.error(
      'Payment wallet style load failed:',
      error
    )

  }


  return 'black_metal'

}


function loadPaymentSummaryCurrency():
  ExpenseCurrency {

  try {

    const saved =
      localStorage.getItem(
        EXPENSE_DISPLAY_CURRENCY_KEY
      )


    if (
      isExpenseCurrency(
        saved
      )
    ) {
      return saved
    }

  } catch (error) {

    console.error(
      'Payment summary currency load failed:',
      error
    )

  }


  return 'TWD'

}


// ============================================================
// Editor
// ============================================================

function PaymentProfileEditor({
  open,
  profile,
  onSave,
  onDelete,
  onClose,
}: {
  open:
    boolean

  profile?:
    PaymentProfile

  onSave:
    (
      profile:
        PaymentProfile
    ) => void

  onDelete?:
    () => void

  onClose:
    () => void
}) {

  const [
    type,
    setType,
  ] = useState<
    PaymentProfileType
  >(
    'credit_card'
  )


  const [
    name,
    setName,
  ] = useState('')


  const [
    limitAmount,
    setLimitAmount,
  ] = useState('')


  const [
    limitCurrency,
    setLimitCurrency,
  ] = useState<
    ExpenseCurrency
  >(
    'TWD'
  )


  useEffect(() => {

    if (!open) {
      return
    }


    setType(
      profile?.type ??
      'credit_card'
    )

    setName(
      profile?.name ??
      ''
    )

    setLimitAmount(
      profile?.limitAmount
        ? String(
            profile.limitAmount
          )
        : ''
    )

    setLimitCurrency(
      profile?.limitCurrency ??
      'TWD'
    )

  }, [
    open,
    profile,
  ])


  if (
    !open ||
    typeof document ===
      'undefined'
  ) {
    return null
  }


  const numericLimit =
    Number(
      limitAmount
    )


  const canSave =
    name.trim().length >
      0 &&
    (
      type === 'cash' ||
      (
        Number.isFinite(
          numericLimit
        ) &&
        numericLimit >
          0
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
        aria-label="關閉付款方式編輯"
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
              PAYMENT PROFILE
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
                profile
                  ? '編輯付款方式'
                  : '新增付款方式'
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


        <div
          className="
            mt-5
          "
        >

          <p
            className="
              text-[10px]
              font-semibold
              tracking-[0.1em]
              text-slate-600
            "
          >
            TYPE
          </p>


          <div
            className="
              mt-2
              grid
              grid-cols-2
              gap-2
            "
          >

            <button
              type="button"
              onClick={() =>
                setType(
                  'credit_card'
                )
              }
              className={`
                rounded-[14px]
                border
                px-3
                py-3
                text-[10px]
                font-semibold

                ${
                  type ===
                  'credit_card'
                    ? `
                        border-slate-900
                        bg-slate-950
                        text-white
                      `
                    : `
                        border-slate-200
                        bg-white
                        text-slate-600
                      `
                }
              `}
            >
              信用卡
            </button>


            <button
              type="button"
              onClick={() =>
                setType(
                  'cash'
                )
              }
              className={`
                rounded-[14px]
                border
                px-3
                py-3
                text-[10px]
                font-semibold

                ${
                  type ===
                  'cash'
                    ? `
                        border-slate-900
                        bg-slate-950
                        text-white
                      `
                    : `
                        border-slate-200
                        bg-white
                        text-slate-600
                      `
                }
              `}
            >
              現金
            </button>

          </div>

        </div>


        <label
          className="
            mt-4
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
            NAME
          </span>


          <input
            type="text"
            value={
              name
            }
            placeholder={
              type ===
              'credit_card'
                ? '例如：國泰 CUBE'
                : '例如：日幣現金'
            }
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
            "
          />

        </label>


        {type ===
          'credit_card' && (
          <>

            <div
              className="
                mt-4
              "
            >

              <p
                className="
                  text-[10px]
                  font-semibold
                  tracking-[0.1em]
                  text-slate-600
                "
              >
                LIMIT CURRENCY
              </p>


              <div
                className="
                  mt-2
                  grid
                  grid-cols-3
                  gap-2
                "
              >

                {EXPENSE_CURRENCIES.map(
                  currency => (

                    <button
                      key={
                        currency
                      }
                      type="button"

                      onClick={() =>
                        setLimitCurrency(
                          currency
                        )
                      }

                      className={`
                        rounded-[13px]
                        border
                        px-2
                        py-2.5
                        text-[9px]
                        font-semibold

                        ${
                          limitCurrency ===
                          currency
                            ? `
                                border-slate-900
                                bg-slate-950
                                text-white
                              `
                            : `
                                border-slate-200
                                bg-white
                                text-slate-600
                              `
                        }
                      `}
                    >
                      {currency}
                    </button>

                  )
                )}

              </div>

            </div>


            <label
              className="
                mt-4
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
                LIMIT
              </span>


              <input
                type="number"
                min="0"
                step="1"
                inputMode="decimal"
                value={
                  limitAmount
                }
                placeholder="例如：100000"
                onChange={event =>
                  setLimitAmount(
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
                "
              />

            </label>

          </>
        )}


        <button
          type="button"
          disabled={
            !canSave
          }

          onClick={() => {

            const next =
              profile
                ? {
                    ...profile,

                    type,

                    name:
                      name.trim(),

                    limitAmount:
                      type ===
                      'credit_card'
                        ? numericLimit
                        : undefined,

                    limitCurrency:
                      type ===
                      'credit_card'
                        ? limitCurrency
                        : undefined,
                  }
                : createPaymentProfile({
                    type,

                    name,

                    limitAmount:
                      type ===
                      'credit_card'
                        ? numericLimit
                        : undefined,

                    limitCurrency:
                      type ===
                      'credit_card'
                        ? limitCurrency
                        : undefined,
                  })


            onSave(
              next
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
          儲存
        </button>


        {
          profile &&
          onDelete && (

            <button
              type="button"
              onClick={
                onDelete
              }
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
              刪除此付款方式
            </button>

          )
        }

      </section>

    </div>,
    document.body
  )

}


// ============================================================
// Wallet Style Picker
// ============================================================

function PaymentWalletStylePicker({
  open,
  selectedStyle,
  onSelect,
  onClose,
}: {
  open:
    boolean

  selectedStyle:
    PaymentWalletStyle

  onSelect:
    (
      style:
        PaymentWalletStyle
    ) => void

  onClose:
    () => void
}) {

  if (
    !open ||
    typeof document ===
      'undefined'
  ) {
    return null
  }


  const getPreviewClass = (
    style:
      PaymentWalletStyle
  ) => {

    switch (
      style
    ) {

      case 'japanese':
        return `
          bg-[linear-gradient(145deg,#102d49_0%,#153c5d_55%,#712f32_100%)]
        `

      case 'glass':
        return `
          bg-[linear-gradient(145deg,rgba(80,180,210,0.72),rgba(93,78,180,0.72),rgba(29,43,75,0.86))]
        `

      case 'classic_bank':
        return `
          bg-[linear-gradient(145deg,#074b74_0%,#126b91_46%,#132f62_100%)]
        `

      default:
        return `
          bg-[linear-gradient(145deg,#090b0f_0%,#262a31_48%,#07080b_100%)]
        `

    }

  }


  return createPortal(

    <div
      data-disable-swipe-back="true"

      className="
        fixed
        inset-0
        z-[1180]
        flex
        items-end
        justify-center
      "

      onPointerDown={event => {
        event.stopPropagation()
      }}
    >

      <button
        type="button"

        aria-label="關閉卡面選擇"

        onClick={
          onClose
        }

        className="
          absolute
          inset-0
          bg-slate-950/50
          backdrop-blur-[3px]
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
            gap-3
          "
        >

          <div>

            <p
              className="
                text-[9px]
                font-bold
                tracking-[0.18em]
                text-slate-400
              "
            >
              CARD APPEARANCE
            </p>

            <h2
              className="
                mt-1
                text-[22px]
                font-semibold
                tracking-[-0.03em]
                text-slate-950
              "
            >
              選擇 Payment 卡面
            </h2>

            <p
              className="
                mt-1
                text-[9px]
                leading-5
                text-slate-500
              "
            >
              長按 Payment block 10 秒可再次開啟
            </p>

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
              shrink-0
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
            grid
            grid-cols-2
            gap-3
          "
        >

          {PAYMENT_WALLET_STYLES.map(
            item => {

              const selected =
                item.id ===
                selectedStyle


              return (

                <button
                  key={
                    item.id
                  }

                  type="button"

                  onClick={() =>
                    onSelect(
                      item.id
                    )
                  }

                  className={`
                    rounded-[18px]
                    border
                    p-2
                    text-left
                    transition
                    active:scale-[0.98]

                    ${
                      selected
                        ? `
                            border-slate-900
                            bg-slate-900/[0.04]
                          `
                        : `
                            border-slate-200
                            bg-white
                          `
                    }
                  `}
                >

                  <div
                    className={`
                      relative
                      h-[88px]
                      overflow-hidden
                      rounded-[14px]
                      border
                      border-white/15
                      shadow-md

                      ${getPreviewClass(
                        item.id
                      )}
                    `}
                  >

                    {item.id ===
                      'black_metal' && (

                      <>
                        <div
                          className="
                            absolute
                            inset-0
                            opacity-20
                          "
                          style={{
                            backgroundImage:
                              'repeating-linear-gradient(0deg, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 1px, transparent 1px, transparent 4px)',
                          }}
                        />

                        <div
                          className="
                            absolute
                            right-3
                            top-3
                            h-7
                            w-10
                            rounded-[7px]
                            bg-amber-200/40
                          "
                        />
                      </>

                    )}


                    {item.id ===
                      'japanese' && (

                      <>
                        <div
                          className="
                            absolute
                            right-5
                            top-4
                            h-10
                            w-10
                            rounded-full
                            bg-[#c84942]/85
                          "
                        />

                        <svg
                          viewBox="0 0 160 80"
                          className="
                            absolute
                            inset-x-0
                            bottom-0
                            h-12
                            w-full
                            opacity-25
                          "
                          fill="none"
                        >
                          <path d="M-10 64 Q20 35 50 64 T110 64 T170 64" stroke="white" strokeWidth="2" />
                          <path d="M-10 72 Q20 43 50 72 T110 72 T170 72" stroke="white" strokeWidth="1.4" />
                        </svg>
                      </>

                    )}


                    {item.id ===
                      'glass' && (

                      <>
                        <div
                          className="
                            absolute
                            -right-3
                            -top-5
                            h-20
                            w-20
                            rounded-full
                            bg-cyan-200/35
                            blur-xl
                          "
                        />

                        <div
                          className="
                            absolute
                            -bottom-7
                            left-5
                            h-20
                            w-20
                            rounded-full
                            bg-fuchsia-200/25
                            blur-xl
                          "
                        />
                      </>

                    )}


                    {item.id ===
                      'classic_bank' && (

                      <>
                        <div
                          className="
                            absolute
                            left-4
                            top-5
                            h-8
                            w-11
                            rounded-[7px]
                            bg-[linear-gradient(145deg,#e8d493,#9e873f)]
                          "
                        />

                        <div
                          className="
                            absolute
                            right-4
                            top-[27px]
                            flex
                            gap-[2px]
                          "
                        >
                          <span className="block h-7 w-7 rounded-full bg-orange-300/55" />
                          <span className="-ml-3 block h-7 w-7 rounded-full bg-red-300/55" />
                        </div>
                      </>

                    )}


                    <div
                      className="
                        absolute
                        bottom-3
                        left-3
                        right-3
                      "
                    >
                      <div className="h-[2px] w-16 rounded-full bg-white/55" />
                      <div className="mt-2 h-[2px] w-24 rounded-full bg-white/25" />
                    </div>

                  </div>


                  <p
                    className="
                      mt-2
                      text-[10px]
                      font-bold
                      tracking-[0.05em]
                      text-slate-800
                    "
                  >
                    {item.label}
                  </p>

                  <p
                    className="
                      mt-1
                      text-[8px]
                      text-slate-400
                    "
                  >
                    {item.subLabel}
                  </p>

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


// ============================================================
// Wallet
// ============================================================

function PaymentMethodWallet() {

  const [
    profiles,
    setProfiles,
  ] = useState<
    PaymentProfile[]
  >(
    loadPaymentProfiles
  )


  const [
    selectedProfileId,
    setSelectedProfileId,
  ] = useState<
    string |
    null
  >(
    null
  )


  const [
    editorOpen,
    setEditorOpen,
  ] = useState(false)


  const [
    usageVersion,
    setUsageVersion,
  ] = useState(0)


  const [
    paymentSummaryCurrency,
    setPaymentSummaryCurrency,
  ] = useState<ExpenseCurrency>(
    loadPaymentSummaryCurrency
  )


  const [
    summaryCurrencyPickerOpen,
    setSummaryCurrencyPickerOpen,
  ] = useState(false)


  const [
    walletStyle,
    setWalletStyle,
  ] = useState<PaymentWalletStyle>(
    loadPaymentWalletStyle
  )


  const [
    stylePickerOpen,
    setStylePickerOpen,
  ] = useState(false)


  const styleLongPressTimerRef =
    useRef<number | null>(
      null
    )


  const styleLongPressStartRef =
    useRef({
      x:
        0,

      y:
        0,
    })


  const styleLongPressTriggeredRef =
    useRef(false)


  useEffect(() => {

    savePaymentProfiles(
      profiles
    )

  }, [
    profiles,
  ])


  useEffect(() => {

    try {

      localStorage.setItem(
        EXPENSE_DISPLAY_CURRENCY_KEY,
        paymentSummaryCurrency
      )

    } catch (error) {

      console.error(
        'Payment summary currency save failed:',
        error
      )

    }

  }, [
    paymentSummaryCurrency,
  ])


  useEffect(() => {

    try {

      localStorage.setItem(
        PAYMENT_WALLET_STYLE_KEY,
        walletStyle
      )

    } catch (error) {

      console.error(
        'Payment wallet style save failed:',
        error
      )

    }

  }, [
    walletStyle,
  ])


  useEffect(() => {

    return () => {

      if (
        styleLongPressTimerRef.current !==
        null
      ) {

        window.clearTimeout(
          styleLongPressTimerRef.current
        )

      }

    }

  }, [])


  useEffect(() => {

    const refresh =
      () => {

        setUsageVersion(
          current =>
            current + 1
        )

      }


    window.addEventListener(
      PAYMENT_USAGE_UPDATED_EVENT,
      refresh
    )

    window.addEventListener(
      'focus',
      refresh
    )


    return () => {

      window.removeEventListener(
        PAYMENT_USAGE_UPDATED_EVENT,
        refresh
      )

      window.removeEventListener(
        'focus',
        refresh
      )

    }

  }, [])


  const selectedProfile =
    useMemo(
      () =>
        profiles.find(
          profile =>
            profile.id ===
            selectedProfileId
        ),
      [
        profiles,
        selectedProfileId,
      ]
    )


  // usageVersion is intentionally read so
  // profile usage recomputes after expense updates.
  void usageVersion


  // ==========================================================
  // Payment Summary
  //
  // Payment component 底部以 TWD 顯示所有已記帳消費的總額。
  // 每一筆原始幣別仍保留，這裡只做顯示換算。
  // ==========================================================

  const paymentSummaryTotal =
    getAllTripExpenses()
      .reduce(
        (
          total,
          expense
        ) =>
          total +
          convertExpenseAmount(
            Number(
              expense.amount ||
              0
            ),
            expense.currency ??
            'JPY',
            paymentSummaryCurrency
          ),
        0
      )


  const clearStyleLongPress =
    () => {

      if (
        styleLongPressTimerRef.current !==
        null
      ) {

        window.clearTimeout(
          styleLongPressTimerRef.current
        )


        styleLongPressTimerRef.current =
          null

      }

  }


  const startStyleLongPress = (
    event:
      ReactPointerEvent<HTMLDivElement>
  ) => {

    if (
      stylePickerOpen
    ) {
      return
    }


    clearStyleLongPress()


    styleLongPressTriggeredRef.current =
      false


    styleLongPressStartRef.current = {
      x:
        event.clientX,

      y:
        event.clientY,
    }


    styleLongPressTimerRef.current =
      window.setTimeout(
        () => {

          styleLongPressTriggeredRef.current =
            true


          setStylePickerOpen(
            true
          )


          styleLongPressTimerRef.current =
            null

        },
        10000
      )

  }


  const moveStyleLongPress = (
    event:
      ReactPointerEvent<HTMLDivElement>
  ) => {

    if (
      styleLongPressTimerRef.current ===
      null
    ) {
      return
    }


    const dx =
      event.clientX -
      styleLongPressStartRef.current.x


    const dy =
      event.clientY -
      styleLongPressStartRef.current.y


    if (
      Math.abs(
        dx
      ) >
        12 ||
      Math.abs(
        dy
      ) >
        12
    ) {

      clearStyleLongPress()

    }

  }


  const finishStyleLongPress =
    () => {

      clearStyleLongPress()


      if (
        styleLongPressTriggeredRef.current
      ) {

        window.setTimeout(
          () => {

            styleLongPressTriggeredRef.current =
              false

          },
          350
        )

      }

    }


  const walletStyleClass =
    (() => {

      switch (
        walletStyle
      ) {

        case 'japanese':
          return `
            bg-[linear-gradient(145deg,#102d49_0%,#153c5d_48%,#1a3149_70%,#6c3034_100%)]
            shadow-[0_18px_42px_rgba(15,36,55,0.28)]
          `

        case 'glass':
          return `
            border
            border-white/20
            bg-[linear-gradient(145deg,rgba(49,133,168,0.78)_0%,rgba(79,90,177,0.75)_48%,rgba(33,42,75,0.86)_100%)]
            shadow-[0_20px_45px_rgba(44,67,112,0.28)]
            backdrop-blur-xl
          `

        case 'classic_bank':
          return `
            bg-[linear-gradient(145deg,#074b74_0%,#126b91_42%,#164e78_68%,#142d5b_100%)]
            shadow-[0_18px_42px_rgba(14,57,90,0.27)]
          `

        default:
          return `
            bg-[linear-gradient(145deg,#080a0d_0%,#20242a_34%,#111318_66%,#050608_100%)]
            shadow-[0_18px_42px_rgba(5,7,10,0.34)]
          `

      }

    })()


  const openCreate =
    () => {

      setSelectedProfileId(
        null
      )

      setEditorOpen(
        true
      )

    }


  const openEdit =
    (
      profile:
        PaymentProfile
    ) => {

      setSelectedProfileId(
        profile.id
      )

      setEditorOpen(
        true
      )

    }


  return (

    <section
      className="
        mt-5
      "
    >

      <div
        onPointerDown={
          startStyleLongPress
        }

        onPointerMove={
          moveStyleLongPress
        }

        onPointerUp={
          finishStyleLongPress
        }

        onPointerCancel={
          finishStyleLongPress
        }

        onPointerLeave={
          finishStyleLongPress
        }

        onClickCapture={event => {

          if (
            styleLongPressTriggeredRef.current
          ) {

            event.preventDefault()

            event.stopPropagation()

          }

        }}

        className={`
          relative
          overflow-hidden
          rounded-[28px]
          px-5
          pb-5
          pt-5
          text-white
          transition-[background,box-shadow]
          duration-500
          select-none

          ${walletStyleClass}
        `}
      >

        {/* ==================================================
            Wallet card appearance
        ================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
          "
        >

          {walletStyle ===
            'black_metal' && (

            <>
              <div
                className="
                  absolute
                  inset-0
                  opacity-[0.18]
                "
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, rgba(255,255,255,0.14) 0px, rgba(255,255,255,0.14) 1px, transparent 1px, transparent 4px)',
                }}
              />


              <div
                className="
                  absolute
                  -left-[12%]
                  top-[-40%]
                  h-[130%]
                  w-[45%]
                  rotate-[18deg]
                  bg-gradient-to-r
                  from-transparent
                  via-white/[0.10]
                  to-transparent
                  blur-md
                "
              />


              <div
                className="
                  absolute
                  right-5
                  top-16
                  h-12
                  w-[74px]
                  rounded-[10px]
                  border
                  border-[#dbca91]/30
                  bg-[linear-gradient(145deg,#d8c47d,#8e7a3c)]
                  opacity-70
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]
                "
              >
                <div className="absolute left-3 top-[7px] h-[1px] w-[46px] bg-black/20" />
                <div className="absolute left-3 top-[14px] h-[1px] w-[46px] bg-black/15" />
                <div className="absolute left-3 top-[21px] h-[1px] w-[46px] bg-black/15" />
                <div className="absolute left-3 top-[28px] h-[1px] w-[46px] bg-black/15" />
                <div className="absolute left-3 top-[35px] h-[1px] w-[46px] bg-black/15" />
              </div>
            </>

          )}


          {walletStyle ===
            'japanese' && (

            <>
              <div
                className="
                  absolute
                  right-7
                  top-[62px]
                  h-[74px]
                  w-[74px]
                  rounded-full
                  bg-[#c84942]/45
                  shadow-[0_0_35px_rgba(200,73,66,0.20)]
                "
              />


              <svg
                viewBox="0 0 420 280"

                aria-hidden="true"

                className="
                  absolute
                  inset-x-0
                  bottom-0
                  h-[72%]
                  w-full
                  opacity-[0.15]
                "

                fill="none"
              >
                <path d="M-30 170 Q20 120 70 170 T170 170 T270 170 T370 170 T470 170" stroke="white" strokeWidth="3" />
                <path d="M-30 195 Q20 145 70 195 T170 195 T270 195 T370 195 T470 195" stroke="white" strokeWidth="2" />
                <path d="M-30 220 Q20 170 70 220 T170 220 T270 220 T370 220 T470 220" stroke="white" strokeWidth="1.5" />
              </svg>


              <div
                className="
                  absolute
                  right-[22px]
                  top-[71px]
                  text-[7px]
                  font-bold
                  tracking-[0.26em]
                  text-white/25
                  [writing-mode:vertical-rl]
                "
              >
                旅 · 支払
              </div>
            </>

          )}


          {walletStyle ===
            'glass' && (

            <>
              <div
                className="
                  absolute
                  -right-10
                  -top-12
                  h-44
                  w-44
                  rounded-full
                  bg-cyan-200/25
                  blur-3xl
                "
              />

              <div
                className="
                  absolute
                  -bottom-20
                  -left-5
                  h-48
                  w-48
                  rounded-full
                  bg-fuchsia-300/20
                  blur-3xl
                "
              />

              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-br
                  from-white/[0.15]
                  via-transparent
                  to-white/[0.04]
                "
              />

              <div
                className="
                  absolute
                  left-[8%]
                  top-[-25%]
                  h-[160%]
                  w-[24%]
                  rotate-[22deg]
                  bg-white/[0.07]
                  blur-sm
                "
              />
            </>

          )}


          {walletStyle ===
            'classic_bank' && (

            <>
              <div
                className="
                  absolute
                  right-5
                  top-16
                  h-12
                  w-[74px]
                  rounded-[10px]
                  border
                  border-[#f1db8d]/35
                  bg-[linear-gradient(145deg,#ead895,#9b843c)]
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]
                "
              >
                <div className="absolute left-3 top-[7px] h-[1px] w-[46px] bg-black/20" />
                <div className="absolute left-3 top-[14px] h-[1px] w-[46px] bg-black/15" />
                <div className="absolute left-3 top-[21px] h-[1px] w-[46px] bg-black/15" />
                <div className="absolute left-3 top-[28px] h-[1px] w-[46px] bg-black/15" />
                <div className="absolute left-3 top-[35px] h-[1px] w-[46px] bg-black/15" />
                <div className="absolute left-[18px] top-[6px] h-[31px] w-[1px] bg-black/15" />
                <div className="absolute left-[32px] top-[6px] h-[31px] w-[1px] bg-black/15" />
                <div className="absolute left-[46px] top-[6px] h-[31px] w-[1px] bg-black/15" />
              </div>


              <div
                className="
                  absolute
                  right-[105px]
                  top-[77px]
                  opacity-35
                "
              >
                <svg
                  viewBox="0 0 40 34"
                  className="h-8 w-9"
                  fill="none"
                >
                  <path d="M7 17 C12 12 12 22 7 17" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <path d="M13 10 C23 17 23 17 13 24" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <path d="M19 5 C34 17 34 17 19 29" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>


              <div
                className="
                  absolute
                  bottom-5
                  right-5
                  flex
                  items-center
                "
              >
                <span className="block h-9 w-9 rounded-full bg-orange-300/35" />
                <span className="-ml-4 block h-9 w-9 rounded-full bg-red-300/35" />
              </div>


              <svg
                viewBox="0 0 420 260"
                aria-hidden="true"
                className="
                  absolute
                  inset-0
                  h-full
                  w-full
                  opacity-[0.10]
                "
                fill="none"
              >
                <path d="M-20 225 C95 140 178 153 274 202 S408 240 460 181" stroke="white" strokeWidth="2" />
                <path d="M-20 244 C95 159 178 172 274 221 S408 259 460 200" stroke="white" strokeWidth="1.3" />
              </svg>
            </>

          )}

        </div>


        <div
          className="
            relative
            z-10
          "
        >

        <div
          className="
            flex
            items-center
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
                text-white/60
              "
            >
              PAYMENT
            </p>


            <p
              className="
                mt-1
                text-[13px]
                font-medium
                text-white/90
              "
            >
              付款方式
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
              rounded-full
              border
              border-white/18
              bg-white/10
              backdrop-blur
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


        {profiles.length === 0
          ? (
            <button
              type="button"
              onClick={
                openCreate
              }
              className="
                mt-4
                flex
                min-h-[120px]
                w-full
                items-center
                justify-center
                rounded-[20px]
                border
                border-dashed
                border-white/18
                bg-white/8
                text-[10px]
                font-medium
                text-white/70
                backdrop-blur
              "
            >
              新增信用卡或現金
            </button>
          )
          : (
            <div
              className="
                mt-4
                space-y-2.5
              "
            >

              {profiles.map(
                profile => {

                  if (
                    profile.type ===
                    'cash'
                  ) {

                    return (
                      <button
                        key={
                          profile.id
                        }
                        type="button"

                        onClick={() =>
                          openEdit(
                            profile
                          )
                        }

                        className="
                          flex
                          w-full
                          items-center
                          justify-between
                          rounded-[18px]
                          border
                          border-white/14
                          bg-white/10
                          px-4
                          py-3
                          text-left
                          shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
                          backdrop-blur
                        "
                      >

                        <div>
                          <p
                            className="
                              text-[11px]
                              font-semibold
                              text-white/85
                            "
                          >
                            {
                              profile.name
                            }
                          </p>

                          <p
                            className="
                              mt-1
                              text-[8px]
                              tracking-[0.12em]
                              text-white/45
                            "
                          >
                            CASH
                          </p>
                        </div>


                        <span
                          className="
                            text-[14px]
                            text-white/30
                          "
                        >
                          ›
                        </span>

                      </button>
                    )

                  }


                  const currency =
                    profile.limitCurrency ??
                    'TWD'


                  const limit =
                    profile.limitAmount ??
                    0


                  const spent =
                    getPaymentProfileSpend(
                      profile.id,
                      currency
                    )


                  const ratio =
                    limit > 0
                      ? spent /
                        limit
                      : 0


                  const percent =
                    Math.round(
                      ratio *
                      100
                    )


                  const over =
                    ratio >
                    1


                  return (
                    <button
                      key={
                        profile.id
                      }
                      type="button"

                      onClick={() =>
                        openEdit(
                          profile
                        )
                      }

                      className="
                        w-full
                        rounded-[18px]
                        border
                        border-white/14
                        bg-white/10
                        px-4
                        py-3
                        text-left
                        shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
                        backdrop-blur
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
                              text-[11px]
                              font-semibold
                              text-white/90
                            "
                          >
                            {
                              profile.name
                            }
                          </p>

                          <p
                            className="
                              mt-1
                              text-[8px]
                              tracking-[0.12em]
                              text-white/45
                            "
                          >
                            CREDIT CARD
                          </p>
                        </div>


                        <div
                          className="
                            shrink-0
                            text-right
                          "
                        >

                          <p
                            className={`
                              text-[11px]
                              font-semibold

                              ${
                                over
                                  ? 'text-red-300'
                                  : 'text-white/90'
                              }
                            `}
                          >
                            {formatExpenseAmount(
                              spent,
                              currency
                            )}
                          </p>


                          <p
                            className="
                              mt-1
                              text-[8px]
                              text-white/45
                            "
                          >
                            / {
                              formatExpenseAmount(
                                limit,
                                currency
                              )
                            }
                          </p>

                        </div>

                      </div>


                      {!over
                        ? (
                          <>
                            <div
                              className="
                                mt-3
                                h-1.5
                                overflow-hidden
                                rounded-full
                                bg-white/10
                              "
                            >
                              <div
                                className={`
                                  h-full
                                  rounded-full
                                  transition-all

                                  ${
                                    ratio >= 0.8
                                      ? 'bg-amber-300'
                                      : 'bg-sky-300'
                                  }
                                `}

                                style={{
                                  width:
                                    `${Math.min(
                                      Math.max(
                                        ratio,
                                        0
                                      ),
                                      1
                                    ) * 100}%`,
                                }}
                              />
                            </div>


                            <div
                              className="
                                mt-2
                                flex
                                items-center
                                justify-between
                              "
                            >

                              <p
                                className="
                                  text-[8px]
                                  text-white/45
                                "
                              >
                                使用 {
                                  Math.max(
                                    0,
                                    percent
                                  )
                                }%
                              </p>

                            </div>
                          </>
                        )
                        : (
                          <>
                            {/* 實際花費 = 總長度 */}

                            <div
                              className="
                                mt-3
                                h-1.5
                                overflow-hidden
                                rounded-full
                                bg-white/10
                              "
                            >
                              <div
                                className="
                                  h-full
                                  w-full
                                  rounded-full
                                  bg-amber-300
                                "
                              />
                            </div>


                            {/* 額度上限 = 相對較短的紅色 Bar */}

                            <div
                              className="
                                mt-1.5
                                h-1
                                overflow-hidden
                                rounded-full
                                bg-white/5
                              "
                            >
                              <div
                                className="
                                  h-full
                                  rounded-full
                                  bg-red-400
                                  transition-all
                                "

                                style={{
                                  width:
                                    `${
                                      Math.min(
                                        Math.max(
                                          limit /
                                          Math.max(
                                            spent,
                                            1
                                          ),
                                          0
                                        ),
                                        1
                                      ) * 100
                                    }%`,
                                }}
                              />
                            </div>


                            <div
                              className="
                                mt-2
                                flex
                                items-center
                                justify-between
                                gap-3
                              "
                            >

                              <p
                                className="
                                  text-[8px]
                                  text-white/45
                                "
                              >
                                SPEND 100%
                              </p>


                              <p
                                className="
                                  text-[8px]
                                  font-semibold
                                  text-red-300
                                "
                              >
                                LIMIT {
                                  Math.round(
                                    Math.min(
                                      limit /
                                      Math.max(
                                        spent,
                                        1
                                      ),
                                      1
                                    ) *
                                    100
                                  )
                                }%
                              </p>


                              <p
                                className="
                                  text-[8px]
                                  font-semibold
                                  text-red-300
                                "
                              >
                                +{
                                  Math.max(
                                    0,
                                    percent - 100
                                  )
                                }%
                              </p>

                            </div>
                          </>
                        )
                      }

                    </button>
                  )

                }
              )}

            </div>
          )
        }


        {/* ==================================================
            Billing Summary
        ================================================== */}

        <div
          className="
            mt-5
            border-t
            border-white/18
            pt-4
          "
        >

          <button
            type="button"

            onClick={() =>
              setSummaryCurrencyPickerOpen(
                current =>
                  !current
              )
            }

            className="
              flex
              w-full
              items-end
              justify-between
              gap-4
              text-left
              transition
              active:opacity-70
            "
          >

            <div>

              <p
                className="
                  text-[8px]
                  font-semibold
                  tracking-[0.16em]
                  text-white/40
                "
              >
                TOTAL SPEND
              </p>


              <p
                className="
                  mt-1
                  text-[9px]
                  text-white/45
                "
              >
                所有付款方式累積
              </p>

            </div>


            <div
              className="
                text-right
              "
            >

              <p
                className="
                  text-[22px]
                  font-semibold
                  tracking-[-0.04em]
                  text-white
                "
              >
                {formatExpenseAmount(
                  paymentSummaryTotal,
                  paymentSummaryCurrency
                )}
              </p>


              <p
                className="
                  mt-1
                  text-[8px]
                  font-semibold
                  tracking-[0.14em]
                  text-white/55
                "
              >
                {
                  paymentSummaryCurrency
                }
                {' '}
                {
                  summaryCurrencyPickerOpen
                    ? '⌃'
                    : '⌄'
                }
              </p>

            </div>

          </button>


          {summaryCurrencyPickerOpen && (

            <div
              className="
                mt-3
                grid
                grid-cols-3
                gap-2
                rounded-[14px]
                bg-white/8
                p-2
                backdrop-blur
              "
            >

              {EXPENSE_CURRENCIES.map(
                currency => {

                  const selected =
                    currency ===
                    paymentSummaryCurrency


                  return (
                    <button
                      key={
                        currency
                      }

                      type="button"

                      onClick={() => {

                        setPaymentSummaryCurrency(
                          currency
                        )

                        setSummaryCurrencyPickerOpen(
                          false
                        )

                      }}

                      className={`
                        rounded-[11px]
                        border
                        px-2
                        py-2
                        text-[9px]
                        font-semibold
                        transition
                        active:scale-[0.97]

                        ${
                          selected
                            ? `
                                border-white/80
                                bg-white
                                text-slate-950
                              `
                            : `
                                border-white/10
                                bg-white/5
                                text-white/60
                              `
                        }
                      `}
                    >
                      {
                        currency
                      }
                    </button>
                  )

                }
              )}

            </div>

          )}

        </div>

        </div>

      </div>


      <PaymentWalletStylePicker
        open={
          stylePickerOpen
        }

        selectedStyle={
          walletStyle
        }

        onSelect={
          style => {

            setWalletStyle(
              style
            )

            setStylePickerOpen(
              false
            )

          }
        }

        onClose={() =>
          setStylePickerOpen(
            false
          )
        }
      />


      <PaymentProfileEditor
        open={
          editorOpen
        }

        profile={
          selectedProfile
        }

        onSave={
          profile => {

            setProfiles(
              current =>
                current.some(
                  item =>
                    item.id ===
                    profile.id
                )
                  ? current.map(
                      item =>
                        item.id ===
                        profile.id
                          ? profile
                          : item
                    )
                  : [
                      ...current,
                      profile,
                    ]
            )


            setEditorOpen(
              false
            )

          }
        }

        onDelete={
          selectedProfile
            ? () => {

                const confirmed =
                  window.confirm(
                    `確定要刪除「${selectedProfile.name}」嗎？`
                  )


                if (!confirmed) {
                  return
                }


                setProfiles(
                  current =>
                    current.filter(
                      item =>
                        item.id !==
                        selectedProfile.id
                    )
                )


                setEditorOpen(
                  false
                )

              }
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


export default PaymentMethodWallet
