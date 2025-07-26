import { createAlova } from "alova";
import adapterFetch from "alova/fetch";
import ReactHook from "alova/react";
import { AUTH_TOKEN_KEY } from "../storage-key.constant";

export const BASE_URL = "http://localhost:7032";

const alova = createAlova({
  requestAdapter: adapterFetch(),
  baseURL: BASE_URL,
  statesHook: ReactHook,
  // 请求拦截器
  beforeRequest(method) {
    // 鉴权
    if (!method.meta?.isFile) {
      method.config.headers["Content-Type"] = "application/json";
    }
    method.config.headers["Authorization"] = `Bearer ${localStorage.getItem(
      AUTH_TOKEN_KEY
    )}`;
  },
  // 响应拦截器，解包
  responded: async (response) => {
    const json = await response.json();
    if (response.status !== 200) {
      throw new Error(json.message);
    } else {
      return json;
    }
  },
});

export default alova;
