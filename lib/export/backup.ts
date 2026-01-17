/**
 * Data Export/Import Utilities
 * Handles JSON backup and restore of user data
 */

export interface BackupData {
    version: string;
    exportedAt: string;
    data: {
        reviews: Record<string, string>;
        goals: Record<string, string>;
        frameworks: Record<string, string>;
        settings: Record<string, unknown>;
    };
}

/**
 * Export all user data as JSON
 */
export async function exportAllData(): Promise<BackupData> {
    const backup: BackupData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        data: {
            reviews: {},
            goals: {},
            frameworks: {},
            settings: {}
        }
    };

    try {
        // Fetch reviews
        const reviewsRes = await fetch('/api/files?type=folder&path=reviews');
        if (reviewsRes.ok) {
            const reviewTypes = await reviewsRes.json();
            for (const type of reviewTypes.files || []) {
                if (type.isDirectory) {
                    const typeRes = await fetch(`/api/files?type=folder&path=reviews/${type.name}`);
                    if (typeRes.ok) {
                        const files = await typeRes.json();
                        for (const file of files.files || []) {
                            if (!file.isDirectory && file.name.endsWith('.md')) {
                                const contentRes = await fetch(`/api/files?type=file&path=reviews/${type.name}/${file.name}`);
                                if (contentRes.ok) {
                                    const content = await contentRes.json();
                                    backup.data.reviews[`${type.name}/${file.name}`] = content.content || '';
                                }
                            }
                        }
                    }
                }
            }
        }

        // Fetch goals
        const goalsRes = await fetch('/api/files?type=folder&path=goals');
        if (goalsRes.ok) {
            const goals = await goalsRes.json();
            for (const file of goals.files || []) {
                if (!file.isDirectory && file.name.endsWith('.md')) {
                    const contentRes = await fetch(`/api/files?type=file&path=goals/${file.name}`);
                    if (contentRes.ok) {
                        const content = await contentRes.json();
                        backup.data.goals[file.name] = content.content || '';
                    }
                }
            }
        }

        // Fetch frameworks
        const frameworksRes = await fetch('/api/files?type=folder&path=frameworks');
        if (frameworksRes.ok) {
            const frameworks = await frameworksRes.json();
            for (const file of frameworks.files || []) {
                if (!file.isDirectory && file.name.endsWith('.md')) {
                    const contentRes = await fetch(`/api/files?type=file&path=frameworks/${file.name}`);
                    if (contentRes.ok) {
                        const content = await contentRes.json();
                        backup.data.frameworks[file.name] = content.content || '';
                    }
                }
            }
        }

        // Get settings from localStorage
        if (typeof window !== 'undefined') {
            backup.data.settings = {
                ai_provider: localStorage.getItem('ai_provider') || 'openai',
                openai_model: localStorage.getItem('openai_model') || 'gpt-4o',
                ollama_model: localStorage.getItem('ollama_model') || 'llama3.2',
                theme: localStorage.getItem('theme') || 'system'
            };
        }

    } catch (error) {
        console.error('Export error:', error);
        throw new Error('Failed to export data');
    }

    return backup;
}

/**
 * Import data from backup JSON
 */
export async function importData(
    backup: BackupData,
    options: { merge: boolean } = { merge: true }
): Promise<{ success: boolean; imported: number; errors: string[] }> {
    const result = { success: true, imported: 0, errors: [] as string[] };

    try {
        // Validate backup structure
        if (!backup.version || !backup.data) {
            throw new Error('Invalid backup format');
        }

        // Import reviews
        for (const [path, content] of Object.entries(backup.data.reviews)) {
            try {
                await fetch('/api/files', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: `reviews/${path}`, content })
                });
                result.imported++;
            } catch (e) {
                result.errors.push(`Failed to import review: ${path}`);
            }
        }

        // Import goals
        for (const [name, content] of Object.entries(backup.data.goals)) {
            try {
                await fetch('/api/files', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: `goals/${name}`, content })
                });
                result.imported++;
            } catch (e) {
                result.errors.push(`Failed to import goal: ${name}`);
            }
        }

        // Import frameworks
        for (const [name, content] of Object.entries(backup.data.frameworks)) {
            try {
                await fetch('/api/files', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: `frameworks/${name}`, content })
                });
                result.imported++;
            } catch (e) {
                result.errors.push(`Failed to import framework: ${name}`);
            }
        }

        // Import settings
        if (typeof window !== 'undefined' && backup.data.settings) {
            const settings = backup.data.settings as Record<string, string>;
            for (const [key, value] of Object.entries(settings)) {
                if (value) localStorage.setItem(key, value);
            }
        }

    } catch (error) {
        result.success = false;
        result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return result;
}

/**
 * Download data as a JSON file
 */
export function downloadJSON(data: BackupData, filename?: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `ceo-os-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Read JSON file from file input
 */
export function readJSONFile(file: File): Promise<BackupData> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                resolve(data);
            } catch {
                reject(new Error('Invalid JSON file'));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}
