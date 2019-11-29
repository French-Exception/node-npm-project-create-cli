# Installation
```bash
git clone git@github.com:French-Exception/frenchex-node-npm-project-create-cli.git
npm install --only dev
```

# Usage

```bash
$ node src/index.js --help
index.js <command>

Commands:
  index.js create <name>   Create a new Npm project
  index.js clone <gitUrl>  Create a new Npm project from a git url

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]


$ node src/index.js create --help
index.js create <name>

Create a new Npm project

Options:
  --help            Show help                                          [boolean]
  --version         Show version number                                [boolean]
  --scope           Scope for new npm module                            [string]
  --git             create git                         [boolean] [default: true]
  --git-branch      git branch to checkout         [string] [default: "develop"]
  --git-flow        Init git flow                      [boolean] [default: true]
  --destroy-before  If dir exists, delete it          [boolean] [default: false]
  --root-path       path
     [string] [default: "C:\code\node_modules\@frenchex\npm-project-create-cli"]
  --install         NPM to install with --save             [array] [default: []]
  --devInstall      NPM to install with --save             [array] [default: []]
  --author          Author name                                         [string]
  --npm-bin         node NPM bin                       [string] [default: "npm"]
  --git-bin         git bin                            [string] [default: "git"]
  --log-level
  [choices: "trace", "debug", "log", "info", "warn", "error", "fatal"] [default:
                                                                         "info"]

$ node src/index.js clone --help
index.js clone <gitUrl>

Create a new Npm project from a git url

Options:
  --help            Show help                                          [boolean]
  --version         Show version number                                [boolean]
  --branch          branch to checkout             [string] [default: "develop"]
  --root-path       directory
     [string] [default: "C:\code\node_modules\@frenchex\npm-project-create-cli"]
  --git-bin         git bin                            [string] [default: "git"]
  --npm-bin         npm bin                            [string] [default: "npm"]
  --dev             npm i --only dev                   [boolean] [default: true]
  --destroy-before  Delete directory if exists before cloning
                                                      [boolean] [default: false]
  --log-level
  [choices: "trace", "debug", "log", "info", "warn", "error", "fatal"] [default:
                                                                         "info"]

```
