export default function Summary() {
    return (
        <div className="grid grid-cols-3 gap-4 mt-6 mb-6 px-6">
            <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-gray-500">Total Expenses</p>
                <h2 className="text-xl font-bold text-red-600">$1,235</h2>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-gray-500">Total Income</p>
                <h2 className="text-xl font-bold text-green-600">$3,500</h2>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-gray-500">Net Balance</p>
                <h2 className="text-xl font-bold text-blue-600">$2,265</h2>
            </div>
        </div>
    );
}
