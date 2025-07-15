import { Button } from './button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'
import { PodcastCard, StatsCard, FeatureCard, PricingCard } from './item-cards'

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

  const features = [
    'High-quality content library',
    'Commercial licensing',
    'Global distribution rights',
    'Content usage analytics',
    'Advanced search & filtering'
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">UI Primitives Demo</h1>
          <p className="text-xl text-gray-600">Comprehensive showcase of fully-rounded button and card components</p>
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

            <Card variant="outlined" interactive="hover">
              <CardHeader>
                <CardTitle>Interactive Card</CardTitle>
                <CardDescription>This card responds to hover interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Hover over this card to see the interaction effect.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">Hover Me</Button>
              </CardFooter>
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
              icon={<div className="h-4 w-4 rounded-full bg-white"></div>}
              color="blue"
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="Total Episodes"
              value="5,678"
              icon={<div className="h-4 w-4 rounded-full bg-white"></div>}
              color="green"
              trend={{ value: 8, isPositive: true }}
            />
            <StatsCard
              title="Active Users"
              value="89K"
              icon={<div className="h-4 w-4 rounded-full bg-white"></div>}
              color="purple"
              trend={{ value: 3, isPositive: false }}
            />
            <StatsCard
              title="Revenue"
              value="$45.2K"
              icon={<div className="h-4 w-4 rounded-full bg-white"></div>}
              color="yellow"
              trend={{ value: 15, isPositive: true }}
            />
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
            <Card size="xl" rounded="full">
              <CardContent>
                <p>Extra large card with full rounded corners</p>
              </CardContent>
            </Card>
          </div>
        </section>

      </div>
    </div>
  )
} 