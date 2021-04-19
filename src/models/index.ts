export interface Slackbot {
  name: string;
  bot_id: string;
  description: string;
  categories: string[];
  repository: string;
  maintainer: string;
  emoji: string | undefined;
  getting_started: string;
}

export interface YamlConfig {
  categories: string[];
  apps: Slackbot[];
}
