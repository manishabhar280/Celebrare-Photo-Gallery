import { useEffect, useState } from 'react'

const PHOTOS_URL = 'https://picsum.photos/v2/list?limit=30'

function isPhotoList(value) {
  return (
    Array.isArray(value) &&
    value.length === 30 &&
    value.every(
      (photo) =>
        photo !== null &&
        typeof photo === 'object' &&
        typeof photo.id === 'string' &&
        typeof photo.author === 'string' &&
        typeof photo.download_url === 'string',
    )
  )
}

export default function useFetchPhotos() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    async function fetchPhotos() {
      try {
        const response = await fetch(PHOTOS_URL)
        if (!response.ok) {
          throw new Error(`Unable to load photos (HTTP ${response.status}).`)
        }

        const data = await response.json()
        if (!isPhotoList(data)) {
          throw new Error('The photo service returned an invalid response.')
        }

        if (active) {
          setPhotos(data)
        }
      } catch (fetchError) {
        if (active) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : 'Unable to load photos. Please try again.',
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchPhotos()

    return () => {
      active = false
    }
  }, [])

  return { photos, loading, error }
}
