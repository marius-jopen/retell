import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-red-400 via-red-500 to-red-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              🔒 Privacy Policy
            </h1>
            <p className="text-xl text-red-100 max-w-3xl mx-auto">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 md:p-12">
          
          {/* Last Updated */}
          <div className="mb-8 p-4 bg-stone-50 rounded-xl border border-stone-200">
            <p className="text-sm text-stone-600">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-red-100 pb-2">
              📋 Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Welcome to RETELL ("we," "our," or "us"). This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you visit our podcast discovery platform, 
              including any other media form, media channel, mobile website, or mobile application related 
              or connected thereto.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Please read this Privacy Policy carefully. If you do not agree with the terms of this 
              Privacy Policy, please do not access the site.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-red-100 pb-2">
              📊 Information We Collect
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Personal Information</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may collect personal information that you voluntarily provide to us when you:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6 ml-4">
              <li>Register for an account</li>
              <li>Upload podcast content</li>
              <li>Contact us with inquiries</li>
              <li>Subscribe to our newsletter</li>
              <li>Participate in surveys or promotions</li>
            </ul>

            <p className="text-gray-700 leading-relaxed mb-4">
              This information may include:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6 ml-4">
              <li>Name and email address</li>
              <li>Company information</li>
              <li>Country and location data</li>
              <li>Profile information</li>
              <li>Podcast content and metadata</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Usage Information</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We automatically collect certain information when you visit our platform:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6 ml-4">
              <li>IP address and location information</li>
              <li>Browser type and operating system</li>
              <li>Pages visited and time spent on our platform</li>
              <li>Referring website addresses</li>
              <li>Search queries and interaction data</li>
            </ul>
          </section>

          {/* How We Use Information */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-red-100 pb-2">
              🎯 How We Use Your Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use the information we collect for various purposes, including to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6 ml-4">
              <li>Provide, operate, and maintain our platform</li>
              <li>Process your registration and manage your account</li>
              <li>Enable podcast uploading and content management</li>
              <li>Facilitate content discovery and recommendations</li>
              <li>Send administrative information and updates</li>
              <li>Respond to your comments and questions</li>
              <li>Improve our services and user experience</li>
              <li>Monitor and analyze usage patterns</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-red-100 pb-2">
              🤝 Information Sharing and Disclosure
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties 
              without your consent, except in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6 ml-4">
              <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers who assist us in operating our platform</li>
              <li><strong>Legal Requirements:</strong> We may disclose information when required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> Information may be transferred in connection with a merger, acquisition, or sale of assets</li>
              <li><strong>Public Content:</strong> Podcast content you choose to make public will be visible to other users</li>
              <li><strong>Consent:</strong> We may share information with your explicit consent</li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-red-100 pb-2">
              🔐 Data Security
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement appropriate technical and organizational security measures to protect your 
              personal information against unauthorized access, alteration, disclosure, or destruction. 
              These measures include:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6 ml-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication procedures</li>
              <li>Secure hosting infrastructure</li>
              <li>Regular backup and disaster recovery procedures</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              However, no method of transmission over the internet or electronic storage is 100% secure. 
              While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-red-100 pb-2">
              ⚖️ Your Privacy Rights
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have certain rights regarding your personal information, including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6 ml-4">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request transfer of your data to another service provider</li>
              <li><strong>Objection:</strong> Object to certain types of processing</li>
              <li><strong>Withdrawal:</strong> Withdraw consent where processing is based on consent</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              To exercise these rights, please contact us using the information provided below.
            </p>
          </section>

          {/* Cookies */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-red-100 pb-2">
              🍪 Cookies and Tracking
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to enhance your experience on our platform. 
              Cookies help us:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6 ml-4">
              <li>Remember your preferences and settings</li>
              <li>Analyze site traffic and usage patterns</li>
              <li>Provide personalized content recommendations</li>
              <li>Improve site functionality and performance</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              You can control cookie settings through your browser preferences. Note that disabling 
              cookies may affect some functionality of our platform.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-red-100 pb-2">
              👶 Children's Privacy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our platform is not intended for use by children under the age of 13. We do not knowingly 
              collect personal information from children under 13. If you are a parent or guardian and 
              believe your child has provided us with personal information, please contact us immediately.
            </p>
          </section>

          {/* Changes to Policy */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-red-100 pb-2">
              📝 Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the "Last Updated" date. 
              You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-red-100 pb-2">
              📧 Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="bg-stone-50 rounded-xl border border-stone-200 p-6">
              <ul className="text-gray-700 space-y-2">
                <li><strong>Email:</strong> privacy@retell.com</li>
                <li><strong>Website:</strong> Contact form on our platform</li>
                <li><strong>Response Time:</strong> We aim to respond within 48 hours</li>
              </ul>
            </div>
          </section>

          {/* Back to Home */}
          <div className="text-center pt-8 border-t border-gray-200">
            <Link href="/">
              <Button className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105">
                🏠 Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 