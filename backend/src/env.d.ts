// src/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    JWT_TOKEN: string;
  }
}