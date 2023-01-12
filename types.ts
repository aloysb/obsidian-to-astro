export interface Frontmatter {
    title: string;
    tags: string[];
    created_at: Date;
    last_modified_at: Date;
    status: 'idea' | 'publish' | 'draft';
    slug: string;
}

export interface Note {
    title: string;
    filePath: string;
    content: string;
    frontmatter: Frontmatter;
}