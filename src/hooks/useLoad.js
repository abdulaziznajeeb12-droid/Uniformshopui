import { useEffect, useState, useCallback } from 'react'
import { api, run } from '../api/client'

// Page khulte hi data load karta hai. load() dobara chalane ke liye.
export default function useLoad(path, initial = []) {
  const [data, setData] = useState(initial)
  const load = useCallback(() => run(() => api(path).then(setData)), [path])
  useEffect(() => { load() }, [load])
  return [data, load]
}