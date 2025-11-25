import SocialButton from '@/components/SocialButton'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C0E12] px-4">
      <div className="w-full max-w-[500px] animate-[fadeInUp_0.5s_ease-out]">
        {/* Profile Section */}
        <div className="flex items-center justify-center gap-4">
          {/* Avatar */}
          <img
            src="/headshot.jpg"
            alt="Sid Rout"
            className="w-20 h-20 rounded-full object-cover shadow-[0_0_20px_rgba(255,255,255,0.06)] flex-shrink-0"
          />
          
          {/* Name and Location */}
          <div className="flex flex-col items-start">
            {/* Name */}
            <h1 className="text-[22px] font-semibold text-white leading-tight">
              Sid Rout
            </h1>
            
            {/* Location */}
            <div className="text-[14px] font-normal text-white/65 mt-[6px] leading-tight">
              📍 New York City
            </div>
          </div>
        </div>

        {/* Social Buttons - 24px space above */}
        <div className="mt-6 flex flex-wrap gap-3 justify-center items-center">
          <SocialButton
            href="https://twitter.com/sidrout"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            }
            label="@sidrout"
          />
          
          <SocialButton
            href="https://www.linkedin.com/in/sid-rout"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="opacity-80">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            }
            label="sid-rout"
          />
          
          <SocialButton
            href="https://github.com/sidrout"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="opacity-80">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            }
            label="sidrout"
          />
          
          <SocialButton
            href="mailto:siddharth.rout@columbia.edu"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            }
            label="Email"
          />
          
          <SocialButton
            href="#"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                <line x1="9" y1="9" x2="15" y2="9"></line>
                <line x1="9" y1="13" x2="13" y2="13"></line>
              </svg>
            }
            label="ChatGPT"
          />
          
          <SocialButton
            href="#"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
            }
            label="Google Scholar"
          />
        </div>
      </div>
    </div>
  )
}

