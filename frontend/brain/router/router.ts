import { detectIntent, Intent } from "./intent";

export function routeMessage(message: string): Intent {
  return detectIntent(message);
}