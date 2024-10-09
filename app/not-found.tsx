import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-3xl font-bold mb-4">Página no encontrada</h2>
      <p className="mb-4">Lo sentimos, la página que estás buscando no existe.</p>
      <Link href="/">
        <Button variant="outline">Volver a la página principal</Button>
      </Link>
    </div>
  )
}