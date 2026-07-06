export function getAccessToken() {
  return localStorage.getItem("access_token");
}

export function isLoggedIn() {
  return Boolean(getAccessToken());
}
