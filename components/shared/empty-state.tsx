import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-4 text-center",
      className
    )}>
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <Icon className="h-7 w-7 text-muted-foreground" />
        </div>
      )}
      <h3 className="mb-2 text-base font-semibold">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && (
        action.href ? (
          <Button variant="default" size="sm" asChild>
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ) : (
          <Button variant="default" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        )
      )}
    </div>
  )
}
