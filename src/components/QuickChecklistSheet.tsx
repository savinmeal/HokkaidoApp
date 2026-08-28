import {
  useEffect,
  useMemo,
  useState,
} from 'react'


// ============================================================
// Types
// ============================================================

type ChecklistItem = {
  id: string
  text: string
  checked: boolean
}


type BookmarkColor =
  | 'rose'
  | 'sky'
  | 'emerald'
  | 'amber'
  | 'violet'
  | 'slate'


type ChecklistPage = {
  id: string
  name: string
  color: BookmarkColor
  items: ChecklistItem[]
}


type ChecklistBook = {
  selectedPageId: string
  pages: ChecklistPage[]
}


type QuickChecklistSheetProps = {
  open: boolean
  onClose: () => void
}


// ============================================================
// Storage
// ============================================================

const STORAGE_KEY =
  'travel_launcher_checklist_book_v2'


const LEGACY_STORAGE_KEY =
  'travel_launcher_checklist_v1'


// ============================================================
// Colors
// ============================================================

const BOOKMARK_COLORS: {
  id: BookmarkColor
  label: string
  tabClass: string
  dotClass: string
}[] = [
  {
    id: 'rose',
    label: '紅',
    tabClass:
      'bg-rose-400 border-rose-500/40 text-rose-950',
    dotClass:
      'bg-rose-400',
  },
  {
    id: 'sky',
    label: '藍',
    tabClass:
      'bg-sky-300 border-sky-500/35 text-sky-950',
    dotClass:
      'bg-sky-400',
  },
  {
    id: 'emerald',
    label: '綠',
    tabClass:
      'bg-emerald-300 border-emerald-500/35 text-emerald-950',
    dotClass:
      'bg-emerald-400',
  },
  {
    id: 'amber',
    label: '黃',
    tabClass:
      'bg-amber-300 border-amber-500/35 text-amber-950',
    dotClass:
      'bg-amber-400',
  },
  {
    id: 'violet',
    label: '紫',
    tabClass:
      'bg-violet-300 border-violet-500/35 text-violet-950',
    dotClass:
      'bg-violet-400',
  },
  {
    id: 'slate',
    label: '灰',
    tabClass:
      'bg-slate-300 border-slate-500/35 text-slate-900',
    dotClass:
      'bg-slate-400',
  },
]


function getBookmarkColor(
  color: BookmarkColor
) {

  return (
    BOOKMARK_COLORS.find(
      item =>
        item.id === color
    ) ??
    BOOKMARK_COLORS[0]
  )

}


// ============================================================
// Defaults
// ============================================================

const DEFAULT_ITEMS: ChecklistItem[] = [
  {
    id: 'passport',
    text: '護照 / 證件確認',
    checked: false,
  },
  {
    id: 'power',
    text: '充電器 / 行動電源',
    checked: false,
  },
  {
    id: 'ski',
    text: '滑雪裝備 / 手套 / 雪鏡',
    checked: false,
  },
]


const DEFAULT_BOOK: ChecklistBook = {
  selectedPageId:
    'before-trip',

  pages: [
    {
      id:
        'before-trip',

      name:
        '出發前',

      color:
        'rose',

      items:
        DEFAULT_ITEMS,
    },
  ],
}


// ============================================================
// Helpers
// ============================================================

