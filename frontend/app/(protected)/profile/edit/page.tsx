'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/userStore'
import { ProfileFormData, Gender, GenderPreference, OccupationType, FoodPreference } from '@/types'
import Navbar from '@/components/layout/Navbar'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Loading from '@/components/ui/Loading'
import { ArrowLeft, Upload, CheckCircle, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

function EditProfileContent() {
  const router = useRouter()
  const { profile, updateProfile, uploadProfileImage, loadProfile, isLoading } = useUserStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    age: 18,
    gender: Gender.MALE,
    phoneNumber: '',
    bio: '',
    profileImage: '',
    city: '',
    locality: '',
    budget: 5000,
    moveInDate: '',
    preferredGender: GenderPreference.ANY,
    occupationType: OccupationType.WORKING_PROFESSIONAL,
    foodPreference: FoodPreference.VEGETARIAN,
    drinking: false,
    smoking: false,
    pets: false,
    roomImages: [],
  })

  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  useEffect(() => {
    if (profile) {
      console.log('📥 Profile loaded from backend:', {
        profileImage: profile.profileImage,
        fullName: profile.fullName
      })
      
      setFormData({
        fullName: profile.fullName,
        age: profile.age,
        gender: profile.gender,
        phoneNumber: profile.phoneNumber || '',
        bio: profile.bio || '',
        profileImage: profile.profileImage || '',
        city: profile.city,
        locality: profile.locality || '',
        budget: profile.budget,
        moveInDate: profile.moveInDate || '',
        preferredGender: profile.preferredGender,
        occupationType: profile.occupationType,
        foodPreference: profile.foodPreference || FoodPreference.VEGETARIAN,
        drinking: profile.drinking,
        smoking: profile.smoking,
        pets: profile.pets,
        roomImages: profile.roomImages || [],
      })
    }
  }, [profile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? Number(value) : value,
    }))
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log('📤 File selected:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file (JPG, PNG, GIF)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB')
      return
    }

    setIsUploading(true)
    setUploadError(null)
    
    try {
      console.log('☁️  Starting Cloudinary upload...')
      const imageUrl = await uploadProfileImage(file)
      
      console.log('✅ Cloudinary upload successful:', imageUrl)
      
      setFormData(prev => ({
        ...prev,
        profileImage: imageUrl
      }))
      
    } catch (error: any) {
      console.error('❌ Upload failed:', error)
      setUploadError(error.message || 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setSaveError(null)
    
    const cleanedData: any = { ...formData }
    
    if (!cleanedData.phoneNumber) delete cleanedData.phoneNumber
    if (!cleanedData.bio) delete cleanedData.bio
    if (!cleanedData.locality) delete cleanedData.locality
    if (!cleanedData.moveInDate) delete cleanedData.moveInDate
    if (!cleanedData.foodPreference) delete cleanedData.foodPreference
    if (!cleanedData.profileImage) delete cleanedData.profileImage
    if (!cleanedData.roomImages || cleanedData.roomImages.length === 0) delete cleanedData.roomImages
    
    console.log('💾 Saving profile with data:', cleanedData)
    
    try {
      await updateProfile(cleanedData)
      console.log('✅ Profile saved successfully')
      
      // Reload profile to confirm save
      await loadProfile()
      
      router.push('/profile')
    } catch (error: any) {
      console.error('❌ Save failed:', error)
      setSaveError(error.response?.data?.message || error.message || 'Failed to save')
    }
  }

  if (isLoading && !profile) {
    return <Loading className="py-20" text="Loading profile..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/profile">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
        </div>

        <Card variant="elevated">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>

          {saveError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{saveError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image Upload */}
            <div>
              {/* <label className="block text-sm font-medium text-gray-700 mb-3">
                Profile Image
              </label> */}
              
              {uploadError && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                  {uploadError}
                </div>
              )}
              
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {formData.profileImage ? (
                    <>
                      <Image
                        src={formData.profileImage}
                        alt="Profile"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('❌ Image failed to load:', formData.profileImage)
                        }}
                      />
                      {!isUploading && (
                        <div className="absolute top-0 right-0 bg-green-500 rounded-full p-1">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary-600">
                        {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                  )}
                  
                  {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>

                {/* Room Images Upload */}
                <div>
                  {/* <label className="block text-sm font-medium text-gray-700 mb-3">
                    Flat Images
                  </label> */}
                  <div className="space-y-3">
                    {/* Existing Room Images */}
                    {formData.roomImages && formData.roomImages.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {formData.roomImages.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <Image
                              src={imageUrl}
                              alt={`Room ${index + 1}`}
                              width={200}
                              height={150}
                              className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = formData.roomImages?.filter((_, i) => i !== index)
                                setFormData(prev => ({ ...prev, roomImages: newImages }))
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload New Room Image */}
                    {(!formData.roomImages || formData.roomImages.length < 5) && (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return

                            if (!file.type.startsWith('image/')) {
                              alert('Please select an image file')
                              return
                            }

                            if (file.size > 5 * 1024 * 1024) {
                              alert('Image size must be less than 5MB')
                              return
                            }

                            setIsUploading(true)
                            try {
                              const imageUrl = await uploadProfileImage(file)
                              setFormData(prev => ({
                                ...prev,
                                roomImages: [...(prev.roomImages || []), imageUrl]
                              }))
                            } catch (error) {
                              console.error('Upload error:', error)
                              alert('Failed to upload image')
                            } finally {
                              setIsUploading(false)
                            }
                          }}
                          className="hidden"
                          id="room-image-upload"
                          disabled={isUploading}
                        />
                        <label
                          htmlFor="room-image-upload"
                          className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                          <Upload className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {isUploading ? 'Uploading...' : 'Add Flat Images'}
                          </span>
                        </label>
                        <p className="text-xs text-gray-500 mt-2">
                          Upload up to 5 images of your flat. JPG, PNG. Max 5MB each.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Choose Profile'}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    JPG, PNG or GIF. Max 5MB
                  </p>
                </div>
              </div>
            </div>

            <Input
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Age"
                name="age"
                type="number"
                min="18"
                max="100"
                value={formData.age}
                onChange={handleChange}
                required
              />
              <Select
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                options={[
                  { value: Gender.MALE, label: 'Male' },
                  { value: Gender.FEMALE, label: 'Female' },
                  { value: Gender.OTHER, label: 'Other' },
                ]}
                required
              />
            </div>

            <Input
              label="Phone Number"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+91 9876543210"
            />

            <Textarea
              label="Bio"
              name="bio"
              rows={4}
              placeholder="Tell potential roommates about yourself..."
              value={formData.bio}
              onChange={handleChange}
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
              <Input
                label="Locality"
                name="locality"
                value={formData.locality}
                onChange={handleChange}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Monthly Budget (₹)"
                name="budget"
                type="number"
                min="1000"
                step="500"
                value={formData.budget}
                onChange={handleChange}
                required
              />
              <Input
                label="Move-in Date"
                name="moveInDate"
                type="date"
                value={formData.moveInDate}
                onChange={handleChange}
              />
            </div>

            <Select
              label="Preferred Roommate Gender"
              name="preferredGender"
              value={formData.preferredGender}
              onChange={handleChange}
              options={[
                { value: GenderPreference.MALE, label: 'Male' },
                { value: GenderPreference.FEMALE, label: 'Female' },
                { value: GenderPreference.ANY, label: 'Any' },
              ]}
              required
            />

            <Select
              label="Occupation"
              name="occupationType"
              value={formData.occupationType}
              onChange={handleChange}
              options={[
                { value: OccupationType.STUDENT, label: 'Student' },
                { value: OccupationType.WORKING_PROFESSIONAL, label: 'Working Professional' },
                { value: OccupationType.FREELANCER, label: 'Freelancer' },
                { value: OccupationType.OTHER, label: 'Other' },
              ]}
              required
            />

            <Select
              label="Food Preference"
              name="foodPreference"
              value={formData.foodPreference || ''}
              onChange={handleChange}
              options={[
                { value: FoodPreference.VEGETARIAN, label: 'Vegetarian' },
                { value: FoodPreference.NON_VEGETARIAN, label: 'Non-Vegetarian' },
                { value: FoodPreference.VEGAN, label: 'Vegan' },
                { value: FoodPreference.JAIN, label: 'Jain' },
              ]}
            />

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="drinking"
                  checked={formData.drinking}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary-600 rounded"
                />
                <span className="text-gray-700">I drink occasionally</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="smoking"
                  checked={formData.smoking}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary-600 rounded"
                />
                <span className="text-gray-700">I smoke</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="pets"
                  checked={formData.pets}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary-600 rounded"
                />
                <span className="text-gray-700">I have pets</span>
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => router.push('/profile')} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading} className="flex-1">
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default function EditProfilePage() {
  return (
    <ProtectedRoute>
      <EditProfileContent />
    </ProtectedRoute>
  )
}