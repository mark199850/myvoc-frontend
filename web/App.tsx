import { useState } from 'react';
import WordItem from '../components/WordItem';
//import './App.css';
import { VocabularyItem } from '@/types/vocabulary';

function App() {
    const [items] = useState<VocabularyItem[]>([
        { id: '1', word: 'Ephemral', phonetic: '/e/', partOfSpeech: 'adj', status: 'learning', examples: [] }
    ]);

    return (
        <div style={{ width: '360px', padding: '1rem' }}>
            <header>
                <h2>My Vocabulaty</h2>
                <p>Learning: {items.filter(i => i.status === 'learning').length}</p>
                <div className="list">
                    {items.map(item => (
                        <WordItem key={item.id} item={item} onClick={console.log} />
                    ))}
                </div>
            </header>
        </div>
    )
}

export default App;
