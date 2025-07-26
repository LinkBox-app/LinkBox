import alova from "..";
import type {
  TokenResponse,
  UserLogin,
  UserProfile,
  UserRegister,
} from "../types/auth.types";

/**
 * 用户登录
 * @param loginData 登录数据
 * @returns Promise<TokenResponse>
 */
export const login = (loginData: UserLogin) =>
  alova.Post<TokenResponse>("/auth/login", loginData);

/**
 * 用户注册
 * @param registerData 注册数据
 * @returns Promise<TokenResponse>
 */
export const register = (registerData: UserRegister) =>
  alova.Post<TokenResponse>("/auth/register", registerData);

/**
 * 获取用户个人信息（需要认证）
 * @returns Promise<UserProfile>
 */
export const getProfile = () => alova.Get<UserProfile>("/auth/profile");

/**
 * 刷新Token（需要认证）
 * @returns Promise<TokenResponse>
 */
export const refreshToken = () => alova.Post<TokenResponse>("/auth/refresh");
