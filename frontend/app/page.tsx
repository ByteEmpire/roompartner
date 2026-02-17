'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Footer from '@/components/layout/Footer'
import { 
  Users, MessageSquare, Shield, Home, CheckCircle, 
  Lock, Image as ImageIcon, ArrowRight, Search, UserCheck,
  Sparkles, Globe, TrendingUp, Star
} from 'lucide-react'

export default function LandingPage() {
  const features = [
    {
      icon: Users,
      title: 'Smart Matching',
      description: 'AI-powered algorithm finds roommates who match your lifestyle, budget, and preferences perfectly.',
    },
    {
      icon: UserCheck,
      title: 'Verified Profiles',
      description: 'Every profile is verified for authenticity. Connect with real people, not fake accounts.',
    },
    {
      icon: MessageSquare,
      title: 'Real-Time Chat',
      description: 'Instant messaging with typing indicators and online status. Connect seamlessly.',
    },
    {
      icon: Lock,
      title: 'Secure Payments',
      description: 'Razorpay-powered transactions. Your payment information is always protected.',
    },
    {
      icon: ImageIcon,
      title: 'Room Gallery',
      description: 'Upload and view multiple room photos. Make informed decisions with visual proof.',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your data is encrypted and never shared. Control what others can see.',
    },
  ]

  const steps = [
    {
      number: '01',
      title: 'Create Profile',
      description: 'Sign up in 2 minutes. Add your preferences, budget, and photos.',
      icon: UserCheck,
    },
    {
      number: '02',
      title: 'Browse Matches',
      description: 'Get personalized roommate suggestions based on your criteria.',
      icon: Search,
    },
    {
      number: '03',
      title: 'Connect & Move',
      description: 'Chat, meet, and finalize your perfect living arrangement.',
      icon: MessageSquare,
    },
  ]

  const stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '5K+', label: 'Successful Matches' },
    { value: '50+', label: 'Cities Covered' },
    { value: '4.8★', label: 'User Rating' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Home className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">
                RoomPartner
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-secondary/50 mb-8">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm text-muted-foreground">Trusted by 10,000+ Users</span>
            </div>
            
            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight">
              Find Your Perfect
              <br />
              <span className="text-primary">Roommate</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed">
              Smart matching, verified profiles, and secure payments.
              <br className="hidden sm:block" />
              Your ideal living partner is just a click away.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-16">
              <Link href="/signup">
                <Button size="lg" className="min-w-[180px]">
                  Start Free Today
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="min-w-[180px]">
                  See How It Works
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-border">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05, duration: 0.4 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you find the perfect roommate match
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="group p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to find your ideal roommate
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.4 }}
                  className="relative text-center"
                >
                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-border"></div>
                  )}
                  
                  {/* Icon */}
                  <div className="inline-flex w-20 h-20 rounded-xl bg-primary items-center justify-center mb-6">
                    <Icon className="w-10 h-10 text-primary-foreground" />
                  </div>
                  
                  {/* Step Number */}
                  <div className="text-primary font-semibold text-sm mb-3">{step.number}</div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-12 rounded-xl border border-border bg-card text-center"
          >
            {/* Icon */}
            <div className="inline-flex w-16 h-16 rounded-xl bg-primary/10 items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            
            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Built for Real Renters
            </h2>
            
            {/* Description */}
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Your safety and privacy are our top priorities. Every profile is verified, 
              payments are secure, and your data is encrypted end-to-end.
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { title: '100% Verified Profiles', subtitle: 'No fake accounts' },
                { title: 'Secure Payments', subtitle: 'Razorpay protected' },
                { title: '24/7 Support', subtitle: 'We are here to help' },
              ].map((badge) => (
                <div
                  key={badge.title}
                  className="flex items-start gap-3 p-4 rounded-lg border border-border bg-secondary/50 text-left"
                >
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground text-sm">{badge.title}</div>
                    <div className="text-muted-foreground text-xs">{badge.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Ready to Find Your Roommate?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of happy users who found their perfect match.
              Create your free account in just 2 minutes.
            </p>
            <Link href="/signup">
              <Button size="lg" className="min-w-[200px]">
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • Free forever
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

