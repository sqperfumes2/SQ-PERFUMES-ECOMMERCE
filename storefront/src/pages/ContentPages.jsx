import { useState } from 'react'
import toast from 'react-hot-toast'
import PageHero from '../components/ui/PageHero'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import Button from '../components/ui/Button'
import Input, { TextArea } from '../components/ui/Input'
import Seo, { faqJsonLd } from '../components/seo/Seo'
import { faqs } from '../data/content'
import { policies } from '../data/policies'
import { brand } from '../lib/brand'
import { storeApi, getErrorMessage } from '../lib/services'

export function AboutPage() {
  return (
    <>
      <Seo
        title="About SQ Perfumes"
        description="SQ Perfumes is a Pakistani perfume house. Learn about our official eau de parfum for him, her, and unisex."
        path="/about"
      />
      <PageHero
        eyebrow="Brand"
        title="About SQ Perfumes"
        description={brand.tagline}
        crumbs={<Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'About' }]} />}
      />
      <div className="container-site section-pad grid gap-10 py-12 md:grid-cols-2 md:py-16">
        <div className="aspect-[4/5] overflow-hidden border border-border">
          <img
            src={brand.logo}
            alt={`${brand.name} logo`}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="space-y-4 text-muted">
          <p>{brand.description}</p>
          <p>
            Founded with a focus on lasting trails and quiet luxury, SQ Perfumes composes scents
            for evenings, rituals, and everyday presence. Each bottle is offered in multiple sizes so
            you can explore before you commit.
          </p>
          <p>
            We ship across Pakistan with care — Cash on Delivery available, and
            complimentary shipping on qualifying orders.
          </p>
          <Button to="/shop" className="mt-4">
            Explore the collection
          </Button>
        </div>
      </div>
    </>
  )
}

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const email = brand.contact.email
  const phone = brand.contact.phone
  const address = brand.contact.address

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.includes('@') || form.message.trim().length < 5) {
      toast.error('Please complete the required fields')
      return
    }
    setSubmitting(true)
    try {
      await storeApi.contact(form)
      toast.success('Message received — we will respond shortly')
      setForm({ name: '', email: '', phone: '', message: '' })
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not send message'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Seo
        title="Contact SQ Perfumes"
        description="Contact SQ Perfumes about orders, fragrance notes, or wholesale."
        path="/contact"
      />
      <PageHero
        eyebrow="Support"
        title="Contact us"
        description="Questions about an order, a fragrance note, or wholesale? Send a message."
        crumbs={<Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Contact' }]} />}
      />
      <div className="container-site section-pad grid gap-8 py-10 md:grid-cols-2 md:py-14">
        <form onSubmit={handleSubmit} className="space-y-4 border border-border p-5">
          <Input
            id="name"
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            id="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            id="phone"
            label="Phone (optional)"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <TextArea
            id="message"
            label="Message"
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send message'}
          </Button>
        </form>
        <div className="border border-border bg-charcoal p-5 text-sm text-muted">
          <h2 className="font-display text-xl text-ivory">Reach us directly</h2>
          <ul className="mt-4 space-y-3">
            {email ? (
              <li>
                Email:{' '}
                <a href={`mailto:${email}`} className="text-gold hover:text-gold-bright">
                  {email}
                </a>
              </li>
            ) : null}
            {phone ? (
              <li>
                Phone:{' '}
                <a
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className="text-gold hover:text-gold-bright"
                >
                  {phone}
                </a>
              </li>
            ) : null}
            {brand.contact.whatsappLink ? (
              <li>
                WhatsApp:{' '}
                <a
                  href={brand.contact.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:text-gold-bright"
                >
                  Chat with SQ Perfumes
                </a>
              </li>
            ) : null}
            {address ? <li>Location: {address}</li> : null}
          </ul>
        </div>
      </div>
    </>
  )
}

export function FaqPage() {
  const [openId, setOpenId] = useState(faqs[0]?.id)

  return (
    <>
      <Seo
        title="SQ Perfumes FAQ"
        description="Answers about SQ Perfumes delivery, longevity, returns, and authenticity."
        path="/faq"
        jsonLd={faqJsonLd(faqs)}
        jsonLdId="faq-jsonld"
      />
      <PageHero
        eyebrow="Help"
        title="Frequently asked questions"
        description="Quick answers about delivery, longevity, returns, and authenticity."
        crumbs={<Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'FAQ' }]} />}
      />
      <div className="container-site section-pad max-w-3xl py-10 md:py-14">
        <div className="space-y-3">
          {faqs.map((faq) => {
            const open = openId === faq.id
            return (
              <div key={faq.id} className="border border-border">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
                  onClick={() => setOpenId(open ? null : faq.id)}
                  aria-expanded={open}
                >
                  <span className="text-ivory">{faq.question}</span>
                  <span className="text-gold">{open ? '−' : '+'}</span>
                </button>
                {open ? <p className="border-t border-border px-4 py-4 text-sm text-muted">{faq.answer}</p> : null}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

function PolicyPage({ policyKey, path }) {
  const policy = policies[policyKey]
  return (
    <>
      <Seo title={policy.title} description={`SQ Perfumes ${policy.title} — last updated ${policy.updated}.`} path={path} />
      <PageHero
        eyebrow="Policies"
        title={policy.title}
        description={`Last updated ${policy.updated}`}
        crumbs={<Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: policy.title }]} />}
      />
      <div className="container-site section-pad max-w-3xl space-y-8 py-10 md:py-14">
        {policy.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-2xl text-ivory">{section.heading}</h2>
            <p className="mt-3 text-muted">{section.body}</p>
          </section>
        ))}
      </div>
    </>
  )
}

export function ShippingPage() {
  return <PolicyPage policyKey="shipping" path="/shipping" />
}

export function ReturnsPage() {
  return <PolicyPage policyKey="returns" path="/returns" />
}

export function PrivacyPage() {
  return <PolicyPage policyKey="privacy" path="/privacy" />
}

export function TermsPage() {
  return <PolicyPage policyKey="terms" path="/terms" />
}

export function NotFoundPage() {
  return (
    <div className="container-site section-pad py-24 text-center">
      <Seo title="Page not found" path="/404" noindex />
      <p className="text-xs uppercase tracking-[0.28em] text-gold">404</p>
      <h1 className="mt-3 font-display text-4xl text-ivory md:text-5xl">Page not found</h1>
      <p className="mx-auto mt-4 max-w-md text-muted">
        The page you are looking for does not exist or may have moved.
      </p>
      <Button to="/" className="mt-8">
        Return home
      </Button>
    </div>
  )
}
