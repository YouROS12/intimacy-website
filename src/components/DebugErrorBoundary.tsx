'use client';

import React from 'react';

export class ErrorBoundaryWrapper extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="bg-red-50 border border-red-200 p-4 rounded text-red-600">
                    <strong>CRASHED DURING RENDER:</strong> {this.state.error?.message}
                </div>
            );
        }
        return this.props.children;
    }
}
