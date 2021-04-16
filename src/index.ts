import {
  App,
  BlockElementAction,
  Option,
  StaticSelectAction,
} from "@slack/bolt";
import dotenv, { parse } from "dotenv";
import airtable from "airtable";
import appHomeBlocks from "./views/appHome";
import { Slackbot } from "./models";
import singleApp from "./views/singleApp";

dotenv.config();

const base = airtable.base("appZdcsR7RxCCDH5j").table("Apps");

const app = new App({
  token: process.env.TOKEN,
  signingSecret: process.env.SIGNING_SECRET,
});

const tags: Option[] = [
  {
    text: { type: "plain_text", text: "All categories" },
    value: "All",
  },
  {
    text: { type: "plain_text", text: "HN" },
    value: "HN",
  },
  {
    text: { type: "plain_text", text: "Games" },
    value: "Games",
  },
  {
    text: { type: "plain_text", text: "Utilities" },
    value: "Utilities",
  },
];

function parseAirtableSlackbot(record: any): Slackbot {
  return {
    maintainer: record.fields["Maintainer"],
    emoji: record.fields["Emoji"],
    botId: record.fields["Bot ID"],
    name: record.fields["Name"],
    description: record.fields["Description"],
    repository: record.fields["Repository URL"],
    tags: record.fields["Tags"],
    id: record.id,
    gettingStarted: record.fields["Getting Started"],
  };
}

app.action("back", async ({ client, body, ack }) => {
  await ack();

  const apps = (await base.select().all()).map(parseAirtableSlackbot);

  await client.views.publish({
    user_id: body.user.id,
    view: {
      type: "home",
      blocks: appHomeBlocks({
        apps,
        tags,
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

  const [, recordId] = matches;

  const record = parseAirtableSlackbot(await base.find(recordId));

  await client.views.publish({
    user_id: body.user.id,
    view: {
      type: "home",
      blocks: singleApp(record),
    },
  });
});

app.action("tag", async ({ body, client, ack, ...args }) => {
  await ack();

  const action = args.action as StaticSelectAction;

  const category = action.selected_option.value;

  const apps = (await base.select().all())
    .map(parseAirtableSlackbot)
    .filter((i) => category == "All" || i.tags.includes(category));

  await client.views.publish({
    user_id: body.user.id,
    view: {
      type: "home",
      blocks: appHomeBlocks({
        apps,
        tags,
        selected_tag: tags.find((i) => i.value == category),
      }),
    },
  });
});

app.event("app_home_opened", async ({ client, event }) => {
  const apps = (await base.select().all()).map(parseAirtableSlackbot);

  await client.views.publish({
    user_id: event.user,
    view: {
      type: "home",
      blocks: appHomeBlocks({
        apps,
        tags,
        selected_tag: {
          text: { type: "plain_text", text: "All categories" },
          value: "All",
        },
      }),
    },
  });
});

(async () => {
  await app.start(3000);
  console.log("app started 🚀");
})();
