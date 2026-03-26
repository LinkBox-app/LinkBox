import alova from "..";
import type { UserProfile } from "../types/auth.types";

/**
 * 获取本地用户信息
 * @returns Promise<UserProfile>
 */
export const getProfile = () => alova.Get<UserProfile>("/auth/profile");
