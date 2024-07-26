/** @type {import('ts-jest').JestConfigWithTsJest} */
export const extensionsToTreatAsEsm = ['.ts'];
export const moduleNameMapper = {
  '^(\\.{1,2}/.*)\\.js$': '$1',
};
export const transform = {
  // '^.+\\.[tj]sx?$' to process ts,js,tsx,jsx with `ts-jest`
  // '^.+\\.m?[tj]sx?$' to process ts,js,tsx,jsx,mts,mjs,mtsx,mjsx with `ts-jest`
  '^.+\\.tsx?$': [
    'ts-jest',
    {
      useESM: true,
    },
  ],
};