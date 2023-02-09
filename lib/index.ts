import { Cli } from "./cli.ts";

await Cli.handleCommand(Deno.args);

//   try {
//     Deno.removeSync(path.join(blogDir), { recursive: true });
//     await prepareDestDirectory();
//     const notes = await getAllProcessedNotes(sourceDir);
//     await publishNotes(
//       notes.filter(({ frontmatter }) => frontmatter.status === "publish"),
//     );
//     console.log(` ${notes.length} notes published`);
//   } catch (e) {
//     console.error("Something went wrong", e);
//   }
// }

// async function publishNotes(notes: Note[]) {
//   await Promise.all(
//     notes.map((note) => {
//       console.log(note);
//       return Deno.writeTextFile(path.join(blogDir, note.title), note.publish);
//     }),
//   );
// }
