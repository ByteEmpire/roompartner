'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useUserStore } from '@/store/userStore'
import { useChatStore } from '@/store/chatStore'
import Navbar from '@/components/layout/Navbar'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { 
  Users, MessageSquare, Crown, CheckCircle2, AlertCircle, 
  Calendar, TrendingUp, MapPin, DollarSign, Star, ArrowRight 
} from 'lucide-react'
import api from '@/lib/api'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'

interface Activity {
  id: string
  type: 'match' | 'message' | 'profile_view'
  title: string
  description: string
  timestamp: string
  userId?: string
}

function DashboardContent() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { profile, loadProfile, isLoading: profileLoading } = useUserStore()
  const { conversations, loadConversations } = useChatStore()
  
  const [subscription, setSubscription] = useState<any>(null)
  const [matchesCount, setMatchesCount] = useState(0)
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [profileCompleteness, setProfileCompleteness] = useState(0)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [matchLimit, setMatchLimit] = useState(5)

  // ✅ PARALLEL LOADING - All API calls at once
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load everything in parallel using Promise.allSettled
        const [profileResult, matchesRes, conversationsResult, subRes] = await Promise.allSettled([
          loadProfile(),
          api.get('/matches'),
          loadConversations(),
          api.get('/users/' + user?.id)
        ])
        
        // Handle matches
        if (matchesRes.status === 'fulfilled') {
          const matchesData = matchesRes.value.data.data || matchesRes.value.data
          setMatchesCount(matchesData.length)
        }
        
        // Handle subscription
        if (subRes.status === 'fulfilled') {
          const userData = subRes.value.data.data || subRes.value.data
          if (userData.subscription) {
            setSubscription(userData.subscription)
            
            // Set match limits based on plan
            if (userData.subscription.plan === 'BASIC') setMatchLimit(20)
            else if (userData.subscription.plan === 'PREMIUM') setMatchLimit(50)
            else if (userData.subscription.plan === 'ELITE') setMatchLimit(100)
          }
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setIsLoadingData(false)
      }
    }

    if (user?.id) {
      loadData()
    }
  }, [user?.id, loadProfile, loadConversations])

  useEffect(() => {
    if (!profileLoading && !profile) {
      router.push('/profile/setup')
    }

    if (profile) {
      // Calculate profile completeness
      let score = 0
      if (profile.fullName) score += 10
      if (profile.bio) score += 15
      if (profile.profileImage) score += 20
      if (profile.phoneNumber) score += 10
      if (profile.city) score += 10
      if (profile.locality) score += 5
      if (profile.budget) score += 10
      if (profile.roomImages && profile.roomImages.length > 0) score += 20
      
      setProfileCompleteness(score)

      // Generate activity feed
      const activities: Activity[] = []
      
      if (matchesCount > 0) {
        activities.push({
          id: '1',
          type: 'match',
          title: `${matchesCount} potential matches found`,
          description: 'Based on your preferences and location',
          timestamp: new Date().toISOString(),
        })
      }

      if (conversations.size > 0) {
        activities.push({
          id: '2',
          type: 'message',
          title: `${conversations.size} active conversations`,
          description: 'Keep the momentum going!',
          timestamp: new Date().toISOString(),
        })
      }

      setRecentActivity(activities)
    }
  }, [profile, profileLoading, router, matchesCount, conversations.size])

  // ✅ SHOW SKELETON WHILE LOADING
  if (isLoadingData || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  const messagesCount = conversations.size
  const hasActiveSubscription = subscription && subscription.status === 'ACTIVE'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.fullName || user?.email}!
          </h1>
          <p className="text-gray-600 mt-2">Here's your roommate search overview</p>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card variant="bordered">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary-600" />
                      Matches
                    </span>
                    {!hasActiveSubscription && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {matchesCount}/{matchLimit} Free
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{matchesCount}</div>
                  <p className="text-sm text-gray-600 mb-4">Compatible roommates</p>
                  {!hasActiveSubscription && matchesCount >= matchLimit && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                      <p className="text-sm text-yellow-800">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        You've reached the free plan limit. Upgrade to see more!
                      </p>
                    </div>
                  )}
                  <Button onClick={() => router.push('/matches')} variant="outline" className="w-full">
                    Browse All
                  </Button>
                </CardContent>
              </Card>

              <Card variant="bordered">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="w-5 h-5 text-primary-600" />
                    Active Chats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{messagesCount}</div>
                  <p className="text-sm text-gray-600 mb-4">Ongoing conversations</p>
                  <Button onClick={() => router.push('/chat')} variant="outline" className="w-full">
                    View Messages
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Profile Completeness */}
            <Card variant="bordered">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-600" />
                  Profile Strength
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-gray-900">{profileCompleteness}%</span>
                  <span className="text-sm text-gray-600">
                    {profileCompleteness < 50 ? 'Weak' : profileCompleteness < 80 ? 'Good' : 'Excellent'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      profileCompleteness < 50 ? 'bg-red-500' : profileCompleteness < 80 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${profileCompleteness}%` }}
                  />
                </div>
                <div className="space-y-2 text-sm">
                  {!profile?.profileImage && (
                    <div className="flex items-start gap-2 text-gray-600">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Add a profile photo to increase trust (+20%)</span>
                    </div>
                  )}
                  {!profile?.bio && (
                    <div className="flex items-start gap-2 text-gray-600">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Write a bio to help others know you (+15%)</span>
                    </div>
                  )}
                  {(!profile?.roomImages || profile.roomImages.length === 0) && (
                    <div className="flex items-start gap-2 text-gray-600">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Upload room photos to attract more matches (+20%)</span>
                    </div>
                  )}
                </div>
                {profileCompleteness < 100 && (
                  <Button onClick={() => router.push('/profile/edit')} className="w-full mt-4">
                    Complete Profile
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No recent activity yet</p>
                    <p className="text-sm mt-1">Start browsing matches to see updates here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className={`p-2 rounded-lg ${
                          activity.type === 'match' ? 'bg-blue-100' : 
                          activity.type === 'message' ? 'bg-green-100' : 'bg-purple-100'
                        }`}>
                          {activity.type === 'match' && <Users className="w-5 h-5 text-blue-600" />}
                          {activity.type === 'message' && <MessageSquare className="w-5 h-5 text-green-600" />}
                          {activity.type === 'profile_view' && <Star className="w-5 h-5 text-purple-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(activity.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Subscription & Quick Info */}
          <div className="space-y-6">
            {/* Subscription Card */}
            <Card variant="bordered">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary-600" />
                  Your Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasActiveSubscription ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{subscription.plan}</div>
                        <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Active
                        </div>
                      </div>
                      {subscription.plan === 'ELITE' && (
                        <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-2 rounded-lg">
                          <Crown className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Valid until</span>
                        <span className="font-medium text-gray-900">
                          {new Date(subscription.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Days remaining</span>
                        <span className="font-medium text-gray-900">
                          {Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                        <span>Up to {matchLimit} matches</span>
                      </div>
                      {subscription.plan === 'PREMIUM' || subscription.plan === 'ELITE' ? (
                        <>
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                            <span>Priority in search results</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                            <span>Verified badge</span>
                          </div>
                        </>
                      ) : null}
                      {subscription.plan === 'ELITE' && (
                        <>
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                            <span>Featured profile</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                            <span>Room verification</span>
                          </div>
                        </>
                      )}
                    </div>
                    {subscription.plan !== 'ELITE' && (
                      <Button onClick={() => router.push('/subscription')} className="w-full">
                        Upgrade Plan
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-900 mb-2">Free</div>
                    <p className="text-sm text-gray-600 mb-4">Limited features</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-800">
                        Upgrade to unlock unlimited matches and premium features!
                      </p>
                    </div>
                    <Button onClick={() => router.push('/subscription')} className="w-full">
                      <Crown className="w-4 h-4 mr-2" />
                      View Plans
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Profile Quick View */}
            {profile && (
              <Card variant="bordered">
                <CardHeader>
                  <CardTitle>Your Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{profile.city}{profile.locality && `, ${profile.locality}`}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{formatCurrency(profile.budget)}/month</span>
                    </div>
                    {profile.moveInDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">
                          Move-in: {new Date(profile.moveInDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button 
                    onClick={() => router.push('/profile')} 
                    variant="outline" 
                    className="w-full mt-4"
                  >
                    View Full Profile
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}