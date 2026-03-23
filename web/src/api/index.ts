import { createAlova } from "alova";
import adapterFetch from "alova/fetch";
import ReactHook from "alova/react";
import { ensureRuntimeReady, getRuntimeConfig } from "../runtime";

export const getBaseUrl = () => getRuntimeConfig().apiBaseUrl;

const alova = createAlova({
  requestAdapter: adapterFetch(),
  baseURL: getBaseUrl(),
  statesHook: ReactHook,
  // 请求拦截器
  async beforeRequest(method) {
    await ensureRuntimeReady();
    method.config.headers ??= {};

    if (!method.meta?.isFile) {
      method.config.headers["Content-Type"] = "application/json";
    }
  },
  // 响应拦截器，解包
  responded: async (response) => {
    const json = await response.json();
    if (response.status !== 200) {
      throw new Error(json.message || json.detail || "请求失败");
    } else {
      return json;
    }
  },
});

export default alova;
