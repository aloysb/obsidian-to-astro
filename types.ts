export interface Frontmatter {
    title: string;
    tags: string[];
    created_at: Date;
    last_modified_at: Date;
    draft: boolean;
    slug: string;
}

export interface Note {
    title: string;
    filePath: string;
    content: string;
    frontmatter: Frontmatter;
}