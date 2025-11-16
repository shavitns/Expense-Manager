import Header from "../components/Header";
import Summary from "../components/Summary";
import ChartSection from "../components/ChartSection";


export default function Dashboard() {
    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <Summary />
            <ChartSection />


            <button
                className="bg-gray-200 px-4 py-2 rounded"
                onClick={() => window.location.href = "/categories"}
            >
                Manage Categories
            </button>

            <div className="text-center text-gray-500 mt-10">
                (Charts and Transactions List coming next...)
            </div>
        </div>
    );
}
