import { motion } from 'framer-motion'
import { Droplets, Sparkles, Timer, Truck } from 'lucide-react'
import { SectionHeader } from '../ui/PageHero'

const reasons = [
  {
    icon: Sparkles,
    title: 'Refined compositions',
    body: 'Balanced top, heart, and base notes designed for Pakistani climate and evening wear.',
  },
  {
    icon: Timer,
    title: 'Lasting presence',
    body: 'Eau de parfum concentrations crafted for longevity without harsh projection.',
  },
  {
    icon: Droplets,
    title: 'Multiple bottle sizes',
    body: 'Explore with smaller sizes, then invest in your signature bottle with confidence.',
  },
  {
    icon: Truck,
    title: 'Nationwide delivery',
    body: 'Cash on Delivery across major cities, with complimentary shipping on qualifying orders.',
  },
]

export default function WhyChooseUs() {
  return (
    <section className="border-y border-border bg-charcoal/60">
      <div className="container-site section-pad py-12 sm:py-16 md:py-20">
        <SectionHeader
          title="Why choose SQ Perfumes"
          description="A Pakistani perfume house focused on craft, lasting presence, and customer trust."
          align="center"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {reasons.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="border border-border bg-ink/40 p-4 sm:p-5"
            >
              <item.icon className="text-gold" size={22} strokeWidth={1.4} />
              <h3 className="mt-4 font-display text-lg text-ivory sm:text-xl">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
