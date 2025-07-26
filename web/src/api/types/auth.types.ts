/**
 * 用户认证相关的类型定义
 */

// 用户注册请求类型
export interface UserRegister {
  username: string; // 用户名（3-50个字符）
  password: string; // 密码（6-100个字符）
}

// 用户登录请求类型
export interface UserLogin {
  username: string; // 用户名
  password: string; // 密码
}

// 用户响应类型
export interface UserResponse {
  id: number;
  username: string;
  created_at: string; // ISO 8601 格式的日期字符串
  updated_at: string; // ISO 8601 格式的日期字符串
}

// Token响应类型
export interface TokenResponse {
  access_token: string;
  token_type: string; // 默认为 "bearer"
  user: UserResponse;
}

// 用户个人信息类型
export interface UserProfile {
  id: number;
  username: string;
  created_at: string; // ISO 8601 格式的日期字符串
  updated_at: string; // ISO 8601 格式的日期字符串
}