// src/types/svg.d.ts
declare module "*.svg" {
  // Usamos Asset.fromModule(require(...)) → puede ser number/obj
  const content: any;
  export default content;
}
