"use strict";

const DEFAULT_BASE_URL = "http://localhost:7032";
const STORAGE_KEYS = {
  SETTINGS: "linkbox:settings",
  TOKEN: "linkbox:token",
  USER: "linkbox:user",
};

const state = {
  baseUrl: DEFAULT_BASE_URL,
  token: null,
  user: null,
  selectedTags: [],
  availableTags: [],
  currentTab: { title: "", url: "" },
  authMode: "login",
};

const elements = {
  serverInfo: document.getElementById("server-info"),
  message: document.getElementById("message"),
  authSection: document.getElementById("auth-section"),
  mainSection: document.getElementById("main-section"),
  authForm: document.getElementById("auth-form"),
  authTitle: document.getElementById("auth-title"),
  authUsername: document.getElementById("auth-username"),
  authPassword: document.getElementById("auth-password"),
  authConfirmWrapper: document.getElementById("confirm-password-wrapper"),
  authConfirmPassword: document.getElementById("auth-confirm-password"),
  authSubmit: document.getElementById("auth-submit"),
  authToggle: document.getElementById("auth-toggle"),
  userInfo: document.getElementById("user-info"),
  currentTitle: document.getElementById("current-title"),
  currentUrl: document.getElementById("current-url"),
  noteInput: document.getElementById("note-input"),
  titleInput: document.getElementById("title-input"),
  digestInput: document.getElementById("digest-input"),
  tagInput: document.getElementById("tag-input"),
  addTagButton: document.getElementById("add-tag-button"),
  selectedTags: document.getElementById("selected-tags"),
  tagSuggestions: document.getElementById("tag-suggestions"),
  previewButton: document.getElementById("preview-button"),
  saveButton: document.getElementById("save-button"),
  refreshTags: document.getElementById("refresh-tags"),
  logoutButton: document.getElementById("logout-button"),
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  setupEventListeners();
  await loadSettings();
  updateServerInfo();
  await loadAuthState();
  await loadCurrentTab();

  if (state.token) {
    await loadTags();
  }
}

function setupEventListeners() {
  elements.authToggle.addEventListener("click", toggleAuthMode);
  elements.authForm.addEventListener("submit", handleAuthSubmit);
  elements.addTagButton.addEventListener("click", handleAddTagFromInput);
  elements.tagInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddTagFromInput();
    }
  });
  elements.selectedTags.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-tag]");
    if (button) {
      removeTag(button.dataset.tag);
    }
  });
  elements.tagSuggestions.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-tag]");
    if (chip) {
      addTag(chip.dataset.tag);
    }
  });
  elements.previewButton.addEventListener("click", handlePreview);
  elements.saveButton.addEventListener("click", handleSave);
  elements.refreshTags.addEventListener("click", () => loadTags(true));
  elements.logoutButton.addEventListener("click", handleLogout);
}

async function loadSettings() {
  const stored = await getFromStorage(STORAGE_KEYS.SETTINGS);
  if (stored && stored.baseUrl) {
    state.baseUrl = stored.baseUrl;
  } else {
    state.baseUrl = DEFAULT_BASE_URL;
  }
}

async function loadAuthState() {
  state.token = await getFromStorage(STORAGE_KEYS.TOKEN);
  state.user = await getFromStorage(STORAGE_KEYS.USER);

  if (state.token) {
    showMainSection();
  } else {
    showAuthSection();
  }

  updateUserInfo();
}

async function loadCurrentTab() {
  try {
    const tab = await queryActiveTab();
    const title = tab?.title || "未获取到标题";
    const url = tab?.url || "";

    state.currentTab = { title, url };
    elements.currentTitle.textContent = title;
    elements.currentUrl.textContent = url || "未获取到链接";

    elements.titleInput.value = title;

    if (!url || !url.startsWith("http")) {
      showMessage("当前页面无法收藏，请切换到网页标签页", "info");
      elements.previewButton.disabled = true;
      elements.saveButton.disabled = true;
    } else {
      elements.previewButton.disabled = false;
      elements.saveButton.disabled = false;
    }
  } catch (error) {
    console.error("获取标签页失败", error);
    showMessage("无法获取当前标签页，请重试", "error");
    elements.previewButton.disabled = true;
    elements.saveButton.disabled = true;
  }
}

async function loadTags(showFeedback = false) {
  try {
    const response = await apiRequest("/tags/", { method: "GET" });
    const tagNames = Array.isArray(response)
      ? response
          .map((item) => item?.name)
          .filter((name, index, arr) => typeof name === "string" && arr.indexOf(name) === index)
      : [];

    state.availableTags = tagNames;
    renderTagSuggestions();

    if (showFeedback) {
      showMessage("标签列表已刷新", "success");
    }
  } catch (error) {
    if (showFeedback) {
      showMessage(error.message, "error");
    } else {
      console.warn("加载标签失败", error);
    }
  }
}

function toggleAuthMode() {
  state.authMode = state.authMode === "login" ? "register" : "login";
  updateAuthForm();
  elements.authForm.reset();
}

