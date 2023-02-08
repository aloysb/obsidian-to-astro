const homedir = Deno.env.get("HOME");
const CONFIG_PATH = `${homedir}/.vault2blog/configuration.json`;

type ConfigType = {
  type: "cli";
  values: { sourceDir: string; blogDir: string };
} | { type: "integrated"; path?: string };
export class Config {
  private static instance: Config;
  private readonly _sourceDir: string;
  private readonly _blogDir: string;

  private constructor(
    { sourceDir, blogDir }: { sourceDir: string; blogDir: string },
  ) {
    this._blogDir = blogDir;
    this._sourceDir = sourceDir;
  }

  /**
   * Create or retrieve the current config (singleton)
   *
   * @param config Configuration option
   * @returns the initialized configuration
   */
  public static initialize(config: ConfigType) {
    if (this.instance) {
      return this.instance;
    }
    if (config.type === "cli") {
      this.instance = new Config({
        sourceDir: config.values.sourceDir,
        blogDir: config.values.blogDir,
      });
    }

    if (config.type === "integrated") {
      let configPath = config?.path ?? CONFIG_PATH;
      try {
        const configuration = Deno.readTextFileSync(configPath);
        try {
          const { blogDir, sourceDir } = JSON.parse(configuration);
          this.instance = new Config({ blogDir, sourceDir });
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

        // Create the configuration file
        const configuration = JSON.stringify({ sourceDir, blogDir });
        Deno.writeTextFileSync(configPath, configuration, { create: true });
        this.instance = new Config({ blogDir, sourceDir });

        // Remove the testing files if testing
        if (isTesting) {
          Deno.removeSync(configPath, { recursive: true });
        }
      }
    }

    return this.instance;
  }

  /**
   * Retrieve the current config
   * @returns the current instance
   */
  public static retrieve() {
    if (!this.instance) {
      throw Error(
        "The configuration has not been initialized. Please use the Config.initialize method to initialize the configuration.",
      );
    }
    return this.instance;
  }

  /**
   * Get the source dir path
   */
  get sourceDir() {
    return this._sourceDir;
  }

  /**
   * Get the blog dir path
   */
  get blogDir() {
    return this._blogDir;
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
