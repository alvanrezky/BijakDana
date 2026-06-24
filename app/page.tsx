 'use client'
import dynamic from 'next/dynamic'

const BijakDana = dynamic(() => import('./bijakdana'), { ssr: false })

export default function Home() {
  return <BijakDana />
}