import FlexSearch from "flexsearch";
import { DictionaryItem } from "@/types/vocabulary";
import { db } from "./db";
import { logger } from "../utils/logger";
const API_BASE = import.meta.env.VITE_API_URL;

self.postMessage({ type: "WORKER_READY" });
//TODO: Optimize local search. Currently "bearing" is upper on the list then "bear" when searching for "bear". Trie maybe?
const index = new FlexSearch.Document<DictionaryItem & { [key: string]: any }>({
  document: {
    id: "id",
    index: ["word"],
    store: true,
  },
  tokenize: "forward",
  encoder: {
    dedupe: false, //Stops "beee" from becoming "be"
  },
});

function updateFlexiSearchDocument<K extends keyof DictionaryItem>(
  id: string,
  key: K,
  value: DictionaryItem[K],
) {
  const doc = index.get(id);
  if (!doc) return;
  index.update(doc.id, { ...doc, [key]: value });
}

let currentSearchController: AbortController | null = null;

function postErrorMessage(subtype: string, error: any, args: any = null) {
  self.postMessage({
    type: "WORKER_FAIL",
    subtype: subtype,
    message: error instanceof Error ? error.message : "Unknown error",
    args,
  });
}

async function fetchWordsFromApi(
  url: string,
  controller: AbortController,
  options = {},
) {
  let timedOut: boolean = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 5000);

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        //...options.headers,
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`HTTP ${res.status}: ${body}`);
    }

    return res.json();
  } catch (err: any) {
    if (err.name === "AbortError" && timedOut) {
      const timeoutError = new Error("Fetch timeout");
      timeoutError.name = "TimeoutError";
      throw timeoutError;
    }

    if (err instanceof TypeError) {
      throw new Error("NETWORK_ERROR");
    }

    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
self.onmessage = async (e: MessageEvent) => {
  const { type, payload, requestId } = e.data;
  const { postMessage } = self;
  if (type === "INIT_INDEX") {
    // payload is the full list of words
    payload.forEach((item: DictionaryItem) => index.add(item));
    postMessage({ type: "INIT_INDEX_FINISHED" });
  }

  if (type === "SEARCH") {
    if (currentSearchController) {
      currentSearchController.abort();
    }

    currentSearchController = new AbortController();
    const { signal } = currentSearchController;

    const searchResult = index.search(payload, {
      limit: 50,
      enrich: true,
      // suggest: true,
    });
    logger.debug("results:", searchResult);

    const flatResults = searchResult.flatMap((field) =>
      field.result.map((r: any) => r.doc),
    );

    // Move exact result to the top of the list, because FlexSearch is not capable to do it
    const exactResult = flatResults.filter(
      (dictionaryitem: DictionaryItem) => dictionaryitem.word === payload,
    );

    const otherResults = flatResults.filter(
      (dictionaryitem: DictionaryItem) => dictionaryitem.word !== payload,
    );

    const results = [...exactResult, ...otherResults];

    logger.debug("Local result:", results);
    postMessage({
      type: "SEARCH_RESULTS",
      payload: results,
      requestId,
      completed: false,
    });
    if (flatResults.length < 50) {
      try {
        const foundWords = fetchWordsFromApi(
          `${API_BASE}${payload}`,
          currentSearchController,
        );

        const newWord: DictionaryItem[] = await foundWords;

        logger.debug("fetch OK");
        results.push(...newWord);

        logger.debug("Local+online result:", results);
      } catch (err: any) {
        if (err.name === "AbortError") {
          logger.debug(`Search for "${payload}" cancelled.`);
          return;
        }

        postErrorMessage("SEARCH_API_FAILED", err, requestId);
      } finally {
        // Cleanup: If this was the current controller, clear it
        if (currentSearchController?.signal === signal) {
          currentSearchController = null;
        }
      }
      if (!signal.aborted) {
        postMessage({
          type: "SEARCH_RESULTS",
          payload: results,
          requestId,
          completed: true,
        });
      }
    } else {
      postMessage({
        type: "SEARCH_RESULTS",
        payload: results,
        requestId,
        completed: true,
      });
    }
  }

  if (type === "ADD_ONE") {
    try {
      const searchResult = index.search(payload.id);

      if (searchResult.length === 1) {
        postMessage({ type: "ADD_ONE_FINISHED", payload: null });
        return;
      }

      if (searchResult.length >= 1) {
        throw new Error(
          `ADD_ONE_FAILED: Invariant violation: index contains ${searchResult.length} entries for id ${payload.id}`,
        );
      }

      await db.words.put({ ...payload });
      index.add(payload);

      postMessage({ type: "ADD_ONE_FINISHED", payload: payload });
    } catch (err) {
      postErrorMessage("ADD_ONE_FAILED", err, payload.id);
      // Optional: still rethrow so it shows up in devtools
      throw err;
    }
  }

  if (type === "CHANGE_WORD_LEARNED_STATE") {
    logger.debug("CHANGE_WORD_LEARNED_STATE:", payload);
    try {
      await db.words.update(payload.id, { learned: payload.learned });
      updateFlexiSearchDocument(payload.id, "learned", payload.learned);

      postMessage({
        type: "CHANGE_WORD_LEARNED_STATE_FINISHED",
        payload: payload,
      });
    } catch (err) {
      postErrorMessage("CHANGE_WORD_LEARNED_STATE_FAILED", err, payload.id);
      // Still rethrow so it shows up in devtools
      throw err;
    }
  }
};
