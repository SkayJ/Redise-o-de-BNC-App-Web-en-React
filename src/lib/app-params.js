const getAppParams = () => ({
  appId: null,
  token: null,
  fromUrl: typeof window !== "undefined" ? window.location.href : null,
  functionsVersion: null,
  appBaseUrl: null,
});

export const appParams = {
  ...getAppParams(),
};
