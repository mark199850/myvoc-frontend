import React from "react";
import { Virtuoso } from "react-virtuoso";
import { DictionaryItem } from "@/types/vocabulary";
import { logger } from "@/utils/logger";
import "../style/animations.css";

interface WordListProps {
  items: DictionaryItem[];
  query: string; // Needed for the "Empty" message
  onWordClick: (id: string) => void;
  onAddWordButtonClick: (
    dictionaryItem: DictionaryItem,
    learned: boolean,
  ) => void;
  onChangeLearnedStateButtonClick: (
    dictionaryItemId: string,
    learned: boolean,
  ) => void;
}

export const WordList = React.memo(
  ({
    items,
    onWordClick,
    onAddWordButtonClick,
    onChangeLearnedStateButtonClick,
  }: WordListProps) => {
    logger.debug("default list rendered");
    return (
      <Virtuoso
        className="scroll-area ml-4"
        style={{ height: "100%", scrollbarGutter: "stable" }}
        data={items}
        increaseViewportBy={300}
        computeItemKey={(_, item) => item.id}
        itemContent={(_, item) => (
          <div className="py-2">
            <div className="card flex-row overflow-hidden bg-base-100 shadow-sm border border-base-200 compact hover:bg-base-200 transition-colors">
              {item.learned === undefined ? (
                <span className={`w-15 shrink-0`}>
                  <button
                    className="bg-emerald-600 h-1/2 w-full hover:bg cursor-pointer font-bold"
                    onClick={() => {
                      onAddWordButtonClick(item, true);
                    }}
                  >
                    Learned
                  </button>
                  <button
                    className="bg-error h-1/2 w-full hover:bg-error cursor-pointer font-bold"
                    onClick={() => {
                      onAddWordButtonClick(item, false);
                    }}
                  >
                    New
                  </button>
                </span>
              ) : item.learned === true ? (
                <button
                  className={
                    "w-3 bg-emerald-600 text-transparent hover:w-20 hover:bg-error hover:text-white hover:border-r-12 hover:border-emerald-600 animate-cubic-bouncy-sm shrink-0 cursor-pointer font-bold"
                  }
                  onClick={() => {
                    onChangeLearnedStateButtonClick(item.id, false);
                  }}
                >
                  Mark as New
                </button>
              ) : (
                item.learned === false && (
                  <button
                    className={
                      "w-3 bg-error text-transparent hover:w-20 hover:bg-emerald-600 hover:text-white hover:border-r-12 hover:border-r-error animate-cubic-bouncy-sm shrink-0 cursor-pointer font-bold"
                    }
                    onClick={() =>
                      onChangeLearnedStateButtonClick(item.id, true)
                    }
                  >
                    Mark as Learned
                  </button>
                )
              )}
              <div
                className="card-body p-4 active:scale-98 animate-cubic-bouncy-lg"
                onClick={() => onWordClick(item.id)}
              >
                <div className="flex justify-between items-center">
                  <h2 className="card-title text-xl">
                    {item.word}
                    {/* <span className="text-sm font-normal opacity-70 font-mono"> */}
                    {/*   {item.phonetic} */}
                    {/* </span> */}
                  </h2>
                  <div className="badge badge-outline">{item.partOfSpeech}</div>
                </div>

                {/* {item.examples.length > 0 && ( */}
                {/*     <div className="mt-3 bg-base-200 p-2 rounded-lg text-sm"> */}
                {/*         <p className="italic">"{item.examples[0].original}"</p> */}
                {/*     </div> */}
                {/* )} */}
              </div>
            </div>
          </div>
        )}
      />
    );
  },
);
