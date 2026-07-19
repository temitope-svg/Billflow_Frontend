import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import onboarding1 from '../../assets/onboardingweb1.png'
import onboarding2 from '../../assets/onboardingweb2.png'
import onboarding3 from '../../assets/onboardingweb3.png'

interface Slide {
  key: string
  title: string
  desc: string
  image: string
}

const SLIDES: Slide[] = [
  {
    key: '1',
    title: 'Create in seconds',
    desc: 'Generate professional estimates, invoices and receipts instantly.',
    image: onboarding1,
  },
  {
    key: '2',
    title: 'Convert & track',
    desc: 'Turn estimates into invoices, mark paid, generate receipts.',
    image: onboarding2,
  },
  {
    key: '3',
    title: 'Share anywhere',
    desc: 'Download the PDF and share via WhatsApp, Gmail, or a public link.',
    image: onboarding3,
  },
]

export default function OnboardingPage() {
  const [index, setIndex] = useState(0)
  const navigate = useNavigate()
  const slide = SLIDES[index]
  const isLast = index === SLIDES.length - 1

  const handleNext = () => {
    if (isLast) navigate('/register')
    else setIndex(index + 1)
  }

  return (
    <div
      key={slide.key}
      className="relative flex min-h-svh flex-col justify-end bg-slate-100 bg-cover bg-center transition-[background-image]"
      style={{ backgroundImage: `url(${slide.image})` }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-white via-white/90 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-md px-8 pb-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{slide.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{slide.desc}</p>

        <div className="mt-6 flex justify-center gap-1.5">
          {SLIDES.map((s, idx) => (
            <span
              key={s.key}
              className={`h-1.5 rounded-full transition-all ${
                idx === index ? 'w-6 bg-brand' : 'w-1.5 bg-slate-300'
              }`}
            />
          ))}
        </div>

        <Button
          type="button"
          fullWidth
          className="mt-6 h-12 rounded-xl text-base"
          onClick={handleNext}
        >
          {isLast ? 'Create account' : 'Next'}
        </Button>

        {isLast && (
          <p className="mt-3 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand hover:text-brand-dark">
              Log in
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
