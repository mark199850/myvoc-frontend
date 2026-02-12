import { Table, Dexie } from "dexie";
import { DictionaryItem } from "@/types/vocabulary";

class DictionaryDatabase extends Dexie {
  words!: Table<DictionaryItem>;

  constructor() {
    super("VocabularyDB");
    this.version(1).stores({
      // Primary key is 'id'. We index 'word' for search and 'learned' for potential filtering
      words: "id, word, learned",
    });
  }
}

export const db = new DictionaryDatabase();
