"use strict";

const DEFAULT_BASE_URL = "http://localhost:7032";
const STORAGE_KEYS = {
  SETTINGS: "linkbox:settings",
  TOKEN: "linkbox:token",
  USER: "linkbox:user",
};

const elements = {
  baseUrlInput: document.getElementById("base-url"),
  status: document.getElementById("status"),
  saveButton: document.getElementById("save-button"),
  testButton: document.getElementById("test-button"),
  clearAuthButton: document.getElementById("clear-auth"),
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  const settings = await getFromStorage(STORAGE_KEYS.SETTINGS);
  const baseUrl = settings?.baseUrl || DEFAULT_BASE_URL;
  elements.baseUrlInput.value = baseUrl;

  elements.saveButton.addEventListener("click", handleSave);
  elements.testButton.addEventListener("click", handleTestConnection);
  elements.clearAuthButton.addEventListener("click", handleClearAuth);
}

async function handleSave() {
  const rawValue = elements.baseUrlInput.value.trim() || DEFAULT_BASE_URL;

  const normalized = normalizeBaseUrl(rawValue);
  if (!normalized) {
    showStatus("请输入合法的服务端地址（需包含 http 或 https）", "error");
    return;
  }

  await setInStorage({
    [STORAGE_KEYS.SETTINGS]: { baseUrl: normalized },
  });

  showStatus("已保存。请在弹窗中重新尝试登录或请求。", "success");
}

async function handleTestConnection() {
  const inputValue = elements.baseUrlInput.value.trim();
  const rawBase = inputValue || DEFAULT_BASE_URL;
  const baseUrl = normalizeBaseUrl(rawBase);

  if (!baseUrl) {
    showStatus("请输入合法的服务端地址后再进行测试。", "error");
    return;
  }

  const healthUrl = `${baseUrl}/health`;

  setButtonsDisabled(true);
  showStatus("正在测试连接...", "info");

  try {
    const response = await fetch(healthUrl);
    if (!response.ok) {
      throw new Error(`服务器返回状态码 ${response.status}`);
    }
    const data = await response.json().catch(() => ({}));
    if (data?.status === "healthy" || Object.keys(data).length === 0) {
      showStatus(`连接成功：${healthUrl}`, "success");
    } else {
      showStatus("已连接服务器，但返回结果异常，请检查日志。", "error");
    }
  } catch (error) {
    console.error("测试连接失败", error);
    showStatus(`无法连接服务器：${error.message}`, "error");
  } finally {
    setButtonsDisabled(false);
  }
}

async function handleClearAuth() {
  await removeFromStorage([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
  showStatus("登录信息已清除。需要时可在弹窗中重新登录。", "success");
}

function normalizeBaseUrl(value) {
  try {
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol)) {
      return null;
    }
    const normalized = url.toString().replace(/\/+$/, "");
    return normalized;
  } catch (error) {
    return null;
  }
}

function showStatus(message, type = "info") {
  elements.status.textContent = message;
  elements.status.classList.remove("hidden", "info", "success", "error");
  elements.status.classList.add("message", type);
}

function setButtonsDisabled(disabled) {
  elements.saveButton.disabled = disabled;
  elements.testButton.disabled = disabled;
  elements.clearAuthButton.disabled = disabled;
  elements.baseUrlInput.disabled = disabled;
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
