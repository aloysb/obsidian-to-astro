export interface NoteProps {
  //   title: string;
  filePath: string;
  //   content: string;
  //   publish: any;
  //   frontmatter: Frontmatter;
}

type Frontmatter = string;

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
      return this.rawFile.split("---")[1] as unknown as Frontmatter;
    } catch {
      return null;
    }
  }

  public get content(): Frontmatter | null {
    try {
      return this.rawFile.split("---")[2] as unknown as Frontmatter;
    } catch {
      return null;
    }
  }
}
