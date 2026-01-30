import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import BrandingWizard from '../../components/onboarding/BrandingWizard'
import BusinessIdentityStep from '../../components/onboarding/steps/BusinessIdentityStep'
import LogoUploadStep from '../../components/onboarding/steps/LogoUploadStep'
import BrandColorsStep from '../../components/onboarding/steps/BrandColorsStep'
import FontSelectionStep from '../../components/onboarding/steps/FontSelectionStep'
import HeaderFooterStep from '../../components/onboarding/steps/HeaderFooterStep'
import PreviewStep from '../../components/onboarding/steps/PreviewStep'
import { saveBrandingSettings } from '../../services/brandingService'

/**
 * Onboarding Page
 * Business and branding setup for dietitians
 * 6-step wizard to configure branding defaults
 */
const OnboardingPage = () => {
  const navigate = useNavigate()
  const { user, completeOnboarding } = useAuth()

  const wizardSteps = [
    {
      title: 'Business Identity',
      description: 'Tell us about your practice',
      component: BusinessIdentityStep,
      validate: (data) => data.businessName.trim().length > 0
    },
    {
      title: 'Upload Logo',
      description: 'Add your logo (optional but recommended)',
      component: LogoUploadStep,
      validate: () => true // Logo is optional
    },
    {
      title: 'Brand Colors',
      description: 'Choose colors that represent your brand',
      component: BrandColorsStep,
      validate: (data) => data.primaryColor && data.secondaryColor
    },
    {
      title: 'Font Selection',
      description: 'Select a professional font for your meal plans',
      component: FontSelectionStep,
      validate: (data) => data.fontFamily
    },
    {
      title: 'Header & Footer',
      description: 'Configure what appears on your meal plans',
      component: HeaderFooterStep,
      validate: () => true
    },
    {
      title: 'Preview',
      description: 'See how your meal plans will look',
      component: PreviewStep,
      validate: () => true
    }
  ]

  const handleComplete = async (formData) => {
    console.log('handleComplete called with:', formData)
    try {
      // Remove logoFile from data before saving (it's just for UI preview)
      const { logoFile, ...brandingData } = formData
      
      console.log('Saving branding settings...')
      // Save branding settings to Firestore
      await saveBrandingSettings(user.uid, brandingData)
      console.log('Branding settings saved successfully')
      
      console.log('Marking onboarding complete...')
      // Mark onboarding as complete
      const result = await completeOnboarding()
      console.log('completeOnboarding result:', result)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to complete onboarding')
      }
      
      console.log('Navigating to dashboard...')
      // Navigate to dashboard
      navigate('/dashboard')
    } catch (error) {
      console.error('Error completing onboarding:', error)
      alert('Failed to save branding settings. Please try again: ' + error.message)
    }
  }

  return <BrandingWizard steps={wizardSteps} onComplete={handleComplete} />
}

export default OnboardingPage
