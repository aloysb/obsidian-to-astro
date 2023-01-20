import { parse, stringify } from "https://deno.land/std@0.171.0/encoding/yaml.ts";
export interface NoteProps {
  //   title: string;
  filePath: string;
  //   content: string;
  //   publish: any;
  //   frontmatter: Frontmatter;
}

type Frontmatter = {
   title: string;
   tags: string[];
   created_at: Date;
   last_modified_at: Date;
   status: 'idea' | 'publish' | 'draft';
   slug: string;
};
//   [x: string]: string;

export class Note {
  readonly filePath: string;
  readonly rawFile: string;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.rawFile = Deno.readTextFileSync(filePath);
  }

  public get frontmatter(): Frontmatter | null {
    try {
      const rawFrontmatter = this.rawFile.split("---")[1] as string;
       const frontmatter = parse(rawFrontmatter) as Frontmatter;
       return { ...frontmatter, last_modified_at: new Date(frontmatter.last_modified_at), created_at: new Date(frontmatter.created_at) }
    } catch {
      return null;
    }
  }

  public get content():  string | null {
    try {
      return this.rawFile.split("---")[2].trim();
    } catch {
      return null;
    }
  }
}
