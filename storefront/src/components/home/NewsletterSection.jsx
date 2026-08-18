import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Button from '../ui/Button'
import { storeApi, getErrorMessage } from '../../lib/services'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.includes('@')) {
      toast.error('Please enter a valid email')
      return
    }
    setSubmitting(true)
    try {
      await storeApi.newsletter(email)
      toast.success('You are on the list.')
      setEmail('')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not subscribe'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="border-t border-border bg-gradient-to-b from-charcoal to-ink">
      <div className="container-site section-pad py-12 text-center sm:py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <h2 className="font-display text-2xl text-gold sm:text-3xl md:text-4xl">
            Stay close to new drops
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted">
            Be first to hear about new arrivals, private offers, and limited editions.
          </p>
        </motion.div>
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-7 flex max-w-xl flex-col gap-3 sm:mt-8 sm:flex-row"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="w-full border border-border bg-ink px-4 py-3.5 text-base text-ivory placeholder:text-muted sm:text-sm"
            aria-label="Email for newsletter"
            enterKeyHint="send"
            autoComplete="email"
          />
          <Button type="submit" className="w-full sm:w-auto sm:shrink-0" disabled={submitting}>
            {submitting ? 'Subscribing…' : 'Subscribe'}
          </Button>
        </form>
      </div>
    </section>
  )
}
