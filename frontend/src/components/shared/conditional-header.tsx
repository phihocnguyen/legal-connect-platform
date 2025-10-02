'use client'
import { usePathname } from "next/navigation"
import { Header } from "../navbar/header"

const ConditionalHeader = () => {
    const pathname = usePathname()
    if (pathname.startsWith('/admin')) return null 
    return <Header/>
}

export default ConditionalHeader