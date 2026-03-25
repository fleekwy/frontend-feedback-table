import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FeedbackSort } from '@constants';
import type { FeedbackSort as FeedbackSortType } from '@interfaces';

export const useAddressBar = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const urlParams = useMemo(
        () => ({
            page: Math.max(1, Number(searchParams.get('page')) || 1),
            pageSize: Math.min(100, Math.max(5, Number(searchParams.get('pageSize')) || 10)),
            searchTerm: searchParams.get('searchTerm') || '',
            caseSensitive: searchParams.get('caseSensitive') === 'true',
            wholeWord: searchParams.get('wholeWord') === 'true',
            sortBy:
                Object.values(FeedbackSort).includes(searchParams.get('sortBy') as FeedbackSortType) &&
                searchParams.get('sortBy')
                    ? (searchParams.get('sortBy') as FeedbackSortType)
                    : FeedbackSort.NEWEST,
        }),
        [searchParams]
    );

    const updateUrl = (newParams: Record<string, unknown>) => {
        const nextParams = new URLSearchParams(searchParams);

        Object.entries(newParams).forEach(([key, value]) => {
            if (value === undefined || value === '' || value === false || value === 1) {
                nextParams.delete(key);
            } else {
                nextParams.set(key, String(value));
            }
        });
        setSearchParams(nextParams, { replace: false });
    };

    return { urlParams, updateUrl };
};
