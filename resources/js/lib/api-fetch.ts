export function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
    const headers = new Headers(init.headers);
    const method = (init.method ?? 'GET').toUpperCase();

    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
        const token = document.cookie
            .split('; ')
            .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
            ?.slice('XSRF-TOKEN='.length);

        if (token) {
            headers.set('X-XSRF-TOKEN', decodeURIComponent(token));
        }
    }

    return fetch(input, { ...init, credentials: 'same-origin', headers });
}
