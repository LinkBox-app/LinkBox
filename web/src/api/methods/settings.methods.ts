import alova from "..";
import type {
  AISettings,
  AISettingsResponse,
  AISettingsTestResponse,
} from "../types/settings.types";

export const getAISettings = () =>
  alova.Get<AISettingsResponse>("/settings/ai");

export const updateAISettings = (payload: AISettings) =>
  alova.Put<AISettingsResponse>("/settings/ai", payload);

export const testAISettings = (payload: AISettings) =>
  alova.Post<AISettingsTestResponse>("/settings/ai/test", payload);