function updateAuthForm() {
  if (state.authMode === "login") {
    elements.authTitle.textContent = "登录";
    elements.authSubmit.textContent = "登录";
    elements.authToggle.textContent = "没有账号？注册";
    elements.authConfirmWrapper.classList.add("hidden");
    elements.authConfirmPassword.required = false;
  } else {
    elements.authTitle.textContent = "注册";
    elements.authSubmit.textContent = "注册并登录";
    elements.authToggle.textContent = "已有账号？登录";
    elements.authConfirmWrapper.classList.remove("hidden");
    elements.authConfirmPassword.required = true;
  }
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  clearMessage();

  const username = elements.authUsername.value.trim();
  const password = elements.authPassword.value.trim();
  const confirmPassword = elements.authConfirmPassword.value.trim();

  if (!username || !password) {
    showMessage("用户名和密码不能为空", "error");
    return;
  }

  if (state.authMode === "register" && password !== confirmPassword) {
    showMessage("两次输入的密码不一致", "error");
    return;
  }

  setAuthLoading(true);

  try {
    const path = state.authMode === "login" ? "/auth/login" : "/auth/register";
    const response = await apiRequest(path, {
      method: "POST",
      body: { username, password },
      skipAuth: true,
    });

    if (!response?.access_token) {
      throw new Error("服务器未返回有效凭证");
    }

    state.token = response.access_token;
    state.user = response.user || null;

    await setInStorage({
      [STORAGE_KEYS.TOKEN]: state.token,
      [STORAGE_KEYS.USER]: state.user,
    });

    showMessage(state.authMode === "login" ? "登录成功" : "注册成功，已自动登录", "success");
    showMainSection();
    updateUserInfo();
    await loadTags();
  } catch (error) {
    showMessage(error.message || "认证失败，请稍后再试", "error");
  } finally {
    setAuthLoading(false);
  }
}

async function handlePreview() {
  clearMessage();

  if (!isUrlSavable()) {
    showMessage("当前页面无法生成预览", "error");
    return;
  }

  setMainBusy(true);
  showMessage("正在生成预览，请稍候...", "info");

  try {
    const note = elements.noteInput.value.trim() || undefined;
    const preview = await apiRequest("/resources/preview", {
      method: "POST",
      body: { url: state.currentTab.url, note },
    });

    if (preview?.title) {
      elements.titleInput.value = preview.title;
    }
    if (preview?.digest) {
      elements.digestInput.value = preview.digest;
    }
    if (Array.isArray(preview?.tags)) {
      state.selectedTags = preview.tags.filter((tag, index, arr) => typeof tag === "string" && arr.indexOf(tag) === index);
      renderSelectedTags();
    }

    showMessage("预览生成完成，可继续编辑后保存", "success");
  } catch (error) {
    showMessage(error.message || "生成预览失败，请稍后再试", "error");
  } finally {
    setMainBusy(false);
  }
}

async function handleSave() {
  clearMessage();

  if (!isUrlSavable()) {
    showMessage("当前页面无法收藏", "error");
    return;
  }

  const title = elements.titleInput.value.trim();
  const digest = elements.digestInput.value.trim();
  const tags = state.selectedTags.filter(Boolean);

  if (!title) {
    showMessage("标题不能为空", "error");
    return;
  }

  if (!digest) {
    showMessage("摘要不能为空", "error");
    return;
  }

  if (tags.length === 0) {
    showMessage("请至少添加一个标签", "error");
    return;
  }

  setMainBusy(true);
  showMessage("正在保存到 LinkBox...", "info");

  try {
    await apiRequest("/resources/", {
      method: "POST",
      body: {
        url: state.currentTab.url,
        title,
        digest,
        tags,
      },
    });

    showMessage("收藏成功！", "success");
  } catch (error) {
    showMessage(error.message || "收藏失败，请稍后重试", "error");
  } finally {
    setMainBusy(false);
  }
}

async function handleLogout() {
  await clearAuthState();
  state.selectedTags = [];
  renderSelectedTags();
  elements.titleInput.value = state.currentTab.title || "";
  elements.digestInput.value = "";
  elements.noteInput.value = "";
  showAuthSection();
  updateUserInfo();
  showMessage("已退出登录", "info");
}

function addTag(tag) {
  const name = String(tag || "").trim();
  if (!name) {
    return;
  }
  if (!state.selectedTags.includes(name)) {
    state.selectedTags.push(name);
    renderSelectedTags();
  }
  elements.tagInput.value = "";
}

function removeTag(tag) {
  state.selectedTags = state.selectedTags.filter((item) => item !== tag);
  renderSelectedTags();
}

function handleAddTagFromInput() {
  addTag(elements.tagInput.value);
}

function renderSelectedTags() {
  const container = elements.selectedTags;
  container.innerHTML = "";

  if (!state.selectedTags.length) {
    const placeholder = document.createElement("span");
    placeholder.className = "readonly-text";
    placeholder.textContent = "尚未选择标签";
    container.appendChild(placeholder);
    return;
  }

  state.selectedTags.forEach((tag) => {
    const chip = document.createElement("span");
    chip.className = "tag-chip";

    const label = document.createElement("span");
    label.textContent = tag;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "×";
    removeButton.setAttribute("aria-label", `移除标签 ${tag}`);
    removeButton.dataset.tag = tag;

    chip.append(label, removeButton);
    container.appendChild(chip);
  });
}

