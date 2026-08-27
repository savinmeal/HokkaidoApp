import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'

import {
  createPortal,
} from 'react-dom'

import type {
  ExpenseCurrency,
  ExpensePaymentMethod,
  TripExpense,
} from '../data/tripData'

import {
  EXPENSE_CURRENCIES,
  convertExpenseAmount,
  formatExpenseAmount,
  sumExpensesInCurrency,
} from '../data/expenseCurrency'

import {
  deleteExpensePhotos,
  getExpensePhotoBlob,
  saveExpensePhoto,
} from '../data/expensePhotoStorage'

import {
  dispatchPaymentUsageUpdated,
  getPaymentProfileSpend,
  loadPaymentProfiles,
  type PaymentProfile,
} from '../data/paymentMethodStorage'


// ============================================================
// Helpers
// ============================================================

function createExpenseId() {

  if (
    typeof crypto !== 'undefined' &&
    'randomUUID' in crypto
  ) {
    return crypto.randomUUID()
  }


  return (
    `expense-${Date.now()}-` +
    Math.random()
      .toString(36)
      .slice(2, 9)
  )

}


function getPaymentLabel(
  method:
    ExpensePaymentMethod |
    undefined
) {

  if (
    method === 'cash'
  ) {
    return '現金'
  }


  if (
    method === 'credit_card'
  ) {
    return '信用卡'
  }


  return '未設定'
}


function getCurrencySymbol(
  currency:
    ExpenseCurrency
) {

  switch (
    currency
  ) {

    case 'TWD':
      return 'NT$'

    case 'USD':
      return 'US$'

    default:
      return '¥'

  }

}


function getPaymentDisplayLabel(
  method:
    ExpensePaymentMethod |
    undefined,
  paymentProfileId:
    string |
    undefined,
  profiles:
    PaymentProfile[]
) {

  if (paymentProfileId) {

    const profile =
      profiles.find(
        item =>
          item.id ===
          paymentProfileId
      )


    if (profile) {
      return profile.name
    }

  }


  return getPaymentLabel(
    method
  )

}


// ============================================================
// Photo Loader
// ============================================================

function useExpensePhotoUrls(
  photoIds: string[]
) {

  const [
    urls,
    setUrls,
  ] = useState<
    {
      id: string
      url: string
    }[]
  >([])


  useEffect(() => {

    let cancelled =
      false


    const load =
      async () => {

        const next:
          {
            id: string
            url: string
          }[] =
        []


        for (
          const id
          of photoIds
        ) {

          try {

            const blob =
              await getExpensePhotoBlob(
                id
              )


            if (
              blob &&
              !cancelled
            ) {

              next.push({
                id,

                url:
                  URL.createObjectURL(
                    blob
                  ),
              })

            }

          } catch (error) {

            console.error(
              'Expense photo load failed:',
              error
            )

          }

        }


        if (
          cancelled
        ) {

          next.forEach(
            item =>
              URL.revokeObjectURL(
                item.url
              )
          )

          return
        }


        setUrls(
          next
        )

      }


    void load()


    return () => {

      cancelled =
        true


      setUrls(
        current => {

          current.forEach(
            item =>
              URL.revokeObjectURL(
                item.url
              )
          )


          return []
        }
      )

    }

  }, [
    photoIds,
  ])


  return urls

}


// ============================================================
// Draft Photo Preview
// ============================================================

function ExpensePhotoPreview({
  photoIds,
}: {
  photoIds: string[]
}) {

  const urls =
    useExpensePhotoUrls(
      photoIds
    )


  if (
    urls.length === 0
  ) {
    return null
  }


  return (
    <div
      className="
        mt-3
        flex
        gap-2
        overflow-x-auto
        pb-1
        [scrollbar-width:none]
        [&::-webkit-scrollbar]:hidden
      "
    >
      {urls.map(
        item => (
          <img
            key={
              item.id
            }
            src={
              item.url
            }
            alt="消費附件"
            className="
              h-16
              w-16
              shrink-0
              rounded-[14px]
              object-cover
            "
          />
        )
      )}
    </div>
  )

}


// ============================================================
// Full Photo Viewer
// ============================================================

