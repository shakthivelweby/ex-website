export default function SearchInputBox({ label, children, className = "" }) {
  return (
    <div
      className={`flex min-h-[58px] flex-col justify-center rounded-xl border border-[#DDDDDD] bg-[#F7F7F7] px-3.5 py-2.5 transition-colors focus-within:border-primary-400 focus-within:bg-white sm:min-h-[70px] sm:px-4 sm:py-3 ${className}`}
    >
      <p className="mb-0.5 text-[10px] font-medium text-[#717171] sm:mb-1 sm:text-[11px]">
        {label}
      </p>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
