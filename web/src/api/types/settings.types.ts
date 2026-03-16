export interface AISettings {
  ai_base_url: string;
  ai_model: string;
  ai_api_key: string;
}

export interface AISettingsResponse extends AISettings {
  updated_at: string | null;
}

export interface AISettingsTestResponse {
  message: string;
  model: string;
}
