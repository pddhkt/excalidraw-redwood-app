import { route } from "rwsdk/router";
import { DevLogin } from "./DevLogin";

export const devRoutes = [
  route("/dev-login", DevLogin),
];
