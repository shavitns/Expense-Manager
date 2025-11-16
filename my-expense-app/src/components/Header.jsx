export default function Header() {
    return (
        <header className="w-full bg-white shadow-md py-4 px-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Expense Manager</h1>

            <div className="flex gap-3">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                    Import Bank File
                </button>

                <button
                    className="bg-gray-200 px-4 py-2 rounded"
                    onClick={() => window.location.href = "/categories"}
                >
                    Manage Categories
                </button>
            </div>
        </header>
    );
}