function renderTagSuggestions() {
  const container = elements.tagSuggestions;
  container.innerHTML = "";

  if (!state.availableTags.length) {
    const placeholder = document.createElement("span");
    placeholder.className = "readonly-text";
    placeholder.textContent = "暂无标签";
    container.appendChild(placeholder);
    return;
  }

  state.availableTags.forEach((tag) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "tag-chip";
    chip.dataset.tag = tag;
    chip.textContent = tag;
    container.appendChild(chip);
  });
}

function showAuthSection() {
  elements.authSection.classList.remove("hidden");
  elements.mainSection.classList.add("hidden");
  updateAuthForm();
}

function showMainSection() {
  elements.authSection.classList.add("hidden");
  elements.mainSection.classList.remove("hidden");
}

function updateUserInfo() {
  if (state.user?.username) {
    elements.userInfo.textContent = `已登录：${state.user.username}`;
    elements.userInfo.classList.remove("hidden");
  } else {
    elements.userInfo.textContent = "";
    elements.userInfo.classList.add("hidden");
  }
}

function updateServerInfo() {
  elements.serverInfo.textContent = `服务：${state.baseUrl}`;
}

function showMessage(text, type = "info") {
  elements.message.textContent = text;
  elements.message.classList.remove("hidden", "info", "success", "error");
  elements.message.classList.add("message", type);

  if (type === "success" || type === "info") {
    setTimeout(() => {
      if (elements.message.textContent === text) {
        clearMessage();
      }
    }, 3000);
  }
}

function clearMessage() {
  elements.message.textContent = "";
  elements.message.classList.add("hidden");
  elements.message.classList.remove("info", "success", "error");
}

function setAuthLoading(isLoading) {
  elements.authSubmit.disabled = isLoading;
  elements.authToggle.disabled = isLoading;
  elements.authUsername.disabled = isLoading;
  elements.authPassword.disabled = isLoading;
  elements.authConfirmPassword.disabled = isLoading;
}

function setMainBusy(isBusy) {
  elements.previewButton.disabled = isBusy || !isUrlSavable();
  elements.saveButton.disabled = isBusy || !isUrlSavable();
  elements.refreshTags.disabled = isBusy;
  elements.addTagButton.disabled = isBusy;
  elements.tagInput.disabled = isBusy;
}

function isUrlSavable() {
  return Boolean(state.currentTab.url && state.currentTab.url.startsWith("http"));
}

async function apiRequest(path, options = {}) {
  const { skipAuth, ...fetchOptions } = options;
  const method = (fetchOptions.method || "GET").toUpperCase();
  const headers = Object.assign({}, fetchOptions.headers);

  if (!skipAuth) {
    if (!state.token) {
      throw new Error("请先登录");
    }
    headers.Authorization = `Bearer ${state.token}`;
  }

  if (method !== "GET" && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  headers.Accept = "application/json";

  if (fetchOptions.body && typeof fetchOptions.body !== "string") {
    fetchOptions.body = JSON.stringify(fetchOptions.body);
  }

  fetchOptions.method = method;
  fetchOptions.headers = headers;

  const base = state.baseUrl?.replace(/\/+$/, "") || DEFAULT_BASE_URL;
  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;

  let response;

  try {
    response = await fetch(url, fetchOptions);
  } catch (networkError) {
    console.error("网络请求失败", networkError);
    throw new Error("无法连接到服务器，请检查选项配置或网络状态");
  }

  let data = null;
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch (parseError) {
      console.warn("解析 JSON 失败", parseError);
      data = null;
    }
  } else {
    const text = await response.text();
    data = text ? { message: text } : null;
  }

  if (!response.ok) {
    const baseMessage = data?.detail || data?.message || `请求失败 (${response.status})`;
    if (response.status === 401 && !skipAuth) {
      await clearAuthState();
      showAuthSection();
      updateUserInfo();
      throw new Error("登录已过期，请重新登录");
    }
    throw new Error(baseMessage);
  }

  return data;
}

async function getFromStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.sync.get(key, (result) => {
      if (chrome.runtime.lastError) {
        console.warn("读取存储失败", chrome.runtime.lastError);
        resolve(undefined);
        return;
      }
      resolve(result[key]);
    });
  });
}

async function setInStorage(items) {
  return new Promise((resolve) => {
    chrome.storage.sync.set(items, () => {
      if (chrome.runtime.lastError) {
        console.warn("写入存储失败", chrome.runtime.lastError);
      }
      resolve();
    });
  });
}

async function removeFromStorage(keys) {
  return new Promise((resolve) => {
    chrome.storage.sync.remove(keys, () => {
      if (chrome.runtime.lastError) {
        console.warn("移除存储失败", chrome.runtime.lastError);
      }
      resolve();
    });
  });
}

async function clearAuthState() {
  state.token = null;
  state.user = null;
  await removeFromStorage([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
}

async function queryActiveTab() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(tabs && tabs.length ? tabs[0] : null);
    });
  });
}
