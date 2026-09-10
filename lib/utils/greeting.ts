import { DictKey } from "@/lib/i18n/dictionary";

const GREETING_KEYS: DictKey[] = [
  "greeting_0", "greeting_1", "greeting_2", "greeting_3",
  "greeting_4", "greeting_5", "greeting_6", "greeting_7",
];

export function getGreetingKey(): DictKey {
  const hour = new Date().getHours();
  const block = Math.floor(hour / 3); // 0..7, tiap blok 3 jam
  return GREETING_KEYS[block];
}