function ExpensePhotoViewer({
  open,
  photoIds,
  onClose,
}: {
  open: boolean
  photoIds: string[]
  onClose: () => void
}) {

  const urls =
    useExpensePhotoUrls(
      open
        ? photoIds
        : []
    )


  const [
    index,
    setIndex,
  ] = useState(0)


  useEffect(() => {

    if (open) {
      setIndex(0)
    }

  }, [
    open,
    photoIds,
  ])


  if (
    !open ||
    typeof document ===
      'undefined'
  ) {
    return null
  }


  const current =
    urls[
      Math.min(
        index,
        Math.max(
          urls.length - 1,
          0
        )
      )
    ]


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

      onPointerCancel={event => {
        event.stopPropagation()
      }}

      className="
        fixed
        inset-0
        z-[1200]
        flex
        items-center
        justify-center
        bg-slate-950/95
        px-4
        pb-[env(safe-area-inset-bottom)]
        pt-[env(safe-area-inset-top)]
      "
    >

      <button
        type="button"
        aria-label="關閉照片"
        onClick={
          onClose
        }
        className="
          absolute
          right-5
          top-[calc(18px+env(safe-area-inset-top))]
          z-20
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          bg-white/12
          text-[22px]
          font-light
          text-white
          backdrop-blur-xl
        "
      >
        ×
      </button>


      {current
        ? (
          <img
            src={
              current.url
            }
            alt="消費紀錄照片"
            className="
              max-h-[78dvh]
              max-w-full
              rounded-[20px]
              object-contain
            "
          />
        )
        : (
          <p
            className="
              text-[12px]
              text-white/70
            "
          >
            正在讀取照片...
          </p>
        )
      }


      {
        urls.length >
        1 && (
          <>
            <button
              type="button"
              disabled={
                index <= 0
              }
              onClick={() =>
                setIndex(
                  current =>
                    Math.max(
                      0,
                      current - 1
                    )
                )
              }
              className="
                absolute
                left-4
                top-1/2
                flex
                h-11
                w-11
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-white/12
                text-[24px]
                text-white
                backdrop-blur-xl
                disabled:opacity-25
              "
            >
              ‹
            </button>


            <button
              type="button"
              disabled={
                index >=
                urls.length - 1
              }
              onClick={() =>
                setIndex(
                  current =>
                    Math.min(
                      urls.length - 1,
                      current + 1
                    )
                )
              }
              className="
                absolute
                right-4
                top-1/2
                flex
                h-11
                w-11
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-white/12
                text-[24px]
                text-white
                backdrop-blur-xl
                disabled:opacity-25
              "
            >
              ›
            </button>


            <p
              className="
                absolute
                bottom-[calc(22px+env(safe-area-inset-bottom))]
                left-1/2
                -translate-x-1/2
                rounded-full
                bg-white/10
                px-3
                py-1.5
                text-[10px]
                font-medium
                text-white/80
                backdrop-blur-xl
              "
            >
              {index + 1} / {urls.length}
            </p>
          </>
        )
      }

    </div>,
    document.body
  )

}


// ============================================================
// Props
// ============================================================

type ExpenseBookSheetProps = {
  open: boolean

  activityTitle: string

  expenses: TripExpense[]

  // Trip 主頁目前選擇的總額顯示幣別。
  displayCurrency:
    ExpenseCurrency

  onChange: (
    expenses: TripExpense[]
  ) => void

  onClose: () => void
}


// ============================================================
// Component
// ============================================================

