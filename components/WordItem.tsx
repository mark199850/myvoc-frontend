import React from 'react';
import { VocabularyItem } from "../types/vocabulary";
import { Volume2 } from 'lucide-react';
interface Props {
    item: VocabularyItem;
    onClick: (item: VocabularyItem) => void;
}

export default function WordItem({ item, onClick }: Props) {
    return (
        <li className="list-row bg-gray-600 rounded-4xl" onClick={() => onClick(item)}>
            <div className="info">
                <div>{item.word}</div>
                <div className="text-xs uppercase font-semibold opacity-60">{item.partOfSpeech}</div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); /* Play Audio */ }}>
                <Volume2 size={16} />
            </button>
        </li>
    )
}
