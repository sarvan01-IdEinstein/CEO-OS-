'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Settings, Plus, X, Calendar, GripVertical, ChevronDown, ChevronUp, Trash2, Edit2, Share2 } from 'lucide-react';
import Link from 'next/link';
import { Reorder } from 'framer-motion';

// Types
interface LifeMapItem {
    id: string;
    title: string;
    startAge: number;
    endAge: number | null;
    color: 'blue' | 'red';
    hideText?: boolean;
}

interface Category {
    id: string;
    name: string;
    section: 'top' | 'bottom';
    items: LifeMapItem[];
}

interface LifeUsageSettings {
    name: string;
    dateOfBirth: Date;
    ageRange: number;
}

// Initial categories
const DEFAULT_CATEGORIES: Category[] = [
    { id: 'projects', name: 'Projects', section: 'top', items: [] },
    { id: 'relationships', name: 'Relationships', section: 'top', items: [] },
    { id: 'residences', name: 'Residences', section: 'top', items: [] },
    { id: 'career', name: 'Career', section: 'top', items: [] },
    { id: 'inflection', name: 'Inflection Points', section: 'bottom', items: [] },
    { id: 'insights', name: 'Insights', section: 'bottom', items: [] },
    { id: 'goals', name: 'Goals', section: 'bottom', items: [] },
];

// Helper functions
function calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function generateId(): string {
    return Math.random().toString(36).substring(2, 9);
}

// Settings Modal Component
function SettingsModal({
    isOpen,
    onClose,
    settings,
    onSave
}: {
    isOpen: boolean;
    onClose: () => void;
    settings: LifeUsageSettings;
    onSave: (settings: LifeUsageSettings) => void;
}) {
    const [name, setName] = useState(settings.name);
    const [dob, setDob] = useState(settings.dateOfBirth.toISOString().split('T')[0]);
    const [ageRange, setAgeRange] = useState(settings.ageRange);

    useEffect(() => {
        setName(settings.name);
        setDob(settings.dateOfBirth.toISOString().split('T')[0]);
        setAgeRange(settings.ageRange);
    }, [settings]);

    if (!isOpen) return null;

    const currentAge = calculateAge(new Date(dob));

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Life Usage Settings</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <p className="text-[var(--muted)] text-sm mb-6">
                    Configure your life usage settings. You can always edit these later.
                </p>

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium mb-2">Timeline name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Date of birth<span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
                            />
                        </div>
                        <p className="text-sm text-[var(--muted)] mt-2">
                            Current age: {currentAge} years
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Age range</label>
                        <input
                            type="number"
                            value={ageRange}
                            onChange={(e) => setAgeRange(parseInt(e.target.value) || 80)}
                            min={currentAge + 1}
                            max={120}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
                        />
                        <p className="text-sm text-[var(--muted)] mt-2">
                            Timeline shows ages 0 to {ageRange}. Your current age ({currentAge}) will be marked with a green line.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-full font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onSave({ name, dateOfBirth: new Date(dob), ageRange });
                            onClose();
                        }}
                        className="btn-primary"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

