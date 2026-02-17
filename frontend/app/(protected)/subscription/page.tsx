'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Check, Crown, Zap, Star, Shield, Users, MessageSquare, Sparkles, AlertCircle, X } from 'lucide-react'
import { SubscriptionPlan } from '@/types'
import api from '@/lib/api'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface Plan {
  id: SubscriptionPlan
  name: string
  price: number
  icon: any
  tagline: string
  features: string[]
  badge?: string
  popular?: boolean
  gradient: string
}

function SubscriptionContent() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlan | null>(null)

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const res = await api.get(`/users/${user?.id}`)
        const userData = res.data.data || res.data
        if (userData.subscription) {
          setCurrentSubscription(userData.subscription)
        }
      } catch (error) {
        console.log('No subscription found')
      }
    }
    if (user?.id) loadSubscription()
  }, [user?.id])

  const plans: Plan[] = [
    {
      id: SubscriptionPlan.BASIC,
      name: 'Basic',
      price: 50,
      icon: Zap,
      tagline: 'Get started with essential features',
      gradient: 'from-blue-500 to-cyan-500',
      badge: 'Verified',
      features: [
        '20 potential matches',
        'Unlimited messaging',
        'Verified badge on profile',
        'Basic profile customization',
        'Email support',
      ],
    },
    {
      id: SubscriptionPlan.PREMIUM,
      name: 'Premium',
      price: 100,
      icon: Crown,
      tagline: 'Most popular choice for serious seekers',
      gradient: 'from-purple-500 to-pink-500',
      badge: 'Premium',
      popular: true,
      features: [
        '50 potential matches',
        'Unlimited messaging',
        'Premium badge on profile',
        'Verified badge on profile',
        'Advanced profile customization',
        'Priority customer support',
        'See who\'s online',
      ],
    },
    {
      id: SubscriptionPlan.ELITE,
      name: 'Elite',
      price: 150,
      icon: Star,
      tagline: 'Maximum visibility and features',
      gradient: 'from-yellow-400 to-orange-500',
      badge: 'Elite',
      features: [
        '100 potential matches',
        'Unlimited messaging',
        'Elite badge on profile',
        'Premium badge on profile',
        'Verified badge on profile',
        'Featured in search results',
        'Dedicated account manager',
        'See who viewed your profile',
        'Priority in all features',
      ],
    },
  ]

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleSubscribe = async (plan: Plan) => {
    setIsLoading(true)
    setLoadingPlan(plan.id)
    try {
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        alert('Failed to load payment gateway. Please try again.')
        return
      }

      const { data: orderData } = await api.post('/payments/create-order', {
        plan: plan.id,
      })

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'RoomPartner',
        description: `${plan.name} Plan - 1 Month`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            await api.post('/payments/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })

            alert(`🎉 ${plan.name} plan activated successfully!`)
            router.push('/dashboard')
          } catch (error) {
            console.error('Payment verification failed:', error)
            alert('Payment verification failed. Please contact support.')
          }
        },
        prefill: {
          email: user?.email,
        },
        theme: {
          color: '#8b5cf6',
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false)
            setLoadingPlan(null)
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error: any) {
      console.error('Payment initiation failed:', error)
      alert(error.response?.data?.message || 'Failed to initiate payment. Please try again.')
      setIsLoading(false)
      setLoadingPlan(null)
    }
  }

  const currentPlan = currentSubscription?.plan
  const isActive = currentSubscription?.status === 'ACTIVE'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Find Your Perfect Roommate Faster
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock more matches and premium features to accelerate your roommate search
          </p>
        </div>

        {/* Current Subscription Alert */}
        {isActive && currentPlan && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-green-900 font-medium">
                  You're currently on the <span className="font-bold">{currentPlan}</span> plan
                </p>
                <p className="text-green-700 text-sm mt-1">
                  Active until {new Date(currentSubscription.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Free Plan Card */}
        <div className="max-w-6xl mx-auto mb-8">
          <Card variant="bordered" className="bg-white/80 backdrop-blur">
            <div className="grid md:grid-cols-4 gap-6 items-center">
              <div className="md:col-span-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Users className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Free Plan</h3>
                    <p className="text-sm text-gray-600">Currently active for all users</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>5 potential matches</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Unlimited messaging</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Basic profile</span>
                  </div>
                </div>
              </div>
              <div className="text-center md:text-right">
                <div className="text-3xl font-bold text-gray-900">₹0</div>
                <div className="text-sm text-gray-600">forever</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan) => {
            const Icon = plan.icon
            const isCurrentPlan = currentPlan === plan.id && isActive
            const isPlanLoading = loadingPlan === plan.id

            return (
              <Card
                key={plan.id}
                variant="elevated"
                className={`relative overflow-hidden transition-all hover:scale-105 ${plan.popular
                    ? 'ring-2 ring-purple-500 shadow-2xl shadow-purple-200'
                    : 'hover:shadow-xl'
                  }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-0 -right-0">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white px-4 py-1 text-xs font-bold transform rotate-45 translate-x-6 translate-y-3 shadow-lg">
                      POPULAR
                    </div>
                  </div>
                )}

                {/* Gradient Header */}
                <div className={`bg-gradient-to-br ${plan.gradient} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="w-10 h-10" />
                    {plan.badge && (
                      <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-white/90 text-sm">{plan.tagline}</p>
                </div>

                {/* Pricing */}
                <div className="px-6 py-4 bg-white">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-extrabold text-gray-900">₹{plan.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <p className="text-sm text-gray-500">Billed monthly</p>
                </div>

                {/* Features */}
                <div className="px-6 pb-6">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className={`p-0.5 rounded-full bg-gradient-to-br ${plan.gradient} mt-0.5`}>
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                        : ''
                      }`}
                    variant={plan.popular ? 'primary' : 'outline'}
                    disabled={isCurrentPlan || isPlanLoading || (isLoading && !isPlanLoading)}
                    onClick={() => handleSubscribe(plan)}
                    isLoading={isPlanLoading}
                  >
                    {isCurrentPlan ? (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Current Plan
                      </>
                    ) : isPlanLoading ? (
                      'Processing...'
                    ) : (
                      <>
                        <Crown className="w-4 h-4 mr-2" />
                        Subscribe Now
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Compare Plans
          </h2>
          <Card variant="elevated" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-900 to-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Feature</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white">Free</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white">Basic</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white">Premium</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white">Elite</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Potential Matches</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-gray-100 text-gray-900 font-bold text-sm">
                        5
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-100 text-blue-900 font-bold text-sm">
                        20
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-purple-100 text-purple-900 font-bold text-sm">
                        50
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-900 font-bold text-sm">
                        100
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Unlimited Messaging</td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-6 h-6 text-green-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-6 h-6 text-green-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-6 h-6 text-green-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-6 h-6 text-green-500 mx-auto" />
                    </td>
                  </tr>

                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Verified Badge</td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-6 h-6 text-green-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-6 h-6 text-green-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-6 h-6 text-green-500 mx-auto" />
                    </td>
                  </tr>

                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Premium Badge</td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-6 h-6 text-green-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-6 h-6 text-green-500 mx-auto" />
                    </td>
                  </tr>

                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Elite Badge</td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-6 h-6 text-green-500 mx-auto" />
                    </td>
                  </tr>

                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Featured in Search</td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-6 h-6 text-green-500 mx-auto" />
                    </td>
                  </tr>

                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Priority Support</td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-6 h-6 text-green-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-6 h-6 text-green-500 mx-auto" />
                    </td>
                  </tr>

                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">See Who Viewed Profile</td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-6 h-6 text-green-500 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <Card variant="bordered" className="bg-white/80 backdrop-blur">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary-600" />
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes! You can cancel your subscription anytime. You'll continue to have access to premium features until the end of your billing period.
              </p>
            </Card>

            <Card variant="bordered" className="bg-white/80 backdrop-blur">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary-600" />
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 text-sm">
                We accept all major credit/debit cards, UPI, net banking, and digital wallets through our secure payment partner Razorpay.
              </p>
            </Card>

            <Card variant="bordered" className="bg-white/80 backdrop-blur">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary-600" />
                Can I upgrade or downgrade?
              </h3>
              <p className="text-gray-600 text-sm">
                Absolutely! You can change your plan anytime. When upgrading, the change is immediate. When downgrading, the new plan starts at the end of your current billing cycle.
              </p>
            </Card>

            <Card variant="bordered" className="bg-white/80 backdrop-blur">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary-600" />
                What happens to my matches after subscription expires?
              </h3>
              <p className="text-gray-600 text-sm">
                Your existing conversations remain active. However, you'll be limited to 5 new matches per month on the free plan until you renew your subscription.
              </p>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            Need help choosing? We're here to assist you.
          </p>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function SubscriptionPage() {
  return (
    <ProtectedRoute>
      <SubscriptionContent />
    </ProtectedRoute>
  )
}