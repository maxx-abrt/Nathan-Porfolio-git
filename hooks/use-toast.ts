// Système de notifications toast (inspiré de react-hot-toast)
// Implémente un pattern store global avec reducer + listeners
// Permet d'ajouter, mettre à jour, masquer et supprimer des toasts depuis n'importe où

'use client'

import * as React from 'react'

import type { ToastActionElement, ToastProps } from '@/components/ui/toast'

// Nombre maximum de toasts affichés simultanément
const TOAST_LIMIT = 1
// Délai avant suppression définitive d'un toast masqué (en ms)
const TOAST_REMOVE_DELAY = 1000000

// Type étendu d'un toast avec id, titre, description et action optionnelle
type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

// Types d'actions possibles pour le reducer
const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const

// Compteur incrémental pour générer des identifiants uniques
let count = 0

// Génère un identifiant unique pour chaque toast
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

// Union discriminée de toutes les actions possibles
type Action =
  | {
      type: ActionType['ADD_TOAST']
      toast: ToasterToast
    }
  | {
      type: ActionType['UPDATE_TOAST']
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType['DISMISS_TOAST']
      toastId?: ToasterToast['id']
    }
  | {
      type: ActionType['REMOVE_TOAST']
      toastId?: ToasterToast['id']
    }

// État global du store de toasts
interface State {
  toasts: ToasterToast[]
}

// Map des timeouts de suppression en attente par toast
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

// Ajoute un toast à la file de suppression après le délai défini
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: 'REMOVE_TOAST',
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

// Reducer pur pour gérer les transitions d'état des toasts
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    // Ajout d'un nouveau toast (limité au TOAST_LIMIT)
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    // Mise à jour partielle d'un toast existant
    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t,
        ),
      }

    // Masquage d'un toast (le met dans la file de suppression)
    case 'DISMISS_TOAST': {
      const { toastId } = action

      // Effet de bord : programme la suppression différée
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
      }
    }
    // Suppression définitive d'un toast du tableau
    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

// Liste des listeners abonnés aux changements d'état
const listeners: Array<(state: State) => void> = []

// État global en mémoire (en dehors de React pour persistance entre composants)
let memoryState: State = { toasts: [] }

// Dispatche une action, met à jour l'état et notifie tous les listeners
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, 'id'>

// Crée et affiche un nouveau toast, retourne des méthodes pour le contrôler
function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: 'UPDATE_TOAST',
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id })

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

// Hook React pour s'abonner à l'état des toasts et obtenir les méthodes de contrôle
function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  // S'abonne aux changements d'état à la montée, se désabonne à la destruction
  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  // Retourne l'état courant + les fonctions toast() et dismiss()
  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
  }
}

export { useToast, toast }
