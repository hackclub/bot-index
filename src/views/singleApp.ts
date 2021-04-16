import { Block, KnownBlock } from "@slack/bolt";
import { Slackbot } from "../models";

export default function singleApp(app: Slackbot): (Block | KnownBlock)[] {
  const blocks: (Block | KnownBlock)[] = [
    {
      type: "actions",
      elements: [
        {
          type: "button",
          action_id: "back",
          text: {
            type: "plain_text",
            emoji: true,
            text: ":arrow_left: Back",
          },
        },
      ],
    },
    {
      type: "header",
      text: {
        type: "plain_text",
        text: (app.emoji ? `:${app.emoji}: ` : "") + app.name,
        emoji: true,
      },
    },
    {
      type: "divider",
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Description*\n${app.description}`,
        },
        {
          type: "mrkdwn",
          text: `*Maintainer*\n${app.maintainer}`,
        },
      ],
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Repository*\n${app.repository}`,
        },
      ],
    },
  ];

  if (app.gettingStarted) {
    blocks.push(
      {
        type: "header",
        text: {
          type: "plain_text",
          emoji: true,
          text: `:checkered_flag: Getting started`,
        },
      },
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: app.gettingStarted || "null",
        },
      }
    );
  }

  return blocks;
}
