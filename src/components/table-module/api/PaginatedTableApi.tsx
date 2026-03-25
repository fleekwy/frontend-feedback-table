import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getFeedbacks } from '@api';
import { type FeedbackResponse } from '@interfaces';
import { PaginatedTable } from '@components';
import { useAddressBar } from '@hooks';

export function PaginatedTableApi() {
    console.log('PaginatedTable');

    const { urlParams } = useAddressBar();

    const queryParams = useMemo(
        () => ({
            skip: (urlParams.page - 1) * urlParams.pageSize,
            take: urlParams.pageSize,
            search: urlParams.searchTerm,
            sortBy: urlParams.sortBy,
            caseSensitive: urlParams.caseSensitive,
            wholeWord: urlParams.wholeWord,
        }),
        [urlParams]
    );

    const getFeedbacksQuery = useQuery<FeedbackResponse, Error>({
        queryKey: ['feedbacks', queryParams],
        queryFn: async ({ signal }) => {
            return await getFeedbacks(queryParams, signal);
        },
        placeholderData: keepPreviousData,
    });
    const { data, error, isError, isLoading } = getFeedbacksQuery;

    const items = useMemo(() => data?.items ?? [], [data]);
    const totalPages = useMemo(() => data?.totalPages ?? 0, [data]);

    return (
        <PaginatedTable
            items={items}
            error={error?.message || ''}
            isError={isError}
            isLoading={isLoading}
            totalPages={totalPages}
        />
    );
}
