import { createAlova } from "alova";
import adapterFetch from "alova/fetch";
import ReactHook from "alova/react";

export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:7032";

const alova = createAlova({
  requestAdapter: adapterFetch(),
  baseURL: BASE_URL,
  statesHook: ReactHook,
  // 请求拦截器
  beforeRequest(method) {
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
