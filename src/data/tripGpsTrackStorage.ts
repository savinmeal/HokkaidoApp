export type TripGpsPoint = {
  latitude: number
  longitude: number
  accuracy?: number
  timestamp: number
}


export type TripDayGpsTrack = {
  date: string
  points: TripGpsPoint[]
}


export const TRIP_GPS_TRACK_STORAGE_KEY =
  'travel_v100_trip_gps_tracks_v1'


export function loadTripGpsTracks():
  TripDayGpsTrack[] {

  try {

    const saved =
      localStorage.getItem(
        TRIP_GPS_TRACK_STORAGE_KEY
      )


    if (!saved) {
      return []
    }


    const parsed =
      JSON.parse(
        saved
      ) as
        TripDayGpsTrack[]


    return Array.isArray(
      parsed
    )
      ? parsed
      : []

  } catch (error) {

    console.error(
      'Trip GPS tracks load failed:',
      error
    )


    return []

  }

}


export function saveTripGpsTracks(
  tracks:
    TripDayGpsTrack[]
) {

  try {

    localStorage.setItem(
      TRIP_GPS_TRACK_STORAGE_KEY,
      JSON.stringify(
        tracks
      )
    )

  } catch (error) {

    console.error(
      'Trip GPS tracks save failed:',
      error
    )

  }

}