const API_BASE = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
  const headers = { ...options.headers };
  if (!(options.body instanceof FormData) && options.body) headers["Content-Type"] = "application/json";
  const token = localStorage.getItem("softrate-admin-token");
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}/api${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  return data;
}

export const getArticles = (query = "") => request(`/articles${query}`);
export const getAdminArticles = () => request("/articles/admin/all");
export const getArticle = (slug) => request(`/articles/${encodeURIComponent(slug)}`);
export const getCategories = () => request("/categories");
export const login = (credentials) => request("/auth/login", { method: "POST", body: JSON.stringify(credentials) });
export const saveArticle = (article, id) => request(`/articles${id ? `/${id}` : ""}`, {
  method: id ? "PUT" : "POST",
  body: JSON.stringify(article)
});
export const deleteArticle = (id) => request(`/articles/${id}`, { method: "DELETE" });
export const addCategory = (name) => request("/categories", { method: "POST", body: JSON.stringify({ name }) });
export const removeCategory = (name) => request(`/categories/${encodeURIComponent(name)}`, { method: "DELETE" });
export const uploadImage = (file) => {
  const body = new FormData();
  body.append("image", file);
  return request("/articles/upload", { method: "POST", body });
};
