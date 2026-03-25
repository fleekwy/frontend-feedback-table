import { StarIcon } from '@components/icons/StarIcon';
import { type Feedback } from '@interfaces';
import { getHighlightedText, formatClockString } from '@utils';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useAddressBar } from '@hooks';
import type { VirtualItem } from '@tanstack/react-virtual';

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

const FeedbackTextCell = ({
    text,
    searchTerm,
    caseSensitive,
    wholeWord,
}: {
    text: string;
    searchTerm: string;
    caseSensitive: boolean;
    wholeWord: boolean;
}) => {
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

export function NativeTable({
    items,
    virtualRows,
    paddingTop,
    paddingBottom,
    measureElement,
    noWrapper = false,
}: {
    items: Feedback[];
    virtualRows?: VirtualItem[];
    paddingTop?: number;
    paddingBottom?: number;
    measureElement?: (node: HTMLElement | null) => void;
    noWrapper?: boolean;
}) {
    console.log('NativeTable');

    const { urlParams } = useAddressBar();
    const { searchTerm, caseSensitive, wholeWord } = urlParams;

    const rowsToRender = useMemo(() => {
        if (!virtualRows) {
            return items.map((item) => ({ ...item, virtualIndex: undefined }));
        }
        return virtualRows
            .filter((v) => v.index >= 0 && v.index < items.length)
            .map((v) => ({ ...items[v.index], virtualIndex: v.index }));
    }, [items, virtualRows]);

    const tableContent = (
        <table className="w-full divide-y divide-slate-100 relative table-fixed min-w-150">
            <thead className="bg-slate-100 table-fixed sticky top-0 z-10 shadow-sm h-12">
                <tr>
                    <th className="text-center text-sm font-medium text-slate-500 uppercase w-[10%]">
                        ID
                    </th>
                    <th className="text-center text-sm font-medium text-slate-500 uppercase w-[10%]">
                        Рейтинг
                    </th>
                    <th className="text-center text-sm font-medium text-slate-500 uppercase w-[20%]">
                        Дата
                    </th>
                    <th className="text-center text-sm font-medium text-slate-500 uppercase w-[60%]">
                        Текст отзыва
                    </th>
                </tr>
            </thead>
            <tbody
                className="bg-white divide-y divide-slate-200"
                style={{ contain: 'layout paint' }}
            >
                {paddingTop && paddingTop > 0 ? (
                    <tr>
                        <td style={{ height: `${paddingTop}px` }} colSpan={4} />
                    </tr>
                ) : null}

                {rowsToRender.map((itemWithIndex) => {
                    return (
                        <tr
                            key={itemWithIndex.id}
                            className="hover:bg-slate-100 align-middle"
                            ref={measureElement}
                            data-index={itemWithIndex.virtualIndex}
                        >
                            <td className="text-center p-3 text-sm text-slate-500">
                                #{itemWithIndex.id ?? 'N/A'}
                            </td>
                            <td className="p-3">
                                <span
                                    className={`flex items-center justify-center ${
                                        itemWithIndex.rating === 5
                                            ? 'text-green-500'
                                            : itemWithIndex.rating === 1
                                              ? 'text-red-500'
                                              : 'text-yellow-500'
                                    }`}
                                >
                                    <StarIcon className="w-5 h-5" />
                                    <span className="text-sm text-slate-500 font-medium ml-2">
                                        {itemWithIndex.rating ?? 'N/A'}
                                    </span>
                                </span>
                            </td>
                            <td className="text-center p-3 text-sm text-slate-500">
                                {formatClockString(
                                    itemWithIndex.date_time
                                        ? new Date(itemWithIndex.date_time)
                                        : null
                                )}
                            </td>
                            <td className="text-left p-3">
                                <FeedbackTextCell
                                    text={itemWithIndex.feedback_text ?? ''}
                                    searchTerm={searchTerm}
                                    caseSensitive={caseSensitive}
                                    wholeWord={wholeWord}
                                />
                            </td>
                        </tr>
                    );
                })}

                {paddingBottom && paddingBottom > 0 ? (
                    <tr>
                        <td style={{ height: `${paddingBottom}px` }} colSpan={4} />
                    </tr>
                ) : null}
            </tbody>
        </table>
    );

    if (noWrapper) {
        return tableContent;
    }

    return (
        <div className="flex flex-col overflow-x-auto min-h-0 border-2 border-slate-200 rounded-lg bg-white">
            {tableContent}
        </div>
    );
}
