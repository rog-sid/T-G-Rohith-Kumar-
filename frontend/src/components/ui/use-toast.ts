// Lightweight toast store adapted from shadcn/ui (Radix Toast).
import * as React from 'react'

const TOAST_LIMIT = 4
const TOAST_REMOVE_DELAY = 4000

export type ToastVariant = 'default' | 'success' | 'destructive'

export interface ToasterToast {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: ToastVariant
  open: boolean
  onOpenChange?: (open: boolean) => void
}

let count = 0
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type State = { toasts: ToasterToast[] }

const listeners: Array<(state: State) => void> = []
let memoryState: State = { toasts: [] }
const timeouts = new Map<string, ReturnType<typeof setTimeout>>()

function dispatch(newState: State) {
  memoryState = newState
  listeners.forEach((l) => l(memoryState))
}

function addRemoveTimeout(id: string) {
  if (timeouts.has(id)) return
  const t = setTimeout(() => {
    timeouts.delete(id)
    dispatch({ toasts: memoryState.toasts.filter((x) => x.id !== id) })
  }, 300)
  timeouts.set(id, t)
}

export interface ToastInput {
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: ToastVariant
}

export function toast(input: ToastInput) {
  const id = genId()
  const dismiss = () => {
    dispatch({
      toasts: memoryState.toasts.map((t) => (t.id === id ? { ...t, open: false } : t)),
    })
    addRemoveTimeout(id)
  }

  const newToast: ToasterToast = {
    ...input,
    id,
    open: true,
    onOpenChange: (open) => {
      if (!open) dismiss()
    },
  }

  dispatch({ toasts: [newToast, ...memoryState.toasts].slice(0, TOAST_LIMIT) })

  setTimeout(dismiss, TOAST_REMOVE_DELAY)
  return { id, dismiss }
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState)
  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const idx = listeners.indexOf(setState)
      if (idx > -1) listeners.splice(idx, 1)
    }
  }, [])
  return { toasts: state.toasts, toast }
}
