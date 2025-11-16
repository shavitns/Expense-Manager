import React, { useEffect, useState, useRef } from "react";
import LocalDataProvider from "../data/LocalDataProvider";

export default function ManageCategories() {
    const [categories, setCategories] = useState([]);
    const providerRef = useRef(null);

    // יצירת provider אחד בלבד
    if (!providerRef.current) {
        providerRef.current = new LocalDataProvider();
    }

    async function load() {
        const cats = await providerRef.current.getAllCategories();
        setCategories(cats);
    }

    useEffect(() => {
        load();
    }, []);

    // הוספת קטגוריה חדשה
    async function handleAddCategory() {
        const name = prompt("Enter new category name:");
        if (!name) return;

        await providerRef.current.addCustomCategory(name);
        await load();
    }

    // הוספת תת קטגוריה
    async function handleAddSub(mainName) {
        const name = prompt("Enter new subcategory:");
        if (!name) return;

        await providerRef.current.addSubcategory(mainName, name);
        await load();
    }

    // מחיקת קטגוריה
    async function handleDeleteCategory(mainName) {
        if (!window.confirm(`Delete category "${mainName}"?`)) return;
        await providerRef.current.deleteCategory(mainName);
        await load();
    }

    // מחיקת תת קטגוריה
    async function handleDeleteSub(mainName, subName) {
        await providerRef.current.deleteSubcategory(mainName, subName);
        await load();
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold mb-6">Manage Categories</h1>

            <button
                className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
                onClick={handleAddCategory}
            >
                + Add Category
            </button>

            <div className="space-y-6">
                {categories.map((cat, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">{cat.name}</h2>

                            <button
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={() => handleDeleteCategory(cat.name)}
                            >
                                Delete
                            </button>
                        </div>

                        <ul className="mt-3 ml-4 list-disc text-gray-700">
                            {cat.subcategories.map((sub, i) => (
                                <li key={i} className="flex justify-between items-center pr-4">
                                    {sub}

                                    <button
                                        className="text-red-500 hover:text-red-700 text-sm ml-2"
                                        onClick={() => handleDeleteSub(cat.name, sub)}
                                    >
                                        delete
                                    </button>
                                </li>
                            ))}
                        </ul>

                        <button
                            className="mt-3 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                            onClick={() => handleAddSub(cat.name)}
                        >
                            + Add Subcategory
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
