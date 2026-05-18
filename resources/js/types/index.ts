import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface AdminStats {
    categories: number;
    aksara: number;
    users: number;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    /** Stats global admin (Kategori/Aksara/Akun) — di-share via HandleInertiaRequests untuk halaman /admin/*. */
    adminStats?: AdminStats | null;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
