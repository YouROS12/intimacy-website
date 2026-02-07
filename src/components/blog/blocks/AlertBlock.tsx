import React from 'react';
import { AlertBlock as AlertBlockType } from '@/types';
import { Info, AlertTriangle, Lightbulb } from 'lucide-react';

export const AlertBlock: React.FC<{ block: AlertBlockType }> = ({ block }) => {
    const styles = {
        info: 'bg-blue-50 text-blue-900 border-blue-100',
        warning: 'bg-amber-50 text-amber-900 border-amber-100',
        tip: 'bg-emerald-50 text-emerald-900 border-emerald-100'
    };

    const icons = {
        info: <Info className="h-6 w-6 text-blue-500 flex-shrink-0" />,
        warning: <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0" />,
        tip: <Lightbulb className="h-6 w-6 text-emerald-500 flex-shrink-0" />
    };

    return (
        <div className={`my-8 p-6 rounded-2xl border flex gap-4 ${styles[block.variant]}`}>
            <div className="mt-1">{icons[block.variant]}</div>
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: block.content }} />
        </div>
    );
};
