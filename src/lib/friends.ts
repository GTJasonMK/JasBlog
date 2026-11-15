import fs from "node:fs";
import path from "node:path";
import { parseFriends, visibleFriends } from "@jas/content-core";

export function getFriends() {
  const file = path.join(process.env.JASBLOG_WORKSPACE_ROOT ?? process.cwd(), "content/friends.json");
  if (!fs.existsSync(file)) return [];
  return visibleFriends(parseFriends(JSON.parse(fs.readFileSync(file, "utf8"))));
}
