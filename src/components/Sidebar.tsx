import { useEffect, useState } from 'react';
import { SegmentToggle } from '@components';
import { Settings, X, Menu, Plus, Minus } from 'lucide-react';
import { useStore } from '@store';
import { useAddressBar } from '@hooks';

export function Sidebar() {
    console.log('Sidebar');

    const { get: getSettings, update: updateSettings } = useStore.Settings();
    const { urlParams, updateUrl } = useAddressBar();

    const [localPageSize, setLocalPageSize] = useState<string>(urlParams.pageSize.toString());

    useEffect(() => {
        setLocalPageSize(urlParams.pageSize.toString());
    }, [urlParams.pageSize]);

    const [isOpen, setIsOpen] = useState(false);

    function handleDecreasePageSize() {
        const newSize = Math.max(5, urlParams.pageSize - 5);
        updateUrl({ pageSize: newSize, page: 1 });
    }

    function handleIncreasePageSize() {
        const newSize = Math.min(100, urlParams.pageSize + 5);
        updateUrl({ pageSize: newSize, page: 1 });
    }

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalPageSize(e.target.value);
    };

    const handlePageSizeBlur = () => {
        let numVal = parseInt(localPageSize, 10);
        if (isNaN(numVal) || numVal < 5) {
            setLocalPageSize(urlParams.pageSize.toString());
            return;
        }
        if (numVal > 100) {
            numVal = 100;
        }
        numVal = Math.min(numVal, 100);
        updateUrl({ pageSize: numVal, page: 1 });
    };

    return (
        <aside
            className={`
                flex flex-col items-center h-[90%] mt-4 sm:mt-8 ml-2 sm:ml-4 overflow-hidden
                transition-all duration-500 ease-in-out relative
                ${isOpen ? 'w-72 sm:w-90 bg-slate-50 border-2 border-slate-200 rounded-2xl' : 'w-16 sm:w-20 bg-white'}
            `}
        >
            <div
                className={`
                    absolute top-4 left-0 w-full flex justify-center
                    transition-opacity duration-400 z-10
                    ${!isOpen ? 'opacity-100 delay-300' : 'opacity-0 pointer-events-none'}
                `}
            >
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 rounded-2xl bg-none text-xl cursor-pointer transition hover:-translate-y-0.5"
                    data-tooltip-id="global-tooltip"
                    data-tooltip-content="Открыть настройки"
                    data-tooltip-hidden={isOpen}
                >
                    <Menu size={32} className="text-slate-500 sm:w-10 sm:h-10" />
                </button>
            </div>

            <div
                className={`
                    flex flex-col h-full w-full min-w-87.5 transition-opacity duration-400 overflow-y-auto overflow-x-hidden
                    ${isOpen ? 'opacity-100 delay-100' : 'opacity-0 pointer-events-none'}
                `}
            >
                <div className="flex flex-col min-h-full p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center justify-center gap-2 text-slate-500 text-xl font-bold ml-1">
                            <Settings size={25} />
                            <span>Настройки</span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            data-tooltip-id="global-tooltip"
                            data-tooltip-content="Закрыть настройки"
                            data-tooltip-hidden={!isOpen}
                            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1 rounded-xl transition-colors cursor-pointer"
                        >
                            <X size={25} />
                        </button>
                    </div>

                    <div className="flex flex-col flex-1 gap-1 mb-8">
                        <span className="text-sm font-medium text-slate-500">Режим таблицы</span>
                        <div className="flex items-center justify-center gap-5">
                            <SegmentToggle
                                leftLabel="Native"
                                rightLabel="TanStack"
                                enabled={getSettings().tanstackTable}
                                onChange={() => {
                                    updateSettings((prev) => ({
                                        ...prev,
                                        tanstackTable: !prev.tanstackTable,
                                    }));
                                }}
                            />
                        </div>

                        <span className="text-sm font-medium text-slate-500 mt-8">
                            Режим просмотра
                        </span>
                        <div className="flex items-center justify-center gap-5 mt-1">
                            <SegmentToggle
                                leftLabel="Пагинация"
                                rightLabel="Dynamic"
                                enabled={getSettings().dynamicMode}
                                onChange={() => {
                                    updateSettings((prev) => ({
                                        ...prev,
                                        dynamicMode: !prev.dynamicMode,
                                    }));
                                }}
                            />
                        </div>
                    </div>

                    {!getSettings().dynamicMode && (
                        <div
                            className="
                                flex flex-col items-center justify-center
                                w-full rounded-lg p-3 gap-2
                                border-2 border-dashed border-slate-300
                                mt-auto
                            "
                        >
                            <span className="text-sm font-medium text-slate-500">
                                Число записей на странице:
                            </span>

                            <div className="flex items-center justify-center gap-2 bg-none h-1/2 rounded-lg">
                                <button
                                    onClick={handleDecreasePageSize}
                                    disabled={urlParams.pageSize === 5}
                                    className="flex items-center justify-center text-blue-500 p-1 hover:bg-slate-200 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Minus className="w-6 h-6" strokeWidth={2.5} />
                                </button>
                                <input
                                    type="number"
                                    min={5}
                                    max={100}
                                    value={localPageSize}
                                    onChange={handlePageSizeChange}
                                    onBlur={handlePageSizeBlur}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handlePageSizeBlur();
                                            e.currentTarget.blur();
                                        }
                                    }}
                                    className="w-14 h-7 text-center text-slate-700 bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 no-spinner"
                                />
                                <button
                                    onClick={handleIncreasePageSize}
                                    disabled={urlParams.pageSize === 100}
                                    className="flex items-center justify-center text-blue-500 p-1 hover:bg-slate-200 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Plus className="w-6 h-6" strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
