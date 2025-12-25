import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { cn, type QuestionCollection, getCollectionImageUrl } from "@/lib/utils"

interface CollectionSelectorProps {
      availableCollections: QuestionCollection[]
      enabledCollections: QuestionCollection[]
      collectionCounts?: Record<string, number>
      onToggleCollection: (collection: QuestionCollection) => void
      onToggleAll: () => void
}

export function CollectionSelector({
      availableCollections,
      enabledCollections,
      collectionCounts = {},
      onToggleCollection,
      onToggleAll
}: CollectionSelectorProps) {
      const allEnabled = enabledCollections.length === 0 ||
            (availableCollections.length > 0 && enabledCollections.length === availableCollections.length && !enabledCollections.includes('__NONE__'))

      const isCollectionEnabled = (collection: QuestionCollection) => {
            return allEnabled || enabledCollections.includes(collection)
      }


      const packsEnabledCount = allEnabled
            ? availableCollections.length
            : enabledCollections.filter(c => availableCollections.includes(c)).length

      const totalQuestionsInCollections = availableCollections.reduce((acc, c) => acc + (collectionCounts[c] || 0), 0)
      const enabledQuestionsCount = availableCollections.reduce((acc, c) => {
            if (isCollectionEnabled(c)) return acc + (collectionCounts[c] || 0)
            return acc
      }, 0)

      return (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm h-full flex flex-col">
                  <CardHeader>
                        <CardTitle className="text-xl text-purple-300">Question Collections</CardTitle>
                        <p className="text-xs text-slate-400 mt-2">
                              Select which question packs to include in the game
                        </p>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1 overflow-hidden flex flex-col">
                        {/* Select All / Deselect All */}
                        <button
                              onClick={onToggleAll}
                              className={cn(
                                    "w-full px-4 py-3 rounded-lg font-semibold transition-all text-sm",
                                    "border-2 flex flex-col items-center justify-center gap-1",
                                    allEnabled
                                          ? "bg-purple-600/30 border-purple-500 text-purple-300 hover:bg-purple-600/40"
                                          : "bg-slate-700/30 border-slate-600 text-slate-400 hover:bg-slate-700/50"
                              )}
                        >
                              <span>{allEnabled ? "Deselect All" : "Select All"}</span>
                              <div className="flex gap-3 text-[10px] opacity-70 font-normal">
                                    <span>Packs: {packsEnabledCount}/{availableCollections.length}</span>
                                    <span>Questions: {enabledQuestionsCount}/{totalQuestionsInCollections}</span>
                              </div>
                        </button>

                        {/* Divider */}
                        <div className="border-t border-slate-700 my-2" />

                        {/* Individual Collections */}
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                              {availableCollections.map((collection) => {
                                    const enabled = isCollectionEnabled(collection)
                                    return (
                                          <button
                                                key={collection}
                                                onClick={() => onToggleCollection(collection)}
                                                className={cn(
                                                      "w-full px-4 py-2.5 rounded-lg font-medium transition-all text-sm",
                                                      "border flex items-center gap-3 hover:scale-[1.02]",
                                                      enabled
                                                            ? "bg-green-600/20 border-green-600/50 text-green-300"
                                                            : "bg-slate-700/20 border-slate-600/50 text-slate-500"
                                                )}
                                          >
                                                <div className={cn(
                                                      "w-8 h-8 rounded border flex items-center justify-center flex-shrink-0 bg-slate-800",
                                                      enabled
                                                            ? "border-green-500/50"
                                                            : "border-slate-700"
                                                )}>
                                                      <img
                                                            src={getCollectionImageUrl(collection)}
                                                            alt={collection}
                                                            className={cn("w-6 h-6 object-contain transition-all", !enabled && "grayscale opacity-50")}
                                                      />
                                                </div>
                                                <span className="flex-1 text-left">{collection}</span>
                                                <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                                                      {collectionCounts[collection] || 0}
                                                </span>
                                          </button>
                                    )
                              })}
                        </div>

                        {availableCollections.length === 0 && (
                              <div className="text-center text-slate-500 text-sm py-8">
                                    No collections available
                              </div>
                        )}
                  </CardContent>

                  <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
            </Card>
      )
}
