import { Block, KnownBlock, Option } from "@slack/bolt";
import { Slackbot } from "../models";

export default function appHomeBlocks({
  apps,
  tags,
  selected_tag,
}: {
  apps: Slackbot[];
  tags: Option[];
  selected_tag?: Option | undefined;
}): (Block | KnownBlock)[] {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          ":sparkles: here you'll find various Slack apps built by the community!",
      },
      accessory: {
        type: "static_select",
        placeholder: {
          type: "plain_text",
          text: "Filter by category",
        },
        action_id: "tag",
        initial_option: selected_tag,
        options: tags,
      },
    },
    {
      type: "divider",
    },
    ...apps.flatMap((i): (Block | KnownBlock)[] => {
      return [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text:
              ":" +
              i.emoji +
              ": *" +
              (i.bot_id ? `<@${i.bot_id}>` : i.name) +
              "* - " +
              i.description,
          },
          accessory: {
            type: "button",
            action_id: `view:${i.name}`,
            text: {
              type: "plain_text",
              text: "Info",
            },
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `:label: ${i.categories
                .map((i: string) => "*" + i + "*")
                .join(", ")}`,
            },
          ],
        },
        {
          type: "divider",
        },
      ];
    }),
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text:
            "Want to add your own? Check out https://github.com/hackclub/bot-index for more info!",
        },
      ],
    },
  ];
}
