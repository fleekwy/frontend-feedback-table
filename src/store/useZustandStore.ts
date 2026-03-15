import { create } from 'zustand';
import { type Feedback } from '@interfaces';
import { getFeedbacks } from '@api';
import { buildSearchRegex } from '@utils';

type State = {
    allItems: Feedback[];
    searchResults: Feedback[];
    isSearching: boolean;

    isLoading: boolean;
    isError: boolean;
    error?: string | null;

    pollingIntervalId: ReturnType<typeof setInterval> | null;

    loadAll: () => Promise<void>;
    startPolling: (intervalMs?: number) => void;
    stopPolling: () => void;
    clear: () => void;

    getPage: (page: number, pageSize: number) => { items: Feedback[]; totalPages: number };
    searchLocal: (query: string, caseSensitive: boolean, wholeWord: boolean) => void;
    clearSearch: () => void;
};

console.log('useAppStore');
export const useZustandStore = create<State>((set, get) => ({
    allItems: [],
    searchResults: [],
    isSearching: false,

    isLoading: false,
    isError: false,
    error: null,

    pollingIntervalId: null,

    loadAll: async () => {
        if (get().allItems.length === 0) {
            set({ isLoading: true, isError: false, error: null });
        }

        try {
            const res = await getFeedbacks({
                /*take: 'all'*/
            });
            console.log('API response:', res);
            set({
                allItems: res.items ?? [],
                isLoading: false,
                isError: false,
            });
        } catch (err: unknown) {
            set({
                isError: true,
                error: err instanceof Error ? err.message : 'Ошибка загрузки',
                isLoading: false,
            });
        }
    },

    startPolling: (intervalMs = 30000) => {
        const { pollingIntervalId, loadAll } = get();
        if (pollingIntervalId) return;

        console.log('Polling started');

        loadAll();

        const id = setInterval(() => {
            console.log('Polling tick...');
            loadAll();
        }, intervalMs);

        set({ pollingIntervalId: id });
    },

    stopPolling: () => {
        const { pollingIntervalId } = get();
        if (pollingIntervalId) {
            clearInterval(pollingIntervalId);
            set({ pollingIntervalId: null });
            console.log('Polling stopped');
        }
    },

    clear: () => {
        get().stopPolling();
        set({ allItems: [], searchResults: [], isSearching: false, isLoading: false });
    },

    getPage: (page, pageSize = 10) => {
        const { allItems, searchResults, isSearching } = get();

        const source = isSearching ? searchResults : allItems;

        const start = (page - 1) * pageSize;
        const slice = source.slice(start, start + pageSize);

        const totalPages = Math.ceil(source.length / pageSize);
        return { items: slice, totalPages };
    },

    searchLocal: (query, caseSensitive, wholeWord) => {
        if (!query.trim()) {
            get().clearSearch();
            return;
        }

        const re = buildSearchRegex(query, caseSensitive, wholeWord);
        if (!re) return;

        const filtered = get().allItems.filter((f) => {
            const text = f.feedback_text ?? '';
            return re.test(text);
        });

        set({
            searchResults: filtered,
            isSearching: true,
        });
    },

    clearSearch: () => {
        set({
            searchResults: [],
            isSearching: false,
        });
    },
}));
