import { useState } from 'react';
import WordItem from '../../components/WordItem';
import './App.css';
import ReactDOM from 'react-dom/client';
import { VocabularyItem } from '@/types/vocabulary';

function App() {
    const [items] = useState<VocabularyItem[]>([
        { id: '1', word: 'Ephemral', phonetic: '/e/', partOfSpeech: 'adj', status: 'learning', examples: [] }
    ]);
    const [searchInput, setSearchInput] = useState('');
    return (
        <div style={{ width: '360px', padding: '1rem' }}>

            <header className='flex flex-col gap-4 items-stretch'>
                <h1 className='text-xl self-center'>You know {items.filter(i => i.status === 'learning').length} words</h1>
                <progress className="progress w-56 self-center" value={items.filter(i => i.status === 'learning').length} max="10"></progress>
                <input type="text" placeholder="Search or add" className="input bg-amber-60" />
                <button className='btn' onClick={async () =>
                    browser.storage.local.set({ items })
                }>Add</button>
                <ul className="list bg-base-100 rounded-box shadow-md">
                    {items.map(item => (
                        <WordItem key={item.id} item={item} onClick={console.log} />
                    ))}
                </ul>
            </header>
        </div>
    )
}
//ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
export default App;
