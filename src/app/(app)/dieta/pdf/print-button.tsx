'use client'

import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import { useEffect } from 'react'

export default function PrintButton() {
    useEffect(() => {
        // Optional: Auto-print when opened if desired, but button is safer
        // window.print()
    }, [])

    return (
        <Button onClick={() => window.print()} className="w-full sm:w-auto">
            <Printer className="mr-2 h-4 w-4" /> Imprimir / Salvar PDF
        </Button>
    )
}
