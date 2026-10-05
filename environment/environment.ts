import { getDevServerHostIp } from "./getHostIp";
const devHostIp = getDevServerHostIp();

export const environment = {

  // LOCAL --------------------
  // API_BASE_URL: `http://${devHostIp}:3000/`,

  // DEV --------------------
  // API_BASE_URL: "https://plantcare-api.polygonagro.com/",

  // UAT --------------------
  // API_BASE_URL: "https://plant-care-api-uat.vercel.app/",

  // PROD --------------------
  API_BASE_URL: "https://plantcare-api-prod.polygonagro.com/",
};

export default environment;

