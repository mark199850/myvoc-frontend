import { useState } from "react";
import "./App.css";
import { Header } from "@/components/Header";
import { WordList } from "@/components/WordList";
import { logger } from "@/utils/logger";
import { DictionaryItem } from "@/types/vocabulary";

function App() {
  return <MainScreen />;
}
export default App;

function MainScreen() {
  const {
    displayedItems,
    allItems,
    search,
    isSearching,
    addWord,
    changeWordLearnedState,
    error,
  } = useDictionary();
  logger.debug("Main rendered");
  const [query, setQuery] = useState("");

  //Debounce fetch
  useEffect(() => {
    logger.debug("User typed into search:", query);
    const timeoutId = setTimeout(() => {
      search(query);
    }, 200);
    return () => clearTimeout(timeoutId);
  }, [query, search]);

  const handleQueryChange = useCallback((newVal: string) => {
    setQuery(newVal);
  }, []);

  const handleAddWord = useCallback(
    (dictionaryItem: DictionaryItem, learned: boolean) => {
      addWord({ ...dictionaryItem, learned: learned });
    },
    [addWord],
  );

  const handleEnter = (learned: boolean) => {
    const firstItem = displayedItems[0];
    if (!firstItem) return;
    handleAddWord(firstItem, learned);
  };

  const showEnterHint =
    displayedItems.length !== 0 &&
    !!query &&
    !isSearching &&
    displayedItems[0].learned === undefined;

  //TODO: Next feature
  const handleOnWordClick = useCallback((dictionaryItemId: string) => {
    return;
  }, []);

  const handleOnChangeLearnedStateButtonClick = useCallback(
    (dictionaryItemId: string, learned: boolean) => {
      changeWordLearnedState(dictionaryItemId, learned);
    },
    [changeWordLearnedState],
  );

  const learnedWordsCount = allItems.current.filter(
    (item) => item.learned,
  ).length;

  return (
    <div className="flex flex-col h-150 w-100 bg-base-100 text-base-content">
      <Header
        query={query}
        isSearching={isSearching}
        onQueryChange={handleQueryChange}
        onEnter={handleEnter}
        showEnterHint={showEnterHint}
        wordCount={learnedWordsCount}
        error={error}
      />

      <main className="flex-1 overflow-hidden relative">
        <WordList
          items={displayedItems}
          query={query}
          onWordClick={handleOnWordClick}
          onAddWordButtonClick={handleAddWord}
          onChangeLearnedStateButtonClick={
            handleOnChangeLearnedStateButtonClick
          }
        />
      </main>
    </div>
  );
}