function ExpenseBookSheet({
  open,
  activityTitle,
  expenses,
  displayCurrency,
  onChange,
  onClose,
}: ExpenseBookSheetProps) {

  const [
    item,
    setItem,
  ] = useState('')


  const [
    detail,
    setDetail,
  ] = useState('')


  const [
    amount,
    setAmount,
  ] = useState('')


  const [
    currency,
    setCurrency,
  ] = useState<
    ExpenseCurrency
  >(
    'JPY'
  )


  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState<
    ExpensePaymentMethod
  >(
    'credit_card'
  )


  const [
    paymentProfiles,
    setPaymentProfiles,
  ] = useState<
    PaymentProfile[]
  >(
    loadPaymentProfiles
  )


  const [
    paymentProfileId,
    setPaymentProfileId,
  ] = useState<
    string |
    null
  >(
    null
  )


  const [
    editingExpenseId,
    setEditingExpenseId,
  ] = useState<
    string |
    null
  >(
    null
  )


  const [
    editingPhotoIds,
    setEditingPhotoIds,
  ] = useState<string[]>(
    []
  )


  const [
    viewerPhotoIds,
    setViewerPhotoIds,
  ] = useState<string[]>(
    []
  )


  const [
    photoViewerOpen,
    setPhotoViewerOpen,
  ] = useState(false)


  const [
    draftPhotoIds,
    setDraftPhotoIds,
  ] = useState<string[]>(
    []
  )


  const [
    savingPhoto,
    setSavingPhoto,
  ] = useState(false)


  const cameraInputRef =
    useRef<HTMLInputElement>(
      null
    )


  const albumInputRef =
    useRef<HTMLInputElement>(
      null
    )


  const expenseFormRef =
    useRef<HTMLDivElement>(
      null
    )


  const total =
    sumExpensesInCurrency(
      expenses,
      displayCurrency
    )


  const availablePaymentProfiles =
    paymentProfiles.filter(
      profile =>
        paymentMethod ===
        'credit_card'
          ? profile.type ===
            'credit_card'
          : profile.type ===
            'cash'
    )


  useEffect(() => {

    if (open) {

      setPaymentProfiles(
        loadPaymentProfiles()
      )

    }

  }, [
    open,
  ])


  useEffect(() => {

    if (!open) {

      setItem('')
      setDetail('')
      setAmount('')
      setCurrency('JPY')
      setPaymentMethod(
        'credit_card'
      )
      setPaymentProfileId(
        null
      )
      setEditingExpenseId(
        null
      )
      setEditingPhotoIds([])
      setViewerPhotoIds([])
      setPhotoViewerOpen(
        false
      )
      setDraftPhotoIds([])
      setSavingPhoto(false)

    }

  }, [
    open,
  ])



  // ==========================================================
  // Photo
  // ==========================================================

  const addPhotos =
    async (
      files: FileList |
        null
    ) => {

      if (
        !files ||
        files.length === 0
      ) {
        return
      }


      setSavingPhoto(
        true
      )


      try {

        const ids:
          string[] =
        []


        for (
          const file
          of Array.from(
            files
          )
        ) {

          if (
            !file.type.startsWith(
              'image/'
            )
          ) {
            continue
          }


          const id =
            await saveExpensePhoto(
              file
            )


          ids.push(
            id
          )

        }


        setDraftPhotoIds(
          current => [
            ...current,
            ...ids,
          ]
        )

      } catch (error) {

        console.error(
          'Expense photo save failed:',
          error
        )


        window.alert(
          '照片儲存失敗，請重新嘗試。'
        )

      } finally {

        setSavingPhoto(
          false
        )

      }

    }


  const handlePhotoInput =
    (
      event:
        ChangeEvent<HTMLInputElement>
    ) => {

      void addPhotos(
        event.target.files
      )


      // 允許再次選同一張照片。
      event.target.value =
        ''

    }



  // ==========================================================
  // Expense actions
  // ==========================================================

  const resetExpenseForm =
    () => {

      setItem('')
      setDetail('')
      setAmount('')
      setPaymentProfileId(
        null
      )
      setEditingExpenseId(
        null
      )
      setEditingPhotoIds([])
      setDraftPhotoIds([])

    }


  const editExpense =
    (
      expense:
        TripExpense
    ) => {

      // 如果目前新增表單已有尚未保存的照片，
      // 先清掉避免 orphan blobs。
      if (
        draftPhotoIds.length >
        0
      ) {

        void deleteExpensePhotos(
          draftPhotoIds
        )

      }


      setEditingExpenseId(
        expense.id
      )

      setItem(
        expense.item
      )

      setDetail(
        expense.detail ??
        ''
      )

      setAmount(
        String(
          expense.amount
        )
      )

      setCurrency(
        expense.currency ??
        'JPY'
      )

      setPaymentMethod(
        expense.paymentMethod ??
        'credit_card'
      )

      setPaymentProfileId(
        expense.paymentProfileId ??
        null
      )

      setEditingPhotoIds(
        expense.photoIds ??
        []
      )

      setDraftPhotoIds([])


      window.setTimeout(
        () => {

          expenseFormRef.current
            ?.scrollIntoView({
              behavior:
                'smooth',

              block:
                'start',
            })

        },
        0
      )

    }


  const cancelExpenseEdit =
    async () => {

      if (
        draftPhotoIds.length >
        0
      ) {

        try {

          await deleteExpensePhotos(
            draftPhotoIds
          )

        } catch (error) {

          console.error(
            'Edit draft photo cleanup failed:',
            error
          )

        }

      }


      resetExpenseForm()

    }


  const confirmCreditCardLimit =
    (
      nextAmount:
        number
    ) => {

      if (
        paymentMethod !==
        'credit_card' ||
        !paymentProfileId
      ) {
        return true
      }


      const profile =
        paymentProfiles.find(
          item =>
            item.id ===
            paymentProfileId
        )


      if (
        !profile ||
        profile.type !==
        'credit_card' ||
        !profile.limitAmount ||
        profile.limitAmount <=
          0
      ) {
        return true
      }


      const limitCurrency =
        profile.limitCurrency ??
        'TWD'


      let existingSpend =
        getPaymentProfileSpend(
          profile.id,
          limitCurrency
        )


      if (editingExpenseId) {

        const oldExpense =
          expenses.find(
            expense =>
              expense.id ===
              editingExpenseId
          )


        if (
          oldExpense &&
          oldExpense.paymentProfileId ===
          profile.id
        ) {

          existingSpend -=
            convertExpenseAmount(
              Number(
                oldExpense.amount ||
                0
              ),
              oldExpense.currency ??
              'JPY',
              limitCurrency
            )

        }

      }


      const nextSpend =
        existingSpend +
        convertExpenseAmount(
          nextAmount,
          currency,
          limitCurrency
        )


      if (
        nextSpend <=
        profile.limitAmount
      ) {
        return true
      }


      return window.confirm(
        `${profile.name} 將超過設定額度。\n\n` +
        `儲存後：${formatExpenseAmount(
          nextSpend,
          limitCurrency
        )}\n` +
        `額度：${formatExpenseAmount(
          profile.limitAmount,
          limitCurrency
        )}\n\n` +
        `仍要記錄這筆消費嗎？`
      )

    }



  const saveExpense =
    () => {

      const cleanItem =
        item.trim()


      const numericAmount =
        Number(
          amount
        )


      if (
        !cleanItem
      ) {

        window.alert(
          '請輸入消費項目。'
        )

        return
      }


      if (
        !Number.isFinite(
          numericAmount
        ) ||
        numericAmount <= 0
      ) {

        window.alert(
          '請輸入正確的消費金額。'
        )

        return
      }


      const normalizedAmount =
        currency === 'USD'
          ? Math.round(
              numericAmount *
              100
            ) / 100
          : Math.round(
              numericAmount
            )


      if (
        !confirmCreditCardLimit(
          normalizedAmount
        )
      ) {
        return
      }


      if (
        editingExpenseId
      ) {

        onChange(
          expenses.map(
            expense =>
              expense.id ===
              editingExpenseId
                ? {
                    ...expense,

                    item:
                      cleanItem,

                    detail:
                      detail
                        .trim() ||
                      undefined,

                    amount:
                      normalizedAmount,

                    currency,

                    paymentMethod,

                    paymentProfileId:
                      paymentProfileId ??
                      undefined,

                    photoIds:
                      [
                        ...editingPhotoIds,
                        ...draftPhotoIds,
                      ].length > 0
                        ? [
                            ...editingPhotoIds,
                            ...draftPhotoIds,
                          ]
                        : undefined,
                  }
                : expense
          )
        )


        dispatchPaymentUsageUpdated()


        resetExpenseForm()

        return
      }


      const next:
        TripExpense =
      {
        id:
          createExpenseId(),

        item:
          cleanItem,

        detail:
          detail
            .trim() ||
          undefined,

        amount:
          normalizedAmount,

        currency,

        paymentMethod,

        paymentProfileId:
          paymentProfileId ??
          undefined,

        photoIds:
          draftPhotoIds.length >
          0
            ? [
                ...draftPhotoIds,
              ]
            : undefined,

        createdAt:
          Date.now(),
      }


      onChange([
        ...expenses,
        next,
      ])


      dispatchPaymentUsageUpdated()


      resetExpenseForm()

    }


  const deleteExpense =
    async (
      expense:
        TripExpense
    ) => {

      const confirmed =
        window.confirm(
          `確定要刪除「${expense.item}」這筆消費嗎？`
        )


      if (!confirmed) {
        return
      }


      try {

        if (
          expense.photoIds?.length
        ) {

          await deleteExpensePhotos(
            expense.photoIds
          )

        }

      } catch (error) {

        console.error(
          'Expense photos cleanup failed:',
          error
        )

      }


      onChange(
        expenses.filter(
          item =>
            item.id !==
            expense.id
        )
      )


      dispatchPaymentUsageUpdated()


      if (
        editingExpenseId ===
        expense.id
      ) {

        resetExpenseForm()

      }

    }


  const closeSheet =
    async () => {

      if (
        draftPhotoIds.length >
        0
      ) {

        try {

          await deleteExpensePhotos(
            draftPhotoIds
          )

        } catch (error) {

          console.error(
            'Draft photo cleanup failed:',
            error
          )

        }

      }


      setDraftPhotoIds([])
      setEditingPhotoIds([])
      setEditingExpenseId(
        null
      )

      onClose()

    }



  // ==========================================================
  // Render
  // ==========================================================

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

      onPointerCancel={event => {
        event.stopPropagation()
      }}

      className="
        fixed
        inset-0
        z-[1000]
        flex
        items-end
        justify-center
      "
    >

      <button
        type="button"
        aria-label="關閉記帳"
        onClick={() => {
          void closeSheet()
        }}
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
          max-h-[92dvh]
          w-full
          max-w-md
          overflow-y-auto
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


        {/* Header */}

        <div
          className="
            mt-5
            flex
            items-start
            justify-between
            gap-4
          "
        >

          <div
            className="
              min-w-0
            "
          >

            <p
              className="
                text-[9px]
                font-semibold
                tracking-[0.18em]
                text-slate-500
              "
            >
              EXPENSE BOOK
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
              消費紀錄
            </h2>


            <p
              className="
                mt-2
                truncate
                text-[11px]
                text-slate-600
              "
            >
              {activityTitle}
            </p>

          </div>


          <button
            type="button"
            onClick={() => {
              void closeSheet()
            }}
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
              font-light
              text-slate-700
              transition
              active:scale-95
            "
          >
            ×
          </button>

        </div>


        {/* Total */}

        <div
          className="
            mt-5
            rounded-[22px]
            bg-slate-950
            px-5
            py-4
            text-white
          "
        >

          <div
            className="
              flex
              items-end
              justify-between
              gap-4
            "
          >

            <div>
              <p
                className="
                  text-[9px]
                  font-semibold
                  tracking-[0.16em]
                  text-white/65
                "
              >
                TOTAL SPEND
              </p>

              <p
                className="
                  mt-2
                  text-[28px]
                  font-medium
                  tracking-[-0.04em]
                "
              >
                {formatExpenseAmount(
                  total,
                  displayCurrency
                )}
              </p>
            </div>


            <p
              className="
                pb-1
                text-[9px]
                font-semibold
                tracking-[0.14em]
                text-white/60
              "
            >
              {displayCurrency}
            </p>

          </div>


          <p
            className="
              mt-3
              text-[9px]
              leading-4
              text-white/55
            "
          >
            多幣別紀錄會使用 App 本機顯示匯率換算，不影響每筆原始金額。
          </p>

        </div>


        {/* Existing Expenses */}

        {
          expenses.length >
          0 && (

            <div
              className="
                mt-6
              "
            >

              <p
                className="
                  text-[9px]
                  font-semibold
                  tracking-[0.16em]
                  text-slate-500
                "
              >
                RECORDS
              </p>


              <div
                className="
                  mt-2
                  space-y-2
                "
              >

                {expenses.map(
                  expense => {

                    const photoCount =
                      expense.photoIds
                        ?.length ??
                      0


                    return (
                      <div
                        key={
                          expense.id
                        }
                        className={`
                          rounded-[18px]
                          border
                          px-4
                          py-3
                          transition

                          ${
                            editingExpenseId ===
                            expense.id
                              ? `
                                  border-slate-400
                                  bg-white
                                  shadow-sm
                                `
                              : `
                                  border-slate-200
                                  bg-white/75
                                `
                          }
                        `}
                      >

                        <div
                          className="
                            flex
                            items-start
                            justify-between
                            gap-4
                          "
                        >

                          <div
                            className="
                              min-w-0
                            "
                          >

                            <p
                              className="
                                text-[13px]
                                font-semibold
                                text-slate-800
                              "
                            >
                              {expense.item}
                            </p>


                            <div
                              className="
                                mt-1.5
                                flex
                                flex-wrap
                                items-center
                                gap-1.5
                              "
                            >

                              <span
                                className="
                                  rounded-full
                                  bg-slate-100
                                  px-2
                                  py-1
                                  text-[8px]
                                  font-semibold
                                  text-slate-600
                                "
                              >
                                {
                                  expense.currency ??
                                  'JPY'
                                }
                              </span>


                              <span
                                className="
                                  rounded-full
                                  bg-slate-100
                                  px-2
                                  py-1
                                  text-[8px]
                                  font-semibold
                                  text-slate-600
                                "
                              >
                                {getPaymentDisplayLabel(
                                  expense.paymentMethod,
                                  expense.paymentProfileId,
                                  paymentProfiles
                                )}
                              </span>


                              {photoCount > 0 && (
                                <button
                                  type="button"

                                  aria-label={`查看 ${photoCount} 張照片`}

                                  title="查看照片"

                                  onClick={() => {

                                    setViewerPhotoIds(
                                      expense.photoIds ??
                                      []
                                    )

                                    setPhotoViewerOpen(
                                      true
                                    )

                                  }}

                                  className="
                                    inline-flex
                                    items-center
                                    gap-1
                                    rounded-full
                                    bg-sky-50
                                    px-2
                                    py-1
                                    text-[8px]
                                    font-semibold
                                    text-sky-700
                                    transition
                                    active:scale-[0.96]
                                  "
                                >

                                  <svg
                                    width="11"
                                    height="11"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                  >
                                    <rect
                                      x="3"
                                      y="4"
                                      width="18"
                                      height="16"
                                      rx="2"
                                    />

                                    <circle
                                      cx="9"
                                      cy="9"
                                      r="1.5"
                                    />

                                    <path d="M4 17l5-5 4 4 2-2 5 5" />
                                  </svg>

                                  {photoCount}

                                </button>
                              )}

                            </div>


                            {expense.detail && (

                              <p
                                className="
                                  mt-2
                                  text-[10px]
                                  leading-5
                                  text-slate-500
                                "
                              >
                                {expense.detail}
                              </p>

                            )}

                          </div>


                          <div
                            className="
                              shrink-0
                              text-right
                            "
                          >

                            <p
                              className="
                                text-[13px]
                                font-semibold
                                text-slate-900
                              "
                            >
                              {formatExpenseAmount(
                                expense.amount,
                                expense.currency ??
                                'JPY'
                              )}
                            </p>


                            <div
                              className="
                                mt-2
                                flex
                                items-center
                                justify-end
                                gap-3
                              "
                            >

                              <button
                                type="button"

                                onClick={() =>
                                  editExpense(
                                    expense
                                  )
                                }

                                className="
                                  text-[9px]
                                  font-semibold
                                  text-sky-600
                                "
                              >
                                編輯
                              </button>


                              <button
                                type="button"

                                onClick={() => {
                                  void deleteExpense(
                                    expense
                                  )
                                }}

                                className="
                                  text-[9px]
                                  font-medium
                                  text-red-500
                                "
                              >
                                刪除
                              </button>

                            </div>

                          </div>

                        </div>

                      </div>
                    )

                  }
                )}

              </div>

            </div>

          )
        }


        {/* New Expense */}

        <div
          ref={
            expenseFormRef
          }

          className="
            mt-6
            scroll-mt-4
            border-t
            border-slate-200
            pt-5
          "
        >

          <p
            className="
              text-[9px]
              font-semibold
              tracking-[0.16em]
              text-slate-500
            "
          >
            {
              editingExpenseId
                ? 'EDIT EXPENSE'
                : 'ADD EXPENSE'
            }
          </p>


          <div
            className="
              mt-3
              space-y-4
            "
          >

            <label
              className="
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
                ITEM
              </span>


              <input
                type="text"
                value={
                  item
                }
                placeholder="例如：午餐、纜車票、停車費"
                onChange={event =>
                  setItem(
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


            {/* Currency */}

            <div>

              <p
                className="
                  text-[10px]
                  font-semibold
                  tracking-[0.1em]
                  text-slate-600
                "
              >
                CURRENCY
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
                  option => {

                    const selected =
                      currency ===
                      option


                    return (
                      <button
                        key={
                          option
                        }
                        type="button"
                        onClick={() =>
                          setCurrency(
                            option
                          )
                        }
                        className={`
                          rounded-[14px]
                          border
                          px-3
                          py-2.5
                          text-[10px]
                          font-semibold
                          transition
                          active:scale-[0.98]

                          ${
                            selected
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
                        {option}
                      </button>
                    )

                  }
                )}

              </div>

            </div>


            {/* Amount */}

            <label
              className="
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
                AMOUNT · {currency}
              </span>


              <div
                className="
                  relative
                  mt-2
                "
              >

                <span
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-[13px]
                    text-slate-500
                  "
                >
                  {getCurrencySymbol(
                    currency
                  )}
                </span>


                <input
                  type="number"
                  inputMode={
                    currency === 'USD'
                      ? 'decimal'
                      : 'numeric'
                  }
                  min="0"
                  step={
                    currency === 'USD'
                      ? '0.01'
                      : '1'
                  }
                  value={
                    amount
                  }
                  placeholder="0"
                  onChange={event =>
                    setAmount(
                      event.target.value
                    )
                  }
                  className="
                    w-full
                    rounded-[16px]
                    border
                    border-slate-200
                    bg-white
                    py-3
                    pl-12
                    pr-4
                    text-[14px]
                    text-slate-900
                    outline-none
                    placeholder:text-slate-400
                    focus:border-slate-400
                  "
                />

              </div>

            </label>


            {/* Payment Method */}

            <div>

              <p
                className="
                  text-[10px]
                  font-semibold
                  tracking-[0.1em]
                  text-slate-600
                "
              >
                PAYMENT
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

                  onClick={() => {

                    setPaymentMethod(
                      'credit_card'
                    )

                    setPaymentProfileId(
                      null
                    )

                  }}

                  className={`
                    rounded-[14px]
                    border
                    px-3
                    py-3
                    text-[10px]
                    font-semibold
                    transition
                    active:scale-[0.98]

                    ${
                      paymentMethod ===
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

                  onClick={() => {

                    setPaymentMethod(
                      'cash'
                    )

                    setPaymentProfileId(
                      null
                    )

                  }}

                  className={`
                    rounded-[14px]
                    border
                    px-3
                    py-3
                    text-[10px]
                    font-semibold
                    transition
                    active:scale-[0.98]

                    ${
                      paymentMethod ===
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


              <div
                className="
                  mt-3
                "
              >

                <p
                  className="
                    text-[9px]
                    font-semibold
                    tracking-[0.1em]
                    text-slate-500
                  "
                >
                  {
                    paymentMethod ===
                    'credit_card'
                      ? 'CARD'
                      : 'PAYMENT PROFILE'
                  }
                </p>


                {
                  availablePaymentProfiles.length >
                  0
                    ? (
                      <div
                        className="
                          mt-2
                          flex
                          gap-2
                          overflow-x-auto
                          pb-1
                          [scrollbar-width:none]
                          [&::-webkit-scrollbar]:hidden
                        "
                      >

                        {availablePaymentProfiles.map(
                          profile => {

                            const selected =
                              paymentProfileId ===
                              profile.id


                            return (
                              <button
                                key={
                                  profile.id
                                }

                                type="button"

                                onClick={() =>
                                  setPaymentProfileId(
                                    profile.id
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
                                    selected
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
                                {profile.name}
                              </button>
                            )

                          }
                        )}

                      </div>
                    )
                    : (
                      <p
                        className="
                          mt-2
                          rounded-[13px]
                          bg-slate-100
                          px-3
                          py-2.5
                          text-[9px]
                          leading-4
                          text-slate-500
                        "
                      >
                        {
                          paymentMethod ===
                          'credit_card'
                            ? '尚未建立信用卡。可先到 Home → PAYMENT 新增卡片。'
                            : '未建立現金 Profile；仍可直接以「現金」記帳。'
                        }
                      </p>
                    )
                }

              </div>

            </div>


            <label
              className="
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
                DETAIL
              </span>


              <textarea
                value={
                  detail
                }
                rows={3}
                placeholder="例如：2 人套餐、現金付款、停車 4 小時..."
                onChange={event =>
                  setDetail(
                    event.target.value
                  )
                }
                className="
                  mt-2
                  w-full
                  resize-none
                  rounded-[16px]
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-3
                  text-[13px]
                  leading-5
                  text-slate-900
                  outline-none
                  placeholder:text-slate-400
                  focus:border-slate-400
                "
              />

            </label>


            {/* Photo actions */}

            <div>

              <p
                className="
                  text-[10px]
                  font-semibold
                  tracking-[0.1em]
                  text-slate-600
                "
              >
                PHOTO
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
                  disabled={
                    savingPhoto
                  }
                  onClick={() =>
                    cameraInputRef
                      .current
                      ?.click()
                  }
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-[15px]
                    border
                    border-slate-200
                    bg-white
                    px-3
                    py-3
                    text-[10px]
                    font-medium
                    text-slate-600
                    transition
                    active:scale-[0.98]
                    disabled:opacity-40
                  "
                >

                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4 7h4l1.5-2h5L16 7h4v12H4V7Z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>

                  相機

                </button>


                <button
                  type="button"
                  disabled={
                    savingPhoto
                  }
                  onClick={() =>
                    albumInputRef
                      .current
                      ?.click()
                  }
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-[15px]
                    border
                    border-slate-200
                    bg-white
                    px-3
                    py-3
                    text-[10px]
                    font-medium
                    text-slate-600
                    transition
                    active:scale-[0.98]
                    disabled:opacity-40
                  "
                >

                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <circle cx="9" cy="9" r="1.5" />
                    <path d="M4 17l5-5 4 4 2-2 5 5" />
                  </svg>

                  相簿

                </button>

              </div>


              <input
                ref={
                  cameraInputRef
                }
                type="file"
                accept="image/*"
                capture="environment"
                onChange={
                  handlePhotoInput
                }
                className="hidden"
              />


              <input
                ref={
                  albumInputRef
                }
                type="file"
                accept="image/*"
                multiple
                onChange={
                  handlePhotoInput
                }
                className="hidden"
              />


              {savingPhoto && (

                <p
                  className="
                    mt-2
                    text-[9px]
                    text-slate-500
                  "
                >
                  正在儲存照片...
                </p>

              )}


              <ExpensePhotoPreview
                photoIds={[
                  ...editingPhotoIds,
                  ...draftPhotoIds,
                ]}
              />

            </div>

          </div>


          <button
            type="button"
            disabled={
              savingPhoto ||
              !item.trim() ||
              !amount
            }
            onClick={
              saveExpense
            }
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
              transition
              active:scale-[0.99]
              disabled:cursor-not-allowed
              disabled:opacity-30
            "
          >
            {
              editingExpenseId
                ? '儲存修改'
                : '加入消費'
            }
          </button>


          {editingExpenseId && (
            <button
              type="button"

              onClick={() => {
                void cancelExpenseEdit()
              }}

              className="
                mt-2
                w-full
                rounded-[15px]
                border
                border-slate-200
                bg-white
                px-4
                py-3
                text-[10px]
                font-semibold
                text-slate-600
                transition
                active:scale-[0.99]
              "
            >
              取消編輯
            </button>
          )}

        </div>


        <ExpensePhotoViewer
          open={
            photoViewerOpen
          }

          photoIds={
            viewerPhotoIds
          }

          onClose={() => {
            setPhotoViewerOpen(
              false
            )
          }}
        />

      </section>

    </div>,
    document.body
  )

}


export default ExpenseBookSheet