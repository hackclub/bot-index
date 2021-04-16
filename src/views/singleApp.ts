import { Block, KnownBlock } from "@slack/bolt";
import { Slackbot } from "../models";

export default function singleApp(app: Slackbot): (Block | KnownBlock)[] {
  return [
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
        text: app.name,
      },
    },
  ];
}
