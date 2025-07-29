import * as z from 'zod/mini'

export const parse = (defined = null) => {
    const env = Schema.safeParse(defined ? defined : process.env)

    if (!env.success) {
        console.error(env.error.issues)
        process.exit(1)
    }

    return env.data
}

export const Schema = z.looseObject({
    VITE_BASE: z.string(),
    VITE_TEMP: z.optional(z.string()),
    VITE_PORT: z._default(z.coerce.number(), 5173),
    TINYPNG_KEY: z.string(),
    CRAFT_ENVIRONMENT: z.enum([ 'dev', 'staging', 'production' ]),
    CRAFT_SECURITY_KEY: z.string(),
    CRAFT_APP_ID: z.string(),
    PRIMARY_SITE_NAME: z.string(),
    PRIMARY_SITE_URL: z.url(),
    CRAFT_ENABLE_TEMPLATE_CACHING: z.optional(z.stringbool()),
    CRAFT_DB_DRIVER: z.string(),
    CRAFT_DB_SERVER: z.string(),
    CRAFT_DB_USER: z.string(),
    CRAFT_DB_PASSWORD: z.string(),
    CRAFT_DB_DATABASE: z.string(),
    CRAFT_DB_SCHEMA: z.string(),
    CRAFT_DB_TABLE_PREFIX: z.optional(z.string()),
    CRAFT_DB_PORT: z._default(z.coerce.number(), 3306),
    SYSTEM_EMAIL_TEST_ADDRESS: z.optional(z.email()),
    SYSTEM_EMAIL_ADDRESS: z.email(),
})
