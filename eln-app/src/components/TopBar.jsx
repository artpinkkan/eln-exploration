import ProfileMenu from './ProfileMenu'

export default function TopBar() {
  return (
    <header className="h-14 bg-white border-b border-slate-200 shrink-0 flex items-center justify-between px-8">
      <p className="font-headline font-bold text-slate-900 text-sm tracking-tight">
        Electronic Laboratory Notebook
      </p>
      <div className="flex items-center gap-3">
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors">
          <span className="material-symbols-outlined text-xl">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
        </button>
        <ProfileMenu />
      </div>
    </header>
  )
}
