import { defineDurableSession } from "rwsdk/auth";

export let sessions: ReturnType<typeof createSessionStore>;

const createSessionStore = (env: Env) =>
  defineDurableSession({
    sessionDurableObject: env.SESSION_DURABLE_OBJECT,
    secretKey: env.AUTH_SECRET_KEY || 'default-dev-secret-key-please-change',
  });

export const setupSessionStore = (env: Env) => {
  sessions = createSessionStore(env);
  return sessions;
};
