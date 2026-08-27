import type {
  ExpenseCurrency,
  TripExpense,
} from './tripData'


// ============================================================
// Expense Display Currency
// ============================================================

export const EXPENSE_DISPLAY_CURRENCY_KEY =
  'travel_v100_expense_display_currency_v1'


export const EXPENSE_CURRENCIES:
  ExpenseCurrency[] =
[
  'JPY',
  'TWD',
  'USD',
]


// ============================================================
// Local Display Exchange Rates
//
// 為避免依賴外部匯率 API，這裡使用 App 本機「顯示用匯率」。
// 基準全部換算成 TWD。
//
// 這不是銀行 / 信用卡實際結算匯率。
// 之後只要修改這個表，全 App 的換算顯示就會一起更新。
// ============================================================

export const DISPLAY_RATE_TO_TWD:
  Record<
    ExpenseCurrency,
    number
  > =
{
  TWD:
    1,

  JPY:
    0.21,

  USD:
    31.8,
}


export function isExpenseCurrency(
  value:
    string |
    null |
    undefined
): value is ExpenseCurrency {

  return (
    value === 'TWD' ||
    value === 'JPY' ||
    value === 'USD'
  )

}


export function convertExpenseAmount(
  amount: number,
  from: ExpenseCurrency,
  to: ExpenseCurrency
) {

  if (
    from === to
  ) {
    return amount
  }


  const twd =
    amount *
    DISPLAY_RATE_TO_TWD[
      from
    ]


  return (
    twd /
    DISPLAY_RATE_TO_TWD[
      to
    ]
  )

}


export function formatExpenseAmount(
  amount: number,
  currency: ExpenseCurrency
) {

  const locale =
    currency === 'JPY'
      ? 'ja-JP'
      : currency === 'TWD'
        ? 'zh-TW'
        : 'en-US'


  return new Intl.NumberFormat(
    locale,
    {
      style:
        'currency',

      currency,

      maximumFractionDigits:
        currency === 'USD'
          ? 2
          : 0,
    }
  ).format(
    amount
  )

}


export function sumExpensesInCurrency(
  expenses:
    TripExpense[] |
    undefined,
  displayCurrency:
    ExpenseCurrency
) {

  return (
    expenses ??
    []
  ).reduce(
    (
      sum,
      expense
    ) => {

      const sourceCurrency =
        expense.currency ??
        'JPY'


      return (
        sum +
        convertExpenseAmount(
          Number(
            expense.amount ||
            0
          ),
          sourceCurrency,
          displayCurrency
        )
      )

    },
    0
  )

}