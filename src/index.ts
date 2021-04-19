import {
  App,
  BlockElementAction,
  Option,
  StaticSelectAction,
} from "@slack/bolt";
import dotenv from "dotenv";
import yaml from "js-yaml";
import { readFile } from "fs/promises";

import appHomeBlocks from "./views/appHome";
import { Slackbot, YamlConfig } from "./models";
import singleApp from "./views/singleApp";

dotenv.config();

let config: YamlConfig;

const app = new App({
  token: process.env.TOKEN,
  signingSecret: process.env.SIGNING_SECRET,
});

const tags = (): Option[] => [
  {
    text: { type: "plain_text", text: "All categories" },
    value: "All",
  },
  ...config.categories.map(
    (i): Option => ({
      text: { type: "plain_text", text: i },
      value: i,
    })
  ),
];

app.action("back", async ({ client, body, ack }) => {
  await ack();

  await client.views.publish({
    user_id: body.user.id,
    view: {
      type: "home",
      blocks: appHomeBlocks({
        apps: config.apps,
        tags: tags(),
        selected_tag: {
          text: { type: "plain_text", text: "All categories" },
          value: "All",
        },
      }),
    },
  });
});

app.action(/view:(.+)/, async ({ client, body, ack, ...args }) => {
  await ack();

  const action = args.action as BlockElementAction;
  const matches = action.action_id.match(/view:(.+)/);
  if (!matches) {
    return;
  }

  const [, appName] = matches;

  const fetchedApp = config.apps.find((i) => i.name == appName);
  if (!fetchedApp) return;

  await client.views.publish({
    user_id: body.user.id,
    view: {
      type: "home",
      blocks: singleApp(fetchedApp),
    },
  });
});

app.action("tag", async ({ body, client, ack, ...args }) => {
  await ack();

  const action = args.action as StaticSelectAction;

  const category = action.selected_option.value;

  const apps = config.apps.filter(
    (i) => category == "All" || i.categories.includes(category)
  );

  await client.views.publish({
    user_id: body.user.id,
    view: {
      type: "home",
      blocks: appHomeBlocks({
        apps,
        tags: tags(),
        selected_tag: tags().find((i) => i.value == category),
      }),
    },
  });
});

app.event("app_home_opened", async ({ client, event }) => {
  await client.views.publish({
    user_id: event.user,
    view: {
      type: "home",
      blocks: appHomeBlocks({
        apps: config.apps,
        tags: tags(),
        selected_tag: {
          text: { type: "plain_text", text: "All categories" },
          value: "All",
        },
      }),
    },
  });
});

(async () => {
  config = yaml.load(await readFile("apps.yaml", "utf-8")) as YamlConfig;

  await app.start(3000);
  console.log("app started 🚀");
})();
