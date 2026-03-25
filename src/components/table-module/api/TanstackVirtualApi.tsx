import { useEffect, useMemo, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getFeedbacks } from '@api';
import { useVirtualizer } from '@tanstack/react-virtual';
import { TanstackTable, NativeTable } from '@components';
import { useAddressBar } from '@hooks';
import { useStore } from '@store';
import type { VirtualItem } from '@tanstack/react-virtual';

export function TanstackVirtualApi() {
    console.log('TanstackVirtualApi');

    const { get } = useStore.Settings();
    const { urlParams } = useAddressBar();
    const { searchTerm, caseSensitive, wholeWord, sortBy, pageSize } = urlParams;

    const tableContainerRef = useRef<HTMLDivElement>(null);

    const getFeedbacksQuery = useInfiniteQuery({
        queryKey: ['feedbacks', searchTerm, caseSensitive, wholeWord, sortBy, pageSize],
        queryFn: async ({ pageParam = 1, signal }) => {
            const params = {
                skip: (pageParam - 1) * pageSize,
                take: pageSize,
                search: searchTerm,
                sortBy: sortBy,
                caseSensitive: caseSensitive,
                wholeWord: wholeWord,
            };
            return await getFeedbacks(params, signal);
        },
        getNextPageParam: (lastPage, allPages) => {
            const itemsCount = lastPage?.items?.length ?? 0;
            return itemsCount < pageSize ? undefined : allPages.length + 1;
        },
        initialPageParam: 1,
    });

    const { data, hasNextPage, isFetchingNextPage, fetchNextPage, error, isError, isLoading } =
        getFeedbacksQuery;

    const allItems = useMemo(() => {
        return data?.pages.flatMap((page) => page.items ?? []) ?? [];
    }, [data]);

    const isEmptyData = !isLoading && !isError && allItems.length === 0;

    const virtualizer = useVirtualizer({
        count: allItems.length,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: () => 100,
        overscan: 10,
    });

    const virtualItems = virtualizer.getVirtualItems() as VirtualItem[];

    useEffect(() => {
        const lastItem = virtualItems[virtualItems.length - 1];
        if (
            lastItem &&
            lastItem.index >= allItems.length - 1 &&
            hasNextPage &&
            !isFetchingNextPage
        ) {
            fetchNextPage();
        }
    }, [virtualItems, allItems.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
    const paddingBottom =
        virtualItems.length > 0
            ? (virtualizer.getTotalSize() ?? 0) - virtualItems[virtualItems.length - 1].end
            : 0;

    if (isLoading && allItems.length === 0) {
        return (
            <div className="flex justify-center text-xl text-slate-500 font-medium mt-20">
                Загрузка...
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex justify-center text-xl text-red-500 font-medium mt-20">
                {error instanceof Error ? error.message : 'Неизвестная ошибка'}
            </div>
        );
    }

    if (isEmptyData) {
        return (
            <div className="flex justify-center text-xl text-slate-500 font-medium mt-20">
                Нет данных для отображения...
            </div>
        );
    }

    return (
        <div
            ref={tableContainerRef}
            className="flex flex-col overflow-y-auto overflow-x-auto min-h-0 border-2 border-slate-200 rounded-lg bg-white w-full"
        >
            {get().tanstackTable ? (
                <TanstackTable
                    items={allItems}
                    virtualRows={virtualItems}
                    paddingTop={paddingTop}
                    paddingBottom={paddingBottom}
                    measureElement={virtualizer.measureElement}
                    noWrapper={true}
                />
            ) : (
                <NativeTable
                    items={allItems}
                    virtualRows={virtualItems}
                    paddingTop={paddingTop}
                    paddingBottom={paddingBottom}
                    measureElement={virtualizer.measureElement}
                    noWrapper={true}
                />
            )}

            <div className="min-h-10 flex justify-center items-center w-full my-2">
                {isFetchingNextPage && (
                    <span className="text-slate-500 text-sm animate-pulse font-medium">
                        Подгрузка данных...
                    </span>
                )}

                {!hasNextPage && allItems.length > 0 && (
                    <span className="text-slate-400 text-sm font-medium">Все записи загружены</span>
                )}
            </div>
        </div>
    );
}
