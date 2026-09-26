import { createFileRoute } from '@tanstack/react-router'

const TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

export const Route = createFileRoute('/api/public/media/$')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = (params as { _splat?: string })._splat ?? ''
        if (!path || path.includes('..')) return new Response('Not found', { status: 404 })

        const ext = path.split('.').pop()?.toLowerCase() ?? ''
        const contentType = TYPES[ext]
        if (!contentType) return new Response('Unsupported media type', { status: 415 })

        const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
        const { data, error } = await supabaseAdmin.storage.from('site-images').download(path)
        if (error || !data) return new Response('Not found', { status: 404 })

        return new Response(await data.arrayBuffer(), {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        })
      },
    },
  },
})
