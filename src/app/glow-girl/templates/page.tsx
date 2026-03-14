import { requireGlowGirl } from '@/lib/auth'
import { getTemplates, getFavoriteIds, getTemplateCategories } from '@/lib/actions/templates'
import { TemplateLibrary } from './_components/template-library'

export default async function TemplatesPage() {
  const { glowGirl } = await requireGlowGirl()

  const [templates, favoriteIds, categories] = await Promise.all([
    getTemplates(),
    getFavoriteIds(glowGirl.id),
    getTemplateCategories(),
  ])

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-[#6E6A62]">Marketing Templates</h1>
        <p className="text-sm text-[#6E6A62]/60 mt-1">
          Ready-to-use scripts, captions, and hooks. Copy, customize, and post.
        </p>
      </div>

      <TemplateLibrary
        initialTemplates={templates}
        initialFavoriteIds={Array.from(favoriteIds)}
        categories={categories}
        glowGirlId={glowGirl.id}
      />
    </div>
  )
}
