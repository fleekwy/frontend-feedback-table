import { useEffect, useState } from 'react';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useStore } from '@store';
import { useAddressBar } from '@hooks';

export function PageSwitcher({ countPages }: { countPages: number }) {
    console.log('PageSwitcher');

    const { get: getSettings } = useStore.Settings();
    const { urlParams, updateUrl } = useAddressBar(getSettings().zustand);
    const [localPage, setLocalPage] = useState<string>(urlParams.page.toString());

    const safeCountPages = Math.max(1, Math.floor(countPages) || 1);

    useEffect(() => {
        setLocalPage(urlParams.page.toString());
    }, [urlParams.page]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalPage(e.target.value);
    };

    const commitPageChange = () => {
        const numVal = parseInt(localPage, 10);

        if (isNaN(numVal) || numVal < 1) {
            setLocalPage(urlParams.page.toString());
            return;
        }

        const targetPage = Math.min(numVal, safeCountPages);
        updateUrl({ page: targetPage });
    };

    function handlePrevPage() {
        updateUrl({ page: Math.max(1, urlParams.page - 1) });
    }

    function handleNextPage() {
        updateUrl({ page: Math.min(safeCountPages, urlParams.page + 1) });
    }

    return (
        <div className="flex items-center justify-center gap-3 bg-none h-1/2 w-full rounded-lg">
            <button
                onClick={handlePrevPage}
                disabled={urlParams.page === 1 || safeCountPages <= 1}
                className="flex items-center justify-center text-blue-500 text-2xl bg-none w-8 h-8 rounded-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition hover:bg-slate-200"
            >
                <ChevronsLeft size={25} strokeWidth={2.5} />
            </button>
            <input
                type="number"
                min={1}
                max={safeCountPages}
                inputMode="numeric"
                value={localPage}
                onChange={handleInputChange}
                onBlur={commitPageChange}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        (e.target as HTMLInputElement).blur();
                    }
                }}
                className="w-14 h-7 text-center text-slate-700 bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 no-spinner"
            />
            <button
                className="flex items-center justify-center text-blue-500 text-3xl bg-none w-8 h-8 rounded-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition hover:bg-slate-200"
                onClick={handleNextPage}
                disabled={urlParams.page === safeCountPages || safeCountPages <= 1}
            >
                <ChevronsRight size={25} strokeWidth={2.5} />
            </button>
        </div>
    );
}
