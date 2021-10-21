// useContext: simple Counter
// http://localhost:3000/isolated/exercise/03.tsx

import * as React from 'react'

const CounterContext = React.createContext(undefined)

// 🐨 create your CountContext here with React.createContext
function CountProvider({children}) {
  const [count, setCount] = React.useState(0)
  const value = [count, setCount]
  return (
    <CounterContext.Provider value={value}>{children}</CounterContext.Provider>
  )
}

function useCount() {
  const context = React.useContext(CounterContext)
  if (context === undefined) {
    throw new Error('useCount must be used within a CountProvider')
  }
  return context
}
// 🐨 create a CountProvider component here that does this:
//   🐨 get the count state and setCount updater with React.useState
//   🐨 create a `value` array with count and setCount
//   🐨 return your context provider with the value assigned to that array and forward all the other props
//   💰 more specifically, we need the children prop forwarded to the context provider

function CountDisplay() {
  const [count] = useCount()
  // 🐨 get the count from useContext with the CountContext
  // const count = 0
  return <div>{`The current count is ${count}`}</div>
}

function Counter() {
  // 🐨 replace the fake implementation of setCount with what you get back from useContext with the CountContext
  const [, setCount] = useCount()
  const increment = () => setCount(c => c + 1)
  return <button onClick={increment}>Increment count</button>
}

function App() {
  return (
    <div>
      {/*
        🐨 wrap these two components in the CountProvider so they can access
        the CountContext value
      */}
      <CountProvider>
        <CountDisplay />
        <Counter />
      </CountProvider>
    </div>
  )
}

export default App
