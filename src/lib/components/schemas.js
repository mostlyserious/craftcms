import { EmbedSchema } from '$lib/schemas'
import * as z from 'zod/mini'

export const VideoSchema = z.union([
    z.object({ uid: z.uuid(), asset: z.undefined(), playInline: z.boolean() }),
    z.object({ uid: z.undefined(), asset: EmbedSchema, playInline: z.boolean() }),
])
