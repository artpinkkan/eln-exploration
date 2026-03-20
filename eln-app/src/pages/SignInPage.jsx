import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SignInPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    // Navigate to main app on submit
    navigate('/projects')
  }

  return (
    <div className="bg-surface font-body text-on-surface overflow-hidden relative">
      {/* Background blur orbs */}
      <div className="fixed inset-0 -z-10 bg-surface overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] -ml-48 -mb-48" />
      </div>

      <main className="min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="flex flex-col md:flex-row w-full max-w-5xl md:h-[700px] overflow-hidden rounded-xl shadow-[0_24px_48px_-12px_rgba(25,28,29,0.04)] bg-surface-container-lowest">

          {/* Left Pane: Brand */}
          <div className="w-full md:w-1/2 clinical-gradient flex flex-col justify-between p-12 text-white relative">
            {/* Decorative circles */}
            <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
              <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full border border-white" />
              <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full border-2 border-white opacity-20 -translate-x-1/2 -translate-y-1/2" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-16">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary font-bold">science</span>
                </div>
                <h1 className="font-headline font-extrabold text-2xl tracking-tight">KALBE</h1>
              </div>
              <div className="space-y-4">
                <span className="font-label text-xs uppercase tracking-[0.2em] text-on-primary-container">welcome to</span>
                <h2 className="font-headline text-4xl md:text-5xl font-bold leading-tight -ml-1">
                  E-Laboratory Notebook
                </h2>
                <p className="text-on-primary-container max-w-sm text-lg font-light leading-relaxed">
                  Secure authentication gateway for the laboratory notebook ecosystem.
                </p>
              </div>
            </div>

            <div className="relative z-10 flex items-center gap-6 opacity-60">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest font-semibold">developed by</span>
                <span className="text-sm">Corp Digital Technology</span>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest font-semibold">app version</span>
                <span className="text-sm">ELN v4.2</span>
              </div>
            </div>
          </div>

          {/* Right Pane: Form */}
          <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-surface-container-lowest">
            <div className="max-w-md w-full mx-auto">
              <header className="mb-10">
                <h3 className="font-headline text-3xl font-bold text-on-surface mb-2 tracking-tight">Sign In</h3>
                <p className="text-on-surface-variant font-body">Enter your laboratory credentials to proceed.</p>
              </header>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Username */}
                <div className="space-y-2">
                  <label htmlFor="username" className="font-label text-sm font-semibold text-on-surface-variant tracking-wide">
                    Username
                  </label>
                  <div className="group relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-outline group-focus-within:text-primary transition-colors">
                      <span className="material-symbols-outlined text-lg">person</span>
                    </div>
                    <input
                      id="username"
                      type="text"
                      placeholder="john.doe@precision.eln"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-surface-container-high border-none rounded-lg py-4 pl-12 pr-4 text-on-surface placeholder:text-outline/50 focus:ring-0 focus:bg-surface-container-highest transition-all duration-200"
                    />
                    <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary group-focus-within:w-full transition-all duration-300" />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="password" className="font-label text-sm font-semibold text-on-surface-variant tracking-wide">
                      Password
                    </label>
                    <a href="#" className="text-xs font-semibold text-primary hover:underline transition-all">
                      Forgot password?
                    </a>
                  </div>
                  <div className="group relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-outline group-focus-within:text-primary transition-colors">
                      <span className="material-symbols-outlined text-lg">lock</span>
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-surface-container-high border-none rounded-lg py-4 pl-12 pr-12 text-on-surface placeholder:text-outline/50 focus:ring-0 focus:bg-surface-container-highest transition-all duration-200"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="text-outline hover:text-on-surface transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary group-focus-within:w-full transition-all duration-300" />
                  </div>
                </div>

                {/* Remember me */}
                <div className="flex items-center gap-3 py-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-0 bg-surface"
                  />
                  <label htmlFor="remember" className="text-sm text-on-surface-variant cursor-pointer">
                    Remember this workstation
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-4 clinical-gradient text-white font-headline font-bold rounded-lg shadow-lg shadow-primary/10 hover:shadow-xl hover:opacity-95 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 mt-4"
                >
                  Sign In
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </button>
              </form>

              <footer className="mt-12 pt-8 border-t border-outline-variant/20">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 text-on-surface-variant/60">
                    <span className="material-symbols-outlined text-base">verified_user</span>
                    <span className="text-xs font-label uppercase tracking-widest">Authorized Personnel Only</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-outline">
                    By signing in, you agree to the Institutional Data Governance Policy and Laboratory Information Systems terms of service. Unauthorized access attempts are logged and reported.
                  </p>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom-right status badge */}
      <div className="fixed bottom-6 right-8 hidden md:flex items-center gap-4 px-4 py-2 bg-surface-container-high rounded-full border border-outline-variant/10">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">
          instance: production
        </span>
      </div>
    </div>
  )
}
