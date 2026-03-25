import { useState, useEffect, useCallback } from 'react';
import type { Settings } from '@interfaces';
import { parse, stringify } from 'devalue';
import isEqual from 'fast-deep-equal';

const defaults: {
    settings: Settings;
} = {
    settings: {
        tanstackTable: true,
        dynamicMode: false,
    },
};

const keys = {
    settings: 'app-settings',
};

function useStoreHook<K extends keyof typeof keys>(
    group: K
): {
    get: () => (typeof defaults)[K];
    set: (value: (typeof defaults)[K]) => void;
    update: (updater: (prev: (typeof defaults)[K]) => (typeof defaults)[K]) => void;
} {
    const key = keys[group];
    const initialValue = defaults[group];

    const [value, setValue] = useState<(typeof defaults)[K]>(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (!item) return initialValue;

            try {
                return parse(item);
            } catch {
                console.warn(`Old storage format detected for ${key}, falling back to JSON.parse`);
                return JSON.parse(item);
            }
        } catch (error) {
            console.error(`Error reading ${group} from localStorage:`, error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            const currentRaw = window.localStorage.getItem(key);
            const currentParsed = currentRaw ? parse(currentRaw) : null;

            if (!isEqual(value, currentParsed)) {
                window.localStorage.setItem(key, stringify(value));

                window.dispatchEvent(
                    new CustomEvent(`localstorage-update-${key}`, { detail: value })
                );
            }
        } catch (error) {
            console.error(`Error writing ${group} to localStorage:`, error);
        }
    }, [key, value, group]);

    useEffect(() => {
        const handleStoreChange = (e: StorageEvent) => {
            if (e.key === key && e.newValue) {
                try {
                    const parsed = parse(e.newValue);
                    if (!isEqual(parsed, value)) {
                        setValue(parsed);
                    }
                } catch (error) {
                    console.error(`Error parsing storage event:`, error);
                }
            }
        };

        window.addEventListener('storage', handleStoreChange);
        return () => window.removeEventListener('storage', handleStoreChange);
    }, [key, value, group]);

    useEffect(() => {
        const handleCustomUpdate = (e: Event) => {
            if (e instanceof CustomEvent && !isEqual(e.detail, value)) {
                setValue(e.detail);
            }
        };

        window.addEventListener(`localstorage-update-${key}`, handleCustomUpdate);
        return () =>
            window.removeEventListener(
                `localstorage-update-${key}`,
                handleCustomUpdate
            );
    }, [key, value]);

    const get = useCallback(() => value, [value]);

    const set = useCallback((newValue: (typeof defaults)[K]) => {
        setValue(newValue);
    }, []);

    const update = useCallback((updater: (prev: (typeof defaults)[K]) => (typeof defaults)[K]) => {
        setValue(updater);
    }, []);

    return { get, set, update };
}

export const useStore = {
    Settings: () => useStoreHook('settings'),
};
