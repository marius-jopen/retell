'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function TestSignupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  const testSignup = async () => {
    setLoading(true)
    setResult('')

    try {
      const testEmail = `test-${Date.now()}@example.com`
      const testData = {
        email: testEmail,
        password: 'TestPassword123!',
        fullName: 'Test User',
        role: 'client'
      }

      console.log('Testing signup with:', testData)

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      })

      const data = await response.json()

      console.log('Response:', { status: response.status, data })

      if (response.ok) {
        setResult(`✅ SUCCESS: User created successfully!
Email: ${testEmail}
User ID: ${data.user?.id}
Profile: ${JSON.stringify(data.profile, null, 2)}`)
      } else {
        setResult(`❌ ERROR: ${data.error || 'Unknown error'}
Status: ${response.status}
Details: ${JSON.stringify(data, null, 2)}`)
      }
    } catch (error) {
      console.error('Test error:', error)
      setResult(`❌ NETWORK ERROR: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testDatabaseConnection = async () => {
    setLoading(true)
    setResult('')

    try {
      const response = await fetch('/api/test-db', {
        method: 'GET',
      })

      const data = await response.json()

      if (response.ok) {
        setResult(`✅ DATABASE CONNECTION: ${data.message}`)
      } else {
        setResult(`❌ DATABASE ERROR: ${data.error}`)
      }
    } catch (error) {
      setResult(`❌ CONNECTION ERROR: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Signup Test Utility</h1>
      
      <div className="space-y-4 mb-8">
        <Button
          onClick={testSignup}
          disabled={loading}
          className="mr-4"
        >
          {loading ? 'Testing...' : 'Test Signup Process'}
        </Button>
        
        <Button
          onClick={testDatabaseConnection}
          disabled={loading}
          variant="outline"
        >
          {loading ? 'Testing...' : 'Test Database Connection'}
        </Button>
      </div>

      {result && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Test Results:</h2>
          <div className={`p-4 rounded border ${result.includes('SUCCESS') || result.includes('✅') 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'}`}>
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Test Instructions:</h3>
        <ul className="text-sm space-y-1">
          <li>1. Click "Test Signup Process" to test user creation</li>
          <li>2. Check the console for detailed logs</li>
          <li>3. If successful, the user profile should be created automatically</li>
          <li>4. If there are errors, they will be displayed with details</li>
        </ul>
      </div>
    </div>
  )
} 