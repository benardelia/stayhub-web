import { Link } from 'react-router'
import { brand } from '../../content'

const YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between md:px-8">
        <p>
          © {YEAR} {brand.name}. {brand.subtitle}.
        </p>
        <div className="flex gap-5">
          <Link to="/search" className="hover:text-ink">
            Explore stays
          </Link>
          <Link to="/admin" className="hover:text-ink">
            List your property
          </Link>
          <a href={`mailto:${brand.supportEmail}`} className="hover:text-ink">
            Support
          </a>
        </div>
      </div>
    </footer>
  )
}
