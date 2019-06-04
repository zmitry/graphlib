workflow "New workflow" {
  on = "push"
  resolves = [
    "GitHub Action for AWS",
    "HTTP client",
  ]
}

action "GitHub Action for AWS" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  runs = "npm run update-label"
  secrets = ["GITHUB_TOKEN"]
  env = {
    GIT_AUTHOR_NAME = "Dmitry Zherebko"
    GIT_AUTHOR_EMAIL = "kraken@live.ru"
  }
}
