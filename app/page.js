export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white text-center px-6 py-20">
      <img
        src="/images/pac-logo-black.png"
        alt="Power Alley CrossFit Logo"
        className="h-36 sm:h-44 w-auto mb-8 drop-shadow-lg filter invert"
      />
      <h1 className="text-4xl sm:text-5xl font-display uppercase tracking-wide mb-6">
        We Are Permanently Closed
      </h1>
      <p className="text-lg sm:text-xl text-gray-300 max-w-xl leading-relaxed mb-8">
        Thank you to our incredible community. Power Alley CrossFit has permanently closed its doors. We are grateful for every athlete, coach, and supporter who was part of our journey.
      </p>
      <p className="text-gray-400 text-sm">
        For questions, please email{' '}
        <a
          href="mailto:info@poweralleycrossfit.com"
          className="underline hover:text-white transition"
        >
          info@poweralleycrossfit.com
        </a>
      </p>
    </main>
  )
}
