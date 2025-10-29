const API_BASE_URL = localStorage.getItem('sl_api_base') || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export function setApiBase(url) {
	localStorage.setItem('sl_api_base', url);
}

export async function api(path, options = {}) {
	const url = `${API_BASE_URL}${path}`;
	const res = await fetch(url, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...(options.headers || {})
		}
	});
	if (!res.ok) {
		let err;
		try { err = await res.json(); } catch { err = { error: res.statusText }; }
		throw new Error(err.error || 'Request failed');
	}
	try { return await res.json(); } catch { return null; }
}

export const Api = {
	register: (payload) => api('/api/users/register', { method: 'POST', body: JSON.stringify(payload) }),
	login: (payload) => api('/api/users/login', { method: 'POST', body: JSON.stringify(payload) }),
	listLinks: (userId) => api(`/api/links?user_id=${userId}`),
	createLink: (payload) => api('/api/links', { method: 'POST', body: JSON.stringify(payload) }),
	deleteLink: (id) => api(`/api/links/${id}`, { method: 'DELETE' }),
	updateLink: (id, payload) => api(`/api/links/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
};
