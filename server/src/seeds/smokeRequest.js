async function request(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { status: res.status, json, success: res.ok && json.success !== false, headers: res.headers };
}

module.exports = request;
