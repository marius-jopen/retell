import { Button } from './button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'
import { PodcastCard, FeatureCard, PricingCard } from './item-cards'
import { StatsCard } from './stats-card'
import { ActionCard } from './action-card'
import { ContentBox } from './content-box'
import { ListItemCard } from './list-item-card'
import { PodcastList } from './podcast-list'
import { Table, TableColumn } from './table'
import Link from 'next/link'

export default function PrimitivesDemo() {
  const samplePodcast = {
    id: '1',
    title: 'The Tech Talk Show',
    description: 'Weekly discussions about the latest in technology, innovation, and digital transformation. Join our experts as they dive deep into emerging trends.',
    category: 'technology',
    language: 'EN',
    cover_image_url: 'https://picsum.photos/400/300',
    episodes: { length: 24 }
  }

  // Sample data for table demo
  const sampleUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active', joined: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Author', status: 'active', joined: '2024-02-20' },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'User', status: 'inactive', joined: '2024-03-10' }
  ]

  const userColumns: TableColumn[] = [
    {
      key: 'name',
      title: 'User',
      render: (_, user) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">
              {user.name.split(' ').map((n: string) => n[0]).join('')}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{user.name}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      title: 'Role',
      render: (_, user) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          user.role === 'Admin' ? 'bg-red-100 text-red-800' :
          user.role === 'Author' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {user.role}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (_, user) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {user.status}
        </span>
      ),
      align: 'center'
    },
    {
      key: 'joined',
      title: 'Joined',
      render: (_, user) => (
        <span className="text-xs text-gray-500">{user.joined}</span>
      ),
      sortable: true
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, user) => (
        <div className="flex space-x-1">
          <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-7">
            Edit
          </Button>
          <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-7">
            Delete
          </Button>
        </div>
      ),
      align: 'right'
    }
  ]

  const features = [
    'High-quality content library',
    'Commercial licensing',
    'Global distribution rights',
    'Content usage analytics',
    'Advanced search & filtering'
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎨 RETELL Design System
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Modern, compact components designed for Silicon Valley 2025. 
            Featuring bigger rounded corners, tighter spacing, and clean aesthetics without kitsch.
          </p>
        </div>
        
        {/* Button Variants */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Button Variants</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Button variant="default">Default</Button>
            <Button variant="primary">Primary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="gradient">Gradient</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="info">Info</Button>
            <Button loading>Loading</Button>
          </div>
        </section>

        {/* Button Sizes */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Button Sizes</h2>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="xs">Extra Small</Button>
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra Large</Button>
            <Button size="icon">🎵</Button>
            <Button size="icon-sm">🎤</Button>
            <Button size="icon-lg">🎧</Button>
          </div>
        </section>



        {/* Basic Card Variants */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Basic Card Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>This is a default card with standard styling</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Card content goes here with some sample text to show layout.</p>
              </CardContent>
              <CardFooter>
                <Button size="sm">Action</Button>
              </CardFooter>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
                <CardDescription>This card has enhanced shadow for prominence</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Perfect for highlighting important content or featured items.</p>
              </CardContent>
              <CardFooter>
                <Button variant="primary" size="sm">Featured</Button>
              </CardFooter>
            </Card>

            <Card variant="outlined">
              <CardHeader>
                <CardTitle>Outlined Card</CardTitle>
                <CardDescription>Clean border, no shadow</CardDescription>
              </CardHeader>
            </Card>
            
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
                <CardDescription>Enhanced shadow depth</CardDescription>
              </CardHeader>
            </Card>
            
            <Card variant="gradient">
              <CardHeader>
                <CardTitle>Gradient Card</CardTitle>
                <CardDescription>Subtle gradient background</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Stats Cards */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Stats Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Podcasts"
              value="1,234"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
                </svg>
              }
              color="blue"
              trend={{ value: 12, isPositive: true, label: "this month" }}
            />
            <StatsCard
              title="Total Episodes"
              value="5,678"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              color="green"
              trend={{ value: 8, isPositive: true }}
            />
            <StatsCard
              title="Active Users"
              value="89K"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              }
              color="purple"
              trend={{ value: 3, isPositive: false }}
            />
            <StatsCard
              title="Revenue"
              value="$45.2K"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              }
              color="yellow"
              trend={{ value: 15, isPositive: true, label: "vs last month" }}
            />
          </div>
        </section>

        {/* Action Cards */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Action Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ActionCard
              title="Create Podcast"
              icon="🎤"
              description="Start your podcasting journey"
              onClick={() => console.log('Create podcast clicked')}
            />
            <ActionCard
              title="Browse Catalog"
              icon="🎧"
              href="/catalog"
              description="Explore amazing content"
              variant="featured"
            />
            <ActionCard
              title="View Analytics"
              icon="📊"
              href="/analytics"
              description="Track your performance"
            />
          </div>
        </section>

        {/* Content Boxes */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Content Boxes</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ContentBox
              title="Recent Activity"
              action={<Button variant="outline" size="sm">View All</Button>}
            >
              <ListItemCard
                title="New Podcast Submission"
                subtitle="Tech Talk Weekly"
                metadata="2 hours ago"
                status={{ label: "pending", variant: "pending" }}
                avatar={{ fallback: "TT" }}
              />
              <ListItemCard
                title="Episode Published"
                subtitle="The Future of AI - Episode 42"
                metadata="4 hours ago"
                status={{ label: "published", variant: "published" }}
                avatar={{ fallback: "AI" }}
              />
              <ListItemCard
                title="User Registration"
                subtitle="John Doe joined"
                metadata="1 day ago"
                status={{ label: "active", variant: "success" }}
                avatar={{ fallback: "JD" }}
              />
            </ContentBox>

            <ContentBox
              title="Popular Content"
              variant="featured"
              isEmpty={false}
            >
              <ListItemCard
                title="How to Start Podcasting"
                subtitle="Complete beginner's guide"
                metadata="1.2K views • Technology"
                avatar={{ fallback: "HP" }}
                href="/podcast/123"
              />
              <ListItemCard
                title="Interview Techniques"
                subtitle="Master the art of conversation"
                metadata="890 views • Education"
                avatar={{ fallback: "IT" }}
                href="/podcast/456"
              />
              <ListItemCard
                title="Audio Production Tips"
                subtitle="Professional sound on a budget"
                metadata="670 views • Tutorial"
                avatar={{ fallback: "AP" }}
                href="/podcast/789"
              />
            </ContentBox>
          </div>
        </section>

        {/* List Item Cards Variants */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">List Item Card Variants</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Default Size</h3>
              <div className="space-y-3">
                <ListItemCard
                  title="Amazing Podcast Title"
                  subtitle="by Creative Author"
                  metadata="Technology • Published 2 days ago"
                  status={{ label: "approved", variant: "approved" }}
                  avatar={{ fallback: "AP" }}
                />
                <ListItemCard
                  title="Another Great Episode"
                  subtitle="Episode 15 • Marketing Mastery"
                  metadata="by Business Expert • 1 week ago"
                  status={{ label: "pending", variant: "pending" }}
                  avatar={{ fallback: "MM" }}
                  action={<Button variant="outline" size="sm">Review</Button>}
                />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Compact Size</h3>
              <div className="space-y-2">
                <ListItemCard
                  title="Quick Update"
                  subtitle="Short description"
                  metadata="Just now"
                  variant="compact"
                  status={{ label: "new", variant: "info" }}
                  avatar={{ fallback: "QU" }}
                />
                <ListItemCard
                  title="System Notification"
                  subtitle="Backup completed"
                  metadata="5 minutes ago"
                  variant="compact"
                  status={{ label: "success", variant: "success" }}
                  avatar={{ fallback: "SN" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Feature Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon="🎤"
              title="Create Content"
              description="Upload and manage your podcast content with our intuitive creator tools."
              action={{ label: "Get Started", href: "/create" }}
            />
            <FeatureCard
              icon="📊"
              title="Analytics"
              description="Track performance and engagement with detailed analytics and insights."
              action={{ label: "View Analytics", href: "/analytics" }}
            />
            <FeatureCard
              icon="🌍"
              title="Global Reach"
              description="Distribute your content worldwide with our global licensing platform."
              action={{ label: "Learn More", href: "/distribution" }}
            />
          </div>
        </section>

        {/* Podcast Card */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Podcast Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PodcastCard
              podcast={samplePodcast}
              href="/podcast/1"
              variant="default"
            />
            <PodcastCard
              podcast={{...samplePodcast, title: "Featured Podcast"}}
              href="/podcast/2"
              variant="featured"
            />
            <PodcastCard
              podcast={{...samplePodcast, title: "Minimal View", cover_image_url: undefined}}
              variant="minimal"
              showActions={false}
            />
          </div>
        </section>

        {/* Pricing Cards */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Pricing Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PricingCard
              name="Starter"
              price="$29"
              period="per month"
              description="Perfect for individual creators"
              features={features.slice(0, 3)}
              buttonText="Start Free Trial"
              onSelect={() => console.log('Starter selected')}
            />
            <PricingCard
              name="Professional"
              price="$89"
              period="per month"
              description="Ideal for businesses"
              features={features}
              highlighted={true}
              buttonText="Start Free Trial"
              onSelect={() => console.log('Professional selected')}
            />
            <PricingCard
              name="Enterprise"
              price="Custom"
              description="Tailored solutions"
              features={[...features, 'White-label options', 'Custom integration']}
              buttonText="Contact Sales"
              onSelect={() => console.log('Enterprise selected')}
            />
          </div>
        </section>

        {/* Card Sizes and Rounded Variants */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Card Sizes & Rounded Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card size="sm" rounded="sm">
              <CardContent>
                <p className="text-sm">Small card with small rounded corners</p>
              </CardContent>
            </Card>
            <Card size="default" rounded="default">
              <CardContent>
                <p>Default card with default rounded corners</p>
              </CardContent>
            </Card>
            <Card size="lg" rounded="lg">
              <CardContent>
                <p>Large card with large rounded corners</p>
              </CardContent>
            </Card>
            <Card size="lg" rounded="full">
              <CardContent>
                <p>Extra large card with full rounded corners</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Universal List Components */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🎙️ Podcast List Component</h2>
          
          <div className="grid grid-cols-1 gap-8">
            {/* With Podcasts */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">With Sample Podcasts</h3>
              <PodcastList
                title="Recent Podcasts"
                podcasts={[
                  {
                    id: '1',
                    title: 'Tech Talk Daily',
                    category: 'Technology',
                    language: 'en',
                    status: 'approved',
                    created_at: new Date().toISOString(),
                    episodes: [{ id: '1' }, { id: '2' }, { id: '3' }],
                    user_profiles: {
                      full_name: 'John Doe',
                      email: 'john@example.com'
                    }
                  },
                  {
                    id: '2',
                    title: 'Die sogenannte Gegenwart',
                    category: 'General',
                    language: 'de',
                    status: 'pending',
                    created_at: new Date(Date.now() - 86400000).toISOString(),
                    episodes: [{ id: '1' }, { id: '2' }],
                    user_profiles: {
                      full_name: 'Hans Müller',
                      email: 'hans@example.com'
                    }
                  },
                  {
                    id: '3',
                    title: 'Science Weekly',
                    category: 'Science',
                    language: 'en',
                    status: 'draft',
                    created_at: new Date(Date.now() - 172800000).toISOString(),
                    episodes: [{ id: '1' }],
                    user_profiles: {
                      full_name: 'Dr. Sarah Smith',
                      email: 'sarah@example.com'
                    }
                  }
                ]}
                viewAllHref="/podcasts"
                getItemHref={(podcast) => `/podcast/${podcast.id}`}
                showAuthor={true}
              />
            </div>

            {/* Author View (No Author Names) */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Author View (No Author Names)</h3>
              <PodcastList
                title="Your Recent Podcasts"
                podcasts={[
                  {
                    id: '1',
                    title: 'My Awesome Podcast',
                    category: 'Entertainment',
                    language: 'en',
                    status: 'approved',
                    created_at: new Date().toISOString(),
                    episodes: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }]
                  },
                  {
                    id: '2',
                    title: 'Weekly Updates',
                    category: 'News',
                    language: 'en',
                    status: 'pending',
                    created_at: new Date(Date.now() - 86400000).toISOString(),
                    episodes: [{ id: '1' }, { id: '2' }]
                  }
                ]}
                viewAllHref="/author/podcasts"
                getItemHref={(podcast) => `/author/podcasts/${podcast.id}/edit`}
                showAuthor={false}
              />
            </div>

            {/* Empty State */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Empty State</h3>
              <PodcastList
                title="Recent Podcasts"
                podcasts={[]}
                emptyStateMessage="No podcasts have been created yet"
                emptyStateIcon="📻"
                viewAllHref="/podcasts"
              />
            </div>
          </div>
        </section>

        {/* Table Component */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Table Component</h2>
          
          <div className="grid grid-cols-1 gap-8">
            {/* Basic Table */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management Table</h3>
              <Table
                title="Users"
                columns={userColumns}
                data={sampleUsers}
                emptyStateMessage="No users found"
                emptyStateIcon="👥"
              />
            </div>

            {/* Table without title */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Table Without Header</h3>
              <Table
                columns={userColumns}
                data={sampleUsers.slice(0, 2)}
              />
            </div>

            {/* Empty Table */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Empty State</h3>
              <Table
                title="Empty Table"
                columns={userColumns}
                data={[]}
                emptyStateMessage="No data to display"
                emptyStateIcon="📭"
              />
            </div>
          </div>
        </section>

      </div>
    </div>
  )
} 