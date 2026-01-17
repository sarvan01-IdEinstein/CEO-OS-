/**
 * User profile utilities for CEO Personal OS
 */

import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'data');
const PROFILE_PATH = path.join(CONTENT_DIR, 'profile.json');

export interface UserProfile {
    name: string;
    email?: string;
    role?: string;
}

const defaultProfile: UserProfile = {
    name: 'CEO',
    role: 'Chief Executive Officer'
};

/**
 * Get the user's profile information
 */
export function getUserProfile(): UserProfile {
    try {
        if (fs.existsSync(PROFILE_PATH)) {
            const content = fs.readFileSync(PROFILE_PATH, 'utf-8');
            const profile = JSON.parse(content);
            return { ...defaultProfile, ...profile };
        }
    } catch (error) {
        console.error('Error reading profile:', error);
    }
    return defaultProfile;
}

/**
 * Get the user's display name
 */
export function getUserName(): string {
    const profile = getUserProfile();
    // Return first name only for greeting
    return profile.name.split(' ')[0] || 'CEO';
}

/**
 * Save user profile
 */
export function saveUserProfile(profile: Partial<UserProfile>): boolean {
    try {
        const existing = getUserProfile();
        const updated = { ...existing, ...profile };

        // Ensure directory exists
        if (!fs.existsSync(CONTENT_DIR)) {
            fs.mkdirSync(CONTENT_DIR, { recursive: true });
        }

        fs.writeFileSync(PROFILE_PATH, JSON.stringify(updated, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving profile:', error);
        return false;
    }
}
