// useCallback: custom hooks
// http://localhost:3000/isolated/exercise/02.tsx

import * as React from 'react'
import {
  fetchPokemon,
  PokemonForm,
  PokemonDataView,
  PokemonInfoFallback,
  PokemonErrorBoundary,
} from '../pokemon'
import {PokemonData} from '../types'

type AsyncState<DataType> =
  | {
      status: 'idle'
      data?: null
      error?: null
      promise?: null
    }
  | {
      status: 'pending'
      data?: null
      error?: null
      promise: Promise<DataType>
    }
  | {
      status: 'resolved'
      data: DataType
      error: null
      promise: null
    }
  | {
      status: 'rejected'
      data: null
      error: Error
      promise: null
    }

type AsyncAction<DataType> =
  | {type: 'reset'}
  | {type: 'pending'; promise: Promise<DataType>}
  | {type: 'resolved'; data: DataType; promise: Promise<DataType>}
  | {type: 'rejected'; error: Error; promise: Promise<DataType>}

function asyncReducer<T>(
  state: AsyncState<T>,
  action: AsyncAction<T>,
): AsyncState<T> {
  switch (action.type) {
    case 'pending': {
      return {
        status: 'pending',
        data: null,
        error: null,
        promise: action.promise,
      }
    }
    case 'resolved': {
      if (action.promise !== state.promise) return state
      return {status: 'resolved', data: action.data, error: null, promise: null}
    }
    case 'rejected': {
      if (action.promise !== state.promise) return state

      return {
        status: 'rejected',
        data: null,
        error: action.error,
        promise: null,
      }
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function useAsync<DataType>() {
  const [state, dispatch] = React.useReducer<
    React.Reducer<AsyncState<DataType>, AsyncAction<DataType>>
  >(asyncReducer, {
    status: 'idle',
    data: null,
    error: null,
  })

  const run = React.useCallback((promise: Promise<DataType>) => {
    dispatch({type: 'pending', promise})
    promise.then(
      data => {
        dispatch({type: 'resolved', data, promise})
      },
      error => {
        dispatch({type: 'rejected', error, promise})
      },
    )
  }, [])

  return {...state, run}
}

function PokemonInfo({pokemonName}: {pokemonName: string}) {
  const state = useAsync<PokemonData>()

  const {data, status, error, run} = state
  React.useEffect(() => {
    if (!pokemonName) {
      return
    }
    const abortController = new AbortController()

    // 💰 note the absense of `await` here. We're literally passing the promise
    // to `run` so `useAsync` can attach it's own `.then` handler on it to keep
    // track of the state of the promise.
    const pokemonPromise = fetchPokemon(pokemonName, {
      signal: abortController.signal,
    })
    run(pokemonPromise)
    return () => abortController.abort()
  }, [pokemonName, run])

  switch (status) {
    case 'idle':
      return <span>Submit a pokemon</span>
    case 'pending':
      return <PokemonInfoFallback name={pokemonName} />
    case 'rejected':
      throw error
    case 'resolved':
      return <PokemonDataView pokemon={data} />
    default:
      throw new Error('This should be impossible')
  }
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')

  function handleSubmit(newPokemonName: string) {
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('')
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className="pokemon-info">
        <PokemonErrorBoundary onReset={handleReset} resetKeys={[pokemonName]}>
          <PokemonInfo pokemonName={pokemonName} />
        </PokemonErrorBoundary>
      </div>
    </div>
  )
}
export default App
