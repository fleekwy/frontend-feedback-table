import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { Header, Sidebar, Table } from '@components';
import { useDynamicFavicon } from '@hooks';

function App() {
    console.log('App');
    useDynamicFavicon('/icons/favicon-active.ico', '/icons/favicon-inactive.ico');
    return (
        <>
            <Tooltip id="global-tooltip" />
            <div className="h-screen w-full bg-white flex flex-col">
                <Header />
                <div className="flex flex-1 overflow-hidden pb-6">
                    <Sidebar />
                    <main className="flex flex-col flex-1 items-center px-4 sm:px-6 pt-4 sm:pt-8 min-w-0">
                        <div className="flex flex-col items-center h-full w-full sm:w-[80%] overflow-hidden">
                            <Table />
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}

export default App;
