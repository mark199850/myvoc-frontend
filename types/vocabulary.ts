export interface VocabularyItem {
    id: string;
    word: string;
    phonetic: string;
    partOfSpeech: string;
    status: 'learning' | 'learned';
    audioUrl?: string;
    examples: { id: string; original: string; translation?: string }[];
}
