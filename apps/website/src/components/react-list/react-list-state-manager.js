const PREFIX = "react-list-state";

function buildStorageKey({ endpoint, version }) {
  return `${PREFIX}:${endpoint}:v${version}`;
}

export const noopReactListStateManager = {
  get: () => null,
  set: () => {},
  init: () => {},
};

export function createReactListStateManager(storage = null) {
  const store = storage ?? (typeof window !== "undefined" ? window.localStorage : null);

  return {
    get(params) {
      if (!store) return null;
      try {
        const raw = store.getItem(buildStorageKey(params));
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    },
    set(params) {
      if (!store) return;
      try {
        store.setItem(
          buildStorageKey(params),
          JSON.stringify({
            page: params.page,
            perPage: params.perPage,
            sortBy: params.sortBy,
            sortOrder: params.sortOrder,
            search: params.search,
            filters: params.filters ?? {},
            attrSettings: params.attrSettings ?? {},
          })
        );
      } catch (error) {
        console.warn("[ReactList] Failed to persist list state", error);
      }
    },
    init(params) {
      this.set(params);
    },
  };
}
