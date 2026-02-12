import { useEffect, useState, useRef, useCallback } from "react";
import { DictionaryItem } from "@/types/vocabulary";
import { db } from "@/services/db";
import { logger } from "../utils/logger";

export function useDictionary() {
  const [displayedItems, setDisplayedItems] = useState<DictionaryItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<Error | null>();

  const lastCachedDisplayedItems = useRef<DictionaryItem[]>([]);
  const allItems = useRef<DictionaryItem[]>([]);
  const workerRef = useRef<Worker | null>(null);
  const searchRequestId = useRef(0);

  // Initialize Worker & Load Data

  function setupWorker(
    workerRef: React.RefObject<Worker | null>,
    handlers: (e: MessageEvent) => void,
  ) {
    const worker = new Worker(
      new URL("../services/search.worker.ts", import.meta.url),
      {
        type: "module",
      },
    );

    worker.onmessage = handlers;
    workerRef.current = worker;
  }

  function updateAllItems(id: string, updater: (item: DictionaryItem) => void) {
    const item = allItems.current.find((x) => x.id === id);
    if (!item) return;

    updater(item);
  }

  function addToAllItems(item: DictionaryItem) {
    allItems.current.push(item);
  }

  function updateDisplayedItem(
    id: string,
    updater: (item: DictionaryItem) => void,
  ) {
    const item = lastCachedDisplayedItems.current.find((x) => x.id === id);
    if (!item) return;

    updater(item);
    setDisplayedItems([...lastCachedDisplayedItems.current]);
  }

  const handleWorkerMessage = (e: MessageEvent) => {
    switch (e.data.type) {
      case "SEARCH_RESULTS": {
        const isCompleted: boolean = e.data.completed ?? true;
        if (e.data.requestId !== searchRequestId.current) {
          setIsSearching(false);
          return;
        }

        const words: DictionaryItem[] = e.data.payload;
        const wordsMap = new Map<string, DictionaryItem>();

        words.forEach((item) => {
          const existing = wordsMap.get(item.id);

          if (!existing || (item.learned && !existing.learned)) {
            wordsMap.set(item.id, item);
          }
        });

        const filtered = Array.from(wordsMap.values());
        setDisplayedItems(filtered);
        lastCachedDisplayedItems.current = filtered;
        logger.debug("Last Cached Displayed Items", lastCachedDisplayedItems);
        setIsSearching(!isCompleted);
        error !== null && setError(null);
        break;
      }

      case "ADD_ONE_FINISHED": {
        const newItem = e.data.payload;
        if (!newItem) return;

        addToAllItems(newItem);

        updateDisplayedItem(newItem.id, (item) => {
          item.learned = newItem.learned;
        });

        logger.debug("Word added:", newItem);
        break;
      }

      case "CHANGE_WORD_LEARNED_STATE_FINISHED": {
        const updated = e.data.payload;
        if (!updated) return;

        updateAllItems(updated.id, (item) => {
          item.learned = updated.learned;
        });

        updateDisplayedItem(updated.id, (item) => {
          item.learned = updated.learned;
        });

        break;
      }

      case "WORKER_FAIL": {
        logger.error(e.data.subtype, e.data.message);
        setError({ name: e.data.subtype, message: e.data.message });
        if (e.data.subtype === "SEARCH_API_FAILED") setIsSearching(false);
        break;
      }
    }
  };

  useEffect(() => {
    setupWorker(workerRef, handleWorkerMessage);

    // Load all data into memory on startup
    db.words.toArray().then((data) => {
      allItems.current = data;
      setDisplayedItems(data);
      lastCachedDisplayedItems.current = data;
      logger.debug("loading all data into array", data);
      workerRef.current?.postMessage({ type: "INIT_INDEX", payload: data });
    });

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const search = useCallback(
    (query: string) => {
      const currentId = ++searchRequestId.current;

      if (!query.trim()) {
        setDisplayedItems(allItems.current);
        lastCachedDisplayedItems.current = allItems.current;
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      workerRef.current?.postMessage({
        type: "SEARCH",
        payload: query,
        requestId: currentId,
      });
    },
    [allItems],
  );

  const addWord = async (newWord: DictionaryItem) => {
    workerRef.current?.postMessage({ type: "ADD_ONE", payload: newWord });
  };

  const changeWordLearnedState = async (id: string, learned: boolean) => {
    workerRef.current?.postMessage({
      type: "CHANGE_WORD_LEARNED_STATE",
      payload: { id, learned },
    });
  };

  return {
    displayedItems,
    allItems,
    search,
    isSearching,
    addWord,
    changeWordLearnedState,
    error,
  };
}
