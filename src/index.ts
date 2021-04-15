import { App, Option, StaticSelectAction } from "@slack/bolt";
import dotenv from "dotenv";
import airtable from "airtable";
import appHomeBlocks, { Slackbot } from "./appHome";

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

function parseAirtableSlackbot(fields: any): Slackbot {
  return {
    maintainer: fields["Maintainer"],
    emoji: fields["Emoji"],
    id: fields["Bot ID"],
    name: fields["Name"],
    description: fields["Description"],
    repository: fields["Repository URL"],
    tags: fields["Tags"],
  };
}

app.action("tag", async ({ body, client, ack, ...args }) => {
  await ack();

  const action = args.action as StaticSelectAction;

  const category = action.selected_option.value;

  const apps = (await base.select().all())
    .map((i) => parseAirtableSlackbot(i.fields))
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
  const apps = (await base.select().all()).map((i) =>
    parseAirtableSlackbot(i.fields)
  );

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
