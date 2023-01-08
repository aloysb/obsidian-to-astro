// What is left: => right directories
// Cleaning up

import { existsSync, mkdirSync, rmdirSync } from "fs";
import * as fsp from "fs/promises";
import * as os from 'os';
import { parse } from 'yaml';
import path = require("path");

// We assume vaults in /vaults/blog
// const VAULT_DIR = `${os.homedir}/vaults`
const VAULT_DIR = `${os.homedir}/obsidian/20_areas/20.30_blog`
const BLOG_DIR = `${os.homedir}/my-site/src/blog/`

interface Frontmatter {
    title: string,
    tags: string[]
    created_at: string,
    last_modified_at: string,
    draft: boolean
    slug: string
}

interface Note {
    title: string,
    filePath: string,
    content: string,
    frontmatter: Frontmatter
}

async function getAllNotes(directory: string): Promise<Note[]> {
    const notes: Note[] = [];
    await findNotesInDirectoryRecursively(directory, notes);
    return notes;
}

async function parseFileIntoNote(filePath: string): Promise<Note> | null {
    let frontmatter: Frontmatter = null;
    if (!(await fsp.stat(filePath)).isFile()) {
        return null;
    }

    try {
        const content = await fsp.readFile(filePath, { encoding: 'utf-8' })
        let rawFrontmatter = parse(content.split('---')[1]);
        frontmatter = {
            ...rawFrontmatter,
            created_at: new Date(rawFrontmatter.created_at),
            last_modified_at: new Date(rawFrontmatter.last_modified_at),
            slug: rawFrontmatter?.slug ?? rawFrontmatter.title.split(' ').join('-').toLowerCase(),
        }
        return {
            title: path.basename(filePath),
            filePath,
            content,
            frontmatter
        }
    } catch (e) {
        console.warn(`${path.basename(filePath)} doesn't have a frontmatter and won't be published.`)
        return null
    }
}


async function findNotesInDirectoryRecursively(directory: string, notes: Note[]): Promise<Note[]> {
    const subdirs = await fsp.readdir(directory)
    await Promise.all(subdirs.map(async subdir => {
        const subdirPath = path.join(directory, subdir)
        const stats = await fsp.stat(subdirPath)
        const isDirectory = stats.isDirectory();
        if (isDirectory) {
            await findNotesInDirectoryRecursively(subdirPath, notes)
        }
        const parsedNote = await parseFileIntoNote(subdirPath)
        if (parsedNote) {
            return notes.push(parsedNote)
        }
    }))

    return notes;
}

async function replaceWikilinks(notes: Note[]): Promise<Note[]> {
    return notes.map((note) => {
        const { content } = note;
        const lines = content.split('\n')
        lines.map(line => {
            const regexp = /\[\[.+?\|?.*?\]\]/g
            const wikilinks = line.match(regexp)

            if (!wikilinks) {
                return line;
            }

            line.replace(regexp, processLink)

            function processLink(link: string): string {
                const [file, title] = link.slice(2, -2).split('|')
                const linkedNote = notes.find(note => note.title === file);
                if (!linkedNote) {
                    return line;
                }
                return `[${title ?? file}](/${linkedNote.frontmatter.slug})}`
            }
        })
        return note;
    })
}

console.log(`Using the following directories:
    - Blog: ${BLOG_DIR},
    - Vault: ${VAULT_DIR},
Make sure these are the right ones!
`)

getAllNotes(VAULT_DIR).then((notes) =>
    replaceWikilinks(notes)
).then(notes => {
    if (existsSync(BLOG_DIR)) {
        rmdirSync(BLOG_DIR, { recursive: true })
    }
    mkdirSync(BLOG_DIR, { recursive: true })

    notes.map(note =>
        fsp.writeFile(`${path.join(BLOG_DIR, note.frontmatter.slug)}.md`, note.content))
})
