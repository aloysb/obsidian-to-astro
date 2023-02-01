import { Note } from "./note.ts";

export class LinkManager {
   readonly notes: Note[];

   constructor(notes: Note[]) {
      this.notes = notes;
   }
}
