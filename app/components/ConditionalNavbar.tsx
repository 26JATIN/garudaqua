"use client";
import { useSelectedLayoutSegment } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
    const segment = useSelectedLayoutSegment();
    
    // Don't show the main navbar on admin pages or the dedicated watch page
    if (segment === 'admin' || segment === 'watch') {
        return null;
    }
    
    return <Navbar />;
}