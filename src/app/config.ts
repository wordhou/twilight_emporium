const getEnvironmentVariable = (name: string, defaultName?: string): string => {
  const s = process.env[name];
  if (s === undefined && defaultName === undefined)
    throw new Error(`Environment variable ${name} is undefined`);
  else return s || (defaultName as string);
};

const isProduction = process.env["NODE_ENV"] === "production";
const sessionSecret = getEnvironmentVariable("SESSION_SECRET");
const googleClientId = getEnvironmentVariable("GOOGLE_CLIENT_ID");
const googleClientSecret = getEnvironmentVariable("GOOGLE_CLIENT_SECRET");

let port: number;
if (process.env["PORT"] === undefined && !isProduction) {
  port = 3000;
} else if (process.env["PORT"] === undefined) {
  port = 80;
} else {
  port = parseInt(process.env["PORT"]);
}

let urlRoot: string;
if (isProduction) {
  if (process.env["URL_ROOT"] === undefined) {
    throw new Error("Environment variable URL_ROOT is undefined");
  } else {
    urlRoot = process.env["URL_ROOT"];
  }
} else {
  urlRoot = process.env["URL_ROOT"] || `http://localhost:${port}`;
}

export {
  isProduction,
  sessionSecret,
  googleClientId,
  googleClientSecret,
  port,
  urlRoot,
};