// Add/Edit Item Modal Component
function ItemModal({
    isOpen,
    onClose,
    categoryName,
    onSave,
    onDelete,
    maxAge,
    editItem
}: {
    isOpen: boolean;
    onClose: () => void;
    categoryName: string;
    onSave: (item: Omit<LifeMapItem, 'id'>) => void;
    onDelete?: () => void;
    maxAge: number;
    editItem?: LifeMapItem | null;
}) {
    const [title, setTitle] = useState(editItem?.title || '');
    const [inputMode, setInputMode] = useState<'age' | 'date'>('age');
    const [startAge, setStartAge] = useState(editItem ? Math.floor(editItem.startAge) : 0);
    const [startAgeMonths, setStartAgeMonths] = useState(editItem ? Math.round((editItem.startAge % 1) * 12) : 0);
    const [endAge, setEndAge] = useState<string>(editItem?.endAge ? Math.floor(editItem.endAge).toString() : '');
    const [endAgeMonths, setEndAgeMonths] = useState(editItem?.endAge ? Math.round((editItem.endAge % 1) * 12) : 0);
    const [useMaxAge, setUseMaxAge] = useState(false);
    const [color, setColor] = useState<'blue' | 'red'>(editItem?.color || 'blue');
    const [hideText, setHideText] = useState(editItem?.hideText || false);

    useEffect(() => {
        if (editItem) {
            setTitle(editItem.title);
            setStartAge(Math.floor(editItem.startAge));
            setStartAgeMonths(Math.round((editItem.startAge % 1) * 12));
            setEndAge(editItem.endAge ? Math.floor(editItem.endAge).toString() : '');
            setEndAgeMonths(editItem.endAge ? Math.round((editItem.endAge % 1) * 12) : 0);
            setColor(editItem.color);
            setHideText(editItem.hideText || false);
        } else {
            resetForm();
        }
    }, [editItem]);

    const resetForm = () => {
        setTitle('');
        setStartAge(0);
        setStartAgeMonths(0);
        setEndAge('');
        setEndAgeMonths(0);
        setUseMaxAge(false);
        setColor('blue');
        setHideText(false);
    };

    if (!isOpen) return null;

    const isEditing = !!editItem;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">{isEditing ? 'Edit' : 'Add'} life usage item</h2>
                    <button onClick={() => { onClose(); if (!isEditing) resetForm(); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <p className="text-[var(--muted)] text-sm mb-6">
                    {isEditing ? 'Edit this' : 'Add a new'} item {isEditing ? 'in' : 'to'} the {categoryName} category
                </p>

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Title<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter title"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Input Mode</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={inputMode === 'age'}
                                    onChange={() => setInputMode('age')}
                                    className="w-4 h-4 accent-[var(--accent)]"
                                />
                                <span>Age</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={inputMode === 'date'}
                                    onChange={() => setInputMode('date')}
                                    className="w-4 h-4 accent-[var(--accent)]"
                                />
                                <span>Date</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Start age<span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={startAge}
                                    onChange={(e) => setStartAge(parseInt(e.target.value) || 0)}
                                    min={0}
                                    max={maxAge}
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
                                />
                                <select
                                    value={startAgeMonths}
                                    onChange={(e) => setStartAgeMonths(parseInt(e.target.value))}
                                    className="px-2 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
                                >
                                    {[...Array(12)].map((_, i) => (
                                        <option key={i} value={i}>+ {i}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium">End age</label>
                                <label className="flex items-center gap-2 cursor-pointer text-sm">
                                    <input
                                        type="checkbox"
                                        checked={useMaxAge}
                                        onChange={(e) => setUseMaxAge(e.target.checked)}
                                        className="w-4 h-4 accent-[var(--accent)]"
                                    />
                                    <span>Max</span>
                                </label>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={endAge}
                                    onChange={(e) => setEndAge(e.target.value)}
                                    disabled={useMaxAge}
                                    placeholder="Optional"
                                    min={startAge}
                                    max={maxAge}
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all disabled:opacity-50"
                                />
                                <select
                                    value={endAgeMonths}
                                    onChange={(e) => setEndAgeMonths(parseInt(e.target.value))}
                                    disabled={useMaxAge}
                                    className="px-2 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all disabled:opacity-50"
                                >
                                    {[...Array(12)].map((_, i) => (
                                        <option key={i} value={i}>+ {i}</option>
                                    ))}
                                </select>
                            </div>
                            <p className="text-xs text-[var(--muted)] mt-1">
                                Leave empty for milestone/point marker
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Color</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={color === 'blue'}
                                    onChange={() => setColor('blue')}
                                    className="w-4 h-4 accent-blue-500"
                                />
                                <span className="w-5 h-5 rounded bg-blue-500"></span>
                                <span>Blue</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={color === 'red'}
                                    onChange={() => setColor('red')}
                                    className="w-4 h-4 accent-red-500"
                                />
                                <span className="w-5 h-5 rounded bg-red-500"></span>
                                <span>Red</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={hideText}
                                onChange={(e) => setHideText(e.target.checked)}
                                className="w-4 h-4 accent-[var(--accent)]"
                            />
                            <span className="text-sm">Hide Text?</span>
                            <span className="text-[var(--muted)] text-sm" title="If checked, the title won't be displayed on the timeline">ⓘ</span>
                        </label>
                    </div>
                </div>

                <div className="flex justify-between mt-8">
                    {isEditing && onDelete ? (
                        <button
                            onClick={() => {
                                onDelete();
                                onClose();
                            }}
                            className="px-5 py-2.5 rounded-full font-medium text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            Delete
                        </button>
                    ) : (
                        <div></div>
                    )}
                    <button
                        onClick={() => {
                            if (!title.trim()) return;
                            const calculatedEndAge = useMaxAge ? maxAge : (endAge ? parseInt(endAge) + endAgeMonths / 12 : null);
                            onSave({
                                title,
                                startAge: startAge + startAgeMonths / 12,
                                endAge: calculatedEndAge,
                                color,
                                hideText
                            });
                            if (!isEditing) resetForm();
                            onClose();
                        }}
                        disabled={!title.trim()}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isEditing ? 'Save Changes' : 'Create item'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Add Category Modal Component (redesigned to match reference)
function AddCategoryModal({
    isOpen,
    onClose,
    onAdd
}: {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (name: string, section: 'top' | 'bottom', color: 'blue' | 'red') => void;
}) {
    const [name, setName] = useState('');
    const [section, setSection] = useState<'top' | 'bottom'>('top');
    const [color, setColor] = useState<'blue' | 'red'>('blue');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center gap-3 mb-2">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-xl font-semibold">New Category</h2>
                </div>

                <p className="text-[var(--muted)] text-sm mb-6 ml-10">
                    Create a new category for your timeline.
                </p>

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Label<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Projects, Hobbies"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Section</label>
                        <select
                            value={section}
                            onChange={(e) => setSection(e.target.value as 'top' | 'bottom')}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all cursor-pointer appearance-none bg-no-repeat bg-[right_1rem_center]"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
                        >
                            <option value="top">Top (above age bar)</option>
                            <option value="bottom">Bottom (below age bar)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Color</label>
                        <div className="flex gap-6">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={color === 'blue'}
                                    onChange={() => setColor('blue')}
                                    className="w-4 h-4 accent-blue-500"
                                />
                                <span className="w-6 h-6 rounded bg-blue-500"></span>
                                <span>Blue</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={color === 'red'}
                                    onChange={() => setColor('red')}
                                    className="w-4 h-4 accent-red-500"
                                />
                                <span className="w-6 h-6 rounded bg-red-500"></span>
                                <span>Red</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-full font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (!name.trim()) return;
                            onAdd(name.trim(), section, color);
                            setName('');
                            setSection('top');
                            setColor('blue');
                            onClose();
                        }}
                        disabled={!name.trim()}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}


// Manage Categories Modal Component
function ManageCategoriesModal({
    isOpen,
    onClose,
    categories,
    onUpdate,
    onAddCategory
}: {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    onUpdate: (categories: Category[]) => void;
    onAddCategory: () => void;
}) {
    const [localCategories, setLocalCategories] = useState(categories);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');

    useEffect(() => {
        setLocalCategories(categories);
    }, [categories]);

    if (!isOpen) return null;

    const topCategories = localCategories.filter(c => c.section === 'top');
    const bottomCategories = localCategories.filter(c => c.section === 'bottom');

    const handleMoveToSection = (id: string, newSection: 'top' | 'bottom') => {
        setLocalCategories(prev => prev.map(c =>
            c.id === id ? { ...c, section: newSection } : c
        ));
    };

    const handleDelete = (id: string) => {
        setLocalCategories(prev => prev.filter(c => c.id !== id));
    };

    const handleSaveEdit = (id: string) => {
        if (!editingName.trim()) return;
        setLocalCategories(prev => prev.map(c =>
            c.id === id ? { ...c, name: editingName.trim() } : c
        ));
        setEditingId(null);
        setEditingName('');
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Manage Categories</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <p className="text-[var(--muted)] text-sm mb-4">
                    Organize categories for your timeline items.
                </p>

                {/* Add Category Button */}
                <button
                    onClick={() => {
                        onUpdate(localCategories);
                        onAddCategory();
                    }}
                    className="w-full mb-6 px-4 py-3 bg-[var(--fg)] text-[var(--bg-app)] rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                    <Plus size={18} />
                    Add category
                </button>

                {/* Top Section */}
                <div className="mb-4">
                    <h3 className="text-sm font-medium text-[var(--muted)] mb-3">Top Section</h3>
                    <Reorder.Group
                        axis="y"
                        values={topCategories}
                        onReorder={(newOrder) => {
                            const bottom = localCategories.filter(c => c.section === 'bottom');
                            setLocalCategories([...newOrder, ...bottom]);
                        }}
                        className="space-y-2"
                    >
                        {topCategories.map(cat => (
                            <Reorder.Item key={cat.id} value={cat}>
                                <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
                                    <GripVertical size={16} className="text-[var(--muted)] cursor-grab active:cursor-grabbing" />
                                    <div className="flex-1">
                                        {editingId === cat.id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={editingName}
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                    className="flex-1 px-2 py-1 text-sm border rounded"
                                                    autoFocus
                                                />
                                                <button onClick={() => handleSaveEdit(cat.id)} className="text-green-500 hover:text-green-600">
                                                    Check
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="font-medium text-sm">{cat.name}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }}
                                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-gray-600"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                </div>

                <div className="flex items-center gap-4 my-6">
                    <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
                    <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">AGE</span>
                    <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
                </div>

                {/* Bottom Section */}
                <div className="mb-8">
                    <h3 className="text-sm font-medium text-[var(--muted)] mb-3">Bottom Section</h3>
                    <Reorder.Group
                        axis="y"
                        values={bottomCategories}
                        onReorder={(newOrder) => {
                            const top = localCategories.filter(c => c.section === 'top');
                            setLocalCategories([...top, ...newOrder]);
                        }}
                        className="space-y-2"
                    >
                        {bottomCategories.map(cat => (
                            <Reorder.Item key={cat.id} value={cat}>
                                <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
                                    <GripVertical size={16} className="text-[var(--muted)] cursor-grab active:cursor-grabbing" />
                                    <div className="flex-1">
                                        {editingId === cat.id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={editingName}
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                    className="flex-1 px-2 py-1 text-sm border rounded"
                                                    autoFocus
                                                />
                                                <button onClick={() => handleSaveEdit(cat.id)} className="text-green-500 hover:text-green-600">
                                                    Check
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="font-medium text-sm">{cat.name}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }}
                                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-gray-600"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-full font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onUpdate(localCategories);
                            onClose();
                        }}
                        className="btn-primary"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}


// Tooltip component for hover details
function Tooltip({ children, content }: { children: React.ReactNode; content: React.ReactNode }) {
    const [show, setShow] = useState(false);
    return (
        <div
            className="relative"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {children}
            {show && (
                <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap pointer-events-none">
                    {content}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
            )}
        </div>
    );
}

// Timeline Item Component - handles both range and point/milestone items
function TimelineItem({
    item,
    getPositionPercent,
    currentAge,
    maxAge,
    isTopSection,
    onClick,
    categoryIndex = 0,
    totalCategories = 1
}: {
    item: LifeMapItem;
    getPositionPercent: (age: number) => number;
    currentAge: number;
    maxAge: number;
    isTopSection: boolean;
    onClick: () => void;
    categoryIndex?: number;
    totalCategories?: number;
}) {
    const [showTooltip, setShowTooltip] = useState(false);
    const startPos = getPositionPercent(item.startAge);
    const isPointItem = item.endAge === null;

    // Format age display
    const formatAge = (age: number) => {
        const years = Math.floor(age);
        const months = Math.round((age % 1) * 12);
        return months > 0 ? `${years}y ${months}m` : `${years}y`;
    };

    // Tooltip content
    const tooltipContent = (
        <div className="text-center">
            <div className="font-semibold">{item.title}</div>
            <div className="text-gray-300 text-[10px] mt-1">
                {isPointItem
                    ? `Age: ${formatAge(item.startAge)}`
                    : `${formatAge(item.startAge)} → ${formatAge(item.endAge!)}`
                }
            </div>
        </div>
    );

    if (isPointItem) {
        // Render as a point/milestone with label and dashed line extending to age axis
        // The line needs to extend from the label through the category row to reach the age axis
        return (
            <div
                className="absolute flex flex-col items-center cursor-pointer group"
                style={{
                    left: `${startPos}%`,
                    transform: 'translateX(-50%)',
                    zIndex: 15,
                    ...(isTopSection ? { top: 0 } : { bottom: 0 })
                }}
                onClick={onClick}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                {isTopSection ? (
                    <>
                        {/* Label above */}
                        <div className={`relative px-2 py-1 text-xs font-medium rounded border-2 whitespace-nowrap
                            ${item.color === 'blue' ? 'border-blue-400 text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-red-400 text-red-600 bg-red-50 dark:bg-red-900/20'}
                            group-hover:shadow-md group-hover:scale-105 transition-all`}
                        >
                            {item.title}
                            {/* Tooltip - positioned to the right */}
                            {showTooltip && (
                                <div className="absolute z-[200] left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap pointer-events-none">
                                    {tooltipContent}
                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                                </div>
                            )}
                        </div>
                        {/* Dashed line going down to age axis */}
                        <div className={`w-0 border-l-2 border-dashed ${item.color === 'blue' ? 'border-blue-400' : 'border-red-400'}`}
                            style={{ height: `${(totalCategories - categoryIndex - 1) * 60 + 36}px` }}
                        ></div>
                    </>
                ) : (
                    <>
                        {/* Dashed line going up to age axis */}
                        <div className={`w-0 border-l-2 border-dashed ${item.color === 'blue' ? 'border-blue-400' : 'border-red-400'}`}
                            style={{ height: `${categoryIndex * 60 + 36}px` }}
                        ></div>
                        {/* Label below */}
                        <div className={`relative px-2 py-1 text-xs font-medium rounded border-2 whitespace-nowrap
                            ${item.color === 'blue' ? 'border-blue-400 text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-red-400 text-red-600 bg-red-50 dark:bg-red-900/20'}
                            group-hover:shadow-md group-hover:scale-105 transition-all`}
                        >
                            {item.title}
                            {/* Tooltip - positioned to the right */}
                            {showTooltip && (
                                <div className="absolute z-[200] left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap pointer-events-none">
                                    {tooltipContent}
                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        );
    }

    // Render as a range bar
    const endPos = getPositionPercent(item.endAge!);
    const width = endPos - startPos;

    return (
        <div
            className={`absolute h-6 top-1/2 -translate-y-1/2 rounded flex items-center justify-center text-xs text-white font-medium cursor-pointer hover:opacity-90 hover:scale-y-110 transition-all
                ${item.color === 'blue' ? 'bg-blue-500' : 'bg-red-500'}`}
            style={{
                left: `${startPos}%`,
                width: `${Math.max(width, 1)}%`,
                minWidth: '20px',
                zIndex: 5
            }}
            onClick={onClick}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {!item.hideText && width > 3 && (
                <span className="truncate px-1">{item.title}</span>
            )}
            {/* Tooltip - positioned above the bar, escapes overflow */}
            {showTooltip && (
                <div className="absolute z-[100] bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap pointer-events-none">
                    {tooltipContent}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
            )}
        </div>
    );
}

// Main Life Usage Component
export default function LifeUsagePage() {
    const [settings, setSettings] = useState<LifeUsageSettings>({
        name: 'My Life Usage',
        dateOfBirth: new Date('1982-09-26'),
        ageRange: 80
    });

    const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
    const [showSettings, setShowSettings] = useState(false);
    const [showCategories, setShowCategories] = useState(false);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [addItemCategory, setAddItemCategory] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<{ categoryId: string; item: LifeMapItem } | null>(null);
    const [viewMode, setViewMode] = useState<'all' | 'past' | 'future'>('all');
    const [zoom, setZoom] = useState(100);

    const timelineRef = useRef<HTMLDivElement>(null);
    const currentAge = calculateAge(settings.dateOfBirth);

    // Generate age markers based on view mode
    const getAgeMarkers = () => {
        const markers = [];
        let start = 0;
        let end = settings.ageRange;

        if (viewMode === 'past') {
            end = Math.ceil(currentAge);
        } else if (viewMode === 'future') {
            start = Math.floor(currentAge);
        }

        for (let i = start; i <= end; i++) {
            markers.push(i);
        }
        return markers;
    };

    const ageMarkers = getAgeMarkers();

    // Scale includes age 80 (0 to 80 inclusive = 81 years/boxes)
    const totalYears = settings.ageRange + 1;

    // Calculate position percentage for an age based on view mode
    const getPositionPercent = (age: number) => {
        if (viewMode === 'past') {
            return (age / Math.ceil(currentAge)) * 100;
        } else if (viewMode === 'future') {
            const futureRange = totalYears - Math.floor(currentAge);
            return ((age - Math.floor(currentAge)) / futureRange) * 100;
        }
        return (age / totalYears) * 100;
    };

    // Get current age position for indicator
    const getCurrentAgePosition = () => {
        if (viewMode === 'past') {
            return 100; // At the end
        } else if (viewMode === 'future') {
            return 0; // At the start
        }
        return getPositionPercent(currentAge);
    };

    // Filter items based on view mode
    const filterItems = (items: LifeMapItem[]) => {
        if (viewMode === 'all') return items;

        return items.filter(item => {
            const itemEnd = item.endAge ?? item.startAge;
            if (viewMode === 'past') {
                return item.startAge <= currentAge;
            } else {
                return itemEnd >= currentAge || item.startAge >= currentAge;
            }
        });
    };

    // Get category by ID
    const getCategoryById = (id: string) => categories.find(c => c.id === id);

    // Add item to category
    const handleAddItem = (categoryId: string, item: Omit<LifeMapItem, 'id'>) => {
        setCategories(prev => prev.map(cat =>
            cat.id === categoryId
                ? { ...cat, items: [...cat.items, { ...item, id: generateId() }] }
                : cat
        ));
    };

    // Update item in category
    const handleUpdateItem = (categoryId: string, itemId: string, updates: Omit<LifeMapItem, 'id'>) => {
        setCategories(prev => prev.map(cat =>
            cat.id === categoryId
                ? { ...cat, items: cat.items.map(item => item.id === itemId ? { ...updates, id: itemId } : item) }
                : cat
        ));
    };

    // Delete item from category
    const handleDeleteItem = (categoryId: string, itemId: string) => {
        setCategories(prev => prev.map(cat =>
            cat.id === categoryId
                ? { ...cat, items: cat.items.filter(item => item.id !== itemId) }
                : cat
        ));
    };

    // Add new category
    const handleAddCategory = (name: string, section: 'top' | 'bottom', color: 'blue' | 'red') => {
        setCategories(prev => [...prev, {
            id: generateId(),
            name,
            section,
            items: []
        }]);
    };

    const topCategories = categories.filter(c => c.section === 'top');
    const bottomCategories = categories.filter(c => c.section === 'bottom');

    return (
        <div className="min-h-[calc(100vh-80px)] flex flex-col animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <button className="p-0 hover:bg-transparent" onClick={() => window.history.back()}>
                        <ArrowLeft size={20} className="text-gray-500" />
                    </button>
                    <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        {settings.name} <span className="text-green-500 text-sm font-normal">✓ Saved</span>
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    {/* Settings and Share buttons */}
                    <div className="flex items-center gap-2 ml-4">
                        <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300" title="Settings">
                            <Settings size={18} />
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300">
                            <Share2 size={18} />
                            Share
                        </button>
                    </div>
                </div>
            </div>
            {/* Main Timeline Area */}
            <div className="glass-card flex-1 overflow-x-auto overflow-y-visible p-6 relative" ref={timelineRef}>
                <div className="min-w-[1200px] relative" style={{ width: `${zoom}%` }}>

                    {/* Global Overlay Container for perfect alignment relative to timeline track */}
                    <div className="absolute inset-y-0 left-32 right-0 pointer-events-none z-40">
                        {/* Global Current Age Zone */}
                        {viewMode !== 'future' && (
                            <div
                                className="absolute top-0 bottom-0 bg-green-500/40 border-x border-green-500 z-20"
                                style={{
                                    left: `${getPositionPercent(Math.floor(currentAge))}%`,
                                    width: `${100 / totalYears}%`
                                }}
                            >
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full pb-1">
                                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                                        {currentAge.toFixed(1)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Top Categories */}
                    <div className="space-y-1 relative">
                        {topCategories.map((category, catIndex) => (
                            <div key={category.id} className="flex items-start min-h-[60px]">
                                <div className="w-32 flex items-center justify-end pr-4 pt-2">
                                    <span className="text-sm text-[var(--accent)] font-medium">{category.name}</span>
                                    <button
                                        onClick={() => setAddItemCategory(category.id)}
                                        className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                                        title={`Add ${category.name} item`}
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                                <div className="flex-1 h-12 relative bg-[#dbeafe] dark:bg-blue-900/30 rounded-sm">
                                    {/* Render items */}
                                    {filterItems(category.items).map(item => (
                                        <TimelineItem
                                            key={item.id}
                                            item={item}
                                            getPositionPercent={getPositionPercent}
                                            currentAge={currentAge}
                                            maxAge={settings.ageRange}
                                            isTopSection={true}
                                            onClick={() => setEditingItem({ categoryId: category.id, item })}
                                            categoryIndex={catIndex}
                                            totalCategories={topCategories.length}
                                        />
                                    ))}
                                    {/* Current age indicator */}
                                    {viewMode !== 'future' && (
                                        <div
                                            className="absolute top-0 bottom-0 w-0.5 bg-[#22c55e] dark:bg-green-400 z-20"
                                            style={{ left: `${getCurrentAgePosition()}%` }}
                                        />
                                    )}
                                    {/* Future section overlay */}
                                    {viewMode === 'all' && (
                                        <div
                                            className="absolute top-0 bottom-0 bg-[#fecaca] dark:bg-red-900/30"
                                            style={{
                                                left: `${getPositionPercent(currentAge)}%`,
                                                right: 0
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Age Axis - Individual boxed cells for each age */}
                    <div className="flex items-center my-3">
                        <div className="w-32 flex items-center justify-end pr-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                                <Calendar size={14} className="text-[var(--accent)]" />
                                <span className="text-sm font-semibold text-[var(--accent)]">Age</span>
                            </div>
                        </div>
                        <div className="flex-1 relative h-8">
                            {/* Age boxes container */}
                            <div className="absolute inset-0 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900/50">
                                {ageMarkers.map((age, index) => {
                                    // Render all age markers including 80
                                    const isPast = age <= currentAge;
                                    const isCurrent = Math.floor(currentAge) === age;
                                    const isDecade = age % 10 === 0;

                                    // Use absolute positioning to match the timeline items exactly
                                    const startPos = getPositionPercent(age);
                                    const widthPercent = 100 / totalYears;

                                    // Hide if strictly greater than 100% (allows 100% for the last edge)
                                    if (startPos > 100.1) return null;

                                    return (
                                        <div
                                            key={age}
                                            className={`absolute top-0 bottom-0 flex items-center justify-center text-xs font-mono border-r border-gray-300 dark:border-gray-600 box-border overflow-hidden
                                                ${isCurrent
                                                    ? 'bg-green-500 text-white font-bold z-10'
                                                    : isDecade
                                                        ? 'bg-black text-white font-bold'
                                                        : isPast
                                                            ? 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                                                            : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                                                }`}
                                            style={{
                                                left: `${startPos}%`,
                                                width: `${widthPercent}%`
                                            }}
                                        >
                                            <span className="text-xs font-medium">{age}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Categories */}
                    <div className="space-y-1 relative">
                        {bottomCategories.map((category, catIndex) => (
                            <div key={category.id} className="flex items-end min-h-[60px]">
                                <div className="w-32 flex items-center justify-end pr-4 pb-2">
                                    <span className="text-sm text-[var(--accent)] font-medium">{category.name}</span>
                                    <button
                                        onClick={() => setAddItemCategory(category.id)}
                                        className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                                        title={`Add ${category.name} item`}
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                                <div className="flex-1 h-12 relative bg-[#fecaca] dark:bg-red-900/30 rounded-sm">
                                    {/* Render items */}
                                    {filterItems(category.items).map(item => (
                                        <TimelineItem
                                            key={item.id}
                                            item={item}
                                            getPositionPercent={getPositionPercent}
                                            currentAge={currentAge}
                                            maxAge={settings.ageRange}
                                            isTopSection={false}
                                            onClick={() => setEditingItem({ categoryId: category.id, item })}
                                            categoryIndex={catIndex}
                                            totalCategories={bottomCategories.length}
                                        />
                                    ))}
                                    {/* Current age indicator */}
                                    {viewMode !== 'future' && (
                                        <div
                                            className="absolute top-0 bottom-0 w-0.5 bg-[#22c55e] dark:bg-green-400 z-20"
                                            style={{ left: `${getCurrentAgePosition()}%` }}
                                        />
                                    )}
                                    {/* Past section overlay */}
                                    {viewMode === 'all' && (
                                        <div
                                            className="absolute top-0 bottom-0 bg-[#dbeafe] dark:bg-blue-900/30"
                                            style={{
                                                left: 0,
                                                width: `${getPositionPercent(currentAge)}%`
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Controls - Premium styled bar */}
            <div className="flex items-center justify-between mt-4 px-4 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-[var(--muted)]">View</span>
                        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1">
                            <button
                                onClick={() => setViewMode('all')}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${viewMode === 'all'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm'
                                    : 'text-[var(--muted)] hover:text-[var(--fg)]'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setViewMode('past')}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${viewMode === 'past'
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm'
                                    : 'text-[var(--muted)] hover:text-[var(--fg)]'
                                    }`}
                            >
                                Past
                            </button>
                            <button
                                onClick={() => setViewMode('future')}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${viewMode === 'future'
                                    ? 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-sm'
                                    : 'text-[var(--muted)] hover:text-[var(--fg)]'
                                    }`}
                            >
                                Future
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-[var(--muted)]">Zoom</span>
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5">
                            <span className="text-xs text-[var(--muted)] w-6">50%</span>
                            <input
                                type="range"
                                min={50}
                                max={200}
                                value={zoom}
                                onChange={(e) => setZoom(parseInt(e.target.value))}
                                className="w-24 accent-[var(--accent)]"
                            />
                            <span className="text-xs text-[var(--muted)] w-8">200%</span>
                            <span className="text-xs font-semibold text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded">{zoom}%</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCategories(true)}
                        className="btn-ghost text-sm flex items-center gap-2 border border-gray-200 dark:border-gray-700"
                    >
                        <Settings size={14} />
                        Manage Categories
                    </button>
                </div>
            </div>

            {/* Modals */}
            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                settings={settings}
                onSave={setSettings}
            />

            <ManageCategoriesModal
                isOpen={showCategories}
                onClose={() => setShowCategories(false)}
                categories={categories}
                onUpdate={setCategories}
                onAddCategory={() => {
                    setShowCategories(false);
                    setShowAddCategory(true);
                }}
            />

            <AddCategoryModal
                isOpen={showAddCategory}
                onClose={() => setShowAddCategory(false)}
                onAdd={handleAddCategory}
            />

            {/* Add Item Modal */}
            {addItemCategory && (
                <ItemModal
                    isOpen={!!addItemCategory}
                    onClose={() => setAddItemCategory(null)}
                    categoryName={getCategoryById(addItemCategory)?.name || ''}
                    maxAge={settings.ageRange}
                    onSave={(item) => handleAddItem(addItemCategory, item)}
                />
            )}

            {/* Edit Item Modal */}
            {editingItem && (
                <ItemModal
                    isOpen={!!editingItem}
                    onClose={() => setEditingItem(null)}
                    categoryName={getCategoryById(editingItem.categoryId)?.name || ''}
                    maxAge={settings.ageRange}
                    editItem={editingItem.item}
                    onSave={(item) => handleUpdateItem(editingItem.categoryId, editingItem.item.id, item)}
                    onDelete={() => handleDeleteItem(editingItem.categoryId, editingItem.item.id)}
                />
            )}
        </div>
    );
}
