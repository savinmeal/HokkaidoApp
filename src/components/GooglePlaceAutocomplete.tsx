import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  importLibrary,
  setOptions,
} from '@googlemaps/js-api-loader'


// ============================================================
// Public Types
// ============================================================

export type GooglePlaceSelection = {
  placeId: string
  name: string
  formattedAddress?: string
  latitude?: number
  longitude?: number
  googleMapsUri?: string
}


type GooglePlaceAutocompleteProps = {
  value: string

  selectedPlaceId?: string

  bias?: {
    latitude: number
    longitude: number
  }

  disabled?: boolean

  onTextChange: (
    value: string
  ) => void

  onPlaceSelect: (
    place: GooglePlaceSelection
  ) => void
}


// ============================================================
// Loader
// ============================================================

let configuredApiKey: string | null =
  null


function configureGoogleMaps(
  apiKey: string
) {

  if (configuredApiKey) {
    return
  }


  setOptions({
    key:
      apiKey,

    v:
      'weekly',

    language:
      'zh-TW',

    region:
      'JP',
  })


  configuredApiKey =
    apiKey
}


// ============================================================
// Component
// ============================================================

function GooglePlaceAutocomplete({
  value,
  selectedPlaceId,
  bias,
  disabled = false,
  onTextChange,
  onPlaceSelect,
}: GooglePlaceAutocompleteProps) {

  const apiKey =
    import.meta.env
      .VITE_GOOGLE_MAPS_API_KEY
      ?.trim() ?? ''


  const [
    suggestions,
    setSuggestions,
  ] = useState<
    google.maps.places.AutocompleteSuggestion[]
  >([])


  const [
    loading,
    setLoading,
  ] = useState(false)


  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  )


  const [
    focused,
    setFocused,
  ] = useState(false)


  const sessionTokenRef =
    useRef<
      google.maps.places.AutocompleteSessionToken |
      null
    >(
      null
    )


  const requestIdRef =
    useRef(0)


  const blurTimerRef =
    useRef<number | null>(
      null
    )


  // ==========================================================
  // Cleanup
  // ==========================================================

  useEffect(() => {

    return () => {

      if (
        blurTimerRef.current !==
        null
      ) {

        window.clearTimeout(
          blurTimerRef.current
        )

      }

    }

  }, [])



  // ==========================================================
  // Search
  // ==========================================================

  useEffect(() => {

    const query =
      value.trim()


    if (
      !apiKey ||
      disabled ||
      query.length < 2
    ) {

      setSuggestions([])

      setLoading(false)

      return
    }


    const timer =
      window.setTimeout(
        async () => {

          const requestId =
            ++requestIdRef.current


          try {

            setLoading(true)

            setError(null)


            configureGoogleMaps(
              apiKey
            )


            const {
              AutocompleteSessionToken,
              AutocompleteSuggestion,
            } =
              await importLibrary(
                'places'
              )


            if (
              !sessionTokenRef.current
            ) {

              sessionTokenRef.current =
                new AutocompleteSessionToken()

            }


            const request:
              google.maps.places.AutocompleteRequest =
            {
              input:
                query,

              includedRegionCodes:
                [
                  'jp',
                ],

              language:
                'zh-TW',

              region:
                'jp',

              sessionToken:
                sessionTokenRef.current,
            }


            if (bias) {

              request.locationBias = {
                center: {
                  lat:
                    bias.latitude,

                  lng:
                    bias.longitude,
                },

                radius:
                  150000,
              }

            }


            const result =
              await AutocompleteSuggestion
                .fetchAutocompleteSuggestions(
                  request
                )


            if (
              requestId !==
              requestIdRef.current
            ) {
              return
            }


            setSuggestions(
              result.suggestions.filter(
                suggestion =>
                  Boolean(
                    suggestion
                      .placePrediction
                  )
              )
            )

          } catch (error) {

            console.error(
              'Google Places autocomplete failed:',
              error
            )


            if (
              requestId ===
              requestIdRef.current
            ) {

              setSuggestions([])

              setError(
                'Google 地點搜尋暫時無法使用'
              )

            }

          } finally {

            if (
              requestId ===
              requestIdRef.current
            ) {

              setLoading(false)

            }

          }

        },
        280
      )


    return () => {

      window.clearTimeout(
        timer
      )

    }

  }, [
    apiKey,
    bias?.latitude,
    bias?.longitude,
    disabled,
    value,
  ])



  // ==========================================================
  // Select Place
  // ==========================================================

  const selectSuggestion =
    async (
      suggestion:
        google.maps.places.AutocompleteSuggestion
    ) => {

      const prediction =
        suggestion.placePrediction


      if (!prediction) {
        return
      }


      try {

        setLoading(true)

        setError(null)


        const place =
          prediction.toPlace()


        await place.fetchFields({
          fields: [
            'id',
            'displayName',
            'formattedAddress',
            'location',
            'googleMapsURI',
          ],
        })


        const latitude =
          place.location
            ?.lat()


        const longitude =
          place.location
            ?.lng()


        const selection:
          GooglePlaceSelection =
        {
          placeId:
            place.id,

          name:
            place.displayName ??
            prediction.text
              .toString(),

          formattedAddress:
            place.formattedAddress ??
            undefined,

          latitude:
            latitude ??
            undefined,

          longitude:
            longitude ??
            undefined,

          googleMapsUri:
            place.googleMapsURI ??
            undefined,
        }


        onPlaceSelect(
          selection
        )


        setSuggestions([])

        setFocused(false)


        // Place Details 已結束本次 autocomplete session，
        // 下一次輸入重新建立 token。
        sessionTokenRef.current =
          null

      } catch (error) {

        console.error(
          'Google Place details failed:',
          error
        )


        setError(
          '無法取得此地點的詳細資訊'
        )

      } finally {

        setLoading(false)

      }

    }



  // ==========================================================
  // Render
  // ==========================================================

  return (

    <div
      className="
        relative
      "
    >

      <input
        type="text"

        value={
          value
        }

        disabled={
          disabled
        }

        placeholder="搜尋地點，例如：富良野滑雪場"

        onFocus={() => {

          if (
            blurTimerRef.current !==
            null
          ) {

            window.clearTimeout(
              blurTimerRef.current
            )

          }


          setFocused(
            true
          )

        }}

        onBlur={() => {

          blurTimerRef.current =
            window.setTimeout(
              () => {

                setFocused(
                  false
                )

              },
              160
            )

        }}

        onChange={event => {

          onTextChange(
            event.target.value
          )


          // 使用者重新輸入代表之前的 Place 綁定已不再可靠。
          if (
            selectedPlaceId
          ) {

            sessionTokenRef.current =
              null

          }

        }}

        className="
          mt-2
          w-full
          rounded-[18px]
          border
          border-slate-200
          bg-white
          px-4
          py-3
          pr-10
          text-[15px]
          text-slate-900
          outline-none
          transition
          placeholder:text-slate-300
          focus:border-slate-400
          disabled:bg-slate-100
          disabled:text-slate-400
        "
      />


      {/* Loading Indicator */}

      {loading && (

        <div
          className="
            pointer-events-none
            absolute
            right-4
            top-[21px]
            h-4
            w-4
            animate-spin
            rounded-full
            border-2
            border-slate-200
            border-t-slate-500
          "
        />

      )}



      {/* Suggestions */}

      {
        apiKey &&
        focused &&
        suggestions.length > 0 && (

          <div
            className="
              absolute
              left-0
              right-0
              top-[58px]
              z-[80]
              max-h-[260px]
              overflow-y-auto
              rounded-[18px]
              border
              border-slate-200
              bg-white
              p-1.5
              shadow-xl
              shadow-slate-900/10
            "
          >

            {suggestions.map(
              (
                suggestion,
                index
              ) => {

                const prediction =
                  suggestion
                    .placePrediction


                if (!prediction) {
                  return null
                }


                const text =
                  prediction.text
                    .toString()


                return (

                  <button
                    key={
                      `${text}-${index}`
                    }

                    type="button"

                    onPointerDown={event => {

                      // 防止 input blur 先把清單關掉
                      event.preventDefault()

                    }}

                    onClick={() => {

                      void selectSuggestion(
                        suggestion
                      )

                    }}

                    className="
                      flex
                      w-full
                      items-start
                      gap-3
                      rounded-[14px]
                      px-3
                      py-3
                      text-left
                      transition
                      hover:bg-slate-50
                      active:bg-slate-100
                    "
                  >

                    <div
                      className="
                        mt-0.5
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-slate-100
                        text-slate-500
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
                        <path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" />
                        <circle cx="12" cy="10" r="2" />
                      </svg>

                    </div>


                    <div
                      className="
                        min-w-0
                      "
                    >

                      <p
                        className="
                          text-[12px]
                          font-medium
                          leading-5
                          text-slate-800
                        "
                      >
                        {text}
                      </p>

                    </div>

                  </button>

                )

              }
            )}

          </div>

        )
      }



      {/* Config / Error */}

      {!apiKey && (

        <p
          className="
            mt-2
            text-[9px]
            leading-4
            text-amber-600
          "
        >
          尚未設定 VITE_GOOGLE_MAPS_API_KEY，目前 LOCATION 仍可用一般文字輸入。
        </p>

      )}


      {error && (

        <p
          className="
            mt-2
            text-[9px]
            leading-4
            text-red-500
          "
        >
          {error}
        </p>

      )}

    </div>

  )

}


export default GooglePlaceAutocomplete