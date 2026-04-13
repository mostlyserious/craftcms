import * as z from 'zod/mini'

export const ExampleSchema = z.strictObject({ message: z.string() })
