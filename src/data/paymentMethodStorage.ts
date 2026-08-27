import type {
  ExpenseCurrency,
  TripDay,
  TripExpense,
} from './tripData'

import {
  convertExpenseAmount,
} from './expenseCurrency'

import {
  TRIP_STORAGE_KEY,
} from './tripData'


export type PaymentProfileType =
  | 'credit_card'
  | 'cash'


export type PaymentProfile = {
  id: string

  type:
    PaymentProfileType

  // 顯示名稱，例如：
  // 玉山 Unicard、國泰 CUBE、旅遊現金
  name: string

  // 信用卡額度。
  // cash 可不設定。
  limitAmount?: number

  limitCurrency?:
    ExpenseCurrency

  createdAt: number
}


export const PAYMENT_PROFILE_STORAGE_KEY =
  'travel_v100_payment_profiles_v1'


export const PAYMENT_USAGE_UPDATED_EVENT =
  'travel-payment-usage-updated'


function createId() {

  if (
    typeof crypto !== 'undefined' &&
    'randomUUID' in crypto
  ) {
    return crypto.randomUUID()
  }


  return (
    `payment-${Date.now()}-` +
    Math.random()
      .toString(36)
      .slice(2, 9)
  )

}


export function loadPaymentProfiles():
  PaymentProfile[] {

  try {

    const saved =
      localStorage.getItem(
        PAYMENT_PROFILE_STORAGE_KEY
      )


    if (!saved) {
      return []
    }


    const parsed =
      JSON.parse(
        saved
      ) as
        PaymentProfile[]


    return Array.isArray(
      parsed
    )
      ? parsed
      : []

  } catch (error) {

    console.error(
      'Payment profile load failed:',
      error
    )


    return []

  }

}


export function savePaymentProfiles(
  profiles:
    PaymentProfile[]
) {

  try {

    localStorage.setItem(
      PAYMENT_PROFILE_STORAGE_KEY,
      JSON.stringify(
        profiles
      )
    )

  } catch (error) {

    console.error(
      'Payment profile save failed:',
      error
    )

  }


  window.dispatchEvent(
    new Event(
      PAYMENT_USAGE_UPDATED_EVENT
    )
  )

}


export function createPaymentProfile(
  input: {
    type:
      PaymentProfileType

    name:
      string

    limitAmount?:
      number

    limitCurrency?:
      ExpenseCurrency
  }
):
  PaymentProfile {

  return {
    id:
      createId(),

    type:
      input.type,

    name:
      input.name.trim(),

    limitAmount:
      input.type ===
      'credit_card'
        ? input.limitAmount
        : undefined,

    limitCurrency:
      input.type ===
      'credit_card'
        ? (
            input.limitCurrency ??
            'TWD'
          )
        : undefined,

    createdAt:
      Date.now(),
  }

}


function loadTripDaysFromStorage():
  TripDay[] {

  try {

    const saved =
      localStorage.getItem(
        TRIP_STORAGE_KEY
      )


    if (!saved) {
      return []
    }


    const parsed =
      JSON.parse(
        saved
      ) as
        TripDay[]


    return Array.isArray(
      parsed
    )
      ? parsed
      : []

  } catch (error) {

    console.error(
      'Payment usage trip load failed:',
      error
    )


    return []

  }

}


export function getAllTripExpenses():
  TripExpense[] {

  return loadTripDaysFromStorage()
    .flatMap(
      day =>
        day.activities.flatMap(
          activity =>
            activity.expenses ??
            []
        )
    )

}


export function getPaymentProfileSpend(
  profileId: string,
  targetCurrency:
    ExpenseCurrency
) {

  return getAllTripExpenses()
    .filter(
      expense =>
        expense.paymentProfileId ===
        profileId
    )
    .reduce(
      (
        total,
        expense
      ) => {

        const sourceCurrency =
          expense.currency ??
          'JPY'


        return (
          total +
          convertExpenseAmount(
            Number(
              expense.amount ||
              0
            ),
            sourceCurrency,
            targetCurrency
          )
        )

      },
      0
    )

}


export function dispatchPaymentUsageUpdated() {

  window.dispatchEvent(
    new Event(
      PAYMENT_USAGE_UPDATED_EVENT
    )
  )

}