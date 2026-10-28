import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import useFetchPhotos from '../hooks/useFetchPhotos'

const FAVORITES_STORAGE_KEY = 'celebrare-gallery-favorites'

function getInitialFavorites() {
  if (typeof window === 'undefined') {
    return []
  }

  let savedFavorites
  try {
    savedFavorites = window.localStorage.getItem(FAVORITES_STORAGE_KEY)
  } catch (storageError) {
    console.error('Unable to read favorites from localStorage.', storageError)
    return []
  }

  if (savedFavorites === null) {
    return []
  }

  try {
    const parsedFavorites = JSON.parse(savedFavorites)

    if (
      !Array.isArray(parsedFavorites) ||
      !parsedFavorites.every((photoId) => typeof photoId === 'string')
    ) {
      return []
    }

    return [...new Set(parsedFavorites)]
  } catch {
    return []
  }
}

function favoritesReducer(favoriteIds, action) {
  switch (action.type) {
    case 'toggle':
      return favoriteIds.includes(action.photoId)
        ? favoriteIds.filter((photoId) => photoId !== action.photoId)
        : [...favoriteIds, action.photoId]
    default:
      throw new Error(`Unknown favorites action: ${action.type}`)
  }
}

function Gallery() {
  const { photos, loading, error } = useFetchPhotos()
  const [searchQuery, setSearchQuery] = useState('')
  const [favoriteIds, dispatchFavorites] = useReducer(
    favoritesReducer,
    undefined,
    getInitialFavorites,
  )

  useEffect(() => {
    try {
      window.localStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(favoriteIds),
      )
    } catch (storageError) {
      console.error('Unable to save favorites to localStorage.', storageError)
    }
  }, [favoriteIds])

  const handleSearchChange = useCallback((event) => {
    setSearchQuery(event.target.value)
  }, [])

  const filteredPhotos = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return photos
    }

    return photos.filter((photo) =>
      photo.author.toLowerCase().includes(normalizedQuery),
    )
  }, [photos, searchQuery])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="flex items-center gap-3 text-gray-700" role="status">
          <span
            className="size-8 animate-spin rounded-full border-4 border-gray-300 border-t-fuchsia-600"
            aria-hidden="true"
          />
          <span>Loading photos...</span>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <p
          className="max-w-lg rounded-lg border border-red-200 bg-white p-6 text-center text-red-700 shadow-sm"
          role="alert"
        >
          We couldn&apos;t load the photos. {error}
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Photo Gallery
          </h1>
          <p className="mt-2 text-gray-600">A collection of photos from Picsum.</p>
        </header>

        <div className="mx-auto mb-8 max-w-xl">
          <label
            className="mb-2 block text-sm font-medium text-gray-700"
            htmlFor="author-search"
          >
            Search by author
          </label>
          <input
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200"
            id="author-search"
            type="search"
            placeholder="Enter an author name"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {filteredPhotos.length > 0 ? (
          <section
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            aria-label="Photo gallery"
          >
              {filteredPhotos.map((photo) => {
                const isFavorite = favoriteIds.includes(photo.id)

                return (
                  <article
                    className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200"
                    key={photo.id}
                  >
                    <img
                      className="aspect-[4/3] w-full object-cover"
                      src={photo.download_url}
                      alt={`Photo ${photo.id} by ${photo.author}`}
                      loading="lazy"
                    />
                    <div className="flex items-center justify-between gap-3 p-4">
                      <p className="truncate font-medium text-gray-800">{photo.author}</p>
                      <button
                        className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 ${
                          isFavorite
                            ? 'text-rose-600 hover:bg-rose-50'
                            : 'text-gray-500 hover:bg-gray-100 hover:text-rose-600'
                        }`}
                        type="button"
                        aria-label={`${isFavorite ? 'Remove' : 'Add'} photo by ${photo.author} ${
                          isFavorite ? 'from' : 'to'
                        } favorites`}
                        aria-pressed={isFavorite}
                        onClick={() =>
                          dispatchFavorites({ type: 'toggle', photoId: photo.id })
                        }
                      >
                        <svg
                          className="size-6"
                          viewBox="0 0 24 24"
                          fill={isFavorite ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          strokeWidth="1.8"
                          aria-hidden="true"
                        >
                          <path
                            d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </article>
                )
              })}
          </section>
        ) : (
          <p className="rounded-lg bg-white p-8 text-center text-gray-600 shadow-sm">
            No photos match “{searchQuery.trim()}”. Try another author name.
          </p>
        )}
      </div>
    </main>
  )
}

export default Gallery
