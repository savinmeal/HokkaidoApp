export type MapModuleKey =
  | 'skiTrack'
  | 'skiMaps'
  | 'tripRoute'


export type MapModuleVisibility =
  Record<
    MapModuleKey,
    boolean
  >


export const MAP_MODULE_VISIBILITY_KEY =
  'travel_v100_map_module_visibility_v1'


export const DEFAULT_MAP_MODULE_VISIBILITY:
  MapModuleVisibility =
{
  skiTrack:
    true,

  skiMaps:
    true,

  tripRoute:
    true,
}


export function loadMapModuleVisibility():
  MapModuleVisibility {

  try {

    const saved =
      localStorage.getItem(
        MAP_MODULE_VISIBILITY_KEY
      )


    if (!saved) {

      return {
        ...DEFAULT_MAP_MODULE_VISIBILITY,
      }

    }


    const parsed =
      JSON.parse(
        saved
      ) as
        Partial<MapModuleVisibility>


    return {
      ...DEFAULT_MAP_MODULE_VISIBILITY,
      ...parsed,
    }

  } catch (error) {

    console.error(
      'Map visibility load failed:',
      error
    )


    return {
      ...DEFAULT_MAP_MODULE_VISIBILITY,
    }

  }

}


export function saveMapModuleVisibility(
  visibility:
    MapModuleVisibility
) {

  try {

    localStorage.setItem(
      MAP_MODULE_VISIBILITY_KEY,
      JSON.stringify(
        visibility
      )
    )

  } catch (error) {

    console.error(
      'Map visibility save failed:',
      error
    )

  }

}