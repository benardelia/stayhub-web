import { platformNav } from '../../content'
import Shell from '../../components/admin/Shell'

export default function PlatformLayout() {
  return (
    <Shell
      title="Platform admin"
      subtitle={<p className="text-xs text-muted">Approve hotels, handle money and users.</p>}
      nav={platformNav.map((n) => ({ ...n, to: `/platform/${n.to}` }))}
    />
  )
}
