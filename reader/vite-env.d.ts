/// <reference types="vite/client" />

declare module "*.worker.js?url" {
    const src: string;
    export default src;
  }
  