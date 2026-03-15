import { useEffect, useState } from 'react';
import { SegmentToggle } from '@components';
import { Settings, X, Menu, Plus, Minus, RefreshCw } from 'lucide-react';
import { useStore, useZustandStore } from '@store';
import { useAddressBar } from '@hooks';

export function Sidebar() {
    console.log('Sidebar');

    const { get: getSettings, update: updateSettings } = useStore.Settings();
    const { urlParams, updateUrl } = useAddressBar(getSettings().zustand);

    const [localPageSize, setLocalPageSize] = useState<string>(urlParams.pageSize.toString());

    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        if (isRefreshing || !getSettings().zustand) return;

        setIsRefreshing(true);

        useZustandStore.getState().loadAll();

        setTimeout(() => {
            setIsRefreshing(false);
        }, 2000);
    };

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
                flex flex-col items-center h-[90%] mt-8 ml-4 overflow-hidden
                transition-all duration-500 ease-in-out relative
                ${isOpen ? 'w-90 bg-slate-50 border-2 border-slate-200 rounded-2xl' : 'w-20 bg-white'}
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
                    <Menu size={40} className="text-slate-500" />
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
                        <span className="text-sm font-medium text-slate-500">1. Режим таблицы</span>
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
                            2. Режим просмотра
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

                        <div
                            className={`mt-2 transition ${!getSettings().dynamicMode ? 'opacity-40 pointer-events-none' : ''}`}
                        >
                            <span className="text-sm font-medium text-slate-500 mt-0 pl-4">
                                Режим виртуализации
                            </span>
                            <div className="flex items-center justify-center gap-5 mt-1">
                                <SegmentToggle
                                    leftLabel="Native"
                                    rightLabel="TanStack"
                                    enabled={getSettings().tanstackVirtual}
                                    onChange={() =>
                                        updateSettings((prev) => ({
                                            ...prev,
                                            tanstackVirtual: !prev.tanstackVirtual,
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        <span className="text-sm font-medium text-slate-500 mt-8">
                            3. Режим подгрузки
                        </span>
                        <div className="flex flex-col items-center gap-2 mb-2">
                            <SegmentToggle
                                leftLabel="База данных"
                                rightLabel="Zustand"
                                enabled={getSettings().zustand}
                                onChange={() =>
                                    updateSettings((prev) => ({
                                        ...prev,
                                        zustand: !prev.zustand,
                                    }))
                                }
                            />

                            <button
                                onClick={handleRefresh}
                                disabled={!getSettings().zustand || isRefreshing}
                                className={`
                                    flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all
                                    ${
                                        !getSettings().zustand
                                            ? 'text-slate-300 cursor-not-allowed'
                                            : isRefreshing
                                              ? 'text-blue-400 cursor-wait'
                                              : 'text-blue-600 hover:bg-blue-100 cursor-pointer active:scale-95'
                                    }
                                `}
                            >
                                <RefreshCw
                                    size={18}
                                    className={`transition-transform ${isRefreshing ? 'animate-spin' : ''}`}
                                />
                                <span className="text-sm font-medium">Обновить данные</span>
                            </button>
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
                                            (e.target as HTMLInputElement).blur();
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
