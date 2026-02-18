'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/userStore'
import { MatchFilters, Gender, OccupationType, FoodPreference } from '@/types'
import Navbar from '@/components/layout/Navbar'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Loading from '@/components/ui/Loading'
import { 
  MapPin, Briefcase, Home, MessageSquare, Filter, X,
  ZoomIn, Download, ChevronLeft, ChevronRight 
} from 'lucide-react'
import { formatCurrency, getInitials } from '@/lib/utils'
import Image from 'next/image'

function MatchesContent() {
  const router = useRouter()
  const { matches, loadMatches, isLoading } = useUserStore()
  const [showFilters, setShowFilters] = useState(false)
  const [localFilters, setLocalFilters] = useState<MatchFilters>({})
  const [hasActiveFilters, setHasActiveFilters] = useState(false)

  // ✅ LIGHTBOX STATE
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    console.log('📄 Loading all matches...')
    loadMatches({})
  }, [])

  useEffect(() => {
    const active = !!(
      localFilters.city ||
      localFilters.minBudget ||
      localFilters.maxBudget ||
      localFilters.gender ||
      localFilters.occupationType ||
      localFilters.foodPreference
    )
    setHasActiveFilters(active)
  }, [localFilters])

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setLocalFilters((prev) => ({
      ...prev,
      [name]: value === '' ? undefined : name.includes('Budget') ? Number(value) : value,
    }))
  }

  const applyFilters = () => {
    console.log('🔍 Applying filters:', localFilters)
    loadMatches(localFilters)
    setShowFilters(false)
  }

  const clearFilters = () => {
    console.log('🗑️ Clearing filters')
    setLocalFilters({})
    loadMatches({})
  }

  // ✅ LIGHTBOX FUNCTIONS
  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images)
    setCurrentImageIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % lightboxImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length)
  }

  const downloadImage = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `room-image-${index + 1}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Matches</h1>
            <p className="text-gray-600">
              {isLoading ? 'Loading...' : `${matches.length} potential roommate${matches.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
            <Button 
              variant={showFilters ? 'primary' : 'outline'} 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card variant="bordered" className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Matches</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <Input
                label="City"
                name="city"
                value={localFilters.city || ''}
                onChange={handleFilterChange}
                placeholder="e.g., Mumbai"
              />
              <Input
                label="Min Budget (₹)"
                name="minBudget"
                type="number"
                value={localFilters.minBudget || ''}
                onChange={handleFilterChange}
                placeholder="e.g., 5000"
              />
              <Input
                label="Max Budget (₹)"
                name="maxBudget"
                type="number"
                value={localFilters.maxBudget || ''}
                onChange={handleFilterChange}
                placeholder="e.g., 15000"
              />
              <Select
                label="Gender"
                name="gender"
                value={localFilters.gender || ''}
                onChange={handleFilterChange}
                options={[
                  { value: Gender.MALE, label: 'Male' },
                  { value: Gender.FEMALE, label: 'Female' },
                  { value: Gender.OTHER, label: 'Other' },
                ]}
              />
              <Select
                label="Occupation"
                name="occupationType"
                value={localFilters.occupationType || ''}
                onChange={handleFilterChange}
                options={[
                  { value: OccupationType.STUDENT, label: 'Student' },
                  { value: OccupationType.WORKING_PROFESSIONAL, label: 'Working Professional' },
                  { value: OccupationType.FREELANCER, label: 'Freelancer' },
                  { value: OccupationType.OTHER, label: 'Other' },
                ]}
              />
              <Select
                label="Food Preference"
                name="foodPreference"
                value={localFilters.foodPreference || ''}
                onChange={handleFilterChange}
                options={[
                  { value: FoodPreference.VEGETARIAN, label: 'Vegetarian' },
                  { value: FoodPreference.NON_VEGETARIAN, label: 'Non-Vegetarian' },
                  { value: FoodPreference.VEGAN, label: 'Vegan' },
                  { value: FoodPreference.JAIN, label: 'Jain' },
                ]}
              />
            </div>
            <div className="flex gap-4">
              <Button onClick={applyFilters} className="flex-1">
                Apply Filters
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          </Card>
        )}

        {/* Matches Grid */}
        {isLoading ? (
          <Loading className="py-20" text="Loading matches..." />
        ) : matches.length === 0 ? (
          <Card variant="bordered" className="text-center py-12">
            <p className="text-gray-600 mb-4">
              {hasActiveFilters 
                ? 'No matches found with current filters. Try adjusting your criteria.'
                : 'No roommates available yet. Check back later!'}
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters}>Clear Filters</Button>
            )}
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => {
              const profile = match.profile
              if (!profile) return null

              return (
                <Card key={match.id} variant="bordered" className="hover:shadow-lg transition-shadow">
                  {/* Profile Image */}
                  <div className="mb-4">
                    {profile.profileImage ? (
                      <Image
                        src={profile.profileImage}
                        alt={profile.fullName}
                        width={400}
                        height={300}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-primary-100 rounded-lg flex items-center justify-center">
                        <span className="text-4xl font-bold text-primary-600">
                          {getInitials(profile.fullName)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ✅ Room Images with Zoom/Download */}
                  {profile.roomImages && profile.roomImages.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Flat Images</p>
                      <div className="grid grid-cols-3 gap-2">
                        {profile.roomImages.slice(0, 3).map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <Image
                              src={imageUrl}
                              alt={`Room ${index + 1}`}
                              width={100}
                              height={75}
                              className="w-full h-24 object-cover rounded border border-gray-200"
                            />
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 rounded transition-all duration-200 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                              <button
                                onClick={() => openLightbox(profile.roomImages || [], index)}
                                className="p-1.5 bg-white rounded-full hover:bg-gray-100 transition-colors"
                                title="View full size"
                              >
                                <ZoomIn className="w-4 h-4 text-gray-700" />
                              </button>
                              <button
                                onClick={() => downloadImage(imageUrl, index)}
                                className="p-1.5 bg-white rounded-full hover:bg-gray-100 transition-colors"
                                title="Download"
                              >
                                <Download className="w-4 h-4 text-gray-700" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {profile.roomImages.length > 3 && (
                          <div 
                            className="w-full h-24 bg-gray-100 rounded border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                            onClick={() => openLightbox(profile.roomImages || [], 3)}
                          >
                            <span className="text-sm font-medium text-gray-600">
                              +{profile.roomImages.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Profile Info */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {profile.fullName}, {profile.age}
                  </h3>
                  {profile.bio && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{profile.bio}</p>
                  )}

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">
                        {profile.city}
                        {profile.locality && `, ${profile.locality}`}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Home className="w-4 h-4 mr-2 flex-shrink-0" />
                      Budget: {formatCurrency(profile.budget)}/month
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Briefcase className="w-4 h-4 mr-2 flex-shrink-0" />
                      {profile.occupationType.replace('_', ' ')}
                    </div>
                  </div>

                  {/* Lifestyle Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.foodPreference && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        {profile.foodPreference}
                      </span>
                    )}
                    {profile.drinking && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        Drinks
                      </span>
                    )}
                    {profile.smoking && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                        Smoker
                      </span>
                    )}
                    {profile.pets && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                        Pets
                      </span>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button
                    className="w-full"
                    onClick={() => router.push(`/chat?userId=${match.id}`)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* ✅ LIGHTBOX MODAL */}
      {lightboxOpen && lightboxImages.length > 0 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors z-10"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>

          {/* Download Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              downloadImage(lightboxImages[currentImageIndex], currentImageIndex)
            }}
            className="absolute top-4 right-20 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors z-10"
            title="Download"
          >
            <Download className="w-6 h-6 text-gray-700" />
          </button>

          {/* Previous Button */}
          {lightboxImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                prevImage()
              }}
              className="absolute left-4 p-3 bg-white rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-5xl max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightboxImages[currentImageIndex]}
              alt={`Room ${currentImageIndex + 1}`}
              width={1200}
              height={800}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm">
              {currentImageIndex + 1} / {lightboxImages.length}
            </div>
          </div>

          {/* Next Button */}
          {lightboxImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                nextImage()
              }}
              className="absolute right-4 p-3 bg-white rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function MatchesPage() {
  return (
    <ProtectedRoute>
      <MatchesContent />
    </ProtectedRoute>
  )
}