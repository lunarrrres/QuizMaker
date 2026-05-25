import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/api/client'

function App() {
  const [count, setCount] = useState(0)

  const { data, isLoading, error } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await apiClient.get('/health')
      return response.data
    },
    retry: false
  })

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <h1 className="text-4xl font-bold mb-8">QuizMaker Frontend</h1>
      <p className="mb-4">TailwindCSS and shadcn/ui are set up!</p>
      
      <div className="flex flex-col gap-4 items-center">
        <Button onClick={() => setCount((count) => count + 1)}>
          Count is {count}
        </Button>

        <div className="mt-8 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Backend Status:</h2>
          {isLoading && <p>Checking...</p>}
          {error && <p className="text-destructive">Error: Backend is likely offline</p>}
          {data && <p className="text-green-500">Status: {data.status}</p>}
        </div>
      </div>
    </div>
  )
}

export default App
