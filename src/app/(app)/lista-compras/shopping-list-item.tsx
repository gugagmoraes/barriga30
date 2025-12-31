'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'

export function ShoppingListItem({ item }: { item: string }) {
    const [checked, setChecked] = useState(false)

    return (
        <div className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${checked ? 'bg-green-50 border-green-200' : 'bg-white hover:bg-gray-50'}`}>
            <Checkbox 
                checked={checked} 
                onCheckedChange={(c) => setChecked(c as boolean)} 
                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
            />
            <span className={`font-medium ${checked ? 'text-green-800 line-through' : 'text-gray-700'}`}>
                {item}
            </span>
        </div>
    )
}
