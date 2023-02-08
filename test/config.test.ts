import {
  afterEach,
  describe,
  it,
} from "https://deno.land/std@0.175.0/testing/bdd.ts";
import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { stub } from "https://deno.land/std@0.177.0/testing/mock.ts";

import { Config } from "../lib/config.ts";

describe("Config", () => {
  const BLOG_DIR = "/my/path/to/blog";
  const VAULT_DIR = "/my/path/to/vault";
  afterEach(() => {
    Config.UNSAFE_destroy();
  });
  describe("CLI config mode", () => {
    it("should return a new instance when CLI arguments are passed", () => {
      const config = Config.initialize({
        type: "cli",
        values: { blogDir: BLOG_DIR, sourceDir: VAULT_DIR },
      });
      assertEquals(BLOG_DIR, config?.blogDir);
      assertEquals(VAULT_DIR, config?.sourceDir);
    });
    it("should return the instance that been initialized", () => {
      const config = Config.initialize({
        type: "cli",
        values: { blogDir: "/my/path/to/blog", sourceDir: "/my/path/to/vault" },
      });
      const retrieveConfig = Config.retrieve();
      assertEquals(JSON.stringify(config), JSON.stringify(retrieveConfig));
    });
  });

  describe("Integrated config mode", () => {
    it("should create a configuration file if the configuration is in integrated and I don't have an existing config", () => {
      Deno.env.set("ENV_MODE", "TEST");
      // Calls to prompt will always return the same string.
      let promptStubCount = 0;
      const promptStubValues = [VAULT_DIR, BLOG_DIR];
      const promptStub = stub(window, "prompt", () => {
        const stub = promptStubValues[promptStubCount];
        promptStubCount++;
        return stub;
      });

      Config.initialize({ type: "integrated" });
      promptStub.restore();

      const configuration = Config.retrieve();
      assertEquals(configuration.blogDir, BLOG_DIR);
      assertEquals(configuration.sourceDir, VAULT_DIR);
      Deno.env.set("ENV_MODE", "");
    });

    it("should read my configuration file if it exists", () => {
      const tempFile = Deno.makeTempFileSync({ suffix: ".json" });
      Deno.writeTextFileSync(
        tempFile,
        `{"sourceDir": "${VAULT_DIR}", "blogDir": "${BLOG_DIR}"}`,
      );
      Config.initialize({ type: "integrated", path: tempFile });
      const configuration = Config.retrieve();
      assertEquals(configuration.blogDir, BLOG_DIR);
      assertEquals(configuration.sourceDir, `${VAULT_DIR}`);
      Deno.removeSync(tempFile);
    });
  });
});
