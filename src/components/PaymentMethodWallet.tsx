import {
  useEffect,
  useMemo,
  useState,
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
        className="
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
                text-white/55
              "
            >
              PAYMENT
            </p>


            <p
              className="
                mt-1
                text-[13px]
                font-medium
                text-white/85
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
                border-white/20
                bg-white/5
                text-[10px]
                font-medium
                text-white/60
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
                          border-white/10
                          bg-white/6
                          px-4
                          py-3
                          text-left
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
                        border-white/10
                        bg-white/6
                        px-4
                        py-3
                        text-left
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
            border-white/15
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
                bg-white/6
                p-2
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
