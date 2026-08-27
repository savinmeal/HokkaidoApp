export type HomeModuleKey =
  | 'weather'
  | 'snowForecast'
  | 'snowPass'
  | 'paymentMethods'
  | 'tripStatus'
  | 'quickLinks'


export type HomeModuleVisibility =
  Record<
    HomeModuleKey,
    boolean
  >


export const HOME_MODULE_VISIBILITY_KEY =
  'travel_v100_home_module_visibility_v1'


export const DEFAULT_HOME_MODULE_VISIBILITY:
  HomeModuleVisibility =
{
  weather:
    true,

  snowForecast:
    true,

  snowPass:
    true,

  paymentMethods:
    true,

  tripStatus:
    true,

  quickLinks:
    true,
}


export function loadHomeModuleVisibility():
  HomeModuleVisibility {

  try {

    const saved =
      localStorage.getItem(
        HOME_MODULE_VISIBILITY_KEY
      )


    if (!saved) {

      return {
        ...DEFAULT_HOME_MODULE_VISIBILITY,
      }

    }


    const parsed =
      JSON.parse(
        saved
      ) as
        Partial<HomeModuleVisibility>


    return {
      ...DEFAULT_HOME_MODULE_VISIBILITY,
      ...parsed,
    }

  } catch (error) {

    console.error(
      'Home module visibility load failed:',
      error
    )


    return {
      ...DEFAULT_HOME_MODULE_VISIBILITY,
    }

  }

}


export function saveHomeModuleVisibility(
  visibility:
    HomeModuleVisibility
) {

  try {

    localStorage.setItem(
      HOME_MODULE_VISIBILITY_KEY,
      JSON.stringify(
        visibility
      )
    )

  } catch (error) {

    console.error(
      'Home module visibility save failed:',
      error
    )

  }

}