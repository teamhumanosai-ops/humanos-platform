/// <reference types="expo/types" />

interface ImportMetaEnv {
  readonly EXPO_PUBLIC_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
