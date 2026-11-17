import Button from '../../components/ui/Button'

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="text-6xl font-extrabold text-primary">404</p>
      <p className="mt-3 text-lg font-bold">This page doesn't exist.</p>
      <Button to="/" className="mt-6">
        Back home
      </Button>
    </div>
  )
}
