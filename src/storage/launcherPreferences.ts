export type LauncherPreferences = {
  showMyTrips: boolean
  showQuickAccess: boolean
  showQuickMap: boolean
  showQuickMemory: boolean
  showTravelPactApp: boolean
  showChecklistApp: boolean
}


const STORAGE_KEY =
  'travel_launcher_preferences_v2'


const LEGACY_STORAGE_KEY =
  'travel_launcher_preferences_v1'


export const defaultLauncherPreferences:
  LauncherPreferences = {

  showMyTrips:
    true,

  showQuickAccess:
    true,

  showQuickMap:
    true,

  showQuickMemory:
    true,

  showTravelPactApp:
    true,

  showChecklistApp:
    true,
}


export function loadLauncherPreferences():
  LauncherPreferences {

  try {

    const raw =
      localStorage.getItem(
        STORAGE_KEY
      )


    if (raw) {

      const parsed =
        JSON.parse(
          raw
        ) as Partial<LauncherPreferences>


      return {
        ...defaultLauncherPreferences,
        ...parsed,
      }

    }


    // --------------------------------------------------------
    // Migrate old Launcher settings
    // --------------------------------------------------------

    const legacyRaw =
      localStorage.getItem(
        LEGACY_STORAGE_KEY
      )


    if (legacyRaw) {

      const legacy =
        JSON.parse(
          legacyRaw
        ) as {
          showMyTrips?: boolean
          showQuickAccess?: boolean
          showQuickMap?: boolean
          showQuickMemory?: boolean
          showQuickTravelPact?: boolean
          showQuickChecklist?: boolean
        }


      return {
        showMyTrips:
          legacy.showMyTrips ??
          true,

        showQuickAccess:
          legacy.showQuickAccess ??
          true,

        showQuickMap:
          legacy.showQuickMap ??
          true,

        showQuickMemory:
          legacy.showQuickMemory ??
          true,

        showTravelPactApp:
          legacy.showQuickTravelPact ??
          true,

        showChecklistApp:
          legacy.showQuickChecklist ??
          true,
      }

    }

  } catch {
    // Ignore invalid local settings.
  }


  return {
    ...defaultLauncherPreferences,
  }

}


export function saveLauncherPreferences(
  preferences: LauncherPreferences
) {

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        preferences
      )
    )

  } catch {
    // Ignore localStorage error.
  }

}