import type { IconCatalogIcon } from "./types";
import { useCatalog } from "./useCatalog";

interface CatalogPanelProps {
  /** カタログhookの戻り値 */
  catalogState: ReturnType<typeof useCatalog>;
  /** アイコンが選択された時のコールバック */
  onSelectIcon: (icon: IconCatalogIcon) => void;
}

export function CatalogPanel({ catalogState, onSelectIcon }: CatalogPanelProps) {
  const {
    sources,
    selectedSourceId,
    catalogIndex,
    loadingIndex,
    loadingIcons,
    error,
    selectedCategory,
    filteredIcons,
    searchQuery,
    selectSource,
    selectCategory,
    setSearchQuery,
  } = catalogState;

  const loading = loadingIndex || loadingIcons;

  return (
    <div>
      <label
        style={{
          fontSize: 11,
          color: "#86868b",
          display: "block",
          marginBottom: 4,
        }}
      >
        Icon Catalog
      </label>

      {/* Provider選択（複数ソースがある場合） */}
      {sources.length > 1 && (
        <select
          value={selectedSourceId ?? ""}
          onChange={(e) => selectSource(e.target.value)}
          style={{
            width: "100%",
            padding: "4px 6px",
            border: "1px solid #d2d2d7",
            borderRadius: 6,
            fontSize: 12,
            marginBottom: 6,
          }}
        >
          {sources.map((source) => (
            <option key={source.id} value={source.id}>
              {source.name}
            </option>
          ))}
        </select>
      )}

      {/* Category & Search (横並び) */}
      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
        <select
          value={selectedCategory ?? ""}
          onChange={(e) => selectCategory(e.target.value)}
          disabled={!catalogIndex || loadingIndex}
          style={{
            flex: 1,
            padding: "4px 6px",
            border: "1px solid #d2d2d7",
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          {catalogIndex?.categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.displayName} ({cat.count})
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            padding: "4px 6px",
            border: "1px solid #d2d2d7",
            borderRadius: 6,
            fontSize: 12,
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: 20,
            color: "#86868b",
            fontSize: 12,
          }}
        >
          {loadingIndex ? "Loading catalog..." : "Loading icons..."}
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            textAlign: "center",
            padding: 12,
            color: "#ff3b30",
            fontSize: 11,
            background: "#fff5f5",
            borderRadius: 6,
          }}
        >
          {error}
        </div>
      )}

      {/* Icon Grid */}
      {!loading && !error && catalogIndex && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 2,
            maxHeight: 180,
            overflowY: "auto",
            padding: 4,
            background: "#f5f5f7",
            borderRadius: 6,
            alignContent: "start",
          }}
        >
          {filteredIcons.map((icon) => (
            <button
              key={icon.name}
              type="button"
              onClick={() => onSelectIcon(icon)}
              title={icon.displayName}
              style={{
                width: 32,
                height: 32,
                padding: 2,
                border: "1px solid transparent",
                borderRadius: 4,
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "border-color 0.15s, transform 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#0071e3";
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "transparent";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <img
                src={icon.url}
                alt={icon.displayName}
                style={{ width: 22, height: 22 }}
              />
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && !error && catalogIndex && filteredIcons.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: 12,
            color: "#86868b",
            fontSize: 11,
          }}
        >
          No icons found
        </div>
      )}

      {/* No catalog loaded */}
      {!loading && !error && !catalogIndex && (
        <div
          style={{
            textAlign: "center",
            padding: 20,
            color: "#86868b",
            fontSize: 11,
            background: "#f5f5f7",
            borderRadius: 6,
          }}
        >
          No catalog loaded
        </div>
      )}
    </div>
  );
}
