import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  params: Promise<{ creatorSlug: string }>
}

export default async function OrderSuccess({ params }: Props) {
  const { creatorSlug } = await params
  const slug = creatorSlug.replace(/^@/, '')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-rose-50 px-4">
      <Card className="max-w-md w-full border-0 shadow-xl">
        <CardContent className="pt-8 pb-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-100 mx-auto flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Your custom serum is on its way. Check your email for order details and tracking information.
          </p>
          <div className="pt-4">
            <Link href={`/${slug}`}>
              <Button variant="outline" className="w-full">Back to Store</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
