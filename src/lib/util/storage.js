/** Store or retrieve a value in the local storage.
 * @param {string} key
 * @return {[ () => any, (value: any) => void ]}
 * */
export function useLocal(key) {
    return [
        () => safeParse(localStorage.getItem(key)),
        value => localStorage.setItem(key, JSON.stringify(value)),
    ]
}

/** Store or retrieve a value in the session storage.
 * @param {string} key
 * @return {[ () => any, (value: any) => void ]}
 * */
export function useSession(key) {
    return [
        () => safeParse(sessionStorage.getItem(key)),
        value => sessionStorage.setItem(key, JSON.stringify(value)),
    ]
}

/** Sets a cookie with a certain value and expiry date, or retrieves the value of a cookie.
 * @param {string} key
 * @return {[ () => any, (value: any) => void ]}
 * */
export function useCookie(key) {
    return [
        () => {
            const value = `; ${document.cookie}`
            const parts = value.split(`; ${key}=`)

            if (parts.length === 2) {
                return parts[1].split(';').shift() || ''
            }

            return ''
        },
        (value, expires = 3.154e+7) => {
            document.cookie = `${key}=${value};expires=${expiration(expires).toUTCString()};path=/;secure=true`
        },
    ]
}

/** Sets the expiration time for a cookie.
 * @param {number} expires - The duration for which the cookie should be valid in milliseconds.
 * */
function expiration(expires) {
    const now = new Date()

    now.setTime(now.getTime() + expires)

    return now
}

/**
 * @param {any} value
 * */
function safeParse(value) {
    try {
        return JSON.parse(value || '')
    } catch (_) {
        return undefined
    }
}