function createId(
  prefix: string
) {

  if (
    typeof crypto !== 'undefined' &&
    'randomUUID' in crypto
  ) {
    return `${prefix}-${crypto.randomUUID()}`
  }


  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`

}


function loadChecklistBook():
  ChecklistBook {

  try {

    const saved =
      localStorage.getItem(
        STORAGE_KEY
      )


    if (saved) {

      const parsed =
        JSON.parse(
          saved
        ) as ChecklistBook


      if (
        Array.isArray(
          parsed.pages
        ) &&
        parsed.pages.length > 0
      ) {

        return parsed

      }

    }


    // Legacy migration:
    // 舊版單一 checklist 自動放入第一個「出發前」頁面。
    const legacy =
      localStorage.getItem(
        LEGACY_STORAGE_KEY
      )


    if (legacy) {

      const legacyItems =
        JSON.parse(
          legacy
        ) as ChecklistItem[]


      if (
        Array.isArray(
          legacyItems
        )
      ) {

        return {
          selectedPageId:
            'before-trip',

          pages: [
            {
              id:
                'before-trip',

              name:
                '出發前',

              color:
                'rose',

              items:
                legacyItems,
            },
          ],
        }

      }

    }

  } catch {
    // Ignore damaged local data.
  }


  return DEFAULT_BOOK

}


// ============================================================
// Metal Ring
// ============================================================

function MetalRing() {

  return (

    <div
      className="
        relative
        h-[18px]
        w-[34px]
      "
    >

      {/* Paper hole */}

      <div
        className="
          absolute
          right-0
          top-1/2
          h-[10px]
          w-[10px]
          -translate-y-1/2
          rounded-full
          border
          border-amber-900/15
          bg-[#e6c45f]
          shadow-inner
        "
      />


      {/* Metal loop */}

      <div
        className="
          absolute
          left-0
          top-1/2
          h-[14px]
          w-[28px]
          -translate-y-1/2
          rounded-full
          border-[3px]
          border-slate-400
          bg-transparent
          shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55),0_1px_2px_rgba(15,23,42,0.28)]
        "
      />


      {/* Highlight */}

      <div
        className="
          absolute
          left-[5px]
          top-[4px]
          h-[2px]
          w-[16px]
          rounded-full
          bg-white/70
        "
      />

    </div>

  )

}


// ============================================================
// Crayon Check
// ============================================================

function CrayonCheck() {

  return (

    <svg
      viewBox="0 0 28 28"
      className="
        absolute
        -left-[4px]
        -top-[5px]
        h-[29px]
        w-[29px]
        rotate-[-7deg]
        overflow-visible
      "
      aria-hidden="true"
    >

      <path
        d="
          M4 14
          C7 16, 9 19, 11 21
          C15 15, 20 9, 25 5
        "
        fill="none"
        stroke="#dc2626"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.92"
      />


      <path
        d="
          M5 13
          C8 16, 9 17, 11 19
          C16 13, 20 8, 24 6
        "
        fill="none"
        stroke="#ef4444"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.75"
      />

    </svg>

  )

}


// ============================================================
// Red Crayon Decoration
// ============================================================

function RedCrayon() {

  return (

    <div
      className="
        pointer-events-none
        absolute
        right-[8px]
        top-[118px]
        z-20
        rotate-[9deg]
        drop-shadow-md
      "
    >

      <div
        className="
          relative
          h-[96px]
          w-[17px]
        "
      >

        {/* Tip */}

        <div
          className="
            absolute
            left-1/2
            top-0
            h-0
            w-0
            -translate-x-1/2
            border-l-[8px]
            border-r-[8px]
            border-b-[18px]
            border-l-transparent
            border-r-transparent
            border-b-[#ef4444]
          "
        />


        {/* Body */}

        <div
          className="
            absolute
            bottom-0
            left-0
            top-[16px]
            w-full
            rounded-b-[4px]
            rounded-t-[2px]
            bg-gradient-to-r
            from-red-700
            via-red-500
            to-red-700
          "
        >


          <div
            className="
              absolute
              left-[2px]
              right-[2px]
              top-[25px]
              h-[28px]
              border-y
              border-red-800/40
              bg-red-300/25
            "
          />


          <div
            className="
              absolute
              bottom-[5px]
              left-[3px]
              right-[3px]
              h-[2px]
              rounded-full
              bg-white/30
            "
          />

        </div>

      </div>

    </div>

  )

}


// ============================================================
// Component
// ============================================================

function QuickChecklistSheet({
  open,
  onClose,
}: QuickChecklistSheetProps) {

  const [
    book,
    setBook,
  ] = useState<ChecklistBook>(
    loadChecklistBook
  )


  const [
    newItemText,
    setNewItemText,
  ] = useState('')


  const [
    pageEditorOpen,
    setPageEditorOpen,
  ] = useState(false)


  const [
    editingPageId,
    setEditingPageId,
  ] = useState<
    string |
    null
  >(
    null
  )


  const [
    pageName,
    setPageName,
  ] = useState('')


  const [
    pageColor,
    setPageColor,
  ] = useState<BookmarkColor>(
    'sky'
  )


  // ==========================================================
  // Notebook Open / Close Animation
  //
  // shouldRender:
  //   關閉時先保留在 DOM，播放「合上筆記本」動畫。
  //
  // notebookOpen:
  //   false = 筆記本仍是闔上的
  //   true  = 封面翻開，顯示目前書籤頁
  // ==========================================================

  const [
    shouldRender,
    setShouldRender,
  ] = useState(
    open
  )


  const [
    bookVisible,
    setBookVisible,
  ] = useState(
    false
  )


  const [
    notebookOpen,
    setNotebookOpen,
  ] = useState(
    false
  )



  // 半透明內頁翻動狀態
  //
  // 開啟：
  //   黃色封面先翻開，半透明頁稍後跟著翻開
  //
  // 關閉：
  //   半透明頁先蓋回來，黃色封面再蓋上
  const [
    innerPageOpen,
    setInnerPageOpen,
  ] = useState(
    false
  )



  // 書籤切換中的狀態
  //
  // true 時：
  //   先讓透明內頁蓋住目前內容，
  //   再切換 selectedPageId，
  //   最後把透明內頁翻開。
  const [
    pageSwitching,
    setPageSwitching,
  ] = useState(
    false
  )



  // 書籤方向動畫在初始化 / 重設姿態時，
  // 暫時關閉 transition，避免看到反向補動畫。
  const [
    innerPageTransition,
    setInnerPageTransition,
  ] = useState(
    true
  )



  const [
    bookmarkFlipDirection,
    setBookmarkFlipDirection,
  ] = useState<
    'left' |
    'right' |
    null
  >(
    null
  )


  useEffect(() => {

    let closeTimer:
      number |
      null =
      null


    let hideTimer:
      number |
      null =
      null


    let openTimer:
      number |
      null =
      null


    let innerOpenTimer:
      number |
      null =
      null


    let yellowCloseTimer:
      number |
      null =
      null


    let frame:
      number |
      null =
      null


    let frame2:
      number |
      null =
      null


    if (open) {

      setBookmarkFlipDirection(
        null
      )


      setInnerPageTransition(
        true
      )


      setShouldRender(
        true
      )


      // 每次打開先回到闔上的狀態
      setNotebookOpen(
        false
      )


      setInnerPageOpen(
        false
      )


      // Step 1:
      // 先讓 DOM 真正 render 在畫面下方。
      //
      // 使用 double requestAnimationFrame，
      // 確保瀏覽器已經 paint：
      // translate-y-[115%]
      //
      // 下一個 frame 才切成 translate-y-0，
      // 這樣進場滑動一定看得到。
      frame =
        window.requestAnimationFrame(
          () => {

            frame2 =
              window.requestAnimationFrame(
                () => {

                  setBookVisible(
                    true
                  )


                  // Step 2:
                  // 整本書滑到定位後，
                  // 黃色封面才開始翻開。
                  openTimer =
                    window.setTimeout(
                      () => {

                        setNotebookOpen(
                          true
                        )

                      },
                      560
                    )


                  // Step 3:
                  // 黃色封面開始翻開後，
                  // 半透明內頁再接著翻開。
                  innerOpenTimer =
                    window.setTimeout(
                      () => {

                        setInnerPageOpen(
                          true
                        )

                      },
                      760
                    )

                }
              )

          }
        )

    } else {

      setBookmarkFlipDirection(
        null
      )


      setInnerPageTransition(
        true
      )


      // ======================================================
      // CLOSE
      //
      // 改成：
      // 1. 半透明頁先蓋回來
      // 2. 再蓋黃色封面
      // 3. 最後整本書淡出
      // ======================================================

      // Step 1:
      // 半透明內頁先蓋上
      setInnerPageOpen(
        false
      )


      // Step 2:
      // 透明頁視覺上已接近闔好後，
      // 黃色封面就接著開始蓋，
      // 不再等待完整 transition 尾段
      yellowCloseTimer =
        window.setTimeout(
          () => {

            setNotebookOpen(
              false
            )

          },
          290
        )


      // Step 3:
      // 黃色封面完全闔好後，
      // 整本筆記本再往畫面下方移出去。
      hideTimer =
        window.setTimeout(
          () => {

            setBookVisible(
              false
            )

          },
          890
        )


      // Step 4:
      // 整本書滑出畫面後才真正卸載。
      closeTimer =
        window.setTimeout(
          () => {

            setShouldRender(
              false
            )

          },
          1660
        )

    }


    return () => {

      if (
        closeTimer !==
        null
      ) {
        window.clearTimeout(
          closeTimer
        )
      }


      if (
        hideTimer !==
        null
      ) {
        window.clearTimeout(
          hideTimer
        )
      }


      if (
        openTimer !==
        null
      ) {
        window.clearTimeout(
          openTimer
        )
      }


      if (
        innerOpenTimer !==
        null
      ) {
        window.clearTimeout(
          innerOpenTimer
        )
      }


      if (
        yellowCloseTimer !==
        null
      ) {
        window.clearTimeout(
          yellowCloseTimer
        )
      }


      if (
        frame !==
        null
      ) {
        window.cancelAnimationFrame(
          frame
        )
      }


      if (
        frame2 !==
        null
      ) {
        window.cancelAnimationFrame(
          frame2
        )
      }

    }

  }, [
    open,
  ])


  useEffect(() => {

    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          book
        )
      )

    } catch {
      // Ignore local storage error.
    }

  }, [
    book,
  ])


  const selectedPage =
    useMemo(
      () =>
        book.pages.find(
          page =>
            page.id ===
            book.selectedPageId
        ) ??
        book.pages[0],
      [
        book,
      ]
    )


  const checkedCount =
    useMemo(
      () =>
        selectedPage?.items.filter(
          item =>
            item.checked
        ).length ??
        0,
      [
        selectedPage,
      ]
    )


  if (!shouldRender) {
    return null
  }


  // ==========================================================
  // Checklist
  // ==========================================================

  const updateSelectedPageItems = (
    updater:
      (
        items: ChecklistItem[]
      ) => ChecklistItem[]
  ) => {

    setBook(
      current => ({
        ...current,

        pages:
          current.pages.map(
            page =>
              page.id ===
              current.selectedPageId
                ? {
                    ...page,

                    items:
                      updater(
                        page.items
                      ),
                  }
                : page
          ),
      })
    )

  }


  const addItem =
    () => {

      const value =
        newItemText.trim()


      if (!value) {
        return
      }


      updateSelectedPageItems(
        items => [
          ...items,
          {
            id:
              createId(
                'item'
              ),

            text:
              value,

            checked:
              false,
          },
        ]
      )


      setNewItemText(
        ''
      )

    }


  const toggleItem = (
    id: string
  ) => {

    updateSelectedPageItems(
      items =>
        items.map(
          item =>
            item.id === id
              ? {
                  ...item,

                  checked:
                    !item.checked,
                }
              : item
        )
    )

  }


  const removeItem = (
    id: string
  ) => {

    updateSelectedPageItems(
      items =>
        items.filter(
          item =>
            item.id !== id
        )
    )

  }


  // ==========================================================
  // Bookmark Switch Animation
  //
  // 切換不同書籤時：
  // 1. 透明內頁先蓋回來
  // 2. 內頁遮住內容後才切換 selectedPageId
  // 3. 再把透明內頁翻開
  //
  // 新增書籤不使用這個動畫。
  // ==========================================================

  const switchBookmarkPage = (
    pageId: string
  ) => {

    if (
      pageSwitching ||
      pageId ===
        book.selectedPageId
    ) {
      return
    }


    const currentIndex =
      book.pages.findIndex(
        page =>
          page.id ===
          book.selectedPageId
      )


    const targetIndex =
      book.pages.findIndex(
        page =>
          page.id ===
          pageId
      )


    if (
      currentIndex < 0 ||
      targetIndex < 0
    ) {
      return
    }


    setPageSwitching(
      true
    )


    // ========================================================
    // 選擇左邊書籤
    //
    // 動畫：
    // 目前透明頁是打開狀態
    // → 播放「闔上透明頁」
    // → 遮住內容後切換資料
    // → 無動畫重設回打開姿態
    // ========================================================

    if (
      targetIndex <
      currentIndex
    ) {

      setBookmarkFlipDirection(
        'left'
      )


      // ------------------------------------------------------
      // 左側書籤：
      //
      // 先切換書籤 / 內容，
      // 再播放透明頁闔上的動畫。
      //
      // 這樣按下左側書籤時，
      // tab 的 active 狀態會立即改變，
      // 體感會和右側切換一致。
      // ------------------------------------------------------

      setBook(
        current => ({
          ...current,

          selectedPageId:
            pageId,
        })
      )


      setInnerPageTransition(
        true
      )


      // 下一個 frame 再開始闔頁，
      // 讓瀏覽器先 render 新書籤狀態。
      window.requestAnimationFrame(
        () => {

          setInnerPageOpen(
            false
          )

        }
      )


      // 透明頁視覺上已經闔好後，
      // 提前進入 reset，
      // 不等待 ease-out 最後那段尾巴。
      window.setTimeout(
        () => {

          setInnerPageTransition(
            false
          )


          setInnerPageOpen(
            true
          )


          window.requestAnimationFrame(
            () => {

              window.requestAnimationFrame(
                () => {

                  setInnerPageTransition(
                    true
                  )


                  setBookmarkFlipDirection(
                    null
                  )


                  setPageSwitching(
                    false
                  )

                }
              )

            }
          )

        },
        330
      )


      return

    }


    // ========================================================
    // 選擇右邊書籤
    //
    // 動畫：
    // 無動畫先把透明頁放到闔上位置
    // → 切換資料
    // → 播放「打開透明頁」
    // ========================================================

    setBookmarkFlipDirection(
      'right'
    )


    setInnerPageTransition(
      false
    )


    // 先無動畫放到「闔上」姿態
    setInnerPageOpen(
      false
    )


    // 同時換成右邊書籤的資料
    setBook(
      current => ({
        ...current,

        selectedPageId:
          pageId,
      })
    )


    // 等瀏覽器吃到 closed 姿態後，
    // 再開啟 transition 並播放「打開」
    window.requestAnimationFrame(
      () => {

        window.requestAnimationFrame(
          () => {

            setInnerPageTransition(
              true
            )


            setInnerPageOpen(
              true
            )


            window.setTimeout(
              () => {

                setBookmarkFlipDirection(
                  null
                )


                setPageSwitching(
                  false
                )

              },
              680
            )

          }
        )

      }
    )

  }


  // ==========================================================
  // Page Editor
  // ==========================================================

  const openCreatePage =
    () => {

      setEditingPageId(
        null
      )

      setPageName(
        ''
      )

      setPageColor(
        'sky'
      )

      setPageEditorOpen(
        true
      )

    }


  const openEditPage =
    () => {

      if (!selectedPage) {
        return
      }


      setEditingPageId(
        selectedPage.id
      )

      setPageName(
        selectedPage.name
      )

      setPageColor(
        selectedPage.color
      )

      setPageEditorOpen(
        true
      )

    }


  const savePage =
    () => {

      const cleanName =
        pageName.trim()


      if (!cleanName) {
        return
      }


      if (
        editingPageId
      ) {

        setBook(
          current => ({
            ...current,

            pages:
              current.pages.map(
                page =>
                  page.id ===
                  editingPageId
                    ? {
                        ...page,

                        name:
                          cleanName,

                        color:
                          pageColor,
                      }
                    : page
              ),
          })
        )

      } else {

        const id =
          createId(
            'page'
          )


        setBook(
          current => ({
            selectedPageId:
              id,

            pages: [
              ...current.pages,
              {
                id,

                name:
                  cleanName,

                color:
                  pageColor,

                items:
                  [],
              },
            ],
          })
        )

      }


      setPageEditorOpen(
        false
      )

    }


  const deleteCurrentPage =
    () => {

      if (
        !editingPageId ||
        book.pages.length <= 1
      ) {
        return
      }


      const confirmed =
        window.confirm(
          `確定要刪除「${selectedPage.name}」這一頁嗎？`
        )


      if (!confirmed) {
        return
      }


      setBook(
        current => {

          const nextPages =
            current.pages.filter(
              page =>
                page.id !==
                editingPageId
            )


          return {
            selectedPageId:
              nextPages[0].id,

            pages:
              nextPages,
          }

        }
      )


      setPageEditorOpen(
        false
      )

    }


  // ==========================================================
  // Render
  // ==========================================================

  return (

    <div
      data-disable-swipe-back="true"

      onPointerDown={
        event =>
          event.stopPropagation()
      }

      onPointerMove={
        event =>
          event.stopPropagation()
      }

      onPointerUp={
        event =>
          event.stopPropagation()
      }

      onPointerCancel={
        event =>
          event.stopPropagation()
      }

      className="
        fixed
        inset-0
        z-[1300]
      "
    >

      {/* Backdrop */}

      <button
        type="button"

        aria-label="關閉確認清單"

        onClick={
          onClose
        }

        className={`
          absolute
          inset-0
          transition-[background-color,backdrop-filter]
          duration-[420ms]
          ease-out

          ${
            bookVisible
              ? `
                  bg-slate-950/45
                  backdrop-blur-[3px]
                `
              : `
                  bg-slate-950/0
                  backdrop-blur-0
                `
          }
        `}
      />


      {/* Sheet */}

      <section
        className={`
          absolute
          bottom-0
          left-1/2
          flex
          h-[88dvh]
          w-full
          max-w-md
          -translate-x-1/2
          flex-col
          overflow-visible
          bg-transparent
          px-0
          pt-0
          pb-0
          will-change-transform

          transition-transform
          duration-[520ms]
          ease-[cubic-bezier(0.22,1,0.36,1)]

          ${
            bookVisible
              ? `
                  translate-y-0
                `
              : `
                  translate-y-[115%]
                `
          }
        `}
        style={{
          perspective:
            '1400px',
        }}
      >

        {/* ====================================================
            Animated Notebook Cover

            開啟：
            黃色封面由右往左翻開，露出目前頁面。

            關閉：
            封面反向合上，接著整本筆記本往下滑出畫面。
        ==================================================== */}

        <div
          className={`
            pointer-events-none
            absolute
            inset-0
            z-[80]
            overflow-hidden
            rounded-t-[27px]
            rounded-b-none
            border
            border-amber-900/25
            bg-gradient-to-br
            from-[#f5d75f]
            via-[#e9bd3f]
            to-[#cf982a]
            shadow-[0_18px_45px_rgba(66,45,10,0.28)]
            [backface-visibility:hidden]
            [transform-style:preserve-3d]
            [transform-origin:left_center]

            transition-[transform,opacity]
            duration-[760ms]
            ease-[cubic-bezier(0.22,1,0.36,1)]

            ${
              notebookOpen
                ? `
                    -rotate-y-[108deg]
                    opacity-0
                  `
                : `
                    rotate-y-0
                    opacity-100
                  `
            }
          `}
        >

          {/* Cover spine */}

          <div
            className="
              absolute
              bottom-0
              left-0
              top-0
              w-12
              border-r
              border-amber-950/20
              bg-amber-800/15
            "
          />


          {/* Cover title */}

          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              pl-10
            "
          >

            <div
              className="
                -rotate-2
                text-center
              "
            >

              <p
                className="
                  text-[10px]
                  font-bold
                  tracking-[0.26em]
                  text-amber-950/45
                "
              >
                TRAVEL NOTE
              </p>


              <p
                className="
                  mt-2
                  text-[26px]
                  font-black
                  tracking-[0.06em]
                  text-amber-950/70
                "
              >
                確認清單
              </p>


              <div
                className="
                  mx-auto
                  mt-4
                  h-1
                  w-16
                  rounded-full
                  bg-red-500/70
                "
              />

            </div>

          </div>


          {/* Faux metal rings on closed cover */}

          <div
            className="
              absolute
              bottom-6
              left-[-8px]
              top-6
              flex
              w-12
              flex-col
              items-center
              justify-around
            "
          >

            {Array.from({
              length:
                7,
            }).map(
              (
                _,
                index
              ) => (

                <span
                  key={
                    index
                  }
                  className="
                    block
                    h-3
                    w-8
                    rounded-full
                    border-[3px]
                    border-slate-400
                    bg-transparent
                    shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)]
                  "
                />

              )
            )}

          </div>

        </div>


        {/* A page-turn highlight after the cover opens */}

        <div
          className={`
            pointer-events-none
            absolute
            inset-y-0
            right-0
            z-[70]
            w-[50%]
            origin-left
            rounded-tr-[26px]
            bg-gradient-to-l
            from-yellow-50/75
            via-yellow-100/35
            to-transparent

            ${
              innerPageTransition
                ? `
                    transition-[transform,opacity]
                    ${
                      bookmarkFlipDirection ===
                      'left'
                        ? 'duration-[430ms]'
                        : 'duration-[680ms]'
                    }
                    ease-[cubic-bezier(0.22,1,0.36,1)]
                  `
                : `
                    transition-none
                  `
            }

            ${
              innerPageOpen
                ? `
                    rotate-y-[-92deg]
                    opacity-0
                  `
                : `
                    rotate-y-0
                    opacity-70
                  `
            }
          `}
        />




        {/* ====================================================
            Bookmark Tabs
        ==================================================== */}

        <div
          className="
            relative
            z-30
            -mb-[1px]
            flex
            shrink-0
            items-end
            gap-1.5
            overflow-x-auto
            overflow-y-hidden
            px-[44px]
            pr-2
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >

          {book.pages.map(
            page => {

              const active =
                page.id ===
                selectedPage.id


              const color =
                getBookmarkColor(
                  page.color
                )


              return (

                <button
                  key={
                    page.id
                  }

                  type="button"

                  onClick={() =>
                    switchBookmarkPage(
                      page.id
                    )
                  }

                  disabled={
                    pageSwitching
                  }

                  className={`
                    relative
                    shrink-0
                    rounded-t-[10px]
                    border
                    border-b-0
                    px-4
                    text-[10px]
                    font-bold
                    tracking-[0.03em]
                    shadow-sm
                    transition-all
                    duration-200
                    disabled:cursor-default
                    ${color.tabClass}

                    ${
                      active
                        ? `
                            h-[38px]
                            pb-[9px]
                            pt-[8px]
                            opacity-100
                          `
                        : `
                            h-[31px]
                            pb-[6px]
                            pt-[6px]
                            opacity-75
                          `
                    }
                  `}
                >

                  <span
                    className="
                      block
                      max-w-[78px]
                      truncate
                    "
                  >
                    {page.name}
                  </span>

                </button>

              )

            }
          )}


          {/* Add page bookmark */}

          <button
            type="button"

            onClick={
              openCreatePage
            }

            aria-label="新增確認清單頁面"

            className="
              flex
              h-[31px]
              w-[34px]
              shrink-0
              items-center
              justify-center
              rounded-t-[10px]
              border
              border-b-0
              border-stone-300
              bg-stone-100
              pb-[5px]
              text-[18px]
              font-light
              text-stone-500
              shadow-sm
              transition
              active:scale-95
            "
          >
            +
          </button>

        </div>


        {/* ====================================================
            Yellow Ring Notebook
        ==================================================== */}

        <div
          className="
            relative
            flex
            min-h-0
            flex-1
            flex-col
            overflow-hidden
            rounded-t-[26px]
            rounded-b-none
            border-x
            border-t
            border-amber-900/20
            bg-[#f4dc7b]
            shadow-[0_-10px_40px_rgba(80,60,20,0.18)]
          "
        >

          {/* Paper light */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-br
              from-white/25
              via-transparent
              to-amber-900/[0.05]
            "
          />


          {/* Blue ruled lines */}

          <div
            className="
              pointer-events-none
              absolute
              bottom-0
              left-[58px]
              right-0
              top-[78px]
            "

            style={{
              backgroundImage:
                `repeating-linear-gradient(
                  to bottom,
                  transparent 0px,
                  transparent 37px,
                  rgba(59, 130, 246, 0.30) 37px,
                  rgba(59, 130, 246, 0.30) 38px
                )`,
            }}
          />


          {/* Red notebook margin */}

          <div
            className="
              pointer-events-none
              absolute
              bottom-0
              left-[59px]
              top-[78px]
              w-px
              bg-rose-500/45
            "
          />


          {/* Metal ring rail */}

          <div
            className="
              pointer-events-none
              absolute
              bottom-4
              left-[-15px]
              top-4
              z-30
              flex
              w-[62px]
              flex-col
              items-center
              justify-around
            "
          >

            {Array.from({
              length:
                8,
            }).map(
              (
                _,
                index
              ) => (

                <MetalRing
                  key={
                    index
                  }
                />

              )
            )}

          </div>


          {/* Red crayon */}

          <RedCrayon />


          {/* Content */}

          <div
            className="
              relative
              z-10
              flex
              h-full
              min-h-0
              w-full
              flex-1
              flex-col
              pl-[62px]
              pr-[31px]
            "
          >

            {/* Header */}

            <div
              className="
                shrink-0
                border-b
                border-amber-900/10
                px-1
                pb-4
                pt-5
              "
            >

              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-3
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
                      font-bold
                      tracking-[0.18em]
                      text-amber-950/45
                    "
                  >
                    CHECK LIST
                  </p>


                  <h2
                    className="
                      mt-1
                      truncate
                      text-[22px]
                      font-semibold
                      tracking-[-0.03em]
                      text-stone-900
                    "
                  >
                    {selectedPage.name}
                  </h2>


                  <p
                    className="
                      mt-1
                      text-[10px]
                      font-medium
                      text-stone-600
                    "
                  >
                    {checkedCount} / {selectedPage.items.length} 已完成
                  </p>

                </div>


                <div
                  className="
                    flex
                    shrink-0
                    gap-2
                  "
                >

                  <button
                    type="button"

                    onClick={
                      openEditPage
                    }

                    aria-label="編輯目前頁面"

                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-full
                      bg-amber-100/65
                      text-[14px]
                      text-stone-600
                      transition
                      active:scale-95
                    "
                  >
                    ⋯
                  </button>


                  <button
                    type="button"

                    onClick={
                      onClose
                    }

                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-full
                      bg-amber-100/65
                      text-[16px]
                      text-stone-600
                      transition
                      active:scale-95
                    "
                  >
                    ×
                  </button>

                </div>

              </div>

            </div>


            {/* Checklist */}

            <div
              className="
                min-h-0
                flex-1
                overflow-x-hidden
                overflow-y-auto
                overscroll-contain
                scroll-pb-4
                pb-4
                pt-2
                [-webkit-overflow-scrolling:touch]
              "
            >

              {selectedPage.items.length ===
                0 && (

                <div
                  className="
                    flex
                    min-h-[152px]
                    items-center
                    justify-center
                    text-center
                  "
                >

                  <div>

                    <p
                      className="
                        text-[13px]
                        font-medium
                        text-stone-700
                      "
                    >
                      這一頁還是空的
                    </p>


                    <p
                      className="
                        mt-1
                        text-[10px]
                        text-stone-500
                      "
                    >
                      在下面加入第一個確認項目
                    </p>

                  </div>

                </div>

              )}


              {selectedPage.items.map(
                item => (

                  <div
                    key={
                      item.id
                    }

                    className="
                      group
                      flex
                      min-h-[38px]
                      items-center
                      gap-3
                    "
                  >

                    {/* Checkbox */}

                    <button
                      type="button"

                      onClick={() =>
                        toggleItem(
                          item.id
                        )
                      }

                      className="
                        relative
                        flex
                        h-[18px]
                        w-[18px]
                        shrink-0
                        items-center
                        justify-center
                        rounded-[3px]
                        border
                        border-stone-500/70
                        bg-yellow-50/80
                      "
                    >

                      {item.checked && (
                        <CrayonCheck />
                      )}

                    </button>


                    {/* Text */}

                    <button
                      type="button"

                      onClick={() =>
                        toggleItem(
                          item.id
                        )
                      }

                      className={`
                        min-w-0
                        flex-1
                        text-left
                        text-[14px]
                        font-medium
                        leading-6
                        text-stone-800
                        transition

                        ${
                          item.checked
                            ? `
                                line-through
                                decoration-red-500/55
                                decoration-[2px]
                                opacity-55
                              `
                            : ''
                        }
                      `}
                    >
                      {item.text}
                    </button>


                    {/* Delete */}

                    <button
                      type="button"

                      onClick={() =>
                        removeItem(
                          item.id
                        )
                      }

                      className="
                        shrink-0
                        text-[9px]
                        font-medium
                        text-stone-500/50
                        opacity-0
                        transition
                        group-hover:opacity-100
                        active:opacity-100
                      "
                    >
                      ×
                    </button>

                  </div>

                )
              )}

            </div>


            {/* Add Item */}

            <div
              className="
                relative
                z-20
                shrink-0
                border-t
                border-amber-900/15
                bg-[#f4dc7b]/95
                pb-[calc(16px+env(safe-area-inset-bottom))]
                pt-3
                backdrop-blur-[2px]
              "
            >

              <div
                className="
                  flex
                  gap-2
                "
              >

                <input
                  type="text"

                  value={
                    newItemText
                  }

                  placeholder="新增確認項目..."

                  onChange={
                    event =>
                      setNewItemText(
                        event.target.value
                      )
                  }

                  onKeyDown={
                    event => {

                      if (
                        event.key ===
                        'Enter'
                      ) {

                        event.preventDefault()

                        addItem()

                      }

                    }
                  }

                  className="
                    min-w-0
                    flex-1
                    rounded-[13px]
                    border
                    border-amber-900/15
                    bg-yellow-50/65
                    px-3
                    py-2.5
                    text-[12px]
                    text-stone-800
                    outline-none
                    placeholder:text-stone-500
                    focus:border-amber-900/30
                  "
                />


                <button
                  type="button"

                  onClick={
                    addItem
                  }

                  className="
                    shrink-0
                    rounded-[13px]
                    bg-stone-900
                    px-3
                    py-2.5
                    text-[10px]
                    font-bold
                    text-yellow-100
                    transition
                    active:scale-95
                  "
                >
                  新增
                </button>

              </div>

            </div>

          </div>

        </div>


        {/* ====================================================
            Page Editor
        ==================================================== */}

        {pageEditorOpen && (

          <div
            className="
              absolute
              inset-0
              z-50
              flex
              items-end
              rounded-t-[30px]
              bg-stone-950/30
              backdrop-blur-[2px]
            "
          >

            <div
              className="
                w-full
                rounded-t-[26px]
                bg-[#f7f3e8]
                px-5
                pb-[calc(18px+env(safe-area-inset-bottom))]
                pt-4
                shadow-2xl
              "
            >

              <div
                className="
                  mx-auto
                  mb-4
                  h-1
                  w-10
                  rounded-full
                  bg-stone-300
                "
              />


              <div
                className="
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
                      tracking-[0.16em]
                      text-stone-400
                    "
                  >
                    BOOKMARK
                  </p>


                  <h3
                    className="
                      mt-1
                      text-[20px]
                      font-semibold
                      text-stone-900
                    "
                  >
                    {
                      editingPageId
                        ? '編輯書籤'
                        : '新增書籤頁'
                    }
                  </h3>

                </div>


                <button
                  type="button"

                  onClick={() =>
                    setPageEditorOpen(
                      false
                    )
                  }

                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    bg-stone-200
                    text-stone-600
                  "
                >
                  ×
                </button>

              </div>


              <label
                className="
                  mt-5
                  block
                "
              >

                <span
                  className="
                    text-[9px]
                    font-bold
                    tracking-[0.12em]
                    text-stone-500
                  "
                >
                  PAGE NAME
                </span>


                <input
                  type="text"

                  value={
                    pageName
                  }

                  placeholder="例如：出發前、滑雪、回程"

                  onChange={
                    event =>
                      setPageName(
                        event.target.value
                      )
                  }

                  className="
                    mt-2
                    w-full
                    rounded-[15px]
                    border
                    border-stone-200
                    bg-white
                    px-4
                    py-3
                    text-[14px]
                    text-stone-900
                    outline-none
                    focus:border-stone-400
                  "
                />

              </label>


              <div
                className="
                  mt-5
                "
              >

                <p
                  className="
                    text-[9px]
                    font-bold
                    tracking-[0.12em]
                    text-stone-500
                  "
                >
                  BOOKMARK COLOR
                </p>


                <div
                  className="
                    mt-3
                    grid
                    grid-cols-6
                    gap-2
                  "
                >

                  {BOOKMARK_COLORS.map(
                    color => {

                      const selected =
                        pageColor ===
                        color.id


                      return (

                        <button
                          key={
                            color.id
                          }

                          type="button"

                          aria-label={
                            color.label
                          }

                          onClick={() =>
                            setPageColor(
                              color.id
                            )
                          }

                          className={`
                            flex
                            aspect-square
                            items-center
                            justify-center
                            rounded-[14px]
                            border
                            transition
                            active:scale-95

                            ${
                              selected
                                ? `
                                    border-stone-900
                                    bg-white
                                    shadow-sm
                                  `
                                : `
                                    border-transparent
                                    bg-white/50
                                  `
                            }
                          `}
                        >

                          <span
                            className={`
                              h-7
                              w-7
                              rounded-[9px]
                              ${color.dotClass}
                            `}
                          />

                        </button>

                      )

                    }
                  )}

                </div>

              </div>


              <div
                className="
                  mt-6
                  grid
                  grid-cols-[1fr_auto]
                  gap-2
                "
              >

                <button
                  type="button"

                  disabled={
                    !pageName.trim()
                  }

                  onClick={
                    savePage
                  }

                  className="
                    rounded-[15px]
                    bg-stone-900
                    px-4
                    py-3
                    text-[12px]
                    font-semibold
                    text-white
                    transition
                    active:scale-[0.99]
                    disabled:opacity-30
                  "
                >
                  {
                    editingPageId
                      ? '儲存書籤'
                      : '新增頁面'
                  }
                </button>


                {
                  editingPageId &&
                  book.pages.length >
                    1 && (

                    <button
                      type="button"

                      onClick={
                        deleteCurrentPage
                      }

                      className="
                        rounded-[15px]
                        border
                        border-red-200
                        bg-red-50
                        px-4
                        py-3
                        text-[11px]
                        font-semibold
                        text-red-500
                      "
                    >
                      刪除
                    </button>

                  )
                }

              </div>

            </div>

          </div>

        )}

      </section>

    </div>

  )

}


export default QuickChecklistSheet