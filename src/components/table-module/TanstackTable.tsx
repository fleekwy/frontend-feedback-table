import { useMemo, useState, useRef, useLayoutEffect } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';
import { type Feedback } from '@interfaces';
import { StarIcon } from '@components/icons/StarIcon';
import { useStore } from '@store';
import type { VirtualItem } from '@tanstack/react-virtual';
import { formatClockString, getHighlightedText } from '@utils';
import { useAddressBar } from '@hooks';

const getScrollParent = (node: HTMLElement | null): HTMLElement | null => {
    if (!node) {
        return null;
    }

    if (node.scrollHeight > node.clientHeight && node.clientHeight > 0) {
        const style = getComputedStyle(node);
        if (
            style.overflowY === 'auto' ||
            style.overflowY === 'scroll' ||
            style.overflow === 'auto' ||
            style.overflow === 'scroll'
        ) {
            return node;
        }
    }
    return getScrollParent(node.parentElement);
};

const FeedbackTextCell = ({ text }: { text: string }) => {
    const { get } = useStore.Settings();
    const { urlParams } = useAddressBar(get().zustand);
    const { searchTerm, caseSensitive, wholeWord } = urlParams;

    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [contentHeight, setContentHeight] = useState<number>(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    const MAX_COLLAPSED_HEIGHT_EM = 4.5;

    useLayoutEffect(() => {
        if (textRef.current && text) {
            const scrollH = textRef.current.scrollHeight;
            setContentHeight(scrollH);

            const style = window.getComputedStyle(textRef.current);
            const fontSize = parseFloat(style.fontSize);
            const maxAllowedHeightPx = fontSize * 1.5 * 3;

            setIsOverflowing(scrollH > maxAllowedHeightPx + 1);
        }
    }, [text, searchTerm]);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (isExpanded) {
            const container = containerRef.current;
            const scrollParent = getScrollParent(container);

            if (container && scrollParent) {
                const rect = container.getBoundingClientRect();
                const parentRect = scrollParent.getBoundingClientRect();

                const stickyHeaderHeight = 48;
                const buffer = 20;

                const relativeTop = rect.top - parentRect.top;

                if (relativeTop < stickyHeaderHeight) {
                    const targetScroll =
                        scrollParent.scrollTop + relativeTop - stickyHeaderHeight - buffer;

                    scrollParent.scrollTo({
                        top: targetScroll,
                        behavior: 'smooth',
                    });
                }
            }
        }

        setIsExpanded(!isExpanded);
    };

    if (!text) {
        return <span className="text-slate-400 text-base font-medium">—</span>;
    }

    return (
        <div ref={containerRef} className="flex flex-col items-start relative">
            <div
                ref={textRef}
                className={`text-slate-600 text-base font-medium wrap-break-word whitespace-pre-wrap overflow-hidden transition-all duration-800 ease-in-out`}
                style={{
                    maxHeight: isExpanded ? `${contentHeight}px` : `${MAX_COLLAPSED_HEIGHT_EM}em`,
                    lineHeight: '1.5em',
                }}
            >
                {getHighlightedText(text, searchTerm, caseSensitive, wholeWord)}
            </div>

            {isOverflowing && (
                <button
                    onClick={handleToggle}
                    className="mt-1 text-slate-400 text-sm font-medium hover:text-slate-600 cursor-pointer focus:outline-none transition-colors select-none"
                >
                    {isExpanded ? 'Скрыть' : 'Подробнее...'}
                </button>
            )}
        </div>
    );
};

export function TanstackTable({
    items,
    virtualRows,
    paddingTop = 0,
    paddingBottom = 0,
    measureElement,
}: {
    items: Feedback[];
    virtualRows?: VirtualItem[];
    paddingTop?: number;
    paddingBottom?: number;
    measureElement?: (el: HTMLElement | null) => void;
}) {
    console.log('TanstackTable');

    const columns = useMemo(() => {
        const columnHelper = createColumnHelper<Feedback>();

        return [
            columnHelper.accessor('id', {
                header: 'ID',
                cell: (props) => `#${props.getValue() ?? 'N/A'}`,
            }),
            columnHelper.accessor('rating', {
                header: 'Рейтинг',
                cell: (props) => {
                    const rating = props.getValue();
                    const colorClass =
                        rating === 5
                            ? 'text-green-500'
                            : rating === 1
                              ? 'text-red-500'
                              : 'text-yellow-500';
                    return (
                        <span className={`flex items-center justify-center ${colorClass}`}>
                            <StarIcon className="w-5 h-5" />
                            <span className="text-sm text-slate-500 font-medium ml-2">
                                {rating ?? 'N/A'}
                            </span>
                        </span>
                    );
                },
            }),
            columnHelper.accessor('date_time', {
                header: 'Дата',
                cell: (props) => formatClockString(props.getValue() ? new Date(props.getValue()) : null),
            }),
            columnHelper.accessor('feedback_text', {
                header: 'Текст отзыва',
                cell: (props) => <FeedbackTextCell text={props.getValue() ?? ''} />,
            }),
        ];
    }, []);

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data: items,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const { rows } = table.getRowModel();

    const rowsToRender = virtualRows
        ? virtualRows.filter((v) => v.index >= 0 && v.index < rows.length).map((v) => rows[v.index])
        : rows;

    return (
        <div className="flex flex-col overflow-x-auto min-h-0 border-2 border-slate-200 rounded-lg bg-white">
            <table className="w-full divide-y divide-slate-100 relative table-fixed min-w-[600px]">
            <thead className="bg-blue-100 table-fixed sticky top-0 z-10 shadow-sm h-12">
                {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <th
                                key={header.id}
                                className={`text-center text-sm font-medium text-slate-500 uppercase ${
                                    header.id === 'feedback_text'
                                        ? 'w-[60%]'
                                        : header.id === 'date_time'
                                          ? 'w-[20%]'
                                          : 'w-[10%]'
                                }`}
                            >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
                {paddingTop && paddingTop > 0 ? (
                    <tr>
                        <td style={{ height: `${paddingTop}px` }} colSpan={4} />
                    </tr>
                ) : null}
                {rowsToRender.map((row) => (
                    <tr
                        key={row.id}
                        ref={measureElement ?? undefined}
                        data-index={row.index}
                        className="hover:bg-slate-100 align-middle"
                    >
                        {row.getAllCells().map((cell) => (
                            <td
                                key={cell.id}
                                className={`p-3 text-slate-500 ${cell.column.id === 'feedback_text' ? 'text-base text-slate-600 font-medium text-left' : 'text-center text-sm'}`}
                            >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
                {paddingBottom && paddingBottom > 0 ? (
                    <tr>
                        <td style={{ height: `${paddingBottom}px` }} colSpan={4} />
                    </tr>
                ) : null}
            </tbody>
        </table>
        </div>
    );
}
