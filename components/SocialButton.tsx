import Link from 'next/link'

interface SocialButtonProps {
  href: string
  icon: React.ReactNode
  label: string
}

export default function SocialButton({ href, icon, label }: SocialButtonProps) {
  return (
    <Link
      href={href}
      className="h-12 px-4 rounded-full border border-white/12 bg-transparent flex items-center gap-2 text-white hover:border-white/25 transition-all duration-200"
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
    >
      <span className="flex-shrink-0 flex items-center justify-center">
        {icon}
      </span>
      <span className="text-[14px] font-normal leading-tight whitespace-nowrap">
        {label}
      </span>
    </Link>
  )
}

