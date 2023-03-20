const homedir = Deno.env.get("HOME");
const CONFIG_PATH = `${homedir}/.vault2blog/configuration.json`;
const DEFAULT_BACKUP_DIR = `${homedir}/.vault2blog/backups`;

type ConfigType =
  | {
    type: "cli";
    values: { sourceDir: string; blogDir: string; backupDir?: string };
  }
  | { type: "integrated"; path?: string };

/*
 * Class representing the configuration
 * The configuration is a singleton and can be initialized only once
 * It is initialized either from the CLI or from the integrated configuration
 * The integrated configuration is a JSON file located in the user's home directory
 * The CLI configuration is passed as arguments to the CLI
 */
export class Config {
  private static instance: Config;
  private readonly _sourceDir: string;
  private readonly _blogDir: string;
  private readonly _backupDir: string;
  private readonly _logDir: string;

  /*
   * Getters
   */
  get sourceDir() {
    return this._sourceDir;
  }

  get blogDir() {
    return this._blogDir;
  }

  get backupDir() {
    return this._backupDir;
  }

  get logDir() {
    return this._logDir;
  }

  private constructor({
    sourceDir,
    blogDir,
    backupDir,
  }: {
    sourceDir: string;
    blogDir: string;
    backupDir: string;
  }) {
    this._blogDir = blogDir;
    this._sourceDir = sourceDir;
    this._backupDir = backupDir;
    this._logDir = `${homedir}/.vault2blog/logs`;
  }

  /*
   * Initialize the configuration
   * Create a new instance if it does not exist yet or return the existing one
   */
  public static async initialize(config: ConfigType) {
    if (this.instance) {
      return this.instance;
    }
    if (config.type === "cli") {
      this.instance = new Config({
        sourceDir: config.values.sourceDir,
        blogDir: config.values.blogDir,
        backupDir: config.values.backupDir ?? DEFAULT_BACKUP_DIR,
      });
    }

    if (config.type === "integrated") {
      let configPath = config?.path ?? CONFIG_PATH;
      try {
        const configuration = Deno.readTextFileSync(configPath);
        try {
          const directories = JSON.parse(configuration);
          this.instance = await new Config(directories);
        } catch (e) {
          console.error(
            "We found your configuration but could not parse it. It seems that the format is wrong.",
            e,
          );
        }
      } catch {
        // If testing, we don't want to overwrite the existing config
        const isTesting = Deno.env.get("ENV_MODE") === "TEST";
        if (isTesting) {
          configPath = Deno.makeTempFileSync();
        }

        // Prompts
        console.log(
          "👋 Hey, this looks like the first time you use vault2Blog. Creating a configuration file.",
        );
        const sourceDir = prompt(
          "Please provide a source directory (Obsidian vault path)",
        ) ?? "";
        const blogDir = prompt(
          "Please provide the blog content directory. If using Astro, this would be inside /content",
        ) ?? "";
        const backupDir = prompt(
          "(Optional) Please provide the backup directory. If left blank, we will use our default backup directory in $HOME/.vault2blog/backups.",
        ) ?? DEFAULT_BACKUP_DIR;

        // Create the configuration file
        const configuration = JSON.stringify({
          sourceDir,
          blogDir,
          backupDir,
        });
        Deno.writeTextFileSync(configPath, configuration, { create: true });
        this.instance = new Config({ blogDir, sourceDir, backupDir });

        // Remove the testing files if testing
        if (isTesting) {
          Deno.removeSync(configPath, { recursive: true });
        }
      }
    }

    return this.instance;
  }

  /*
   * Retrieve the configuration instance
   */
  public static retrieve() {
    console.log(this.instance);
    if (!this.instance) {
      throw Error(
        "The configuration has not been initialized. Please use the Config.initialize method to initialize the configuration.",
      );
    }
    return this.instance;
  }

  /**
   * Do not use. This is for internal testing only
   */
  static UNSAFE_destroy() {
    try {
      Deno.removeSync(CONFIG_PATH, { recursive: true });
    } catch {
      /* Do nothing! */
    }
    // @ts-ignore: this is for testing purposes only
    this.instance = undefined;
  }
}
