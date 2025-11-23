import Header from "../components/Header";
import Summary from "../components/Summary";
import ChartSection from "../components/ChartSection";

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <Summary />
            <ChartSection />

            <div className="flex justify-center gap-4 mt-8">
                {/* מעבר לניהול קטגוריות */}
                <button
                    className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                    onClick={() => (window.location.href = "/categories")}
                >
                    Manage Categories
                </button>

                {/* מעבר לעמוד העלאת קובץ */}
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={() => (window.location.href = "/import")}
                >
                    Upload File
                </button>
            </div>

            <div className="text-center text-gray-500 mt-10">
                (Charts and Transactions List coming next...)
            </div>
        </div>
    );
}

// export default function Dashboard() {
//     return (
//         <div className="min-h-screen bg-gray-100">
//             <Header />
//             <Summary />
//             <ChartSection />


//             <button
//                 className="bg-gray-200 px-4 py-2 rounded"
//                 onClick={() => window.location.href = "/categories"}
//             >
//                 Manage Categories
//             </button>

//             <div className="text-center text-gray-500 mt-10">
//                 (Charts and Transactions List coming next...)
//             </div>
//         </div>
//     );
// }
