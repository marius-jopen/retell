import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/lib/auth'

export default async function UnauthorizedPage() {
  const user = await getCurrentUser()
  
  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        {/* Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Access Denied
        </h1>
        
        <p className="text-lg text-gray-600 mb-4">
          You don't have permission to access this page. Please contact an administrator if you believe this is an error.
        </p>

        {/* Debug Info */}
        {user && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Signed in as:</strong> {user.profile.full_name} ({user.profile.role})
            </p>
            <p className="text-xs text-blue-600 mt-1">
              If you're an admin and seeing this, there might be a role assignment issue.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-4">
          <Link href="/">
            <Button 
              variant="default" 
              size="lg" 
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              Go to Homepage
            </Button>
          </Link>
          
          {user ? (
            <Link href={user.profile.role === 'admin' ? '/admin' : '/author'}>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/auth/login">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Additional Help */}
        <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h3>
          <p className="text-sm text-gray-600">
            If you're having trouble accessing content, please check that you're signed in with the correct account or contact support.
          </p>
        </div>
      </div>
    </div>
  )
}
